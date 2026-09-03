# TRUST//TRACE

**FROM PIXELS TO PROOF.**

TRUST//TRACE is a pipeline that processes candidate images, extracts biometric facial vectors, corroborates origins via reverse-image search, and anchors cryptographic proofs to an immutable blockchain ledger.

## Features

- **Face Detection**: Uses AI to detect faces and generate embeddings.
- **Reverse Image Search**: Integrates with real reverse image search to find public/social media matching evidence.
- **Evidence Corroboration**: Consolidates matches into a normalized, canonical manifest.
- **Cryptographic Hashing**: Deterministic SHA-256 hashing of the manifest.
- **Blockchain Anchoring**: Immutably notarizes the hash onto an EVM-compatible testnet.
- **Tamper Verification**: Interactive "1-Pixel Tamper" lab to demonstrate cryptographic avalanche.

## Project Structure

- `apps/web`: Next.js frontend (Neo-brutalist styling).
- `apps/api`: FastAPI backend.
- `contracts`: Hardhat environment and Solidity smart contract.
- `docs/`: Extensive documentation.

## Setup Instructions

### Environment Variables

Copy `.env.example` to `.env` in the root directory (or respective app directories) and fill in the details.

```env
# apps/api/.env
REVERSE_IMAGE_API_KEY=your_serpapi_key
BLOCKCHAIN_RPC_URL=your_sepolia_rpc_url
BLOCKCHAIN_PRIVATE_KEY=your_private_key
CONTRACT_ADDRESS=deployed_contract_address

# apps/web/.env
NEXT_PUBLIC_API_URL=http://localhost:8000
```

### Running the Backend

```bash
cd apps/api
python -m venv .venv
source .venv/bin/activate # or .\.venv\Scripts\activate on Windows
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

### Running the Frontend

```bash
cd apps/web
npm install
npm run dev
```

### Deploying the Smart Contract

```bash
cd contracts
npm install
npx hardhat compile
# Configure hardhat.config.ts with your RPC and private key
npx hardhat run scripts/deploy.ts --network sepolia
```

## Security & Privacy

We do NOT store biometric embeddings on the blockchain. Only the SHA-256 digest of the textual evidence manifest is anchored. See `docs/privacy.md` for more details.

## Known Limitations

- Real reverse image search requires the input image to be publicly accessible. For local uploads, a cloud-storage intermediary would be required in production.
- Face detection models require sufficient lighting and resolution.

## Team

Built for Hacker House Goa.
