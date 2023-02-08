import Step from "../classes/Step";
import Participants from "./IParticipants";

export default interface ICase {
  caseID: number;
  steps: Step[];
  tokenState: Array<number>;
  participants: Participants;
}