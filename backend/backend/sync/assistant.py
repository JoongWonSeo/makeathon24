import pickle
from logging import getLogger

from agentools import ChatGPT, Tools, GLOBAL_RECORDINGS
from ws_sync import Sync, remote_action, remote_task

from .history import SyncedMessageHistory

logger = getLogger(__name__)


class SyncedChatGPT(ChatGPT):
    _model_list = {  # section: [models]
        "GPT-4": [
            {"value": "gpt-4-turbo", "chip": "Latest"},
            {"value": "gpt-4-turbo-preview"},
        ],
        "GPT-3.5": [
            {"value": "gpt-3.5-turbo", "chip": "Latest"},
            {"value": "gpt-3.5-turbo-1106"},
        ],
        "Open Source": [
            {"value": "llama3-70b-8192", "chip": "Best"},
            {"value": "llama3-8b-8192"},
            {"value": "mixtral-8x7b-32768"},
            {"value": "gemma-7b-it"},
        ],
        "Debug": [
            {"value": "mock"},
            {"value": "echo"},
        ],
    }

    def __init__(
        self,
        messages: SyncedMessageHistory,
        tools: Tools | None = None,
        model: str = "gpt-3.5-turbo",
        temperature: float | None = None,
        sync_key: str = "GPT",
    ):
        super().__init__(messages=messages, tools=tools, model=model)

        # model setting
        self.temperature = temperature

        self.sync = Sync.only(
            self,
            sync_key,
            # attributes to sync, and their key overrides
            model_list=...,
            default_model="selectedModel",
            temperature=...,
            is_recording=...,
            # sync settings
            _expose_running_tasks=True,
            _toCamelCase=True,
            _logger=logger,
        )

    @property
    def model_list(self):
        return self._model_list | (
            {"Recordings": [{"value": m} for m in GLOBAL_RECORDINGS.replay_models]}
            if GLOBAL_RECORDINGS.replay_models
            else {}
        )

    @property
    def is_recording(self):
        return GLOBAL_RECORDINGS.current_recorder is not None

    @remote_task("PROMPT")
    async def prompt(self, prompt: str, **openai_kwargs):
        async for event in self.response_events(
            prompt,
            model=self.default_model,
            temperature=self.temperature,
            stream=True,
            **openai_kwargs,
        ):
            match event:
                case self.PartialMessageEvent():
                    # set partial
                    try:
                        await self.messages.set_partial(event.message.model_dump())
                    except Exception:
                        pass

                case self.CompletionEvent():
                    # complete, reset partial
                    await self.messages.set_partial(None)

    @prompt.cancel
    async def cancel_prompt(self):
        await self.messages.append_partial()

    @remote_action("RECORDING_START")
    async def recording_start(self):
        GLOBAL_RECORDINGS.start()
        await self.sync()

    @remote_action("RECORDING_STOP")
    async def recording_stop(self):
        GLOBAL_RECORDINGS.stop()
        await self.sync()

    @remote_action("EXPORT_RECORDINGS")
    async def export_recordings(self):
        await self.sync.download(
            "recordings.pkl", pickle.dumps(GLOBAL_RECORDINGS.recordings)
        )

    @remote_action("IMPORT_RECORDINGS")
    async def import_recordings(self, data: bytes):
        GLOBAL_RECORDINGS.recordings = pickle.loads(data)
        await self.sync()
        await self.sync.toast("Recordings imported!", type="success")
