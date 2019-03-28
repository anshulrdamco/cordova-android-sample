function LookupItemViewModel(type){
	var self = this;
	self.lookupItemType = type;
	self.data_id = 1;
	self.ID = 0;
	self.mainHeaderText = ko.observable();
	self.headerText = ko.observable("Select an Option.");
	self.subItems = ko.observableArray();
	//Object.defineProperty(self, 'selectedSubItem', {value:ko.observable().syncWith('selectedItem')});
	self.hasSubItems = ko.computed(function(){
		return self.subItems().length >0;
	});
}

function FindParent(parentID, livm){
	if(livm.ID == parentID) return livm;
	for(var k=0;k<livm.subItems().length;k++){
		var retVal = FindParent(parentID, livm.subItems()[k]);
		if(retVal!=null) return retVal;
	}
	return null;
} 

function FilterStopPropogation(filter,event) {
	if(event.keyCode == 13)  {
		event.cancelBubble = true; 
		try {event.stopPropagation();} catch (ex) {}
		filter.blur(); 
		return false; 
	}
}