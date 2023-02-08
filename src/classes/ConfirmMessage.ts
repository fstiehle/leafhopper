import IMessage from "../interfaces/IMessage";
import ISignable from "../interfaces/ISignable";
import Step, { StepProperties } from "./Step";

export default class ConfirmMessage implements ISignable, IMessage {
  step: Step | null = null;
  signature: string[] = new Array<string>();

  copyFromJSON(obj: {step: StepProperties, signature: string}): ConfirmMessage {
    obj.step = new Step(obj.step);
    return Object.assign(this, obj)
  }

  getSignable(): { types: string[]; value: any[]; } {
    return this.step ? this.step.getABIEncoding() : { types: [], value: [] };
  }
}