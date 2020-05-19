window.onload = function () {
    this.getLocation();
    var latitude;
    var longitude;
    var product;
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
    alert(product);
    var db = firebase.database();
    leadsRef = db.ref("/data");
    var stores = [];
    leadsRef.orderByChild("UPC_PLU").equalTo(product).once("value").then(function(snapshot) {
        // console.log(snapshot.val());
        snapshot.forEach(function(data) {
            stores.push(data.val());
        })
    })
}

function rankStores(listStoreNames, listStoreCoordinates, listQuantities) {
    // distance (latitude, loonitude) -> list Coord
    // rank ^ with quantities
    // return store names -> display
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