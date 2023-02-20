console.warn("App run with dummy configuration");
export default {
  CASE: "dummy",
  ROOT: {
    chain: "http://127.0.0.1:8545",
    contract: "{{{contractAddress}}}" // this is replaced by the deploy script
  },
  IDENTITY: {
    ID: 0,
    skey: "0xfaa4f01aaf33a7714276150ee56b66068eaeb1811918be248413be72b2c11206"
  },
  PORT: 8080
}