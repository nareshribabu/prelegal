"""AI chat endpoint that fills in Mutual NDA fields from a freeform conversation.

Stateless: each request carries the full message history and the field values
collected so far, and the LLM returns a reply plus the merged field values.
"""

from typing import Literal

from fastapi import APIRouter, HTTPException
from litellm import completion
from pydantic import BaseModel

MODEL = "openrouter/openai/gpt-oss-120b"
EXTRA_BODY = {"provider": {"order": ["cerebras"]}}

router = APIRouter()


class PartyDetails(BaseModel):
    companyName: str = ""
    signatoryName: str = ""
    signatoryTitle: str = ""
    noticeAddress: str = ""


class MndaFields(BaseModel):
    partyOne: PartyDetails = PartyDetails()
    partyTwo: PartyDetails = PartyDetails()
    purpose: str = ""
    effectiveDate: str = ""
    mndaTermType: Literal["expires", "untilTerminated"] = "expires"
    mndaTermYears: int = 1
    confidentialityTermType: Literal["years", "perpetuity"] = "years"
    confidentialityTermYears: int = 1
    governingLaw: str = ""
    jurisdiction: str = ""


class ChatMessage(BaseModel):
    role: Literal["user", "assistant"]
    content: str


class MndaChatRequest(BaseModel):
    messages: list[ChatMessage]
    fields: MndaFields


SYSTEM_PROMPT = """You are a legal intake assistant helping a user fill out a \
Mutual Non-Disclosure Agreement (Mutual NDA) through freeform conversation.

Fields to collect (JSON field name -> meaning):
- partyOne.companyName, partyOne.signatoryName, partyOne.signatoryTitle, partyOne.noticeAddress
- partyTwo.companyName, partyTwo.signatoryName, partyTwo.signatoryTitle, partyTwo.noticeAddress
- purpose: why the parties are exchanging confidential information
- effectiveDate: ISO date (YYYY-MM-DD) the agreement starts
- mndaTermType ("expires" or "untilTerminated") and mndaTermYears (if "expires")
- confidentialityTermType ("years" or "perpetuity") and confidentialityTermYears (if "years")
- governingLaw: US state whose law governs the agreement
- jurisdiction: where legal disputes must be brought

Ask the user conversational, one-or-few-at-a-time questions about whichever \
fields are still missing below. Only discuss the Mutual NDA - if the user asks \
about a different kind of document, explain that only the Mutual NDA is \
supported here and steer back. Once every field is filled, confirm with the \
user and let them know they can download the PDF.

Always return the full field set, carrying forward every value already known \
below and merging in anything new the user just told you. Never blank out a \
field the user already provided unless they explicitly change it.

Current field values (JSON):
{current_fields}
"""


class MndaChatCompletion(BaseModel):
    reply: str
    fields: MndaFields


def _build_messages(request: MndaChatRequest) -> list[dict[str, str]]:
    system_message = {
        "role": "system",
        "content": SYSTEM_PROMPT.format(current_fields=request.fields.model_dump_json()),
    }
    history = [{"role": m.role, "content": m.content} for m in request.messages]
    return [system_message, *history]


@router.post("/api/mnda-chat")
def mnda_chat(request: MndaChatRequest) -> MndaChatCompletion:
    try:
        response = completion(
            model=MODEL,
            messages=_build_messages(request),
            response_format=MndaChatCompletion,
            reasoning_effort="low",
            extra_body=EXTRA_BODY,
        )
        return MndaChatCompletion.model_validate_json(response.choices[0].message.content)
    except Exception as error:
        raise HTTPException(status_code=502, detail="AI chat request failed") from error
