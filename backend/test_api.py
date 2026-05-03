import requests
import json
import uuid
from datetime import date

# Configura aqui la URL de tu backend
BASE_URL = "http://localhost:8000" 
USER_ID = f"test_user_{uuid.uuid4().hex[:8]}"
SONG_ID = f"test_song_{uuid.uuid4().hex[:8]}"
POST_ID = f"test_post_{uuid.uuid4().hex[:8]}"
ARTIST_ID = f"test_artist_{uuid.uuid4().hex[:8]}"
PLAYLIST_ID = f"test_playlist_{uuid.uuid4().hex[:8]}"
GENRE_ID = f"test_genre_{uuid.uuid4().hex[:8]}"

def log_res(response, name):
    status = "OK" if response.status_code in [200, 201] else "FAILED"
    print(f"[{status}] {response.status_code} - {name}")
    if response.status_code == 422:
        print(f"    Detail: {response.json()}")

def run_tests():
    print(f"--- Iniciando Pruebas de API ParaMetrix (58 Endpoints) ---\n")

    # 5. SYSTEM
    try:
        log_res(requests.get(f"{BASE_URL}/health"), "GET /health")
    except requests.exceptions.ConnectionError:
        print(f"ERROR: No se pudo conectar al backend en {BASE_URL}. Asegurate de que el servidor este corriendo.")
        return

    # 1. ENTIDADES (6 Etiquetas x 7 endpoints = 42)
    entities = [
        ("users", USER_ID, {
            "user_id": USER_ID, "username": "tester", "email": "test@test.com", 
            "fecha_registro": str(date.today()), "generos_favoritos": ["rock"]
        }, {"username": "tester_upd"}, "premium", "user_id", "count"),
        
        ("songs", SONG_ID, {
            "song_id": SONG_ID, "titulo": "Test Song", "duracion": 3.5, 
            "fecha_lanzamiento": str(date.today()), "idiomas": ["es"]
        }, {"titulo": "Song Upd"}, "popularidad", "duracion", "avg"),

        ("posts", POST_ID, {
            "post_id": POST_ID, "caption": "Test Post", "fecha": str(date.today()), 
            "tipo": "image", "hashtags": ["test"]
        }, {"caption": "Post Upd"}, "tipo", "post_id", "count"),

        ("artists", ARTIST_ID, {
            "artist_id": ARTIST_ID, "nombre": "Test Artist", "pais": "GT", 
            "genero_principal": "rock"
        }, {"nombre": "Artist Upd"}, "pais", "anios_activo", "avg"),

        ("playlists", PLAYLIST_ID, {
            "playlist_id": PLAYLIST_ID, "nombre": "Test List", "descripcion": "Desc", 
            "fecha_creacion": str(date.today())
        }, {"nombre": "List Upd"}, "publica", "numero_canciones", "avg"),

        ("genres", GENRE_ID, {
            "genre_id": GENRE_ID, "nombre": "Test Genre", "descripcion": "Desc", "origen": "GT"
        }, {"nombre": "Genre Upd"}, "origen", "popularidad", "avg")
    ]

    for route, eid, create_data, update_data, gby, afield, afunc in entities:
        print(f"\n>> Pruebas para: /{route}")
        # POST /
        log_res(requests.post(f"{BASE_URL}/api/v1/{route}/", json=create_data), f"POST /api/v1/{route}/")
        # GET /
        log_res(requests.get(f"{BASE_URL}/api/v1/{route}/", params={"limit": 5}), f"GET /api/v1/{route}/")
        # GET /aggregate
        log_res(requests.get(f"{BASE_URL}/api/v1/{route}/aggregate", params={"group_by": gby, "agg_field": afield, "agg_func": afunc}), f"GET /api/v1/{route}/aggregate")
        # GET /{id}
        log_res(requests.get(f"{BASE_URL}/api/v1/{route}/{eid}"), f"GET /api/v1/{route}/{{id}}")
        # PATCH /{id}
        log_res(requests.patch(f"{BASE_URL}/api/v1/{route}/{eid}", json=update_data), f"PATCH /api/v1/{route}/{{id}}")
        # DELETE /{id}/properties
        prop = list(update_data.keys())[0]
        log_res(requests.delete(f"{BASE_URL}/api/v1/{route}/{eid}/properties", params={"properties": [prop]}), f"DELETE /api/v1/{route}/{{id}}/properties")

    # 2. INTERACTIONS (9 Endpoints)
    print(f"\n>> Pruebas para: /interactions")
    # POST / (Crear FOLLOWS entre User y User)
    rel_data = {
        "from_label": "User", "from_id": USER_ID, 
        "to_label": "User", "to_id": USER_ID, 
        "rel_type": "FOLLOWS", "properties": {"cercania": 0.9, "notificaciones": True}
    }
    res_rel = requests.post(f"{BASE_URL}/api/v1/interactions/", json=rel_data)
    log_res(res_rel, "POST /api/v1/interactions/")
    
    element_id = None
    if res_rel.status_code == 200:
        element_id = res_rel.json().get("data", {}).get("element_id")

    # GET /by-type
    log_res(requests.get(f"{BASE_URL}/api/v1/interactions/by-type", params={"rel_type": "FOLLOWS"}), "GET /api/v1/interactions/by-type")

    if element_id:
        # GET /{element_id}
        log_res(requests.get(f"{BASE_URL}/api/v1/interactions/{element_id}"), "GET /api/v1/interactions/{element_id}")
        # PATCH /{element_id}
        log_res(requests.patch(f"{BASE_URL}/api/v1/interactions/{element_id}", json={"properties": {"cercania": 1.0}}), "PATCH /api/v1/interactions/{element_id}")
        # DELETE /{element_id}/properties
        log_res(requests.delete(f"{BASE_URL}/api/v1/interactions/{element_id}/properties", json={"property_names": ["notificaciones"]}), "DELETE /api/v1/interactions/{element_id}/properties")
    
    # Bulk Interactions
    log_res(requests.patch(f"{BASE_URL}/api/v1/interactions/bulk/update", json={
        "rel_type": "FOLLOWS", "filter_property": "cercania", "filter_value": 1.0, "update_data": {"test_bulk": True}
    }), "PATCH /api/v1/interactions/bulk/update")
    
    log_res(requests.delete(f"{BASE_URL}/api/v1/interactions/bulk/properties", json={
        "rel_type": "FOLLOWS", "property_to_remove": "test_bulk", "filter_property": "cercania", "filter_value": 1.0
    }), "DELETE /api/v1/interactions/bulk/properties")

    log_res(requests.delete(f"{BASE_URL}/api/v1/interactions/bulk/delete", json={
        "rel_type": "FOLLOWS", "filter_property": "cercania", "filter_value": 1.0
    }), "DELETE /api/v1/interactions/bulk/delete")

    if element_id:
        # DELETE /{element_id} (Individual)
        log_res(requests.delete(f"{BASE_URL}/api/v1/interactions/{element_id}"), "DELETE /api/v1/interactions/{element_id}")

    # 3. ANALYTICS (6 Endpoints)
    print(f"\n>> Pruebas para: /analytics")
    log_res(requests.get(f"{BASE_URL}/api/v1/analytics/recommendations/{USER_ID}"), "GET /analytics/recommendations/{id}")
    log_res(requests.get(f"{BASE_URL}/api/v1/analytics/similar-users/{USER_ID}"), "GET /analytics/similar-users/{id}")
    log_res(requests.get(f"{BASE_URL}/api/v1/analytics/influence"), "GET /analytics/influence")
    log_res(requests.get(f"{BASE_URL}/api/v1/analytics/popular-songs"), "GET /analytics/popular-songs")
    log_res(requests.get(f"{BASE_URL}/api/v1/analytics/genre-distribution"), "GET /analytics/genre-distribution")
    log_res(requests.get(f"{BASE_URL}/api/v1/analytics/user-activity/{USER_ID}"), "GET /analytics/user-activity/{id}")

    # LIMPIEZA: DELETE /{id}
    print(f"\n>> Limpiando nodos de prueba...")
    for route, eid, _, _, _, _, _ in entities:
        log_res(requests.delete(f"{BASE_URL}/api/v1/{route}/{eid}"), f"DELETE /api/v1/{route}/{{id}}")

    print(f"\n--- Pruebas Finalizadas ---")

if __name__ == "__main__":
    run_tests()
