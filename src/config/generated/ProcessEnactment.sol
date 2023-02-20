//SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

contract ProcessEnactment {
  uint private tokenState = 1;
  // TODO: better performance with mapping?
  address[3] private participants;

  constructor(address[3] memory _participants) {
    participants = _participants;
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