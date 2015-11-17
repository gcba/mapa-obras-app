var express = require('express');
var app = express();

var url = require("url")
var hbs = require('hbs'); 
var bodyParser = require('body-parser');

app.set('view engine', 'html');
app.engine('html', hbs.__express);
app.use(bodyParser.json());    
app.use(express.static('public'));

// Conexión a la base
// TODO: mover esto a un archivo externo de config
var mysql = require('mysql')
var connection = mysql.createConnection({
  host     : 'localhost',
  user     : 'root',
  password : '5Gonz4lol',
  database : 'mantenimiento'
});
connection.connect(function(err){
    if(!err) {
        console.log("Database is connected ... \n\n");  
    } else {
        console.log("Error connecting database ... \n\n");  
    }
});

var obrasEngine = require('./obras');

// HOME
app.get('/', function (req, res) {
  res.render('index',{title:"Obras"});
});

// Endpoint para buscar las obras dependiendo del filtro que 
// esté seleccionado
app.get('/ordenes', function (req, res) {
  res.setHeader('Content-Type', 'application/json');
  var url_parts = url.parse(req.url, true);
  var query = url_parts.query;
  var tipo_obra = query["tipo_obra"];
  var status = query["status"];

  obrasEngine.getObras(connection, tipo_obra, status, function(error, data) {
      if (error) {
        throw error;
      }
      // console.log("\nJSON getting sent to the front: ")
      // console.log(data);
      res.send(data);
  });
});

var server = app.listen(3000, function () {
  var host = server.address().address;
  var port = server.address().port;

  console.log('Example app listening at http://%s:%s', host, port);
});

// Execute commands in clean exit
process.on('exit', function () {
    console.log('Exiting ...');
    connection.end()
});

// happens when you press Ctrl+C
process.on('SIGINT', function () {
    console.log( '\nGracefully shutting down from  SIGINT (Crtl-C)' );
    connection.end()
    process.exit();
});

// usually called with kill
process.on('SIGTERM', function () {
    console.log('Parent SIGTERM detected (kill)');
    connection.end()
    // exit cleanly
    process.exit(0);
});