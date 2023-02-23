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
  address[3] public participants;

  /// Timestamps for the challenge-response dispute window
  uint public disputeMadeAtUNIX = 0;
  uint public immutable disputeWindowInUNIX;

  /**
   * @param _participants addresses for the roles 
   * in the order (BulkBuyer, Manufacturer, Middleman, Supplier, SpecialCarrier)
   * @param _disputeWindowInUNIX time for the dispute window to remain open in UNIX.
   */
  constructor(address[3] memory _participants, uint _disputeWindowInUNIX) {
    participants = _participants;
    disputeWindowInUNIX = _disputeWindowInUNIX;
  }

  /**
   * Trigger new dispute or submit new state to elapse current dispute state
   * @param _step Last unanimously signed step, or empty step if process is stuck in start event
   */
   function submit(Step calldata _step) external returns (bool) {
    // stuck in start event
    if (0 == disputeMadeAtUNIX && 1 == tokenState) {
      return true;
    }
    bool _check = handleStep(_step);
    // new dispute with state submission
    if (_check && 0 == disputeMadeAtUNIX) {
      disputeMadeAtUNIX = block.timestamp;
      return true;
    } else if (_check && disputeMadeAtUNIX + disputeWindowInUNIX > block.timestamp) {
      return true;
    }
    return false;
  }

  /**
   * If a dispute window has elapsed, execution must continue through this function
   * @param id id of the activity to begin
   */
  function continueAfterDispute(uint id) external returns (uint) {
    require(disputeMadeAtUNIX + disputeWindowInUNIX < block.timestamp);
    return enact(id);
  }

  function handleStep(Step calldata _step) private returns (bool) {
    // Check that step is higher than previously recorded steps
    if (index >= _step.index) {  
      return false;
    } 
    // Verify signatures
    bytes32 payload = keccak256(
      abi.encode(_step.caseID, _step.from, _step.taskID, _step.newTokenState)
    );
    for (uint256 i = 0; i < participants.length; i++) {
      if (_step.signatures[i].length != 65) return false;
      if (payload.toEthSignedMessageHash().recover(_step.signatures[i]) != participants[uint(i)]) {
        return false;
      }
    }
    index = _step.index;
    // set token state of conformance contract = _step.newTokenState;
    return true;
  }

  function enact(uint id) internal returns (uint) {
    if (msg.sender == participants[0] && 0 == id && (tokenState & 1 == 1)) {
      tokenState &= ~uint(1);
      tokenState |= 2;
    }
    if (msg.sender == participants[1] && 1 == id && (tokenState & 2 == 2)) {
      tokenState &= ~uint(2);
      tokenState |= 4;
    }
    if (msg.sender == participants[2] && 2 == id && (tokenState & 4 == 4)) {
      tokenState &= ~uint(4);
      tokenState |= 2;
    }
    if (tokenState & 2 == 2) {
      tokenState &= ~uint(2);
      tokenState |= 8;
    }
    return tokenState;
  }
}