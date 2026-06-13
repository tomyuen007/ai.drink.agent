import json
import os
from pathlib import Path

import chromadb
from chromadb.utils.embedding_functions import SentenceTransformerEmbeddingFunction

KNOWLEDGE_FILE = Path(__file__).parent / "knowledge.json"
COLLECTION_NAME = "weather_knowledge"

_collection = None


def _build_collection() -> chromadb.Collection:
    client = chromadb.Client()
    ef = SentenceTransformerEmbeddingFunction(model_name="all-MiniLM-L6-v2")
    col = client.get_or_create_collection(COLLECTION_NAME, embedding_function=ef)

    with open(KNOWLEDGE_FILE) as f:
        chunks = json.load(f)

    col.add(
        ids=[c["id"] for c in chunks],
        documents=[c["text"] for c in chunks],
        metadatas=[{"category": c.get("category", "")} for c in chunks],
    )
    return col


def retrieve(query: str, n: int = 3) -> list[str]:
    """Return the n most relevant knowledge chunks for the given query."""
    global _collection
    if _collection is None:
        _collection = _build_collection()

    results = _collection.query(query_texts=[query], n_results=n)
    return results["documents"][0] if results["documents"] else []


if __name__ == "__main__":
    test_query = "What should I wear in rainy weather?"
    chunks = retrieve(test_query)
    for i, chunk in enumerate(chunks, 1):
        print(f"[{i}] {chunk}")
