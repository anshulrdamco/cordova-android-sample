function LocationViewModel(location){
	var self = this;
	self.GetParkingUrl = RESTSERVICESBASE + "api/parking";
	self.lookupReference = location;
	self.onoff = ko.observable('').syncWith('onoff');
	self.parkingTypes = ko.observableArray([]).extend({pauseable: true});
	self.selectedParking = null;
	self.lastQL = '';
	self.selectedParkingID = ko.observable().extend({pauseable: true});
	//self.selectedParkingID2 = ko.observable().extend({pauseable: true});
  self.campus_visible = ko.observable(true).syncWith('campusVisible');
	self.onCampusVisible = ko.computed(function(){
		return self.onoff() == 'on' || self.onoff() == '';
	});
	self.offCampusVisible = ko.computed(function(){
		return self.onoff() == 'off';
	});
	self.isSearchDisabled = ko.computed(function(){
		return self.onoff() == '';
	});

	self.lookUpVisible = ko.computed(function() {
		return self.onCampusVisible();
	}, this);
	 
	 self.parkingHTML = ko.computed(function(){
		var html = "";
		for (var i = 0;i<self.parkingTypes().length;i++){
			var data = self.parkingTypes()[i];
			html+= "<li>";
			html+= "<input class='radios' type='radio' data-icon='lj-arrow'  name='parkingRadio' id='" + data.ID + "radio' value='" + data.ID + "' onclick='if(this.checked) {mainVM.toVM.selectedParkingID(this.value);}'  />"
			html+= "<label for='" + data.ID + "radio'>" + data.ParkingType + "</label>";
			html+= "</li>";
		}
		return html;
	 });
	 
	 self.errorText = ko.observable("Please make a selection.");
	 
	self.searchVM = new autoCompleteViewModel(location);
	self.googleVM = new GoogleMapsViewModel();
	/*self.selectedParkingID2.subscribe(function(newValue){
		if(newValue != 0 && (!self.selectedParkingID() || self.selectedParkingID()!=newValue)){
			self.selectedParkingID(newValue);
		}
	});*/
	self.selectedParkingID.subscribe(function(newValue){
		if(!self.selectedParking || self.selectedParking.ID!=newValue){
			for(i=0;i<self.parkingTypes().length;i++){
				if(newValue == self.parkingTypes()[i].ID){
					self.selectedParking = self.parkingTypes()[i];
					break;
				}
			}
		}
		//if(newValue > 0 && $("#continueBtn").hasClass('ui-disabled')) $("#continueBtn").removeClass('ui-disabled');
		//else if(newValue <= 0 && !$("#continueBtn").hasClass('ui-disabled')) $("#continueBtn").addClass('ui-disabled');
	});
	
	self.ForceParking = function(){
		if(!self.selectedParking && self.parkingTypes().length>0) self.selectedParking = self.parkingTypes()[0];
	}
	
	self.GetSelectedParking = function(clientID, parkingID, Destination){
		var dfd = new $.Deferred();
		if(self.parkingTypes().length>0){
			for(var i=0;i<self.parkingTypes().length;i++){
				if(self.parkingTypes()[i].ID == parkingID && !Destination.isOffCampus()){
					self.selectedParking = self.parkingTypes()[i];
					break;
				}
				if(self.parkingTypes()[i].LotID == "Lot" + parkingID && Destination.isOffCampus()){
					self.selectedParking = self.parkingTypes()[i];
					break;
				}
			}
			dfd.resolve();
		} else {
			$.when(self.PopulateParking(clientID, (Destination.isOffCampus() ? "ALL" : Destination.QuickLink()))).then(function(){
			for(var i=0;i<self.parkingTypes().length;i++){
				if(self.parkingTypes()[i].ID == parkingID && !Destination.isOffCampus()){
					self.selectedParking = self.parkingTypes()[i];
					break;
				}
				if(self.parkingTypes()[i].LotID == "Lot" + parkingID && Destination.isOffCampus()){
					 self.selectedParking = self.parkingTypes()[i];
					break;
				}
			}
				dfd.resolve();
			}).fail(function(){
				dfd.reject();
			});
		}
		return dfd.promise();
	}
	//self.redraw = function(event, item){
	//	$('#'+item.ID.toString()+'radio').checkboxradio();
	//	$('#'+item.ID.toString()+'radio').checkboxradio('refresh');
	//}
	self.PopulateParking = function(ClientID, QL){
		if(QL != self.lastQL){
			var deferred = $.Deferred();
			$.support.cors = true;
			var url = self.GetParkingUrl + '?ClientID=' + ClientID + (QL == 'ALL' ? '' : ('&QuickLink=' + QL));
			$.ajax({
			    url: url + getJsonpSuffix(),
			    type: "GET",
			    dataType: getJsonDataType(),
			    contentType: getJsonContentType(),
			    success: function (jsonObject) {
			        //self.selectedParkingID2.pause();
			        self.selectedParkingID.pause();
			        self.parkingTypes.pause();
			        var store = self.selectedParking && self.selectedParking.ID ? self.selectedParking.ID : 0;
			        //self.parkingTypes.removeAll();
			        if (Array.isArray(jsonObject)) {
			            for (var i = 0; i < jsonObject.length; i++) {
			                var found = false;
			                for (var j = 0; j < self.parkingTypes().length; j++) {
			                    if (jsonObject[i].LotID == self.parkingTypes()[j].LotID) {
			                        found = true;
			                        self.parkingTypes()[j].Latitude = jsonObject[i].Latitude;
			                        self.parkingTypes()[j].Longitude = jsonObject[i].Longitude;
			                        self.parkingTypes()[j].LotName = jsonObject[i].LotName;
			                        self.parkingTypes()[j].ParkingType = jsonObject[i].ParkingType;
			                        self.parkingTypes()[j].ID = jsonObject[i].ID;
			                    }
			                }
			                if (!found) {
			                    jsonObject[i].LotIDNumber = jsonObject[i].LotID.substring(3);
			                    self.parkingTypes.push(jsonObject[i]);
			                }
			            }
			            for (var j = self.parkingTypes().length - 1; j >= 0; j--) {
			                var found = false;
			                var id = self.parkingTypes()[j].ID;
			                for (var i = 0; i < jsonObject.length; i++) {
			                    if (jsonObject[i].ID == id) {
			                        found = true;
			                    }
			                }
			                if (!found) {
			                    self.parkingTypes.splice(j, 1);
			                }
			            }
			        }
			        self.parkingTypes.sort(function (left, right) {
			            return left.ID == right.ID ? 0 : (left.ID < right.ID ? -1 : 1)
			        });
			        //self.selectedParkingID2(store);
			        self.selectedParkingID(store);
			        //self.selectedParkingID2.resume();
			        if (self.parkingTypes().length == 1) self.selectedParkingID(self.parkingTypes()[0].ID);
			        self.selectedParkingID.resume();
			        self.parkingTypes.resume();
			        //if(self.parkingTypes().length>0 && !self.selectedParking()) self.selectedParking(self.parkingTypes()[0]);
			        self.lastQL = QL;
			        deferred.resolve();
			        $("ul.parkingTypes input").checkboxradio();
			        $("ul.parkingTypes input").checkboxradio('refresh');
			    },
			    error: function (jqXHR, textStatus, errorThrown) {
			        self.parkingTypes.removeAll();
			        deferred.reject();
			        throw 'getJSON failed: ' + errorThrown + ' ' + self.GetSearchUrl + '?ClientID=' + self.clientID() + '&SearchString=' + searchString.substring(0, 3) + getJsonpSuffix();
			    }
			});
				
			return deferred.promise();
		}
	};
	self.onoff.subscribe(function(newValue){
		if(newValue) self.campus_visible(false);
		if(newValue == 'on' && !getParameterByName(window.location.href, 'from')){
			PushNewState("from=undef");
			mainVM.printableVM.drivingMapVisible(false);
			mainVM.printableVM.drivingDirectionsVisible(false);
		}
		else if(newValue == 'off' && !getParameterByName(window.location.href, 'address')){
			PushNewState("address=undef");
		}
			
	});
	
	self.lookupClick = function(){
		ResetLookup(self.lookupReference);
		PushNewState('page=lookup');
	};
	
	self.setParkingViaURL = function(url){
		var deferred = $.Deferred();

		var parkingID = getParameterByName(url, 'parking');
		if(parkingID){
			self.selectedParkingID(parkingID);
			deferred.resolve();		
		}else{
			deferred.resolve();
		}
		return deferred.promise();
	};
}
