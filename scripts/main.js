window.onload = function () {
    this.getLocation();
    var latitude;
    var longitude;
    var product;
    var searchResults;
    // this.searchForProduct();
    document.getElementById("productSearch").addEventListener("click", this.searchForProduct);
}

function getLocation() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(storePosition);
    } 
}

function storePosition(position) {
    latitude = position.coords.latitude; 
    longitude = position.coords.longitude;
}

async function searchForProduct() {
    product = parseInt(document.getElementById("product").value);
    var db = firebase.database();
    leadsRef = db.ref("/data");
    searchResults = [];
    var database = leadsRef.orderByChild("UPC_PLU").equalTo(product);
    var snapshot = await database.once('value');

    if (snapshot.exists()) {
        snapshot.forEach(function(data) {
            console.log(data.val());
            searchResults.push(data.val());
        })
    }
    if (searchResults.length == 0) {
        alert("Sorry, the UPC/PLU code you entered was not found.")
        return ;
    } 

    // update product name
    var description = searchResults[0]["Description"]
    var size = searchResults[0]["Size"]
    var unit = searchResults[0]["Unit"]

    document.getElementById("foundProduct").innerText = description + " " + size + " " + unit;
    rankStores();
}

function rankStores() {

    var keep = [];

    for (var i = 0; i < searchResults.length; i++) {
        var lat, lng;
        lat = searchResults[i]["Latitude"];
        lng = searchResults[i]["Longitude"]; 
        d = getDistanceFromLatLonInKm(lat, lng, latitude, longitude);
        if (d < 10) {
            keep.push(i);
        }
    }

    var results = [];
    for (i in keep) {
        results.push(searchResults[i]);
    }
    console.log("###")
    console.log(results)

    results.sort(function(a, b) {return b["Quantity"] - a["Quantity"]});

    console.log(results[2]);
    // update html texts
    document.getElementById("FirstStore").innerText = "Store: " + String(results[0]["Store"]);
    document.getElementById("SecondStore").innerText = "Store: " + String(results[1]["Store"]);
    document.getElementById("ThirdStore").innerText = "Store: " + String(results[2]["Store"]);
    document.getElementById("FourthStore").innerText = "Store: " + String(results[3]["Store"]);

    document.getElementById("FirstGMap").addEventListener("click", function() {window.open(results[0]["Location"])})
    document.getElementById("SecondGMap").addEventListener("click", function() {window.open(results[1]["Location"])})
    document.getElementById("ThirdGMap").addEventListener("click", function() {window.open(results[2]["Location"])})
    document.getElementById("FourthGMap").addEventListener("click", function() {window.open(results[3]["Location"])})

    document.getElementById("FirstQuant").innerText = "Quantity: " + String(results[0]["Quantity"]);
    document.getElementById("SecondQuant").innerText = "Quantity: " + String(results[1]["Quantity"]);
    document.getElementById("ThirdQuant").innerText = "Quantity: " + String(results[2]["Quantity"]);
    document.getElementById("FourthQuant").innerText = "Quantity: " + String(results[3]["Quantity"]);
}

function getDistanceFromLatLonInKm(lat1,lon1,lat2,lon2) {
    // https://stackoverflow.com/questions/27928/calculate-distance-between-two-latitude-longitude-points-haversine-formula
    var R = 6371; // Radius of the earth in km
    var dLat = deg2rad(lat2-lat1);  // deg2rad below
    var dLon = deg2rad(lon2-lon1); 
    var a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * 
      Math.sin(dLon/2) * Math.sin(dLon/2)
      ; 
    var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
    var d = R * c; // Distance in km
    return d;
}

function deg2rad(deg) {
    return deg * (Math.PI/180);
 }

//   // Set the configuration for your app
//   // TODO: Replace with your project's config object
//   var config = {
//     apiKey: "apiKey",
//     authDomain: "projectId.firebaseapp.com",
//     databaseURL: "https://grocery-assistants.firebaseio.com",
//     storageBucket: "bucket.appspot.com"
//   };
//   firebase.initializeApp(config);

//   // Get a reference to the database service
//   var database = firebase.database();