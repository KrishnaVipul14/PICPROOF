import os
from deepface import DeepFace
from typing import Dict, Any

class FaceService:
    @staticmethod
    def extract_face(img_path: str) -> Dict[str, Any]:
        """
        Detects a face in the image and generates an embedding.
        Returns a structured result.
        """
        try:
            # We use enforce_detection=True to ensure a face is found
            # deepface.represent returns a list of faces found.
            # We take the first one.
            results = DeepFace.represent(img_path, model_name="Facenet", enforce_detection=True)
            
            if not results:
                return {
                    "faceDetected": False,
                    "error": "No faces found."
                }
                
            face = results[0]
            
            return {
                "faceDetected": True,
                "faceCount": len(results),
                "boundingBox": face.get("facial_area", {}),
                "embeddingGenerated": True,
                "embeddingDimension": len(face.get("embedding", [])),
                "detectionConfidence": face.get("face_confidence", 0.0)
            }
        except ValueError as e:
             # DeepFace throws ValueError if face is not found when enforce_detection is True
             return {
                 "faceDetected": False,
                 "error": str(e)
             }
        except Exception as e:
            return {
                "faceDetected": False,
                "error": f"Unexpected error: {str(e)}"
            }
