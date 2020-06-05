var db;
var uniqueDescNames;

window.onload = function () {
    this.getLocation();
    var latitude;
    var longitude;
    var product;
    var searchResults;
    var searchResultKeys;
    // this.searchForProduct();
    document.getElementById("productSearch").addEventListener("click", this.searchForProductByName);
    document.getElementById("update1stQuant").addEventListener("click", this.updateFirstQuantity);
    document.getElementById("update2ndQuant").addEventListener("click", this.updateSecondQuantity);
    document.getElementById("update3rdQuant").addEventListener("click", this.updateThirdQuantity);
    document.getElementById("update4thQuant").addEventListener("click", this.updateFourthQuantity);
    // searchForProductByNameBigList();
    var testUniqueDescNames = ["Bread","Milk","Cheese", "Eggs", "Baby Formula"];
    autocomplete(document.getElementById("product"), testUniqueDescNames);
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

async function searchForProductByNameBigList() {
    db = firebase.database();
    leadsRef = db.ref("/data");
    searchResults = [];
    searchResultKeys = [];

    // var query = product;
    var database = leadsRef.orderByChild("Description")
    var snapshot = await database.once('value');

    if (snapshot.exists()) {
        snapshot.forEach(function(data) {
            searchResults.push(data.val());
            searchResultKeys.push(data.key);
        })
    }

    // get just descriptions
    var descNames = [];
    for (const d of searchResults) {
        descNames.push(d["Description"]);
    }
    // ready to display in list herej
    let uniqueDescNames = [...new Set(descNames)]; 

    console.log(uniqueDescNames.length)
}

async function searchForProductByUPC() {
    getLocation();
    product = parseInt(document.getElementById("product").value);
    db = firebase.database();
    leadsRef = db.ref("/data");
    searchResults = [];
    searchResultKeys = [];
    var database = leadsRef.orderByChild("UPC_PLU").equalTo(product);
    var snapshot = await database.once('value');

    if (snapshot.exists()) {
        snapshot.forEach(function(data) {
            searchResults.push(data.val());
            searchResultKeys.push(data.key);
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

async function searchForProductByName(query) {
    db = firebase.database();
    leadsRef = db.ref("/data");
    searchResults = [];
    searchResultKeys = [];

    var database = leadsRef.orderByChild("Description").startAt(query).endAt(query + "\uf8ff")
    var snapshot = await database.once('value');

    if (snapshot.exists()) {
        snapshot.forEach(function(data) {
            searchResults.push(data.val());
            searchResultKeys.push(data.key);
        })
    }
    // get just descriptions
    var descNames = [];
    for (const d of searchResults) {
        descNames.push(d["Description"]);
    }
    // ready to display in list herej
    let uniqueDescNames = [...new Set(descNames)]; 
    console.log("got here");

    // if (uniqueDescNames.length == 0) {
    //     alert("Sorry, no product was found.")
    //     return ;
    // } 
    return uniqueDescNames;
}

function autocomplete(inp, arr) {
    document.innerHTML = "Hello";
    /*the autocomplete function takes two arguments,
    the text field element and an array of possible autocompleted values:*/
    var currentFocus;
    /*execute a function when someone writes in the text field:*/
    inp.addEventListener("input", async function(e) {
        var a, b, i, val = this.value;
        /*close any already open lists of autocompleted values*/
        closeAllLists();
        if (!val) { return false;}
        currentFocus = -1;
        /*create a DIV element that will contain the items (values):*/
        a = document.createElement("DIV");
        a.setAttribute("id", this.id + "autocomplete-list");
        a.setAttribute("class", "autocomplete-items");
        /*append the DIV element as a child of the autocomplete container:*/
        this.parentNode.appendChild(a);
        /*for each item in the array...*/
        console.log(val);
        arr = await searchForProductByName(val); 
        console.log(arr);
        for (i = 0; i < arr.length; i++) {
          /*check if the item starts with the same letters as the text field value:*/
          if (arr[i].substr(0, val.length).toUpperCase() == val.toUpperCase()) {
            /*create a DIV element for each matching element:*/
            b = document.createElement("DIV");
            /*make the matching letters bold:*/
            b.innerHTML = "<strong>" + arr[i].substr(0, val.length) + "</strong>";
            b.innerHTML += arr[i].substr(val.length);
            /*insert a input field that will hold the current array item's value:*/
            b.innerHTML += "<input type='hidden' value='" + arr[i] + "'>";
            /*execute a function when someone clicks on the item value (DIV element):*/
            b.addEventListener("click", function(e) {
                /*insert the value for the autocomplete text field:*/
                inp.value = this.getElementsByTagName("input")[0].value;
                /*close the list of autocompleted values,
                (or any other open lists of autocompleted values:*/
                closeAllLists();
            });
            a.appendChild(b);
          }
        }
    });
    /*execute a function presses a key on the keyboard:*/
    inp.addEventListener("keydown", function(e) {
        var x = document.getElementById(this.id + "autocomplete-list");
        if (x) x = x.getElementsByTagName("div");
        if (e.keyCode == 40) {
          /*If the arrow DOWN key is pressed,
          increase the currentFocus variable:*/
          currentFocus++;
          /*and and make the current item more visible:*/
          addActive(x);
        } else if (e.keyCode == 38) { //up
          /*If the arrow UP key is pressed,
          decrease the currentFocus variable:*/
          currentFocus--;
          /*and and make the current item more visible:*/
          addActive(x);
        } else if (e.keyCode == 13) {
          /*If the ENTER key is pressed, prevent the form from being submitted,*/
          e.preventDefault();
          if (currentFocus > -1) {
            /*and simulate a click on the "active" item:*/
            if (x) x[currentFocus].click();
          }
        }
    });
    function addActive(x) {
      /*a function to classify an item as "active":*/
      if (!x) return false;
      /*start by removing the "active" class on all items:*/
      removeActive(x);
      if (currentFocus >= x.length) currentFocus = 0;
      if (currentFocus < 0) currentFocus = (x.length - 1);
      /*add class "autocomplete-active":*/
      x[currentFocus].classList.add("autocomplete-active");
    }
    function removeActive(x) {
      /*a function to remove the "active" class from all autocomplete items:*/
      for (var i = 0; i < x.length; i++) {
        x[i].classList.remove("autocomplete-active");
      }
    }
    function closeAllLists(elmnt) {
      /*close all autocomplete lists in the document,
      except the one passed as an argument:*/
      var x = document.getElementsByClassName("autocomplete-items");
      for (var i = 0; i < x.length; i++) {
        if (elmnt != x[i] && elmnt != inp) {
          x[i].parentNode.removeChild(x[i]);
        }
      }
    }
    /*execute a function when someone clicks in the document:*/
    document.addEventListener("click", function (e) {
        closeAllLists(e.target);
    });
}



function rankStores() {

    var keep = [];

    for (var i = 0; i < searchResults.length; i++) {
        var lat, lng;
        lat = searchResults[i]["Latitude"];
        lng = searchResults[i]["Longitude"]; 
        d = getDistanceFromLatLonInKm(lat, lng, latitude, longitude);

        if (d < 3) {
            keep.push(i);
        }
    }

    var results = [];
    var resultKeys = [];
    for (i in keep) {
        results.push(searchResults[i]);
        resultKeys.push(searchResultKeys[i]);
    }

    result_tuple = [];
    for (var i = 0; i < results.length; i++) {
        result_tuple.push([results[i], resultKeys[i]])
    }

    result_tuple.sort(function(a, b) {return b[0]["Quantity"] - a[0]["Quantity"]});

    // update html texts
    document.getElementById("FirstStore").innerText = "Store: " + String(result_tuple[0][0]["Store"]);
    document.getElementById("SecondStore").innerText = "Store: " + String(result_tuple[1][0]["Store"]);
    document.getElementById("ThirdStore").innerText = "Store: " + String(result_tuple[2][0]["Store"]);
    document.getElementById("FourthStore").innerText = "Store: " + String(result_tuple[3][0]["Store"]);

    document.getElementById("FirstGMap").addEventListener("click", function() {window.open(result_tuple[0][0]["Location"])})
    document.getElementById("SecondGMap").addEventListener("click", function() {window.open(result_tuple[1][0]["Location"])})
    document.getElementById("ThirdGMap").addEventListener("click", function() {window.open(result_tuple[2][0]["Location"])})
    document.getElementById("FourthGMap").addEventListener("click", function() {window.open(result_tuple[3][0]["Location"])})

    document.getElementById("FirstQuant").innerText = "Quantity: " + String(result_tuple[0][0]["Quantity"]);
    document.getElementById("SecondQuant").innerText = "Quantity: " + String(result_tuple[1][0]["Quantity"]);
    document.getElementById("ThirdQuant").innerText = "Quantity: " + String(result_tuple[2][0]["Quantity"]);
    document.getElementById("FourthQuant").innerText = "Quantity: " + String(result_tuple[3][0]["Quantity"]);
}

function updateFirstQuantity() {
    // updates 1st quantity
    var new_first_quant = result_tuple[0][0];
    new_first_quant['Quantity'] = document.getElementById("1stQuantVal").value;
    key = result_tuple[0][1];
    var updates = {};
    updates["/data/" + key] = new_first_quant;

    firebase.database().ref().update(updates);
    alert("Thank you for the feedback!");
    document.getElementById("1stQuantVal").reset();
}

function updateSecondQuantity() {
    // update 2nd
    new_second_quant = result_tuple[1][0];
    new_second_quant['Quantity'] = document.getElementById("2ndQuantVal").value;
    key = result_tuple[1][1];
    updates = {};
    updates["/data/" + key] = new_second_quant;

    firebase.database().ref().update(updates);
    alert("Thank you for the feedback!");
    document.getElementById("2ndQuantVal").reset();
}

function updateThirdQuantity() {
    // update 3rd
    new_third_quant = result_tuple[2][0];
    new_third_quant['Quantity'] = document.getElementById("3rdQuantVal").value;
    key = result_tuple[2][1];
    updates = {};
    updates["/data/" + key] = new_third_quant;

    firebase.database().ref().update(updates);
    alert("Thank you for the feedback!");
    document.getElementById("3rdQuantVal").reset();
}

function updateFourthQuantity() {
    // update 4th
    new_fourth_quant = result_tuple[3][0];
    new_fourth_quant['Quantity'] = document.getElementById("4thQuantVal").value;
    key = result_tuple[3][1];
    updates = {};
    updates["/data/" + key] = new_fourth_quant;

    firebase.database().ref().update(updates);
    alert("Thank you for the feedback!");
    document.getElementById("4thQuantVal").reset();
}

function getDistanceFromLatLonInKm(lat1, lon1, lat2, lon2, unit) {
if ((lat1 == lat2) && (lon1 == lon2)) {
        return 0;
    }
    else {
        var radlat1 = Math.PI * lat1/180;
        var radlat2 = Math.PI * lat2/180;
        var theta = lon1-lon2;
        var radtheta = Math.PI * theta/180;
        var dist = Math.sin(radlat1) * Math.sin(radlat2) + Math.cos(radlat1) * Math.cos(radlat2) * Math.cos(radtheta);
        if (dist > 1) {
            dist = 1;
        }
        dist = Math.acos(dist);
        dist = dist * 180/Math.PI;
        dist = dist * 60 * 1.1515;
        if (unit=="K") { dist = dist * 1.609344 }
        if (unit=="N") { dist = dist * 0.8684 }
        return dist;
    }
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