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

    query_fechas = "(ORD.fecha_ini_extremo > '" + mesPasado + "' AND ORD.fecha_ini_extremo < '" + mesSiguiente + "') OR (ORD.fecha_fin_extremo > '" + mesPasado + "' AND ORD.fecha_fin_extremo < '" + mesSiguiente + "')"; 

    query_string = "SELECT ORD.geo_x, ORD.geo_y, ORD.nro_orden, ORD.ubic_tecnica_desc, ORD.fecha_ini_extremo, ORD.fecha_fin_extremo, ORD.clave_modelo, TOB.name AS 'tipo_obra', SOB.name AS 'status_obra' " +
                   "FROM ordenes AS ORD " +
                   "INNER JOIN tipos_obra AS TOB " +
                   "ON ORD.tipo_obra_id = TOB.tipo_id " +
                   "INNER JOIN status_obra AS SOB " +
                   "ON ORD.status_id = SOB.status_id " + 
                   "WHERE TOB.name = '" + tipo_obra + "' " + 
                   "AND SOB.name = '" + status + "' " +
                   "AND (" + query_fechas + ") " +
                   "GROUP BY ORD.nro_orden";                 

    connection.query(query_string, function(err,rows){
      // Si hubo algo mal en la conexion o query a la base, 
      // que el callback devuelva el error sin data
      if (err) {
        callback(err, null);
        return;
      }

      console.log("Se encontraron " + rows.length + " resultados de " + tipo_obra + " " + status);

      var geojson = {};
      geojson['type'] = 'FeatureCollection';
      geojson['features'] = [];
       
      for (var i=0; i<rows.length; i++) {
        var fechaInicio = new Date(rows[i]["fecha_ini_extremo"]);
        var fechaFin = new Date(rows[i]["fecha_fin_extremo"]);
        var inicio = ("0" + fechaInicio.getDate()).slice(-2) + "/" + ("0" + (fechaInicio.getMonth() + 1)).slice(-2) + "/" + fechaInicio.getFullYear();
        var fin = ("0" + fechaFin.getDate()).slice(-2) + "/" + ("0" + (fechaFin.getMonth() + 1)).slice(-2) + "/" + fechaFin.getFullYear();
        
        var newFeature = {
          "type": "Feature",
          "geometry": {
            "type": "Point",
            "coordinates": [rows[i]["geo_x"], rows[i]["geo_y"]]
          },
          "properties": {
            "direccion": rows[i]["ubic_tecnica_desc"].split("-")[0],
            "fecha_inicio": inicio,
            "fecha_fin": fin,
            "status": rows[i]["status_obra"],
            "tipo_obra": rows[i]["tipo_obra"]
          }
        }
        geojson['features'].push(newFeature);
      }
      var json = JSON.stringify(geojson);
      
      callback(null, json);
    }); 
  }
}