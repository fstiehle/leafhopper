/* An interface to encapsulate all enforcement related functionality; mainly verifying instances of Step. */
import Step from "../classes/Step";
import IWallet from "./IWallet";

export interface IEnact {(tokenState: number[], taskID: number): number[];}

export default interface IEnforcement {
  enact: IEnact;
  signature(step: Step): Promise<string>
  address(step: Step, sig: string): string
  check(step: Step): boolean;
  isFinalised(step: Step): boolean;
}