const fs = require('fs');
const path = require('path');
const readline = require('readline');
const JavaScriptObfuscator = require('javascript-obfuscator');
const AdmZip = require('adm-zip');
const colors = require('colors');
const prefix = "(".blue + "ObfuscatorJS".red + ")".blue + " # ".red + " ";

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

let directoryPath = '';
let skipPackages;

rl.question(prefix + colors.green('Enter the directory path to obfuscate files: '), (answer) => {
  directoryPath = answer.trim();

  if (!fs.existsSync(directoryPath)) {
    console.log(prefix + `Directory '${directoryPath}' does not exist.`.yellow);
    rl.close();
    return;
  }

  rl.question(colors.green(prefix + "Do you want to skip /node_modules/? (yes/no): "), (answer) => {
    if (answer.trim().toLowerCase() === "yes") {
      console.log(colors.cyan(prefix + "Skipping packages set to: true"));
      skipPackages = true;
    } else if(answer.trim().toLowerCase() === "no") {
      console.log(colors.cyan(prefix + "Skipping packages set to: false"));
      skipPackages = false;
    } else {
        skipPackages = true;
        console.log(colors.cyan(prefix + "Default: true"));
    }

    const archiveDirectory = "./rar";
    const randomString = generateRandomString(5);
    const archiveName = randomString + ".rar";


    const obfuscateFiles = (directory, zip) => {
      const files = fs.readdirSync(directory);

      files.forEach((file) => {
        const filePath = path.join(directory, file);
        const stats = fs.statSync(filePath);

        if (stats.isDirectory()) {
          if (skipPackages && filePath.includes('node_modules')) {
            console.log(prefix + colors.yellow(`Skipping directory: ${filePath}`));
            return; 
          }

          const directoryName = path.basename(filePath);
          zip.addLocalFolder(filePath, directoryName);

          obfuscateFiles(filePath, zip);
        } else if (file.endsWith('.js')) {
          const code = fs.readFileSync(filePath, 'utf8');


          const obfuscatedCode = JavaScriptObfuscator.obfuscate(code, {
            stringArrayEncoding: ['rc4', 'base64'],
            compact: true,
            simplify: true,
            controlFlowFlattening: true,
            controlFlowFlatteningThreshold: 1,
            numbersToExpressions: true,
            stringArrayShuffle: true,
            stringArrayWrappersType: 'variable',
            target: "node",
            splitStrings: true,
            stringArrayThreshold: 1,
            deadCodeInjection: true,
            deadCodeInjectionThreshold: 1,
            renameGlobals: true,
            rotateStringArray: true,
            transformObjectKeys: true,
            transformStrings: true,
            selfDefending: true,
            stringArrayWrappersCount: 10000,
            unicodeEscapeSequence: true,
            transformUnicodeStrings: true,
            identifierNamesGenerator: 'mangled',
            splitStringsChunkLength: 10000,
            identifiersPrefix: generateRandomString(30),
          }).getObfuscatedCode();

          console.log(prefix + "Obfuscated ".white + filePath.green + " (Encrypted)".red);

          const relativePath = path.relative(directoryPath, filePath);
          zip.addFile(relativePath, Buffer.from(obfuscatedCode, 'utf8'));
        }
      });
    };

    const archivePath = path.join(archiveDirectory, archiveName);
    const zip = new AdmZip();

    obfuscateFiles(directoryPath, zip);

    zip.writeZip(archivePath);

    console.log(prefix + "Archive successfully created at: ".cyan + archivePath.green + " Enjoy!".magenta);

    rl.close();
  });
});

function generateRandomString(length) {
  let characters = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
  let randomString = '';

  for (let i = 0; i < length; i++) {
    let randomIndex = Math.floor(Math.random() * characters.length);
    randomString += characters.charAt(randomIndex);
  }

  return randomString;
}
