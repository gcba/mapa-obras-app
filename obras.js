module.exports = {
  getObras: function(connection, tipo_obra, status, callback) {
    var query_obra;
    var query_status = "";
    
    // Set fechas para los queries. Calcular un mes y un mes adelante
    var d = new Date();
    var minusMonth = d.getMonth();
    var plusMonth = d.getMonth() + 2;
    var minusYear = d.getFullYear();
    var plusYear = d.getFullYear();
    var day = d.getDate();
    if (minusMonth == 0) {
      minusMonth = 12;
      minusYear = minusYear - 1;
    }
    if (plusMonth == 13) {
      plusMonth = 1;
      plusYear = plusYear + 1;
    }
    // Setear dia a 28 si alguno de los meses para atras o para adelante es febrero
    if ((minusMonth == 2 || plusMonth == 2) && (day > 28)) {
      day = 28;
    }
    // Setear dia a 30 en caso de ser 31 porque sino hay quilombo con los meses
    if (day == 31) { day = 30; }
    
    var mesPasado = minusYear + "-" + minusMonth + "-" + day;
    var mesSiguiente = plusYear + "-" + plusMonth + "-" + day;

    query_obra = "(SELECT tipo_id FROM tipos_obra WHERE name='" + tipo_obra + "')";
    query_status = "(SELECT status_id FROM status_obra WHERE name='" + status + "')";
    query_fechas = "(fecha_ini_extremo > '" + mesPasado + "' AND fecha_ini_extremo < '" + mesSiguiente + "') OR (fecha_fin_extremo > '" + mesPasado + "' AND fecha_fin_extremo < '" + mesSiguiente + "')"; 
    query_nro_orden = "GROUP BY nro_orden"

    query_string = "SELECT * FROM ordenes WHERE tipo_obra_id=" + query_obra + " AND status_id=" + query_status + " AND " + query_fechas + " " + query_nro_orden;
    console.log(query_string);

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