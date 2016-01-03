;
        //Global variables
        var map, geocoder, home, loc = {};
        //Does this need to be kept locally?  Perhaps not
        var heatmapData = new HeatMapData();
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

      if (navigator.geolocation){
          //TODO: Continuously track
          //source: https://www.youtube.com/watch?v=qYFkPFtfgdI
          /*var option = {
            enableHighAccuracy: true,
            timeout: Infinity,
            maximumAge: 0 
          };*/

          //Finds current position, sets global loc to match, updates center of map
          navigator.geolocation.getCurrentPosition(function (pos) {
            loc = pos.coords || pos.coordinate || pos;  
           /* home = new google.maps.LatLng(42.3954,-71.1258);
            map = new HeatMap(document.getElementById('map'), home);
*/
            home = new Promise(function (resolve, reject) {
              resolve(new google.maps.LatLng(loc.latitude, loc.longitude));
            }).then(function(result){
              map = new HeatMap(document.getElementById('map'), result);
              var currLoc = new HeatMapLocation(result);
              addLocationToUserDB(currLoc);
            });

            if (map){
              if (map.getBounds){
                getLocalPoints(map.getBounds());              
              } else {
                getLocalPoints(map);
              }

            }
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
      //console.log(home);

      //Where you are, add data point
      /*home.then(function (result){
        home = new HeatMapLocation(home);
        console.log(home);
        heatmapData.push(home);
    });*/
  

/*      if (home){
        updatePoint(home);
      }

      //TODO: Updatepoint whenever you move

      heatMap();

      setHeatMap();*/
      //draw heatmap
      /*if (map && home && loc) {
	      heatMap();
	     };*/

    };


    //Should take in the bounds of the currently viewed map,
    //So as to only grab data that would be visible
    function getLocalPoints(bounds){
      /* get keys of locations within lat, lng
        if they are in the user's database, add them to heatmapdata */
     /* var west = bounds.getSouthWest().lng();
      var east = bounds.getNorthEast().lng();*/
      var north = bounds.getNorthEast().lat();
      var south = bounds.getSouthWest().lat();
      //TODO: do I need to worry about negative numbers wrapping around, start at north end at south
      if (bounds.contains){
        locationRef.orderByChild("lat").startAt(south.toString()).endAt(north.toString())
          .on("value", function(snapshot) {
            if (snapshot.val()) {
              $.each(snapshot.val(), function(key, value) {
                  var point = new google.maps.LatLng(value.lat, value.lng);
                  if ( bounds.contains( point ) ) {
                    //get key, see if user has it, then add it to heatmap
                    addtoHeatMap(key, point);
                  }
              })
            }
          });
      }
    }

    function displayHeatMap(){
      console.log(heatmapData);
      var heatmap = new google.maps.visualization.HeatmapLayer({
        data: heatmapData
      });
      heatmap.setMap(map.map);
    }

    function addtoHeatMap(key, point){
      var loc = new HeatMapLocation(point);
      myDataRef.orderByKey().equalTo(key).on("value", function(snapshot){
        if (snapshot.val()){
        $.each(snapshot.val(), function(key, value){
          //add this point to heatmapdata
          heatmapData.push({location: point, weight: value.weight});
        })
      } else {
        //add to heatmapdata with value unvisited -- whatever that value should be
        heatmapData.push({location: point, weight: 6});
      }
      })
    }

    function addLocationToUserDB(point){
        //first get key
        point.key(locationRef).then(function(result){
          //now see if userDB already has point
          myDataRef.child(result).update({
            lat: point.lat(),
            lng: point.lng(),
            weight: 0
          });
        });
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