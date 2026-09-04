# PICPROOF — Face Identification & Blockchain Verification

**Hacker House Goa 2026 · Task 3**

> From Pixels to Proof. A pipeline that takes a face image as input, searches the web for matching public content, and anchors cryptographic proof of the discovered evidence to a blockchain.

---

## Pipeline

```
Face Image Input
      ↓
Face Detection & Encoding (Canvas API — brightness, sharpness, skin analysis, 128-dim embedding)
      ↓
Reverse Image Search (SerpApi Google Lens — real, live web crawl, not hardcoded)
      ↓
SHA-256 Evidence Manifest (hash of image fingerprint + search results + metadata)
      ↓
Blockchain Anchor (EvidenceRegistry.sol on Hardhat local node via ethers.js)
      ↓
On-Chain Re-Verification (getEvidence() call proves hash exists immutably)
```

---

## How to Run

### Prerequisites

- Node.js 18+
- Python 3.10+ (optional — only needed if running the legacy FastAPI backend)

### Step 1 — Install dependencies

```bash
# Frontend
cd apps/web
npm install

# Contracts
cd ../../contracts
npm install
```

### Step 2 — Start the Hardhat local blockchain (Terminal 1)

```bash
cd contracts
npx hardhat node
```

This starts a local EVM node at `http://127.0.0.1:8545` with 20 pre-funded test accounts.

### Step 3 — Deploy the smart contract (Terminal 2)

```bash
cd contracts
npx hardhat run scripts/deploy.ts --network localhost
```

The contract will always deploy to `0x5FbDB2315678afecb367f032d93F642f64180aa3` (deterministic, account 0, nonce 0). The deploy script prints this address and saves it to `contracts/deployments/localhost.json`.

### Step 4 — Configure environment

Create `apps/web/.env.local`:

```env
# Required for real reverse image search (free tier: 100 searches/month)
SERPAPI_KEY=your_serpapi_key_here

# Hardhat local node (defaults already correct — only change if needed)
HARDHAT_RPC_URL=http://127.0.0.1:8545
HARDHAT_PRIVATE_KEY=0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80
CONTRACT_ADDRESS=0x5FbDB2315678afecb367f032d93F642f64180aa3
```

Get a free SerpApi key at [serpapi.com](https://serpapi.com/) (100 searches/month, no credit card).

### Step 5 — Start the frontend (Terminal 3)

```bash
cd apps/web
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## Demo Flow

1. Open the app and click **🔍 Verify an Image**
2. Upload any face photo (drag & drop or click)
3. Click **Start Verification**
4. Watch the 4-step pipeline run live:
   - **Step 01 — Ingest**: SHA-256 fingerprint of the image computed in-browser
   - **Step 02 — Vectorize**: Face detected, 128-dim embedding generated (brightness, sharpness, skin analysis)
   - **Step 03 — Crawl**: Image uploaded to a temp host → SerpApi Google Lens searches the web for matching public pages
   - **Step 04 — Anchor**: Evidence manifest hashed (SHA-256) → `anchorEvidence()` called on `EvidenceRegistry.sol` → real transaction written to Hardhat local chain
5. Click **🔍 Re-Verify on Chain** to call `getEvidence()` and prove the hash exists immutably

---

## Blockchain

- **Chain**: Hardhat local node (EVM-compatible, simulated — as permitted by task requirements)
- **Contract**: `EvidenceRegistry.sol` at `contracts/src/EvidenceRegistry.sol`
- **Address**: `0x5FbDB2315678afecb367f032d93F642f64180aa3` (deterministic)
- **Functions used**:
  - `anchorEvidence(bytes32 hash, string investigationId)` — stores hash immutably
  - `getEvidence(bytes32 hash)` — retrieves stored record for re-verification
  - `exists(bytes32 hash)` — boolean check for re-verification
- **Library**: `ethers.js v6` (via Next.js API routes)

---

## Project Structure

```
trust-trace/
├── apps/
│   └── web/                      # Next.js 16 frontend (deployed demo)
│       ├── app/
│       │   ├── page.tsx           # Landing page
│       │   ├── investigation/     # Main pipeline UI
│       │   └── api/
│       │       ├── search/        # Reverse image search (SerpApi Google Lens)
│       │       ├── anchor/        # Real blockchain write (ethers.js → Hardhat)
│       │       └── verify/        # On-chain re-verification
│       └── .env.local             # Your API keys (not committed)
├── contracts/
│   ├── src/EvidenceRegistry.sol  # Solidity smart contract
│   ├── scripts/deploy.ts          # Deploy + save address
│   └── hardhat.config.ts
└── README.md
```

---

## Known Limitations

- **Face detection**: Uses Canvas API pixel analysis (skin tone ratio, brightness variance, edge density) rather than a deep learning model. Confidence scores are image-derived metrics, not true face recognition similarity scores. No biometric database is queried.
- **Reverse image search**: Requires a SerpApi key. Without it, the search step is skipped and the pipeline completes with only the hash + blockchain anchor. The search returns *visually similar* images, not necessarily identity matches.
- **Blockchain**: Uses a local Hardhat simulation (chainId 31337) rather than a live public testnet. The chain resets on restart — anchored hashes are lost. For production, deploy to Sepolia using the existing Hardhat config.
- **Image hosting**: Uploaded images are temporarily hosted on `uguu.se` (72-hour retention) solely to provide Google Lens with a public URL. No image data is stored by this application.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 16, TypeScript, Tailwind CSS, GSAP |
| Face Analysis | Browser Canvas API |
| Reverse Search | SerpApi Google Lens API |
| Blockchain | Hardhat (local EVM), Solidity 0.8.24, ethers.js v6 |
| Hashing | SHA-256 (browser crypto + manifest) |
