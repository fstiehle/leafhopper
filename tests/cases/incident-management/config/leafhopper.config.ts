export default {
  CASE: "Incident Management",
  ROOT: {
    chain: "http://host.docker.internal:8545",
    contract: "{{{contractAddress}}}" // this is replaced by the deploy script
  },
  IDENTITY: {
    ID: -999,
    skey: "0x"
  },
  PORT: 8080
}