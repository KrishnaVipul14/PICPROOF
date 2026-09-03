import hashlib
import json
from typing import Dict, Any

class EvidenceHasher:
    @staticmethod
    def hash_evidence(evidence: Dict[str, Any]) -> str:
        """
        Computes a deterministic SHA-256 hash of the evidence object.
        """
        canonical_evidence = EvidenceHasher._canonicalize(evidence)
        # Encode as UTF-8
        encoded_evidence = canonical_evidence.encode("utf-8")
        
        return hashlib.sha256(encoded_evidence).hexdigest()

    @staticmethod
    def _canonicalize(evidence: Dict[str, Any]) -> str:
        """
        Sorts keys, normalizes values to create a deterministic JSON string.
        """
        # Remove any None or empty values if strictly required, but usually 
        # standardizing to JSON with sorted keys is enough for determinism.
        clean_evidence = {k: v for k, v in evidence.items() if v is not None}
        
        # separators=(',', ':') removes whitespace around commas and colons
        return json.dumps(clean_evidence, sort_keys=True, separators=(',', ':'))
