let map;
let markers = [];
let flightPath = [];

let labels = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
let labelIndex = 0;

let mapState = 0;

let markersPlaceable = true;

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
        if (markersPlaceable === true) {
            addMarker(event.latLng);
        }
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
        draggable: true,
        map: map
    });
    markers.push(marker);

    marker.addListener('click', function() {
        deleteMarker(labels.indexOf(marker.label));
    });


    // Show new coords + marker index
    marker.addListener('dragend', handleEvent);

    function handleEvent(event) {
        console.log(event.latLng.lat().toFixed(4));
        console.log(event.latLng.lng().toFixed(4));
        console.log("Index: " + labels.indexOf(marker.label));
    }

    mapState = 1;

}

// Sets the map on all markers in the array.
function setMapOnAll(map) {
    for (var i = 0; i < markers.length; i++) {
        markers[i].setMap(map);
    }
}

// Removes both Markers and Lines from the map
function deleteBoth() {

    if (mapState === 1){
        deleteMarkers();
        labelIndex = 0;
        mapState = 0;
    }else {
        deleteMarkers();
        deleteLines();
        labelIndex = 0;
        mapState = 0;
    }

    document.getElementById("calcButton").disabled = false;
    document.getElementById("calcButton").classList.remove("btn-secondary");
    document.getElementById("calcButton").classList.add("btn-primary");

    document.getElementById("clearButton").classList.remove("btn-primary");
    document.getElementById("clearButton").classList.add("btn-secondary");

    markersPlaceable = true;

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
        console.log('Label: ' + ayy.label);
        console.log('Lat: ' + ayy.getPosition().lat().toFixed(4));
        console.log('Lng: ' + ayy.getPosition().lng().toFixed(4));
        console.log('---------------------')
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


    document.getElementById("calcButton").disabled = true;
    document.getElementById("calcButton").classList.remove("btn-primary");
    document.getElementById("calcButton").classList.add("btn-secondary");

    document.getElementById("clearButton").disabled = false;
    document.getElementById("clearButton").classList.remove("btn-secondary");
    document.getElementById("clearButton").classList.add("btn-primary");

    mapState = 2;
    markersPlaceable = false;

}
