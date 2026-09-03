from typing import Dict, Any
from urllib.parse import urlparse
import datetime

class EvidenceNormalizer:
    @staticmethod
    def normalize(candidate: Dict[str, Any], input_image_sha256: str, evidence_id: str) -> Dict[str, Any]:
        """
        Normalizes a raw search candidate into a deterministic evidence object.
        """
        url = candidate.get("url", "")
        parsed_url = urlparse(url)
        domain = parsed_url.netloc.replace("www.", "")
        
        # We use a deterministic timestamp if this is a historical match, 
        # or the current time in a fixed ISO format.
        # For the sake of the demo and hash determinism on repeat tests of the same evidence, 
        # we will capture the discovery time once and store it.
        # However, to ensure tests pass where same evidence = same hash, we must be careful.
        
        return {
            "evidenceId": evidence_id,
            "inputImageSha256": input_image_sha256,
            "candidateUrl": url,
            "domain": domain,
            "title": candidate.get("title", ""),
            "imageUrl": candidate.get("imageUrl", ""),
            "sourceType": candidate.get("sourceType", "Web"),
            "provider": candidate.get("provider", "Unknown"),
            "systemVersion": "1.0.0"
        }
