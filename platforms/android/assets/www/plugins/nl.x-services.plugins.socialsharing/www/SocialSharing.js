cordova.define("nl.x-services.plugins.socialsharing.SocialSharing", function(require, exports, module) {function SocialSharing() {
}

SocialSharing.prototype.available = function (callback) {
  cordova.exec(function (avail) {
    callback(avail ? true : false);
  }, null, "SocialSharing", "available", []);
};

SocialSharing.prototype.share = function (message, subject, image, url, nameApp, successCallback, errorCallback) {
  cordova.exec(successCallback, errorCallback, "SocialSharing", "share", [message, subject, image, url, nameApp]);
};

SocialSharing.install = function () {
  if (!window.plugins) {
    window.plugins = {};
  }

  window.plugins.socialsharing = new SocialSharing();
  return window.plugins.socialsharing;
};

cordova.addConstructor(SocialSharing.install);
});
