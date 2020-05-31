
// Function That applies scaling factor
function scale(image) {
  return  image.multiply(1000000).set(image.toDictionary(image.propertyNames()))
}
  

var NO2 = ee.ImageCollection('COPERNICUS/S5P/NRTI/L3_NO2')
  .select('tropospheric_NO2_column_number_density')
  .filterDate('2020-03-01', '2020-05-31')
  .map(scale)


  
  
// Make predefined data layers that can be selected.
var palettes = require('users/gena/packages:palettes');
var palette = palettes.colorbrewer.BrBG[11].reverse();

var NO2_band_viz = {
  min: 30,
  max: 300,
  palette: palette,
  opacity: 0.8
};

var composite = NO2.mean().visualize(NO2_band_viz);
var compositeLayer = ui.Map.Layer(composite).setName('NO2 Composite');

// Create the main map and set the SST layer.
var mapPanel = ui.Map();
var layers = mapPanel.layers();
layers.add(compositeLayer, '2019-20 Composite');


/*
 * Panel setup
 */

// Create a panel to hold title, intro text, chart and legend components.
var inspectorPanel = ui.Panel({style: {width: '30%'}});

// Create an intro panel with labels.
var intro = ui.Panel([
  ui.Label({
    value: 'NO2 - Time Series Inspector',
    style: {fontSize: '20px', fontWeight: 'bold'}
  }),
  ui.Label('Click a location to see its time series of NO2.')
]);
inspectorPanel.add(intro);

// Create panels to hold lon/lat values.
var lon = ui.Label();
var lat = ui.Label();
inspectorPanel.add(ui.Panel([lon, lat], ui.Panel.Layout.flow('horizontal')));

// Add placeholders for the chart and legend.
inspectorPanel.add(ui.Label('[Chart]'));
inspectorPanel.add(ui.Label('[Legend]'));


/*
 * Chart setup
 */

// Generates a new time series chart of SST for the given coordinates.
var generateChart = function (coords) {
  // Update the lon/lat panel with values from the click event.
  lon.setValue('lon: ' + coords.lon.toFixed(2));
  lat.setValue('lat: ' + coords.lat.toFixed(2));

  // Add a dot for the point clicked on.
  var point = ee.Geometry.Point(coords.lon, coords.lat);
  var dot = ui.Map.Layer(point, {color: '000000'}, 'clicked location');
  // Add the dot as the second layer, so it shows up on top of the composite.
  mapPanel.layers().set(1, dot);

  // Make a chart from the time series.
  var NO2Chart = ui.Chart.image.series(NO2, point, ee.Reducer.mean());

  // Customize the chart.
  NO2Chart.setOptions({
    title: 'NO2: time series',
    vAxis: {title: 'NO2'},
    hAxis: {title: 'Date', format: 'MM-yy', gridlines: {count: 7}},
    series: {
      0: {
        color: 'blue',
        lineWidth: 0,
        pointsVisible: true,
        pointSize: 2,
      },
    },
    legend: {position: 'right'},
  });
  // Add the chart at a fixed position, so that new charts overwrite older ones.
  inspectorPanel.widgets().set(2, NO2Chart);
};


/*
 * Legend setup
 */

// Creates a color bar thumbnail image for use in legend from the given color
// palette.
function makeColorBarParams(palette) {
  return {
    bbox: [0, 0, 1, 0.1],
    dimensions: '100x10',
    format: 'png',
    min: 0,
    max: 1,
    palette: palette,
  };
}

// Create the color bar for the legend.
var colorBar = ui.Thumbnail({
  image: ee.Image.pixelLonLat().select(0),
  params: makeColorBarParams(NO2_band_viz.palette),
  style: {stretch: 'horizontal', margin: '0px 8px', maxHeight: '24px'},
});

// Create a panel with three numbers for the legend.
var legendLabels = ui.Panel({
  widgets: [
    ui.Label(NO2_band_viz.min, {margin: '4px 8px'}),
    ui.Label(
        (NO2_band_viz.max / 2),
        {margin: '4px 8px', textAlign: 'center', stretch: 'horizontal'}),
    ui.Label(NO2_band_viz.max, {margin: '4px 8px'})
  ],
  layout: ui.Panel.Layout.flow('horizontal')
});

var legendTitle = ui.Label({
  value: 'Map Legend: median NO2 (2019-2020)',
  style: {fontWeight: 'bold'}
});

var legendPanel = ui.Panel([legendTitle, colorBar, legendLabels]);
inspectorPanel.widgets().set(3, legendPanel);

/*
 * Map setup
 */

// Register a callback on the default map to be invoked when the map is clicked.
mapPanel.onClick(generateChart);

// Configure the map.
mapPanel.style().set('cursor', 'crosshair');


// Initialize with a test point.
var initialPoint = ee.Geometry.Point(-73.725, 40.435);
mapPanel.centerObject(initialPoint, 4);


/*
 * Initialize the app
 */

// Replace the root with a SplitPanel that contains the inspector and map.
ui.root.clear();
ui.root.add(ui.SplitPanel(inspectorPanel, mapPanel));

generateChart({
  lon: initialPoint.coordinates().get(0).getInfo(),
  lat: initialPoint.coordinates().get(1).getInfo()
});