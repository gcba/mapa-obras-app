var express = require('express');
var app = express();
var path = require("path");

app.use("/public", express.static(__dirname + '/public'));

var mysql = require('mysql')

var connection = mysql.createConnection({
  host     : 'localhost',
  user     : 'root',
  password : '5Gonz4lol'
});

connection.connect(function(err){
    if(!err) {
        console.log("Database is connected ... \n\n");  
    } else {
        console.log("Error connecting database ... \n\n");  
    }
});

app.get('/ejemploPuntos', function (req, res) {
  res.sendFile(path.join(__dirname + '/public/ejemploPuntos.html'));
});

var server = app.listen(3000, function () {
  var host = server.address().address;
  var port = server.address().port;

  console.log('Example app listening at http://%s:%s', host, port);
});

connection.end();