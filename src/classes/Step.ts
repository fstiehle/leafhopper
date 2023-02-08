export interface StepProperties {
  index: number;
  from: number;
  caseID: number;
  taskID: number;
  newTokenState: number[];
}

/* Step encodes all the information necessary for a transition. */
export default class Step implements StepProperties {
  index: number;
  from: number;
  caseID: number;
  taskID: number;
  newTokenState: number[];
  uintNewTokenState = 0;

  static getUintTokenState(tokenState: number[]) {
    let number = 0;
    for (let index = 0; index < tokenState.length; index++) {
      if (tokenState[index] > 0) number |= 1 << (index);
    }
    return number;
  }

  constructor(props: StepProperties) {
    this.index = props.index;
    this.from = props.from;
    this.caseID = props.caseID;
    this.taskID = props.taskID;
    this.newTokenState = props.newTokenState;
    this.uintNewTokenState = Step.getUintTokenState(props.newTokenState);
  }

  getABIEncoding() {
    const payload: any[] = [this.index, this.caseID, this.from, this.taskID, this.uintNewTokenState];
    const types = ['uint', 'uint', 'uint', 'uint', 'uint'];
    return {
      types: types,
      value: payload
    }
  }
}