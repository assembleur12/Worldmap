import random
import time
import json
import requests
from datetime import datetime

# URL de votre Loki (modifiez en fonction de votre configuration)
LOKI_URL = 'http://localhost:3100/loki/api/v1/push'

# Liste des types possibles de logs
log_types = ['issue', 'pull_request', 'commit']

# Fonction pour générer un ID aléatoire
def generate_random_id():
    return random.randint(1000000000000, 9999999999999)

# Fonction pour générer une latitude aléatoire (-90 à 90)
def generate_random_latitude():
    return random.uniform(-90.0, 90.0)

# Fonction pour générer une longitude aléatoire (-180 à 180)
def generate_random_longitude():
    return random.uniform(-180.0, 180.0)

# Fonction pour générer un timestamp aléatoire dans un intervalle
def generate_random_timestamp():
    # Génère un timestamp entre le 1er janvier 2023 et le 31 décembre 2024
    start_date = datetime(2023, 1, 1)
    end_date = datetime(2024, 12, 31)
    random_timestamp = start_date + (end_date - start_date) * random.random()
    return random_timestamp.isoformat() + 'Z'  # Format ISO 8601 avec "Z" pour UTC

# Fonction pour générer un log aléatoire
def generate_random_log():
    log_entry = {
        "id": generate_random_id(),
        "lat": generate_random_latitude(),
        "lng": generate_random_longitude(),
        "type": random.choice(log_types),
        "timestamp": generate_random_timestamp()
    }
    return log_entry

# Fonction pour envoyer le log à Loki
def send_log_to_loki(log_entry):
    # Créer le payload avec un format compatible Loki
    payload = {
        "streams": [
            {
                "stream": {
                    "type": log_entry["type"],  # Type de l'événement (issue, pull_request, commit)
                    "id": str(log_entry["id"])  # ID de l'événement
                },
                "values": [
                    [
                        str(int(time.time() * 1000000000)),  # timestamp en nanosecondes
                        json.dumps({
                            "lat": log_entry["lat"],
                            "lng": log_entry["lng"],
                            "type": log_entry["type"],
                            "timestamp": log_entry["timestamp"]
                        })  # Les données de log en format JSON
                    ]
                ]
            }
        ]
    }
    
    # Envoyer la requête POST à Loki
    try:
        response = requests.post(LOKI_URL, json=payload)
        if response.status_code == 204:
            print(f"Log envoyé avec succès: {log_entry['id']}")
        else:
            print(f"Erreur lors de l'envoi du log {log_entry['id']}: {response.text}")
    except Exception as e:
        print(f"Erreur de connexion à Loki: {str(e)}")

# Fonction pour envoyer des logs aléatoires à Loki
def send_random_logs():
    while True:
        # Générer un log aléatoire
        random_log = generate_random_log()
        
        # Envoyer ce log à Loki
        send_log_to_loki(random_log)
        
        # Attendre entre 1 et 5 secondes avant d'envoyer un autre log
        time.sleep(random.uniform(1, 5))  # Attendre entre 1 et 5 secondes

if __name__ == "__main__":
    send_random_logs()
