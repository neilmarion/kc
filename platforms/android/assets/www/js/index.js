/*
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */
var pictureSource;   // picture source
var destinationType; // sets the format of returned value

var destinations = {'moa': {'lat': '14.535089', 'lng' : '120.983698'}, 'megamall' : {'lat': '14.584373', 'lng' : '121.059154'}, 'north' : {'lat': '14.657074', 'lng' : '121.032515'}, 'robinsons' : {'lat': '14.614809', 'lng' : '121.039118'}}

var cb = new Codebird; // we will require this everywhere
var interval;

var app = {
  // Application Constructor
  initialize: function() {
      this.bindEvents();
  },
  // Bind Event Listeners
  //
  // Bind any events that are required on startup. Common events are:
  // 'load', 'deviceready', 'offline', and 'online'.
  bindEvents: function() {
      document.addEventListener('deviceready', this.onDeviceReady, false);
  },
  // deviceready Event Handler
  //
  // The scope of 'this' is the event. In order to call the 'receivedEvent'
  // function, we must explicity call 'app.receivedEvent(...);'
  onDeviceReady: function() {
    pictureSource=navigator.camera.PictureSourceType;
    destinationType=navigator.camera.DestinationType;
    FB.init({ appId: "470089076435075", nativeInterface: CDV.FB, useCachedDialogs: false });
    app.receivedEvent('deviceready');
  },
  // Update DOM on a Received Event
  receivedEvent: function(id) {
    var parentElement = document.getElementById(id);
    var listeningElement = parentElement.querySelector('.listening');
    var receivedElement = parentElement.querySelector('.received');

    listeningElement.setAttribute('style', 'display:none;');
    receivedElement.setAttribute('style', 'display:block;');

    console.log('Received Event: ' + id);
  }
};


$.mobile.defaultPageTransition = 'none';

function changePage(page) {
   $.mobile.changePage( page, { hangeHash: false }); 
}

function back() {
  history.back();
}

// 1. Capturing / Retrieving Photo

function capturePhoto() {
  // Take picture using device camera and retrieve image as base64-encoded string
  navigator.camera.getPicture(onPhotoDataSuccess, onFail, { quality: 50, correctOrientation: true });
}

function getPhoto() {
  // Retrieve image file location from specified source
  navigator.camera.getPicture(onPhotoDataSuccess, onFail, { quality: 50,
    destinationType: destinationType.FILE_URI,
    sourceType: pictureSource.PHOTOLIBRARY });
}

// Called when a photo is successfully retrieved
//
function onPhotoDataSuccess(imageData) {
  $('#captured-image').html('<img id="photo" style="max-width:100%" src="'+imageData+'" />');
  changePage('#edit-photo');
}

function onFail(message) {
  alert('Failed because: ' + message);
}

// 2. yabu.ph site 

function gotoSite() {
  window.open("http://yabu.ph", '_blank', 'location=no');
}

// 3. pathfinder

function onSuccessMap(position) {
  localStorage.setItem("position.coords.latitude", position.coords.latitude)
  localStorage.setItem("position.coords.longitude", position.coords.longitude)
  changePage('#directions_map');
}

function onErrorMap(error) {
  alert('code: ' + error.code + ' mesasge ' + error.message);
}

function gotoMap(dst) {
  localStorage.setItem('dst', dst); 
  navigator.geolocation.getCurrentPosition(onSuccessMap, onErrorMap);
}

function getRealContentHeight() {
    var header = $.mobile.activePage.find("div[data-role='header']:visible");
    //var footer = $.mobile.activePage.find("div[data-role='footer']:visible");
    var content = $.mobile.activePage.find("div[data-role='content']:visible:visible");
    var viewport_height = $(window).height();

    var content_height = viewport_height - header.outerHeight() - footer.outerHeight();
    if((content.outerHeight() - header.outerHeight() - footer.outerHeight()) <= viewport_height) {
        content_height -= (content.outerHeight() - content.height());
    } 
    return content_height;
}

$(document).on("pageshow", "#directions_map", function () {
  var lat = localStorage.getItem("position.coords.latitude")
  var lng = localStorage.getItem("position.coords.longitude")
  var mobileDemo = { 'center': lat  + ',' + lng, 'zoom': 10 };

  demo.add('directions_map', function() {
    $('#map_canvas').gmap({'center': mobileDemo.center, 'zoom': mobileDemo.zoom, 'disableDefaultUI':true, 'callback': function() {
      var self = this;

        var latlng = new google.maps.LatLng(lat, lng);
        //var latlng = new google.maps.LatLng(14.4559, 120.9820);
        self.get('map').panTo(latlng);

        self.displayDirections({ 'origin': new google.maps.LatLng(lat, lng), 'destination': new google.maps.LatLng(destinations[localStorage.getItem('dst')]['lat'], destinations[localStorage.getItem('dst')]['lng']), 'travelMode': google.maps.DirectionsTravelMode.DRIVING }, { 'panel': document.getElementById('directions')}, function(response, status) {
          ( status === 'OK' ) ? $('#results').show() : $('#results').hide();
        });
    }});
  }).load('directions_map');
  $('#map_canvas').css('height',getRealContentHeight());
  //$('#map_canvas_1').css('width', '100%');

  //var element = document.getElementById('geolocation'); 
  //element.innerHTML = "Latitude: " + position.coords.latitude + "Longitude: " + position.coords.longitude;
});

// 4. Upload photo to yabu.ph

function uploadPhoto() {
    navigator.splashscreen.show();
    photoFileName = $('#photo').attr('src');
    var options = new FileUploadOptions();
    options.fileKey="avatar";
    options.fileName=photoFileName.substr(photoFileName.lastIndexOf('/')+1);
    options.mimeType="image/jpg";

    var params = new Object();
    options.params = params;

    var ft = new FileTransfer();
    ft.upload(photoFileName, encodeURI("http://www.testphotorestapi.neilmarion.com/upload"), onSuccessUpload, onFailUpload, options);
    localStorage.setItem('photo-file', options.fileName);
    //twUploadPhoto(options.fileName);
    navigator.splashscreen.hide();
    
    //http://www.testphotorestapi.neilmarion.com/avatars
}

function onSuccessUpload(r) {
    console.log("Code = " + r.responseCode);
    console.log("Response = " + r.response);
    console.log("Sent = " + r.bytesSent);
    fbUploadPhoto(localStorage.getItem('photo-file'));
}

function onFailUpload(error) {
    console.log(error);
    alert("An error has occurred: Code = " + error.code);
    console.log("upload error source " + error.source);
    console.log("upload error target " + error.target);
}

// 5. Photo sharing

function shareSocial() {
  photoFileName = $('#photo').attr('src');
  //alert(photoFileName);
  window.plugins.socialsharing.share('#testing #prototype #phonegap #app', null, photoFileName, null);
}

$( "#flip-fb" ).bind( "change", function(event, ui) {
  localStorage.setItem('fbUpload', $("#flip-fb").val());
  fbLogin(); 
});

$( "#flip-tw" ).bind( "change", function(event, ui) {
  localStorage.setItem('twUpload', $("#flip-tw").val());
  twLogin();
});

// 6. Social Login

function fbLogin() {
  FB.login(function(response) {
    if (!response.session) {
      //alert('An error has occurred. Please try again.');
    }
  }, { scope: "email,publish_stream"});
}

function twLogin() {
  cb.setConsumerKey("6EgGqELIUQ9Rvug5baDdug", "a80JEvmJAPVXBtzG6QLsNMzZZE1oDKBJYb419ofmM");
  var id;
  // check if we already have access tokens
  if(localStorage.accessToken && localStorage.tokenSecret) {
    // then directly setToken() and read the timeline
    cb.setToken(localStorage.accessToken, localStorage.tokenSecret);
    // now poll periodically and send an auto-reply when we are mentioned.
    //fetchTweets(id);
  } else { // authorize the user and ask her to get the pin.
    cb.__call(
      "oauth_requestToken",
          {oauth_callback: "http://www.neilmarion.com"},
          function (reply) {
          // nailed it!
              console.log(reply);
              cb.setToken(reply.oauth_token, reply.oauth_token_secret);
              cb.__call(
              "oauth_authorize",  {},
              function (auth_url) {
                var ref = window.open(auth_url, '_blank', 'location=no'); // redirection.
                // check if the location the phonegap changes to matches our callback url or not
                ref.addEventListener("loadstart", function(iABObject) {
                  if(iABObject.url.match(/neilmarion/)) {
                    ref.close();
                    authorize(iABObject);
                  }
                });                 
              }
        );
          }
    );
  }
}

function fbUploadPhoto(fileName) {
  var url = "http://www.testphotorestapi.neilmarion.com/avatars/"+fileName;
    FB.api('/me/photos', 'post', {
        message:'This is a test. Upload through facebook through FB.api and FacebookConnect plugin for Phonegap. Simultaneous upload at http://www.testphotorestapi.neilmarion.com/ #test',
        url:url
    }, function(response){
        if (!response || response.error) {
            alert('Error occured');
        } else {
            alert('Post ID: ' + response.id);
        }
    });
}

function twUploadPhoto(fileName) {
  var url = "http://www.testphotorestapi.neilmarion.com/avatars/"+fileName;

  cb.__call("statuses_update",
    {"status": "This is a test. " + url}, function (reply) {
      console.log(reply); 
  });
}

if (typeof CDV == 'undefined') alert('CDV variable does not exist. Check that you have included cdv-plugin-fb-connect.js correctly');
if (typeof FB == 'undefined') alert('FB variable does not exist. Check that you have included the Facebook JS SDK file.');
