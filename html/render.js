const cipherButton = document.getElementById('cipher');
const decipherButton = document.getElementById('decipher');
const logButton = document.getElementById('logButton');
cipherButton.onclick = cipher;
decipherButton.onclick = decipher;
logButton.onclick = getLog;
let encrypted;


async function cipher(){
    let xhr = new XMLHttpRequest();
    const str = document.getElementById('msg').value;
    const key = document.getElementById('key').value;
    const arr = await strEncodeUTF8(str);
    console.log(strEncodeUTF8(arr));
    xhr.open('POST', '/encrypt', true);
    xhr.onreadystatechange = function() {
        if (xhr.readyState === 4) {
            encrypted = Object.values(JSON.parse(xhr.response).arr);
            document.getElementById('result').value = String.fromCharCode.apply(null, Uint8Array.from(encrypted));
            cipherButton.classList.remove("is-loading");
        }
    }
    xhr.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
    console.log(JSON.stringify({arr : arr, hex: key}));
    cipherButton.classList.add("is-loading");
    xhr.send(JSON.stringify({arr : arr, hex: key}));
}

async function decipher(){
    const key = document.getElementById('key').value;
    let xhr = new XMLHttpRequest();
    console.log(encrypted);
    xhr.open('POST', '/decrypt', true);
    xhr.onload = () => {  
        console.log(JSON.parse(xhr.response));
        let decrypted = Object.values(JSON.parse(xhr.response).arr);
        document.getElementById('msg').value = String.fromCharCode.apply(null, Uint8Array.from(decrypted));
        decipherButton.classList.remove("is-loading");
    }
    document.getElementById('msg').value = "";
    xhr.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
    console.log(JSON.stringify({arr : encrypted, hex: key}));
    decipherButton.classList.add("is-loading");
    xhr.send(JSON.stringify({arr : encrypted, hex : key}));
}

async function getLog(){
    let xhr = new XMLHttpRequest();
    xhr.open('GET', '/log', true);
    xhr.onload = () => {  
        console.log(JSON.parse(xhr.response));
        let log = JSON.parse(xhr.response).log;
        document.getElementById('log').innerHTML = log.replace(/\n/g, "<br />");
        logButton.classList.remove('is-loading');
    }
    document.getElementById('log').innerHTML="";
    logButton.classList.add("is-loading");
    xhr.send();
}

async function strEncodeUTF8(str) {
    str = str.toString();
    var buf = new ArrayBuffer(str.length);
    var bufView = new Uint8Array(buf);
    for (var i=0, strLen=str.length; i < strLen; i++) {
        if(str.charCodeAt[i] > 255){
            throw new Error('String contains wrong symbols');
        }

        bufView[i] = str.charCodeAt(i);
    }
    return bufView;
}