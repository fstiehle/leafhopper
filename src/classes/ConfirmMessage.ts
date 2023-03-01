import participants from "../config/participants.config";
import IMessage from "../interfaces/IMessage";
import IProof from "../interfaces/IProof";
import ISignable from "../interfaces/ISignable";
import Step, { StepProperties } from "./Step";

export default class ConfirmMessage implements ISignable, IMessage {
  step: Step;
  signatures = new Array<string>();

  constructor() {
    this.step = new Step({
      index: 0,
      from: 0, 
      caseID: 0,
      taskID: 0, 
      newTokenState: 1,
      conditionState: 0
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
    if (this.signatures.length === 0) {
      for (let index = 0; index < participants.size; index++) {
        this.signatures.push("0x");
      }
    }
    return {
      index: this.step.index,
      from: this.step.from, 
      caseID: this.step.caseID, 
      taskID: this.step.taskID, 
      newTokenState: this.step.newTokenState,
      conditionState: this.step.conditionState,
      signatures: this.signatures
    }
  }
}