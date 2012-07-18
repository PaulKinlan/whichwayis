var GeoView = function() {
  var _controller = undefined;
  var _root = document.body;
  var _pointer;
  var _background;
  var _heading;
  
  var _lastAngle = 0.0;
  
  var onResizeWindow = function() {
    _pointer.height = _pointer.width;
    _pointer.style.top = (background.clientHeight/2 - _pointer.clientHeight / 2) - _heading.clientHeight + "px";
  };
    var changeState = function() {
    _root.className = state;
  };

  this.init = function(controller) {
    _controller = controller;
    var targetInput = document.getElementById("requestedLocation");
    targetInput.addEventListener("change", function() {
      _controller.targetChanged(targetInput.value);
    });
    
    _background = document.getElementById("background");
    _heading = document.getElementById("heading");
    _pointer = document.getElementById("pointer");
    _pointer.height = _pointer.width;
    _pointer.style.top = (background.clientHeight/2 - _pointer.height / 2) - _heading.clientHeight + "px";
    
    window.onresize = onResizeWindow;
  };

  this.showLocation = function(location, element) {
    var apiKey = "AIzaSyBM--hdB8Wkf2WZEwU3Zv74-d7cG0noKlM";
    var dimensions = element.width + "x" + element.height;
    var url = "http://maps.google.com/maps/api/staticmap?center=" + location.latitude + "," + location.longitude + "&zoom=13&sensor=false&size=" + dimensions + "&maptype=roadmap&key=" + apiKey;

    element.style.opacity=1;
    element.src = url;
    element.onload = function() {
      element.style.opacity=1;   
    };
  };

  this.showDirection = function(model, distance, bearing) {
    var heading = model.heading || 0;
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

  this.showError = function(className, element, msg) {
    var el = document.querySelector(element);
    if(el) el.innerText = msg;
    document.body.className = className;
  };
  this.showFetching = function() {};
};
