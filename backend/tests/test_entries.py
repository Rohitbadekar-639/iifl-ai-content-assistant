from unittest.mock import patch

from fastapi import HTTPException

from app.schemas import AIAnalysis


def test_create_entry_rejects_empty_input(client):
    response = client.post("/entries", json={"text": ""})
    assert response.status_code == 422


def test_create_entry_persists_with_mocked_llm(client):
    mocked = AIAnalysis(
        summary="A short summary of the input.",
        tags=["finance", "summary", "demo"],
    )

    with patch("app.routers.entries.analyze_text", return_value=mocked) as mock_llm:
        response = client.post(
            "/entries",
            json={"text": "IIFL Finance builds digital lending products."},
        )

    assert response.status_code == 201
    mock_llm.assert_called_once()

    body = response.json()
    assert body["original_text"] == "IIFL Finance builds digital lending products."
    assert body["summary"] == mocked.summary
    assert body["tags"] == mocked.tags
    assert "id" in body
    assert "created_at" in body

    listed = client.get("/entries")
    assert listed.status_code == 200
    assert len(listed.json()) == 1
    assert listed.json()[0]["id"] == body["id"]


def test_create_entry_handles_llm_failure(client):
    with patch(
        "app.routers.entries.analyze_text",
        side_effect=HTTPException(status_code=502, detail="LLM request failed"),
    ):
        response = client.post(
            "/entries",
            json={"text": "Some valid text that should not be saved on failure."},
        )

    assert response.status_code == 502
    assert "LLM request failed" in response.json()["detail"]

    listed = client.get("/entries")
    assert listed.status_code == 200
    assert listed.json() == []
