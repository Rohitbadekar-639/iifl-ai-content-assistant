from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.config import settings
from app.database import get_db
from app.models import Entry
from app.schemas import EntryCreate, EntryResponse
from app.services.llm import analyze_text

router = APIRouter(prefix="/entries", tags=["entries"])


def _to_response(entry: Entry) -> EntryResponse:
    return EntryResponse(
        id=entry.id,
        original_text=entry.original_text,
        summary=entry.summary,
        tags=entry.tags_list,
        created_at=entry.created_at,
    )


@router.post("", response_model=EntryResponse, status_code=201)
def create_entry(payload: EntryCreate, db: Session = Depends(get_db)) -> EntryResponse:
    text = payload.text
    if len(text) > settings.max_input_length:
        raise HTTPException(
            status_code=400,
            detail=f"Text exceeds maximum length of {settings.max_input_length} characters",
        )

    analysis = analyze_text(text)

    entry = Entry(
        original_text=text,
        summary=analysis.summary,
    )
    entry.tags_list = analysis.tags

    db.add(entry)
    db.commit()
    db.refresh(entry)
    return _to_response(entry)


@router.get("", response_model=list[EntryResponse])
def list_entries(db: Session = Depends(get_db)) -> list[EntryResponse]:
    entries = db.query(Entry).order_by(Entry.created_at.desc()).all()
    return [_to_response(entry) for entry in entries]


@router.get("/{entry_id}", response_model=EntryResponse)
def get_entry(entry_id: int, db: Session = Depends(get_db)) -> EntryResponse:
    entry = db.query(Entry).filter(Entry.id == entry_id).first()
    if entry is None:
        raise HTTPException(status_code=404, detail="Entry not found")
    return _to_response(entry)
