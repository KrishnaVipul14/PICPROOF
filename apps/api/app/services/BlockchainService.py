import os
from web3 import Web3
from typing import Dict, Any, Tuple

class BlockchainService:
    def __init__(self):
        self.rpc_url = os.getenv("BLOCKCHAIN_RPC_URL")
        self.private_key = os.getenv("BLOCKCHAIN_PRIVATE_KEY")
        self.contract_address = os.getenv("CONTRACT_ADDRESS")
        
        if self.rpc_url:
            self.w3 = Web3(Web3.HTTPProvider(self.rpc_url))
        else:
            self.w3 = None
            
        # Minimal ABI for EvidenceRegistry
        self.abi = [
            {
                "inputs": [
                    {"internalType": "bytes32", "name": "evidenceHash", "type": "bytes32"},
                    {"internalType": "string", "name": "evidenceId", "type": "string"}
                ],
                "name": "anchorEvidence",
                "outputs": [],
                "stateMutability": "nonpayable",
                "type": "function"
            },
            {
                "inputs": [
                    {"internalType": "bytes32", "name": "evidenceHash", "type": "bytes32"}
                ],
                "name": "getEvidence",
                "outputs": [
                    {"internalType": "string", "name": "id", "type": "string"},
                    {"internalType": "uint256", "name": "timestamp", "type": "uint256"}
                ],
                "stateMutability": "view",
                "type": "function"
            },
            {
                "inputs": [
                    {"internalType": "bytes32", "name": "", "type": "bytes32"}
                ],
                "name": "exists",
                "outputs": [
                    {"internalType": "bool", "name": "", "type": "bool"}
                ],
                "stateMutability": "view",
                "type": "function"
            }
        ]

    def is_connected(self) -> bool:
        return self.w3 is not None and self.w3.is_connected()

    def anchor_evidence(self, evidence_hash: str, evidence_id: str) -> Dict[str, Any]:
        """
        Anchors the hash to the blockchain.
        evidence_hash must be a hex string (with or without 0x) of 32 bytes (64 hex chars).
        """
        if not self.is_connected():
            return {"success": False, "error": "Not connected to blockchain testnet."}
            
        if not self.private_key or not self.contract_address:
            return {"success": False, "error": "Missing contract address or private key."}
            
        try:
            account = self.w3.eth.account.from_key(self.private_key)
            contract = self.w3.eth.contract(address=self.contract_address, abi=self.abi)
            
            # Ensure 0x prefix for bytes32
            if not evidence_hash.startswith("0x"):
                evidence_hash = "0x" + evidence_hash
                
            hash_bytes = self.w3.to_bytes(hexstr=evidence_hash)
            
            # Check if exists
            exists = contract.functions.exists(hash_bytes).call()
            if exists:
                return {"success": False, "error": "Evidence already anchored."}

            nonce = self.w3.eth.get_transaction_count(account.address)
            
            # Build transaction
            tx = contract.functions.anchorEvidence(hash_bytes, evidence_id).build_transaction({
                'chainId': self.w3.eth.chain_id,
                'gas': 2000000,
                'gasPrice': self.w3.eth.gas_price,
                'nonce': nonce,
            })
            
            # Sign and send
            signed_tx = self.w3.eth.account.sign_transaction(tx, private_key=self.private_key)
            tx_hash = self.w3.eth.send_raw_transaction(signed_tx.rawTransaction)
            
            # Wait for receipt
            receipt = self.w3.eth.wait_for_transaction_receipt(tx_hash, timeout=120)
            
            return {
                "success": True,
                "transactionHash": tx_hash.hex(),
                "blockNumber": receipt.blockNumber,
                "contractAddress": self.contract_address
            }
            
        except Exception as e:
            return {"success": False, "error": str(e)}

    def verify_evidence(self, evidence_hash: str) -> Dict[str, Any]:
        """
        Checks if the evidence hash exists on-chain.
        """
        if not self.is_connected():
             return {"success": False, "error": "Not connected to blockchain."}
             
        try:
             contract = self.w3.eth.contract(address=self.contract_address, abi=self.abi)
             
             if not evidence_hash.startswith("0x"):
                evidence_hash = "0x" + evidence_hash
             hash_bytes = self.w3.to_bytes(hexstr=evidence_hash)
             
             exists = contract.functions.exists(hash_bytes).call()
             if not exists:
                 return {"success": True, "anchored": False}
                 
             evidence_id, timestamp = contract.functions.getEvidence(hash_bytes).call()
             
             return {
                 "success": True,
                 "anchored": True,
                 "evidenceId": evidence_id,
                 "timestamp": timestamp
             }
        except Exception as e:
             return {"success": False, "error": str(e)}
