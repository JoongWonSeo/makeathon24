from agentools.retrieval.db import (
    EmbeddableDataCollection,
    EmbeddableData,
    EmbeddableField,
)


class UserData(EmbeddableData):
    """
    User data
    """

    user_id: str
    visited_urls: list[str]
    user_agents: list[str]
    locations: list[str]


if EmbeddableDataCollection.global_client is None:
    try:
        EmbeddableDataCollection.use_global_client()
    except Exception:
        pass

user_db = EmbeddableDataCollection("USER_DB", UserData, validate=False)
