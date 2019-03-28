function PrintableViewModel() {
    var self = this;
    self.staticUrl = ko.observable().syncWith('staticUrl');
    self.onoff = ko.observable().syncWith('onoff');
    self.walkingDivs = ko.observableArray();
    self.svgDivs = ko.observableArray();
    self.printableDivs = ko.observableArray();
    self.printableHTML = ko.computed(function () {
        var retVal = "<div class='coverUp'><table class='walkingSteps'><tbody>";
        for (var i = 0; i < self.printableDivs().length; i++) {
            retVal += "<tr><td>";
            retVal += "<div class='walkingStep " + self.printableDivs()[i].visibilityClass + "'>" + self.printableDivs()[i].divHTML + "</div>";
            retVal += "</td></tr>";
        }
        return retVal + "</tbody></table></div>";
    });
    self.onCampusVisible = ko.computed(function () {
        return self.onoff() == 'on' || self.onoff() == '';
    });
    self.offCampusVisible = ko.computed(function () {
        return self.onoff() == 'off';
    });
    self.fromURL = false;
    self.start_location = ko.observable({ name: '' }).subscribeTo('newLocationfrom');
    self.end_location = ko.observable({ name: '' }).subscribeTo('newLocationto');
    self.drivingMapVisible = ko.observable(true);
    self.drivingDirectionsVisible = ko.observable(true);
    self.walkingMapVisible = ko.observable(true);
    self.walkingDirectionsVisible = ko.observable(true);
    self.isPrintEnabled = ko.computed(function () {
        return (self.drivingMapVisible() ||
			self.drivingDirectionsVisible() ||
			self.walkingMapVisible() ||
			self.walkingDirectionsVisible());
    });
    self.goBack = function () {
        if ((self.start_location().isOffCampus && !self.start_location().isOffCampus()) && (self.end_location().isOffCampus && !self.end_location().isOffCampus())) {
            self.setPrinting(3);
            PushNewState('page=walkingdirections&printing=3');
        } else {
            self.setPrinting(15);
            PushNewState('page=driving&printing=15');
        }
    };
    self.PrintingValue = function () {
        var retVal = 0;
        if (self.drivingMapVisible()) retVal = retVal | 8;
        if (self.drivingDirectionsVisible()) retVal = retVal | 4;
        if (self.walkingMapVisible()) retVal = retVal | 2;
        if (self.walkingDirectionsVisible()) retVal = retVal | 1;
        if ((self.start_location().isOffCampus && !self.start_location().isOffCampus()) && (self.end_location().isOffCampus && !self.end_location().isOffCampus())) {
            retVal = retVal & 3;
        }
        return retVal;
    };
    self.putSVG = function (item, data, callback) {
        $.ajax({
            url: mainVM.ljdirectionsVM.LabelsUrl + '?MapID=' + item.id + getJsonpSuffix(),
            type: "GET",
            dataType: getJsonDataType(),
            contentType: getJsonContentType(),
            success: function (lblData) {
                var labels = GetLabelsAsSVG(lblData);
                var pathText = "";
                var translateText = CustomTransformForLabelTranslate(scale);
                pathText += '<path d="' + item.pathpoints_p + '" fill="none" stroke-width="' + item.BBox[9] + '" stroke="#5aa210"/>';
                //Add Node A
                pathText += '<circle ' + translateText + ' r="' + DEFAULTSIZE / item.BBox[6] + '" cx="' + item.xypoints1[0].toString() + '" cy="' + item.xypoints1[1].toString() + '" fill="#66CC66" stroke="#e9e9e9" stroke-width=".5"/>';
                pathText += '<circle ' + translateText + ' r="' + DEFAULTSIZE / item.BBox[6] + '" cx="' + item.xypoints1[0].toString() + '" cy="' + item.xypoints1[1].toString() + '" fill="#66CC66" stroke="#white" stroke-width="1"/>';
                pathText += '<text ' + translateText + ' x="' + (item.xypoints1[0] - 4).toString() + '" y="' + (parseFloat(item.xypoints1[1]) + 3) + '" font-family="verdana" font-size="' + DEFAULTSIZE / item.BBox[6] + '" fill="white" transform="' + CustomTransformForLabelTranslate(item.BBox[6]) + '">' + mainVM.ljdirectionsVM.alphabet[item.index] + '</text>';
                //Add Node B
                pathText += '<circle ' + translateText + ' r="' + DEFAULTSIZE / item.BBox[6] + '" cx="' + item.xypoints2[0].toString() + '" cy="' + item.xypoints2[1].toString() + '" fill="#CC0033" stroke="#e9e9e9" stroke-width=".5"/>';
                pathText += '<circle ' + translateText + ' r="' + DEFAULTSIZE / item.BBox[6] + '" cx="' + item.xypoints2[0].toString() + '" cy="' + item.xypoints2[1].toString() + '" fill="#CC0033" stroke="#white" stroke-width="1"/>';
                pathText += '<text ' + translateText + ' x="' + (item.xypoints2[0] - 4).toString() + '" y="' + (parseFloat(item.xypoints2[1]) + 3) + '" font-family="verdana" font-size="' + DEFAULTSIZE / item.BBox[6] + '" fill="white" transform="' + CustomTransformForLabelTranslate(item.BBox[6]) + '">' + mainVM.ljdirectionsVM.alphabet[item.index + 1] + '</text>';
                item.mapHTML = '<svg width="784" height="250" class="mapThumbnail"><g transform="translate( ' + (-item.BBox[0]).toString() + ', ' + (-item.BBox[1]).toString() + ')scale(' + item.BBox[6].toString() + ')">' + data + pathText + labels + '</g></svg>';
                item.isRendered = true;
                item.isRendering = false;
                if (callback) callback(item);
            },
            error: function (a, b, c, d, e) {
                var x = 0;
            }
        });
    };

    self.putDegradedSVG = function (item, divID) {
        $('.' + divID + item.index).empty();
        $('.' + divID + item.index).attr("style", "overflow:hidden; max-height:250px;")

        if (item.array.length == 1 && self.walkingDivs().length > 1 && item.index + 1 != self.walkingDivs().length) {
            $('.' + divID + item.index).html("<img src='images/up_down.png' style='border-style:solid;border-width:0px;margin-top:0px; margin-left:0px; margin-right: 0px;'/>");
            return;
        }

        var newBBox = getBoundingBoxForVML(item.BBox, 784, 250);
        $('.' + divID + item.index).html("<div><img src='" + SVGBASELOCATION + item.mapFileName.substring(0, item.mapFileName.length - 3) + "png' width='" + (SVGWIDTH * newBBox[4]) +
                "px' height='" + (SVGHEIGHT * newBBox[4]) + "px' style='position: relative;top: -" + (newBBox[1] * newBBox[4]) + "px; left:-" + (newBBox[0] * newBBox[4]) +
                "px; ' /></div>");

        var paths = $('.' + "PathBox" + divID + item.index);//document.getElementsByName("PathBox" + divID + item.index);
        $('.' + "PathBox" + divID + item.index).empty();
        for (var i = 0; i < paths.length; i++) {
            var guid = Math.random();
            paths[i].id = "Path" + guid;
            var paper = Raphael("Path" + guid, 784, 250);

            //Add Path
            paper.path(item.pathpoints_p).attr("fill", "none").attr("stroke-width", newBBox[5]).attr("stroke", "#009eff").attr("z-index", "10");
            //Add Node A
            paper.circle(item.xypoints1[0], item.xypoints1[1], newBBox[6]).attr("fill", "#66CC66").attr("stroke", "#e9e9e9").attr("stroke-width", ".5").attr("z-index", "10");
            paper.circle(item.xypoints1[0], item.xypoints1[1], newBBox[7]).attr("fill", "#66CC66").attr("stroke", "#white").attr("stroke-width", "1").attr("z-index", "10");
            paper.text((item.xypoints1[0]), (item.xypoints1[1]), mainVM.ljdirectionsVM.alphabet[item.index]).attr("font-family", 'verdana').attr("font-size", newBBox[6]).attr("fill", "white").attr("z-index", "10");
            //Add Node B
            paper.circle(item.xypoints2[0], item.xypoints2[1], newBBox[6]).attr("fill", "#CC0033").attr("stroke", "#e9e9e9").attr("stroke-width", ".5").attr("z-index", "10");
            paper.circle(item.xypoints2[0], item.xypoints2[1], newBBox[7]).attr("fill", "#CC0033").attr("stroke", "#white").attr("stroke-width", "1").attr("z-index", "10");
            paper.text((item.xypoints2[0]), (item.xypoints2[1]), mainVM.ljdirectionsVM.alphabet[item.index + 1]).attr("font-family", 'verdana').attr("font-size", newBBox[6]).attr("fill", "white").attr("z-index", "10");

            paper.setViewBox(newBBox[0], newBBox[1], newBBox[2], newBBox[3], false);
        }
    };
    self.renderSVG = function (item, backupDivID, callback) {
        item.isRendering = true;
        if (item.array.length == 1 && self.walkingDivs().length > 1 && item.index + 1 != self.walkingDivs().length) {
            item.mapHTML = "<img src='images/up_down.png'/>";
            if (callback) callback(item);
            return;
        }

        if (supportsCORS()) {
            $.ajax({
                url: SVGBASELOCATION + item.mapFileName,
                type: "GET",
                dataType: 'text',
                success: function (data) {
                    self.putSVG(item, data.responseText || data, callback);
                },
                error: function (request, status, error) {
                    $.ajax({
                        url: mainVM.ljdirectionsVM.MapUrl + "?FileURL=" + encodeURIComponent(SVGBASELOCATION + item.mapFileName) + getJsonpSuffix(),
                        type: "GET",
                        dataType: getJsonDataType(),
                        contentType: getJsonContentType(),
                        success: function (data) {
                            self.putSVG(item, data.responseText || data, callback);
                        },
                        error: function (a, d, b) {
                            var x = 0;
                        }
                    });
                }
            });
        } else {
            self.putDegradedSVG(item, backupDivID);
        }
    };
    self.getTrueSVG = function (array, item) {
        if (array && item) {
            if (SUPPORTS_SVG) {
                if (item.isMap && !item.isRendered && !item.isRendering) {
                    self.renderSVG(item, 'map', function (item) {
                        $('.map' + item.index).html(item.mapHTML);
                    });
                } else if (item.isRendered && item.mapHTML && !item.isRendering) {
                    $('.map' + item.index).html(item.mapHTML);
                }
            } else {
                if (item.isMap)
                    self.putDegradedSVG(item, 'map');
            }
        }
    };

    self.renderAllMaps = function () {
        for (var i = 0; i < self.printableDivs().length; i++) {
            var funcwithdelay = $.delayInvoke(function (j) {
                self.getTrueSVG(self.printableDivs(), self.printableDivs()[j]);
            }, 1000);
            funcwithdelay(i);
        }
    };
    self.walkingDivs.subscribe(function () {
        self.updateWalkingDivs();
    });
    self.svgDivs.subscribe(function () {
        self.updateWalkingDivs();
    });
    self.updateWalkingDivs = function () {
        if (self.svgDivs().length == self.walkingDivs().length) {
            self.printableDivs.removeAll();
            for (var i = 0; i < self.walkingDivs().length; i++) {
                var htmlItem = { divHTML: "" };
                htmlItem.isMap = false;
                var walkingMap, walkingDirections = null;
                if (self.svgDivs()[i] && self.walkingDivs()[i]) {
                    if (self.walkingMapVisible()) {

                        walkingMap = self.svgDivs()[i].divHTML();

                        htmlItem.isMap = true;
                        htmlItem.id = self.svgDivs()[i].id;
                        htmlItem.index = self.svgDivs()[i].index;
                        htmlItem.title = self.svgDivs()[i].title;
                        htmlItem.mapFileName = self.svgDivs()[i].mapFileName;
                        htmlItem.isRendered = self.svgDivs()[i].isRendered;
                        htmlItem.isRendering = self.svgDivs()[i].isRendering;
                        htmlItem.BBox = self.svgDivs()[i].BBox;
                        htmlItem.array = self.svgDivs()[i].array;
                        htmlItem.xypoints1 = self.svgDivs()[i].xypoints1;
                        htmlItem.xypoints2 = self.svgDivs()[i].xypoints2;
                        htmlItem.points = self.svgDivs()[i].points;
                        htmlItem.x0 = self.svgDivs()[i].x0;
                        htmlItem.y0 = self.svgDivs()[i].y0;
                        htmlItem.pathpoints_p = self.svgDivs()[i].pathpoints_p;
                        htmlItem.mapHTML = self.svgDivs()[i].mapHTML;
                    }
                    if (self.walkingDirectionsVisible()) {
                        walkingDirections = self.walkingDivs()[i].divHTML;
                    }
                }
                walkingDirections = (!walkingDirections) ? "" : walkingDirections;
                walkingMap = (!walkingMap) ? "" : walkingMap;

                // htmlItem.divHTML +=   walkingDirections.replace('</h4><ul','</h4>'+walkingMap+'<ul');
                htmlItem.divHTML += walkingDirections+ walkingMap;

                htmlItem.visibilityClass = (self.walkingMapVisible() ? (self.walkingDirectionsVisible() ? 'bothVisible' : 'onlyMaps') : (self.walkingDirectionsVisible() ? 'onlyDirections' : 'neitherVisible'));
                self.printableDivs.push(htmlItem);
            }
        }
    }

    self.setPrinting = function (value) {
        self.fromURL = true;
        self.drivingMapVisible(value & 8);
        self.drivingDirectionsVisible(value & 4);
        self.walkingMapVisible(value & 2);
        self.walkingDirectionsVisible(value & 1);
        self.fromURL = false;

        ko.utils.arrayForEach(self.printableDivs(), function (htmlItem) {
            htmlItem.visibilityClass = (self.walkingMapVisible() ? (self.walkingDirectionsVisible() ? 'bothVisible' : 'onlyMaps') : (self.walkingDirectionsVisible() ? 'onlyDirections' : 'neitherVisible'));
        });
        var list = $('.walkingStep');

        if (list.length > 0) {
            if (!self.walkingMapVisible()) {
                $('.walkingStep .mappingParentDiv').hide();
            }
            else {
                $('.walkingStep .mappingParentDiv').show();
            }

            if (!self.walkingDirectionsVisible()) {
                $('.walkingStep .directions').hide();
            }
            else {
                $('.walkingStep .directions').show();
            }
        }
    };
}
