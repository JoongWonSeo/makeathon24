# load the environment variables
from dotenv import load_dotenv

load_dotenv(override=True)

# define and configure the logger
import logging
import sys

logging.basicConfig(stream=sys.stdout, level=logging.INFO)
