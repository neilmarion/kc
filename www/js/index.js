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
    app.receivedEvent('deviceready');
    pictureSource=navigator.camera.PictureSourceType;
    destinationType=navigator.camera.DestinationType;
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

function changePage(page){
   $.mobile.changePage( page, { transition: "slideup", changeHash: false }); 
}

// 1. Capturing Photo

function capturePhoto() {
  // Take picture using device camera and retrieve image as base64-encoded string
  navigator.camera.getPicture(onPhotoDataSuccess, onFail, { quality: 50, correctOrientation: true });
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
  var mobileDemo = { 'center': position.coords.latitude + ',' + position.coords.longitude, 'zoom': 10 };
  changePage('#directions_map');

  demo.add('directions_map', function() {
    $('#map_canvas_1').gmap({'center': mobileDemo.center, 'zoom': mobileDemo.zoom, 'disableDefaultUI':true, 'callback': function() {
      var self = this;

        var latlng = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);
        //var latlng = new google.maps.LatLng(14.4559, 120.9820);
        self.get('map').panTo(latlng);

        self.displayDirections({ 'origin': new google.maps.LatLng(position.coords.latitude, position.coords.longitude), 'destination': new google.maps.LatLng(14.534819, 120.997839), 'travelMode': google.maps.DirectionsTravelMode.DRIVING }, { 'panel': document.getElementById('directions')}, function(response, status) {
          ( status === 'OK' ) ? $('#results').show() : $('#results').hide();
        });
    }});
  }).load('directions_map');
  $('#map_canvas_1').css('height',getRealContentHeight());
  //$('#map_canvas_1').css('width', '100%');

  var element = document.getElementById('geolocation'); 
  element.innerHTML = "Latitude: " + position.coords.latitude + "Longitude: " + position.coords.longitude;
}

function onErrorMap(error) {
  alert('code: ' + error.code + ' mesasge ' + error.message);
}

function gotoMap() {
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


