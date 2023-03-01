import IMessage from "../interfaces/IMessage";

export default class EnactMessage implements IMessage {
  taskID = 0;
  conditionState = 0;

  copyFromJSON(obj: {taskID: number, conditionState: number}): EnactMessage {
    return Object.assign(this, obj)
  }
}