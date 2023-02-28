import IMessage from "../interfaces/IMessage";
import ISignable from "../interfaces/ISignable";
import Step, { StepProperties } from "./Step";

export default class ProposeMessage implements ISignable, IMessage {
  step: Step|null = null;
  signature = "";
  from: number|null = null;
  to: number|null = null;

  copyFromJSON(obj: {step: StepProperties, signature: string, from: number, to?: number}): ProposeMessage {
    obj.step = new Step(obj.step);
    return Object.assign(this, obj)
  }

  getSignable(): { types: string[]; value: any[]; } {
    return this.step ? this.step.getSignable() : { types: [], value: [] };
  }
}