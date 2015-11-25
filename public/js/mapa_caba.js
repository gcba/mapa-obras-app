var svgCABA = d3.select("#mapa-contenedor")
    .append("svg")
    .attr("width", 300)
    .attr("height", 280)
    .attr("x", 0)
    .attr("y", 0);

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
        .attr("d", d3.geo.path().projection(d3.geo.mercator().scale(135000 / 2).center([-58.14900, -34.69500])))
        .style("fill", "#FAFAFA")
        .on("mouseover", function(d) {
            d3.select(this).style("fill", "#DBDBDB");
        })
        .on("mouseout", function() {
            if(!d3.select(this).classed("zoom")) {
                d3.select(this).style("fill", "#FAFAFA");
            }
        });
}   