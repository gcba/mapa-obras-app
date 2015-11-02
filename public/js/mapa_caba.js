var mapaComunas = d3.select("#panel-informacion div.content").append("g")
                     .attr("id", "mapaCABA");

var svgCABA = d3.select("#mapaCABA")
    .append("svg")
    .attr("width", 300)
    .attr("height", 300)
    .attr("x", 500)
    .attr("y", 200)
    .attr("style", "margin-top: 20px;");

queue()
    .defer(d3.json, "data/comunas.json")
    .await(ready);

function ready(error, comunas, data) {

    svgCABA.select(".caba").remove();
    svgCABA.select(".etiqueta").remove();

    svgCABA.append("g")
        .attr("class", "caba")
        .selectAll("path")
        .data(topojson.feature(comunas, comunas.objects.comunas).features)
        .enter().append("path")
        .attr("d", d3.geo.path().projection(d3.geo.mercator().scale(157000 / 2).center([-58.20000, -34.68102])))       
}   