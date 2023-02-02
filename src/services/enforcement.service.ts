import Step from "src/classes/Step";
import IEnforcement from "src/interfaces/IEnforcement";
import _enact from '../generated/Enact';

export default class Enforcement implements IEnforcement {

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