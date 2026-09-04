import { NextRequest, NextResponse } from "next/server";
import { ethers } from "ethers";

// EvidenceRegistry ABI (only view function needed)
const ABI = [
  "function exists(bytes32) external view returns (bool)",
  "function getEvidence(bytes32 evidenceHash) external view returns (string memory id, uint256 timestamp)",
];

const HARDHAT_RPC   = process.env.HARDHAT_RPC_URL   || "http://127.0.0.1:8545";
const CONTRACT_ADDR = process.env.CONTRACT_ADDRESS   || "0x5FbDB2315678afecb367f032d93F642f64180aa3";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { evidenceHash } = body;

    if (!evidenceHash) {
      return NextResponse.json({ error: "Missing evidenceHash" }, { status: 400 });
    }

    const provider = new ethers.JsonRpcProvider(HARDHAT_RPC);
    const contract = new ethers.Contract(CONTRACT_ADDR, ABI, provider);

    const hashBytes = ("0x" + evidenceHash.replace("0x", "")) as `0x${string}`;

    // Check if the hash exists on chain
    const onChain: boolean = await contract.exists(hashBytes);

    if (!onChain) {
      return NextResponse.json({ verified: false, message: "Hash not found on chain" });
    }

    // Retrieve the anchored record
    const [id, timestamp] = await contract.getEvidence(hashBytes);

    return NextResponse.json({
      verified: true,
      investigationId: id,
      anchoredAt: new Date(Number(timestamp) * 1000).toISOString(),
      contractAddress: CONTRACT_ADDR,
      evidenceHash,
    });
  } catch (err: any) {
    if (err.code === "ECONNREFUSED" || err.message?.includes("ECONNREFUSED") || err.message?.includes("connect")) {
      return NextResponse.json({
        error: "Hardhat node not running",
        hint: "Run: cd contracts && npx hardhat node",
      }, { status: 503 });
    }
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
