import logging
from agentools.retrieval.db import EmbeddableDataCollection

from .constraint_extractor import ConstraintExtractor

logger = logging.getLogger(__name__)

DIALOG_FORMAT = """
Dealer: "{dealer}"
Customer: "{customer}"
""".strip()

CONSTRAINT_EXTRACTOR_MODEL = "gpt-4-turbo"
PREFERENCE_EXTRACTOR_MODEL = "gpt-4-turbo"


class Backstage:
    """
    A group of agents that work together to select the best recommendations for the user.
    """

    def __init__(self, product_db: EmbeddableDataCollection):
        self.product_db = product_db

        # agents
        self.constraint_extractor = ConstraintExtractor(
            model=CONSTRAINT_EXTRACTOR_MODEL,
            product_db=product_db,
        )
        # self.preference_extractor = PreferenceExtractor(
        #     model=PREFERENCE_EXTRACTOR_MODEL,
        #     product_db=product_db,
        # )

    async def append_dialog(self, dealer: str, customer: str):
        """
        A new piece of Dealer <=> Customer dialog, which can be used to update the recommendations.
        """
        dialog = DIALOG_FORMAT.format(dealer=dealer, customer=customer)

        logger.info(f"Appending dialog:\n{dialog}")

        # TODO: parallelize
        await self.constraint_extractor.extract_requirements(dialog)
        # await self.preference_extractor.extract_preferences(dialog)

    async def get_recommendations(self):
        """
        Get a list of recommended products.
        """
        return []
