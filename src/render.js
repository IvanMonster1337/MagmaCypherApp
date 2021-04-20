const magmaCypher = require('../build/Release/magma_cypher');
const cipherButton = document.getElementById('cipher');
const decipherButton = document.getElementById('decipher');
cipherButton.onclick = cipher;
decipherButton.onclick = decipher;

function cipher(){
    const str = document.getElementById('msg').value;
    let result = magmaCypher.encrypt(str);
    console.log(byteSize(str) + " " + byteSize(result));
    document.getElementById('result').value = result;
}

function decipher(){
    const str = document.getElementById('msg').value;
    let result = magmaCypher.decrypt(str);
    console.log(byteSize(str) + " " + byteSize(result));
    document.getElementById('result').value = result;
}

const byteSize = str => new Blob([str]).size;

function strEncodeUTF16(str) {
    var buf = new ArrayBuffer(str.length*2);
    var bufView = new Uint16Array(buf);
    for (var i=0, strLen=str.length; i < strLen; i++) {
      bufView[i] = str.charCodeAt(i);
    }
    return bufView;
}