from agentools import MessageHistory
from ws_sync import Sync, remote_action


class SyncedMessageHistory(MessageHistory):
    """
    Synced message history and currently generating partial message
    """

    def __init__(
        self,
        history: list[dict],
        sync_key: str = "MESSAGES",
    ):
        # already generated messages
        self._history = history
        # the currently generating partial message (not yet added to history)
        self.partial = None
        # TODO: unsynced original partial object, and then an autocompleted version that is exposed to the frontend

        self.sync = Sync.only(self, sync_key, history=..., partial=...)

    @property
    def history(self):
        return self._history

    async def append(self, message):
        # called by the assistant
        message = self.ensure_dict(message)
        self._history.append(message)
        if message.get("role") == "assistant" and message.get("content"):
            await self.sync.send_action({"type": "SPEAK_MESSAGE", "text": message["content"]})
        await self.sync()

    @remote_action("RESET_CHAT")
    async def reset(self):
        self._history = []
        await self.sync()

    async def set_partial(self, partial):
        self.partial = partial
        await self.sync()

    async def append_partial(self):
        if self.partial is not None:
            self._history.append(self.partial)
            self.partial = None
            await self.sync()
