import os
import requests
import pandas as pd
from dotenv import load_dotenv

load_dotenv()

# Iowa Liquor Sales is the default dataset on data.iowa.gov
DEFAULT_DATASET_ID = "m3tr-qhgy"
DEFAULT_BASE_URL = "https://data.iowa.gov/resource"
PAGE_SIZE = 5_000


class DataDownloader:
    def __init__(self, base_url: str = DEFAULT_BASE_URL, app_token: str = None):
        self.base_url = base_url.rstrip("/")
        self.app_token = app_token or os.getenv("SOCRATA_APP_TOKEN")

    def download(
        self,
        dataset_id: str = DEFAULT_DATASET_ID,
        limit: int = None,
        output_path: str = None,
    ) -> pd.DataFrame:
        """Download a Socrata dataset by ID, paginating until all rows are fetched."""
        headers = {}
        if self.app_token:
            headers["X-App-Token"] = self.app_token

        frames = []
        offset = 0
        total_fetched = 0

        while True:
            fetch = PAGE_SIZE if limit is None else min(PAGE_SIZE, limit - total_fetched)
            params = {"$limit": fetch, "$offset": offset, "$order": ":id"}
            url = f"{self.base_url}/{dataset_id}.json"

            response = requests.get(url, params=params, headers=headers, timeout=30)
            response.raise_for_status()

            rows = response.json()
            if not rows:
                break

            frames.append(pd.DataFrame(rows))
            total_fetched += len(rows)
            offset += len(rows)

            if len(rows) < fetch or (limit and total_fetched >= limit):
                break

        df = pd.concat(frames, ignore_index=True) if frames else pd.DataFrame()

        if output_path:
            os.makedirs(os.path.dirname(output_path) or ".", exist_ok=True)
            df.to_csv(output_path, index=False)

        return df

    def preview(self, dataset_id: str = DEFAULT_DATASET_ID, rows: int = 100) -> pd.DataFrame:
        """Fetch a small sample for inspection."""
        return self.download(dataset_id=dataset_id, limit=rows)
