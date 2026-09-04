import os
import cv2
import hashlib
import numpy as np
from typing import Dict, Any

class FaceService:
    # OpenCV Haar Cascade is bundled with opencv-python — zero downloads needed
    _cascade_path = cv2.data.haarcascades + "haarcascade_frontalface_default.xml"

    @staticmethod
    def extract_face(img_path: str) -> Dict[str, Any]:
        """
        Detects a face using OpenCV Haar Cascade (no model download needed).
        Generates a deterministic SHA-256-based pseudo-embedding for the pipeline.
        """
        try:
            abs_path = os.path.abspath(img_path)
            img = cv2.imread(abs_path)
            if img is None:
                return {"faceDetected": False, "error": "Could not read image file."}

            gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
            face_cascade = cv2.CascadeClassifier(FaceService._cascade_path)

            # scaleFactor and minNeighbors tuned for passport/selfie style photos
            faces = face_cascade.detectMultiScale(
                gray,
                scaleFactor=1.1,
                minNeighbors=4,
                minSize=(30, 30)
            )

            if len(faces) == 0:
                # Try with more relaxed params before giving up
                faces = face_cascade.detectMultiScale(
                    gray,
                    scaleFactor=1.05,
                    minNeighbors=2,
                    minSize=(20, 20)
                )

            if len(faces) == 0:
                return {"faceDetected": False, "error": "No face detected in image."}

            # Take the largest face
            faces_sorted = sorted(faces, key=lambda f: f[2] * f[3], reverse=True)
            x, y, w, h = faces_sorted[0]

            # Crop the face region and generate a deterministic embedding from its pixels
            face_crop = img[y:y+h, x:x+w]
            face_resized = cv2.resize(face_crop, (64, 64))
            face_bytes = face_resized.tobytes()
            
            # Produce a 128-dim pseudo-embedding from SHA-256 chunks
            embedding = []
            for i in range(128):
                chunk = face_bytes[i * (len(face_bytes) // 128): (i + 1) * (len(face_bytes) // 128)]
                h_val = int(hashlib.sha256(chunk).hexdigest(), 16)
                embedding.append((h_val % 20000) / 10000.0 - 1.0)  # normalise to [-1, 1]

            confidence = min(1.0, float(w * h) / (img.shape[0] * img.shape[1]) * 10)

            return {
                "faceDetected": True,
                "faceCount": len(faces),
                "boundingBox": {"x": int(x), "y": int(y), "w": int(w), "h": int(h)},
                "embeddingGenerated": True,
                "embeddingDimension": len(embedding),
                "detectionConfidence": round(confidence, 4)
            }

        except Exception as e:
            return {
                "faceDetected": False,
                "error": f"Unexpected error: {str(e)}"
            }
