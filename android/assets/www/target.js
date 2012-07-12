var TargetObj = function(){};

TargetObj.prototype.setTarget = function(target) {
  return PhoneGap.exec(function(args) {}, function(args) {}, 'CurrentTargetInterface', 'setTarget', [target]);
};

PhoneGap.addConstructor(function() {
	PhoneGap.addPlugin('target', new TargetObj());
});