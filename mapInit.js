let map;
let markers = [];
let flightPath = [];

let labels = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
let labelIndex = 0;

function initMap() {

    //Default Location
    var startLocation = {lat: 55.8738, lng: -4.2449};

    var myOptions = {
        zoom: 16,
        disableDefaultUI: true,
    }

    map = new google.maps.Map(document.getElementById('map'), myOptions);

    navigator.geolocation.getCurrentPosition(function (position) {
        // Center on user's current location if geolocation prompt allowed
        startLocation = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);
        map.setCenter(startLocation);
        addMarker(startLocation);
    }, function (positionError) {
        // User denied geolocation prompt - default to Glasgow
        map.setCenter(new google.maps.LatLng(56.4907, -4.2026));
    });


    // This event listener will call addMarker() when the map is clicked.
    map.addListener('click', function (event) {
        addMarker(event.latLng);
    });

}

// Adds a marker to the map and push to the array.
function addMarker(location) {

    //Constructs the Marker itself
    //TODO ADD A DRAGEND TO UPDATE INFOWINDOWS LAT LNG TO NEW CORRECT DRAGGED TO VALUES?,
    //TODO OR POTENTIAL DONT REQUIRE THE INFOWINDOW, USE DIRECT VALUES AS DRAGGABLE SEEMS TO WORK...
    var marker = new google.maps.Marker({
        position: location,
        label: labels[labelIndex++ % labels.length],
        // draggable: true,
        map: map
    });
    markers.push(marker);

    //Constructs the infoWindow's properties
    var infoWindow = new google.maps.InfoWindow({
        content: '<p>Lat: '+ location.lat().toFixed(4) + '</p> <p>Lng: ' + location.lng().toFixed(4) + '<p>Index: ' + labelIndex + '</p>',
        maxWidth: 200
    });

    // Adds a click listener for the infoWindow / Will change this later to grab marker details and remove from array
    marker.addListener('click', function() {
        infoWindow.open(map, marker);
    });

    // marker.addListener('click', function() {
    //     deleteMarker(infowindow.content);
    // });

}


// Sets the map on all markers in the array.
function setMapOnAll(map) {
    for (var i = 0; i < markers.length; i++) {
        markers[i].setMap(map);
    }
}

// Removes both Markers and Lines from the map
function deleteBoth() {
    deleteMarkers();
    deleteLines();
    labelIndex = 0;
}


// Deletes all markers in the array by removing references to them.
function deleteMarkers() {
    setMapOnAll(null);
    markers = [];
}

// Deletes a single marker via its id
var deleteMarker = function (id) {
    var marker = markers[id];
    // Index - number of items removed
    markers.splice(id, 1)
    // find the marker by given id
    marker.setMap(null);
}

// Deletes Polyline
function deleteLines() {
    //TODO Error with this if no flightpath calculated
    flightPath.setMap(null);
    flightPath = [];
}

// Draws the Polyline between all the markers in the markers array
function drawLine() {

    var flightPlanCoordinates = [];

    for (ayy of markers) {
        console.log(ayy.getPosition().lat().toFixed(4));
        console.log(ayy.getPosition().lng().toFixed(4));
        flightPlanCoordinates.push({
            lat: parseFloat(ayy.getPosition().lat().toFixed(4)),
            lng: parseFloat(ayy.getPosition().lng().toFixed(4))
        })
    }

    flightPath = new google.maps.Polyline({
        path: flightPlanCoordinates,
        geodesic: true,
        strokeColor: '#FF0000',
        strokeOpacity: 1.0,
        strokeWeight: 2
    });

    flightPath.setMap(map);

    // Removes the markers visuals
    deleteMarkers();
}
