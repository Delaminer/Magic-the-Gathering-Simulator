var path = require('path');
const express = require('express');
const app = express();
const http = require('http');
const server = http.createServer(app);
const fs = require('fs');
var dir = path.join(__dirname, 'public');

app.use(express.static(__dirname));
/*
//This is not needed anymore
app.use((req, res) => {
    req.url = req.url.replace(/%20/g,' ')
    fs.readFile('.' + req.url, 'utf8', (err, data) => {
        if (err) {
            res.writeHead(404, {'Content-Type': 'text/html'})
            return res.end("404 error: file not found")
        }
        let type = 'text/html'
        if (req.url.includes('css'))
            type = 'text/css'
        if (req.url.includes('png'))
            type = 'image/png'
        res.writeHead(200, {'Content-Type':type})
        res.write(data)
        return res.end()
    })
  //res.send('<h1>Hello world</h1>');
});
*/

let port = 80;
server.listen(port, () => {
    console.log(`listening on *:${port}`);
});