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

    function clickHandler(e, popup) {
    	if (popup) {
    		$div = $(popup.contentDiv);
            var content = '<ul style="width: 300px; list-style-type: none; margin: 5px 0; padding: 0;">';
            $.each(e.feature.attributes, function(k, v) {
                if ((k == "fecha_inicio" || k == "fecha_fin") && v != null) {
                    v = v.toString().split("T")[0]
                }
                content+='<li><b>'+k+'</b>: '+v+'</li>';
            });
            content+='</ul>';
            $div.append(content);
            popup.updateSize();
    		popup.show();
    	}
    }    

    function removeLayers() {
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

    function filtrarObras(checkbox) {
        console.log(checkbox);
    }

    function cargarLayers() {
    	var tiposDeObra = $("input[name=tipo_obra]"),
    		status = $('input[name=status_obra]');
    	removeLayers();

    	tiposDeObra.each(function(k, v){
            layers.push(mapa.addVectorLayer('Obras', { 
    		  url: window.location.href + "ordenes?tipo_obra="+ $(this).val(),
    		  format: 'geojson',
    		  symbolizer: {
    			    externalGraphic: usig.App.config.symbols_url,
    			    backgroundGraphic: usig.App.config.backgrounds_url,
    			    pointRadius: usig.App.config.pointRadius
    			  },
    		  minPointRadius: usig.App.config.minPointRadius,
    		  popup: true,
    		  onClick: clickHandler
    		}));
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

        $(window).on('resize', function() {
            redimensionarMapa();
            reposicionarControles.defer(200);
        });
        
        // Esto es para evitar que los clicks sobre los elementos flotantes sobre el
        // mapa sean capturados por el mapa y generen movimientos no previstos        
        $('#b, #mapSelector, #panel-informacion, .selectboxit-container')
            .on('mousedown', stopPropagation)
            .on('dblclick', stopPropagation);
        
        $("input[name=tipo_obra], input[name=status_obra]").change(filtrarObras(this));
        
        cargarLayers();
    }

    return {
    	init: function(onReady) { 
            // Elimino el "Cargando..."
            $('#mapa').empty();

            // El div del mapa tiene que ocupar toda la ventana
            redimensionarMapa();

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