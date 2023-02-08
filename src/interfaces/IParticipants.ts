type Participant = {
  id: number;
  name: string;
  hostname: string;
  port: number;
  pubKey: string;
}
type Participants = Map<number, Participant>

export default Participants;
export { Participant };