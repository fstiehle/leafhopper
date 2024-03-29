import ISignable from "../interfaces/ISignable";

export interface StepProperties {
  index: number;
  from: number;
  caseID: number;
  taskID: number;
  conditionState: number;
  newTokenState: number;
}

/* Step encodes all the information necessary for a transition. */
export default class Step implements StepProperties, ISignable {
  index: number;
  from: number;
  caseID: number;
  taskID: number;
  conditionState: number;
  newTokenState: number;

  constructor(props: StepProperties) {
    this.index = props.index;
    this.from = props.from;
    this.caseID = props.caseID;
    this.taskID = props.taskID;
    this.newTokenState = props.newTokenState;
    this.conditionState = props.conditionState;
  }

  getSignable() {
    const payload: any[] = [
      this.index, this.caseID, this.from, this.taskID, this.newTokenState, this.conditionState
    ];
    const types = ['uint', 'uint', 'uint', 'uint', 'uint', 'uint'];
    return {
      types: types,
      value: payload
    }
  }
}