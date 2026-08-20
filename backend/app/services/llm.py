import json

from fastapi import HTTPException
from openai import OpenAI, OpenAIError
from pydantic import ValidationError

from app.config import settings
from app.schemas import AIAnalysis

SYSTEM_PROMPT = """You analyze text and return JSON only.
Respond with exactly this shape:
{"summary": "one concise sentence", "tags": ["tag1", "tag2", "tag3"]}
Rules:
- summary must be a non-empty string
- tags must be exactly 3 short, relevant strings
- return JSON only, no markdown or extra text"""


def analyze_text(text: str) -> AIAnalysis:
    client = OpenAI(api_key=settings.openai_api_key, timeout=20.0)

    try:
        response = client.chat.completions.create(
            model=settings.openai_model,
            messages=[
                {"role": "system", "content": SYSTEM_PROMPT},
                {"role": "user", "content": text},
            ],
            response_format={"type": "json_object"},
        )
    except OpenAIError as exc:
        raise HTTPException(
            status_code=502,
            detail=f"LLM request failed: {exc}",
        ) from exc

    content = response.choices[0].message.content
    if not content:
        raise HTTPException(status_code=502, detail="LLM returned empty response")

    try:
        payload = json.loads(content)
        return AIAnalysis.model_validate(payload)
    except (json.JSONDecodeError, ValidationError) as exc:
        raise HTTPException(
            status_code=502,
            detail=f"Invalid LLM response format: {exc}",
        ) from exc
