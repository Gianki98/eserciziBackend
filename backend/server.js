import { writeFile } from 'node:fs';

const content = `Ciao dal callback API di fs.writeFile!
Timestamp: ${new Date().toISOString()}
`;

writeFile('output.txt', content, { encoding: 'utf8' }, (err) => {
  if (err) {
    console.error('Errore durante la scrittura del file:', err);
    process.exit(1);
  }
  console.log('File scritto correttamente: output.txt');
});
