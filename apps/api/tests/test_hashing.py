import pytest
from app.services.EvidenceHasher import EvidenceHasher

def test_same_evidence_same_hash():
    evidence1 = {
        "evidenceId": "123",
        "inputImageSha256": "abc",
        "candidateUrl": "https://x.com/test",
        "domain": "x.com",
        "title": "Test Title",
        "imageUrl": "https://img.com/a.jpg",
        "sourceType": "X",
        "provider": "Mock",
        "systemVersion": "1.0.0"
    }
    
    # Same data, different key order to ensure canonicalization works
    evidence2 = {
        "title": "Test Title",
        "domain": "x.com",
        "evidenceId": "123",
        "sourceType": "X",
        "inputImageSha256": "abc",
        "provider": "Mock",
        "systemVersion": "1.0.0",
        "candidateUrl": "https://x.com/test",
        "imageUrl": "https://img.com/a.jpg"
    }
    
    hash1 = EvidenceHasher.hash_evidence(evidence1)
    hash2 = EvidenceHasher.hash_evidence(evidence2)
    
    assert hash1 == hash2

def test_modified_evidence_different_hash():
    evidence1 = {
        "evidenceId": "123",
        "inputImageSha256": "abc",
        "title": "Test Title"
    }
    
    evidence2 = {
        "evidenceId": "123",
        "inputImageSha256": "abc",
        "title": "Test Title Mod"
    }
    
    hash1 = EvidenceHasher.hash_evidence(evidence1)
    hash2 = EvidenceHasher.hash_evidence(evidence2)
    
    assert hash1 != hash2
