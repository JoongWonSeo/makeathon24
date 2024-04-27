from agentools import Toolkit, msg

from ..sync import SyncedChatGPT, SyncedMessageHistory


SALES_SYSTEM = """
You are a car sales assistant.
""".strip()


class SalesToolkit(Toolkit): ...


class SalesAssistant(SyncedChatGPT):
    def __init__(
        self,
        model: str,
        temperature: float = 0.8,
    ):
        super().__init__(
            messages=SyncedMessageHistory([msg(system=SALES_SYSTEM)]),
            # tools=SalesToolkit(),
            model=model,
            temperature=temperature,
        )
