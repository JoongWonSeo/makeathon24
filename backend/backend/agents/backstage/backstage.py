import asyncio
import logging
from agentools.retrieval.db import EmbeddableDataCollection

from .filter_extractor import FilterExtractor
from .recommender import Recommender

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
        self.filter_extractor = FilterExtractor(product_db=product_db)
        self.recommender = Recommender()

        # state
        self.recommendations = []  # [{"reason":, "car": Product}]
        self.task = None

    def append_dialog(self, dealer: str, customer: str):
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
        try:
            filter_task = self.filter_extractor.extract_filters(dialog)
            preference_task = self.recommender.update_preferences(dialog)

            # wait for both tasks to finish
            await filter_task
            await preference_task

            # update recommendations
            filtered = await self.filter_extractor.get_all_filtered()
            recommendations = await self.recommender.get_recommendation(
                products=filtered
            )
            self.recommendations = recommendations
            logger.info(f"#recommendations: {len(recommendations)}")
        except Exception as e:
            logger.error(f"Error updating recommendations: {repr(e)}", exc_info=True)

        # clear task
        self.task = None

    async def get_recommendations(self, top_k: int = 3) -> list[dict]:
        """
        Get a list of recommended products.

        Args:
            top_k: The number of recommendations to return.
        """
        if self.task:
            # TODO: set max timeout, so at least we can still show the old recommendations
            await self.task
        return self.recommendations[:top_k]
