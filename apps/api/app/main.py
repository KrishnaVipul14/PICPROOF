import os
import uuid
import hashlib
from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Dict, Any, List

from app.services.FaceService import FaceService
from app.providers.ReverseImageProvider import SerpApiReverseImageProvider, MockReverseImageProvider
from app.services.EvidenceNormalizer import EvidenceNormalizer
from app.services.EvidenceHasher import EvidenceHasher
from app.services.BlockchainService import BlockchainService

app = FastAPI(title="PICPROOF API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Temp storage for the hackathon (normally use DB + Cloud Storage)
STORE = {}
UPLOAD_DIR = "temp_uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)

blockchain_service = BlockchainService()

def get_search_provider():
    if os.getenv("REVERSE_IMAGE_API_KEY"):
        return SerpApiReverseImageProvider()
    return MockReverseImageProvider()

class DemoRequest(BaseModel):
    isDemo: bool = False

@app.post("/api/investigations")
async def create_investigation():
    investigation_id = str(uuid.uuid4())
    STORE[investigation_id] = {
        "status": "idle",
        "steps": []
    }
    return {"investigationId": investigation_id}

@app.post("/api/investigations/{investigation_id}/upload")
async def upload_image(investigation_id: str, file: UploadFile = File(...)):
    if investigation_id not in STORE:
        raise HTTPException(status_code=404, detail="Investigation not found")
        
    if file.content_type not in ["image/jpeg", "image/png"]:
        raise HTTPException(status_code=400, detail="Only JPEG and PNG allowed")
        
    file_path = os.path.join(UPLOAD_DIR, f"{investigation_id}_{file.filename}")
    content = await file.read()
    
    with open(file_path, "wb") as f:
        f.write(content)
        
    file_hash = hashlib.sha256(content).hexdigest()
    
    STORE[investigation_id]["imagePath"] = file_path
    STORE[investigation_id]["imageHash"] = file_hash
    STORE[investigation_id]["status"] = "uploaded"
    
    return {"success": True, "imageHash": file_hash}

@app.post("/api/investigations/{investigation_id}/face")
async def detect_face(investigation_id: str):
    if investigation_id not in STORE or "imagePath" not in STORE[investigation_id]:
         raise HTTPException(status_code=400, detail="Invalid investigation or missing image")
         
    result = FaceService.extract_face(STORE[investigation_id]["imagePath"])
    STORE[investigation_id]["faceResult"] = result
    
    return result

@app.post("/api/investigations/{investigation_id}/search")
async def reverse_search(investigation_id: str):
    if investigation_id not in STORE:
         raise HTTPException(status_code=404)
         
    # In a real app we'd pass the actual image URL or upload it temporarily
    # For demo mock purposes, if provider is mock, we just call search("")
    provider = get_search_provider()
    
    # We would need to host the image temporarily to use real SerpApi Google Lens,
    # or use an image that is already public.
    # For Hackathon, if real, we assume we might need a public URL. Let's pass a placeholder or the actual if hosted.
    # Since we are local, Google Lens can't read our localhost. We'll simulate passing a valid public image URL if real,
    # or just use the mock if not configured.
    
    try:
        # Example hardcoded public image for real serpapi test if local
        test_url = "https://raw.githubusercontent.com/serpapi/code-bug-tracker/master/apple.jpeg" 
        candidates = provider.search(test_url)
        STORE[investigation_id]["candidates"] = candidates
        return {"success": True, "candidates": candidates}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/investigations/{investigation_id}/evidence")
async def generate_evidence(investigation_id: str):
    if investigation_id not in STORE or "candidates" not in STORE[investigation_id]:
         raise HTTPException(status_code=400, detail="No search candidates found")
         
    candidates = STORE[investigation_id]["candidates"]
    if not candidates:
        raise HTTPException(status_code=404, detail="No matches to create evidence from")
        
    # Take the best match (first one)
    best_match = candidates[0]
    
    evidence = EvidenceNormalizer.normalize(
        best_match, 
        STORE[investigation_id]["imageHash"], 
        investigation_id
    )
    
    evidence_hash = EvidenceHasher.hash_evidence(evidence)
    
    STORE[investigation_id]["evidence"] = evidence
    STORE[investigation_id]["evidenceHash"] = evidence_hash
    
    return {"evidence": evidence, "evidenceHash": evidence_hash}

@app.post("/api/investigations/{investigation_id}/anchor")
async def anchor_evidence(investigation_id: str):
    if investigation_id not in STORE or "evidenceHash" not in STORE[investigation_id]:
        raise HTTPException(status_code=400, detail="No evidence to anchor")
        
    if not blockchain_service.is_connected():
        # Fallback to mock anchor if not configured
        return {
            "success": True,
            "transactionHash": "0xMockTransactionHash1234567890abcdef",
            "blockNumber": 123456,
            "contractAddress": "0xMockContractAddress",
            "mock": True
        }
        
    result = blockchain_service.anchor_evidence(
        STORE[investigation_id]["evidenceHash"], 
        investigation_id
    )
    
    if not result["success"]:
        raise HTTPException(status_code=500, detail=result["error"])
        
    STORE[investigation_id]["anchor"] = result
    return result

@app.get("/api/investigations/{investigation_id}")
async def get_investigation(investigation_id: str):
    if investigation_id not in STORE:
        raise HTTPException(status_code=404)
    # Don't return local file paths to frontend
    data = dict(STORE[investigation_id])
    data.pop("imagePath", None)
    return data

@app.post("/api/verify/test-tamper")
async def test_tamper(evidence: Dict[str, Any], originalHash: str):
    new_hash = EvidenceHasher.hash_evidence(evidence)
    return {
        "newHash": new_hash,
        "originalHash": originalHash,
        "isVerified": new_hash == originalHash
    }
