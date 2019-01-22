/**
 * Created by Solln on 16/01/2019.
 */
// Making the actual API request
let text = "";

function makeAPIRequest() {
    console.log("makeAPIRequest starting");

    let markerString = "";
    for (mark of markers) {
        markerString = markerString + mark.getPosition().lat().toFixed(4) + ",";
        markerString = markerString + mark.getPosition().lng().toFixed(4) + "/";
    }

    console.log("Input markers: " + markerString);

    //Get the reurn from this and use it to set the coords for the flightplan
    makeCorsRequest("http://localhost:8080/requestMap?coords=" + markerString);

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

    deleteMarkers();

    let array = text.split("/");

    for (latlng of array) {
        if (latlng !== "") {
            console.log("Returned latlng: " + latlng);
            let indivArray = latlng.split(",");
            returnedCoords.push({lat: parseFloat(indivArray[0]), lng: parseFloat(indivArray[1])});
        }
    }
}