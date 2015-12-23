var HeatMap = function (el, home) {
  this.map = new google.maps.Map(el, {
        center: home,
        zoom: 16,
        mapTypeId: google.maps.MapTypeId.ROADMAP
      });
};

HeatMap.prototype.addData = function(heatmapData){
	this.heatmap = new google.maps.visualization.HeatmapLayer({
    	    data: heatmapData
      	});
	this.heatmap.setMap(this.map);
};

HeatMap.prototype.getBounds = function(){
  return this.map.getBounds();
}


var HeatMapData = function() {
	return [];
};

HeatMapData.prototype.push = function(datapoint){
	this.push(datapoint);
};

//Makes sure each location is limited in its granularity
var HeatMapLocation = function(location) {
	this.loc = { 'lat' : location.lat().toFixed(4), 'lng' : location.lng().toFixed(4)};
};

HeatMapLocation.prototype.getGoogleLoc = function(){
  return new google.maps.LatLng(this.lat(),this.lng());
}

HeatMapLocation.prototype.lat = function(){
	return this.loc.lat;
}

HeatMapLocation.prototype.lng = function(){
	return this.loc.lng;
}

//I'm obviously a Java programmer
//Note: numbers are rounded automatically.  Make sure this is what you want.
HeatMapLocation.prototype.equals = function(otherLoc) {
	return this.lng() == otherLoc.lng() && this.lat() == otherLoc.lat();
}

//How do I want this to deal with the database?
//This should fetch the key of this location if it's already in the database
//Or insert it and then return the new key 
HeatMapLocation.prototype.key = function(databaseref){
  var thisLoc = this.loc;

  var promise = new Promise(function( resolve, reject ) {
    //var found = false;
    databaseref.orderByChild("lat").equalTo(thisLoc.lat).on("value", function(snapshot){
  //    var found;
      if ( snapshot.val() ) {
        $.each(snapshot.val(), function(key, value) {
          //Once we find the matching location, we want to set locID to be the 
          //key to that location in the database
          if (value.lng == thisLoc.lng) {
            found = key;
            resolve(key);
            return false;
          }
        });
      }
      resolve(false);
    });
  }).then(function (result){
    if ( !result ){
      return databaseref.push({
          lat: thisLoc.lat,
          lng: thisLoc.lng
      });
    }
    return result;
  });

  return promise;

};