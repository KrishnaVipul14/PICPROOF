from deepface import DeepFace
import os

img_path = "D:\\HH_GOA_TASK3\\trust-trace\\apps\\api\\temp_uploads\\bd73b7a7-8f6d-477b-a85f-80b42debd5ec_Screenshot 2025-11-24 202107.png"

print("Checking path:", os.path.exists(img_path))

try:
    results = DeepFace.represent(img_path, model_name="Facenet", detector_backend="retinaface", enforce_detection=True)
    print("SUCCESS!")
    print(results)
except Exception as e:
    print("ERROR:")
    print(str(e))
    import traceback
    traceback.print_exc()
