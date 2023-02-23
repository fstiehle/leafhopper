import Participants from "./Participants";
import ICase from "../interfaces/ICase";
import IProof from "../interfaces/IProof";

export default class Case implements ICase {
  caseID = 0;
  steps = new Array<IProof>();
  tokenState = 1;
  participants: Participants;

  constructor(participants: Participants) {
    this.participants = participants;
  }
}