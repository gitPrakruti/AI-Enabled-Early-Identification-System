import os
from dotenv import load_dotenv
from google import genai

load_dotenv()

client = genai.Client(api_key=os.getenv("AQ.Ab8RN6IsZUYyWYrNiHRwi2TVAHjTsFOkLbCDHm12K_C7LiCFbg"))

for model in client.models.list():
    print(model.name)