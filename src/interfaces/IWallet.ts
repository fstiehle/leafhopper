import { ethers } from "ethers";
import IProof from "./IProof";
import ISignable from "./ISignable";

export type _Wallet = ethers.Wallet;
export type _Contract = ethers.Contract;

export default interface IWallet {
  identity: number;
  address: string;
  contract: _Contract|null;
  produceSignature(toSign: ISignable): Promise<string>;
  verify(toVerify: ISignable, sig: string): string;
  isDisputed(): Promise<boolean>;
  submit(proof?: IProof): Promise<boolean>;
  attach(contract: string): void;
}