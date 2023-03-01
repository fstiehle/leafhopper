import Participants from "../classes/Participants";
import IProof from "./IProof";

export default interface ICase {
  caseID: number;
  steps: IProof[];
  tokenState: number;
  participants: Participants;
  index: number;

  reset(): void;
}