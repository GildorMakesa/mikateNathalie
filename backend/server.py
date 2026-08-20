from fastapi import FastAPI, APIRouter, HTTPException, Header, Depends
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
import asyncio
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict, EmailStr
from typing import List, Optional
import uuid
from datetime import datetime, timezone
import resend
import traceback
from emergentintegrations.llm.chat import LlmChat, UserMessage


ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Resend
RESEND_API_KEY = os.environ.get('RESEND_API_KEY', '').strip()
SENDER_EMAIL = os.environ.get('SENDER_EMAIL', 'onboarding@resend.dev').strip()
SENDER_NAME = os.environ.get('SENDER_NAME', 'Délices Mikaté Royal').strip()
RECIPIENT_EMAIL = os.environ.get('RECIPIENT_EMAIL', 'mikateroyal@gmail.com').strip()
ADMIN_PASSWORD = os.environ.get('ADMIN_PASSWORD', 'mikate2025')
EMERGENT_LLM_KEY = os.environ.get('EMERGENT_LLM_KEY', '').strip()
if RESEND_API_KEY:
    resend.api_key = RESEND_API_KEY
logger.info(
    f"Resend config: key_set={bool(RESEND_API_KEY)} sender={SENDER_EMAIL!r} recipient={RECIPIENT_EMAIL!r}"
)


def require_admin(x_admin_password: Optional[str] = Header(None)):
    if not x_admin_password or x_admin_password != ADMIN_PASSWORD:
        raise HTTPException(status_code=401, detail="Mot de passe administrateur invalide")
    return True

app = FastAPI(title="Délices Mikaté Royal API")
api_router = APIRouter(prefix="/api")


# ===== Models =====
class OrderItemInput(BaseModel):
    product_id: str
    product_name: str
    quantity: int
    option_label: Optional[str] = None
    unit_price_cad: Optional[float] = None


class EventInfo(BaseModel):
    event_type: Optional[str] = None
    attendees: Optional[int] = None
    event_date: Optional[str] = None  # ISO date string
    comments: Optional[str] = None


class OrderCreate(BaseModel):
    customer_name: str = Field(..., min_length=1, max_length=120)
    phone: str = Field(..., min_length=4, max_length=40)
    email: Optional[EmailStr] = None
    address: str = Field(..., min_length=1, max_length=400)
    items: List[OrderItemInput] = Field(..., min_length=1)
    payment_method: Optional[str] = Field(None, max_length=40)
    message: Optional[str] = Field(None, max_length=1000)
    order_type: str = Field("regular", pattern="^(regular|event)$")
    preferred_delivery_date: Optional[str] = Field(None, max_length=40)
    event_info: Optional[EventInfo] = None


class Order(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    customer_name: str
    phone: str
    email: Optional[str] = None
    address: str
    items: List[OrderItemInput]
    payment_method: Optional[str] = None
    message: Optional[str] = None
    order_type: str = "regular"
    preferred_delivery_date: Optional[str] = None
    event_info: Optional[EventInfo] = None
    status: str = "new"
    email_sent: bool = False
    email_error: Optional[str] = None
    client_email_sent: bool = False
    client_email_error: Optional[str] = None
    submission_email_sent: bool = False
    submission_email_error: Optional[str] = None
    read: bool = False
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))


VALID_STATUSES = ("new", "submission_sent", "payment_received", "preparing", "delivered", "cancelled")


class OrderStatusUpdate(BaseModel):
    status: str = Field(..., pattern="^(new|submission_sent|payment_received|preparing|delivered|cancelled)$")


class Settings(BaseModel):
    interac_email: str = "contact@mikateroyal.com"
    interac_question: str = "soumission"
    interac_answer: str = "grace7"
    interac_auto_deposit: bool = False
    interac_note: str = (
        "Veuillez indiquer votre nom dans le message du virement afin que nous puissions "
        "associer votre paiement à votre commande."
    )


class SettingsUpdate(BaseModel):
    interac_email: Optional[str] = None
    interac_question: Optional[str] = None
    interac_answer: Optional[str] = None
    interac_auto_deposit: Optional[bool] = None
    interac_note: Optional[str] = None


class ChatHistoryItem(BaseModel):
    role: str  # "user" | "assistant"
    content: str


class ChatRequest(BaseModel):
    session_id: str = Field(..., min_length=1, max_length=120)
    message: str = Field(..., min_length=1, max_length=2000)
    history: List[ChatHistoryItem] = Field(default_factory=list)


NANCY_SYSTEM_PROMPT = """Tu es Nancy, l'assistante virtuelle chaleureuse et professionnelle de Délices Mikaté Royal, une pâtisserie/boissons artisanale ouest-africaine basée au Québec.

Tu réponds TOUJOURS en français, vouvoiement, ton amical et accueillant.

CATALOGUE & PRIX (commandes régulières) :

🍩 MIKATÉS (mêmes prix pour toutes les saveurs : Sucré, Salé, Sucre Impalpable, Chocolat, Cannelle, Pâte d'Arachides) :
- 5 mikatés : 7 $
- 10 mikatés : 12 $
- 20 mikatés : 22 $

🥤 BOISSONS (300 ml) :
- Jus de Bissap : 5 $
- Jus de Gingembre : 5 $

👑 COMBO VEDETTE :
- Combo Découverte (5 mikatés + 1 bissap 300 ml) : 10 $
- Combo Gingembre (5 mikatés + 1 jus de gingembre 300 ml) : 10 $

🎉 ÉVÉNEMENTS (mariages, baptêmes, anniversaires, réunions familiales, événements d'église, événements corporatifs) → soumission personnalisée via la section « Événements et réceptions ».

LIVRAISON — deux options :
1. **Livraison locale régulière** : Sorel-Tracy et secteurs proches, rayon habituel de 5 km, commande minimum de 30 $. Modalités et frais confirmés avec le client avant la préparation.
2. **Grandes commandes et événements** : livraison également possible en Rive-Sud, Rive-Nord, Montréal et autres régions sur demande — pour commandes importantes, événements, entreprises, groupes ou occasions spéciales. Les frais sont calculés selon la distance, le volume de la commande et les besoins spécifiques ; une soumission personnalisée est transmise avant confirmation.

Aucune adresse personnelle ou point de retrait public n'est communiqué sur le site — les détails sont partagés directement avec le client.

PROCESSUS DE COMMANDE :
1. Le client choisit ses produits avec les prix affichés sur le site.
2. Il remplit le formulaire « Commander maintenant ».
3. Confirmation automatique envoyée par courriel.
4. Nous transmettons ensuite le montant total avec les frais de livraison + instructions Interac.
5. Paiement par virement Interac à contact@mikateroyal.com.
6. Dès paiement reçu, commande confirmée et préparée.

CONTACT : contact@mikateroyal.com — site : mikateroyal.com

CONSIGNES :
- Donne les prix directement quand on te demande (ils sont publics maintenant).
- Ne partage JAMAIS d'adresse personnelle, d'adresse de production ni de point de retrait public.
- Pour un événement / grand groupe → guide vers « Événements et réceptions » sur le site.
- Pour question médicale sur le bissap/gingembre, rappelle de consulter un professionnel de santé.
- Tu ne prends PAS les commandes toi-même — tu invites à utiliser le formulaire sur le site.
- Réponds court et chaleureux (2 à 5 phrases maximum sauf si on te demande des détails).
- Utilise occasionnellement des émojis culinaires discrets (✨ 🌺 🥤) sans abuser.
- Reste poliment dans ton rôle sur les questions hors-sujet.
"""


class TestimonialOut(BaseModel):
    id: str
    name: str
    role: str
    quote: str
    avatar_url: str = ""
    rating: int = 5


class TestimonialCreate(BaseModel):
    name: str = Field(..., min_length=1, max_length=80)
    role: Optional[str] = Field(None, max_length=80)
    quote: str = Field(..., min_length=5, max_length=400)
    rating: int = Field(5, ge=1, le=5)


class PriceOption(BaseModel):
    label: str
    price_cad: float


class ProductOut(BaseModel):
    id: str
    name: str
    category: str  # "Beignets" | "Boissons" | "Combos"
    description: str
    image_url: str
    options: List[PriceOption]
    unit_note: Optional[str] = None
    badge: Optional[str] = None


# ===== Static catalog =====
MIKATE_OPTIONS = [
    PriceOption(label="5 mikatés", price_cad=7.0),
    PriceOption(label="10 mikatés", price_cad=12.0),
    PriceOption(label="20 mikatés", price_cad=22.0),
]

PRODUCTS: List[ProductOut] = [
    ProductOut(
        id="mikate-sucre",
        name="Mikaté Sucré",
        category="Beignets",
        description="Petits beignets africains moelleux et dorés, parfumés à la vanille. La douceur d'enfance, façon Afrique de l'Ouest.",
        image_url="/products/mikate-sucre-presente.png",
        options=list(MIKATE_OPTIONS),
    ),
    ProductOut(
        id="mikate-sale",
        name="Mikaté Salé",
        category="Beignets",
        description="Version salée du puff-puff : croustillant dehors, fondant dedans. Servi en entrée avec sauce piquante. Parfait à l'apéritif.",
        image_url="/products/mikate-sale-presente.png",
        options=list(MIKATE_OPTIONS),
    ),
    ProductOut(
        id="mikate-sucre-impalpable",
        name="Mikaté Sucre Impalpable",
        category="Beignets",
        description="Authentiques puff-puff africains, généreusement saupoudrés de sucre impalpable. Fondants, nuageux, irrésistibles.",
        image_url="/products/mikate-sucre-impalpable.png",
        options=list(MIKATE_OPTIONS),
    ),
    ProductOut(
        id="mikate-chocolat",
        name="Mikaté Chocolat",
        category="Beignets",
        description="Vrais beignets africains (puff-puff) nappés d'un filet de chocolat noir fondu. Le mariage parfait du croquant doré et du chocolat onctueux.",
        image_url="/products/mikate-chocolat.png",
        options=list(MIKATE_OPTIONS),
    ),
    ProductOut(
        id="mikate-cannelle",
        name="Mikaté Cannelle",
        category="Beignets",
        description="Puff-puff dorés enrobés d'un mélange sucre-cannelle. Chaleureux, épicé, parfumé — l'allié parfait d'un café ou d'un thé.",
        image_url="/products/mikate-cannelle.png",
        options=list(MIKATE_OPTIONS),
    ),
    ProductOut(
        id="mikate-arachide",
        name="Mikaté Pâte d'Arachides",
        category="Beignets",
        description="Puff-puff dorés servis avec une pâte d'arachides maison crémeuse — la combinaison ouest-africaine par excellence, douce et réconfortante.",
        image_url="/products/mikate-arachide-presente.png",
        options=list(MIKATE_OPTIONS),
    ),
    ProductOut(
        id="bissap-royal",
        name="Jus de Bissap",
        category="Boissons",
        description="Infusion artisanale d'hibiscus rouge rubis, gingembre frais et menthe. Boisson rafraîchissante et naturelle, sans alcool, offerte en format 300 ml.",
        image_url="/products/jus-bissap-luxe.jpg",
        unit_note="300 ml",
        options=[PriceOption(label="300 ml", price_cad=5.0)],
    ),
    ProductOut(
        id="jus-tropical",
        name="Jus Tropical",
        category="Boissons",
        description="Cocktail artisanal mangue, ananas et fruit de la passion. Un concentré de fruits ensoleillés, offert en format 300 ml.",
        image_url="/products/jus-tropical-luxe.png",
        unit_note="300 ml",
        options=[PriceOption(label="300 ml", price_cad=5.0)],
    ),
    ProductOut(
        id="jus-gingembre",
        name="Jus de Gingembre",
        category="Boissons",
        description="Notre signature : gingembre frais pressé, citron vert et une pointe de miel. Boisson artisanale vivifiante, offerte en format 300 ml.",
        image_url="/products/jus-gingembre-luxe.jpg",
        unit_note="300 ml",
        options=[PriceOption(label="300 ml", price_cad=5.0)],
    ),
    ProductOut(
        id="combo-decouverte",
        name="Combo Découverte",
        category="Combos",
        description="5 Mikatés au choix + 1 Jus de Bissap 300 ml. Le combo parfait pour découvrir notre signature.",
        image_url="/products/mikate-sucre-impalpable.png",
        options=[PriceOption(label="5 Mikatés + 1 Jus de Bissap 300 ml", price_cad=10.0)],
        badge="👑 Vedette",
    ),
    ProductOut(
        id="combo-gingembre",
        name="Combo Gingembre",
        category="Combos",
        description="5 Mikatés au choix + 1 Jus de Gingembre 300 ml. Énergie, fraîcheur et gourmandise dans un seul combo.",
        image_url="/products/jus-gingembre-luxe.jpg",
        options=[PriceOption(label="5 Mikatés + 1 Jus de Gingembre 300 ml", price_cad=10.0)],
        badge="👑 Vedette",
    ),
]

TESTIMONIALS: List[TestimonialOut] = [
    TestimonialOut(
        id="t1",
        name="Aminata D.",
        role="Cliente fidèle",
        quote="Moelleux, savoureux et toujours frais. Toute la famille a adoré !",
        avatar_url="https://images.unsplash.com/photo-1562337404-3044c84ac061?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NDQ2NDN8MHwxfHNlYXJjaHwxfHxwb3J0cmFpdCUyMGhhcHB5JTIwcGVyc29ufGVufDB8fHx8MTc4MTU3Mzc3NXww&ixlib=rb-4.1.0&q=85",
    ),
    TestimonialOut(
        id="t2",
        name="Koffi A.",
        role="Organisateur d'événements",
        quote="Une présentation impeccable et un service professionnel du début à la fin.",
        avatar_url="https://images.unsplash.com/photo-1583264277168-58ceba4b84e7?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NDQ2NDN8MHwxfHNlYXJjaHwzfHxwb3J0cmFpdCUyMGhhcHB5JTIwcGVyc29ufGVufDB8fHx8MTc4MTU3Mzc3NXww&ixlib=rb-4.1.0&q=85",
    ),
    TestimonialOut(
        id="t3",
        name="Sarah M.",
        role="Découverte culinaire",
        quote="Une belle découverte. Les saveurs sont authentiques et les produits de grande qualité.",
        avatar_url="https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NDQ2NDN8MHwxfHNlYXJjaHwyfHxwb3J0cmFpdCUyMGhhcHB5JTIwcGVyc29ufGVufDB8fHx8MTc4MTU3Mzc3NXww&ixlib=rb-4.1.0&q=85",
    ),
    TestimonialOut(
        id="t4",
        name="Marie-Claude L.",
        role="Mariée comblée",
        quote="Nous avons commandé pour notre mariage de 150 personnes. Les invités en parlent encore ! Un service à la hauteur des plus belles tables.",
        avatar_url="https://images.unsplash.com/photo-1544005313-94ddf0286df2?crop=entropy&cs=srgb&fm=jpg&q=85&w=400",
    ),
    TestimonialOut(
        id="t5",
        name="Jean-Pierre B.",
        role="Client régulier",
        quote="Le combo Découverte est devenu mon rituel du vendredi. Le bissap est parfaitement équilibré, ni trop sucré ni trop acidulé.",
        avatar_url="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?crop=entropy&cs=srgb&fm=jpg&q=85&w=400",
    ),
    TestimonialOut(
        id="t6",
        name="Fatou N.",
        role="Communauté d'église",
        quote="Commande de 200 mikatés pour notre événement communautaire — livrés à l'heure, encore tièdes, qualité irréprochable. Merci !",
        avatar_url="https://images.unsplash.com/photo-1531123897727-8f129e1688ce?crop=entropy&cs=srgb&fm=jpg&q=85&w=400",
    ),
    TestimonialOut(
        id="t7",
        name="Alexandre T.",
        role="Anniversaire surprise",
        quote="Le jus de gingembre est juste WOW. Présentation digne d'un grand restaurant. Mes invités ont adoré la touche authentique.",
        avatar_url="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?crop=entropy&cs=srgb&fm=jpg&q=85&w=400",
    ),
    TestimonialOut(
        id="t8",
        name="Rachelle K.",
        role="Maman de 3 enfants",
        quote="Les mikatés à la cannelle sont divins, les enfants en redemandent toutes les semaines. Portions très généreuses pour le prix.",
        avatar_url="https://images.unsplash.com/photo-1438761681033-6461ffad8d80?crop=entropy&cs=srgb&fm=jpg&q=85&w=400",
    ),
]


# ===== Routes =====
@api_router.get("/")
async def root():
    return {"message": "Délices Mikaté Royal API"}


@api_router.get("/products", response_model=List[ProductOut])
async def list_products():
    return PRODUCTS


@api_router.get("/testimonials", response_model=List[TestimonialOut])
async def list_testimonials():
    user_docs = await db.testimonials.find({}, {"_id": 0}).sort("created_at", -1).to_list(20)
    user_items = []
    for d in user_docs:
        d.pop("created_at", None)
        try:
            user_items.append(TestimonialOut(**d))
        except Exception:
            continue
    return TESTIMONIALS + user_items


@api_router.post("/testimonials", response_model=TestimonialOut)
async def create_testimonial(payload: TestimonialCreate):
    item = TestimonialOut(
        id=str(uuid.uuid4()),
        name=payload.name,
        role=payload.role or "Client",
        quote=payload.quote,
        rating=payload.rating,
        avatar_url="",
    )
    doc = item.model_dump()
    doc["created_at"] = datetime.now(timezone.utc).isoformat()
    await db.testimonials.insert_one(doc)
    return item


def _build_client_confirmation_html(order: Order) -> str:
    return f"""
    <div style="font-family:Georgia,serif;background:#FAF8F5;padding:32px;color:#1D1914;">
      <div style="max-width:600px;margin:0 auto;background:#FFFFFF;border:1px solid #E8E2D9;border-radius:16px;padding:32px;">
        <h1 style="color:#9A1F38;font-size:26px;margin:0 0 16px 0;">Nous avons bien reçu votre demande</h1>
        <p style="margin:0 0 12px 0;">Bonjour {order.customer_name},</p>
        <p style="margin:0 0 12px 0;">Merci d'avoir choisi <strong>Délices Mikaté Royal</strong> !</p>
        <p style="margin:0 0 12px 0;">
          Nous avons bien reçu votre demande de soumission et nous vous contacterons dans les plus
          brefs délais avec les détails de votre commande, les frais de livraison s'il y a lieu,
          ainsi que le montant total.
        </p>
        <p style="margin:0 0 12px 0;">
          Nous sommes heureux de vous servir et de partager avec vous nos délicieux mikatés
          préparés avec soin.
        </p>
        <p style="margin:24px 0 6px 0;">À très bientôt,</p>
        <p style="margin:0;font-family:Georgia,serif;color:#9A1F38;font-size:18px;"><strong>Délices Mikaté Royal</strong></p>
        <p style="margin:6px 0;color:#665D50;font-size:13px;">📧 contact@mikateroyal.com</p>
        <p style="margin:6px 0;color:#665D50;font-size:13px;">🌐 <a href="https://mikateroyal.com" style="color:#9A1F38;text-decoration:none;">mikateroyal.com</a></p>
      </div>
    </div>
    """


async def _send_email(*, to: List[str], subject: str, html: str, reply_to: Optional[str] = None) -> tuple[bool, Optional[str]]:
    """Returns (success, error_message)."""
    if not RESEND_API_KEY:
        return False, "RESEND_API_KEY non configurée"
    try:
        from_field = f"{SENDER_NAME} <{SENDER_EMAIL}>" if SENDER_NAME else SENDER_EMAIL
        params = {"from": from_field, "to": to, "subject": subject, "html": html}
        if reply_to:
            params["reply_to"] = reply_to
        resend.api_key = RESEND_API_KEY
        result = await asyncio.to_thread(resend.Emails.send, params)
        if isinstance(result, dict) and result.get("id"):
            return True, None
        return False, f"Réponse Resend inattendue : {result!r}"
    except Exception as e:
        tb = traceback.format_exc()
        logger.error(f"Resend send failed: {e}\n{tb}")
        return False, f"{type(e).__name__}: {e}"


async def _get_settings() -> Settings:
    doc = await db.settings.find_one({"_id": "interac"}, {"_id": 0})
    if not doc:
        s = Settings()
        await db.settings.insert_one({"_id": "interac", **s.model_dump()})
        return s
    return Settings(**doc)


def _build_payment_block(settings: Settings) -> str:
    if settings.interac_auto_deposit:
        return (
            f"Paiement par virement Interac\n"
            f"Adresse de paiement : {settings.interac_email}\n"
            f"Dépôt automatique Interac activé – aucun mot de passe requis."
        )
    return (
        f"Paiement par virement Interac\n"
        f"Adresse de paiement : {settings.interac_email}\n"
        f"Question de sécurité : {settings.interac_question}\n"
        f"Réponse : {settings.interac_answer}"
    )


def _build_submission_text(doc: dict, settings: Settings) -> tuple[str, str]:
    def _fmt_item(it):
        opt = f" ({it.get('option_label')})" if it.get('option_label') else ""
        price = it.get('unit_price_cad')
        sub = ""
        if price is not None:
            total = float(price) * int(it.get('quantity', 1))
            sub = f" — {total:.2f} $"
        return f"- {it['product_name']}{opt} × {it['quantity']}{sub}"

    items_lines = "\n".join(_fmt_item(it) for it in doc.get("items", []))
    subtotal = sum(
        float(it.get('unit_price_cad') or 0) * int(it.get('quantity', 1))
        for it in doc.get("items", [])
    )

    event_block = ""
    if doc.get("order_type") == "event" and doc.get("event_info"):
        ev = doc["event_info"]
        parts = ["", "Détails de l'événement :"]
        if ev.get("event_type"): parts.append(f"- Type : {ev['event_type']}")
        if ev.get("attendees"): parts.append(f"- Personnes : ~{ev['attendees']}")
        if ev.get("event_date"): parts.append(f"- Date : {ev['event_date']}")
        if ev.get("comments"): parts.append(f"- Précisions : {ev['comments']}")
        event_block = "\n".join(parts) + "\n"

    subject = "Votre soumission - Délices Mikaté Royal"
    body = (
        f"Bonjour {doc['customer_name']},\n\n"
        f"Merci pour votre intérêt envers Délices Mikaté Royal.\n\n"
        f"Voici le détail de votre commande :\n\n"
        f"{items_lines}\n"
        f"{event_block}\n"
        f"Sous-total : {subtotal:.2f} $\n"
        f"Livraison : [à compléter]\n"
        f"Total : [à compléter]\n\n"
        f"{_build_payment_block(settings)}\n\n"
        f"{settings.interac_note}\n\n"
        f"Dès réception du paiement, votre commande sera confirmée.\n\n"
        f"Merci de votre confiance !\n\n"
        f"Délices Mikaté Royal\n"
        f"📧 contact@mikateroyal.com\n"
        f"🌐 mikateroyal.com"
    )
    return subject, body


def _build_order_email_html(order: Order) -> str:
    items_rows = "".join(
        f"<tr><td style='padding:8px;border-bottom:1px solid #E8E2D9;'>{i.product_name}</td>"
        f"<td style='padding:8px;border-bottom:1px solid #E8E2D9;text-align:center;'>{i.quantity}</td></tr>"
        for i in order.items
    )
    msg_block = (
        f"<p style='margin-top:16px;color:#665D50;'><strong>Message :</strong><br>{order.message}</p>"
        if order.message else ""
    )
    email_block = f"<p style='margin:4px 0;color:#1D1914;'><strong>Email :</strong> {order.email}</p>" if order.email else ""
    pay_block = f"<p style='margin:4px 0;'><strong>Mode de paiement préféré :</strong> {order.payment_method}</p>" if order.payment_method else ""
    date_block = f"<p style='margin:4px 0;'><strong>Date souhaitée :</strong> {order.preferred_delivery_date}</p>" if order.preferred_delivery_date else ""
    return f"""
    <div style="font-family:Georgia,serif;background:#FAF8F5;padding:32px;color:#1D1914;">
      <div style="max-width:600px;margin:0 auto;background:#FFFFFF;border:1px solid #E8E2D9;border-radius:16px;padding:32px;">
        <h1 style="color:#9A1F38;font-size:28px;margin:0 0 8px 0;">Nouvelle demande de soumission — Délices Mikaté Royal</h1>
        <p style="color:#665D50;margin:0 0 24px 0;">Référence : {order.id}</p>
        <h2 style="font-size:18px;color:#D19627;margin:24px 0 8px 0;">Client</h2>
        <p style="margin:4px 0;"><strong>Nom :</strong> {order.customer_name}</p>
        <p style="margin:4px 0;"><strong>Téléphone :</strong> {order.phone}</p>
        {email_block}
        <p style="margin:4px 0;"><strong>Adresse :</strong> {order.address}</p>
        {date_block}
        {pay_block}
        <h2 style="font-size:18px;color:#D19627;margin:24px 0 8px 0;">Commande</h2>
        <table style="width:100%;border-collapse:collapse;">
          <thead><tr>
            <th style="text-align:left;padding:8px;border-bottom:2px solid #1D1914;">Produit</th>
            <th style="text-align:center;padding:8px;border-bottom:2px solid #1D1914;">Quantité</th>
          </tr></thead>
          <tbody>{items_rows}</tbody>
        </table>
        {msg_block}
        <p style="margin-top:32px;font-size:12px;color:#665D50;">Reçu le {order.created_at.strftime('%d/%m/%Y à %H:%M UTC')}</p>
      </div>
    </div>
    """


@api_router.post("/orders", response_model=Order)
async def create_order(payload: OrderCreate):
    order = Order(**payload.model_dump())

    # Email to owner (notification)
    ok, err = await _send_email(
        to=[RECIPIENT_EMAIL],
        subject=f"Nouvelle demande de soumission — {order.customer_name}",
        html=_build_order_email_html(order),
        reply_to=order.email,
    )
    order.email_sent = ok
    order.email_error = err

    # Auto confirmation email to client (if they provided an email)
    if order.email:
        ok2, err2 = await _send_email(
            to=[order.email],
            subject="Nous avons bien reçu votre demande - Délices Mikaté Royal",
            html=_build_client_confirmation_html(order),
            reply_to=RECIPIENT_EMAIL,
        )
        order.client_email_sent = ok2
        order.client_email_error = err2

    doc = order.model_dump()
    doc['created_at'] = doc['created_at'].isoformat()
    await db.orders.insert_one(doc)
    return order


@api_router.get("/orders", response_model=List[Order])
async def list_orders(limit: int = 100, _: bool = Depends(require_admin)):
    docs = await db.orders.find({}, {"_id": 0}).sort("created_at", -1).to_list(limit)
    for d in docs:
        if isinstance(d.get('created_at'), str):
            d['created_at'] = datetime.fromisoformat(d['created_at'])
        # Backward compat: legacy statuses -> new statuses
        legacy_map = {"pending": "new", "confirmed": "submission_sent", "fulfilled": "delivered"}
        if d.get("status") in legacy_map:
            d["status"] = legacy_map[d["status"]]
    return docs


@api_router.get("/orders/unread-count")
async def unread_count(_: bool = Depends(require_admin)):
    n = await db.orders.count_documents({"read": {"$ne": True}})
    return {"count": n}


@api_router.patch("/orders/{order_id}/status", response_model=Order)
async def update_order_status(order_id: str, payload: OrderStatusUpdate, _: bool = Depends(require_admin)):
    res = await db.orders.update_one({"id": order_id}, {"$set": {"status": payload.status}})
    if res.matched_count == 0:
        raise HTTPException(status_code=404, detail="Commande introuvable")
    doc = await db.orders.find_one({"id": order_id}, {"_id": 0})
    if isinstance(doc.get('created_at'), str):
        doc['created_at'] = datetime.fromisoformat(doc['created_at'])
    return doc


@api_router.patch("/orders/{order_id}/read", response_model=Order)
async def mark_order_read(order_id: str, _: bool = Depends(require_admin)):
    res = await db.orders.update_one({"id": order_id}, {"$set": {"read": True}})
    if res.matched_count == 0:
        raise HTTPException(status_code=404, detail="Commande introuvable")
    doc = await db.orders.find_one({"id": order_id}, {"_id": 0})
    if isinstance(doc.get('created_at'), str):
        doc['created_at'] = datetime.fromisoformat(doc['created_at'])
    return doc


@api_router.post("/orders/mark-all-read")
async def mark_all_read(_: bool = Depends(require_admin)):
    res = await db.orders.update_many({"read": {"$ne": True}}, {"$set": {"read": True}})
    return {"updated": res.modified_count}


@api_router.delete("/orders/{order_id}")
async def delete_order(order_id: str, _: bool = Depends(require_admin)):
    res = await db.orders.delete_one({"id": order_id})
    if res.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Commande introuvable")
    return {"deleted": True}


@api_router.get("/orders/{order_id}/submission")
async def get_submission_template(order_id: str, _: bool = Depends(require_admin)):
    doc = await db.orders.find_one({"id": order_id}, {"_id": 0})
    if not doc:
        raise HTTPException(status_code=404, detail="Commande introuvable")
    settings = await _get_settings()
    subject, body = _build_submission_text(doc, settings)
    return {"subject": subject, "body": body, "to": doc.get("email") or ""}


@api_router.get("/admin/payment-instructions")
async def get_payment_instructions(_: bool = Depends(require_admin)):
    settings = await _get_settings()
    text = _build_payment_block(settings)
    return {"text": text}


@api_router.post("/orders/{order_id}/send-submission")
async def send_submission_email(order_id: str, _: bool = Depends(require_admin)):
    doc = await db.orders.find_one({"id": order_id}, {"_id": 0})
    if not doc:
        raise HTTPException(status_code=404, detail="Commande introuvable")
    if not doc.get("email"):
        raise HTTPException(status_code=400, detail="Aucun courriel client enregistré")
    settings = await _get_settings()
    subject, body = _build_submission_text(doc, settings)
    html = "<div style='font-family:Georgia,serif;color:#1D1914;line-height:1.55;'>" + \
           body.replace("\n", "<br>") + "</div>"
    ok, err = await _send_email(to=[doc["email"]], subject=subject, html=html, reply_to=RECIPIENT_EMAIL)
    update = {"submission_email_sent": ok, "submission_email_error": err}
    if ok:
        update["status"] = "submission_sent"
    await db.orders.update_one({"id": order_id}, {"$set": update})
    if not ok:
        raise HTTPException(status_code=502, detail=f"Échec d'envoi : {err}")
    return {"ok": True}


@api_router.get("/admin/settings", response_model=Settings)
async def get_settings(_: bool = Depends(require_admin)):
    return await _get_settings()


@api_router.put("/admin/settings", response_model=Settings)
async def update_settings(payload: SettingsUpdate, _: bool = Depends(require_admin)):
    current = await _get_settings()
    data = current.model_dump()
    for k, v in payload.model_dump(exclude_none=True).items():
        data[k] = v
    new = Settings(**data)
    await db.settings.update_one(
        {"_id": "interac"},
        {"$set": new.model_dump()},
        upsert=True,
    )
    return new


@api_router.post("/admin/login")
async def admin_login(_: bool = Depends(require_admin)):
    return {"ok": True}


@api_router.get("/admin/email-config")
async def email_config(_: bool = Depends(require_admin)):
    return {
        "resend_api_key_set": bool(RESEND_API_KEY),
        "resend_api_key_prefix": RESEND_API_KEY[:6] + "…" if RESEND_API_KEY else "",
        "sender": SENDER_EMAIL,
        "sender_name": SENDER_NAME,
        "recipient": RECIPIENT_EMAIL,
    }


@api_router.post("/admin/email-test")
async def email_test(_: bool = Depends(require_admin)):
    ok, err = await _send_email(
        to=[RECIPIENT_EMAIL],
        subject="Test — Délices Mikaté Royal",
        html="<p>Email de test depuis l'admin Délices Mikaté Royal. Si vous recevez ce message, la configuration Resend fonctionne ✅</p>",
    )
    if ok:
        return {"ok": True}
    return {"ok": False, "error": err}


@api_router.post("/chat")
async def chat_with_nancy(payload: ChatRequest):
    if not EMERGENT_LLM_KEY:
        raise HTTPException(status_code=503, detail="Assistante temporairement indisponible (clé manquante).")

    history_block = ""
    if payload.history:
        # Keep only last 8 turns for context (anti-runaway)
        recent = payload.history[-8:]
        lines = []
        for h in recent:
            who = "Client" if h.role == "user" else "Nancy"
            lines.append(f"{who}: {h.content}")
        history_block = "Conversation précédente :\n" + "\n".join(lines) + "\n\n"

    try:
        chat = (
            LlmChat(
                api_key=EMERGENT_LLM_KEY,
                session_id=payload.session_id,
                system_message=NANCY_SYSTEM_PROMPT,
            )
            .with_model("anthropic", "claude-sonnet-4-6")
        )
        user_text = f"{history_block}Nouveau message du client : {payload.message}"
        reply = await chat.send_message(UserMessage(text=user_text))
        return {"reply": reply.strip() if isinstance(reply, str) else str(reply)}
    except Exception as e:
        tb = traceback.format_exc()
        logger.error(f"Nancy chat error: {e}\n{tb}")
        raise HTTPException(status_code=500, detail=f"Erreur de Nancy : {e}")


app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
