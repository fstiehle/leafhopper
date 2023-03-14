//SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

contract ProcessEnactment {
  uint public tokenState = 1;
  // TODO: better performance with mapping?
  address[5] public participants;

  constructor(address[5] memory _participants) {
    participants = _participants;
  }

  function enact(uint id, uint cond) external {
    uint _tokenState = tokenState;
    
    do {
        if (msg.sender == participants[0] && 0 == id && (_tokenState & 1 == 1)) {
          _tokenState &= ~uint(1);
          _tokenState |= 2;
          break;
        }
        if (msg.sender == participants[1] && 1 == id && (_tokenState & 2 == 2)) {
          _tokenState &= ~uint(2);
          _tokenState |= 4;
          break;
        }
        if (msg.sender == participants[1] && 2 == id && (_tokenState & 8 == 8)) {
          _tokenState &= ~uint(8);
          _tokenState |= 0;
          break;
        }
        if (msg.sender == participants[1] && 3 == id && (_tokenState & 4 == 4)) {
          _tokenState &= ~uint(4);
          _tokenState |= 16;
          break;
        }
        if (msg.sender == participants[2] && 4 == id && (_tokenState & 32 == 32)) {
          _tokenState &= ~uint(32);
          _tokenState |= 8;
          break;
        }
        if (msg.sender == participants[2] && 5 == id && (_tokenState & 16 == 16)) {
          _tokenState &= ~uint(16);
          _tokenState |= 64;
          break;
        }
        if (msg.sender == participants[3] && 6 == id && (_tokenState & 64 == 64)) {
          _tokenState &= ~uint(64);
          _tokenState |= 128;
          break;
        }
        if (msg.sender == participants[4] && 7 == id && (_tokenState & 128 == 128)) {
          _tokenState &= ~uint(128);
          _tokenState |= 256;
          break;
        }
        if (msg.sender == participants[3] && 8 == id && (_tokenState & 256 == 256)) {
          _tokenState &= ~uint(256);
          _tokenState |= 32;
          break;
        }
    } while (false);

    while(_tokenState != 0) {
      if ((cond & 1 == 1) && (_tokenState & 16 == 16)) {
        _tokenState &= ~uint(16);
        _tokenState |= 32;
        continue;
      }
      if ((cond & 2 == 2) && (_tokenState & 64 == 64)) {
        _tokenState &= ~uint(64);
        _tokenState |= 256;
        continue;
      }
      if ((cond & 4 == 4) && (_tokenState & 4 == 4)) {
        _tokenState &= ~uint(4);
        _tokenState |= 8;
        continue;
      }
      break;
    }

    tokenState = _tokenState;
  }
}