const express = require('express');
const magmaCypher = require('./build/Release/magma_cypher');
const bodyParser = require('body-parser');

const app = express();
const port = process.env.PORT || 3000;
app.use(bodyParser.json(({limit: '50mb'})));
app.use("/static", express.static('./html/'));


app.get('/', (req, res) => {
  res.charset = 'utf-16';  
  res.sendFile(__dirname + '/html/index.html');
});

app.post('/encrypt', (req, res) => {
    let arr = Uint8Array.from(Object.values(req.body.arr));
    const hex = Uint8Array.from(Buffer.from(req.body.hex, 'hex'));
    //console.log(arr);
    let result = magmaCypher.encrypt(arr, hex);
    result.result = Object.values(result.result);
    //console.log(result);
    let toSend = JSON.stringify(result);
    //console.log(toSend);
    res.send(toSend);
    res.end();
});

app.post('/decrypt', (req, res) => {
    const hex = Uint8Array.from(Buffer.from(req.body.hex, 'hex'));
    let arr = Uint8Array.from(Object.values(req.body.arr));
    let result = magmaCypher.decrypt(arr, hex);
    //console.log(result);
    result.result = Object.values(result.result);
    let toSend = JSON.stringify(result);
    //console.log(toSend);
    res.send(toSend);
    res.end();
});

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`)
})