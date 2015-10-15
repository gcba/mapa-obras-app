module.exports = {
  getObras: function(connection, tipo_obra, status, callback) {
    var query_obra;
    var query_status = "";
    switch (tipo_obra) {
      case "1":
        query_obra = "clase_orden = 'ACME' || clase_orden = 'ACRE'";
        break;
      case "2":
        query_obra = "clase_orden = 'CAME' || clase_orden = 'CARE'";
        break;
    }
    query_string = "SELECT * FROM ordenes WHERE " + query_obra;
    console.log(query_string)

    connection.query(query_string, function(err,rows){
      // Si hubo algo mal en la conexion o query a la base, 
      // que el callback devuelva el error sin data
      if (err) {
        callback(err, null);
        return;
      }

      console.log('Data received from Db:');
      console.log(rows);

      var geojson = {};
      geojson['type'] = 'FeatureCollection';
      geojson['features'] = [];
       
      for (var i=0; i<rows.length; i++) {
        var newFeature = {
          "type": "Feature",
          "geometry": {
            "type": "Point",
            "coordinates": [rows[i]["geo_x"], rows[i]["geo_y"]]
          },
          "properties": {
            "clase_orden": rows[i]["clase_orden"],
            "clave_modelo": rows[i]["clave_modelo"],
            "fecha_inicio": rows[i]["fecha_ini_extremo"],
            "fecha_fin": rows[i]["fecha_fin_extremo"],
            "status": rows[i]["status_usuario"]
          }
        }
        geojson['features'].push(newFeature);
      }
      var json = JSON.stringify(geojson);
      
      callback(null, json);
    }); 
  }
}