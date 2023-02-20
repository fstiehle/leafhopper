import { ethers } from "ethers";
import ISignable from "./ISignable";

export type _Wallet = ethers.Wallet;

export default interface IWallet {
  identity: number;
  address: string;
  produceSignature(toSign: ISignable): Promise<string>;
  verify(toVerify: ISignable, sig: string): string;
}