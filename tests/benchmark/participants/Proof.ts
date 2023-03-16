import { ethers } from "ethers";

export default class Proof { 
  index = 0;
  from = 0;
  caseID = 0;
  taskID = 0;
  newTokenState = 0;
  conditionState = 0;
  signatures = new Array<string>();

  getSignable() {
    const payload: any[] = [
      this.index, 
      this.caseID, 
      this.from, 
      this.taskID, 
      this.newTokenState, 
      this.conditionState
    ];
    const types = ['uint', 'uint', 'uint', 'uint', 'uint', 'uint'];
    return {
      types: types,
      value: payload
    }
  }

  async sign(wallets: ethers.Wallet[]) {
    for (let index = 0; index < wallets.length; index++) {
      const signablePart = this.getSignable();
      const encoder = new ethers.utils.AbiCoder();
      this.signatures[index] = await wallets[index].signMessage(
        ethers.utils.arrayify(
          ethers.utils.keccak256(
            encoder.encode(signablePart.types, signablePart.value)
      )));
    }
  }
}