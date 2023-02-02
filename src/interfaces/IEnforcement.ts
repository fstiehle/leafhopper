/* An interface to encapsulate all enforcement related functionality; mainly verifying instances of Step. */
import Step from "../classes/Step";

export interface IEnact {(tokenState: number[], taskID: number): number[];}

export default interface IEnforcement {
  enact: IEnact;
  check(step: Step): boolean;
  isFinalised(step: Step): boolean;
}