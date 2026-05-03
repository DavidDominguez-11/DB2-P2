from neo4j import AsyncSession


async def jaccard_similar_users(
    session: AsyncSession,
    user_id: str,
    limit: int = 5,
) -> list[dict]:
    """
    Similitud de Jaccard entre usuarios basada en canciones escuchadas.
    Formula: |A ∩ B| / |A ∪ B|  donde  |A ∪ B| = |A| + |B| - |A ∩ B|
    """
    query = """
    MATCH (u1:User {user_id: $user_id})-[:LISTENED]->(s:Song)<-[:LISTENED]-(u2:User)
    WHERE u1 <> u2
    WITH u1, u2, count(s) AS intersection
    MATCH (u1)-[:LISTENED]->(s1:Song)
    WITH u1, u2, intersection, count(s1) AS size1
    MATCH (u2)-[:LISTENED]->(s2:Song)
    WITH u2, intersection, size1, count(s2) AS size2
    WITH u2, intersection, (size1 + size2 - intersection) AS union_size
    WHERE union_size > 0
    RETURN u2.user_id AS user_id,
           u2.username AS username,
           toFloat(intersection) / union_size AS similarity
    ORDER BY similarity DESC
    LIMIT $limit
    """
    result = await session.run(query, user_id=user_id, limit=limit)
    return await result.data()


async def recommend_songs(
    session: AsyncSession,
    user_id: str,
    limit: int = 10,
) -> list[dict]:
    """
    Recomienda canciones que no ha escuchado el usuario,
    basandose en los usuarios con mayor similitud Jaccard.
    """
    query = """
    MATCH (u1:User {user_id: $user_id})-[:LISTENED]->(s:Song)<-[:LISTENED]-(u2:User)
    WHERE u1 <> u2
    WITH u1, u2, count(s) AS intersection
    MATCH (u1)-[:LISTENED]->(s1:Song)
    WITH u1, u2, intersection, count(s1) AS size1
    MATCH (u2)-[:LISTENED]->(s2:Song)
    WITH u1, u2, intersection, size1, count(s2) AS size2
    WITH u1, u2, toFloat(intersection) / (size1 + size2 - intersection) AS similarity
    WHERE similarity > 0
    ORDER BY similarity DESC
    LIMIT 10
    MATCH (u2)-[:LISTENED]->(rec:Song)
    WHERE NOT (u1)-[:LISTENED]->(rec)
    RETURN DISTINCT rec.song_id AS song_id,
                    rec.titulo AS titulo,
                    rec.popularidad AS popularidad,
                    count(*) AS recommended_by
    ORDER BY recommended_by DESC, rec.popularidad DESC
    LIMIT $limit
    """
    result = await session.run(query, user_id=user_id, limit=limit)
    return await result.data()


async def influence_ranking(
    session: AsyncSession,
    limit: int = 10,
) -> list[dict]:
    """
    Ranking de influencia basado en seguidores, likes y comentarios recibidos.
    Pesos: seguidores 50%, likes 30%, comentarios 20%.
    """
    query = """
    MATCH (u:User)
    OPTIONAL MATCH (u)<-[:FOLLOWS]-(follower:User)
    WITH u, count(DISTINCT follower) AS followers
    OPTIONAL MATCH (u)-[:CREATED]->(p:Post)<-[:LIKED]-(liker:User)
    WITH u, followers, count(DISTINCT liker) AS total_likes
    OPTIONAL MATCH (u)-[:CREATED]->(p2:Post)<-[:COMMENTED]-(commenter:User)
    WITH u, followers, total_likes, count(DISTINCT commenter) AS total_comments
    RETURN u.user_id AS user_id,
           u.username AS username,
           followers,
           total_likes,
           total_comments,
           round((followers * 0.5 + total_likes * 0.3 + total_comments * 0.2), 2) AS influence_score
    ORDER BY influence_score DESC
    LIMIT $limit
    """
    result = await session.run(query, limit=limit)
    return await result.data()


async def popular_songs(
    session: AsyncSession,
    limit: int = 10,
) -> list[dict]:
    """Canciones mas escuchadas con promedio de duracion de escucha."""
    query = """
    MATCH (s:Song)<-[r:LISTENED]-(u:User)
    WITH s, count(DISTINCT u) AS total_listeners,
         avg(r.duracion_escuchada) AS avg_duration,
         sum(CASE WHEN r.completado THEN 1 ELSE 0 END) AS completed_listens
    RETURN s.song_id AS song_id,
           s.titulo AS titulo,
           s.popularidad AS popularidad,
           total_listeners,
           round(avg_duration, 2) AS avg_duration,
           completed_listens
    ORDER BY total_listeners DESC, s.popularidad DESC
    LIMIT $limit
    """
    result = await session.run(query, limit=limit)
    return await result.data()


async def genre_distribution(session: AsyncSession) -> list[dict]:
    """Distribucion de canciones y escuchas por genero."""
    query = """
    MATCH (g:Genre)<-[:BELONGS_TO]-(s:Song)
    WITH g, count(DISTINCT s) AS song_count
    OPTIONAL MATCH (g)<-[:BELONGS_TO]-(:Song)<-[:LISTENED]-(:User)
    RETURN g.genre_id AS genre_id,
           g.nombre AS nombre,
           song_count,
           count(*) AS total_listens
    ORDER BY total_listens DESC
    """
    result = await session.run(query)
    return await result.data()


async def user_activity_summary(
    session: AsyncSession,
    user_id: str,
) -> dict | None:
    """Resumen de actividad de un usuario especifico."""
    query = """
    MATCH (u:User {user_id: $user_id})
    OPTIONAL MATCH (u)-[:LISTENED]->(s:Song)
    WITH u, count(DISTINCT s) AS songs_listened
    OPTIONAL MATCH (u)-[:CREATED]->(p:Post)
    WITH u, songs_listened, count(DISTINCT p) AS posts_created
    OPTIONAL MATCH (u)-[:FOLLOWS]->(followed:User)
    WITH u, songs_listened, posts_created, count(DISTINCT followed) AS following
    OPTIONAL MATCH (u)<-[:FOLLOWS]-(follower:User)
    WITH u, songs_listened, posts_created, following, count(DISTINCT follower) AS followers
    OPTIONAL MATCH (u)-[:CREATED_PLAYLIST]->(pl:Playlist)
    RETURN u.user_id AS user_id,
           u.username AS username,
           songs_listened,
           posts_created,
           following,
           followers,
           count(DISTINCT pl) AS playlists_created
    """
    result = await session.run(query, user_id=user_id)
    record = await result.single()
    return dict(record) if record else None
