import json
from types import SimpleNamespace

from fastapi.testclient import TestClient

from app.main import app
from app.mnda_chat import MndaChatCompletion, MndaFields, PartyDetails


def _fake_completion_response(result: MndaChatCompletion):
    message = SimpleNamespace(content=result.model_dump_json())
    return SimpleNamespace(choices=[SimpleNamespace(message=message)])


def test_mnda_chat_returns_reply_and_updated_fields(monkeypatch):
    updated_fields = MndaFields(
        partyOne=PartyDetails(companyName="Acme, Inc."),
        purpose="Evaluating a potential partnership.",
    )
    fake_result = MndaChatCompletion(
        reply="Got it, Acme is Party One. What's Party Two's company name?",
        fields=updated_fields,
    )

    captured_kwargs = {}

    def fake_completion(**kwargs):
        captured_kwargs.update(kwargs)
        return _fake_completion_response(fake_result)

    monkeypatch.setattr("app.mnda_chat.completion", fake_completion)

    with TestClient(app) as client:
        response = client.post(
            "/api/mnda-chat",
            json={
                "messages": [{"role": "user", "content": "Party one is Acme, Inc."}],
                "fields": MndaFields().model_dump(),
            },
        )

    assert response.status_code == 200
    body = response.json()
    assert body["reply"] == fake_result.reply
    assert body["fields"]["partyOne"]["companyName"] == "Acme, Inc."
    assert body["fields"]["purpose"] == "Evaluating a potential partnership."

    assert captured_kwargs["model"] == "openrouter/openai/gpt-oss-120b"
    assert captured_kwargs["response_format"] is MndaChatCompletion
    assert captured_kwargs["extra_body"] == {"provider": {"order": ["cerebras"]}}
    sent_messages = captured_kwargs["messages"]
    assert sent_messages[0]["role"] == "system"
    assert sent_messages[1] == {"role": "user", "content": "Party one is Acme, Inc."}


def test_mnda_chat_returns_502_when_the_llm_call_fails(monkeypatch):
    def failing_completion(**kwargs):
        raise RuntimeError("upstream exploded")

    monkeypatch.setattr("app.mnda_chat.completion", failing_completion)

    with TestClient(app) as client:
        response = client.post(
            "/api/mnda-chat",
            json={"messages": [], "fields": MndaFields().model_dump()},
        )

    assert response.status_code == 502


def test_system_prompt_includes_current_field_values(monkeypatch):
    fields = MndaFields(purpose="Existing purpose already on file")

    def fake_completion(**kwargs):
        assert json.loads(
            kwargs["messages"][0]["content"].split("Current field values (JSON):\n", 1)[1]
        )["purpose"] == "Existing purpose already on file"
        return _fake_completion_response(
            MndaChatCompletion(reply="ok", fields=fields)
        )

    monkeypatch.setattr("app.mnda_chat.completion", fake_completion)

    with TestClient(app) as client:
        response = client.post(
            "/api/mnda-chat",
            json={"messages": [], "fields": fields.model_dump()},
        )

    assert response.status_code == 200
