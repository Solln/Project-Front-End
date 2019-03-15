/**
 * Created by Solln on 16/01/2019.
 */
// Making the actual API request
let text = "";

function makeAPIRequest() {
    console.log("makeAPIRequest starting");

    let markerString = getSlope() + "/" + getAlgo() + ";";

    for (mark of markers) {
        markerString = markerString + mark.getPosition().lat().toFixed(4) + ",";
        markerString = markerString + mark.getPosition().lng().toFixed(4) + "/";
    }

    console.log("Input: " + markerString);

    //Get the return from this and use it to set the coords for the flightplan
    makeCorsRequest("http://localhost:8080/requestMap?coords=" + markerString);

    //Spinner End

    console.log("makeAPIRequest finishing");
}

// Create the XHR object.
function createCORSRequest(method, url) {
    console.log("createCORSRequest starting");
    var xhr = new XMLHttpRequest();
    if ("withCredentials" in xhr) {
        // XHR for Chrome/Firefox/Opera/Safari.
        xhr.open(method, url, false);
    } else if (typeof XDomainRequest != "undefined") {
        // XDomainRequest for IE.
        xhr = new XDomainRequest();
        xhr.open(method, url);
    } else {
        // CORS not supported.
        xhr = null;
    }
    console.log("createCORSRequest finishing");
    return xhr;
}

// Make the actual CORS request.
async function makeCorsRequest(url) {
    // This is a sample server that supports CORS.
    console.log("makeCorsRequest starting");

    var xhr = await createCORSRequest('GET', url);
    if (!xhr) {
        alert('CORS not supported');
        return;
    }

    // Response handlers.
    //TODO Move this var text to global so I can access it anywhere
    xhr.onload = function () {
        text = xhr.responseText;
        replaceMarkers();
        timer = true;
    };

    xhr.onerror = function () {
        alert('Woops, there was an error making the request.');
    };

    xhr.send();

    console.log("makeCorsRequest finishing");


}

function replaceMarkers() {
    console.log("ReplaceMarkers Starting");

    deleteMarkers();

    if (text.includes("No Route Found")) {
        document.getElementById("warningModalText").innerHTML = "No Valid safe route was found for these locations";
        $('#warningModal').modal('show');
    }
    else if (text.includes("+")) {
        // ADD SOMETHING INTO THE CANVAS AREA RATHER THAN THE GRAPH
        console.log("Multiple Route Return")

        // 0 - Slope / 1 - Distance / 2 - Time

        let distances = [];
        let times = [];

        let fullReturn = text.split("+")
        fullReturn.forEach(function (element) {
            let set = element.split(";")
            let settings = set[0].split("/");
            distances.push(settings[1]);
            times.push(settings[2]);

        });

        // document.getElementById("lineChart").style.visibility = "hidden";
        // document.getElementById("eleFooterContent").style.visibility = "hidden";
        //
        // document.getElementById("midpointInfo").style.visibility = "visible";
        // document.getElementById("treeInfo").style.visibility = "visible";
        // document.getElementById("treePlusInfo").style.visibility = "visible";
        // document.getElementById("multiInfo").style.visibility = "visible";
        // document.getElementById("meshInfo").style.visibility = "visible";
        //
        // document.getElementById("midpointInfo").innerHTML = "Midpoint (Red) - Dist: " + distances[0] + ", Time: " + times[0];
        // document.getElementById("treeInfo").innerHTML = "Tree (Green) - Dist: " + distances[1] + ", Time: " + times[1];
        // document.getElementById("treePlusInfo").innerHTML = "TreePlus (Blue) - Dist: " + distances[2] + ", Time: " + times[2];
        // document.getElementById("multiInfo").innerHTML = "Multi (Orange) - Dist: " + distances[3] + ", Time: " + times[3];
        // document.getElementById("meshInfo").innerHTML = "Mesh (Magenta) - Dist: " + distances[4] + ", Time: " + times[4];


    }
    else {

        // settings[0] contains settings, [1] contains the returned coords
        let fullReturn = text.split(";")
        let settings = fullReturn[0].split("/");
        let coords = fullReturn[1].split("/");

        console.log("Max incline is: " + settings[0]);

        if (settings[0] > getSlope()) {
            document.getElementById("warningModalText").innerHTML = "This route contains an area of " + settings[0] + " degrees incline";
            $('#warningModal').modal('show');
        }

        console.log("Total Distance: " + settings[1]);
        let distance = Number(settings[1] / 1000).toFixed(2);
        document.getElementById("eleFooterContent").innerHTML = "Total Distance: " + distance + " Km" + "<br /> Time: " + settings[2] + " Mins";


        let counter = 1;

        for (latlng of coords) {
            if (latlng !== "") {
                let indivArray = latlng.split(",");
                returnedCoords.push({
                    label: toLetters(counter),
                    lat: parseFloat(indivArray[0]),
                    lng: parseFloat(indivArray[1]),
                    elevation: indivArray[2]
                });
                counter++;
            }
        }

        buildElevationGraph();

        console.log("Markers: " + counter);

        console.log("ReplaceMarkers Finishing");
    }
}

function toLetters(num) {
    "use strict";
    var mod = num % 26,
        pow = num / 26 | 0,
        out = mod ? String.fromCharCode(64 + mod) : (--pow, 'Z');
    return pow ? toLetters(pow) + out : out;
}

function getSlope() {
    let x = document.getElementById("slopeSelector");
    let slope = x.getElementsByClassName("selected")[0].value;
    return slope;
}

function getAlgo() {
    let x = document.getElementById("algoSelector");
    let algo = x.getElementsByClassName("selected")[0].value;
    return algo;
}