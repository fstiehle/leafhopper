import Participants from "../interfaces/IParticipants";
import Step from "./Step";
import ICase from "../interfaces/ICase";

export default class Case implements ICase {

  caseID = 0;
  steps = new Array<Step>();
  tokenState = new Array<number>()
  participants: Participants;

  constructor(participants: Participants) {
    this.participants = participants;
  }
}