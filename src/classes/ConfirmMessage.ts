import IMessage from "../interfaces/IMessage";
import IProof from "../interfaces/IProof";
import ISignable from "../interfaces/ISignable";
import Step, { StepProperties } from "./Step";

export default class ConfirmMessage implements ISignable, IMessage {
  step: Step | null = null;
  signatures: string[] = new Array<string>();

  copyFromJSON(obj: {step: StepProperties, signature: string}): ConfirmMessage {
    obj.step = new Step(obj.step);
    return Object.assign(this, obj)
  }

  getSignable(): { types: string[]; value: any[]; } {
    return this.step ? this.step.getABIEncoding() : { types: [], value: [] };
  }

  getProof(): IProof {
    if (!this.step) {
      return {
        caseID: 0, 
        from: 0, 
        taskID: 0, 
        newTokenState: 0, 
        signatures: []
      }
    }
    return {
      caseID: this.step.caseID, 
      from: this.step.from, 
      taskID: this.step.taskID, 
      newTokenState: this.step.newTokenState,
      signatures: this.signatures
    }
  }
}