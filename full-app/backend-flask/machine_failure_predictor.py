# machine_failure_predictor.py
from flask import Flask, request, jsonify
from pymongo import MongoClient
from flask_cors import CORS
from bson.objectid import ObjectId
from deepface import DeepFace
import cv2
import numpy as np
import base64
import os, math
from datetime import datetime, timedelta
import statistics

app = Flask(__name__)
CORS(app)

MONGO_URI = "mongodb://localhost:27017"
DB_NAME = "dashboardDB"

client = MongoClient(MONGO_URI)
db = client[DB_NAME]
users_collection = db["users"]
machines_collection = db["machines"]
metrics_collection = db["machineMetrics"]  # Collection pour les métriques des machines
predictions_collection = db["predictions"]  # Collection pour stocker les prédictions

face_cascade = cv2.CascadeClassifier(
    cv2.data.haarcascades + 'haarcascade_frontalface_default.xml'
)

# Route pour l'authentification faciale (inchangée)
@app.route('/api/verify', methods=['POST'])
def verify_face():
    # ... (code inchangé)
    pass

def calculate_component_risk(value, thresholds, unit='%'):
    """Calcule un pourcentage de risque basé sur des seuils pour un composant."""
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

def get_component_message(component_name, risk, value, unit='%'):
    """Génère un message contextuel pour un composant."""
    if risk == 0:
        return f"La valeur de {component_name} ({value}{unit}) est dans les limites normales."
    elif risk <= 40:
        return f"La valeur de {component_name} ({value}{unit}) est modérée. Surveillance recommandée."
    elif risk <= 80:
        return f"La valeur de {component_name} ({value}{unit}) est élevée. Risque de dégradation des performances."
    else:
        return f"La valeur de {component_name} ({value}{unit}) est critique. Risque de panne imminent."

@app.route('/api/predict-machine-failure', methods=['GET'])
def predict_machine_failure():
    try:
        machine_id = request.args.get('machineId')
        
        if not machine_id:
            return jsonify({'error': 'machineId parameter is required'}), 400
            
        # Récupérer les informations de la machine
        machine = machines_collection.find_one({"_id": ObjectId(machine_id)})
        if not machine:
            return jsonify({'error': 'Machine not found'}), 404
            
        # Récupérer les 50 dernières métriques pour cette machine
        latest_metrics = list(metrics_collection.find(
            {"machineId": machine_id}
        ).sort("timestamp", -1).limit(50))
        
        if not latest_metrics:
            return jsonify({'predictions': [], 'machineId': machine_id}), 200
            
        # Calculer les moyennes pour chaque composant
        component_averages = {}
        for metric in latest_metrics:
            for component in machine["components"]:
                comp_name = component["name"]
                if comp_name in metric:
                    if comp_name not in component_averages:
                        component_averages[comp_name] = []
                    component_averages[comp_name].append(metric[comp_name])
        
        # Calculer les prédictions pour chaque composant
        predictions = []
        total_risk = 0
        component_count = 0
        
        for component in machine["components"]:
            comp_name = component["name"]
            if comp_name in component_averages and component_averages[comp_name]:
                avg_value = statistics.mean(component_averages[comp_name])
                thresholds = component.get("thresholds", {
                    'low': 30, 'medium': 60, 'high': 85, 'critical': 95
                })
                unit = component.get("unit", "%")
                
                # Calculer le risque
                risk = calculate_component_risk(avg_value, thresholds, unit)
                total_risk += risk
                component_count += 1
                
                # Ajouter la prédiction
                predictions.append({
                    'component': comp_name,
                    'componentType': component.get("type", "unknown"),
                    'risk_percent': round(risk, 2),
                    'value': round(avg_value, 2),
                    'unit': unit,
                    'message': get_component_message(comp_name, risk, avg_value, unit)
                })
        
        # Calculer la santé globale de la machine
        overall_health = 100 - (total_risk / component_count if component_count > 0 else 0)
        
        # Mettre à jour la santé globale dans la base de données
        machines_collection.update_one(
            {"_id": ObjectId(machine_id)},
            {"$set": {"overallHealth": round(overall_health, 2)}}
        )
        
        # Trier les prédictions par risque décroissant
        predictions.sort(key=lambda x: x['risk_percent'], reverse=True)
        
        # Stocker les prédictions dans la base de données
        for prediction in predictions:
            predictions_collection.insert_one({
                "machineId": machine_id,
                "component": prediction['component'],
                "risk_percent": prediction['risk_percent'],
                "value": prediction['value'],
                "unit": prediction['unit'],
                "message": prediction['message'],
                "createdAt": datetime.utcnow()
            })
        
        return jsonify({
            'machineId': machine_id,
            'machineName': machine.get("name", "Unknown"),
            'overallHealth': round(overall_health, 2),
            'predictions': predictions
        }), 200
        
    except Exception as e:
        print(f"Error in /api/predict-machine-failure: {e}")
        return jsonify({'error': str(e)}), 500

@app.route('/api/machine-metrics', methods=['POST'])
def receive_machine_metrics():
    """Endpoint pour recevoir les métriques des machines via MQTT"""
    try:
        data = request.get_json()
        
        if not data or "machineId" not in data:
            return jsonify({'error': 'Invalid data format'}), 400
            
        # Ajouter un timestamp si non présent
        if "timestamp" not in data:
            data["timestamp"] = time.time()
            
        # Insérer les métriques dans la base de données
        metrics_collection.insert_one(data)
        
        return jsonify({'status': 'success'}), 200
        
    except Exception as e:
        print(f"Error in /api/machine-metrics: {e}")
        return jsonify({'error': str(e)}), 500

@app.route('/api/health', methods=['GET'])
def health_check():
    return jsonify({
        'status': 'healthy',
        'timestamp': datetime.now().isoformat()
    }), 200

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)