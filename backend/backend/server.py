import traceback
import logging

import uvicorn
from fastapi import FastAPI, WebSocket
from fastapi.staticfiles import StaticFiles
from ws_sync import Session, get_user_session, session_context
from agentools.retrieval.db import EmbeddableDataCollection


from .session import SessionState

logger = logging.getLogger(__name__)


# all currently active sessions
sessions = {}  # {session_id: session}

# websocket endpoint
app = FastAPI()

# Set a global vector db client
# EmbeddableDataCollection.use_global_client()


@app.get("/hello")
def hello():
    return {"message": "Hello World"}


@app.websocket("/ws")
async def websocket_endpoint(ws: WebSocket):
    """
    Handle a new websocket connection by creating a new session or using an existing one.
    We use the user_id as the session_id, so that each user can only have one session at a time.
    When a user creates multiple tabs (i.e. multiple WS connections), the new tab will overwrite the old one,
    and the old one will be disconnected.
    """

    # ========== Initialize the session ========== #
    await ws.accept()
    user_id, session_id = await get_user_session(ws)

    if not user_id or not session_id:
        # frontend didn't properly provide a user_id or session_id
        return

    if user_id not in sessions:
        # create a new session
        session_logger = logging.getLogger(f"{__name__}.USER:{user_id}")
        session = Session(logger=session_logger)
        session_context.set(session)
        logger.info(f"New session: {user_id}")
        try:
            await SessionState()
        except Exception as e:
            await session.disconnect(
                message=f"Failed to initialize session: {e}", ws=ws
            )
            sessions.pop(user_id, None)
            raise e
        # save new session
        sessions[user_id] = session

    else:
        # use existing session
        session = sessions[user_id]
        session_context.set(session)

    # ========== Handle the connection ========== #
    try:
        await session.new_connection(ws)
        await session.handle_connection()
    except Exception:
        logger.error(f"Error in connection handler: {traceback.format_exc()}")
    finally:
        try:
            session.ws = None
            await ws.close()
        except Exception:
            pass


# it's important this is mounted after the websocket route
# TODO: The frontend html files should be served by a separate server
app.mount("/", StaticFiles(directory="../frontend/out", html=True), name="static")


def start():
    uvicorn.run("backend.server:app", port=9000)


def dev():
    uvicorn.run("backend.server:app", port=9000, reload=True)


def expose():
    uvicorn.run(
        "backend.server:app",
        port=9000,
        reload=True,
        host="0.0.0.0",
    )
