const enact = (tokenState: number[], taskID: number, participantID: number): number[] => {
  if (participantID === 0 && 0 === taskID && tokenState[1] === 1) {
      tokenState[1] = 0;
      tokenState[2] = 1;
  }
  if (participantID === 1 && 1 === taskID && tokenState[2] === 1) {
      tokenState[2] = 0;
      tokenState[4] = 1;
  }
  if (participantID === 2 && 2 === taskID && tokenState[4] === 1) {
      tokenState[4] = 0;
      tokenState[2] = 1;
  }
  if (tokenState[2] === 1) {
      tokenState[2] = 0;
      tokenState[8] = 1;
  }
  return tokenState;
}

export default enact;