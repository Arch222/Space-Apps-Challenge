// A simple tool for charting MODIS chl.

// Compute the mean chl value for each pixel
var modisOceanColor = ee.ImageCollection('NASA/OCEANDATA/MODIS-Aqua/L3SMI');
var chl =
    modisOceanColor.select(['chlor_a']).filterDate('2018-01-01', '2020-06-01');


var palettes = require('users/gena/packages:palettes');
var palette = palettes.colorbrewer.RdYlGn[9].reverse();
var vis = {min: 0, max: 10, palette: palette};
var composite = chl.mean().visualize(vis);
var compositeLayer = ui.Map.Layer(composite).setName('Chl Composite');

// Create the main map and set the SST layer.
var mapPanel = ui.Map();
var layers = mapPanel.layers();
layers.add(compositeLayer, '2017 Composite');


/*
 * Panel setup
 */

// Create a panel to hold title, intro text, chart and legend components.
var inspectorPanel = ui.Panel({style: {width: '30%'}});

// Create an intro panel with labels.
var intro = ui.Panel([
  ui.Label({
    value: 'MODIS Chlorophyll - Time Series Inspector',
    style: {fontSize: '20px', fontWeight: 'bold'}
  }),
  ui.Label('Click a location to see its time series of surface chlorophll.')
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
  var chlChart = ui.Chart.image.series(chl, point, ee.Reducer.mean(), 9000);

  // Customize the chart.
  chlChart.setOptions({
    title: 'Surface chlorophyll: time series',
    vAxis: {title: 'Chl (mg m-3)'},
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
  inspectorPanel.widgets().set(2, chlChart);
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
  params: makeColorBarParams(vis.palette),
  style: {stretch: 'horizontal', margin: '0px 8px', maxHeight: '24px'},
});

// Create a panel with three numbers for the legend.
var legendLabels = ui.Panel({
  widgets: [
    ui.Label(vis.min, {margin: '4px 8px'}),
    ui.Label(
        (vis.max / 2),
        {margin: '4px 8px', textAlign: 'center', stretch: 'horizontal'}),
    ui.Label(vis.max, {margin: '4px 8px'})
  ],
  layout: ui.Panel.Layout.flow('horizontal')
});

var legendTitle = ui.Label({
  value: 'Map Legend: median surface chl (2018-2020)',
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
