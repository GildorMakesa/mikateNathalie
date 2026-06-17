"""Generate ginger juice hero image for the story section."""
import asyncio, os, base64
from pathlib import Path
from dotenv import load_dotenv
from emergentintegrations.llm.chat import LlmChat, UserMessage

load_dotenv(Path(__file__).parent / ".env")
API_KEY = os.getenv("EMERGENT_LLM_KEY")
OUT = Path(__file__).parent / "static" / "products" / "jus-gingembre-luxe.png"

PROMPT = (
    "Professional editorial food photography, top quality, magazine style. A LUXURIOUS tall crystal "
    "glass filled with golden amber GINGER JUICE, ice cubes, a slice of lemon and fresh ginger root "
    "pieces visible inside the drink. Condensation droplets on the glass exterior. A small piece of "
    "raw ginger root placed elegantly beside the glass on a linen or marble surface. Warm natural "
    "side lighting, shallow depth of field, cozy warm background, glowing highlights on the liquid. "
    "Photorealistic, 4k, hyper detailed, appetizing. No text, no watermark."
)


async def main():
    chat = (
        LlmChat(api_key=API_KEY, session_id="ginger-luxe", system_message="You are a professional food photographer.")
        .with_model("gemini", "gemini-3.1-flash-image-preview")
        .with_params(modalities=["image", "text"])
    )
    text, images = await chat.send_message_multimodal_response(UserMessage(text=PROMPT))
    if not images:
        print("FAIL:", text[:200])
        return
    OUT.write_bytes(base64.b64decode(images[0]["data"]))
    print("OK ->", OUT)


asyncio.run(main())
