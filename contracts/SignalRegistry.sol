// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

/**
 * @title Greed Signal Registry
 * @notice On-chain registry for Yoree Signal Market signals on Monad Testnet.
 *         Every signal created in the app gets a verifiable on-chain record.
 *
 *         Signal hash = keccak256(hypothesis + creator + timestamp)
 *         This makes every signal immutable and auditable.
 */
contract SignalRegistry {
    // ──────────────────────────────────────────────
    // Types
    // ──────────────────────────────────────────────

    struct SignalRecord {
        bytes32 signalHash;       // keccak256 of signal data
        address creator;          // wallet that registered
        uint8   quality;          // 0-100
        uint8   sentiment;        // 0=neutral, 1=bullish, 2=bearish
        uint32  assetCount;       // number of discovered assets
        uint64  timestamp;        // block timestamp at registration
        bool    isPrivate;        // routed through Unlink privacy layer
        string  source;           // e.g. "pipeline", "create", "agent"
    }

    // ──────────────────────────────────────────────
    // State
    // ──────────────────────────────────────────────

    uint256 public nextSignalId;
    mapping(uint256 => SignalRecord) public signals;
    mapping(address => uint256[]) public creatorSignals;
    mapping(bytes32 => uint256) public hashToId;

    // Stats
    uint256 public totalRegistered;
    uint256 public totalPrivate;

    // ──────────────────────────────────────────────
    // Events
    // ──────────────────────────────────────────────

    event SignalRegistered(
        uint256 indexed signalId,
        bytes32 indexed signalHash,
        address indexed creator,
        uint8 quality,
        uint8 sentiment,
        uint32 assetCount,
        bool isPrivate,
        string source
    );

    event QualityUpdated(
        uint256 indexed signalId,
        uint8 oldQuality,
        uint8 newQuality
    );

    // ──────────────────────────────────────────────
    // Core Functions
    // ──────────────────────────────────────────────

    /**
     * @notice Register a new signal on-chain
     * @param signalHash   keccak256 hash of the signal data
     * @param quality      Signal quality score 0-100
     * @param sentiment    0=neutral, 1=bullish, 2=bearish
     * @param assetCount   Number of discovered assets
     * @param isPrivate    Whether the signal was routed through Unlink
     * @param source       Origin of the signal ("pipeline", "create", etc.)
     * @return signalId    The on-chain ID of the registered signal
     */
    function registerSignal(
        bytes32 signalHash,
        uint8 quality,
        uint8 sentiment,
        uint32 assetCount,
        bool isPrivate,
        string calldata source
    ) external returns (uint256 signalId) {
        require(quality <= 100, "Quality must be 0-100");
        require(sentiment <= 2, "Sentiment must be 0-2");
        require(hashToId[signalHash] == 0, "Signal already registered");

        signalId = nextSignalId++;

        signals[signalId] = SignalRecord({
            signalHash: signalHash,
            creator: msg.sender,
            quality: quality,
            sentiment: sentiment,
            assetCount: assetCount,
            timestamp: uint64(block.timestamp),
            isPrivate: isPrivate,
            source: source
        });

        creatorSignals[msg.sender].push(signalId);
        hashToId[signalHash] = signalId + 1; // +1 so 0 means "not found"

        totalRegistered++;
        if (isPrivate) totalPrivate++;

        emit SignalRegistered(
            signalId,
            signalHash,
            msg.sender,
            quality,
            sentiment,
            assetCount,
            isPrivate,
            source
        );

        return signalId;
    }

    /**
     * @notice Update the quality score of a signal (only creator can update)
     * @param signalId   The on-chain signal ID
     * @param newQuality New quality score 0-100
     */
    function updateQuality(uint256 signalId, uint8 newQuality) external {
        require(signalId < nextSignalId, "Signal does not exist");
        require(signals[signalId].creator == msg.sender, "Only creator can update");
        require(newQuality <= 100, "Quality must be 0-100");

        uint8 oldQuality = signals[signalId].quality;
        signals[signalId].quality = newQuality;

        emit QualityUpdated(signalId, oldQuality, newQuality);
    }

    // ──────────────────────────────────────────────
    // View Functions
    // ──────────────────────────────────────────────

    function getSignal(uint256 signalId) external view returns (SignalRecord memory) {
        require(signalId < nextSignalId, "Signal does not exist");
        return signals[signalId];
    }

    function getCreatorSignals(address creator) external view returns (uint256[] memory) {
        return creatorSignals[creator];
    }

    function getSignalByHash(bytes32 signalHash) external view returns (uint256 signalId, SignalRecord memory record) {
        uint256 idPlusOne = hashToId[signalHash];
        require(idPlusOne > 0, "Signal not found");
        signalId = idPlusOne - 1;
        record = signals[signalId];
    }

    function getStats() external view returns (
        uint256 _totalRegistered,
        uint256 _totalPrivate,
        uint256 _nextId
    ) {
        return (totalRegistered, totalPrivate, nextSignalId);
    }
}
