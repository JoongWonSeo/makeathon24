from asyncinit import asyncinit
from ws_sync import session_context

from .agents.sales import SalesAgent
from .agents.backstage.backstage import Backstage
from .db.products import product_db
from .db.users import user_db


@asyncinit
class SessionState:
    """
    Represents one session of a user with the copilot.
    This is responsible for initializing and holding all states of the session.
    """

    async def __init__(self):
        session_context.get().state = self  # attach to current session

        # initialize the product database
        await product_db.check_exist_and_initialize()
        await user_db.check_exist_and_initialize()
        user_data = []
        async for d in user_db.iterate():
            user_data.append(d)
        user_data = user_data[0] if user_data else None

        self.backstage = Backstage(product_db=product_db, user_data=user_data)
        self.assistant = SalesAgent(backstage=self.backstage)
