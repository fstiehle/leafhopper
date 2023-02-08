import IWallet from "../interfaces/IWallet";
import _enact from '../config/generated/Enact';
import ICase from "../interfaces/ICase";
import ProposeMessage from "../classes/ProposeMessage";
import ConfirmMessage from "../classes/ConfirmMessage";

export default class Enforcement {

  static enact(tokenState: number[], taskID: number, participantID: number) {
    return _enact(tokenState, taskID, participantID);
  }

  static check(process: ICase, wallet: IWallet, proposal: ProposeMessage) {
    if (proposal.step == null) {
      return false;
    }
    const step = proposal.step;
    if (step.caseID !== process.caseID) {
      return false;
    }

    // conforming task and participant? 
    const proposedTokenState = Enforcement.enact(
      [...process.tokenState], 
      step.taskID,
      step.from
    );
    if (JSON.stringify(proposedTokenState) === JSON.stringify(process.tokenState) 
    || JSON.stringify(step.newTokenState) !== JSON.stringify(proposedTokenState)
    ) {
      return false; 
    }

    // check integrity, i.e., check signature
    const expectedAddress = process.participants.get(step.from)!.pubKey;
    if (wallet.verify(proposal, proposal.signature) !== expectedAddress) {
      console.info(`Proposal ${step.taskID} did not pass integrity checks`);
      return false;
    }

    return true;
  }

  static checkConfirmed(process: ICase, wallet: IWallet, confirmation: ConfirmMessage) {
    if (confirmation.step == null) {
      return false;
    }
    if (confirmation.signature.length !== process.participants.size) {
      console.info(`Confirmation for task ${confirmation.step.taskID} not signed by all participants: ${JSON.stringify(confirmation.signature)}`);
      return false;
    }
    confirmation.signature.forEach((sig, par) => {
      if (wallet.verify(confirmation, sig) !== process.participants.get(par)!.pubKey) {
        console.info(`Signature of participant: ${par} not matching`);
        return false;
      }
    });

    return true;
  }

}