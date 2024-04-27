import logging
import json

from agentools import ChatGPT, SimpleHistory
from agentools.retrieval.db import EmbeddableDataCollection
from qdrant_client.models import Filter
from pydantic import TypeAdapter
from jsonschema import validate
import jsonschema

from ...db.products import Product
from .util import extract_values

logger = logging.getLogger(__name__)


with open("filter_schema.json") as f:
    FILTER_SCHEMA = json.load(f)

PRODUCT_SCHEMA = json.dumps(Product.model_json_schema())


SYSTEM = f"""
There exists a database of cars and the user wants to buy a car. 
The user gives requirements on the car he wants to buy and you must respond with a json object conforming to the following JSON schema: 
{FILTER_SCHEMA}
OR if there is no requirement to be extracted, respond with an empty json object {{}}.
where the keys must conform to the following JSON schema:
{PRODUCT_SCHEMA}
""".strip()

MODEL = "gpt-4-turbo"


class ConstraintExtractor(ChatGPT):
    def __init__(self, product_db: EmbeddableDataCollection):
        super().__init__(messages=SimpleHistory.system(SYSTEM), model=MODEL)

        self.product_db = product_db
        self.filters = []

    async def extract_requirements(self, dialog, max_retries=3):
        keys = [
            "vehicle_type",
            "release_year",
            "price_in_usd",
            "is_used",
            "powertrain_type",
            "num_seats",
            "color",
        ]
        extracted = await self(dialog, response_format={"type": "json_object"})
        extracted = json.loads(extracted)
        for i in range(max_retries):
            if extracted == {}:
                logger.info(f"Extracted filter: {extracted}")
                return None
            else:
                try:
                    validate(extracted, FILTER_SCHEMA)
                except jsonschema.exceptions.ValidationError as err:
                    logger.warning(f"ConstraintExtractor invalid filter: {err.message}")
                    extracted = await self(
                        err.message, response_format={"type": "json_object"}
                    )
                    extracted = json.loads(extracted)
                extracted_keys = extract_values(extracted, "key")
                wrong_keys = [
                    element for element in extracted_keys if element not in keys
                ]
                if wrong_keys == []:
                    self.filters.append(extracted)
                    logger.info(f"Extracted filter: {extracted}")
                    return extracted
                else:
                    logger.warning(f"Please delete the following keys: {wrong_keys}")
                    extracted = await self(
                        f"Please remove the following keys: {wrong_keys}",
                        response_format={"type": "json_object"},
                    )
                    extracted = json.loads(extracted)
        logger.warning(f"Could not extract filter after {max_retries} retries.")
        return None

    async def get_all_filtered(self):
        """Convert a list of json-like filter objects into a single filter object and return all products that match the filter."""
        combined_filter = {"must": self.filters}
        combined_filter = TypeAdapter(Filter).validate_python(combined_filter)
        logger.info(f"All filters so far: {combined_filter}")

        filtered_products = []
        async for product in self.product_db.iterate(filter=combined_filter):
            filtered_products.append(product)

        return filtered_products
