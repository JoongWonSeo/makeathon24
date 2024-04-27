import asyncio
import logging
from agentools.retrieval.db import EmbeddableDataCollection

from .constraint_extractor import ConstraintExtractor

logger = logging.getLogger(__name__)

DIALOG_FORMAT = """
Dealer: "{dealer}"
Customer: "{customer}"
""".strip()


class Backstage:
    """
    A group of agents that work together to select the best recommendations for the user.
    """

    def __init__(self, product_db: EmbeddableDataCollection):
        self.product_db = product_db

        # agents
        self.constraint_extractor = ConstraintExtractor(product_db=product_db)
        # self.preference_extractor = PreferenceExtractor(product_db=product_db)

        # state
        self.recommendations = []
        self.task = None

    async def append_dialog(self, dealer: str, customer: str):
        """
        A new piece of Dealer <=> Customer dialog, which can be used to update the recommendations.
        """
        dialog = DIALOG_FORMAT.format(dealer=dealer, customer=customer)

        logger.info(f"Appending dialog:\n{dialog}")

        self.task = asyncio.create_task(self.update_recommendations(dialog))

    async def update_recommendations(self, dialog):
        """
        Update the recommendations based on the given dialog.
        """
        # TODO: parallelize
        await self.constraint_extractor.extract_requirements(dialog)
        # await self.preference_extractor.extract_preferences(dialog)

        # update recommendations
        recommendations = await self.constraint_extractor.get_all_filtered()
        # recommendations = await self.preference_extractor.get_sorted(recommendations)
        self.recommendations = recommendations

        # clear task
        self.task = None

    async def get_recommendations(self, top_k: int = 3):
        """
        Get a list of recommended products.

        Args:
            top_k: The number of recommendations to return.
        """
        if self.task:
            await self.task
        return self.recommendations[:top_k]
