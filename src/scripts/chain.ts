import { execSync } from "child_process";
import testConfig from "../config/test.config";

let arg = "";
const args = process.argv.slice(2);
if (args.length > 0) {
  arg = args[0];
}

const line = `npx ganache -m "${testConfig.mnemonic}" ${arg}`;

try {
  console.log(execSync(line, { stdio: 'inherit' }));
} catch(err) {
  console.error(err);
}