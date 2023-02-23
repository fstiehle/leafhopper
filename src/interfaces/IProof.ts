export default interface IProof {
  caseID: number, 
  from: number, 
  taskID: number, 
  newTokenState: number, 
  signatures: string[]
}