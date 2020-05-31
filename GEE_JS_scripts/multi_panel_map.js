//////////NO2///////////
var NO2 = ee.ImageCollection('COPERNICUS/S5P/NRTI/L3_NO2')
            .select('tropospheric_NO2_column_number_density')
            .filterDate('2018-01-01', '2020-05-30')
            
// Make predefined data layers that can be selected.
var palettes = require('users/gena/packages:palettes');
var palette = palettes.colorbrewer.BrBG[11].reverse();

var NO2_band_viz = {
  min: 0,
  max: 0.0001,
  palette: palette,
  opacity: 0.8
};

///population
var pop = ee.ImageCollection("WorldPop/GP/100m/pop")
.filterDate('2020-01-01', '2020-05-31')
.mean()
var pop_vis = {
  "palette": [
    "ffffe7",
    "FFc869",
    "ffac1d",
    "e17735",
    "f2552c",
    "9f0c21"
  ]}



/////nighttime lights/////
var nighttime = ee.ImageCollection('NOAA/VIIRS/DNB/MONTHLY_V1/VCMSLCFG')
                  .filter(ee.Filter.date('2017-05-01', '2020-05-31'))
                  .select('avg_rad')
                  .mean();
var nighttimeVis = {min: 0.0, max: 60.0};
print(nighttime)

/////Power plants////
var table = ee.FeatureCollection("WRI/GPPD/power_plants");

// Get a color from a fuel
var fuelColor = ee.Dictionary({
  'Coal': '000000'
});

// List of fuels to add to the map
var fuels = ['Coal'];

/**
 * Computes size from capacity and color from fuel type.
 *
 * @param {!ee.Geometry.Point} pt A point
 * @return {!ee.Geometry.Point} Input point with added style dictionary.
 */
function addStyle(pt) {
  var size = ee.Number(pt.get('capacitymw')).sqrt().divide(10).add(2);
  var color = fuelColor.get(pt.get('fuel1'));
  return pt.set('styleProperty', ee.Dictionary({'pointSize': size, 'color': color}));
}

// Make a FeatureCollection out of the power plant data table
var pp = ee.FeatureCollection(table).map(addStyle);


/**
 * Adds power plants of a certain fuel type to the map.
 *
 * @param {string} fuel A fuel type
 */
function addLayer(fuel) {
  //print(fuel);
  Map.addLayer(pp.filter(ee.Filter.eq('fuel1', fuel)).style({styleProperty: 'styleProperty', neighborhood: 50}), {}, fuel, true, 0.65);
}


////water quality

// Compute the mean sea surface temperature (SST) value for each pixel by
// averaging MODIS Aqua data for one year.
var chl = ee.ImageCollection('NASA/OCEANDATA/MODIS-Aqua/L3SMI')
.select(['chlor_a'])
.filterDate('2018-01-01', '2020-06-01')
.mean();

var palettes = require('users/gena/packages:palettes');
var palette = palettes.colorbrewer.RdYlGn[9].reverse();
var chl_vis = {min: 0, max: 10, palette: palette};

////////NDVI
var NDVI = ee.ImageCollection('MODIS/006/MOD13A2')
.select('NDVI')
.filterDate('2018-01-01', '2020-01-01')
.mean();

var NDVI_vis = {
  min: 0.0,
  max: 9000.0,
  palette: [
    'FFFFFF', 'CE7E45', 'DF923D', 'F1B555', 'FCD163', '99B718', '74A901',
    '66A000', '529400', '3E8601', '207401', '056201', '004C00', '023B01',
    '012E01', '011D01', '011301'
  ],
};


// Create a map for each visualization option.
var map1 = ui.Map()
map1.add(ui.Label('Population (2020)'))
map1.addLayer(pop, pop_vis, 'Population')
map1.setControlVisibility(false);

var map2 = ui.Map()
map2.add(ui.Label('NO2 (2018-2020)'))
map2.addLayer(NO2, NO2_band_viz, 'NO2')
map2.setControlVisibility(false);

var map3 = ui.Map()
map3.add(ui.Label('Night Time Lights (2017-2020)'))
map3.addLayer(nighttime, nighttimeVis, 'Night Time Lights')
map3.setControlVisibility(false);

var map4 = ui.Map()
function addLayer(fuel) {
  //print(fuel);
  map4.addLayer(pp.filter(ee.Filter.eq('fuel1', fuel)).style({styleProperty: 'styleProperty', neighborhood: 50}), {}, fuel, true, 0.65);
}
// Apply `addLayer` to each record in `fuels`
fuelColor.keys().getInfo().map(addLayer);
map4.add(ui.Label('Coal Power Plants (2018)'))
map4.setControlVisibility(false);

var map5 = ui.Map()
map5.add(ui.Label('Surface Chlorophyll (2018-2020)'))
map5.addLayer(chl, chl_vis, 'Chl')
map5.setControlVisibility(false);


var map6 = ui.Map()
map6.add(ui.Label('NDVI (2018-2020)'))
map6.addLayer(NDVI, NDVI_vis, 'NDVIs')
map6.setControlVisibility(false);

var linker = ui.Map.Linker([map1, map2, map3, map4, map5, map6]);

// Enable zooming on the top-left map.
map1.setControlVisibility({zoomControl: true});

// Show the scale (e.g. '500m') on the bottom-right map.
map3.setControlVisibility({scaleControl: true});

// Create a grid of maps.
var mapGrid = ui.Panel(
    [
      ui.Panel([map1, map2], null, {stretch: 'both'}),
      ui.Panel([map3, map4], null, {stretch: 'both'}),
      ui.Panel([map5, map6], null, {stretch: 'both'})
    ],
    ui.Panel.Layout.Flow('horizontal'), {stretch: 'both'});

// Center the map at an interesting spot in Greece. All
// other maps will align themselves to this parent map.
//map1.setCenter(-76.55, 38.92, 6);
//map1.setCenter(21.2712, 38.4151, 12);



/*
 * Add a title and initialize
 */
/*
// Create a title.
var title = ui.Label('Datasets used in ', {
  stretch: 'horizontal',
  textAlign: 'center',
  fontWeight: 'bold',
  fontSize: '24px'
});
*/

// Add the maps and title to the ui.root.
ui.root.widgets().reset([mapGrid]);
ui.root.setLayout(ui.Panel.Layout.Flow('vertical'));
