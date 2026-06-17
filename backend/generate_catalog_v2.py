"""Generate well-presented product photos for catalog."""
import asyncio, os, base64
from pathlib import Path
from dotenv import load_dotenv
from emergentintegrations.llm.chat import LlmChat, UserMessage

load_dotenv(Path(__file__).parent / ".env")
API_KEY = os.getenv("EMERGENT_LLM_KEY")
OUT_DIR = Path(__file__).parent / "static" / "products"
OUT_DIR.mkdir(parents=True, exist_ok=True)

PROMPTS = {
    "mikate-sucre-presente": (
        "Professional editorial food photography, magazine quality. A plate of AUTHENTIC WEST AFRICAN PUFF-PUFF "
        "(mikaté) — round golden-brown deep-fried dough balls, lightly vanilla-scented, "
        "elegantly arranged on a white ceramic plate with a small drizzle of honey. Sprinkled with edible "
        "gold flecks. Warm natural light, soft shadows, beige linen background, shallow depth of field, "
        "appetizing close-up. Photorealistic, 4k. No text, no watermark."
    ),
    "mikate-sale-presente": (
        "Professional editorial food photography, magazine quality. A plate of SAVORY African PUFF-PUFF "
        "(mikaté salé) — round golden-brown fried dough balls served as an appetizer entrée, with fresh "
        "herbs (parsley, chives), a small dipping bowl of spicy red sauce on the side, "
        "presented on a dark slate or wooden board. Elegant restaurant plating. Warm lighting, "
        "shallow depth of field. Photorealistic, 4k. No text, no watermark."
    ),
    "mikate-arachide-presente": (
        "Professional editorial food photography. AUTHENTIC AFRICAN PUFF-PUFF (mikaté) — round golden "
        "fried dough balls — served on an elegant white plate WITH A SMALL BOWL OF CREAMY HOMEMADE "
        "PEANUT BUTTER SAUCE next to them, some peanuts scattered artistically, drizzle of peanut sauce "
        "on a few of the puff-puff balls. Warm natural light, beige linen, shallow depth of field. "
        "Photorealistic, 4k. No text, no watermark."
    ),
    "jus-bissap-luxe": (
        "Professional editorial drink photography, magazine style. A LUXURIOUS TALL CRYSTAL GLASS filled "
        "with deep RUBY RED hibiscus tea (bissap), ice cubes, slice of lemon, mint leaves. Condensation "
        "droplets on the glass. Elegant rim, presented on a marble surface with dried hibiscus flowers "
        "scattered beside. Warm golden side lighting, shallow depth of field, glowing red liquid. "
        "Photorealistic, 4k, hyper detailed. No text, no watermark."
    ),
    "jus-tropical-luxe": (
        "Professional editorial drink photography. A LUXURIOUS TALL CRYSTAL GLASS filled with vibrant "
        "ORANGE-YELLOW TROPICAL JUICE (mango, pineapple, passion fruit), ice cubes, fresh pineapple "
        "wedge as garnish, a passion fruit half placed beside. Crystal-clear glass, condensation. "
        "Tropical leaves blurred in background, warm golden tropical lighting, marble or wooden "
        "surface, shallow depth of field. Photorealistic, 4k. No text, no watermark."
    ),
}


async def generate(slug, prompt):
    chat = (
        LlmChat(api_key=API_KEY, session_id=f"mr-{slug}",
                system_message="You are a professional food photographer.")
        .with_model("gemini", "gemini-3.1-flash-image-preview")
        .with_params(modalities=["image", "text"])
    )
    try:
        text, images = await chat.send_message_multimodal_response(UserMessage(text=prompt))
        if not images:
            print(f"[FAIL] {slug}: {text[:120]}")
            return
        (OUT_DIR / f"{slug}.png").write_bytes(base64.b64decode(images[0]["data"]))
        print(f"[OK] {slug}")
    except Exception as e:
        print(f"[ERR] {slug}: {e}")


async def main():
    await asyncio.gather(*(generate(s, p) for s, p in PROMPTS.items()))


asyncio.run(main())
