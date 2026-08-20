from datetime import datetime

from pydantic import BaseModel, Field, field_validator


class EntryCreate(BaseModel):
    text: str = Field(..., min_length=1)

    @field_validator("text")
    @classmethod
    def strip_and_validate(cls, value: str) -> str:
        stripped = value.strip()
        if not stripped:
            raise ValueError("Text cannot be empty")
        return stripped


class EntryResponse(BaseModel):
    id: int
    original_text: str
    summary: str
    tags: list[str]
    created_at: datetime

    model_config = {"from_attributes": True}


class AIAnalysis(BaseModel):
    summary: str
    tags: list[str]

    @field_validator("summary")
    @classmethod
    def validate_summary(cls, value: str) -> str:
        stripped = value.strip()
        if not stripped:
            raise ValueError("Summary cannot be empty")
        return stripped

    @field_validator("tags")
    @classmethod
    def validate_tags(cls, value: list[str]) -> list[str]:
        if len(value) != 3:
            raise ValueError("Exactly 3 tags are required")
        cleaned = [tag.strip() for tag in value]
        if any(not tag for tag in cleaned):
            raise ValueError("Tags cannot be empty")
        return cleaned
