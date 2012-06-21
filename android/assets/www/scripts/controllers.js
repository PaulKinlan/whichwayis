var OnAnyChange = function(properties, callback) {
  var callback = callback || function() {};
   
  var listener = function(val) {
    callback(val);
  };

  for(var i = 0; i < properties.length; i++) {
    var property = properties[i];
    property.addChangeListener(listener);
  }
};

var Observable = function(propertyName, _this) {
  var value;
  this.changeListeners = [];
  var  changeListeners = this.changeListeners
    
  _this.__defineGetter__(propertyName, function() {
    return value;
  });
    
  _this.__defineSetter__(propertyName, function(newVal) {
    value = newVal;
    for(var i = 0; i < changeListeners.length; i++) {
      changeListeners[i].call(_this, newVal);
    }
  });
};

Observable.prototype.addChangeListener = function(callback) {
  this.changeListeners.push(callback);
};

Observable.prototype.removeChangeListener = function(callback) {
  var i = this.changeListeners.indexOf(callback);
  this.changeListeners = this.changeListeners.splice(i, 1);
};

var GeoController = function(view, model) {
  var model = model;
  view.controller = this;
  // Private State
  var _locationObserver = new Observable("location", model);
  var _headingObserver = new Observable("heading", model);
  var _targetObserver = new Observable("target", model);
  
  var headingWatch;
  
  // Logic
  OnAnyChange([_locationObserver, _targetObserver, _headingObserver], function() {
    if(!!model.location == false || !!model.target == false) return;
    
    // Recalculate the distance
    var distance = calculateDistance();
    
    // Recalculate the bearing
    var bearing = calculateBearing();
    
    // Update View
    view.showDirection(model, distance, bearing); 
  });
 
  OnAnyChange([_targetObserver], function(value) {
    view.showLocation(model.target, document.getElementById("target"));
  });
  
  OnAnyChange([_locationObserver], function(value) {
    view.showLocation(model.location, document.getElementById("location"));
  });
  
  // Public Interfaces
  this.init = function() {
    view.init(this);
    if(navigator.network && navigator.network.connection == "NONE") {
      view.showError("networkNone", "There is no network connection");
    }
  };
  
  this.targetChanged = function(target) {
    changeTarget(target);
  };
  
  this.share = function(target) {
    var params = {
      action: WebIntent.ACTION_SEND,
      url: "http://whichway.is/" + target
    };
    
    if(_target) {
      window.plugins.webintent.startActivity(params);
    }
    else {
      // don't share if nothing is present.
    }
  };
  
  this.getLocation = function() {
    var onSuccess = function(pos) {
      var coords = pos.coords;
      model.location = { latitude: coords.latitude, longitude: coords.longitude };
    };
    var onFailure = function(err) {
      console.log("ERROR: " + err);
      view.showError("locationCaptureFailed", err);
    };
    
    var onHeadingSuccess = function(heading) {
      model.heading = heading;
    };
    
    if(!!navigator.compass == false) {
      view.showError("noCompass","No compass");
    }
    else {
      navigator.geolocation.getCurrentPosition(onSuccess, onFailure);
      headingWatch = navigator.compass.watchHeading(onHeadingSuccess, onFailure);
    }
  };
  
  var changeTarget = function(target) {
    _geocode(target, function(location) {
      // update the model
      if(location.status === "OK") {
        var geometry = location.results[0].geometry.location;
        model.target = { "latitude": geometry.lat, "longitude": geometry.lng} ;
      }
      else {
        // there was an error geocoding.
      }
    });
  };

  // Private Methods
  const GEOCODE_BASE_URL = "http://maps.googleapis.com/maps/api/geocode/json";
  var apiKey = "AIzaSyAl280d28vAJd_6431Uc0N5AwHMowThy8c";
  
  var _geocode = function(address, callback) {
    var xhr = new XMLHttpRequest();
    xhr.onload = function() {
      var data = JSON.parse(xhr.responseText);
      callback(data);
    };
    
    xhr.onerror = function() {
      console.log("there was an error geocoding");
    };
    
    var query = GEOCODE_BASE_URL + "?sensor=false&address=" + encodeURIComponent(address);
  
    xhr.open("GET", query);
    xhr.send();
  };
  
  //http://www.movable-type.co.uk/scripts/latlong.html
  /** Converts numeric degrees to radians */
  if (typeof(Number.prototype.toRad) === "undefined") {
    Number.prototype.toRad = function() {
      return this * Math.PI / 180;
    }
  }
  
  if (typeof(Number.prototype.toDeg) === "undefined") {
    Number.prototype.toDeg = function() {
      return this * 180 / Math.PI;
    }
  }
  
  var calculateDistance = function() {
    var lat1 = model.location.latitude;
    var lon1 = model.location.longitude;
    var lat2 = model.target.latitude;
    var lon2 = model.target.longitude;
    
    var R = 6371; // km
    var dLat = (lat2-lat1).toRad();
    var dLon = (lon2-lon1).toRad();
    var lat1 = lat1.toRad();
    var lat2 = lat2.toRad();

    var a = Math.sin(dLat/2) * Math.sin(dLat/2) +
            Math.sin(dLon/2) * Math.sin(dLon/2) * Math.cos(lat1) * Math.cos(lat2); 
    var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
    return R * c;
  };

  var calculateBearing = function() {
    var lat1 = model.location.latitude;
    var lon1 = model.location.longitude;
    var lat2 = model.target.latitude;
    var lon2 = model.target.longitude;
    var dLat = (lat2-lat1).toRad();
    var dLon = (lon2-lon1).toRad();
    var lat1 = lat1.toRad();
    var lat2 = lat2.toRad();
  
    var y = Math.sin(dLon) * Math.cos(lat2);
    var x = Math.cos(lat1)*Math.sin(lat2) -
            Math.sin(lat1)*Math.cos(lat2)*Math.cos(dLon);
    return Math.atan2(y, x).toDeg();
  };

};