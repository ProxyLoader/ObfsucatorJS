




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
  const outputFilePath = path.join(__dirname, 'obfuscated', 'obfuscated.zip');
  const archive = archiver('zip', { zlib: { level: 9 } });
  const output = fs.createWriteStream(outputFilePath);

  archive.pipe(output);

  // Iterate through all files and subdirectories in directoryPath
  const queue = [directoryPath];
  while (queue.length > 0) {
    const currentDirectory = queue.shift();
    const files = fs.readdirSync(currentDirectory);

    for (const file of files) {
      const filePath = path.join(currentDirectory, file);
      const stats = fs.statSync(filePath);

      if (stats.isDirectory()) {
        queue.push(filePath);
      } else if (file.endsWith('.js')) {
        archive.file(filePath, { name: filePath.slice(directoryPath.length + 1) });
      }
    }
  }

  archive.finalize();
  console.log(`Zip archive created: ${outputFilePath}`);
}

const directoryPath = process.argv[2];

if (!directoryPath) {
  console.log('Please provide a directory path');
  process.exit(1);
}

fs.mkdir(path.join(__dirname, 'obfuscated'), (err) => {
  if (err && err.code !== 'EEXIST') {
    console.error(`Error creating output directory: ${err}`);
    process.exit(1);
  }

  obfuscateFilesInDirectory(directoryPath);
});
