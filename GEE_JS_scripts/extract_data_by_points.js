//used Add a Marker to select 3 locations
var locations = [NYC.buffer(100000), Milan.buffer(100000), Wuhan.buffer(100000)]
var pts = ee.FeatureCollection(locations)
print(pts)
Map.addLayer(pts)



// Function That applies scaling factor
function scale(image) {
  return  image.multiply(1000000).copyProperties(image, image.propertyNames());
}

var NO2 = ee.ImageCollection('COPERNICUS/S5P/NRTI/L3_NO2')
            .select('tropospheric_NO2_column_number_density')
            .filterDate('2018-01-01', '2020-05-30')
            .map(scale)
            

var triplets = NO2.map(function(image) {
  return image.reduceRegions({
    collection: pts, 
    reducer: ee.Reducer.mean(), 
    scale: 30
  }).filter(ee.Filter.neq('mean', null))
    .map(function(f) { 
      return f.set('Date', image.date());
    });
}).flatten();
  
print(triplets.first());

// Export
Export.table.toDrive(triplets, "extract_NO2_by_point4");

/*
// Format a table of triplets into a 2D table of rowId x colId.
var format = function(table, rowId, colId) {
  // Get a FeatureCollection with unique row IDs.
  var rows = table.distinct(rowId);
  // Join the table to the unique IDs to get a collection in which
  // each feature stores a list of all features having a common row ID. 
  var joined = ee.Join.saveAll('matches').apply({
    primary: rows, 
    secondary: table, 
    condition: ee.Filter.equals({
      leftField: rowId, 
      rightField: rowId
    })
  });

  return joined.map(function(row) {
      // Get the list of all features with a unique row ID.
      var values = ee.List(row.get('matches'))
        // Map a function over the list of rows to return a list of
        // column ID and value.
        .map(function(feature) {
          feature = ee.Feature(feature);
          return [feature.get(colId), feature.get('mean')];
        });
      // Return the row with its ID property and properties for
      // all matching columns IDs storing the output of the reducer.
      // The Dictionary constructor is using a list of key, value pairs.
      return row.select([rowId]).set(ee.Dictionary(values.flatten()));
    });
};


var table1 = format(triplets, 'imageId', 'blockid10');

var desc1 = 'table1'; 
Export.table.toDrive({
  collection: table1, 
  description: desc1, 
  fileNamePrefix: desc1,
  fileFormat: 'CSV'
});

var table2 = format(triplets, 'blockid10', 'imageId');

var desc2 = 'table2_demo_';
Export.table.toDrive({
  collection: table2, 
  description: desc2, 
  fileNamePrefix: desc2,
  fileFormat: 'CSV'
});


*/