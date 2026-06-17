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


class OrderCreate(BaseModel):
    customer_name: str = Field(..., min_length=1, max_length=120)
    phone: str = Field(..., min_length=4, max_length=40)
    email: Optional[EmailStr] = None
    address: str = Field(..., min_length=1, max_length=400)
    items: List[OrderItemInput] = Field(..., min_length=1)
    payment_method: Optional[str] = Field(None, max_length=40)
    message: Optional[str] = Field(None, max_length=1000)


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
    status: str = "new"
    email_sent: bool = False
    email_error: Optional[str] = None
    client_email_sent: bool = False
    client_email_error: Optional[str] = None
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


class ProductOut(BaseModel):
    id: str
    name: str
    category: str
    description: str
    image_url: str


# ===== Static catalog (Mikatés = beignets africains / puff-puff — demande de soumission, sans prix) =====
PRODUCTS: List[ProductOut] = [
    ProductOut(
        id="mikate-sucre",
        name="Mikaté Sucré",
        category="Beignets",
        description="Petits beignets africains moelleux et dorés, parfumés à la vanille. La douceur d'enfance, façon Afrique de l'Ouest.",
        image_url="https://images.unsplash.com/photo-1664993085274-80c6ba725ccc?fm=jpg&q=85&w=1200&auto=format&fit=crop",
    ),
    ProductOut(
        id="mikate-sale",
        name="Mikaté Salé",
        category="Beignets",
        description="Version salée du puff-puff : croustillant dehors, fondant dedans. Parfait à l'apéritif ou en entrée.",
        image_url="https://images.unsplash.com/photo-1665833613236-7c1d087463b1?fm=jpg&q=85&w=1200&auto=format&fit=crop",
    ),
    ProductOut(
        id="mikate-sucre-impalpable",
        name="Mikaté Sucre Impalpable",
        category="Beignets",
        description="Authentiques puff-puff africains, généreusement saupoudrés de sucre impalpable. Fondants, nuageux, irrésistibles.",
        image_url="/products/mikate-sucre-impalpable.png",
    ),
    ProductOut(
        id="mikate-chocolat",
        name="Mikaté Chocolat",
        category="Beignets",
        description="Vrais beignets africains (puff-puff) nappés d'un filet de chocolat noir fondu. Le mariage parfait du croquant doré et du chocolat onctueux.",
        image_url="/products/mikate-chocolat.png",
    ),
    ProductOut(
        id="mikate-cannelle",
        name="Mikaté Cannelle",
        category="Beignets",
        description="Puff-puff dorés enrobés d'un mélange sucre-cannelle. Chaleureux, épicé, parfumé — l'allié parfait d'un café ou d'un thé.",
        image_url="/products/mikate-cannelle.png",
    ),
    ProductOut(
        id="mikate-arachide",
        name="Mikaté Pâte d'Arachides",
        category="Beignets",
        description="Puff-puff dorés servis avec une pâte d'arachides maison crémeuse — la combinaison ouest-africaine par excellence, douce et réconfortante.",
        image_url="https://images.unsplash.com/photo-1714596668628-79579eadba07?fm=jpg&q=85&w=1200&auto=format&fit=crop",
    ),
    ProductOut(
        id="bissap-royal",
        name="Bissap Royal",
        category="Boissons",
        description="Infusion d'hibiscus rouge rubis, gingembre frais et menthe. Rafraîchissant, élégant, sans alcool.",
        image_url="https://images.unsplash.com/photo-1601390395693-364c0e22031a?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjA1MTN8MHwxfHNlYXJjaHwyfHxoaWJpc2N1cyUyMHRlYSUyMHJlZCUyMGRyaW5rfGVufDB8fHx8MTc4MTU3Mzc1OXww&ixlib=rb-4.1.0&q=85",
    ),
    ProductOut(
        id="jus-tropical",
        name="Jus Tropical",
        category="Boissons",
        description="Cocktail maison mangue, ananas et fruit de la passion. Le soleil de l'Afrique dans un verre.",
        image_url="https://images.unsplash.com/photo-1583577612013-4fecf7bf8f13?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjA2MDV8MHwxfHNlYXJjaHwyfHx0cm9waWNhbCUyMGZydWl0JTIwanVpY2V8ZW58MHx8fHwxNzgxNTczNzU5fDA&ixlib=rb-4.1.0&q=85",
    ),
    ProductOut(
        id="jus-gingembre",
        name="Jus de Gingembre",
        category="Boissons",
        description="Notre signature : gingembre frais pressé, citron vert et une pointe de miel. Servi dans un verre élégant — vivifiant et raffiné.",
        image_url="/products/jus-gingembre-luxe.png",
    ),
    ProductOut(
        id="plateau-decouverte",
        name="Plateau Découverte",
        category="Coffrets",
        description="Assortiment de mikatés (sucrés, salés, sucre impalpable, chocolat, pâte d'arachides) + boissons au choix. Idéal pour partager en famille ou au bureau.",
        image_url="https://images.unsplash.com/photo-1682263167429-0dbcf2c1e127?fm=jpg&q=85&w=1200&auto=format&fit=crop",
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

    items_lines = "\n".join(
        f"- {it['product_name']} × {it['quantity']}" for it in doc.get("items", [])
    )

    if settings.interac_auto_deposit:
        payment_block = (
            f"Paiement par virement Interac\n"
            f"Adresse de paiement : {settings.interac_email}\n"
            f"Dépôt automatique Interac activé – aucun mot de passe requis."
        )
    else:
        payment_block = (
            f"Paiement par virement Interac\n"
            f"Adresse de paiement : {settings.interac_email}\n"
            f"Question de sécurité : {settings.interac_question}\n"
            f"Réponse : {settings.interac_answer}"
        )

    subject = "Votre soumission - Délices Mikaté Royal"
    body = (
        f"Bonjour {doc['customer_name']},\n\n"
        f"Merci pour votre intérêt envers Délices Mikaté Royal.\n\n"
        f"Voici le détail de votre commande :\n\n"
        f"{items_lines}\n\n"
        f"Sous-total : [à compléter]\n"
        f"Livraison : [à compléter]\n"
        f"Total : [à compléter]\n\n"
        f"{payment_block}\n\n"
        f"{settings.interac_note}\n\n"
        f"Dès réception du paiement, votre commande sera confirmée.\n\n"
        f"Merci de votre confiance !\n\n"
        f"Délices Mikaté Royal\n"
        f"📧 contact@mikateroyal.com\n"
        f"🌐 mikateroyal.com"
    )
    return {"subject": subject, "body": body, "to": doc.get("email") or ""}


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
