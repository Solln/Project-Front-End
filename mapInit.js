let map;
let markers = [];
let returnedCoords = [];
let flightPathList = [];
let flightPath = [];

// For Labeling the markers
let labels = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
let labelIndex = 0;

let sidebarOut = false;

// For changing the states on the buttons and locking controls
let mapState = 0;
let markersPlaceable = true;

let allAlgos = false;

// For the async wait required for the API call
let timer = false;

function initMap() {

    //Default Location
    let startLocation = {lat: 55.8738, lng: -4.2449};

    let myOptions = {
        zoom: 16,
        disableDefaultUI: true,
    }

    map = new google.maps.Map(document.getElementById('map'), myOptions);

    navigator.geolocation.getCurrentPosition(function (position) {
        // Center on user's current location if geolocation prompt allowed
        startLocation = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);
        map.setCenter(startLocation);
        //addMarker(startLocation);
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

    addYourLocationButton(map);
    addElevationModalButton(map);
    addSearchBar(map);
}

// Adds a marker to the map and push to the array.
function addMarker(location) {
    //Constructs the Marker itself
    let marker = new google.maps.Marker({
        position: location,
        label: labels[labelIndex++ % labels.length],
        draggable: true,
        map: map
    });
    markers.push(marker);

    marker.addListener('click', function () {
        if (markersPlaceable === true) {
            deleteMarker(labels.indexOf(marker.label));
        }
    });

    document.getElementById("calcButton").disabled = false;
    document.getElementById("clearButton").disabled = false;


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
    for (let i = 0; i < markers.length; i++) {
        markers[i].setMap(map);
    }
}

// Removes both Markers and Lines from the map
function clearMarkers() {

    // resets the timer boolean used for the async stuff
    timer = false;

    if (mapState === 1) {
        deleteMarkers();
        labelIndex = 0;
        mapState = 0;
    } else {
        deleteMarkers();
        deleteLines();
        labelIndex = 0;
        mapState = 0;
    }

    document.getElementById("calcButton").disabled = true;
    document.getElementById("calcButton").classList.remove("btn-secondary");
    document.getElementById("calcButton").classList.add("btn-primary");

    document.getElementById("clearButton").disabled = true;
    document.getElementById("clearButton").classList.remove("btn-primary");
    document.getElementById("clearButton").classList.add("btn-secondary");

    document.getElementById("elevation_button").disabled = true;

    markersPlaceable = true;

}

// Deletes all markers in the array by removing references to them.
function deleteMarkers() {
    setMapOnAll(null);
    markers = [];
    returnedCoords = [];
}

// Deletes a single marker via its id
let deleteMarker = function (id) {
    let marker = markers[id];
    // Index - number of items removed
    markers.splice(id, 1)
    // find the marker by given id
    marker.setMap(null);
}

// Deletes Polyline
function deleteLines() {
    //TODO Error with this if no flightpath calculated
    flightPathList.forEach(function(element){
        element.setMap(null);
    });

    flightPath = [];
    flightPathList = [];

}

// Construct and execute the API Request, Timeout on the draw line to ensure the API returns a value.
function calculate() {

    document.getElementById("calcButton").value = "Loading...";
    document.getElementById("calcButton").disabled = true;


    let outerInterval = setInterval(function () {

        if (document.getElementById("calcButton").value === "Loading...") {

            makeAPIRequest();

            //TODO ADD A CLAUSE THAT THROWS ERROR IF SET AMOUNT OF TIME PASSES
            let interval = setInterval(function () {
                if (timer) {
                    console.log("Attempting...")
                    drawLine();
                    clearInterval(interval);
                    document.getElementById("calcButton").value = "Find Route";
                }
            }, 500);

            document.getElementById("elevation_button").disabled = false;
            clearInterval(outerInterval);
        }

    }, 500);


}

// Draws the Polyline between all the returned coordinates in the markers array
function drawLine() {

    // Draws multiple lines for ALL routes when returned
    let colour = 0;
    // RED, GREEN, BLUE, ORANGE, MAGENTA
    let colours = ['#FF0000', '#008000', '#3366ff', '#FFA500' , '#FF00FF']

    if (text.includes("+")) {
        let coordsSplit = text.split("+");

        coordsSplit.forEach(function (element) {
            let fullReturn = element.split(";")
            let coords = fullReturn[1].split("/");

            let counter = 1;

            let tempCoords = [];

            for (latlng of coords) {
                if (latlng !== "") {
                    let indivArray = latlng.split(",");
                    tempCoords.push({
                        label: toLetters(counter),
                        lat: parseFloat(indivArray[0]),
                        lng: parseFloat(indivArray[1]),
                        elevation: indivArray[2]
                    });
                    counter++;
                }
            }

            returnedCoords = tempCoords;

            let flightPlanCoordinates = [];

            for (ayy of returnedCoords) {
                flightPlanCoordinates.push({
                    lat: parseFloat(ayy.lat.toFixed(4)),
                    lng: parseFloat(ayy.lng.toFixed(4))
                })
            }

            flightPath = new google.maps.Polyline({
                path: flightPlanCoordinates,
                geodesic: true,
                strokeColor: colours[colour],
                strokeOpacity: 1.0,
                strokeWeight: 2
            });

            flightPath.setMap(map);
            flightPathList.push(flightPath);
            flightPath = [];
            colour++;
        });
    }
    // Draws a single route if returned
    else {
        console.log("drawLine Single Starting");

        let flightPlanCoordinates = [];

        for (ayy of returnedCoords) {
            flightPlanCoordinates.push({
                lat: parseFloat(ayy.lat.toFixed(4)),
                lng: parseFloat(ayy.lng.toFixed(4))
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
        flightPathList.push(flightPath);
        flightPath = [];

    }
    // Removes the markers visuals
    deleteMarkers();

    // Change the display of the buttons dependant on the state

    document.getElementById("clearButton").disabled = false;
    document.getElementById("clearButton").classList.remove("btn-secondary");
    document.getElementById("clearButton").classList.add("btn-primary");

    document.getElementById("calcButton").classList.remove("btn-primary");
    document.getElementById("calcButton").classList.add("btn-secondary");

    mapState = 2;
    markersPlaceable = false;

    console.log("drawLine finishing");


}

//EXPERIMENTAL STUFF

function addYourLocationButton(map) {
    let controlDiv = document.createElement('div');

    let firstChild = document.createElement('button');
    firstChild.style.backgroundColor = '#fff';
    firstChild.style.border = 'none';
    firstChild.style.outline = 'none';
    firstChild.style.width = '28px';
    firstChild.style.height = '28px';
    firstChild.style.borderRadius = '2px';
    firstChild.style.boxShadow = '0 1px 4px rgba(0,0,0,0.3)';
    firstChild.style.cursor = 'pointer';
    firstChild.style.marginRight = '10px';
    firstChild.style.padding = '0px';
    firstChild.title = 'Your Location';
    controlDiv.appendChild(firstChild);

    let secondChild = document.createElement('div');
    secondChild.style.margin = '5px';
    secondChild.style.width = '18px';
    secondChild.style.height = '18px';
    secondChild.style.backgroundImage = 'url(https://maps.gstatic.com/tactile/mylocation/mylocation-sprite-1x.png)';
    secondChild.style.backgroundSize = '180px 18px';
    secondChild.style.backgroundPosition = '0px 0px';
    secondChild.style.backgroundRepeat = 'no-repeat';
    secondChild.id = 'you_location_img';
    firstChild.appendChild(secondChild);

    google.maps.event.addListener(map, 'dragend', function () {
        $('#you_location_img').css('background-position', '0px 0px');
    });

    firstChild.addEventListener('click', function () {
        let imgX = '0';
        let animationInterval = setInterval(function () {
            if (imgX == '-18') imgX = '0';
            else imgX = '-18';
            $('#you_location_img').css('background-position', imgX + 'px 0px');
        }, 500);
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(function (position) {
                let latlng = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);
                addMarker(latlng);
                map.setCenter(latlng);
                clearInterval(animationInterval);
                $('#you_location_img').css('background-position', '-144px 0px');
            });
        }
        else {
            clearInterval(animationInterval);
            $('#you_location_img').css('background-position', '0px 0px');
        }
    });

    controlDiv.index = 1;
    map.controls[google.maps.ControlPosition.RIGHT_BOTTOM].push(controlDiv);
}

function addElevationModalButton(map) {
    let controlDiv = document.createElement('div');

    let firstChild = document.createElement('button');
    firstChild.id = "elevation_button";
    firstChild.disabled = true;
    firstChild.style.backgroundColor = '#fff';
    firstChild.style.border = 'none';
    firstChild.style.outline = 'none';
    firstChild.style.width = '28px';
    firstChild.style.height = '28px';
    firstChild.style.borderRadius = '2px';
    firstChild.style.boxShadow = '0 1px 4px rgba(0,0,0,0.3)';
    firstChild.style.cursor = 'pointer';
    firstChild.style.marginRight = '10px';
    firstChild.style.marginTop = '10px';
    firstChild.style.padding = '0px';
    firstChild.title = 'Elevation Map';
    controlDiv.appendChild(firstChild);

    let secondChild = document.createElement('div');
    secondChild.style.margin = '5px';
    secondChild.style.width = '18px';
    secondChild.style.height = '18px';
    secondChild.style.background = 'url(elevationIcon.png) no-repeat center center';
    secondChild.style.backgroundSize = "100% 100%";
    secondChild.style.backgroundPosition = '0px 0px';
    secondChild.style.backgroundRepeat = 'no-repeat';
    secondChild.id = 'elevation_img';
    firstChild.appendChild(secondChild);

    firstChild.addEventListener('click', function () {
        $('#myModal').modal('show');
    });

    controlDiv.index = 1;
    map.controls[google.maps.ControlPosition.RIGHT_TOP].push(controlDiv);
}

function addSearchBar(map) {
    let controlDiv = document.createElement('div');

    let firstChild = document.createElement('input');
    firstChild.style.backgroundColor = '#fff';
    firstChild.style.border = 'none';
    firstChild.style.outline = 'none';
    firstChild.style.width = '30vh';
    firstChild.style.height = '28px';
    firstChild.style.borderRadius = '2px';
    firstChild.style.boxShadow = '0 1px 4px rgba(0,0,0,0.3)';
    firstChild.style.cursor = 'pointer';
    firstChild.style.marginLeft = '10px';
    firstChild.style.marginTop = '10px';
    firstChild.style.padding = '0px';
    firstChild.title = 'Enter Coords here';
    firstChild.id = "pac-input";
    firstChild.classList.add("controls");
    firstChild.type = "text";
    firstChild.placeholder = "  LAT, LNG";
    controlDiv.appendChild(firstChild);


    controlDiv.index = 1;
    map.controls[google.maps.ControlPosition.LEFT_TOP].push(controlDiv);
}

function buildElevationGraph() {

    let xAxis = [];
    let data = [];

    for (entry of returnedCoords) {
        xAxis.push("");
        data.push(entry.elevation);
    }

    document.getElementById("lineChart").style.visibility = "visible";
    document.getElementById("eleFooterContent").style.visibility = "visible";

    document.getElementById("midpointInfo").style.visibility = "hidden";
    document.getElementById("treeInfo").style.visibility = "hidden";
    document.getElementById("treePlusInfo").style.visibility = "hidden";
    document.getElementById("multiInfo").style.visibility = "hidden";
    document.getElementById("meshInfo").style.visibility = "hidden";

    let ctxL = document.getElementById("lineChart").getContext('2d');
    let myLineChart = new Chart(ctxL, {
        type: 'line',
        width: '600px',
        height: '400px',
        data: {
            labels: xAxis,
            datasets: [{
                label: "Elevation",
                data: data,
                backgroundColor: [
                    'rgba(105, 0, 132, .2)',
                ],
                borderColor: [
                    'rgba(200, 99, 132, .7)',
                ],
                borderWidth: 2
            },]
        },
        options: {
            responsive: true
        }
    });
}

function clearAlgo(element) {
    $('#Mesh').removeClass();
    $('#Multi').removeClass();
    $('#Tree').removeClass();
    $('#TreeP').removeClass();
    $('#Mid').removeClass();
    $('#All').removeClass();

    element.classList.add('selected');

    if (element.id === "All") {
        allAlgos = true;
    }
    else {
        allAlgos = false;
    }

    console.log(allAlgos);
}

function clearSlope(element) {
    $('#20').removeClass();
    $('#30').removeClass();
    $('#40').removeClass();
    element.classList.add('selected');
}

async function sideBarExtender() {

    if ($(window).width() <= 800) {

        if (document.getElementById("sidebar").classList.contains('active')) {
            sidebarOut = true;
        }
        else {
            sidebarOut = false;
        }

        console.log("Sidebar - " + sidebarOut);

        await sleep(350);

        if (sidebarOut === false) {
            document.getElementById("calcButton").style.visibility = "visible";
            document.getElementById("clearButton").style.visibility = "visible";
        }
        else {
            document.getElementById("calcButton").style.visibility = "hidden";
            document.getElementById("clearButton").style.visibility = "hidden";
        }
    }
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}




