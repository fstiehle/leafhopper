import IWallet from "../interfaces/IWallet";
import _enact from '../config/generated/Enact';
import ICase from "../interfaces/ICase";
import ProposeMessage from "../classes/ProposeMessage";
import ConfirmMessage from "../classes/ConfirmMessage";

export default class Enforcement {

  static enact(tokenState: number, taskID: number, conditionState: number, participantID: number) {
    return _enact(tokenState, taskID, conditionState, participantID);
  }

  static check(process: ICase, wallet: IWallet, proposal: ProposeMessage) {
    if (proposal.step == null) {
      return false;
    }
    const step = proposal.step;
    if (step.caseID !== process.caseID) {
      return false;
    }

    if (step.index !== process.index + 1) {
      console.warn(`Step index invalid`);
      return false;
    }

    // conforming task and participant? 
    const proposedTokenState = Enforcement.enact(
      process.tokenState, 
      step.taskID,
      step.conditionState,
      step.from
    );
    if (proposedTokenState === process.tokenState
    || step.newTokenState !== proposedTokenState
    ) {
      console.warn("Task", step.taskID, "Failed conformance check");
      return false; 
    }

    // check integrity, i.e., check signature
    const expectedAddress = process.participants.get(step.from)!.pubKey;
    if (wallet.verify(proposal, proposal.signature) !== expectedAddress) {
      console.warn(`Proposal ${step.taskID} did not pass integrity checks`);
      return false;
    }

    return true;
  }

  static checkConfirmed(process: ICase, wallet: IWallet, confirmation: ConfirmMessage) {
    if (confirmation.step == null) {
      return false;
    }

    process.participants.forEach((par, index) => {
      if (wallet.verify(confirmation, confirmation.signatures[index]) !== par.pubKey) {
        console.warn(`Signature of participant: ${par} not matching`);
        return false;
      }
    });

    return true;
  }
}