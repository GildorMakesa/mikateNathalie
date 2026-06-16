from fastapi import FastAPI, APIRouter, HTTPException
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


ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Resend
RESEND_API_KEY = os.environ.get('RESEND_API_KEY', '')
SENDER_EMAIL = os.environ.get('SENDER_EMAIL', 'onboarding@resend.dev')
RECIPIENT_EMAIL = os.environ.get('RECIPIENT_EMAIL', 'mikateroyal@gmail.com')
resend.api_key = RESEND_API_KEY

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
    message: Optional[str] = Field(None, max_length=1000)


class Order(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    customer_name: str
    phone: str
    email: Optional[str] = None
    address: str
    items: List[OrderItemInput]
    message: Optional[str] = None
    status: str = "pending"
    email_sent: bool = False
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))


class TestimonialOut(BaseModel):
    id: str
    name: str
    role: str
    quote: str
    avatar_url: str
    rating: int = 5


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
        image_url="https://images.unsplash.com/photo-1631029098074-be99eb2b425c?fm=jpg&q=85&w=1200&auto=format&fit=crop",
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
        role="Cliente fidèle, Montréal",
        quote="Les mikatés sont divins, exactement comme ceux de ma grand-mère à Cotonou. Le bissap est une tuerie !",
        avatar_url="https://images.unsplash.com/photo-1562337404-3044c84ac061?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NDQ2NDN8MHwxfHNlYXJjaHwxfHxwb3J0cmFpdCUyMGhhcHB5JTIwcGVyc29ufGVufDB8fHx8MTc4MTU3Mzc3NXww&ixlib=rb-4.1.0&q=85",
    ),
    TestimonialOut(
        id="t2",
        name="Koffi A.",
        role="Organisateur d'événements, Laval",
        quote="J'ai commandé pour un événement de 80 personnes : ponctualité, qualité, présentation impeccable.",
        avatar_url="https://images.unsplash.com/photo-1583264277168-58ceba4b84e7?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NDQ2NDN8MHwxfHNlYXJjaHwzfHxwb3J0cmFpdCUyMGhhcHB5JTIwcGVyc29ufGVufDB8fHx8MTc4MTU3Mzc3NXww&ixlib=rb-4.1.0&q=85",
    ),
    TestimonialOut(
        id="t3",
        name="Sarah M.",
        role="Découverte culinaire, Québec",
        quote="Je ne connaissais pas les mikatés, c'est une révélation. Le plateau découverte est parfait pour goûter à tout.",
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
    return TESTIMONIALS


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

    if RESEND_API_KEY and RESEND_API_KEY.startswith("re_") and not RESEND_API_KEY.endswith("placeholder_replace_me"):
        try:
            params = {
                "from": SENDER_EMAIL,
                "to": [RECIPIENT_EMAIL],
                "subject": f"Nouvelle demande de soumission — {order.customer_name}",
                "html": _build_order_email_html(order),
            }
            result = await asyncio.to_thread(resend.Emails.send, params)
            if result and result.get("id"):
                order.email_sent = True
        except Exception as e:
            logger.error(f"Resend email failed: {e}")

    doc = order.model_dump()
    doc['created_at'] = doc['created_at'].isoformat()
    await db.orders.insert_one(doc)
    return order


@api_router.get("/orders", response_model=List[Order])
async def list_orders(limit: int = 100):
    docs = await db.orders.find({}, {"_id": 0}).sort("created_at", -1).to_list(limit)
    for d in docs:
        if isinstance(d.get('created_at'), str):
            d['created_at'] = datetime.fromisoformat(d['created_at'])
    return docs


app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)


@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
