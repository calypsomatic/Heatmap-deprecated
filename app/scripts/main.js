;
        //Global variables
        var map, geocoder, home, loc = {};
        //Does this need to be kept locally?  Perhaps not
        var heatmapData = heatmapData || [];
        //Reference to database of heatmap values
        // TODO: update to refer to specific user
        var dataRef = new Firebase('https://vivid-heat-3077.firebaseio.com/heatmap/users');
        var locationRef = new Firebase('https://vivid-heat-3077.firebaseio.com/locations');
        var userAuth = 'testuid'; //would otherwise be authData.uid
        var userDBurl = 'https://vivid-heat-3077.firebaseio.com/users/' + userAuth + '/heatMapData';

        var myDataRef = new Firebase(userDBurl);



    function initMap() {

      //What is this used for?
      geocoder = new google.maps.Geocoder();

      // Start with current location 
      // Tests to find out which way to detect it
      //Find center of map, set home to it
     /* if (google.loader.ClientLocation){
        loc.lat = google.loader.ClientLocation.latitude;
        loc.lng = google.loader.ClientLocation.longitude;
        home = new google.maps.LatLng(loc.lat, loc.lng);
        home.resolve(); 
      } else */if (navigator.geolocation){
          //Continuously track
          //source: https://www.youtube.com/watch?v=qYFkPFtfgdI
          /*var option = {
            enableHighAccuracy: true,
            timeout: Infinity,
            maximumAge: 0 
          };*/

          //Finds current position, sets global loc to match, updates center of map
          navigator.geolocation.getCurrentPosition(function (pos) {
          loc = pos.coords || pos.coordinate || pos;
          home = new google.maps.LatLng(loc.latitude, loc.longitude); 
        }, function (err) {
          alert(err.message);
        });
      } else {
        //A default value
        alert("No locator ability");
        home = new google.maps.LatLng(42.3954,-71.1258);
      }

      //Define the map to look at, centered at current location
      //Default map should be grey, only display map where weight != null
      //Maybe create own color style, so that default weight just blurs/fogs over map?
      //Read more about overlays 
      //God I don't know what I'm doing
      map = new google.maps.Map(document.getElementById('map'), {
        center: home,
        zoom: 16,
        mapTypeId: google.maps.MapTypeId.ROADMAP
      });

      //Where you are, add data point
      if (home){
        updatePoint(home);
      }

      //TODO: Updatepoint whenever you move

      heatMap();

      setHeatMap();
      //draw heatmap
      /*if (map && home && loc) {
	      heatMap();
	     };*/

       //Separate showmap function/or is that what initialize should be?

       //Reload showmap when browser resized

    };

    //Send current location to heatmap database
    function updatePoint(location){

      //TODO: define how fine-grained to display heat, so that we don't have weird pockets
      // of explored/non-explored intermixed -- probably only need 4 digits after decimal -- maybe even just 2 or 3
      //but will still need to do some work to make it not funny

      //Distill this location to its location bucket
      var bucketed = bucketLoc(location);

      //TODO: Look into using promise instead
      var locID = $.Deferred();

      //Have a database of locations, and then use the location ID for each user's data point
      locationRef.orderByChild("lat").equalTo(bucketed.lat).on("value", function(snapshot){
        if (snapshot.val()){
          $.each(snapshot.val(), function(key, value) {
            //Once we find the matching location, we want to set locID to be the 
            //key to that location in the database
            //TODO: Probably not a good idea to use the same variable?
            if (value.lng == bucketed.lng) {
              locID.resolve(key);
              return;
            }
            //If we get here, then the point was not already in the database
 //           addOrUpdatePoint(bucketed);
            locID.resolve(bucketed);
          })
        } else {
          //The point was not already in the database
          addOrUpdatePoint(bucketed);
        }
      });

      var addOrUpdatePoint = function(loc){
        //This point is not in the database yet, add it
        //TODO: Add callback to get the key for this point and set locID to it
        if (loc.lat && loc.lng){
          locationRef.push({
            lat: loc.lat,
            lng: loc.lng
          });
        } else {
          //we now have the key
          //Here should be changing the heat value of the point
        }
      }

      //This will either be the key for the location or the location itself
      $.when(locID).done(function(result){
        addOrUpdatePoint(result);
      })



      var time = new Date().toString();
      var latString = 'lat/' + location.lat().toFixed(4).replace(/\./gi, ',') + '/' + location.lng().toFixed(4).replace(/\./gi, ',');
      var lngString = 'lng/' + location.lng().toFixed(4).replace(/\./gi, ',') + '/' + location.lat().toFixed(4).replace(/\./gi, ',');



      myDataRef.child(latString).push({
//        location : bucketed,
        timestamp : new Date().toString(),
        heatVal : 6
      });

      myDataRef.child(lngString).push({
//        location : bucketed,
        timestamp : new Date().toString(),
        heatVal : 6
      });
    }


    function tempHeatMap(){
      myDataRef.on("value", function(data) {
        $.each(data.val(), function(key, value){
          var newDataPt = {location: new google.maps.LatLng(value.location.lat,value.location.lng), weight: value.heatVal};
          heatmapData.push(newDataPt);
        });
      });
      console.log(heatmapData);
    }

    //Should take in the bounds of the currently viewed map,
    //So as to only grab data that would be visible
    function heatMap(bounds){
      //How to get datapoints within those bounds?  Need to sort by locations, which 
      //is already the key, then get datapoints within those bounds - use querying data
      //Look into .indexOn to make sure this is indexed appropriately.  Might need to 
      //be nested for lat and long?
      //Probably need to query for one first, get only the ones that are within lat, then
      //out of that subset query for long? Or two queries and then only keep the intersection?

      //Then something like this
      myDataRef.orderByChild("lat").startAt(40).endAt(45)
        .on("value", function(snapshot) {
          //console.log(snapshot);
          snapshot.forEach(function(data) {
            console.log(data);
            //heatMapData.push({location: data.location, weight: data.weight});
          });
      });

      //Second call for long???
      /*myDataRef.orderByChild("location/long").startAt(bounds.minLong).endAt(bounds.maxLong)
        .on("value", function(snapshot) {
          snapshot.forEach(function(data) {
            //Need to create a second array to do an intersection?
            //No a little more complicated because they're objects and we're matching by location property...
            });
      });*/

    }

    //returns the location corresponding to the standard bucket size of this location
    //May want to use only 3 digits
    //Or perhaps come up with a more complicated way to bucket for display purposes
    function bucketLoc(location){
      return { 'lat' : location.lat().toFixed(4), 'lng' : location.lng().toFixed(4)};
    }

  /*  var generateGrid = function(){
    	//How do I find the edges of the map?
    	//Need delta lng, delta lat
    	//Figure out these numbers from the size of the map
    	//Update as moves occur
    	var deltaLng = 0.0005;
    	var deltaLat = 0.0005;
    	var minLng = loc.longitude - 0.005;
    	var maxLng = loc.longitude + 0.005;
    	var minLat = loc.latitude - 0.005;
    	var maxLat = loc.latitude + 0.005;
    	var step, line;
    	//Need Max/Min lng/lat on edges
    	//Generate vert lines:
    	for (step = minLng; step < maxLng; step += deltaLng) {
	    	line = new google.maps.Polyline({
    			path: [{lat: minLat, lng: step}, {lat: maxLat, lng: step}],
    			strokeColor: '#000000',
    			strokeWeight: 1
    		});
    		line.setMap(map);
	    };
	    //Generate horizontal lines
	    for (step = minLat; step < maxLat; step += deltaLat) {
	    	line = new google.maps.Polyline({
    			path: [{lat: step, lng: minLng}, {lat: step, lng: maxLng}],
    			strokeColor: '#000000',
    			strokeWeight: 1
    		});
    		line.setMap(map);
	    };
    };

    //This should load datapoints from the user's db
    // Each point has a location (lat, long), a weight, and a timestamp -- this comes automatically with firebase
    //Set up a listener to add new datapoints to database whenever user location changes
    function heatMap () {
      // Data points defined as an array of LatLng objects
      console.log("heatmap");
      heatmapData = [
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
          weight: 6.5},
        new google.maps.LatLng(37.785, -122.447),
        new google.maps.LatLng(37.785, -122.445),
        new google.maps.LatLng(37.785, -122.443),
        new google.maps.LatLng(37.785, -122.441),
        new google.maps.LatLng(37.785, -122.439),
        new google.maps.LatLng(37.785, -122.437),
        new google.maps.LatLng(37.785, -122.435)
      ];

      function addHeatMapPoint(){
      }

      var currloc;
      //Get current location, add it to heatmapdata
      navigator.geolocation.getCurrentPosition(function (pos) {
        console.log("locating");
          currloc = pos.coords || pos.coordinate || pos;
          heatmapData.push({location: new google.maps.LatLng(currloc.latitude, currloc.longitude),
      					weight: 6});
          setHeatMap();
//         for (loc in heatMapData){
  //         if map.getBounds().contains(loc[location]);
    //     }
        }, function (err) {
          alert(err.message);
        });

      //First display darkness*/


      //Then display heatmap
      function setHeatMap(){ 
	      var heatmap = new google.maps.visualization.HeatmapLayer({
    	    data: heatmapData
      	  });
	      heatmap.setMap(map);
	  };

 // };

  //source : http://www.digicution.com/responsively-display-current-user-location-using-html5-google-maps-api-jquery/
/*$(document).ready(function() {

     //Show The Map
     initialize();

     // When The Viewing Window Is Resized
     $(window).resize(function() {

          //CSS Resizes Container So Lets Recall The Map Function
          initialize();

     });

});*/