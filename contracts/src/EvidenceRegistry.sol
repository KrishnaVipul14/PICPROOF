// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/**
 * @title EvidenceRegistry
 * @dev Immutable ledger for anchoring cryptographic hashes of photographic evidence.
 */
contract EvidenceRegistry {
    event EvidenceAnchored(
        bytes32 indexed evidenceHash,
        string evidenceId,
        uint256 timestamp
    );

    // Map evidence hash to whether it exists
    mapping(bytes32 => bool) public exists;
    
    // Map evidence hash to its associated ID
    mapping(bytes32 => string) public evidenceIds;
    
    // Map evidence hash to its timestamp
    mapping(bytes32 => uint256) public timestamps;

    /**
     * @dev Anchors a new evidence hash to the blockchain.
     * @param evidenceHash The SHA-256 hash of the canonical evidence manifest.
     * @param evidenceId The unique identifier of the evidence investigation.
     */
    function anchorEvidence(bytes32 evidenceHash, string calldata evidenceId) external {
        require(!exists[evidenceHash], "Evidence hash already anchored");

        exists[evidenceHash] = true;
        evidenceIds[evidenceHash] = evidenceId;
        timestamps[evidenceHash] = block.timestamp;

        emit EvidenceAnchored(evidenceHash, evidenceId, block.timestamp);
    }

    /**
     * @dev Retrieves the anchored evidence details.
     * @param evidenceHash The SHA-256 hash to query.
     */
    function getEvidence(bytes32 evidenceHash) external view returns (string memory id, uint256 timestamp) {
        require(exists[evidenceHash], "Evidence not found");
        return (evidenceIds[evidenceHash], timestamps[evidenceHash]);
    }
}
