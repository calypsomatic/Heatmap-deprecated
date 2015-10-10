;
        var map, geocoder, home, loc = {};
        var heatmapData = [];

    function initialize() {


      geocoder = new google.maps.Geocoder();

      // Start with current location 
      // Tests to find out which way to detect it
      //Find center of map, set home to it
      if (google.loader.ClientLocation){
        alert("ClientLocation");
        loc.lat = google.loader.ClientLocation.latitude;
        loc.lng = google.loader.ClientLocation.longitude;
        home = new google.maps.LatLng(loc.lat, loc.lng); 
      } else if (navigator.geolocation){
          //Continuously track
          //source: https://www.youtube.com/watch?v=qYFkPFtfgdI
          /*var option = {
            enableHighAccuracy: true,
            timeout: Infinity,
            maximumAge: 0 
          };*/
          navigator.geolocation.getCurrentPosition(function (pos) {
          loc = pos.coords || pos.coordinate || pos;
          home = new google.maps.LatLng(loc.latitude, loc.longitude);
        }, function (err) {
          alert(err.message);
        });
      }
      else {
        //A default value
        alert("No locator ability");
        home = new google.maps.LatLng(42.3954,-71.1258);
      }

      //Define the map to look at, centered at current location
     map = new google.maps.Map(document.getElementById('map'), {
        center: home,
        zoom: 16,
        mapTypeId: google.maps.MapTypeId.ROADMAP
      });

      //draw heatmap
      if (map && home && loc) {
	      heatMap();
	     };

       //Separate showmap function/or is that what initialize should be?

       //Reload showmap when browser resized


    };

    var generateGrid = function(){
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

      //First display darkness


      //Then display heatmap
      function setHeatMap(){ 
        console.log("setting heatmap");
	      var heatmap = new google.maps.visualization.HeatmapLayer({
    	    data: heatmapData
      	  });
	      heatmap.setMap(map);
	  };

  };

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