import { ethers } from "ethers";
import ISignable from "../interfaces/ISignable";
import IWallet, { _Wallet } from "../interfaces/IWallet";

export default class Wallet implements IWallet {
  private _wallet: _Wallet;
  address: string;
  identity: number;

  constructor(identity: number, _wallet: _Wallet, contractAddress: string) {
    this._wallet = _wallet;
    this.address = _wallet.address;
    this.identity = identity;
  }

  produceSignature(toSign: ISignable): Promise<string> {
    const signablePart = toSign.getSignable();
    const encoder = new ethers.AbiCoder();
    return this._wallet.signMessage(
      ethers.toBeArray(
        ethers.keccak256(
          encoder.encode(signablePart.types, signablePart.value)
        )
      )
    );
  }

  verify(_toVerify: ISignable, signature: string): string {
    const toVerify = _toVerify.getSignable();
    const encoder = new ethers.AbiCoder;
    return ethers.verifyMessage(
      ethers.toBeArray(
        ethers.keccak256(
          encoder.encode(toVerify.types, toVerify.value)
        )
      ),
      signature
    );
  }
} 