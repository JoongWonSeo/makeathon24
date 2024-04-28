import json
import logging

from agentools import ChatGPT, SimpleHistory, msg
from backend.db.products import Product

logger = logging.getLogger(__name__)

PREFERENCE_SYSTEM = """
The Customer wants to buy a car. The Customer talks with a dealer to find the car that fits his needs. The Customer gives out information about the car he wants and about himself. 

You are a third party that listens to the conversation. You have a conversation history between the Customer and the dealer. Your task is to extract the Customer's preferences from the conversation.

Gather what you know about the Customer and build up your guess based on the previous conversations. Include things you know about the user again, and don't override information if it's still relevant. Return your guess in the following json format:
{{
    "previous_information": "previous information",
    "new_information": "new information",
    "guess": "your guess based on the new information"
}}

There is the following web tracking data of the customer available:
{user_data}
""".strip()


RECOMMENDER_SYSTEM = """
A customer wants to buy a car. You MUST ALWAYS return three cars from the given list of cars that best match the customer's preferences. You MUST stick to the given list. Recommend electric cars first, then hybrid cars, and then gasoline cars. If there are multiple cars of the same type, recommend the one with the lowest price first.
If the user has no preference and is open to recommendations, recommend a car that is well-known and has good value.
Answer in the following json format:
{{"car_recommendations": [{{"id": 123, "reason": "the reason why this car is best, in 1 short sentence"}}, ...]}}

CUSTOMER PREFERENCES:
{preference}
""".strip()

# PREFERENCE_MODEL = "llama3-8b-8192"
# RECOMMENDER_MODEL = "llama3-8b-8192"

PREFERENCE_MODEL = "gpt-4-turbo"
RECOMMENDER_MODEL = "gpt-4-turbo"


class RecommenderHistory(SimpleHistory):
    def __init__(self, system_message):
        self._history = []
        self._system_message = system_message
        self.preference = ""

    @property
    def history(self):
        return [
            msg(system=self._system_message.format(preference=self.preference)),
            *self._history,
        ]

    async def append(self, message):
        # called by the assistant
        message = self.ensure_dict(message)
        self._history.append(message)


class Recommender:
    def __init__(self, user_data=None, backstage=None):
        # Preference extractor
        messages = SimpleHistory.system(
            PREFERENCE_SYSTEM.format(user_data=user_data or "None")
        )
        self.preference = ChatGPT(messages=messages, model=PREFERENCE_MODEL)

        # Recommender
        self.recommender_history = RecommenderHistory(RECOMMENDER_SYSTEM)
        self.recommender = ChatGPT(
            messages=self.recommender_history, model=RECOMMENDER_MODEL
        )

        self.backstage = backstage

    async def update_preferences(self, dialog):
        preference = await self.preference(dialog)
        self.recommender_history.preference = preference

        logger.info(f"Extracted preference: {preference}")
        if self.backstage:
            self.backstage.preferences = preference
            await self.backstage.sync()
        return preference

    async def get_recommendation(self, products: list[Product]) -> list[dict]:
        products = products[:20]

        # Prepare the car list for recommendation
        car_list = []
        for i, car in enumerate(products):
            car = car.model_dump()
            car.pop("image_url")
            c = {i: car}
            car_list.append(c)

        # TODO: validate json format and max_retry
        # Get the recommendation
        recommendation = await self.recommender(
            f"LIST OF CARS: {json.dumps(car_list)}",
            response_format={"type": "json_object"},
        )

        # logger.info(f"TEST: {recommendation}")

        recommendation = json.loads(recommendation)

        # logger.info(f"TEST: {recommendation}")

        recommendation = recommendation.get("car_recommendations")
        if recommendation is None:
            logger.warn(
                f"ERROR: No Recommendation because of bad recommendation return"
            )
            return []

        # Return the recommendation
        result = []
        for r in recommendation:
            car = products[int(r["id"])]
            result.append({"reason": r["reason"], "car": car})

        logger.info(f"Recommended: {result}")

        return result
