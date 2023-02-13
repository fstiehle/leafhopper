import * as fs from 'fs';
import chorpiler from 'chorpiler';
import path from 'path';

const parser = new chorpiler.Parser();
const solGenerator = new chorpiler.Generator.Sol.Enactment()
const scGenerator = new chorpiler.Generator.Sol.StateChannelRoot()
const tsGenerator = new chorpiler.Generator.TS.Enactment()

fs.readFile('./dist/config/model/EventBasedXOR.bpmn', 
  async (err, data) => {
    if (err) { console.error(err); }
    const iNet = await parser.fromXML(data);
    solGenerator.compile(iNet).then(data => console.log(data));
    scGenerator.compile(iNet).then(data => console.log(data));

    tsGenerator.compile(iNet)
    .then((code) => {
      fs.writeFile(path.join(__dirname, "..", "config/generated/Enact.ts"), code, { flag: 'w+' },
      (err) => { if (err) { console.error(err); } });
    })
    .catch(err => console.error(err));
});