import requests
import cv2
import base64
import json

# Capturer une image de test
cap = cv2.VideoCapture(0)
ret, frame = cap.read()
cap.release()

if ret:
    # Encoder l'image
    _, buffer = cv2.imencode('.jpg', frame)
    frame_base64 = base64.b64encode(buffer).decode('utf-8')
    
    # Démarrer une session
    response = requests.post('http://localhost:5000/api/start-recognition')
    session_data = response.json()
    session_id = session_data['session_id']
    
    print(f"Session ID: {session_id}")
    
    # Tester la reconnaissance
    response = requests.post('http://localhost:5000/api/verify-face', json={
        'session_id': session_id,
        'frame': frame_base64
    })
    
    result = response.json()
    print(f"Result: {json.dumps(result, indent=2)}")
else:
    print("Impossible de capturer une image")