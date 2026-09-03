# Privacy & Security

## Data Minimization

TRUST//TRACE is designed with strict data minimization principles:

1. **No On-Chain Biometrics**: We NEVER store raw images or facial embeddings on the blockchain. The blockchain only stores the SHA-256 hash of the evidence manifest.
2. **Ephemeral Processing**: Images uploaded for processing are stored temporarily in `temp_uploads/` and should be purged periodically.
3. **Deterministic Hashing**: We hash a normalized metadata object, ensuring privacy while maintaining tamper-evidence.

## Cryptographic Guarantees

The blockchain anchors the integrity of the evidence record. It does NOT prove the absolute truth of the underlying claim, but it mathematically guarantees that the metadata presented has not been altered since the moment of anchoring.
