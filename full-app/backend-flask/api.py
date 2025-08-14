from flask import Flask, request, jsonify
from flask_cors import CORS
import cv2
import numpy as np
from deepface import DeepFace
import base64
import os
import sqlite3
from datetime import datetime
import time
import glob

app = Flask(__name__)
CORS(app)  # Ajouter CORS

# Vos variables globales
UPLOADS_FOLDER = '../Backend/uploads'
face_cascade = cv2.CascadeClassifier(cv2.data.haarcascades + 'haarcascade_frontalface_default.xml')
active_sessions = {}

class FaceRecognitionAPI:
    def __init__(self):
        self.face_cascade = cv2.CascadeClassifier(cv2.data.haarcascades + 'haarcascade_frontalface_default.xml')
        self.active_sessions = {}
        self.db_path = 'face_recognition.db'
        self.init_database()
        
    def init_database(self):
        """Initialize SQLite database for storing user face data"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS users (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                username TEXT UNIQUE NOT NULL,
                email TEXT UNIQUE,
                face_image_path TEXT NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                last_login TIMESTAMP,
                is_active BOOLEAN DEFAULT 1
            )
        ''')
        
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS login_attempts (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id INTEGER,
                success BOOLEAN,
                timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                ip_address TEXT,
                FOREIGN KEY (user_id) REFERENCES users (id)
            )
        ''')
        
        conn.commit()
        conn.close()
    
    def get_user_face_image(self, user_id):
        """Get user's face image path from database"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        cursor.execute('SELECT face_image_path FROM users WHERE id = ? AND is_active = 1', (user_id,))
        result = cursor.fetchone()
        conn.close()
        
        return result[0] if result else None
    
    def log_attempt(self, user_id, success, ip_address):
        """Log login attempt to database"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        cursor.execute('''
            INSERT INTO login_attempts (user_id, success, ip_address)
            VALUES (?, ?, ?)
        ''', (user_id, success, ip_address))
        
        if success:
            cursor.execute('''
                UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE id = ?
            ''', (user_id,))
        
        conn.commit()
        conn.close()

face_api = FaceRecognitionAPI()

def find_matching_user(face_region, distance_threshold):
    """Find matching user in database"""
    try:
        conn = sqlite3.connect(face_api.db_path)
        cursor = conn.cursor()
        
        cursor.execute('SELECT id, username, face_image_path FROM users WHERE is_active = 1')
        users = cursor.fetchall()
        conn.close()
        
        for user_id, username, face_image_path in users:
            if os.path.exists(face_image_path):
                try:
                    result = DeepFace.verify(face_region, face_image_path)
                    if result["verified"] and result["distance"] < distance_threshold:
                        return {'user_id': user_id, 'username': username}
                except Exception as e:
                    print(f"Error comparing with user {username}: {e}")
                    continue
        
        return None
        
    except Exception as e:
        print(f"Error in find_matching_user: {e}")
        return None

@app.route('/api/register-user', methods=['POST'])
def register_user():
    """Register a new user with face image"""
    try:
        data = request.get_json()
        username = data.get('username')
        email = data.get('email')
        face_image_base64 = data.get('face_image')
        
        if not username or not face_image_base64:
            return jsonify({'error': 'Username and face_image are required'}), 400
        
        # Decode base64 image
        image_data = base64.b64decode(face_image_base64)
        
        # Dossier où stocker les images utilisateurs
        base_upload_dir = r"C:\Users\rouzd\Desktop\intership\Backend\uploads"
        user_dir = os.path.join(base_upload_dir, username)
        os.makedirs(user_dir, exist_ok=True)
        
        # Chemin complet de l'image
        image_path = os.path.join(user_dir, "face.jpg")
        with open(image_path, 'wb') as f:
            f.write(image_data)
        
        # Save to database
        conn = sqlite3.connect(face_api.db_path)
        cursor = conn.cursor()
        
        cursor.execute('''
            INSERT INTO users (username, email, face_image_path)
            VALUES (?, ?, ?)
        ''', (username, email, image_path))
        
        user_id = cursor.lastrowid
        conn.commit()
        conn.close()
        
        return jsonify({
            'success': True,
            'user_id': user_id,
            'message': 'User registered successfully'
        }), 201
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/start-recognition', methods=['POST'])
def start_recognition():
    """Start face recognition session without knowing user_id"""
    try:
        print("=== START RECOGNITION CALLED ===")
        data = request.get_json()
        print(f"Received data: {data}")
        
        # Generate session ID without user_id
        session_id = f"session_unknown_{int(time.time())}"
        print(f"Generated session_id: {session_id}")
        
        # Initialize session for unknown user
        active_sessions[session_id] = {
            'user_id': None,
            'verify_count': 0,
            'verify_threshold': 3,
            'distance_threshold': 0.4,
            'max_attempts': 50,
            'attempts': 0,
            'status': 'active'
        }
        
        print("Session created successfully")
        return jsonify({
            'success': True,
            'session_id': session_id,
            'message': 'Recognition session started'
        }), 200
        
    except Exception as e:
        print(f"Error in start_recognition: {e}")
        return jsonify({'error': str(e)}), 500

@app.route('/api/verify-face', methods=['POST'])
def verify_face():
    """Verify face against all registered users"""
    try:
        data = request.get_json()
        session_id = data.get('session_id')
        frame_base64 = data.get('frame')
        
        if not session_id or not frame_base64:
            return jsonify({'error': 'session_id and frame are required'}), 400
        
        if session_id not in active_sessions:
            return jsonify({'error': 'Invalid session_id'}), 404
        
        session = active_sessions[session_id]
        session['attempts'] += 1
        
        # Decode frame
        frame_data = base64.b64decode(frame_base64)
        nparr = np.frombuffer(frame_data, np.uint8)
        frame = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
        
        # Detect faces
        gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
        faces = face_cascade.detectMultiScale(gray, scaleFactor=1.1, minNeighbors=5, minSize=(30, 30))
        
        if len(faces) == 0:
            return jsonify({
                'success': False,
                'message': 'Aucun visage détecté',
                'attempts': session['attempts']
            }), 200
        
        # Process first detected face
        x, y, w, h = faces[0]
        face_region = frame[y:y+h, x:x+w]
        
        # Find matching user
        matched_user = find_matching_user(face_region, session['distance_threshold'])
        
        if matched_user:
            session['verify_count'] += 1
            session['user_id'] = matched_user['user_id']
            
            if session['verify_count'] >= session['verify_threshold']:
                return jsonify({
                    'success': True,
                    'authenticated': True,
                    'message': 'Reconnaissance faciale réussie !',
                    'user_id': matched_user['user_id']
                }), 200
            else:
                return jsonify({
                    'success': True,
                    'authenticated': False,
                    'message': f'Visage reconnu {session["verify_count"]}/{session["verify_threshold"]} fois',
                    'verify_count': session['verify_count']
                }), 200
        else:
            session['verify_count'] = 0
        
        # Check max attempts
        if session['attempts'] >= session['max_attempts']:
            return jsonify({
                'success': False,
                'authenticated': False,
                'message': 'Nombre maximum de tentatives atteint',
                'fallback_required': True
            }), 200
        
        return jsonify({
            'success': True,
            'authenticated': False,
            'message': f'Visage non reconnu (tentative {session["attempts"]}/{session["max_attempts"]})',
            'attempts': session['attempts']
        }), 200
        
    except Exception as e:
        print(f"Error in verify_face: {e}")
        return jsonify({'error': str(e)}), 500

@app.route('/api/end-session', methods=['POST'])
def end_session():
    """End recognition session"""
    try:
        data = request.get_json()
        session_id = data.get('session_id')
        
        if not session_id:
            return jsonify({'error': 'session_id is required'}), 400
        
        if session_id in active_sessions:
            del active_sessions[session_id]
            return jsonify({'success': True, 'message': 'Session ended'}), 200
        else:
            return jsonify({'error': 'Session not found'}), 404
            
    except Exception as e:
        print(f"Error in end_session: {e}")
        return jsonify({'error': str(e)}), 500

@app.route('/api/users', methods=['GET'])
def get_users():
    """Get all registered users"""
    try:
        conn = sqlite3.connect(face_api.db_path)
        cursor = conn.cursor()
        
        cursor.execute('''
            SELECT id, username, email, created_at, last_login, is_active
            FROM users
        ''')
        
        users = []
        for row in cursor.fetchall():
            users.append({
                'id': row[0],
                'username': row[1],
                'email': row[2],
                'created_at': row[3],
                'last_login': row[4],
                'is_active': bool(row[5])
            })
        
        conn.close()
        
        return jsonify({'users': users}), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        'status': 'healthy',
        'active_sessions': len(face_api.active_sessions),
        'timestamp': datetime.now().isoformat()
    }), 200

if __name__ == '__main__':
    print("Starting Flask API on http://localhost:5000")
    app.run(host='0.0.0.0', port=5000, debug=True)
