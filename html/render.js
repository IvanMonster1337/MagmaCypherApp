let cipherButton = document.getElementById('cipher');
let decipherButton = document.getElementById('decipher');
const merm = document.getElementById('merm');
const nextButton = document.getElementById('nextDiagram');
const previousButton = document.getElementById('previousDiagram');
const visBox = document.getElementById('visBox');
const buttons = document.getElementById('buttons');
const fileButton = document.getElementById('fileButton');
const msgButton = document.getElementById('msgButton');
let url;

const msgButtons = `<div class="columns is-vcentered">
<div class="column is-two-fifths">
  <label class="label">Message to cipher</label>
  <div class="control">
    <textarea id="msg" class="textarea is-primary" placeholder="Cipher message"></textarea>
  </div>
</div>
<div class="column is-one-fifths is-centered">
  <div class="block">
    <div class="control">
      <textarea class="textarea is-primary" type="text" id="key" placeholder="Key"></textarea>
    </div>
  </div>
  <div class="block">
    <div class="buttons is-centered">
      <button id="cipher" class="button is-primary is-outlined">Cipher</button>
      <button id="decipher" class="button is-primary is-outlined">Decipher</button>
    </div>
  </div>
</div>
<div class="column is-two-fifths">
  <div class="control">
    <label class="label">Use 'Decipher' button to decipher this message</label>
    <textarea id="result" class="textarea" readonly placeholder="Ciphered message"></textarea>
  </div>
</div>
</div>`;

const fileButtons=`<div class="columns is-vcentered">
<div class="column is-one-fifths">
  <label class="label">File to cipher/decipher</label>
  <div class="control">
    <input type="file" id="cyphFile">
  </div>
</div>
<div class="column is-three-fifths is-centered">
  <div class="block">
    <div class="control">
      <textarea class="textarea is-primary" type="text" id="key" placeholder="Key"></textarea>
    </div>
  </div>
  <div class="block">
    <div class="buttons is-centered">
      <button id="cipher" class="button is-primary is-outlined">Cipher</button>
      <button id="decipher" class="button is-primary is-outlined">Decipher</button>
    </div>
  </div>
</div>
<div class="column is-one-fifths">
  <div class="control">
    <label class="label">Result:</label>
    <button id="resultButton" class="button is-info" disabled>Download file</button>
  </div>
</div>
</div>`;

fileButton.onclick = setFileMode;
msgButton.onclick = setMessageMode;

nextButton.onclick = goNext;
previousButton.onclick = goPrevious;

let index = -1;
let blockIndex = 0;
let encrypted;
let decrypted;
let decryptMode = false;

setMessageMode();

String.prototype.replaceAll = function(str1, str2, ignore) 
{
    return this.replace(new RegExp(str1.replace(/([\/\,\!\\\^\$\{\}\[\]\(\)\.\*\+\?\|\<\>\-\&])/g,"\\$&"),(ignore?"gi":"g")),(typeof(str2)=="string")?str2.replace(/\$/g,"$$$$"):str2);
} 

function setFileMode(){
    buttons.innerHTML = fileButtons;
    msgMode = false;
    cipherButton = document.getElementById('cipher');
    decipherButton = document.getElementById('decipher');
    cipherButton.onclick = ciphFile;
    decipherButton.onclick = deciphFile;
}

function setMessageMode(){
    buttons.innerHTML = msgButtons;
    msgMode = true;
    cipherButton = document.getElementById('cipher');
    decipherButton = document.getElementById('decipher');
    cipherButton.onclick = ciphMsg;
    decipherButton.onclick = deciphMsg;
}

function ciphMsg(){
    const str = document.getElementById('msg').value;
    if(str === ""){
        return;
    }
    const key = document.getElementById('key').value;
    const arr = strEncodeUTF8(str);
    cipher(arr, key);
}

async function ciphFile(){
    const file = document.getElementById('cyphFile').files[0];
    var reader = new FileReader();
    reader.onload = () => {
        let arr = new Uint8Array(reader.result);
        console.log(arr);
        const key = document.getElementById('key').value;
        cipher(arr, key);
    }

    reader.readAsArrayBuffer(file);
}

function deciphMsg(){
    const arr = encrypted.result;
    const key = document.getElementById('key').value;
    decipher(arr, key);
}

async function deciphFile(){
    const file = document.getElementById('cyphFile').files[0];
    var reader = new FileReader();
    reader.onload = () => {
        let arr = new Uint8Array(reader.result);
        console.log(arr);
        const key = document.getElementById('key').value;
        decipher(arr, key);
    }

    reader.readAsArrayBuffer(file);
}

function cipher(arr, key){
    let xhr = new XMLHttpRequest();
    console.log(strEncodeUTF8(arr));
    xhr.open('POST', '/encrypt', true);
    xhr.onreadystatechange = function() {
        if (xhr.readyState === 4) {
            encrypted = JSON.parse(xhr.response);
            console.log(encrypted);
            if(msgMode)
            {
                document.getElementById('result').value = String.fromCharCode.apply(null, Uint8Array.from(encrypted.result));
            }
            else{
                url = URL.createObjectURL(new Blob([Uint8Array.from(encrypted.result)], {type: 'application/octet-stream'}));
                document.getElementById('resultButton').onclick = openURL;
                document.getElementById('resultButton').disabled = false;
            }
            cipherButton.classList.remove("is-loading");
            decryptMode = false;
            blockIndex = 0;
            index = -1;
            generateKey(encrypted.keyGen.keys);
        }
    }
    xhr.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
    console.log(JSON.stringify({arr : arr, hex: key}));
    cipherButton.classList.add("is-loading");
    xhr.send(JSON.stringify({arr : arr, hex: key}));
}

function decipher(arr, key){
    let xhr = new XMLHttpRequest();
    xhr.open('POST', '/decrypt', true);
    xhr.onreadystatechange = function() {
        if (xhr.readyState === 4) { 
            decrypted = JSON.parse(xhr.response);
            if(msgMode){
                let str = String.fromCharCode.apply(null, Uint8Array.from(decrypted.result));
                document.getElementById('msg').value = str;
            }
            else{
                url = URL.createObjectURL(new Blob([Uint8Array.from(decrypted.result)], {type: 'application/octet-stream'}));
                document.getElementById('resultButton').onclick = openURL;
                document.getElementById('resultButton').disabled = false;
            }
            decipherButton.classList.remove("is-loading");
            decryptMode = true;
            blockIndex = 0;
            index = -1;
            generateKey(decrypted.keyGen.keys);
        }
    }
    xhr.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
    console.log(JSON.stringify({arr : arr, hex: key}));
    decipherButton.classList.add("is-loading");
    xhr.send(JSON.stringify({arr : arr, hex : key}));
}

function strEncodeUTF8(str) {
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

async function goNext(){
    nextButton.classList.add("is-loading");
    setTimeout(() => {
    if(!decryptMode){
        if(encrypted !== undefined){
            if(index == 31){
                blockIndex++;
                index = 0;
            }
            else{
                index++;
            }
            generateDiagram(encrypted.blocks, blockIndex, index, encrypted.keyGen.keys);
        }
    }
    else{
        if(decrypted !== undefined){
            if(index == 31){
                blockIndex++;
                index = 0;
            }
            else{
                index++;
            }
            generateDiagram(decrypted.blocks, blockIndex, (31-index), decrypted.keyGen.keys);
        }
    }
    nextButton.classList.remove("is-loading");}, 500);
    previousButton.style.visibility = "visible";
}

async function goPrevious(){
    previousButton.classList.add("is-loading");
    setTimeout(() => {if(!decryptMode){
        if(encrypted !== undefined){
            if(index == 0){
                if(blockIndex == 0){
                    generateKey(encrypted.keyGen.keys);
                    previousButton.style.visibility = "hidden";
                    return;
                }
                blockIndex--;
                index = 31;
            }
            else{
                index--;
            }

            generateDiagram(encrypted.blocks, blockIndex, index, encrypted.keyGen.keys);
        }
    }
    else{
        if(decrypted !== undefined){
            if(index == 0){
                if(blockIndex == 0){
                    generateKey(encrypted.keyGen.keys);
                    previousButton.style.visibility = "hidden";
                    previousButton.classList.remove("is-loading");
                    return;
                }
                blockIndex--;
                index = 31;
            }
            else{
                index--;
            }

            generateDiagram(decrypted.blocks, blockIndex, (31-index), decrypted.keyGen.keys);
        }
    }
    previousButton.classList.remove("is-loading");}, 500);
}

function generateDiagram(blocks, blockIndex, index, keys) {
            let block1 = blocks[blockIndex].bef[index];
            let block2 = blocks[blockIndex].aft[index];
            let l = block1.substring(0,11);
            let r = block1.substring(12);
            let l2 = block2.substring(0,11);
            let r2 = block2.substring(12);
            let key = keys[index];
            let str = `stateDiagram-v2 
                state "${r}" as r
                state "${l}" as l
                state "${r2}" as r2
                state "${l2}" as l2
                state "${key}" as key
                state "${block1}" as block1
                state "${block2}" as block2
                state Block{ 
                    block1 --> l 
                    block1 --> r
                } 
                r --> mod32 
                key --> mod32 
                mod32 --> T 
                T --> <<11 
                l --> XOR 
                <<11 --> XOR 
                XOR --> r2 
                r --> l2 
                state ResultBlock{ 
                    r2 --> block2 
                    l2 --> block2 
                }`
            merm.innerHTML = `<h1 align="center">Block ${blockIndex+1}</h1> <h1 align="center">Iteration ${decryptMode ? 32-index : index+1}</h1> <div class="mermaid">` + str + `</div>`;
            initMermaid();
}

function generateKey(keys){
    let K = keys.slice(0,7).join(':');
    let str = `
    %%{init: {'themeVariables': { 'fontSize': '20px'}}}%%
    graph TD
    K{{${K}}}
    k1([${keys[0]}])
    k2([${keys[1]}])
    k3([${keys[2]}])
    k4([${keys[3]}])
    k5([${keys[4]}])
    k6([${keys[5]}])
    k7([${keys[6]}])
    k8([${keys[7]}])
    K --> k1
    K --> k2
    K --> k3
    K --> k4
    K --> k5
    K --> k6
    K --> k7
    K --> k8
    k1 --> K1
    k2 --> K2
    k3 --> K3
    k4 --> K4
    k5 --> K5
    k6 --> K6
    k7 --> K7
    k8 --> K8
    K1 --> K9
    K9 --> K17
    K17 --> K32
    K2 --> K10
    K10 --> K18
    K18 --> K31
    K3 --> K11
    K11 --> K19
    K19 --> K30
    K4 --> K12
    K12 --> K20
    K20 --> K29
    K5 --> K13
    K13 --> K21
    K21 --> K28
    K6 --> K14
    K14 --> K22
    K22 --> K27
    K7 --> K15
    K15 --> K23
    K23 --> K26
    K8 --> K16
    K16 --> K24
    K24 --> K25`;
    merm.innerHTML = `<h1 align="center">Key generation</h1> <div class="mermaid">` + str + `</div>`;
    initMermaid();
    visBox.style.visibility = "visible";
}

function openURL(){
    window.open(url);
}