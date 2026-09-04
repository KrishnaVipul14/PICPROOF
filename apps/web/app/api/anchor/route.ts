import { NextRequest, NextResponse } from "next/server";
import { ethers } from "ethers";

// EvidenceRegistry ABI (only the functions we need)
const ABI = [
  "function anchorEvidence(bytes32 evidenceHash, string calldata evidenceId) external",
  "event EvidenceAnchored(bytes32 indexed evidenceHash, string evidenceId, uint256 timestamp)",
];

// Hardhat local node defaults — deterministic, always the same
const HARDHAT_RPC   = process.env.HARDHAT_RPC_URL   || "http://127.0.0.1:8545";
const HARDHAT_KEY   = process.env.HARDHAT_PRIVATE_KEY || "0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80";
const CONTRACT_ADDR = process.env.CONTRACT_ADDRESS   || "0x5FbDB2315678afecb367f032d93F642f64180aa3";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { evidenceHash, investigationId } = body;

    if (!evidenceHash || !investigationId) {
      return NextResponse.json({ error: "Missing evidenceHash or investigationId" }, { status: 400 });
    }

    // Connect to local Hardhat node
    const provider = new ethers.JsonRpcProvider(HARDHAT_RPC);
    const wallet   = new ethers.Wallet(HARDHAT_KEY, provider);
    const contract = new ethers.Contract(CONTRACT_ADDR, ABI, wallet);

    // Convert hex string evidence hash to bytes32
    // evidenceHash is a 64-char hex string, prefix with 0x
    const hashBytes = ("0x" + evidenceHash.replace("0x", "")) as `0x${string}`;

    // Submit real transaction to blockchain
    const tx = await contract.anchorEvidence(hashBytes, investigationId);
    const receipt = await tx.wait();

    const network = await provider.getNetwork();

    return NextResponse.json({
      success: true,
      txHash: receipt.hash,
      blockNumber: Number(receipt.blockNumber),
      network: `Hardhat Local (chainId: ${network.chainId})`,
      contractAddress: CONTRACT_ADDR,
      gasUsed: receipt.gasUsed?.toString(),
    });
  } catch (err: any) {
    // Friendly error — Hardhat node not running
    if (err.code === "ECONNREFUSED" || err.message?.includes("ECONNREFUSED") || err.message?.includes("connect")) {
      return NextResponse.json({
        error: "Hardhat node not running",
        hint: "Run: cd contracts && npx hardhat node  (in a separate terminal)",
      }, { status: 503 });
    }
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
