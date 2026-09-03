# Reverse Image Search Integration

This project is designed to integrate with a genuine reverse image search API.

## Implementation Details

We use an abstract `ReverseImageProvider` class.
The primary implementation targets Google Lens via SerpApi. This provider accepts an image URL, queries Google's visual match index, and returns structured data containing:
- Source URL
- Thumbnail
- Page Title
- Domain

## Mock Fallback

For demo purposes or if an API key is not provided, the application falls back to a `MockReverseImageProvider`. This returns a deterministic, hardcoded social media match to demonstrate the pipeline flow without requiring external API access.

## Limitations

True reverse image search requires the image to be publicly accessible via URL. For local uploads, the image would normally be uploaded to a temporary cloud bucket before querying the provider. In this hackathon scope, we mock the URL passing or assume the image is already hosted.
