import logging
import json

from agentools import ChatGPT, SimpleHistory

logger = logging.getLogger(__name__)


EXTRACTOR_SYSTEM = f"""
The user wants to buy a car. The user talks with a dealer to find the car that fits his needs. The user gives information about the car he wants, and possibly more information about the user. You must respond with a guess of what the user is looking for in a car.
""".strip()

RECOMMENDER_SYSTEM = f"""
There exists a database of cars and the user wants to buy a car. 
Given a guess of what car the user would like, rank the cars in the database based on how well they match the user's preferences. Answer it in the same format as the input, only with different order.
""".strip()


MODEL = "gpt-4-turbo"


class Recommender():
    def __init__(self):
        self.preference = None # guess of user preferences
        self.extractor = ChatGPT(messages=SimpleHistory.system(EXTRACTOR_SYSTEM), model=MODEL)
        self.recommender = ChatGPT(messages=SimpleHistory.system(RECOMMENDER_SYSTEM), model=MODEL)


    async def extract_preferences(self, dialog):
        extracted = await self.extractor(dialog)
        self.preference = extracted
        return extracted

    async def get_sorted(self, products):
        # TODO: implement sorting based on preferences
        sorted = await self.recommender(products,)
        
        return json.loads(sorted)
