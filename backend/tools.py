import os
import json
import requests
from time import sleep
from concurrent.futures import ThreadPoolExecutor, as_completed
from dotenv import load_dotenv
load_dotenv()

ALLOWED_SOURCES = [
    "reuters.com",
    "bbc.com",
    "thehindu.com",
    "ndtv.com",
    "indiatimes.com"
]

from langchain_community.utilities import GoogleSerperAPIWrapper
search = GoogleSerperAPIWrapper(
    serper_api_key=os.getenv("SERPER_API_KEY"),
    k=2,
)


def _fetch_for_site(site: str, query: str) -> list[dict]:
    filtered_query = f"{query} site:{site}"
    results = search.results(filtered_query)
    return results.get("organic", [])


def search_with_sources(query: str) -> str:
    snippets = []
    sources = []
    with ThreadPoolExecutor(max_workers=len(ALLOWED_SOURCES)) as executor:
        future_to_site = {
            executor.submit(_fetch_for_site, site, query): site
            for site in ALLOWED_SOURCES
        }
        for future in as_completed(future_to_site):
            try:
                organic = future.result()
                for r in organic:
                    title   = r.get("title",   "No title")
                    link    = r.get("link",    "")
                    snippet = r.get("snippet", "")
                    snippets.append(f"{snippet}")
                    sources.append(f"{link}")
            except Exception as e:
                site = future_to_site[future]
                snippets.append(f"[Search failed for {site}: {str(e)}]")

    if not snippets:
        return "No relevant results found."
    return ("\n".join(snippets) + "\n\nSOURCES:\n" + "\n".join(sources))


WEATHER_API_BASE = "https://api.weatherstack.com/current"
WEATHER_REQUEST_TIMEOUT = 5
MAX_RETRIES = 3


def get_weather_data(city: str) -> str:
    for attempt in range(MAX_RETRIES):
        try:
            response = requests.get(
                WEATHER_API_BASE,
                params={
                    "access_key": os.environ["WEATHER_API_KEY"],
                    "query": city,
                },
                timeout=WEATHER_REQUEST_TIMEOUT,
            )
            response.raise_for_status()
            data = response.json()

            if "current" not in data:
                return json.dumps({"error": "Invalid API response", "data": data})

            return json.dumps(data, indent=2)

        except requests.exceptions.RequestException as e:
            if attempt == MAX_RETRIES - 1:
                return json.dumps({
                    "error": "Weather API failed",
                    "details": str(e),
                    "city": city
                })
            sleep(1)


def query_resumes(question: str) -> str:
    from rag import get_hybrid_rerank_retriever, format_docs
    try:
        retriever = get_hybrid_rerank_retriever()
        docs = retriever.invoke(question)
        if not docs:
            return "No relevant information found in the uploaded resumes."
        context = format_docs(docs)
        return f"RESUME CONTEXT:\n{context}"
    except Exception as e:
        return f"RAG retrieval failed: {str(e)}"
