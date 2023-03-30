const enact = (tokenState: number, id: number, cond: number, participantID: number): number => {
  
  do {
    if (participantID === 0 && 0 == id && ((tokenState & 1) === 1)) {
      tokenState &= ~1;
      tokenState |= 2;
      break;
    }
    if (participantID === 1 && 1 == id && ((tokenState & 2) === 2)) {
      tokenState &= ~2;
      tokenState |= 4;
      break;
    }
    if (participantID === 2 && 2 == id && ((tokenState & 4) === 4)) {
      tokenState &= ~4;
      tokenState |= 0;
      break;
    }
    return tokenState;
  } while (false);

  while(tokenState != 0) {
    if (((cond & 1) == 1) && ((tokenState & 2) === 2)) {
      tokenState &= ~2;
      tokenState |= 0;
      break; // is end
    }
    break;
  }
  
  return tokenState;
}

export default enact;