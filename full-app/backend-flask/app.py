from flask import Flask, request, jsonify
from pymongo import MongoClient
from flask_cors import CORS
from bson.objectid import ObjectId
from deepface import DeepFace
import cv2
import numpy as np
import base64
import os
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
