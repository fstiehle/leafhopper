import fs from "fs";
import { ethers } from "ethers";
import IProof from "../interfaces/IProof";
import ISignable from "../interfaces/ISignable";
import IWallet, { _Wallet } from "../interfaces/IWallet";

export default class Wallet implements IWallet {
  private _wallet: _Wallet;
  address: string;
  identity: number;
  contract: ethers.Contract|null = null;

  constructor(identity: number, _wallet: _Wallet, contractAddress: string) {
    this._wallet = _wallet;
    this.address = _wallet.address;
    this.identity = identity;
    if (contractAddress)
      this.attach(contractAddress);
  }

  async attach(address: string) {
    let contractData;
    try {
      contractData = JSON.parse(fs.readFileSync('./dist/contracts/ProcessChannel.json').toString());
    } catch (error) {
      console.warn("Error loading contract abi, did you run 'npm run build'?");
      console.warn(error);
    }
    // TODO: the below suceeds even for empty address
    this.contract = new ethers.Contract(
      address, 
      contractData.abi, 
      this._wallet
    );
    if (this.contract != null) {
      console.log("Sucessfully attached to contract", address);
    } else {
      console.warn("Error attaching to contract", address);
    }
  }

  async isDisputed(): Promise<boolean> {
    if (this.contract == null) return false;
    try {
      const dispute = await this.contract.disputeMadeAtUNIX();
      return (0 !== Number.parseInt(dispute));
    } catch (error) {
      console.log(error);
      return true;
    }
  }

  async submit(proof: IProof) {
    if (this.contract == null) return null;
    return await this.contract.submit(proof);
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