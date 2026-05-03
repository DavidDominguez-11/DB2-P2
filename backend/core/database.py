from neo4j import AsyncGraphDatabase, AsyncDriver, AsyncSession
from core.config import settings

_driver: AsyncDriver | None = None


def get_driver() -> AsyncDriver:
    global _driver
    if _driver is None:
        _driver = AsyncGraphDatabase.driver(
            settings.NEO4J_URI,
            auth=(settings.NEO4J_USERNAME, settings.NEO4J_PASSWORD),
        )
    return _driver


async def close_driver() -> None:
    global _driver
    if _driver is not None:
        await _driver.close()
        _driver = None


async def get_db():
    driver = get_driver()
    async with driver.session(database=settings.NEO4J_DATABASE) as session:
        yield session
