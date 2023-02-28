const enact = (tokenState: number, id: number, participantID: number): number => {
    if (participantID === 0 && 0 == id && ((tokenState & 1) === 1)) {
      tokenState &= ~1;
      tokenState |= 2;
    }
    if (participantID === 1 && 1 == id && ((tokenState & 2) === 2)) {
      tokenState &= ~2;
      tokenState |= 4;
    }
    if (participantID === 1 && 2 == id && ((tokenState & 4) === 4)) {
      tokenState &= ~4;
      tokenState |= 8;
    }
    if (participantID === 1 && 3 == id && ((tokenState & 4) === 4)) {
      tokenState &= ~4;
      tokenState |= 16;
    }
    if (participantID === 2 && 4 == id && ((tokenState & 16) === 16)) {
      tokenState &= ~16;
      tokenState |= 4;
    }
    if (participantID === 2 && 5 == id && ((tokenState & 16) === 16)) {
      tokenState &= ~16;
      tokenState |= 32;
    }
    if (participantID === 3 && 6 == id && ((tokenState & 32) === 32)) {
      tokenState &= ~32;
      tokenState |= 64;
    }
    if (participantID === 4 && 7 == id && ((tokenState & 64) === 64)) {
      tokenState &= ~64;
      tokenState |= 32;
    }
    if (participantID === 3 && 8 == id && ((tokenState & 32) === 32)) {
      tokenState &= ~32;
      tokenState |= 16;
    }
    if ((tokenState & 8) === 8) {
      tokenState &= ~8;
      tokenState |= 128;
    }
    return tokenState;
}

export default enact;