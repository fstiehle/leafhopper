import IMessage from "../interfaces/IMessage";
import IProof from "../interfaces/IProof";
import ISignable from "../interfaces/ISignable";
import Step, { StepProperties } from "./Step";

export default class ConfirmMessage implements ISignable, IMessage {
  step: Step;
  signatures: string[] = new Array<string>();

  constructor() {
    this.step = new Step({
      index: 0,
      from: 0, 
      caseID: 0,
      taskID: 0, 
      newTokenState: 1,
    });
  }

  copyFromJSON(obj: {step: StepProperties, signature: string}): ConfirmMessage {
    obj.step = new Step(obj.step);
    return Object.assign(this, obj)
  }

  getSignable(): { types: string[]; value: any[]; } {
    return this.step.getSignable();
  }

  getProof(): IProof {
    return {
      index: this.step.index,
      from: this.step.from, 
      caseID: this.step.caseID, 
      taskID: this.step.taskID, 
      newTokenState: this.step.newTokenState,
      signatures: this.signatures,
    }
  }
}