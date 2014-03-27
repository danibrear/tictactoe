'use strict';

var express = require('express');
var app = express();

app.use(express.static('public'));

app.listen(8000);

app.get('/', function(req, res) {
  res.sendfile('./index.html');
});

