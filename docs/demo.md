# Demo Walkthrough

The project includes an interactive demonstration designed for a 90-second pitch.

## Flow

1. **Upload (0-10s)**: User uploads a candidate image.
2. **Pipeline Execution (10-65s)**: The UI visually tracks the backend progress:
   - Detecting Face (Extracting embeddings)
   - Reverse Crawl (Querying SerpApi or Mock)
   - Evidence Corroboration (Normalizing matches)
   - Cryptographic Anchor (Hashing and signing tx to testnet)
3. **Verification (65-75s)**: The evidence is confirmed anchored with a transaction hash.
4. **Tamper Test (75-90s)**: Navigating to `/judge`, the user can flip a single piece of metadata in the payload, causing the SHA-256 hash to change and the integrity check to immediately fail.

## Live Mode vs. Demo Fixture

If `REVERSE_IMAGE_API_KEY` and `BLOCKCHAIN_PRIVATE_KEY` are provided in the `.env` file, the application runs in **Live Mode** with real API calls.
Otherwise, it automatically uses the **Demo Fixture** fallback to ensure a smooth hackathon presentation.
