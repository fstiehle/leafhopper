// TODO: import Signable from "./Signable";

export interface StepPublicProperties {
  from: number;
  caseID: number;
  taskID: number;
  newTokenState: number[];
  signature?: string[];
}

/* Step encodes all the information necessary for a transition, it is the main data type. */
export default class Step implements StepPublicProperties {
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
    this.from = props.from;
    this.caseID = props.caseID;
    this.taskID = props.taskID;
    this.signature = props.signature ? props.signature : new Array<string>(5).fill("0x");
    this.newTokenState = props.newTokenState;
    this.uintNewTokenState = Step.getUintTokenState(props.newTokenState);
  }
}