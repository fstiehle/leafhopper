import { ethers } from "ethers";
import ISignable from "./ISignable";

export type Signer = ethers.Signer;

export default interface IWallet {
  signature(toSign: ISignable): Promise<string>;
  address(toVerify: ISignable, sig: string): string
}