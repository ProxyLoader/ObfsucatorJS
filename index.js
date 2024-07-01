const fs = require('fs');
const path = require('path');
const JavaScriptObfuscator = require('javascript-obfuscator');
const AdmZip = require('adm-zip');
var colors = require('colors');


const directoryPath = './models';
let randomString = generateRandomString(5);
const archiveName = randomString + ".rar";
const archiveDirectory = "./rar";

let prefix = "(".blue + "root@rixy".red + ")".blue + " # ".red + " "

const obfuscateFiles = (directory, zip) => {
  const files = fs.readdirSync(directory);

  files.forEach((file) => {
    const filePath = path.join(directory, file);
    const stats = fs.statSync(filePath);

    if (stats.isDirectory()) {
      const directoryName = path.basename(filePath);
      zip.addLocalFolder(filePath, directoryName);

      obfuscateFiles(filePath, zip);
    } else if (file.endsWith('.js')) {
      const code = fs.readFileSync(filePath, 'utf8');

      const obfuscatedCode = JavaScriptObfuscator.obfuscate(code, {
        stringArrayEncoding: ['rc4', 'base64'],
        compact: true,
        controlFlowFlattening: true,
        controlFlowFlatteningThreshold: 1,
        numbersToExpressions: true,
        stringArrayShuffle: true,
        stringArrayWrappersType: 'function',
        target: "node",
        splitStrings: true,
        stringArrayThreshold: 1,
        deadCodeInjection: true,
        deadCodeInjectionThreshold: 0.9,
        renameGlobals: true,
        rotateStringArray: true,
        transformObjectKeys: true,
        transformStrings: true,
        selfDefending: true,
        stringArrayWrappersCount: 1000,
        unicodeEscapeSequence: true,
        transformUnicodeStrings: true,
        identifierNamesGenerator: 'mangled',
        splitStringsChunkLength: 1000
      }).getObfuscatedCode();
      


      console.log(prefix + "Obfsucated ".white + filePath.green + " (Encrypted)".red)

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

function generateRandomString(length) {
    let characters = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let randomString = '';
    
    for (let i = 0; i < length; i++) {
      let randomIndex = Math.floor(Math.random() * characters.length);
      randomString += characters.charAt(randomIndex);
    }
    
    return randomString;
  }
  
