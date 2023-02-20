import { execSync } from "child_process";
import testConfig from "../config/test.config";

const execute = (line: string) => {
  console.log(line);
  try {
    console.log(execSync(line, { stdio: 'inherit' }));
  } catch(err) {
    console.log(err);
    return;
  }
}

execute(`npx ganache -m "${testConfig.mnemonic}"`);