# Architecture

PICPROOF uses a modular, multi-tier architecture to securely process photographic evidence and anchor it to an immutable blockchain ledger.

## Monorepo Structure

- `/apps/web`: Next.js frontend with Tailwind CSS and GSAP animations.
- `/apps/api`: FastAPI Python backend for processing faces, generating embeddings, querying reverse image search, and hashing.
- `/contracts`: Hardhat environment for the Solidity smart contract.

## Pipeline Flow

1. **Ingestion**: The user uploads an image via the Next.js frontend.
2. **Face Vectorization**: The FastAPI backend receives the image and uses `deepface` to detect faces and extract high-dimensional embeddings.
3. **Reverse Crawl**: The backend queries a reverse image search provider (e.g., Google Lens via SerpApi) using the image to find matching candidates.
4. **Evidence Corroboration**: The matches are normalized into a deterministic JSON object (`EvidenceManifest`).
5. **Digest Lock**: The canonical `EvidenceManifest` is hashed using SHA-256.
6. **On-Chain Notarization**: The hash is anchored to the `EvidenceRegistry` smart contract using `web3.py`.
