'use strict';

var express = require('express');
var app = express();
app.use(express.static('public'));

const PORT = process.env.PORT || 8000;

app.listen(PORT);

console.log(`-- Listening on port ${PORT}`);

app.get('/', function(req, res) {
  res.sendfile('./index.html');
});
