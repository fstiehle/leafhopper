import * as fs from 'fs';
import chorpiler from 'chorpiler';
import path from 'path';

let filePath = './src/config/model/EventBasedXOR.bpmn';
const args = process.argv.slice(2);
if (args.length > 0) {
 filePath = args[0];
}

const parser = new chorpiler.Parser();
const scGenerator = new chorpiler.Generator.Sol.ProcessChannel();
const tsGenerator = new chorpiler.Generator.TS.Enactment();

console.log("Generate files for", filePath);

fs.readFile(filePath,
  async (err, data) => {
    if (err) { console.error(err); }
    const iNet = await parser.fromXML(data);

    scGenerator.compile(iNet)
    .then((gen) => {
      console.log(gen.encoding);
      fs.writeFile(path.join(__dirname, "..", "config/generated/StateChannel.sol"), gen.target, { flag: 'w+' },
      (err) => { if (err) { console.error(err); } });
      console.log("StateChannel.sol generated.");
    })
    .catch(err => console.error(err));

    tsGenerator.compile(iNet)
    .then((gen) => {
      fs.writeFile(path.join(__dirname, "..", "config/generated/Enact.ts"), gen.target, { flag: 'w+' },
      (err) => { if (err) { console.error(err); } });
      console.log("Enact.ts generated.");
    })
    .catch(err => console.error(err));
});