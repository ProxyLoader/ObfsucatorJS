



const fs = require('fs');
const path = require('path');
const JavaScriptObfuscator = require('javascript-obfuscator');
const archiver = require('archiver');

function obfuscateFile(filePath) {
  const originalContent = fs.readFileSync(filePath, 'utf8');
  const obfuscationResult = JavaScriptObfuscator.obfuscate(originalContent);
  const obfuscatedContent = obfuscationResult.getObfuscatedCode();
  fs.writeFileSync(filePath, obfuscatedContent);
  console.log(`Obfuscated ${filePath}`);
}

function obfuscateFilesInDirectory(directoryPath) {
  let i = 0;

  fs.readdir(directoryPath, (err, files) => {
    if (err) {
      console.error(`Error reading directory: ${err}`);
      process.exit(1);
    }

    files.forEach((file) => {
      const filePath = path.join(directoryPath, file);
      const stats = fs.statSync(filePath);

      if (stats.isDirectory()) {
        obfuscateFilesInDirectory(filePath);
      } else if (file.endsWith('.js')) {
        i++;
        obfuscateFile(filePath);
      }
    });

    if (i > 0) {
      console.log(`Obfuscated ${i} file${i === 1 ? '' : 's'}`);
      createZip(directoryPath);
    } else {
      console.log('No files found to obfuscate');
    }
  });
}



function createZip(directoryPath) {
  const directoryName = path.basename(directoryPath);
  const outputFilePath = path.join(__dirname, 'obfuscated', directoryName + '.zip');
  const archive = archiver('zip', { zlib: { level: 9 } });
  const output = fs.createWriteStream(outputFilePath);

  archive.pipe(output);

  const files = fs.readdirSync(directoryPath);

  for (const file of files) {
    const filePath = path.join(directoryPath, file);
    const stats = fs.statSync(filePath);

    if (stats.isDirectory()) {
      continue;
    } else if (file.endsWith('.js')) {
      archive.file(filePath, { name: path.join(directoryName, file) });
    }
  }

  archive.finalize();

  archive.on('error', (err) => {
    console.error(`Error creating zip archive: ${err}`);
    process.exit(1);
  });

  output.on('close', () => {
    console.log(`Zip archive created: ${outputFilePath}`);
  });
}


const directoryPath = process.argv[2];

if (!directoryPath) {
  console.log('Please provide a directory path');
  process.exit(1);
}

fs.mkdir(path.join(__dirname, 'obfuscated'), { recursive: true }, (err) => {
  if (err) {
    console.error(`Error creating output directory: ${err}`);
    process.exit(1);
  }
  obfuscateFilesInDirectory(directoryPath);
});
