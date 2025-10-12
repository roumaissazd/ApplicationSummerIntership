# metrics_publisher.py
import psutil
import paho.mqtt.client as mqtt
import time
import json
import GPUtil

# --- Configuration MQTT ---
MQTT_BROKER = "broker.hivemq.com"  # Broker public pour les tests
MQTT_PORT = 1883
MQTT_TOPIC = "system/metrics/rouzd-pc" # Utilisez un topic unique !

# --- Connexion au broker ---
client = mqtt.Client()

def on_connect(client, userdata, flags, rc):
    if rc == 0:
        print("Connecté au broker MQTT !")
    else:
        print(f"Échec de la connexion, code de retour : {rc}")

client.on_connect = on_connect
client.connect(MQTT_BROKER, MQTT_PORT, 60)
client.loop_start() # Gère la reconnexion automatiquement

# --- Boucle de publication ---
try:
    while True:
        # Collecte des métriques
        gpus = GPUtil.getGPUs()
        gpu_percent = gpus[0].load * 100 if gpus else 0
        gpu_mem_percent = gpus[0].memoryUtil * 100 if gpus else 0

        metrics = {
            "cpu": psutil.cpu_percent(interval=1),
            "ram": psutil.virtual_memory().percent,
            "disk": psutil.disk_usage('/').percent,
            "bytesSent": psutil.net_io_counters().bytes_sent,
            "bytesReceived": psutil.net_io_counters().bytes_recv,
            "gpu": gpu_percent,
            "gpuMem": gpu_mem_percent,
            # Pour la batterie, si applicable
            "battery": psutil.sensors_battery().percent if hasattr(psutil, "sensors_battery") and psutil.sensors_battery() else 100,
            "charging": psutil.sensors_battery().power_plugged if hasattr(psutil, "sensors_battery") and psutil.sensors_battery() else False,
        }

        # Publication des données en JSON
        payload = json.dumps(metrics)
        result = client.publish(MQTT_TOPIC, payload)
        
        # Vérification du statut de la publication
        status = result.rc
        if status == 0:
            print(f"Données envoyées sur le topic `{MQTT_TOPIC}`: {payload}")
        else:
            print(f"Échec de l'envoi du message sur le topic `{MQTT_TOPIC}`")

        time.sleep(2) # Attendre 2 secondes

except KeyboardInterrupt:
    print("Publication arrêtée.")
    client.loop_stop()
    client.disconnect()
