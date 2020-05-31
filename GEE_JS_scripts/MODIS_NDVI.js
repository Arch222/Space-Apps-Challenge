////////Make Intro Panel////////
var panel = ui.Panel(); 
panel.style().set('width', '300px');
// Define RGB visualization parameters.
var visParams = {
  min: -2000,
  max: 10000.0,
  palette: [
    'FFFFFF', 'CE7E45', 'DF923D', 'F1B555', 'FCD163', '99B718', '74A901',
    '66A000', '529400', '3E8601', '207401', '056201', '004C00', '023B01',
    '012E01', '011D01', '011301'
  ],
};

// Make predefined data layers that can be selected.
var palettes = require('users/gena/packages:palettes');
var palette = palettes.kovesi.linear_grey_0_100_c0[7];

var palette = [
    'FFFFFF', 'CE7E45', 'DF923D', 'F1B555', 'FCD163', '99B718', '74A901',
    '66A000', '529400', '3E8601', '207401', '056201', '004C00', '023B01',
    '012E01', '011D01', '011301'
  ]
  
///select a location dropdown/////
/////////Add Extent dropdown option////////
var mapDesc = ui.Label('Select location to zoom to:');
  mapDesc.style().set({
  fontSize: '16px',
  fontWeight: 'bold',
  padding: '0px 5px'
});
panel.add(mapDesc);


var places = {
  NYC: [-73.994, 40.709],
  China: [114.45, 34.62],
  Italy: [9.59, 45.22]
};

var select = ui.Select({
  items: Object.keys(places),
  onChange: function(key) {
    leftMap.setCenter(places[key][0], places[key][1]);
  }
});

// Set a place holder.
select.setPlaceholder('Choose a location...');

panel.add(select);

///////Add colorbar to panel///////
// Create colorbar title
var legendTitle = ui.Label({
value: 'MOD13A2.006 Terra Vegetation Indices 16-Day Global 1km',
style: {
fontWeight: 'bold',
fontSize: '14px',
margin: '0 0 4px 0',
padding: '4px 8px'
}
});

// Add the title to the panel
panel.add(legendTitle);

function ColorBar(palette) {
  return ui.Thumbnail({
    image: ee.Image.pixelLonLat().select(0),
    params: {
      bbox: [0, 0, 1, 0.1],
      dimensions: '200x20',
      format: 'png',
      min: 0,
      max: 0.9,
      palette: palette,
    },
    style: {stretch: 'horizontal', margin: '0px 8px'},
  });
}

function makeLegend(low, mid, high, palette) {
  var labelPanel = ui.Panel(
      [
        ui.Label(low, {margin: '4px 8px'}),
        ui.Label(mid, {margin: '4px 8px', textAlign: 'center', stretch: 'horizontal'}),
        ui.Label(high, {margin: '4px 8px'})
      ],
      ui.Panel.Layout.flow('horizontal'));
  return ui.Panel([ColorBar(palette), labelPanel])
}

var colorbar = makeLegend(-0.2, 0.5, 1.0, palette)
panel.add(colorbar);


var thumb = ui.Thumbnail({
    params: {
        dimensions: '642x291',
        format: 'png'
        },
    style: {height: '127px', width: '280px',padding :'0'}
    });
var toolPanel = ui.Panel(thumb, 'flow', {width: '300px'});
panel.add(toolPanel)



// Make left and right maps.
var leftMap = ui.Map();
var rightMap = ui.Map();


//var palette = palettes.colorbrewer.BrBG[11].reverse();

var NDVI_band_viz = {
  min: -2000,
  max: 10000,
  palette: palette,
  opacity: 0.9
};

//2019

var NDVI_Jan_2019 = ee.ImageCollection('MODIS/006/MOD13A2')
  .select('NDVI')
  .filterDate('2019-01-01', '2019-01-31')
  .max()
  .visualize(NDVI_band_viz);
  
var NDVI_Feb_2019 = ee.ImageCollection('MODIS/006/MOD13A2')
  .select('NDVI')
  .filterDate('2019-02-01', '2019-02-28')
  .max()
  .visualize(NDVI_band_viz);
  
var NDVI_Mar_2019 = ee.ImageCollection('MODIS/006/MOD13A2')
  .select('NDVI')
  .filterDate('2019-03-01', '2019-03-29')
  .max()
  .visualize(NDVI_band_viz);
  
var NDVI_Apr_2019 = ee.ImageCollection('MODIS/006/MOD13A2')
  .select('NDVI')
  .filterDate('2019-04-01', '2019-04-30')
  .max()
  .visualize(NDVI_band_viz);

var NDVI_May_2019 = ee.ImageCollection('MODIS/006/MOD13A2')
  .select('NDVI')
  .filterDate('2019-05-01', '2019-05-31')  
  .max()
  .visualize(NDVI_band_viz);
  
//2020
var NDVI_Jan_2020 = ee.ImageCollection('MODIS/006/MOD13A2')
  .select('NDVI')
  .filterDate('2020-01-01', '2020-01-31')
  .max()
  .visualize(NDVI_band_viz);
  
var NDVI_Feb_2020 = ee.ImageCollection('MODIS/006/MOD13A2')
  .select('NDVI')
  .filterDate('2020-02-01', '2020-02-29')
  .mean()
  .visualize(NDVI_band_viz);
  
var NDVI_Mar_2020 = ee.ImageCollection('MODIS/006/MOD13A2')
  .select('NDVI')
  .filterDate('2020-03-01', '2020-03-31')
  .max()
  .visualize(NDVI_band_viz);
  
var NDVI_Apr_2020 = ee.ImageCollection('MODIS/006/MOD13A2')
  .select('NDVI')
  .filterDate('2020-04-01', '2020-04-30')
  .max()
  .visualize(NDVI_band_viz);
  
var NDVI_May_2020 = ee.ImageCollection('MODIS/006/MOD13A2')
  .select('NDVI')
  .filterDate('2020-05-01', '2020-05-31')
  .max()
  .visualize(NDVI_band_viz);

// Add default layers to maps.
leftMap.addLayer(NDVI_Jan_2019);
rightMap.addLayer(NDVI_Jan_2020);

// Link the maps
var linkedMaps = ui.Map.Linker([leftMap, rightMap]);

// Create a SplitPanel which holds the linked maps side-by-side.
var splitPanel = ui.SplitPanel({
  firstPanel: linkedMaps.get(0),
  secondPanel: linkedMaps.get(1),
  orientation: 'horizontal',
  wipe: true,
  style: {stretch: 'both'}
});

// Make a list of image layers to select from.
var layers_2019 = ['January 2019', 'February 2019', 'March 2019', 'April 2019', 'May 2019'];  

var layers_2020 = ['January 2020', 'February 2020', 'March 2020', 'April 2020', 'May 2020'];  


// Make a function that will retrieve a layer based on selection.
function getLayer(selection) {
  var layer = NDVI_Jan_2019;
  if(selection == 'February 2019') {
    layer = NDVI_Feb_2019;
  } else if(selection == 'March 2019') {
    layer = NDVI_Mar_2019;
  } else if(selection == 'April 2019') {
    layer = NDVI_Apr_2019;
  } else if(selection == 'May 2019') {
    layer = NDVI_May_2019;
  }
  return layer;
}

// Make a function that will retrieve a layer based on selection.
function getLayer2(selection) {
  var layer = NDVI_Jan_2020;
  if(selection == 'February 2020') {
    layer = NDVI_Feb_2020;
  } else if(selection == 'March 2020') {
    layer = NDVI_Mar_2020;
  } else if(selection == 'April 2020') {
    layer = NDVI_Apr_2020;
  } else if(selection == 'May 2020') {
    layer = NDVI_May_2020;
  }  
  return layer;
}

// Make a callback function for when a selection is made for left map.
function selectLeftOnChange(selection) {
  leftMap.layers().set(0, getLayer(selection));
}

// Make a callback function for when a selection is made for right map.
function selectRightOnChange(selection) {
  rightMap.layers().set(0, getLayer2(selection));
}

// Define selection buttons for left and right map layers.
var selectLeft = ui.Select(layers_2019, 'January 2019', 'January 2019', selectLeftOnChange, false, {position: 'middle-left'});
var selectRight = ui.Select(layers_2020, 'January 2020', 'January 2020', selectRightOnChange, false, {position: 'middle-right'});

// Clear the root, add the splitPanel, and buttons.
ui.root.clear();
ui.root.add(splitPanel);
leftMap.add(selectLeft);
rightMap.add(selectRight);
leftMap.setCenter(114.3055, 30.5928, 8);


//Add panel to the ui.root
ui.root.insert(0, panel);



// Define RGB visualization parameters.
var visParams = {
  min: -2000,
  max: 9000.0,
  palette:
[
    'FFFFFF', 'CE7E45', 'DF923D', 'F1B555', 'FCD163', '99B718', '74A901',
    '66A000', '529400', '3E8601', '207401', '056201', '004C00', '023B01',
    '012E01', '011D01', '011301'
  ],
  opacity: 0.9
};