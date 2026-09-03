import os
import requests
from typing import List, Dict, Any
from abc import ABC, abstractmethod

class ReverseImageProvider(ABC):
    @abstractmethod
    def search(self, image_url: str) -> List[Dict[str, Any]]:
        pass

class SerpApiReverseImageProvider(ReverseImageProvider):
    def __init__(self):
        self.api_key = os.getenv("REVERSE_IMAGE_API_KEY")
        
    def search(self, image_url: str) -> List[Dict[str, Any]]:
        if not self.api_key:
            raise ValueError("REVERSE_IMAGE_API_KEY is not set.")
            
        params = {
            "engine": "google_lens",
            "url": image_url,
            "api_key": self.api_key
        }
        
        response = requests.get("https://serpapi.com/search", params=params)
        response.raise_for_status()
        
        data = response.json()
        
        candidates = []
        
        # Parse Google Lens visual matches
        if "visual_matches" in data:
            for match in data["visual_matches"]:
                candidates.append({
                    "url": match.get("link", ""),
                    "title": match.get("title", ""),
                    "imageUrl": match.get("thumbnail", ""),
                    "sourceType": self._determine_source_type(match.get("link", "")),
                    "provider": "Google Lens (SerpApi)"
                })
                
        return candidates
        
    def _determine_source_type(self, url: str) -> str:
        if "instagram.com" in url:
            return "Instagram"
        if "twitter.com" in url or "x.com" in url:
            return "X"
        if "facebook.com" in url:
            return "Facebook"
        if "tiktok.com" in url:
            return "TikTok"
        if "reddit.com" in url:
            return "Reddit"
        if "linkedin.com" in url:
            return "LinkedIn"
        return "Web"

class MockReverseImageProvider(ReverseImageProvider):
    """Fallback provider for DEMO FIXTURE when no API key is available."""
    def search(self, image_url: str) -> List[Dict[str, Any]]:
        return [{
            "url": "https://x.com/demo_user/status/123456789",
            "title": "A photo of someone at Hacker House Goa",
            "imageUrl": "https://pbs.twimg.com/media/demo.jpg",
            "sourceType": "X",
            "provider": "Mock Provider"
        }]
