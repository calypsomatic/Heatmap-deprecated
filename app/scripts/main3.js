;

      //https://developers.google.com/maps/documentation/javascript/customoverlays

        var overlay, map, geocoder, home, loc = {};
        var heatmapData = [];
        
        function USGSOverlay(bounds, image, map){
          this.bounds_ = bounds;
          this.image_ = image;
          this.map_  = map;

          this.div_ = null;

          this.setMap(map);
        };

        
    function initialize() {


      USGSOverlay.prototype = new google.maps.OverlayView();


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
        mapTypeId: google.maps.MapTypeId.ROADMAP
       /*mapTypeControlOptions: {
          mapTypeIds: ['test']
        }*/
      });

       var image = 'http://media1.santabanta.com/full1/Animals/Foxes/foxes-0a.jpg';

       console.log(home);

       var bounds = new google.maps.LatLngBounds(
          new google.maps.LatLng(home.latitude + 0.04, home.longitude + 0.04),
          new google.maps.LatLng(home.latitude - 0.04, home.longitude - 0.04));

       overlay = new USGSOverlay(bounds, image, map);

  }