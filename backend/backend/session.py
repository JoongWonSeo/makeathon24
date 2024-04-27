from asyncinit import asyncinit
from ws_sync import session_context

from .assistant.sales import SalesAssistant


@asyncinit
class SessionState:
    """
    Represents one session of a user with the copilot.
    This is responsible for initializing and holding all states of the session.
    """

    async def __init__(self):
        session_context.get().state = self  # attach to current session

        self.assistant = SalesAssistant(model="gpt-4-turbo")
