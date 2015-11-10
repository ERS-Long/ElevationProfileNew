define([
    'dojo/_base/declare',
    'dijit/_WidgetBase',
    'dijit/_TemplatedMixin',
    'dijit/_WidgetsInTemplateMixin',
    'dojo/text!./ElevationProfile/templates/Elevation.html',
    'esri/dijit/ElevationProfile',
    'esri/toolbars/draw',
    'esri/symbols/SimpleLineSymbol',
    'esri/symbols/CartographicLineSymbol',
    'esri/graphic',
    'esri/units',
    'esri/Color',
    'dojo/dom',
    'dojo/on',
    'dojo/query',
    'dojo/domReady!',
    'dojo/topic',
    'dojo/aspect',
    'dojo/_base/lang',
    'dijit/registry',
    'dijit/layout/ContentPane',
    'xstyle/css!./ElevationProfile/css/Draw.css'
], function (
    declare,
    _WidgetBase,
    _TemplatedMixin,
    _WidgetsInTemplateMixin,
    template,
    ElevationsProfileWidget,
    Draw,
    SimpleLineSymbol, CartographicLineSymbol, Graphic, Units, Color,
    dom,
    on, query, domReady, topic, aspect, lang, registry, ContentPane
) {

    var flag;
    var tb, epWidget, lineSymbol;
    var map;
    var linetype, measureUnit;
    var pane;
    return declare([_WidgetBase, _TemplatedMixin, _WidgetsInTemplateMixin], {

        widgetsInTemplate: true,
        templateString: template,
        map: true,

        postCreate: function () {
            this.inherited(arguments);
            map = this.map;

            if (this.parentWidget) {
                if (this.parentWidget.toggleable) {
                    this.own(aspect.after(this.parentWidget, 'toggle', lang.hitch(this, function () {
                        this.onLayoutChange(this.parentWidget.open);
                    })));
                }
            } 
        },

        initElevation: function () {

            console.log(query(".attributesTabContainer"));

            if (!pane)
            {
                var tabsid = query(".attributesTabContainer")[0].id;
                var tabs = registry.byId(tabsid);

                pane = new ContentPane({ title: "Elevation Table", content: '<div id="profileChartNode2"></div>' });            
                tabs.addChild(pane);
                tabs.selectChild(pane);    
            }

            //open the bottom pane
            topic.publish('viewer/togglePane', {
                pane: 'bottom',
                show: 'block'
            });                     

            initToolbar(linetype.toLowerCase());
            measureUnit = dijit.byId('unitsSelect').value;
            console.log(measureUnit);

            lineSymbol = new CartographicLineSymbol(
                    CartographicLineSymbol.STYLE_SOLID,
                    new Color([255, 0, 0]), 2,
                    CartographicLineSymbol.CAP_ROUND,
                    CartographicLineSymbol.JOIN_MITER, 2
            ); 

            //Chart options
            var chartOptions = {
                title: "My Elevation Profile Chart",
                chartTitleFontSize: 14,
                axisTitleFontSize: 11,
                axisLabelFontSize: 9,
                indicatorFontColor: '#eee',
                indicatorFillColor: '#666',
                titleFontColor: '#eee',
                axisFontColor: '#ccc',
                axisMajorTickColor: '#333',
                skyTopColor: "#B0E0E6",
                skyBottomColor: "#4682B4",
                waterLineColor: "#eee",
                waterTopColor: "#ADD8E6",
                waterBottomColor: "#0000FF",
                elevationLineColor: "#D2B48C",
                elevationTopColor: "#8B4513",
                elevationBottomColor: "#CD853F"
              };  

            var profileParams = {
                map: map,
                profileTaskUrl: "http://elevation.arcgis.com/arcgis/rest/services/Tools/ElevationSync/GPServer",
                scalebarUnits: Units.MILES,
                chartOptions: chartOptions
            };

            if (!epWidget)
            {
                epWidget = new ElevationsProfileWidget(profileParams, dom.byId("profileChartNode2"));
            }
            epWidget.startup();


            function initToolbar(toolName) {
                if (epWidget)
                {
                    epWidget.clearProfile(); //Clear profile
                }

                map.graphics.clear();
                tb = new Draw(map);
                tb.on("draw-end", addGraphic);
                tb.activate(toolName);
                map.disableMapNavigation();
            }

            function addGraphic(evt) {
                //deactivate the toolbar and clear existing graphics
                tb.deactivate();
                map.enableMapNavigation();
                var symbol = lineSymbol;
                map.graphics.add(new Graphic(evt.geometry, symbol));
                epWidget.set("profileGeometry", evt.geometry);
                console.log(measureUnit);
                epWidget.set("measureUnits", measureUnit);
            }
        },

        onUnitChange: function (newValue) {
            measureUnit = newValue.toString();
        },

        onPolyline: function()
        {
            linetype = "Polyline";
            this.disconnectMapClick();
            this.initElevation();
        },

        onFreehandPolyline: function()
        {
            linetype = "FreehandPolyline";
            this.disconnectMapClick();
            this.initElevation();
        },        

        onClear: function()
        {
            epWidget.clearProfile();
            this.map.graphics.clear();
            this.connectMapClick();
        },

        onLayoutChange: function (open) {
          if (open) {
            //this.disconnectMapClick();            
          } else {
            this.connectMapClick();
            this.clearGraphics();
            this.map.setMapCursor("default");
          }

        },        
        disconnectMapClick: function() {
            topic.publish("mapClickMode/setCurrent", "draw");
        },

        connectMapClick: function() {
            topic.publish("mapClickMode/setDefault");
        },

        setMapClickMode: function (mode) {
            this.mapClickMode = mode;
        }
    })

});
