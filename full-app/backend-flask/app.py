from flask import Flask, request, jsonify
from pymongo import MongoClient
from flask_cors import CORS
from bson.objectid import ObjectId
from deepface import DeepFace
import cv2
import numpy as np
import base64
import os, math
from datetime import datetime

# =============================
#   CONFIGURATION DE L'API
# =============================
app = Flask(__name__)
CORS(app)

MONGO_URI = "mongodb://localhost:27017"
DB_NAME = "dashboardDB"

client = MongoClient(MONGO_URI)
db = client[DB_NAME]
users_collection = db["users"]
metrics_collection = db["dashboards"]

face_cascade = cv2.CascadeClassifier(
    cv2.data.haarcascades + 'haarcascade_frontalface_default.xml'
)

# =============================
#   VÉRIFIER LE VISAGE
# =============================
@app.route('/api/verify', methods=['POST'])
def verify_face():
    try:
        data = request.get_json()
        user_id = data.get('user_id')
        frame_base64 = data.get('frame')

        if not user_id or not frame_base64:
            return jsonify({'error': 'user_id and frame are required'}), 400

        # Décoder l'image envoyée
        frame_data = base64.b64decode(frame_base64)
        nparr = np.frombuffer(frame_data, np.uint8)
        frame = cv2.imdecode(nparr, cv2.IMREAD_COLOR)

        # Détecter les visages dans l'image
        gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
        faces = face_cascade.detectMultiScale(
            gray, scaleFactor=1.1, minNeighbors=5, minSize=(30, 30)
        )

        if len(faces) == 0:
            return jsonify({'authenticated': False, 'error': 'No face detected'}), 200

        # Utiliser le premier visage détecté
        x, y, w, h = faces[0]
        face_region = frame[y:y+h, x:x+w]

        # Récupérer l'image de référence
        user = users_collection.find_one({"_id": ObjectId(user_id)})
        if not user or "faceIdPhoto" not in user or not user["faceIdPhoto"]:
            return jsonify({'error': 'Face image not found for user'}), 404
        
        base_path = os.path.join(os.path.dirname(__file__), '..', 'Backend')
        face_image_path = os.path.normpath(os.path.join(base_path, user["faceIdPhoto"].lstrip('/')))
        
        if not os.path.exists(face_image_path):
            return jsonify({'error': f'Image file not found at {face_image_path}'}), 404

        result = DeepFace.verify(
            face_region,
            face_image_path,
            enforce_detection=False,
            model_name='VGG-Face',
            distance_metric='cosine'
        )

        # Log the attempt (optional, but good for auditing)
        users_collection.update_one(
            {"_id": ObjectId(user_id)},
            {"$push": {"loginAttempts": {"timestamp": datetime.utcnow(), "success": result['verified'], "ip": request.remote_addr, "method": "face"}}}
        )

        return jsonify({
            'authenticated': result['verified'],
            'distance': result.get("distance")
        }), 200

    except Exception as e:
        print(f"Error in /api/verify: {e}")
        return jsonify({'error': str(e), 'authenticated': False}), 500

# =============================
#   PREDICTION DE PANNE (IA)
# =============================
def calculate_risk_percentage(value, thresholds):
    """Calcule un pourcentage de risque basé sur des seuils."""
    if value < thresholds['low']:
        return 0
    if value < thresholds['medium']:
        # Risque linéaire de 1% à 40%
        return 1 + 39 * (value - thresholds['low']) / (thresholds['medium'] - thresholds['low'])
    if value < thresholds['high']:
        # Risque linéaire de 40% à 80%
        return 40 + 40 * (value - thresholds['medium']) / (thresholds['high'] - thresholds['medium'])
    # Risque exponentiel de 80% à 100%
    risk = 80 + 20 * (1 - math.exp(-0.1 * (value - thresholds['high'])))
    return min(risk, 100)

@app.route('/api/predict-failure', methods=['GET'])
def predict_failure():
    try:
        # Récupérer les 50 dernières métriques
        latest_metrics = list(metrics_collection.find().sort("timestamp", -1).limit(50))
        if not latest_metrics:
            return jsonify({'predictions': []}), 200

        # Calculer les moyennes
        # Correction: utiliser les noms de champs corrects ('cpu', 'ram', 'disk') venant de MQTT
        avg_cpu = sum(m.get('cpu', 0) for m in latest_metrics) / len(latest_metrics)
        avg_mem = sum(m.get('ram', 0) for m in latest_metrics) / len(latest_metrics)
        avg_disk = sum(m.get('disk', 0) for m in latest_metrics) / len(latest_metrics)
        current_battery = latest_metrics[0].get('battery', 100)
        is_charging = latest_metrics[0].get('charging', False)

        # Seuils de risque (pourraient être affinés par un modèle ML)
        cpu_thresholds = {'low': 50, 'medium': 75, 'high': 90}
        mem_thresholds = {'low': 60, 'medium': 80, 'high': 95}
        disk_thresholds = {'low': 70, 'medium': 85, 'high': 95}

        # Calculer les pourcentages de risque
        cpu_risk = calculate_risk_percentage(avg_cpu, cpu_thresholds)
        mem_risk = calculate_risk_percentage(avg_mem, mem_thresholds)
        disk_risk = calculate_risk_percentage(avg_disk, disk_thresholds)
        
        # --- Prédiction Batterie ---
        battery_risk = 0
        battery_message = f"Batterie à {current_battery:.0f}%. "
        if is_charging:
            battery_message += "En charge."
        elif current_battery <= 25:
            battery_risk = 85 # Risque élevé
            battery_message += "Niveau critique. Branchez l'appareil."
        elif current_battery <= 50:
            battery_risk = 45 # Risque modéré
            battery_message += "Niveau bas. Pensez à recharger."
        else:
            battery_message += "Niveau correct."

        def get_message(component, risk, avg_value):
            if risk == 0:
                return f"L'utilisation de {component} ({avg_value:.1f}%) est dans les limites normales."
            elif risk <= 40:
                return f"L'utilisation de {component} ({avg_value:.1f}%) est modérée. Surveillance recommandée."
            elif risk <= 80:
                return f"L'utilisation de {component} ({avg_value:.1f}%) est élevée. Risque de dégradation des performances."
            else:
                return f"L'utilisation de {component} ({avg_value:.1f}%) est critique. Risque de panne imminent."

        predictions = [
            {
                'component': 'CPU',
                'risk_percent': round(cpu_risk, 2),
                'message': get_message('CPU', cpu_risk, avg_cpu)
            },
            {
                'component': 'Memory',
                'risk_percent': round(mem_risk, 2),
                'message': get_message('la mémoire', mem_risk, avg_mem)
            },
            {
                'component': 'Disk',
                'risk_percent': round(disk_risk, 2),
                'message': get_message('le disque', disk_risk, avg_disk)
            },
            {
                'component': 'Battery',
                'risk_percent': round(battery_risk, 2),
                'message': battery_message
            }
        ]

        return jsonify({'predictions': predictions}), 200
    except Exception as e:
        print(f"Error in /api/predict-failure: {e}")
        return jsonify({'error': str(e)}), 500

# =============================
#   HEALTH CHECK
# =============================
@app.route('/api/health', methods=['GET'])
def health_check():
    return jsonify({
        'status': 'healthy',
        'timestamp': datetime.now().isoformat()
    }), 200

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)
