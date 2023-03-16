import * as fs from 'fs';
import chorpiler from 'chorpiler';
import path from 'path';

let filePath = './src/config/model/EventBasedXOR.bpmn';
let baseline = false;
const args = process.argv.slice(2);
if (args.length > 0) {
 filePath = args[0];
 if (args[1]) {
  baseline = true;
 }
}

const parser = new chorpiler.Parser();
const pcGenerator = new chorpiler.Generator.Sol.ProcessChannel();
const tsGenerator = new chorpiler.Generator.TS.Enactment();
const solGenerator = new chorpiler.Generator.Sol.Enactment();

console.log("Generate files for", filePath);

fs.readFile(filePath,
  async (err, data) => {
    if (err) { console.error(err); }
    const iNet = await parser.fromXML(data);

    pcGenerator.compile(iNet)
    .then((gen) => {
      console.log(gen.encoding);
      fs.writeFile(path.join(__dirname, "..", "config/generated/ProcessChannel.sol"), gen.target, { flag: 'w+' },
      (err) => { if (err) { console.error(err); } });
      console.log("ProcessChannel.sol generated.");
    })
    .catch(err => console.error(err));

    tsGenerator.compile(iNet)
    .then((gen) => {
      fs.writeFile(path.join(__dirname, "..", "config/generated/Enact.ts"), gen.target, { flag: 'w+' },
      (err) => { if (err) { console.error(err); } });
      console.log("Enact.ts generated.");
    })
    .catch(err => console.error(err));

    if (baseline) {
      solGenerator.compile(iNet)
      .then((gen) => {
        fs.writeFile(path.join(__dirname, "..", "config/generated/ProcessEnactment.sol"), gen.target, { flag: 'w+' },
        (err) => { if (err) { console.error(err); } });
        console.log("ProcessEnactment.sol generated.");
      })
      .catch(err => console.error(err));
    }
});