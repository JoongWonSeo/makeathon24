import logging
import json

from agentools import ChatGPT, SimpleHistory
from agentools.retrieval.db import EmbeddableDataCollection
from qdrant_client.models import Filter
from pydantic import TypeAdapter
from jsonschema import validate
import jsonschema

from ...db.products import Product
from .util import extract_values, remove_objects_by_key, remove_title, prettier_filter

logger = logging.getLogger(__name__)


with open("filter_schema.json") as f:
    FILTER_SCHEMA = remove_title(json.load(f))

PRODUCT_SCHEMA = remove_title(Product.model_json_schema())


SYSTEM = f"""
There exists a database of cars and their metadata, where each entry is of the following database JSON schema:
{json.dumps(PRODUCT_SCHEMA)}

You will be given a piece of continuously running dialog between the car dealer and the customer, where the customer could potentially mention requirements on the car they want to buy.
From this, your goal is to extract the mentioned requirements in the form of filtering clauses and conditions, on the keys of the above database JSON.

To do so, you must respond with a JSON object representing the filter, STRICTLY conforming to the following JSON schema: 
{json.dumps(FILTER_SCHEMA)}
HOWEVER, IF there is no requirement to be extracted, OR IF the requirement cannot be expressed as a valid filter due to the database schema not containing the relevant key, respond with an empty JSON object {{}}.

Every time you respond with a new filter, it will be added to the collection of filters you have extracted so far. Therefore, only extract new requirements from the newly given dialog.
When you respond with a new filter for a key that was already filtered, the new filter will replace the old filter for that key, which lets you refine the filter over time. Finally, in order to remove a filter for a key, such that the key is no longer constrained, you must set its match to null like: {{"key": "num_seats", "match": null]}}!
""".strip()

MODEL = "gpt-4-turbo"


class FilterExtractor(ChatGPT):
    def __init__(self, product_db: EmbeddableDataCollection, backstage=None):
        super().__init__(messages=SimpleHistory.system(SYSTEM), model=MODEL)

        self.product_db = product_db
        self.filters = {"must": []}  # combined filters, joined by AND

        self.backstage = backstage

    async def extract_filters(self, dialog, max_retries=3):
        FILTER_KEYS = [
            "vehicle_type",
            "release_year",
            "price_in_usd",
            "is_used",
            "powertrain_type",
            "num_seats",
            "color",
        ]
        extracted = json.loads(
            await self(dialog, response_format={"type": "json_object"})
        )
        for i in range(max_retries):
            if extracted == {}:
                logger.info(f"Extracted filter: {extracted}")
                return None
            else:
                try:
                    validate(extracted, FILTER_SCHEMA)
                except jsonschema.exceptions.ValidationError as err:
                    logger.warning(f"FilterExtractor invalid filter: {err.message}")
                    extracted = json.loads(
                        await self(err.message, response_format={"type": "json_object"})
                    )
                extracted_keys = extract_values(extracted, "key")
                wrong_keys = [
                    element for element in extracted_keys if element not in FILTER_KEYS
                ]
                if wrong_keys:
                    # non-existent key in filter
                    logger.warning(f"Please delete the following keys: {wrong_keys}")
                    extracted = json.loads(
                        await self(
                            f"Please remove the following keys, because they do not exist in the car database schema: {wrong_keys}",
                            response_format={"type": "json_object"},
                        )
                    )
                else:
                    # filter is valid!
                    # remove any existing filter for the newly created filters
                    for extracted_key in extracted_keys:
                        self.filters = remove_objects_by_key(
                            self.filters, ["key"], extracted_key
                        )

                    # add the new filter
                    self.filters["must"].append(extracted)

                    # cleanup: remove empty filters
                    self.filters = remove_objects_by_key(self.filters, ["match"], None)
                    self.filters = remove_objects_by_key(
                        self.filters, ["must", "should", "must_not"], []
                    )
                    if self.filters is None:
                        self.filters = {"must": []}
                    logger.info(f"Extracted filter: {extracted}")
                    return extracted

        logger.warning(f"Could not extract filter after {max_retries} retries.")
        return None

    async def get_all_filtered(self):
        """Convert a list of json-like filter objects into a single filter object and return all products that match the filter."""
        try:
            pretty = prettier_filter(self.filters)
            logger.info(f"All filters so far: {self.filters}\n{pretty}")
            if self.backstage:
                self.backstage.filters = pretty
                await self.backstage.sync()
        except Exception:
            pass

        # convert to Filter object for compatibility with the database
        combined_filter = TypeAdapter(Filter).validate_python(self.filters)

        filtered_products = []
        async for product in self.product_db.iterate(filter=combined_filter):
            filtered_products.append(product)

        return filtered_products
