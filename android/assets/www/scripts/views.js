var GeoView = function() {
  var _controller = undefined;
  var _root = document.body;
  var _pointer;
  var _lastAngle = 0.0;

  var changeState = function() {
    _root.className = state;
  };

  this.init = function(controller) {
    _controller = controller;
    var targetInput = document.getElementById("requestedLocation");
    targetInput.addEventListener("change", function() {
      _controller.targetChanged(targetInput.value);
    });
    
    _pointer = document.getElementById("pointer");
    _pointer.height = _pointer.width;
    _pointer.style.top = (window.innerHeight/2 - _pointer.height / 2) + "px";
  };

  this.showLocation = function(location, element) {
    var apiKey = "AIzaSyAl280d28vAJd_6431Uc0N5AwHMowThy8c";
    var dimensions = element.width + "x" + element.height;
    var url = "http://maps.google.com/maps/api/staticmap?center=" + location.latitude + "," + location.longitude + "&zoom=13&sensor=false&size=" + dimensions + "&maptype=roadmap&key=" + apiKey;

    element.style.opacity=1;
    element.src = url;
    element.onload = function() {
      element.style.opacity=1;   
    };
  };

  this.showDirection = function(model, distance, bearing) {
    var heading = model.heading.trueHeading;
    var angle = bearing - heading;
    var degree = angle;
    
    
    var difference = Math.abs(_lastAngle - angle);
    if(difference > 180) { 
      // turn off the animation because we get a weired effect.
      _pointer.style.webkitTransition = "none";
      // there is a weird jerk now, so fix that.
    }
    else {
      _pointer.style.webkitTransition = "-webkit-transform 0.2s linear";
    }
    
    _pointer.style.webkitTransform = "rotate(" + degree + "deg)";
    
    _lastAngle = angle;
  };

  this.showError = function(err) {};
  this.showFetching = function() {};
};