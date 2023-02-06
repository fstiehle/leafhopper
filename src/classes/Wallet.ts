import { ethers, Signer } from "ethers";
import ISignable from "../interfaces/ISignable";
import IWallet from "../interfaces/IWallet";

export default class Wallet implements IWallet {
  private wallet: Signer;

  constructor(wallet: Signer) {
    this.wallet = wallet;
  }

  signature(toSign: ISignable): Promise<string> {
    const signablePart = toSign.getSignable();
    const encoder = new ethers.AbiCoder();
    return this.wallet.signMessage(
      ethers.toBeArray(
        ethers.keccak256(
          encoder.encode(signablePart.types, signablePart.value)
        )
      )
    );
  }

  address(toVerify: ISignable, signature: string): string {
    const signable = toVerify.getSignable();
    const encoder = new ethers.AbiCoder;
    return ethers.verifyMessage(
      ethers.toBeArray(
        ethers.keccak256(
          encoder.encode(signable.types, signable.value)
        )
      ),
      signature
    );
  }
}