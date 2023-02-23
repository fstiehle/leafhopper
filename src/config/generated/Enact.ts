const enact = (tokenState: number, id: number, participantID: number): number => {
    if (participantID === 0 && 0 == id && ((tokenState & 1) === 1)) {
      tokenState &= ~1;
      tokenState |= 2;
    }
    if (participantID === 1 && 1 == id && ((tokenState & 2) === 2)) {
      tokenState &= ~2;
      tokenState |= 4;
    }
    if (participantID === 2 && 2 == id && ((tokenState & 4) === 4)) {
      tokenState &= ~4;
      tokenState |= 2;
    }
    if ((tokenState & 2) === 2) {
      tokenState &= ~2;
      tokenState |= 8;
    }
    return tokenState;
}

export default enact;