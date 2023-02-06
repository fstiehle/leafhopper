import Step from "../classes/Step";
import IEnforcement from "../interfaces/IEnforcement";
import IWallet from "../interfaces/IWallet";
import _enact from '../generated/Enact';

export default class Enforcement implements IEnforcement {

  private wallet: IWallet;

  constructor(wallet: IWallet) {
    this.wallet = wallet;
  }

  address(step: Step, sig: string): string {
    return this.wallet.address(step, sig);
  }

  signature(step: Step) {
    return this.wallet.signature(step);
  }

  enact(tokenState: number[], taskID: number) {
    return _enact(tokenState, taskID);
  }

  check(step: Step) {
    return true;
  }

  isFinalised(step: Step) {
    return true;
  }

}