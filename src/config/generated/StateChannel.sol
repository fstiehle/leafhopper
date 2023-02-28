//SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";

contract ProcessChannel {
  using ECDSA for bytes32;
  // TODO: Can we optimise the packing of this struct?
  // Intuition: No, as it is only used in calldata
  struct Step {
    uint index;
    uint from;
    uint caseID;
    uint taskID;
    uint newTokenState;
    bytes[] signatures;
  }
  uint public tokenState = 1;
  uint public index = 0;
  // TODO: better performance with mapping?
  address[5] public participants;

  /// Timestamps for the challenge-response dispute window
  uint public disputeMadeAtUNIX = 0;
  uint public immutable disputeWindowInUNIX;

  /**
   * @param _participants addresses for the roles 
   * in the order (BulkBuyer, Manufacturer, Middleman, Supplier, SpecialCarrier)
   * @param _disputeWindowInUNIX time for the dispute window to remain open in UNIX.
   */
  constructor(address[5] memory _participants, uint _disputeWindowInUNIX) {
    participants = _participants;
    disputeWindowInUNIX = _disputeWindowInUNIX;
  }

  /**
   * Trigger new dispute or submit new state to elapse current dispute state
   * @param _step Last unanimously signed step, or empty step if process is stuck in start event
   */
   function submit(Step calldata _step) external {
    if (0 == _step.signatures.length && 0 == disputeMadeAtUNIX && 1 == tokenState) {
      // stuck in start event
      disputeMadeAtUNIX = block.timestamp;
    }
    if (checkStep(_step) && (0 == disputeMadeAtUNIX || disputeMadeAtUNIX + disputeWindowInUNIX >= block.timestamp)) {
      // new dispute with state submission
      disputeMadeAtUNIX = block.timestamp;
      index = _step.index;
      tokenState = _step.newTokenState;
    }
  }

  function checkStep(Step calldata _step) private view returns (bool) {
    // Check that step is higher than previously recorded steps
    if (index >= _step.index) {  
      return false;
    } 
    // Verify signatures
    bytes32 payload = keccak256(
      abi.encode(_step.index, _step.caseID, _step.from, _step.taskID, _step.newTokenState)
    );
    for (uint256 i = 0; i < participants.length; i++) {
      if (_step.signatures[i].length != 65) return false;
      if (payload.toEthSignedMessageHash().recover(_step.signatures[i]) != participants[uint(i)]) {
        return false;
      }
    }
    return true;
  }

  /**
   * If a dispute window has elapsed, execution must continue through this function
   * @param id id of the activity to begin
   */
  function continueAfterDispute(uint id) external {
    require(disputeMadeAtUNIX != 0 && disputeMadeAtUNIX + disputeWindowInUNIX < block.timestamp, "No elapsed dispute");
    if (msg.sender == participants[0] && 0 == id && (tokenState & 1 == 1)) {
      tokenState &= ~uint(1) | 2;
      return;
    }
    if (msg.sender == participants[1] && 1 == id && (tokenState & 2 == 2)) {
      tokenState &= ~uint(2) | 4;
      return;
    }
    if (msg.sender == participants[1] && 2 == id && (tokenState & 4 == 4)) {
      tokenState &= ~uint(4) | 8;
      return;
    }
    if (msg.sender == participants[1] && 3 == id && (tokenState & 4 == 4)) {
      tokenState &= ~uint(4) | 16;
      return;
    }
    if (msg.sender == participants[2] && 4 == id && (tokenState & 16 == 16)) {
      tokenState &= ~uint(16) | 4;
      return;
    }
    if (msg.sender == participants[2] && 5 == id && (tokenState & 16 == 16)) {
      tokenState &= ~uint(16) | 32;
      return;
    }
    if (msg.sender == participants[3] && 6 == id && (tokenState & 32 == 32)) {
      tokenState &= ~uint(32) | 64;
      return;
    }
    if (msg.sender == participants[4] && 7 == id && (tokenState & 64 == 64)) {
      tokenState &= ~uint(64) | 32;
      return;
    }
    if (msg.sender == participants[3] && 8 == id && (tokenState & 32 == 32)) {
      tokenState &= ~uint(32) | 16;
      return;
    }
    while (true) {
      if (tokenState & 8 == 8) {
        tokenState &= ~uint(8) | 128;
        continue;
      }
      break;
    }
  }
}