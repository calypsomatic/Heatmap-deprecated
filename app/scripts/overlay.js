;
      console.log("why");
        var map, geocoder, home, loc = {};
        var heatmapData = [];

    function initialize() {


      geocoder = new google.maps.Geocoder();

      // Start with current location 
      // Tests to find out which way to detect it
      //Find center of map, set home to it
      if (navigator.geolocation){
        navigator.geolocation.getCurrentPosition(function (pos) {
          loc = pos.coords || pos.coordinate || pos;
          home = new google.maps.LatLng(loc.latitude, loc.longitude);
          }, 
        function (err) {
          alert(err.message);
        });
      }
      else {
        //A default value
        alert("No locator ability");
        home = new google.maps.LatLng(42.3954,-71.1258);
      };

      //Define the map to look at, centered at current location
       map = new google.maps.Map(document.getElementById('map'), {
        center: home,
        zoom: 16,
        streetViewControl: false,
        mapTypeControlOptions: {
          mapTypeIds: ['test']
        }
      });

      var testMapType = new google.maps.ImageMapType({
        getTileUrl: 'qrcode.png',
        tileSize: new google.maps.Size(256, 256),
        maxZoom: 9,
        minZoom: 0,
        radius: 1738000,
        name: 'Test'
      });

      map.mapTypes.set('test', testMapType);
      map.setMapTypeId('test');
  }