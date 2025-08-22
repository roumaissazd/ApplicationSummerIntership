import cv2
from deepface import DeepFace
from pymongo import MongoClient

MONGO_URI = "mongodb://localhost:27017"
DB_NAME = "dashboardDB"
client = MongoClient(MONGO_URI)
db = client[DB_NAME]
users_collection = db["users"]

face_cascade = cv2.CascadeClassifier(cv2.data.haarcascades + 'haarcascade_frontalface_default.xml')

# Récupérer tous les utilisateurs avec leur image
users = list(users_collection.find({}, {"name": 1, "faceImage": 1}))

cap = cv2.VideoCapture(0)
if not cap.isOpened():
    print("Erreur : Impossible d'ouvrir la webcam.")
    exit()

print("Appuyez sur 'q' pour quitter.")

max_attempts = 100
attempts = 0
verify_count = 0
verify_threshold = 3
distance_threshold = 0.4

while True:
    ret, frame = cap.read()
    if not ret:
        print("Erreur : Impossible de capturer une image.")
        break

    gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
    faces = face_cascade.detectMultiScale(gray, scaleFactor=1.1, minNeighbors=5, minSize=(30, 30))

    recognized = False
    for (x, y, w, h) in faces:
        face_region = frame[y:y+h, x:x+w]

        for user in users:
            try:
                result = DeepFace.verify(face_region, user["faceImage"])
                if result["verified"] and result["distance"] < distance_threshold:
                    verify_count += 1
                    print(f"Utilisateur {user['name']} reconnu {verify_count}/{verify_threshold} fois")
                    if verify_count >= verify_threshold:
                        recognized = True
                        print(f"Connexion réussie pour {user['name']}")
                        break
                else:
                    verify_count = 0
            except Exception as e:
                print(f"Erreur DeepFace : {e}")

        if recognized:
            break

    cv2.imshow('Reconnaissance Faciale', frame)

    if not recognized:
        attempts += 1
        if attempts >= max_attempts:
            print("Échec de la reconnaissance. Essayez le mot de passe.")
            break

    if recognized:
        break

    if cv2.waitKey(1) & 0xFF == ord('q'):
        break

cap.release()
cv2.destroyAllWindows()
