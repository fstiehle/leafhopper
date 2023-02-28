import Participants from "./Participants";
import ICase from "../interfaces/ICase";
import IProof from "../interfaces/IProof";
import ConfirmMessage from "./ConfirmMessage";

export default class Case implements ICase {
  caseID = 0;
  steps = new Array<IProof>();
  tokenState = 1;
  participants: Participants;
  index = 0;

  constructor(participants: Participants) {
    this.participants = participants;
    this.steps.push(new ConfirmMessage().getProof());
  }
}