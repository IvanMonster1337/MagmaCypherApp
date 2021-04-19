const magmaCypher = require('./build/Release/magma_cypher');
const message = require('./config.json').message;

let originalStr = message;
console.log("original: " + originalStr);
let encryptedStr = magmaCypher.encrypt(originalStr);
console.log("encrypted: " + encryptedStr);
let decryptedStr = magmaCypher.decrypt(encryptedStr);
console.log("decrypted: " + decryptedStr);