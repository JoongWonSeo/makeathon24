import json

from agentools import ChatGPT, SimpleHistory, msg
from backend.db.products import Product

EXTRACTOR_SYSTEM = """
The Customer wants to buy a car. The Customer talks with a dealer to find the car that fits his needs. The Customer gives out information about the car he wants and about himself. 

You are a third party that listens to the conversation. You have a conversation history between the Customer and the dealer. Your task is to extract the Customer's preferences from the conversation.

Gather what you know about the Customer and build up your guess based on the previous conversations. Include things you know about the user again, and don't override information if it's still relevant. Return your guess in the following json format:
{{
    "previous_information": "previous information",
    "new_information": "new information",
    "guess": "your guess based on the new information"
}}
""".strip()


RECOMMENDER_SYSTEM = """
A customer wants to buy a car. Return at most three cars from the given list of cars that best match the customer's preferences. You MUST stick to the given list. Recommend electric cars first, then hybrid cars, and then gasoline cars. If there are multiple cars of the same type, recommend the one with the lowest price first.

If you can't find any that match the customer's preferences, return {{"No Recommendation": "true", "reason": "Why there isn't any recommendation"}}. Answer in the following json format:
{{
    "rank_1": {{
        id: "id1",
        "name": "car1",
        "vehicle_type": "vehicle_type1",
        "reason": "the reason why this car is recommended",
    }},
    "rank_2": {{
        id: "id2",
        "name": "car2",
        "vehicle_type": "vehicle_type2",
        "reason": "the reason why this car is recommended",
    }},
    "rank_3": {{
        id: "id3",
        "name": "car3",
        "vehicle_type": "vehicle_type3",
        "reason": "the reason why this car is recommended",
    }}
}}

CUSTOMER PREFERENCES:
{preference}
""".strip()

MODEL = "gpt-4-turbo"
# MODEL = "llama3-8b-8192"



class RecommenderHistory(SimpleHistory):
    def __init__(self, system_message):
        self._history = []
        self._system_message = system_message
        self.preference = ""


    @property
    def history(self):
        return [msg(
            system=self._system_message.format(preference=self.preference)), *self._history]
        
    async def append(self, message):
        # called by the assistant
        message = self.ensure_dict(message)
        self._history.append(message)

class Recommender:
    def __init__(self, user_data=None):
        # Extractor
        messages=SimpleHistory.system(EXTRACTOR_SYSTEM.format(user_data=user_data or "None"))
        self.extractor = ChatGPT(messages=messages, model=MODEL)

        # Recommender
        self.recommender_history=RecommenderHistory(RECOMMENDER_SYSTEM)
        self.recommender = ChatGPT(messages=self.recommender_history, model=MODEL)


    async def update_preferences(self, dialog):
        extracted = await self.extractor(dialog)
        self.recommender_history.preference = extracted
        return extracted

    async def get_recommendation(self, products: list[Product]):
        # Prepare the car list for recommendation
        car_list = []
        for i, car in enumerate(products):
            car = car.model_dump()
            car.pop("image_url")
            c = {i: car}
            car_list.append(c)
            
        # Get the recommendation
        recommendation = await self.recommender(f"LIST OF CARS: {json.dumps(car_list, indent=2)}", response_format={ "type": "json_object" })
        recommendation = json.loads(recommendation)
        if "No Recommendation" in recommendation:
            return None
        
        # Return the recommendation
        result = []
        for r in recommendation.values():
            car = car_list[int(r["id"])].values()
            result.append({
                "reason": r["reason"],
                "car": car
            })
        
        return result
