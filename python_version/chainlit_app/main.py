# chainlit_app/main.py

import os
from pathlib import Path
from chainlit import on_chat_start, on_message, Message, session
from openai import OpenAI
from dotenv import load_dotenv

# ───────────────────────────────────────────────────────────
# 1) LOAD ENVIRONMENT (.env at project root)
# ───────────────────────────────────────────────────────────
env_path = Path(__file__).parent.parent.parent / ".env"
load_dotenv(dotenv_path=env_path)

# ───────────────────────────────────────────────────────────
# 2) SET UP THE OPENAI CLIENT
# ───────────────────────────────────────────────────────────
client = OpenAI(
    api_key=os.getenv("OPENAI_API_KEY"),
)

# ───────────────────────────────────────────────────────────
# 3) DEFINE YOUR "PATIENT PROMPTS"
# ───────────────────────────────────────────────────────────
PATIENT_PROMPTS = {
    "sam": """
You are Sam, a 30-year-old Mexican-American male Veteran with PTSD. You've never had therapy before.
Your session 1 PCL-5 score is 59 and your SUDS is 45. Your combat trauma narrative: 
"My sensor operator sat next to me in our cockpit... [etc.]"
Throughout the chat, stay in character as a military PTSD patient. Keep replies brief (1–2 sentences),
use filler words ("uhm", "..."), and do not break character.
""".strip(),
    "aisha": """
You are Aisha, a 48-year-old divorced African American female with a complex trauma history:
sexual abuse ages 11–15, assault at 16, IPV ages 20–26 (very severe). You have one daughter.
You left your ex after he choked you while your daughter was upstairs. You've been sober 9 months
and want to reconnect with family. Provide short, authentic PTSD patient responses in each turn,
use filler words ("hmm", "..."), and never break character.
""".strip(),
}

# ───────────────────────────────────────────────────────────
# 4) ON CHAT START (fires at each new chat session)
# ───────────────────────────────────────────────────────────
@on_chat_start
async def start_session():
    # Initialize session state
    session.data["prompt_sent"] = False
    session.data["therapist"] = "sam"  # Default therapist
    print("✅ Chainlit chat session has started")

# ───────────────────────────────────────────────────────────
# 5) ON MESSAGE (handles every therapist message)
# ───────────────────────────────────────────────────────────
@on_message
async def handle_message(message: Message):
    """
    Called whenever the therapist types a new prompt and hits Enter.
    1) If it's the FIRST therapist turn, send the system (patient) prompt.
    2) Stream the therapist's message to the LLM and relay chunks back
       so the UI displays the "patient" response in real time.
    """

    # 1) Send system (patient persona) prompt once per session:
    if not session.data.get("prompt_sent", False):
        persona = session.data.get("therapist", "sam")
        system_prompt = PATIENT_PROMPTS.get(persona, PATIENT_PROMPTS["sam"])
        # Send that as the "system" role
        await Message(content=system_prompt, role="system").send()
        session.data["prompt_sent"] = True

    # 2) Stream the therapist's message to the LLM:
    completion = await client.chat.completions.create(
        model="gpt-3.5-turbo",
        messages=[{"role": "user", "content": message.content}],
        stream=True
    )

    # 3) Relay each chunk back into Chainlit (as "assistant" text)
    async for chunk in completion:
        delta = chunk.choices[0].delta.content
        if delta:
            await Message(content=delta, role="assistant").send() 