import asyncio
import logging
from agentools import Toolkit, msg, function_tool, fail_with_message
from ws_sync import remote_task, sync_only

from ..sync import SyncedChatGPT, SyncedMessageHistory

from .backstage.backstage import Backstage

logger = logging.getLogger(__name__)


SALES_SYSTEM = """
You are a car sales assistant.
""".strip()

SALES_FIRST_MESSAGE = """
Hey there! I'm Emily. What's your name?
""".strip()

# SALES_MODEL = "gpt-4-turbo"
SALES_MODEL = "echo"


class SalesToolkit(Toolkit):
    @sync_only(
        "SHOWROOM",
        # === attributes to sync ===
        showroom=...,
        is_testdrive_booking=...,
        # === sync settings ===
        _toCamelCase=True,
    )
    def __init__(self, backstage: Backstage):
        super().__init__()

        self.backstage = backstage
        self.showroom = []  # list of currently showing car recommendations
        self.is_testdrive_booking = False

    @function_tool
    @fail_with_message(logger=logger.error)
    async def get_car_recommendations(self):
        """
        Get car recommendations automatically based on the user's expressed preferences and constraints so far in the conversation.
        The recommendations are directly displayed to the user, so you SHOULD NOT repeat them in the chat. Instead, you should ask the user about what they think of the recommendations.
        """
        self.showroom = await self.backstage.get_recommendations()
        return self.showroom

    @function_tool
    @fail_with_message(logger=logger.error)
    async def show_testdrive_booking(self):
        """
        Show the user a calendar for booking a test drive.
        """
        self.is_testdrive_booking = True
        return "success, user is currently choosing a date and time for the test drive."
        # return await self.backstage.show_testdrive_booking()


class SalesAssistant(SyncedChatGPT):
    def __init__(
        self,
        backstage: Backstage,
        temperature: float = 0.8,
    ):
        super().__init__(
            messages=SyncedMessageHistory(
                [
                    msg(system=SALES_SYSTEM),
                    msg(assistant=SALES_FIRST_MESSAGE),
                ]
            ),
            tools=SalesToolkit(backstage),
            model=SALES_MODEL,
            temperature=temperature,
        )

        self.backstage = backstage

    @remote_task("PROMPT")  # overriding, we need to also re-add the decorator
    async def prompt(self, prompt):
        asyncio.create_task(
            # TODO: if the assistant called a function last msg, it should filter it out and merge the whole group together
            self.backstage.append_dialog(
                dealer=self.messages.history[-1]["content"], customer=prompt
            )
        )

        await super().prompt(prompt)
