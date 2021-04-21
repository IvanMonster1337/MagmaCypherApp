const express = require('express');
const magmaCypher = require('./build/Release/magma_cypher');
const bodyParser = require('body-parser');

let latestEncrypt;

const app = express();
const port = process.env.PORT;
app.use(bodyParser.json());
app.use("/static", express.static('./html/'));


app.get('/', (req, res) => {
  res.charset = 'utf-16';  
  res.sendFile(__dirname + '/html/index.html');
})

app.post('/encrypt', (req, res) => {
    console.log(req.body.arr);
    let arr = Uint8Array.from(Object.values(req.body.arr));
    console.log(arr);
    let result = magmaCypher.encrypt(arr);
    latestEncrypt = result;
    console.log(result);
    let toSend = JSON.stringify({arr : result});
    console.log(toSend);
    res.send(toSend);
    res.end();
})

app.post('/decrypt', (req, res) => {
    console.log(req.body.arr);
    let arr = Uint8Array.from(Object.values(req.body.arr));
    let result = magmaCypher.decrypt(arr);
    console.log(result);
    let toSend = JSON.stringify({arr : result});
    console.log(toSend);
    res.send(toSend);
    res.end();
})

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`)
})