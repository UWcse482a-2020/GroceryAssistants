import requests
from bs4 import BeautifulSoup
import pandas as pd

seattle_url = "https://www.wicstorelocator.com/ci/wa-seattle"
page = BeautifulSoup(requests.get(seattle_url).content, "html.parser")
# find header
store_names = page.find_all("h3")[3:-1]
store_names = [store.get_text() for store in store_names]
# find locations
locations = page.find_all("a", href=True, alt=False, target="_blank")
locations = [str(loc["href"]) for loc in locations]
d = {"Store": store_names, "Location": locations}
df = pd.DataFrame(data=d)
df.to_csv("../../data/stores.csv", index=False)
