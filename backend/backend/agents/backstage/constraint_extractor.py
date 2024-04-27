from agentools import ChatGPT
from agentools.retrieval.db import EmbeddableDataCollection
from qdrant_client.models import Filter
from pydantic import TypeAdapter


class ConstraintExtractor(ChatGPT):
    def __init__(self, model: str, product_db: EmbeddableDataCollection):
        super().__init__(model=model)

        self.product_db = product_db
        self.filters = []

    async def extract_requirements(self, prompt: str):
        self.filters = ...

    async def get_all_filtered(self):
        """Convert a list of json-like filter objects into a single filter object and return all products that match the filter."""
        combined_filter = {"must": self.filters}
        combined_filter = TypeAdapter(Filter).validate_python(combined_filter)
        print(combined_filter)

        filtered_products = []
        async for product in self.product_db.iterate(filter=combined_filter):
            filtered_products.append(product)

        return filtered_products
