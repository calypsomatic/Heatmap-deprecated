//http://alistapart.com/article/writing-testable-javascript

//1. Presentation and interaction
//2. Data management and persistence
//3. Overall application state
//4. Setup and glue code to make the pieces work together

/*Guiding principles:
-Represent each distinct piece of behavior as a separate object that falls into 
one of the four areas of responsibility and doesn’t need to know about other 
objects. This will help us avoid creating tangled code.
-Support configurability, rather than hard-coding things. This will prevent us 
from replicating our entire HTML environment in order to write our tests.
Keep our objects’ methods simple and brief. This will help us keep our tests 
simple and our code easy to read.
-Use constructor functions to create instances of objects. This will make it 
possible to create “clean” copies of each piece of code for the sake of testing. */


/* 1. Presentation and interaction

Map
  -- location, zoom, etc
  -- grey parts
  -- heat map parts

2. Data management and persistence

	Heat Map Data
	Locations in database
	Fetching locations from database
	Updating heat values
*/

QUnit.module("HeatMapData", {
	beforeEach: function( assert ) {

	}, afterEach: function( assert ){

	}
});
QUnit.test("HeatMapData is an array", function( assert ) {
	var data = new HeatMapData();
	assert.ok(Array.isArray(data));
	assert.equal(data.length, 0);
});
QUnit.test("HeatMapData accepts new datapoints", function( assert ) {
	var data = new HeatMapData();
	var newDataPt = {location: {lat: 3.1, lng: -3.1}, weight: 6};
	data.push(newDataPt);
	assert.equal(data.length, 1);	
});

QUnit.module("HeatMap", {
	beforeEach: function( assert ){

	}, afterEach: function( assert ){

	}
});
QUnit.test("HeatMap constructor", function( assert ){
	var map = new HeatMap(document.getElementById('qunit-fixture'), new google.maps.LatLng(45.422,-72.1253));
	assert.ok(map);
});
QUnit.test("HeatMap takes in data", function( assert ){
	var map = new HeatMap(document.getElementById('qunit-fixture'), new google.maps.LatLng(45.422,-72.1253));
	map.addData([
        {location: new google.maps.LatLng(37.782, -122.447),
          weight: 0.5},
        {location: new google.maps.LatLng(37.782, -122.4471),
          weight: 1.5},
        {location: new google.maps.LatLng(37.782, -122.4472),
          weight: 2.5},
        {location: new google.maps.LatLng(37.782, -122.4473),
          weight: 3.5},
        {location: new google.maps.LatLng(37.782, -122.4474),
          weight: 4.5},
        {location: new google.maps.LatLng(37.782, -122.4475),
          weight: 5.5},
        {location: new google.maps.LatLng(37.782, -122.4476),
          weight: 6.5}]);
	assert.ok(1);
});
QUnit.module("HeatMapLocation");
QUnit.test("HeatMapLocation buckets locations", function( assert ) {
	var loc = new HeatMapLocation(new google.maps.LatLng(42.39544,-71.12584));
	assert.equal(loc.lat(), 42.3954);
	assert.equal(loc.lng(), -71.1258);
});
QUnit.test("HeatMapLocation is equal to something in the same bucket", function( assert ) {
	var loc1 = new HeatMapLocation(new google.maps.LatLng(42.39544,-71.12584));
	var loc2 = new HeatMapLocation(new google.maps.LatLng(42.3954,-71.12582));
	assert.ok(loc1.equals(loc2));
	assert.ok(loc2.equals(loc1));
	var loc3 = new HeatMapLocation(new google.maps.LatLng(42.395,-71.1257));
	assert.ok(!loc1.equals(loc3));
})
QUnit.test("HeatMapLocation knows its key", function( assert) {
	var locationRef = new Firebase('https://vivid-heat-3077.firebaseio.com/heatmap/locations');
	var loc = new HeatMapLocation(new google.maps.LatLng(42.3873,91.1193));
	assert.expect(1);

	var thenable = loc.key(locationRef);
	return thenable.then( function (result) {
		assert.equal(result, '-K4k0Br7tJNN0C5Q2AMn');				
	});
});
/*QUnit.test("HeatMapLocation finds the key of a new location", function( assert) {
	//This one doesn't work -- will need to come up with a new location for every test!
	var locationRef = new Firebase('https://vivid-heat-3077.firebaseio.com/heatmap/locations');
	var loc = new HeatMapLocation(new google.maps.LatLng(33.1025, -11.339));
	assert.expect(1);

	var test = loc.key(locationRef);
	return test.then( function ( result ) {
		assert.equal(result, loc.key(locationRef));
	})
});*/
QUnit.test("HeatMapLocation considers locations equal if they match the first four digits", function( assert) {
	var locationRef = new Firebase('https://vivid-heat-3077.firebaseio.com/heatmap/locations');
	var loc1 = new HeatMapLocation(new google.maps.LatLng(33.102, -11.3394));
	var loc2 = new HeatMapLocation(new google.maps.LatLng(33.1020, -11.33944));
	assert.expect(1);

	var test = loc1.key(locationRef);
	var test2 = loc2.key(locationRef);
	return test.then(function (result) {
		return test2.then(function (second){
			assert.equal(result, second);
		})	
	})
});
QUnit.test("HeatMapLocation considers locations unequal if they don't match the first four digits", function( assert) {
	var locationRef = new Firebase('https://vivid-heat-3077.firebaseio.com/heatmap/locations');
	var loc1 = new HeatMapLocation(new google.maps.LatLng(33.1021, -11.3394));
	var loc2 = new HeatMapLocation(new google.maps.LatLng(33.1020, -11.33944));
	assert.expect(1);

	var test = loc1.key(locationRef);
	var test2 = loc2.key(locationRef);
	return test.then(function (result) {
		return test2.then(function (second){
			assert.notEqual(result, second);
		})	
	})
});
QUnit.test("HeatMapLocation can be converted back to a google location", function( assert) {
	var hmLoc = new HeatMapLocation(new google.maps.LatLng(33.1021, -11.3333));
	var gLoc = hmLoc.getGoogleLoc();
	//should have Google Location functions
	assert.ok(gLoc.lat());
	assert.ok(gLoc.lng());
});
