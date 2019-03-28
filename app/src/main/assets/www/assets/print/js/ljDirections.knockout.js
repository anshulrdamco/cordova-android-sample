function LJDirectionsViewModel() {
    var self = this;
    self.PathAndDirectionsUrl = RESTSERVICESBASE + "api/directions/";
    self.LabelsUrl = RESTSERVICESBASE + "api/label/";
    self.MapUrl = RESTSERVICESBASE + "api/map/";
    self.filesObject = null;
    self.svg = null;
    //self.svghtml = ko.observable('');
    self.directionsHTML = ko.observable('<div class="loadingDiv"></div>');
    self.Note = ko.observable('');
    self.ShortNote = ko.observable('');
    self.directionsParams = '';
    self.mapParams = '';
    self.alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    self.currentStepNumber = 0;
    self.currentStepName = ko.observable('First Floor');
    self.currentStepText = ko.observable('Step 0 of 0');
    self.currentFileObject = null;
    self.path = null;
    self.object = null;
    self.stepCount = 0;
    self.UpdateStepInfo = function (stepNumber) {
        self.stepCount = 0;
        for (k in self.filesObject) if (self.filesObject.hasOwnProperty(k)) self.stepCount++;
        var propName = 'f' + stepNumber.toString()
        if (self.filesObject && self.filesObject.hasOwnProperty(propName)) {
            self.currentFileObject = self.filesObject[propName];
            self.currentStepNumber = stepNumber;
            self.currentStepText('Step ' + self.currentStepNumber.toString() + ' of ' + self.stepCount.toString());
            self.currentStepName(self.filesObject[propName].title);
            var funcwithdelay = $.delayInvoke(function (event) {
                self.RedrawSVG(self.filesObject[propName]);
                //if(mainVM.toVM.searchVM.saved_value() != null) mainVM.toVM.searchVM.search_visible(false);
            }, 50);
            funcwithdelay();
        }
        if ($("#previousButton").hasClass('ui-disabled')) $("#previousButton").removeClass('ui-disabled');
        if ($("#nextButton").hasClass('ui-disabled')) $("#nextButton").removeClass('ui-disabled');
        if (self.currentStepNumber - 1 <= 0) {
            //disable previous
            if (!$("#previousButton").hasClass('ui-disabled')) $("#previousButton").addClass('ui-disabled');
        }
        if (self.filesObject && !self.filesObject.hasOwnProperty('f' + (self.currentStepNumber + 1).toString())) {
            //disableN next
            if (!$("#nextButton").hasClass('ui-disabled')) $("#nextButton").addClass('ui-disabled');
        }
    }
    self.goNext = function () {
        self.UpdateStepInfo(self.currentStepNumber + 1);
    }
    self.goPrevious = function () {
        self.UpdateStepInfo(self.currentStepNumber - 1);
    }
    self.resetPage = function () {
        $("#SVGBox").empty();
        self.directionsHTML('<div class="loadingDiv"></div>');
        self.currentStepName('First Floor');
        self.currentStepText('Step 0 of 0');
        self.currentStepNumber = 0;
        self.filesObject = null;
        self.svg = null;
    }

    self.putSVG = function (data, BBox, floorid) {
        var importedNode;
        var xml = null;
        /*var widthSubString = data.substring(data.indexOf('width="'));
		var heightSubString = data.substring(data.indexOf('height="'));
		SVGWIDTH = parseInt(widthSubString.substring(7, widthSubString.indexOf('px"')));
		SVGHEIGHT = parseInt(heightSubString.substring(8, heightSubString.indexOf('px"')));*/
        try {
            xml = $.parseXML(data);
        }
        catch (e) {
            if (e.message.indexOf("Invalid XML") == 0) {
                var resp = confirm("You need to add SVG support to your browser to see maps; would you like to download it?");
                if (resp) {
                    window.location.href = "https://www.adobe.com/devnet/svg/adobe-svg-viewer-download-area.html";
                }
            } else {
                throw e;
            }
        }
        if (xml && xml.documentElement) {
            importedNode = document.importNode(xml.documentElement, true);
        } else if (xml) {
            importedNode = importNode(xml.documentElement, true);
        }
        if (importedNode) {
            self.svg.node().appendChild(importedNode);
        }
        //Add Rectangle to trace
        //self.svg.append("rect").attr("x", BBox[2]).attr("y", BBox[3])
        //               .attr("width", BBox[4])
        //               .attr("height", BBox[5]).attr("stroke-width", "2").attr("stroke", "#ff0000").attr("fill", "none");
        //Add Path
        self.drawPath(BBox);
        $.ajax({
            url: self.LabelsUrl + '?MapID=' + self.currentFileObject.floorid + getJsonpSuffix(),
            type: "GET",
            dataType: getJsonDataType(),
            contentType: getJsonContentType(),
            success: function (data) {
                AddLabelsToSVG(self.svg, data);
            },
            error: function (a, b, c) {
                var x = 0;
            }
        });
        //path.append('animateMotion').attr('repeatCount',"indefinite").attr('dur',"19s").attr('path',pathpoints_p);
        //document.getElementById('animationelement').beginElement();
        //var funcwithdelay = $.delayInvoke(function (event) {
        self.svg.attr("transform", "translate( " + (-BBox[0]) + "," + (-BBox[1]) + ")scale(" + CURRENT_ZOOM + ")");
        RESET = [-(BBox[0]), -(BBox[1])];
        RESET_SCALE = CURRENT_ZOOM;
        zm.translate([-(BBox[0]), -(BBox[1])]).scale(CURRENT_ZOOM);
        DrawControls();
        //}, 0);
        //funcwithdelay();
    };
    self.dfd = null;
    /*self.loadDeferred = function () {
		self.dfd = $.Deferred();
		var img = document.getElementById('pngImage');
		img.addEventListener('load', self.pngloaded);
		return self.dfd;
	}
	self.pngloaded = function () {
		var img = document.getElementById('pngImage');
		img.removeEventListener('load', self.pngloaded);
		SVGHEIGHT = img.height;
		SVGWIDTH = img.width;
		self.dfd.resolve();
	};*/
    self.putDegradedSVG = function (url, BBox) {
        $('#SVGBox').empty();
        var newBBox = getBoundingBoxForVML(BBox);
        //$('#overflowdiv').html("<img id='pngImage' src='" + SVGBASELOCATION + url.substring(0, url.length - 3) + "png' style='position: relative;top: -" + (newBBox[1] * newBBox[4]) + "px; left:-" + (newBBox[0] * newBBox[4]) + "px; z-index:50; ' /><div id='PathBox' style='position:relative; z-index:100; top: -" + (SVGHEIGHT * newBBox[4]) + "px' />"); //opacity: 0.5; filter: alpha(opacity = 50);
        //$.when(self.loadDeferred()).then(function () {
        $('#SVGBox').html("<img id='pngImage' src='" + SVGBASELOCATION + url.substring(0, url.length - 3) + "png' width='" + (SVGWIDTH * newBBox[4]) + "px' height='" + (SVGHEIGHT * newBBox[4]) + "px' style='position: relative;top: " + (-newBBox[1] * newBBox[4]) + "px; left:" + (-newBBox[0] * newBBox[4]) + "px; z-index:50; ' /><div id='PathBox' style='position:relative; z-index:100; top: -" + (SVGHEIGHT * newBBox[4]) + "px' />"); //opacity: 0.5; filter: alpha(opacity = 50);
        self.drawDegradedPath(newBBox);
        //});
    };

    //self.transition = function () {
    //	self.object.transition()
    //		.duration(19000)
    //		.attrTween("transform", self.translateAlong(self.path.node()))
    //		.ease("linear")
    //		.each("end", self.transition);
    //}

    // Returns an attrTween for translating along the specified path element.
    self.translateAlong = function (path) {
        var l = path.getTotalLength ? path.getTotalLength() : 0;
        return function (d, i, a) {
            return function (t) {
                if (path.getPointAtLength) {
                    var p = path.getPointAtLength(t * l);
                    return "translate(" + p.x + "," + p.y + ")";
                }
                else {
                    return "";
                }
            };
        };
    }

    self.RedrawSVG = function (currentFileObject) {
        var BBox = getBoundingBox(currentFileObject.pathpoints, null, null, null, true);
        CURRENT_ZOOM = BBox[6];

        $("#SVGBox").empty();
        var points = currentFileObject.pathpoints.split(/\s+|,/);
        if (points.length == 0 && self.stepCount > 1 && self.currentStepNumber != self.stepCount) {
            if (SUPPORTS_SVG) {
                $('#SVGBox').html('<svg version="1.1" xmlns="https://www.w3.org/2000/svg" xmlns:xlink="https://www.w3.org/1999/xlink" x="0px" y="0px" width="100%"  \
				height="100%" viewBox="0 0 250 250" enable-background="new 0 0 250 250" xml:space="preserve">                                                     \
		   <g id="Layer_2">                                                                                                                                       \
			   <rect y="-1" fill="#E2E3E4" width="250" height="250"/>                                                                                             \
		   </g>\                                                                                                                                                  \
		   <g id="Layer_3">                                                                                                                                       \
			   <rect x="92.833" y="52.5" fill="#A3A2A2" width="28.667" height="197.5"/>                                                                           \
			   <rect x="-0.167" y="52.168" fill="#A3A2A2" width="35.333" height="197.665"/>                                                                       \
			   <rect x="35.167" y="98.833" fill="#D3D3D3" width="57.667" height="151.167"/>                                                                       \
			   <rect x="35.167" y="169.5" fill="#BFBEBE" width="57.833" height="80.5"/>                                                                           \
			   <rect y="98.833" fill="#747373" width="35.167" height="3"/>                                                                                        \
			   <rect x="93" y="98.833" fill="#747373" width="33.5" height="3"/>                                                                                   \
			   <rect x="93" y="168.5" fill="#747373" width="33.5" height="3"/>                                                                                    \
			   <rect y="168.5" fill="#747373" width="35.167" height="3"/>                                                                                         \
			   <rect x="127.334" y="141.833" fill="#D3D3D3" width="122.666" height="108.167"/>                                                                    \
			   <polygon fill="#0099FF" points="61.833,63.167 50.5,74.167 56.167,74.167 56.167,97.333 66.875,97.333 66.875,73.75 72.167,73.75 	                  \
				"/>                                                                                                                                               \
			<polygon fill="#0099FF" points="61.833,227.834 73.166,216.834 67.5,216.834 67.5,193.666 56.791,193.666 56.791,217.25                                  \
				51.5,217.25 	"/>                                                                                                                               \
			<polygon fill="#0099FF" points="231.658,100.176 218.076,99.974 221.522,103.419 207.432,117.51 213.944,124.022 228.288,109.679                         \
				231.506,112.897 	"/>                                                                                                                           \
			<polygon fill="#0099FF" points="150.771,180.848 164.353,181.05 160.906,177.604 174.997,163.514 168.484,157.001 154.141,171.344                        \
				150.923,168.127 	"/>                                                                                                                           \
			<path fill="#848484" d="M36.5,117.083v49.083h52.917v-49.083H36.5z M85.833,162.833H39.667v-43.25h46.167V162.833z"/>                                    \
			<circle fill="#848484" cx="48.771" cy="134.563" r="4.021"/>                                                                                           \
			<path fill="#848484" d="M45.75,151.875v10.333h6.417c0,0,0-11.458,0-10.333c-0.125,1.625,2.667,2.25,2.792,0.083                                         \
				c0,0,0.021-11.146,0-11.708s-0.417-1.916-2.625-1.958s-6.24,0-7.115,0s-2.375,0.989-2.375,2.489s0.031,9.636,0.031,11.386                             \
				S45.458,154.375,45.75,151.875z"/>                                                                                                                 \
			<circle fill="#848484" cx="78.521" cy="134.563" r="4.021"/>                                                                                           \
			<path fill="#848484" d="M75.5,151.626v10.333h6.417c0,0,0-11.458,0-10.333c-0.125,1.625,2.667,2.25,2.792,0.083                                          \
				c0,0,0.021-10.209,0-10.865s-0.417-2.759-2.625-2.801S75.125,138,75.125,138s-2.531,0.25-2.531,2.813                                                 \
				c0,1.5,0.031,9.355,0.031,11.105S75.208,154.126,75.5,151.626z"/>                                                                                   \
			<circle fill="#0099FF" cx="63.459" cy="134.563" r="4.021"/>                                                                                           \
			<path fill="#0099FF" d="M60.438,151.626v10.333h6.417c0,0,0-11.458,0-10.333c-0.125,1.625,2.667,2.25,2.792,0.083                                        \
				c0,0,0.01-10.615,0.01-11.334s-0.427-2.29-2.635-2.332s-6.396,0.02-7.083,0.02s-2.313,0.988-2.313,2.488s0,9.637,0,11.387                             \
				S60.146,154.126,60.438,151.626z"/>                                                                                                                \
			<polygon fill="#A3A2A2" points="128.334,222 142.834,222 142.834,213.833 151.167,213.833 151.167,203.5 160,203.5 160,195                               \
				169.167,195 169.167,186.5 178.334,186.5 178.334,177.5 186.834,177.5 186.834,168.833 196,168.833 196,159.667 205.167,159.667                       \
				205.167,150.667 213.5,150.667 213.5,142.333 222.167,142.333 222.167,133.5 231.5,133.5 231.5,125.333 241.667,125.333                               \
				241.667,117.167 250,117.167 250,250 128.167,250 	"/>                                                                                           \
			<rect x="127.334" y="141.833" fill="#A1A1A1" width="18.166" height="3.834"/>                                                                          \
			<rect x="229" y="142.5" fill="#8E8E8E" width="21" height="4.333"/>                                                                                    \
			<rect y="49.5" fill="#3E3F40" width="250.5" height="3"/>                                                                                              \
			<rect x="121" y="50" fill="#3E3F40" width="9" height="203"/>                                                                                          \
			<circle fill="#0099FF" cx="192.063" cy="133.75" r="3.75"/>                                                                                            \
			<path fill="#0099FF" d="M186.938,139.563c0,0,1.625-1.813,3.25-1.688s3.563-0.188,5.375,0.313c0.479,0.604,0.833,4.417,0.771,4.729                       \
				c1.167,0,3.854,0.646,5.292,0.646c2.125,0.5,1.563,2.25,0.563,2.375L196,145.625v3.125c0,0,5,2.021,5.063,2.208                                       \
				s0.063,7.042,0,8.042s-2.167,1.188-2.354-0.125c-0.25-1.438-0.333-6.75-0.333-6.75l-4.625-0.813l-0.917,0.438l-1.708,10.875                           \
				l-0.813,6.25c0,0-2.375,0.875-2.438-0.25l0.688-18.25L189,142.25l-3.625,3l2.188,2.313c0,0,2.25,1.813,0.625,2.5                                      \
				c0,0-1.375,0.875-2.625-0.875c-1.813-1.625-3.625-2.563-3.5-3.813S186.938,139.563,186.938,139.563z"/>                                               \
			<text transform="matrix(1 0 0 1 25.5288 22.8335)">                                                                                                    \
				<tspan x="0" y="0" font-family="\'MyriadPro-Regular\'" font-size="12">Use the elevators or stairs to go to the </tspan>                           \
				<tspan x="54.557" y="14.4" font-family="\'MyriadPro-Regular\'" font-size="12">designated floor</tspan></text>                                     \
		</g>                                                                                                                                                      \
		<g id="Layer_1" display="none">                                                                                                                           \
			<image display="inline" overflow="visible" width="250" height="251" xlink:href="images/up_down.png"  transform="matrix(1 0 0 1 0 -1)">                       \
			</image>                                                                                                                                              \
		</g>                                                                                                                                                      \
		</svg>');
            } else {
                $('#SVGBox').html("<img id='pngImage' src='images/up_down.png' style='display: block;  position:absolute; top: 50%; height:250px; margin-top: -125px; left: 50%; width:250px; margin-left: -125px; ' />");
            }
            return;
        }

        if (SUPPORTS_SVG) {
            d3.select('#mainSVG').remove();
            self.svg = d3.select("#SVGBox").append("svg").attr("id", "mainSVG")
				.attr("width", "100%")
				.attr("height", "100%").attr("style", "overflow:hidden")
				.call(zm)
				.append("g");
            if (supportsCORS()) {
                $.ajax({
                    url: SVGBASELOCATION + currentFileObject.url,
                    type: "GET",
                    dataType: 'text',
                    success: function (data) {
                        self.putSVG(data, BBox, currentFileObject.floorid);
                    },
                    error: function (request, status, error) {
                        $.ajax({
                            url: self.MapUrl + "?FileURL=" + encodeURIComponent(SVGBASELOCATION + currentFileObject.url) + getJsonpSuffix(),
                            type: "GET",
                            dataType: getJsonDataType(),
                            contentType: getJsonContentType(),
                            success: function (data) {
                                self.putSVG(data, BBox, currentFileObject.floorid);
                            },
                            error: function (a, d, b) {
                                var x = 0;
                            }
                        });
                    }
                });
            } else {
                self.putDegradedSVG(currentFileObject.url, BBox);
            }
        } else {
            self.putDegradedSVG(currentFileObject.url, BBox);
        }
    };

    self.RenderDirectionSteps = function (directions) {
        if (typeof directions == 'object' && directions.length > 0) {
            var i = 0;
            var directionsList = "<ul class='directions'>";

            for (i = 0; i < directions.length; i++) {
                var direction = directions[i];
                var liclass = self.GetDirectionClass(direction.Direction);

                if (direction.Distance == 0 && direction.Direction === "") {
                    liclass = self.GetDirectionClass("START");
                    directionsList += self.ListItem(liclass, direction.Description, i + 1);
                    continue;
                }
                directionsList += self.ListItem(liclass, direction.Description, i + 1);
            }

            directionsList += "</ul>";

            return directionsList;
        } else {
            return false;
        }
    }

    self.RenderPrintableDirectionSteps = function (directions) {
        if (typeof directions == 'object' && directions.length > 0) {
            var i = 0;
            var directionsList = "<ul class='directions'>";

            for (i = 0; i < directions.length; i++) {
                var direction = directions[i];
                var liclass = self.GetDirectionClass(direction.Direction);

                if (direction.Distance == 0 && direction.Direction === "") {
                    liclass = self.GetDirectionClass("START");
                    directionsList += self.ListItem(liclass, direction.Description, i + 1);
                    continue;
                }

                directionsList += self.ListItem(liclass, direction.Description, i + 1);
            }

            directionsList += "</ul>";

            return directionsList;
        } else {
            return false;
        }
    }

    self.RenderDirections = function (jsonObject) {
        var dHtml = "";
        mainVM.printableVM.walkingDivs.removeAll();

        //$("#directions div[data-role='header'] h1").html("Directions to: " + DestinationName);
        //$(contentContainerElement).closest("div[data-role='page']").find("a.back").attr("href", "#" + DestinationTypeID);
        var mapCount = 0;
        for (var key in jsonObject) {
            if (key.indexOf("Step") === 0) {
                dHtml += "<div class='directionsDiv'><h3>" + key + "</h3>";
                dHtml += self.RenderDirectionSteps(jsonObject[key]);
                dHtml += "</div>";
                if (jsonObject[key].length == 1 && jsonObject[key][0]["Direction"] == "FLOOR-FLOOR"
					&& (!self.filesObject || !self.filesObject['f' + (mapCount + 1)] || !self.filesObject['f' + (mapCount + 1)].pathpoints || self.filesObject['f' + (mapCount + 1)].pathpoints.split(' ').length == 1)
					) {
                    dHtml += "<div class='mappingDiv'><img src='images/up_down.png'/></div>";
                } else {
                    dHtml += '<div class="mappingParentDiv"><div class="mappingDiv mapDiv' + mapCount + '"></div><div class="pathingDiv PathBoxmapDiv' + mapCount + '"></div></div>';
                    //dHtml = '<div class="mappingDiv mapDiv' + mapCount + '"></div><div class="pathingDiv PathBoxmapDiv' + mapCount + '"></div>';
                    //dHtml += "<div class='mappingDiv mapDiv" + mapCount + "'></div>";
                }
                dHtml += "<div class='clear'></div>";
                mapCount += 1;
                var printHTML = "<h4>" + key + "</h4>";
                printHTML += self.RenderPrintableDirectionSteps(jsonObject[key], true);
                mainVM.printableVM.walkingDivs.push({ divHTML: printHTML, divVisible: true, isMap: false, divClear: 'none' });
            }
        }
        mapCount = 0;
        self.directionsHTML(dHtml);
        var funcwithdelay = $.delayInvoke(function (event) {
            while (mainVM.printableVM.svgDivs()[mapCount]) {
                if (SUPPORTS_SVG) {
                    var item = mainVM.printableVM.svgDivs()[mapCount];
                    if (!item.isRendered && !item.isRendering) {
                        mainVM.printableVM.renderSVG(item, 'mapDiv', function (item) {
                            if ($(".mapDiv" + item.index).length > 0) {
                                $(".mapDiv" + item.index).html(item.mapHTML);
                            }
                        });
                    }
                    else if (item.isRendered && item.mapHTML && !item.isRendering) {
                        if ($(".mapDiv" + item.index).length > 0) {
                            $('.mapDiv' + item.index).html(item.mapHTML);
                        }
                    }
                } else {
                    mainVM.printableVM.putDegradedSVG(mainVM.printableVM.svgDivs()[mapCount], 'mapDiv');
                }
                mapCount += 1;
            }
        }, 300);
        funcwithdelay();
    }

    self.GetDirectionClass = function (direction) {
        if (typeof (direction) == "undefined" || direction === null || direction === "") {
            return "";
        }

        switch (direction) {
            case "RIGHT":
            case "IMMEDIATE RIGHT":
            case "SLIGHT RIGHT":
                return "right";
                break;
            case "SLIGHT LEFT":
            case "LEFT":
            case "IMMEDIATE LEFT":
                return "left";
                break;
            case "PARKING":
                return "parking";
                break;
            case "GO STRAIGHT":
            case "STRAIGHT":
            case "CONTINUE":
                return "straight";
                break;
            case "FLOOR-FLOOR":
                return "elevator";
                break;
            case "START":
                return "start";
                break;
            case "END":
            case "Arrive at Destination":
                return "end";
                break;
            case "BACK":
                return "back";
                break;
        }
    }

    self.ListItem = function (liClass, liHtml, index) {
        var classString = "";
        if (liClass !== "") {
            classString = "class ='directionIcon " + liClass + "'";
        }
        return "<li class='directionItem'><span>" + index + ".</span><span " + classString + "></span><span>" + liHtml + "</span></li>";
    }

    self.resizeSVG = function () {
        var funcwithdelay = $.delayInvoke(function (event) {
            if (SUPPORTS_SVG) {
                if (self.currentFileObject && self.svg) {
                    var BBox = getBoundingBox(self.currentFileObject.pathpoints, null, null, null, true);
                    self.drawPath(BBox);
                    CURRENT_ZOOM = BBox[6];
                    RESET = [-(BBox[0]), -(BBox[1])];
                    RESET_SCALE = CURRENT_ZOOM;
                    zm.translate([-(BBox[0]), -(BBox[1])]).scale(CURRENT_ZOOM);
                    Rotation = 0;
                    DrawControls();
                    SVGRotateDegree(Rotation);
                }
            } else {
                self.UpdateStepInfo(self.currentStepNumber);
            }
        }, 50);
        funcwithdelay();
    };

    self.drawPath = function (BBox) {
        var array = self.currentFileObject.pathpoints.split(' ');
        var xypoints1 = array[0].split(',');
        var xypoints2 = array[array.length - 1].split(',');

        //Check if

        var points = self.currentFileObject.pathpoints.split(/\s+|,/);
        var x0 = points.shift(), y0 = points.shift();
        var pathpoints_p = 'M' + x0 + ',' + y0 + ' L ' + points.join(' ');

        d3.select("#pathGroup").remove();
        var group = self.svg.append('g').attr("id", "pathGroup");
        self.path = group.append('path').attr("id", "mainpath").attr("d", pathpoints_p).attr("fill", "none").attr("stroke-width", BBox[9]).attr("stroke", "#009eff");
        self.path = group.append('path').attr("id", "mainpath-offset").attr("d", pathpoints_p).attr("fill", "none").attr("stroke-width", BBox[9]/2).attr("stroke", "#fff").attr("stroke-dasharray","4").attr("stroke-linecap",'round');
        //Add Node A
        group.append('circle').attr("r", DEFAULTSIZE / BBox[6]).attr("cx", xypoints1[0]).attr("cy", xypoints1[1]).attr("fill", "#66CC66").attr("stroke", "#e9e9e9").attr("stroke-width", ".5");
        group.append('circle').attr("r", DEFAULTSIZE / BBox[6]).attr("cx", xypoints1[0]).attr("cy", xypoints1[1]).attr("fill", "#66CC66").attr("stroke", "#white").attr("stroke-width", "1");
        group.append('text').attr("x", ((xypoints1[0]) - 4)).attr("y", (parseFloat(xypoints1[1]) + 3))
			.attr("font-family", 'verdana').attr("font-size", DEFAULTSIZE / BBox[6]).text(self.alphabet[self.currentStepNumber - 1]).attr("fill", "white");
        //Add Node B
        group.append('circle').attr("r", DEFAULTSIZE / BBox[6]).attr("cx", xypoints2[0]).attr("cy", xypoints2[1]).attr("fill", "#CC0033").attr("stroke", "#e9e9e9").attr("stroke-width", ".5");
        group.append('circle').attr("r", DEFAULTSIZE / BBox[6]).attr("cx", xypoints2[0]).attr("cy", xypoints2[1]).attr("fill", "#CC0033").attr("stroke", "#white").attr("stroke-width", "1");
        group.append('text').attr("x", ((xypoints2[0]) - 4)).attr("y", (parseFloat(xypoints2[1]) + 3))
			.attr("font-family", 'verdana').attr("font-size", DEFAULTSIZE / BBox[6]).text(self.alphabet[self.currentStepNumber]).attr("fill", "white");
        if ((self.currentStepNumber == 1 && mainVM.start_location().isOffCampus()) || (mainVM.end_location().isOffCampus() && self.currentStepNumber == self.stepCount)) {
            self.object = group.append('path').attr('d', "m8.39619,-2.25244l-1.95614,-5.11237c-0.07913,-0.25598 -0.30347,-0.43985 -0.57395,0.43985l-11.30468,0c-0.26062,0 -0.48821,0.18387 -0.574,0.43985l-1.94953,5.11237l16.3583,0zm1.97261,4.27953c0,-1.19338 -0.884,-2.14879 -1.97592,-2.14879c-1.08858,0 -1.97261,0.95541 -1.97261,2.14879c0,1.18611 0.88402,2.15596 1.97261,2.15596c1.09192,0 1.97592,-0.96985 1.97592,-2.15596m-18.46285,2.15596c1.08854,0 1.97591,-0.96985 1.97591,-2.15596c0,-1.19338 -0.88737,-2.14879 -1.97591,-2.14879c-1.09189,0 -1.97264,0.95541 -1.97264,2.14879c0,1.18611 0.88076,2.15596 1.97264,2.15596m1.82746,3.82165l0,2.1416c0,1.1789 -0.87416,2.1271 -1.94292,2.1271c-1.07538,0 -1.94294,-0.9482 -1.94294,-2.1271l0,-2.1416l-1.97265,0l0,-6.95468l0,-0.00722c0,-1.52144 0.9336,-2.7977 2.20686,-3.17626l2.27612,-5.92357c0.33645,-0.86528 1.11496,-1.47819 2.02541,-1.47819l11.65765,0c0.91701,0 1.70212,0.61291 2.03197,1.47819l2.27279,5.92357c1.2767,0.37856 2.2168,1.65481 2.2168,3.17626l-0.0066,0.00722l0,6.95468l-1.9792,0l0.0098,2.1416c0,1.1789 -0.8708,2.1271 -1.94289,2.1271c-1.07867,0 -1.94623,-0.9482 -1.94623,-2.1271l0.00661,-2.1416l-12.97056,0l0,0l0,0l-0.00002,0z")
				.attr('fill', "#009eff").attr('stroke', "#000000").attr("stroke-width", 0.25).attr('opacity', 7).attr("stroke-linecap", "round").attr("stroke-linejoin", "round").attr("stroke-miterlimit", 4).attr("stroke-dashoffset", 0);//.attr("transform","translate(" + x0 + "," + y0 + ")")
            //.append('animateMotion').attr('repeatCount',"indefinite").attr('dur',"19s").attr('path', pathpoints_p).attr('id','animationelement');
        }
        else {
            self.object = group.append('path').attr('d', "m3.70892,5.42856l0,7.77154l-2.5793,0l0,-7.74314l-0.60813,0l0,7.74314l-2.5793,0l0,-7.77154l0,-6.65473l-0.67366,0l0,5.71892l-1.7405,0l0,-5.76506c0,-0.94397 0.86251,-1.97926 1.90826,-1.97926l6.77721,0c1.06548,0 1.90826,1.0932 1.90826,2.05498l0,5.68935l-1.7405,0l0,-5.71892l-0.67235,0l0,6.65473l0.00001,-0.00001zm-2.87681,-13.79096c-1.54532,0 -2.79948,1.1321 -2.79948,2.52702c0,1.39492 1.25417,2.52702 2.79948,2.52702c1.54531,0 2.79948,-1.1321 2.79948,-2.52702c0,-1.39492 -1.25417,-2.52702 -2.79948,-2.52702z")
				.attr('fill', "#009eff").attr('stroke', "#000000").attr("stroke-width", 0.25).attr('opacity', 7).attr("stroke-linecap", "round").attr("stroke-linejoin", "round").attr("stroke-miterlimit", 4).attr("stroke-dashoffset", 0);//.attr("transform","translate(" + x0 + "," + y0 + ")")
            //.append('animateMotion').attr('repeatCount',"indefinite").attr('dur',"19s").attr('path',pathpoints_p).attr('id','animationelement');
        }
        //self.transition();

        //self.object.append('animateMotion').attr('repeatCount', "indefinite").attr('dur', "19s").attr('path', pathpoints_p);
        var startPoint = xypoints1;
        var pathNode = self.path.node();
        var markerObject = self.object;
        markerObject
          .attr("transform", "translate(" + startPoint + ")");

        transition();        

        function transition() {
            markerObject.transition()
                .duration(19000)
                .ease("linear")
                .attrTween("transform", translateAlong(pathNode))
                .each("end", transition);// infinite loop
        }

        function translateAlong(path) {
            var l = path.getTotalLength();
            return function (i) {
                return function (t) {
                    var p = path.getPointAtLength(t * l);
                    return "translate(" + p.x + "," + p.y + ")";//Move markerObject
                }
            }
        }
    }



    self.drawDegradedPath = function (newBBox) {
        var array = self.currentFileObject.pathpoints.split(' ');
        var xypoints1 = array[0].split(',');
        var xypoints2 = array[array.length - 1].split(',');

        //Check if

        var points = self.currentFileObject.pathpoints.split(/\s+|,/);
        var x0 = points.shift(), y0 = points.shift();
        var pathpoints_p = 'M' + x0 + ',' + y0 + ' L ' + points.join(' ');
        var paper = Raphael('PathBox', $('#SVGBox').width(), $('#SVGBox').height());
        //var c = paper.image("https://svgmaps.yourdirectroute.com/svgdocs/" + url.substring(0,url.length-3)+'png', 0, 0, SVGWIDTH, SVGHEIGHT);

        paper.path(pathpoints_p).attr("fill", "none").attr("stroke-width", newBBox[5]).attr("stroke", "#009eff");
        //Add Node A
        paper.circle(xypoints1[0], xypoints1[1], newBBox[6]).attr("fill", "#66CC66").attr("stroke", "#e9e9e9").attr("stroke-width", ".5");
        paper.circle(xypoints1[0], xypoints1[1], newBBox[7]).attr("fill", "#66CC66").attr("stroke", "#white").attr("stroke-width", "1");
        paper.text((xypoints1[0]), (xypoints1[1]), self.alphabet[self.currentStepNumber - 1]).attr("font-family", 'verdana').attr("font-size", newBBox[6]).attr("fill", "white");
        //Add Node B
        paper.circle(xypoints2[0], xypoints2[1], newBBox[6]).attr("fill", "#CC0033").attr("stroke", "#e9e9e9").attr("stroke-width", ".5");
        paper.circle(xypoints2[0], xypoints2[1], newBBox[7]).attr("fill", "#CC0033").attr("stroke", "#white").attr("stroke-width", "1");
        paper.text((xypoints2[0]), (xypoints2[1]), self.alphabet[self.currentStepNumber]).attr("font-family", 'verdana').attr("font-size", newBBox[6]).attr("fill", "white");
        paper.setViewBox(newBBox[0], newBBox[1], newBBox[2], newBBox[3], false);
    }

    self.UpdateLinkAndDirections = function (clientID, startPoint, endPoint, parkingType, mapVersion) {
        var dfd = $.Deferred();
        if (self.mapParams.indexOf("ClientID=" + clientID) < 0 ||
			self.mapParams.indexOf("StartPoint=" + startPoint) < 0 ||
			self.mapParams.indexOf("EndPoint=" + endPoint) < 0 ||
			self.mapParams.indexOf("ParkingType=" + parkingType) < 0) {
            mainVM.storageObject.ParkingType = parkingType;
            mainVM.storageObject.ClientID = clientID;
            if (window.location.host.indexOf('test') < 0) UpdateSession(0, false, false);
            $.ajax({
                url: self.PathAndDirectionsUrl + "?ClientID=" + clientID + (mapVersion ? "&mv=" + mapVersion : "") + "&s=" + startPoint + "&e=" + endPoint + "&pt=" + parkingType + "&l=english" + getJsonpSuffix(),
                type: "GET",
                dataType: getJsonDataType(),
                contentType: getJsonContentType(),
                success: function (tmp) {
                    self.mapParams = 'StartPoint=' + startPoint + '&EndPoint=' + endPoint + '&ClientID=' + clientID + "&ParkingType=" + parkingType;
                    self.filesObject = tmp.ShortestPath;
                    var count = 0;
                    for (k in self.filesObject) if (self.filesObject.hasOwnProperty(k)) count++;
                    mainVM.printableVM.svgDivs.removeAll();
                    mainVM.printableVM.numMapsShown = 0;
                    var stepNumber = 1;
                    for (var i = 1; i <= count; i++) {
                        var propName = 'f' + stepNumber.toString()
                        if (self.filesObject && self.filesObject.hasOwnProperty(propName)) {
                            stepNumber += 1;
                            var currentFileObject = self.filesObject[propName];
                            var array = currentFileObject.pathpoints.split(' ');
                            var xypoints1 = array[0].split(',');
                            var xypoints2 = array[array.length - 1].split(',');

                            var points = currentFileObject.pathpoints.split(/\s+|,/);
                            var x0 = points.shift(), y0 = points.shift();
                            var pathpoints_p = 'M' + x0 + ',' + y0 + 'L' + points.join(' ');
                            var mapHTML = '<div class="mappingParentDiv"><div class="mappingDiv map' + (stepNumber - 2) + '"></div><div class="pathingDiv PathBoxmap' + (stepNumber - 2) + '"></div></div>';

                            var mapDimentions = getMapSize();

                            var BBox = getBoundingBoxP(currentFileObject.pathpoints, mapDimentions.width, mapDimentions.height, null, true);
                            var svgItem = { id: currentFileObject.floorid, index: stepNumber - 2, title: currentFileObject.title, divHTML: ko.observable(mapHTML), mapFileName: currentFileObject.url, isRendered: false, isRendering: false, divVisible: true, isMap: true, divClear: 'none', BBox: BBox, array: array, xypoints1: xypoints1, xypoints2: xypoints2, points: points, x0: x0, y0: y0, pathpoints_p: pathpoints_p };
                            mainVM.printableVM.svgDivs.push(svgItem);
                        }
                    }
                    self.UpdateStepInfo(1);
                    self.RenderDirections(tmp.WalkingDirections);
                    self.Note(tmp.Note);
                    self.ShortNote(tmp.ShortNote);
                    dfd.resolve();
                },
                error: function (request, status, error) { alert(status + ", " + error); dfd.reject(); }
            });
        }
        return dfd.promise();
    }

    function getMapSize() {
        //if (window.location.hash.indexOf('printable?') > -1) {
        //    return { width: 605, height: 254 };
        //}
        //return { width: 784, height: 250 };

        return { width: 605, height: 254 };

    }
}
