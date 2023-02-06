import ISignable from "../interfaces/ISignable";

export interface StepPublicProperties {
  index: number;
  from: number;
  caseID: number;
  taskID: number;
  newTokenState: number[];
  signature?: string[];
}

/* Step encodes all the information necessary for a transition. */
export default class Step implements StepPublicProperties, ISignable {
  index: number;
  from: number;
  caseID: number;
  taskID: number;
  newTokenState: number[];
  signature: string[];

  uintNewTokenState = 0;

  static getUintTokenState(tokenState: number[]) {
    let number = 0;
    for (let index = 0; index < tokenState.length; index++) {
      if (tokenState[index] > 0) number |= 1 << (index);
    }
    return number;
  }

  constructor(props: StepPublicProperties) {
    this.index = props.index;
    this.from = props.from;
    this.caseID = props.caseID;
    this.taskID = props.taskID;
    this.signature = props.signature ? props.signature : new Array<string>(5).fill("0x");
    this.newTokenState = props.newTokenState;
    this.uintNewTokenState = Step.getUintTokenState(props.newTokenState);
  }

  getSignable(withSignature?: boolean): { types: string[]; value: any[]; } {
    // eslint-disable-next-line
    const payload: any[] = [this.index, this.caseID, this.from, this.taskID, this.uintNewTokenState];
    const types = ['uint', 'uint', 'uint', 'uint', 'uint'];
    if (withSignature) { 
      payload.push(this.signature);
      types.push('bytes[]');
    }
    return {
      types: types,
      value: payload
    }
  }
}