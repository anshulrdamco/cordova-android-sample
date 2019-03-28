function GoogleDirectionsViewModel(){
  var self = this;
  self.map = null;
  self.errorMessage = ko.observable();
  self.urlBase = "http://maps.google.com/maps?saddr=[START LOCATION]&daddr=[END LOCATION]";
  self.url = ko.observable();
  self.directionsHTML = null;
  self.staticUrl = ko.observable().syncWith('staticUrl');
  self.startinglocationlatlng = ko.observable();
  self.endinglocationlatlng = ko.observable();
  self.googleMapBounds = null;
  self.encodedPath = null;
  self.directionsRenderer = new google.maps.DirectionsRenderer();
  self.directionsRenderer2 = new google.maps.DirectionsRenderer();
  self.staticDimensions = function(){
	var width = 0;
	var height = 0;
	width = $(window).width() * .86 / 2;
	width = Math.round(width > 315 ? 315 : width);
	height= 150;

	return width + 'x' + height;
  };

  google.maps.event.addListener(self.directionsRenderer, 'directions_changed', function(){
	self.directionsHTML = document.getElementById('directionsPanel').innerHTML;
  });
  
  self.initializeGoogleMap = function(StartingLocationLatLng, EndingLocationLatLng){
	var dfd = new $.Deferred();
	self.startinglocationlatlng(StartingLocationLatLng);
	self.endinglocationlatlng(EndingLocationLatLng);
	if(self.map === null){
	  var mapOptions = {
		center: StartingLocationLatLng,
		zoom: 13,
		mapTypeId: google.maps.MapTypeId.ROADMAP
	  };
	  var map_canvas = document.getElementById('map_canvas');
	  self.map = new google.maps.Map(map_canvas, mapOptions);
		resizeGoogleMaps();
	}
	//setTimeout(function(){ dfd.resolve();}, 100);
	dfd.resolve();
	return dfd.promise();;
  };

  self.getDirections = function(StartingLocationLatLng, EndingLocationLatLng){
	var dfd = new $.Deferred();	
	var startSame = false;
	var endSame = false;
	if(StartingLocationLatLng.lat && self.startinglocationlatlng.lng
		&& StartingLocationLatLng.lat() == self.startinglocationlatlng().lat()
		&& StartingLocationLatLng.lng() == self.startinglocationlatlng().lng()){
		startSame == true;
	} else if(!StartingLocationLatLng.lat && !self.startinglocationlatlng.lng
		&& StartingLocationLatLng == self.startinglocationlatlng){
		startSame = true;
	}
	if(EndingLocationLatLng.lat && self.endinglocationlatlng.lng
		&& EndingLocationLatLng.lat() == self.endinglocationlatlng().lat()
		&& EndingLocationLatLng.lng() == self.endinglocationlatlng().lng()){
		endSame == true;
	} else if(!EndingLocationLatLng.lat && !self.endinglocationlatlng.lng
		&& EndingLocationLatLng == self.endinglocationlatlng){
		endSame = true;
	}
	if(startSame && endSame){
		dfd.resolve();
		return;
	}
	$.when(self.initializeGoogleMap(StartingLocationLatLng, EndingLocationLatLng)).then(function(){
	var showBoundingBox = false;
	self.directionsRenderer.setMap(null);
	self.directionsRenderer.setMap(self.map);
	self.directionsRenderer2.setMap(null);

	var directionsPanel = document.getElementById('directionsPanel');
	$(directionsPanel).empty();
	
	self.directionsRenderer2.setPanel(document.getElementById('mapsDirections'));
	self.directionsRenderer.setPanel(directionsPanel);


	var directionsService = new google.maps.DirectionsService();
	var request = {
	  origin: self.startinglocationlatlng(),
	  destination: self.endinglocationlatlng(),
	  travelMode: google.maps.DirectionsTravelMode.DRIVING,
	  unitSystem: google.maps.DirectionsUnitSystem.IMPERIAL
	};

	var directionsResult = directionsService.route(request, function(response, status) {
	  if (status == google.maps.DirectionsStatus.OK) {
		var ptsArray = response.routes[0].overview_path
		var pts = google.maps.geometry.encoding.encodePath(ptsArray);
		self.encodedPath = pts.replace(/\\/g, "\\\\");
		self.directionsRenderer.setDirections(response);
		self.directionsRenderer2.setDirections(response);
		self.staticUrl("https://maps.googleapis.com/maps/api/staticmap?markers=color:red%7clabel:A%7c"+response.routes[0].legs[0].start_location.lat()+','+response.routes[0].legs[0].start_location.lng()
							+"&markers=color:red%7clabel:B%7c"+response.routes[0].legs[0].end_location.lat()+','+response.routes[0].legs[0].end_location.lng()
							+"&sensor=false&size="+self.staticDimensions()+"&scale=2"
							+"&path=enc:"+pts
							+"&key=AIzaSyB_srKE0wfKrqIWtuzewVKnuJKnnC3mMSQ");
		self.googleMapBounds = response.routes[0].bounds;

		if(showBoundingBox === true && self.googleMapBounds){
		  var ne = self.googleMapBounds.getNorthEast();
		  var sw = self.googleMapBounds.getSouthWest();

		  var boundingBoxPoints = [
			ne, new google.maps.LatLng(ne.lat(), sw.lng()),
			sw, new google.maps.LatLng(sw.lat(), ne.lng()), ne
		  ];

		  var boundingBox = new google.maps.Polyline({
			path: boundingBoxPoints,
			strokeColor: '#5aa210',
			strokeOpacity: 1.0,
			strokeWeight: 2
		  });

		  boundingBox.setMap(self.map);
		}
		self.errorMessage("");
		//resizeGoogleMaps();
		dfd.resolve();
	  } else {
		self.errorMessage("Error: " + status);
		dfd.reject();
	  }
	});
	}).fail(function(){dfd.reject();});
	return dfd.promise();
  };
}



function GoogleMapsViewModel(){
	var self= this;
	self.isTracking = false;
	self.start_location = ko.observable().syncWith('newLocationfrom');
	self.end_location = ko.observable().syncWith('newLocationto');
	self.searchStart_visible = ko.observable().syncWith('searchVisiblefrom');
	self.searchEnd_visible = ko.observable().syncWith('searchVisibleto');
	self.lastAddress = '';
	self.resultsList = ko.observableArray();
	self.autocompleteService = new google.maps.places.AutocompleteService();
	self.currentSelectedResult = ko.observable(0);
	self.increaseCurrentResult = function(){
		self.currentSelectedResult(self.currentSelectedResult()+1);
		if(self.currentSelectedResult()>=self.resultsList().length)
			self.currentSelectedResult(self.resultsList().length-1);
	}
	self.decreaseCurrentResult = function(){
		self.currentSelectedResult(self.currentSelectedResult()-1);
		if(self.currentSelectedResult()<0)
			self.currentSelectedResult(0);
	}
	self.results_visible = ko.observable(false);
	  self.refreshList = function(){
	      var funcwithdelay = $.delayInvoke(function (event) {
	          try{
	              $('#suggestGoogle').listview('refresh');
	          } catch (ex) { }
		}, 0);
		funcwithdelay();
	  };
	  self.results_visible.subscribe(function(newValue){
		self.refreshList();
	  });
	  self.listHTML = ko.computed(function(){
		//self.results_visible(false);
		var html = '';
		if(!self.results_visible()) return html;
		for(var j=0;j<self.resultsList().length;j++){
		    if (j == 0) html += '<li data-role="list-divider" class="ui-li ui-li-divider ui-bar-b"><div class="resultsList">Address Results</div><div class="googlePowered"><img src="images/powered-by-google/desktop/powered-by-google-on-non-white.png"/></div><div class="clear"></div></li>';
		    /*if ($('html').hasClass('lte8')) {
		        html += '<li onmousedown="mainVM.fromVM.googleVM.changeSavedValue(\'' + j + '\')"' +
                       ' class="' + (j == self.currentSelectedResult() ? 'ui-btn-hover-a ui-btn ui-btn-up-a ui-btn-icon-right ui-li-has-arrow ui-li' : 'ui-btn ui-btn-up-a ui-btn-icon-right ui-li-has-arrow ui-li')
                       + '"><div class="ui-btn-inner ui-li"><div class="ui-btn-text"><a class="ui-link-inherit" href=\'#\'>' +
               self.resultsList()[j].description + '</a></div></div></li>';
		    } else {*/
		        html += '<li onmousedown="mainVM.fromVM.googleVM.changeSavedValue(\'' + j + '\')"' +
                        '>'+
						'<a href=\'#\' class=\'ui-btn '+(j == self.currentSelectedResult() ? 'listItemHover' : '')+  '\'>' +
                self.resultsList()[j].description + '</a></li>';
		    //}
		}
		self.refreshList();
		return html;
	  });

	self.updateAutocomplete = function(newString){
		if(newString!='' && newString!=null) self.results_visible(true);
		self.currentSelectedResult(0);
		self.autocompleteService.getPlacePredictions({input:newString, radius:30000, location:mainVM.clientVM.mainLatLng},
			function(resultList, status){
				self.resultsList.removeAll();
				if(status == google.maps.places.PlacesServiceStatus.OK){
					for(var i=0;i<resultList.length;i++){
						self.resultsList.push(resultList[i]);
					}
				}
			});
	}
	
	self.changeSavedValue = function(code){
		var place = self.resultsList()[code];
		var service = new google.maps.places.PlacesService(document.getElementById('hiddenfield'));
		service.getDetails(place, function(result, status){
			if(status == google.maps.places.PlacesServiceStatus.OK){
				// set starting location
				var data = new Array();
				data['1'] = result.formatted_address;
				var dvm = new DestinationViewModel(data);
				dvm.isGoogle = true;
				dvm.name(data['1']);
					  var name = "";
					  var vicinity;
					  for(var i=0;i<result.address_components.length;i++){
						if(result.address_components[i].types[0] == "street_number"){
							name+=result.address_components[i].short_name + " ";
						}
						if(result.address_components[i].types[0] == "route"){
							name+=result.address_components[i].short_name;
						}
						if (result.address_components[i].types[0] == "locality"
							|| result.address_components[i].types[0] == "administrative_area_level_3") {
							vicinity=result.address_components[i].short_name;
						}
					  }
					  dvm.DisplayName((name ? name : '') + (name && vicinity && vicinity != name ? ', ' : '') + (vicinity && vicinity != name ? vicinity : ''));
				dvm.QuickLink(result.geometry.location);
				mainVM.fromVM.googleVM.start_location(dvm);
				mainVM.fromVM.googleVM.searchStart_visible(false);
				mainVM.fromVM.campus_visible(false);
				mainVM.storageObject['fromSearchType'] = 'google';
				mainVM.storageObject['StartDestinationName'] =  mainVM.start_location().name();
				var lastAddress = result.formatted_address;
				mainVM.fromVM.googleVM.lastAddress = lastAddress;
				PushNewState('address='+encodeURIComponent(lastAddress.replace('#','%23')));
			}
		});
	}
	self.loadGL = function () {
		try {
			if (typeof navigator.geolocation === 'undefined') {
				gl = google.gears.factory.create('beta.geolocation');
			} else {
				gl = navigator.geolocation;
			}
		} catch (e) { }
		return (typeof gl != "undefined" && gl);
	}

	self.useMyLocation = function(){
		if (self.loadGL()) {
		  if(!self.isTracking && (!self.start_location() || !self.start_location().timestamp || (new Date() - self.start_location().timestamp > 100000))){
			self.isTracking = true;
			$.mobile.loading('show');
			gl.getCurrentPosition(self.displayPosition, self.displayError, {
					enableHighAccuracy: true
				});
			 mainVM.storageObject['fromSearchType'] = 'google';
		  }
		} else {
		  alert("Geolocation services are not supported by your web browser.");
		}
	}

	self.displayPosition = function(position) {
		$.mobile.loading('hide');
		var data = new Array();
		var dvm = new DestinationViewModel(data);
		dvm.name("My Location");
		dvm.DisplayName("My Location");
		dvm.QuickLink(new google.maps.LatLng(position.coords.latitude,position.coords.longitude));
		dvm.isGoogle = true;
		self.start_location(dvm);
		self.searchStart_visible(false);
		mainVM.fromVM.campus_visible(false);
			  mainVM.fromVM.onoff('off');
		mainVM.storageObject['StartDestinationName'] =  self.start_location().name();
		PushNewState('address='+"My Location");
		self.isTracking = false;
	}
	self.displayError = function(positionError) {
		$.mobile.loading('hide');
		alert("Could not get your location: error " + positionError.code);
		self.isTracking = false;
	}

	self.displayDestination = function(position) {
		var data = new Array();
		var dvm = new DestinationViewModel(data);
		dvm.name("My Location");
		dvm.DisplayName("My Location");
		dvm.QuickLink(new google.maps.LatLng(position.coords.latitude,position.coords.longitude));
		dvm.isGoogle = true;
		self.end_location(dvm);
		self.searchEnd_visible(false);
		PushNewState('addressto='+"My Location");
		self.isTracking = false;
	}
	
	self.lastDestination = "";
	self.gettingDestination = false;
  self.GetDestinationLocation = function(address){
	var deferred = $.Deferred();
	if(self.gettingDestination)
	{
	  deferred.resolve();
	  return deferred.promise();
	}
	if(address && address !='undef' && (self.lastDestination.toLowerCase() != address.toLowerCase() || !self.end_location())){
	  if(address.toLowerCase() == 'my location'){
	   if (self.loadGL()) {
			if(!self.isTracking && (!self.end_location() || !self.end_location().timestamp || (new Date() - self.end_location().timestamp > 100000))){
				self.isTracking = true;
			  gl.getCurrentPosition(function(position){
				self.displayDestination(position);
				self.lastDestination = address;
				self.gettingDestination = false;
				deferred.resolve();
			  }, function(position){
				self.displayError(position);
				self.gettingDestination = false;
				deferred.reject();
			  },{timeout:50000});
		  }
		} else {
		  alert("Geolocation services are not supported by your web browser.");
		}
	  } else {

		geocoder = new google.maps.Geocoder();
		if(geocoder)
		  {
			geocoder.geocode({ 'address': address}, function(results){
			  var data = new Array();
				self.lastDestination = address;
			  var dvm = new DestinationViewModel(data);
			  dvm.name(results[0].formatted_address);
			  var name = "";
			  var vicinity;
			  for(var i=0;i<results[0].address_components.length;i++){
				if(results[0].address_components[i].types[0] == "street_number"){
					name+=results[0].address_components[i].short_name + " ";
				}
				if(results[0].address_components[i].types[0] == "route"){
					name+=results[0].address_components[i].short_name;
				}
				if (results[0].address_components[i].types[0] == "locality"
					|| results[0].address_components[i].types[0] == "administrative_area_level_3") {
					vicinity=results[0].address_components[i].short_name;
				}
			  }
			  dvm.DisplayName((name ? name : '') + (name && vicinity && vicinity != name ? ', ' : '') + (vicinity && vicinity != name ? vicinity : ''));
			  dvm.QuickLink(results[0].geometry.location);
			  dvm.isGoogle = true;
			  self.end_location(dvm);
				self.gettingDestination = false;
		self.searchEnd_visible(false);
			  deferred.resolve();
			}, function(position){
				alert("error");
				self.gettingDestination = false;
				deferred.reject();
			  });
		  }
	  }
	}else if(!address && address !='undef' && !getParameterByName(url, 'to')){
		mainVM.fromVM.campus_visible(true);
		self.searchEnd_visible(true);
		mainVM.fromVM.searchVM.saved_name('');
		$("#searchFieldGoogle").val('');
		$("#searchFieldGoogleIE8").val('');
		mainVM.fromVM.onoff('');
		mainVM.storageObject['StartDestinationName'] = '';
		//self.start_location(new DestinationViewModel([]));
		self.gettingDestination = false;
		deferred.resolve();
	} else if(address !='undef' && self.end_location() && self.end_location().name){
		self.searchEnd_visible(false);
		mainVM.storageObject['StartDestinationName'] =  (typeof(self.end_location().name) == "function" ? self.end_location().name() : self.end_location().name);
		self.gettingDestination = false;
		deferred.resolve();
	} else if(address=='undef' && !getParameterByName(url, 'to')){
		self.searchEnd_visible(true);
		self.end_location({name:''});
		mainVM.fromVM.searchVM.saved_name('');
		$("#searchFieldGoogle").val('');
		$("#searchFieldGoogleIE8").val('');
		mainVM.fromVM.onoff('off');
		mainVM.storageObject['StartDestinationName'] = '';
		self.gettingDestination = false;
		deferred.resolve();
	} else {
		self.gettingDestination = false;
		deferred.resolve();
	}
	return deferred.promise();
  }
  
    self.GetLocationViaUrl = function(url){
	var deferred = $.Deferred();
	if(self.gettingAddress)
	{
	  deferred.resolve();
	  return deferred.promise();
	}
	self.gettingAddress = true;
	var address = getParameterByName(url, 'address');
	var from = getParameterByName(url, 'from');
	if (address == '' && from == 'my location') {
	    address = from;
	}
	if(address && address !='undef' && (self.lastAddress.toLowerCase() != address.toLowerCase() || !self.start_location())){
	  if(address.toLowerCase() == 'my location'){
	   if (self.loadGL()) {
			if(!self.isTracking && (!self.start_location() || !self.start_location().timestamp || (new Date() - self.start_location().timestamp > 100000))){
				self.isTracking = true;
			  gl.getCurrentPosition(function(position){
				self.displayPosition(position);
				self.lastAddress = address;
				if(!mainVM.storageObject['fromSearchType']) mainVM.storageObject['fromSearchType'];
				self.gettingAddress = false;
				deferred.resolve();
			  }, function(position){
				self.displayError(position);
				self.gettingAddress = false;
				deferred.reject();
			  },{timeout:50000});
		  }
		} else {
		  alert("Geolocation services are not supported by your web browser.");
		}
	  } else {

		geocoder = new google.maps.Geocoder();
		if(geocoder)
		  {
			geocoder.geocode({ 'address': address}, function(results){
			  var data = new Array();
			  $("#searchFieldGoogle").val(results[0].formatted_address);
			  $("#searchFieldGoogleIE8").val(results[0].formatted_address);
				self.lastAddress = address;
			  var dvm = new DestinationViewModel(data);
			  dvm.name(results[0].formatted_address);
			  var name = "";
			  var vicinity;
			  for(var i=0;i<results[0].address_components.length;i++){
				if(results[0].address_components[i].types[0] == "street_number"){
					name+=results[0].address_components[i].short_name + " ";
				}
				if(results[0].address_components[i].types[0] == "route"){
					name+=results[0].address_components[i].short_name;
				}
				if (results[0].address_components[i].types[0] == "locality"
					|| results[0].address_components[i].types[0] == "administrative_area_level_3") {
					vicinity=results[0].address_components[i].short_name;
				}
			  }
			  dvm.DisplayName((name ? name : '') + (name && vicinity && vicinity != name ? ', ' : '') + (vicinity && vicinity != name ? vicinity : ''));
			  dvm.QuickLink(results[0].geometry.location);
			  dvm.isGoogle = true;
			  self.start_location(dvm);
			  mainVM.fromVM.campus_visible(false);
			  self.searchStart_visible(false);
			  mainVM.fromVM.onoff('off');
			  if(!mainVM.storageObject['fromSearchType']) mainVM.storageObject['fromSearchType'] = 'prepop';
			  mainVM.storageObject['StartDestinationName'] =  self.start_location().name();
				self.gettingAddress = false;
			  deferred.resolve();
			}, function(position){
				alert("error");
				self.gettingAddress = false;
				deferred.reject();
			  });
		  }
	  }
	}else if(!address && address !='undef' && !getParameterByName(url, 'from')){
		mainVM.fromVM.campus_visible(true);
		self.searchStart_visible(true);
		mainVM.fromVM.searchVM.saved_name('');
		$("#searchFieldGoogle").val('');
		$("#searchFieldGoogleIE8").val('');
		mainVM.fromVM.onoff('');
		mainVM.storageObject['StartDestinationName'] = '';
		self.gettingAddress = false;
		deferred.resolve();
	} else if(address !='undef' && self.start_location() && self.start_location().name){
		self.searchStart_visible(false);
		mainVM.storageObject['StartDestinationName'] =  (typeof(self.start_location().name) == "function" ? self.start_location().name() : self.start_location().name);
		self.gettingAddress = false;
		deferred.resolve();
	} else if(address=='undef' && !getParameterByName(url, 'from')){
		self.searchStart_visible(true);
		self.start_location({name:''});
		mainVM.fromVM.searchVM.saved_name('');
		$("#searchFieldGoogle").val('');
		$("#searchFieldGoogleIE8").val('');
		mainVM.fromVM.onoff('off');
		mainVM.storageObject['StartDestinationName'] = '';
		self.gettingAddress = false;
		deferred.resolve();
	} else {
		self.gettingAddress = false;
		deferred.resolve();
	}
	return deferred.promise();
  }
}

function searchFieldGoogle_keyup(searchFieldGoogle, event) {
	clearAutocomplete = false;
	if (event.keyCode == 13) {
		//var firstPacItem = $("div.pac-container div.pac-item");
		mainVM.fromVM.googleVM.changeSavedValue(mainVM.fromVM.googleVM.currentSelectedResult().toString());
		//mainVM.fromVM.googleVM.lastAddress='';
		//PushNewState('address=' + encodeURIComponent(firstPacItem[0].innerHTML.replace('<b>', '').replace('</b>', '').replace('#', '%23')));
	} else if(event.keyCode ==40)
		mainVM.fromVM.googleVM.increaseCurrentResult();
	else if(event.keyCode == 38)
		mainVM.fromVM.googleVM.decreaseCurrentResult();
	else {
		mainVM.fromVM.googleVM.updateAutocomplete($("#searchFieldGoogle").val());
	}
}