var zwsid = "X1-ZWz1g1sajndpfv_34dhf";
var map;
var request = new XMLHttpRequest();
var markers = new Array;
var marker;
var infowindow;
var address ;

function initialize() {
	var centralArlington = new google.maps.LatLng(32.75, -97.13);
	var mapArlington = {
		center: centralArlington,
		zoom:17,
		mapTypeId:google.maps.MapTypeId.ROADMAP
	};
	var map=new google.maps.Map(document.getElementById("map"), mapArlington );
	var geocoder = new google.maps.Geocoder;
	infowindow= new google.maps.InfoWindow;
	google.maps.event.addListener(map, 'click', function(event){
		clearMarkers ();
		reverseGeocode(geocoder, map, event.latLng.lat(), event.latLng.lng());	
	});
	var address = document.getElementById('address').value;
	if(address != "") {
		geoCode(address, geocoder, map);
	}
}

function geoCode(address, geocoder, map) {
    geocoder.geocode( { 'address': address}, function(results, status) {
      if (status == 'OK') {
        map.setCenter(results[0].geometry.location);
        marker = new google.maps.Marker({
            map: map,
            position: results[0].geometry.location
        });
		markers.push(marker);
      } 
    });	
}

function reverseGeocode(geocoder, map,lat,lng) {
	var latlng = {lat: parseFloat(lat), lng: parseFloat(lng)};
	geocoder.geocode({'location': latlng}, function(results, status) {
		if (status === google.maps.GeocoderStatus.OK) {
			if (results[1]) {
				map.setZoom(17);
				marker = new google.maps.Marker({
					position: latlng,
					map: map
				});
				markers.push(marker);
				address = results[0].formatted_address;
				for (var i = 0; i < results[0].address_components.length; i++) {
					if(results[0].address_components[i].types[0] == "street_number") {
						var street_number = results[0].address_components[i].short_name
					}
					if(results[0].address_components[i].types[0] == "route") {
						var street_name = results[0].address_components[i].short_name
					}
					if(results[0].address_components[i].types[0] == "locality") {
						var city = results[0].address_components[i].short_name
					}
					if(results[0].address_components[i].types[0] == "administrative_area_level_1") {
						var state = results[0].address_components[i].short_name
					}
					if(results[0].address_components[i].types[0] == "postal_code") {
						var postal = results[0].address_components[i].short_name
					}
				}
				sendRequestGeo(street_name, street_number, city, state, postal);
			} else {
				window.alert('No results found');
			}
		} else {
			window.alert('Geocoder failed due to: ' + status);
		}
	});
}

function sendRequestGeo (street_name, street_number, city, state, postal) {
    var address = street_number + " " + street_name;
    var city = city;
    var state = state;
    var zipcode = postal;
    request.open("GET","proxy.php?zws-id="+zwsid+"&address="+address+"&citystatezip="+city+"+"+state+"+"+zipcode);
    request.withCredentials = "true";
	request.onreadystatechange = function() { 
		if (this.readyState == 4) {
			var xml = request.responseXML.documentElement;
			var value = xml.getElementsByTagName("zestimate")[0].getElementsByTagName("amount")[0].innerHTML;
			document.getElementById("address_area").value += address + " " + city + " " + state + " " + zipcode  + "\n";
			document.getElementById("amount_area").value += value + "\n";
			infowindow.setContent(address + " " + city + " " + state + " " + zipcode  + "; Estimate: " + value);
			infowindow.open(map, marker);
		}
	};
    request.send(null);
}

function sendRequest () {
    var address = document.getElementById("address").value;
    var city = document.getElementById("city").value;
    var state = document.getElementById("state").value;
    var zipcode = document.getElementById("zipcode").value;
    request.open("GET","proxy.php?zws-id="+zwsid+"&address="+address+"&citystatezip="+city+"+"+state+"+"+zipcode);
    request.withCredentials = "true";
	request.onreadystatechange = function() {
		if (this.readyState == 4) {
			var xml = request.responseXML.documentElement;
			var value = xml.getElementsByTagName("zestimate")[0].getElementsByTagName("amount")[0].innerHTML;
			document.getElementById("address_area").value += address + " " + city + " " + state + " " + zipcode + "\n";
			document.getElementById("amount_area").value += value  + "\n";
			infowindow.setContent(address + " " + city + " " + state + " " + zipcode  + "; Estimate: " + value);
			infowindow.open(map, marker);
		}
	};
    request.send(null);
}

function clearHistory () {
	document.getElementById("address").value = "";	
	document.getElementById("city").value = "";	
	document.getElementById("state").value = "";	
	document.getElementById("zipcode").value = "";	
}

function clearMarkers (){
	for (var i = 0; i < markers.length; i++) {
		markers[i].setMap(null);
	}
	markers = new Array;
}
