// Definicion del namespace
var usig = usig || {};

usig.App = (function() {
    var mapa = null, layers = [];

    function redimensionarMapa() {
        $('#mapa').css('width', $(window).width()).css('height', $(window).height()).css('margin', 0);        
        if (mapa) {
            $('.olControlPanZoomBarUSIG').hide();
            mapa.updateSize();            
        }
    }

    function reposicionarControles() {
        $('.olControlPanZoomBarUSIG').css('left', 'auto').css('top', '15px').css('right', '15px').css('bottom', 'auto').show();
    }

    function crearPanelInfo() {
        // Panel de informacion
        $("#panel-informacion").show();
    }

    function cargarInfoComunas() {
        // Cargar info de comunas al mapa
        if (mapa) {
             $.ajax({
                type: "GET",
                url: "../data/comunas-centroide.csv",
                dataType: "text",
                success: function(data) { 
                    var comunas = $.csv.toObjects(data, {"separator": ";"});
                    mapa.comunas = comunas;
                }
             });
        }
    }

    function toTitleCase(str) {
        return str.replace(/\w\S*/g, function(txt){return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();});
    }

    function generatePopup(propiedades) {
        console.log(propiedades);    

        var dataPopup = { 
            "direccion": toTitleCase(propiedades.direccion), 
            "fecha_inicio": propiedades.fecha_inicio,
            "fecha_fin": propiedades.fecha_fin,
            "status": propiedades.status,
            "tipo_obra": propiedades.tipo_obra,
            "finalizada": propiedades.status == "Finalizado"
        };

        var source   = $("#tooltip-template").html();
        var template = Handlebars.compile(source);
        var content = template(dataPopup);

        return content;
    }

    function clickHandler(e, popup) {
    	if (popup) {
            // CSS del popup
            popup.div.style.borderTop = "30px solid #ffd600";
            popup.div.style.background = "#fafafa";
            popup.div.style.fontFamily = "Roboto";
            popup.div.style.lineHeight = "18px";
            popup.div.style.color = "#424242";

            var content=generatePopup(e.feature.attributes);
            
            popup.setContentHTML(content);
            popup.updateSize();

            // modificar altura del popup para sumarle los 30px de borde
            var heightPopup = popup.size.h;
            popup.div.style.height = (heightPopup + 30) + "px";

            popup.show();
    	}
    }    

    function hideLayerObra(name) {
    	if (layers.length > 0) {
    		for(var i=0,l=layers.length;i<l;i++) {
        		try {
        			mapa.removeLayer(layers[i]);
        		} catch(e) {
        			console.log(e);
        		}
    		}
    		layers = [];
    	}    	
    }

    function filtrarObras() {
        
        var tiposDeObra = $("input[name=tipo_obra]");
        var statusBx = $("input[name=status_obra]");
        
        var mostrarTodosStatus = false, 
            mostrarTodosTipoObra = false;

        // Si estan todos destilados, no hay filtro!
        var statusUnchecked = $("input[name=status_obra]:not(:checked)");
        if ( statusUnchecked.length == statusBx.length ) {
            mostrarTodosStatus = true;
        }

        var tiposDeObraUnchecked = $("input[name=tipo_obra]:not(:checked)");
        // Si estan todos destildados, mostrarTodos!
        if ( tiposDeObraUnchecked.length == tiposDeObra.length ) {
            mostrarTodosTipoObra = true;
        }
        
        // Loopeamos por todos y nos vamos fijando si mostramos o escondemos
        statusBx.each(function() {
            var statusChecked = $(this).prop("checked");
            var statusVal = $(this).val();

            tiposDeObra.each(function() {
                var tipoObraChecked = $(this).prop("checked");
                var tipoObraVal = $(this).val();

                var nameLayer = "obras" + tipoObraVal + statusVal;
                var capaFiltro = mapa.api.getLayersByName(nameLayer)[0];
                
                // Cuando mostrar la capa
                if ((statusChecked && tipoObraChecked) || 
                    (statusChecked && mostrarTodosTipoObra) ||
                    (mostrarTodosStatus && tipoObraChecked) ||
                    (mostrarTodosStatus && mostrarTodosTipoObra)) 
                {
                    if (!capaFiltro.getVisibility()) {
                        capaFiltro.setVisibility(true);
                    }
                }

                // Cuando esconder la capa
                if ((!statusChecked && !mostrarTodosStatus) || 
                    (!tipoObraChecked && !mostrarTodosTipoObra)) 
                {
                    if (capaFiltro.getVisibility()) {
                        capaFiltro.setVisibility(false);
                    }
                }
            });
        });
    }

    function inicializarLayers() {
    	var tiposDeObra = $("input[name=tipo_obra]"),
            status = $('input[name=status_obra]');

        tiposDeObra.each(function(){
            var tipo = $(this).val();
            status.each(function(){
                var nameLayer = "obras" + tipo + $(this).val();
                layers.push(mapa.addVectorLayer(nameLayer, { 
                    url: window.location.href + "ordenes?tipo_obra="+ tipo + "&status=" + $(this).val(),
                    format: 'geojson',
                    symbolizer: {
                        externalGraphic: usig.App.config.symbols_url,
                        pointRadius: usig.App.config.pointRadius
                    },
                    minPointRadius: usig.App.config.minPointRadius,
                    popup: true,
                    onClick: clickHandler
                })); 
            });
        });
    }

    function stopPropagation(ev) {
        if (ev.stopPropagation) {
            ev.stopPropagation();
        } else {
            ev.cancelBubble = true;
        }            
    }

    function inicializar(onReady) {        

        // Creacion de los elementos flotantes sobre el mapa
        crearPanelInfo();            

        // Cambia la ubicaciÃ³n del control de zoom y agranda el panel de info
        reposicionarControles();

        // Cargar centroides 
        cargarInfoComunas();

        $(window).on('resize', function() {
            redimensionarMapa();
            reposicionarControles.defer(200);
        });
        
        // Zoomear cuando el usuario apreta las flechitas
        $(document).keydown(function(e) {
            switch(e.which) {
                case 189: // minus
                    mapa.api.zoomOut();
                    break;

                case 187: // plus
                    mapa.api.zoomIn();
                    break;

                default: return; // exit this handler for other keys
            }
        });

        // zoom in en la comuna
        d3.selectAll("g.caba path")
            .on("click", function(d) {
                // estilos de hover, color, etc.
                if(!d3.select(this).classed("zoom")) {
                    d3.select(this).classed("zoom", true);
                }
                var comunas = d3.selectAll("g.caba path");
                comunas.filter(function (x) { return d.properties.comuna != x.properties.comuna; })
                    .classed("zoom", false)
                    .style("fill", "#FAFAFA");    

                var comuna = d.properties.comuna;
                var comuna_x = mapa.comunas[comuna-1].x;
                var comuna_y = mapa.comunas[comuna-1].y;
                mapa.api.setCenter([comuna_x, comuna_y], 4);
            });

        // Esto es para evitar que los clicks sobre los elementos flotantes sobre el
        // mapa sean capturados por el mapa y generen movimientos no previstos        
        $('#b, #mapSelector, #panel-informacion, .selectboxit-container')
            .on('mousedown', stopPropagation)
            .on('dblclick', stopPropagation);
        
        $("input[name=tipo_obra], input[name=status_obra]").change(function() {
            filtrarObras();
        });
        
        inicializarLayers();
    }

    return {
    	init: function(onReady) { 
            // Elimino el "Cargando..."
            $('#mapa').empty();

            // El div del mapa tiene que ocupar toda la ventana
            redimensionarMapa();

            // Destildeo los filtros
            $("input[type='checkbox']").attr("checked", false);

            var mapOptions = {
                divId: 'mapa',
            	trackVisits: false,
            	includeToolbar: false,
            	zoomBar: true,
            	includeMapSwitcher: false,
            	goToZoomLevel: 7,
                baseLayer: usig.App.config.baseLayer,
                // Le cambio el extent inicial para que la Ciudad no quede tapada por el panel de info
                initBounds: usig.App.config.initBounds,
                onReady: function() { 
                    inicializar.defer(200, this, [onReady]); // Esto es para que funcione en IE 10
                }
            };
            
            mapa = new usig.MapaInteractivo(mapOptions.divId, mapOptions);
    	}
    };
})();