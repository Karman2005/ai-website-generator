import os
import json
import time

from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from google import genai
from pydantic import BaseModel


# =====================================================
# ENVIRONMENT
# =====================================================

load_dotenv()

api_key = os.getenv("GEMINI_API_KEY")

if not api_key:
    raise RuntimeError(
        "GEMINI_API_KEY is missing in .env"
    )


# =====================================================
# GEMINI
# =====================================================

client = genai.Client(
    api_key=api_key
)


# Models to try
MODELS = [
    "gemini-3.1-flash-lite",
    "gemini-3-flash-preview"
]


# =====================================================
# FASTAPI
# =====================================================

app = FastAPI(
    title="AI Website Generator",
    version="1.0.0"
)


# =====================================================
# CORS
# =====================================================

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# =====================================================
# REQUEST MODELS
# =====================================================

class WebsiteRequest(BaseModel):
    prompt: str


class ModifyRequest(BaseModel):
    html: str
    css: str
    js: str
    instruction: str


# =====================================================
# CLEAN AI RESPONSE
# =====================================================

def clean_ai_response(result):

    result = result.strip()

    if result.startswith("```json"):
        result = result[7:]

    elif result.startswith("```"):
        result = result[3:]

    if result.endswith("```"):
        result = result[:-3]

    return result.strip()


# =====================================================
# GEMINI REQUEST WITH RETRY + FALLBACK
# =====================================================

def generate_with_gemini(prompt):

    last_error = None


    for model in MODELS:

        for attempt in range(2):

            try:

                response = client.models.generate_content(

                    model=model,

                    contents=prompt

                )

                if response.text:

                    return response.text

                raise Exception(
                    "Gemini returned an empty response"
                )


            except Exception as e:

                last_error = e

                error_text = str(e)


                # Retry temporary 503 errors
                if (
                    "503" in error_text
                    or "UNAVAILABLE" in error_text
                ):

                    time.sleep(2)

                    continue


                # Try next model
                break


    raise last_error


# =====================================================
# HOME
# =====================================================

@app.get("/")
def home():

    return {
        "message": "AI Website Generator API is running",
        "status": "online"
    }


# =====================================================
# GENERATE WEBSITE
# =====================================================

@app.post("/generate")
def generate_website(request: WebsiteRequest):

    if not request.prompt.strip():

        raise HTTPException(
            status_code=400,
            detail="Prompt cannot be empty"
        )


    system_prompt = """

You are an expert frontend developer.

Generate a complete modern website based on the user's request.

Return ONLY valid JSON:

{
    "html": "...",
    "css": "...",
    "js": "..."
}

Rules:

1. HTML contains only website content.
2. CSS contains all styling.
3. JS contains all JavaScript.
4. Do not use Markdown code fences.
5. Do not provide explanations.
6. Make the website modern.
7. Make it responsive.
8. Use semantic HTML.
9. Do not use Bootstrap.
10. Do not use Tailwind.
11. Do not include html/head/body tags inside html.
12. Do not include style tags inside html.
13. Do not include script tags inside html.
14. Make the website work directly in a browser.

"""


    prompt = f"""
{system_prompt}

USER REQUEST:

{request.prompt}
"""


    try:

        result = generate_with_gemini(prompt)

        result = clean_ai_response(result)

        website = json.loads(result)


        if not all(
            field in website
            for field in ["html", "css", "js"]
        ):

            raise HTTPException(
                status_code=500,
                detail="Invalid website response from Gemini"
            )


        return {
            "html": website["html"],
            "css": website["css"],
            "js": website["js"]
        }


    except json.JSONDecodeError:

        raise HTTPException(
            status_code=500,
            detail="Gemini returned invalid JSON"
        )


    except HTTPException:

        raise


    except Exception as e:

        raise HTTPException(
            status_code=503,
            detail=f"Gemini temporarily unavailable: {str(e)}"
        )


# =====================================================
# MODIFY WEBSITE
# =====================================================

@app.post("/modify")
def modify_website(request: ModifyRequest):

    if not request.instruction.strip():

        raise HTTPException(
            status_code=400,
            detail="Modification instruction cannot be empty"
        )


    system_prompt = """

You are an expert frontend developer.

Modify an existing website according to the user's request.

Return ONLY valid JSON:

{
    "html": "...",
    "css": "...",
    "js": "..."
}

Rules:

1. Return complete HTML.
2. Return complete CSS.
3. Return complete JavaScript.
4. Preserve existing functionality.
5. Only make requested changes.
6. Keep the website responsive.
7. Do not use Markdown code fences.
8. Do not provide explanations.
9. Do not include html/head/body tags.
10. Do not include style tags.
11. Do not include script tags.

"""


    prompt = f"""
{system_prompt}


CURRENT HTML:

{request.html}


CURRENT CSS:

{request.css}


CURRENT JAVASCRIPT:

{request.js}


USER MODIFICATION:

{request.instruction}
"""


    try:

        result = generate_with_gemini(prompt)

        result = clean_ai_response(result)

        website = json.loads(result)


        if not all(
            field in website
            for field in ["html", "css", "js"]
        ):

            raise HTTPException(
                status_code=500,
                detail="Invalid modification response from Gemini"
            )


        return {
            "html": website["html"],
            "css": website["css"],
            "js": website["js"]
        }


    except json.JSONDecodeError:

        raise HTTPException(
            status_code=500,
            detail="Gemini returned invalid JSON"
        )


    except HTTPException:

        raise


    except Exception as e:

        raise HTTPException(
            status_code=503,
            detail=f"Gemini temporarily unavailable: {str(e)}"
        )