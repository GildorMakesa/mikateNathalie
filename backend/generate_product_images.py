"""
Generate authentic product photos for Délices Mikaté Royal using Gemini Nano Banana.
Run once: python /app/backend/generate_product_images.py
Saves PNG images to /app/backend/static/products/
"""
import asyncio
import os
import base64
from pathlib import Path
from dotenv import load_dotenv
from emergentintegrations.llm.chat import LlmChat, UserMessage

load_dotenv(Path(__file__).parent / ".env")
API_KEY = os.getenv("EMERGENT_LLM_KEY")

OUT_DIR = Path(__file__).parent / "static" / "products"
OUT_DIR.mkdir(parents=True, exist_ok=True)

PROMPTS = {
    "mikate-sucre-impalpable": (
        "Professional food photography, top quality, magazine style. A plate of authentic West African puff-puff "
        "(mikaté) — golden-brown deep-fried dough balls, round and slightly irregular, piled on an elegant ceramic "
        "plate. The puff-puff are GENEROUSLY DUSTED with fine white powdered sugar (icing sugar / sucre impalpable) "
        "that visibly coats the tops, with some sugar falling onto the plate. Warm natural side lighting, "
        "shallow depth of field, cream / sand colored linen background, soft shadows, appetizing close-up shot. "
        "Photorealistic, 4k, hyper detailed. No text, no watermark."
    ),
    "mikate-chocolat": (
        "Professional food photography, top quality, magazine style. A plate of authentic West African puff-puff "
        "(mikaté) — golden-brown deep-fried dough balls — with a visible DRIZZLE OF MELTED DARK CHOCOLATE ribboning "
        "across the top, glossy chocolate streams flowing down the sides of the round beignets. The chocolate is "
        "rich, shiny and clearly fluid. Elegant ceramic plate, warm natural lighting, dark wood or linen background, "
        "shallow depth of field, appetizing close-up. Photorealistic, 4k, hyper detailed. No text, no watermark."
    ),
    "mikate-cannelle": (
        "Professional food photography, top quality, magazine style. A plate of authentic West African puff-puff "
        "(mikaté) — golden-brown deep-fried dough balls — coated in CINNAMON-SUGAR, with visible warm brown cinnamon "
        "specks dusting the surface, some cinnamon sticks artfully placed beside the plate. Warm cozy lighting, "
        "ceramic plate, linen napkin, autumn / spice mood, shallow depth of field. Photorealistic, 4k, hyper detailed. "
        "No text, no watermark."
    ),
}


async def generate(slug: str, prompt: str):
    chat = LlmChat(
        api_key=API_KEY,
        session_id=f"mikate-{slug}",
        system_message="You are a professional food photographer.",
    ).with_model("gemini", "gemini-3.1-flash-image-preview").with_params(modalities=["image", "text"])

    msg = UserMessage(text=prompt)
    text, images = await chat.send_message_multimodal_response(msg)
    if not images:
        print(f"[FAIL] {slug}: no image returned. text={text[:120]}")
        return False
    img = images[0]
    out = OUT_DIR / f"{slug}.png"
    out.write_bytes(base64.b64decode(img["data"]))
    print(f"[OK]   {slug} -> {out} ({img['mime_type']})")
    return True


async def main():
    for slug, prompt in PROMPTS.items():
        try:
            await generate(slug, prompt)
        except Exception as e:
            print(f"[ERR]  {slug}: {e}")


if __name__ == "__main__":
    asyncio.run(main())
