var SVGHEIGHT = 0;
var SVGWIDTH = 0;
var minScale = 0;//0.3;
var maxWalkingScale = 1;
var maxScale = 2;//2.5;
var translate, scale, width, height, RESET, RESET_SCALE, ZOOM_SCALE, CURRENT_ZOOM, ZOOM_INCREMENT, BBOX_PADDING, ZoomType;
ZOOM_INCREMENT = 1;
var X_SCALE = 0, PIXEL_X_SCALE = 0;
BBOX_PADDING = 20; //in percent
var BoxSize = 0;
var zm = d3.behavior.zoom().scaleExtent([minScale, maxScale]).on("zoom", zoom);
//Define scales
var margin = { top: 0, right: 0, bottom: 0, left: 0 };
width = (GetWidth()) - margin.left - margin.right;
height = (GetHeight()) - margin.top - margin.bottom;
var Rotation = 0;
var AREA = height;
var RotateX = 0, RotateY = 0;

var ASPECT_RATIO = width / height; //Full size is one

//default size of start and end point
var DEFAULTSIZE = 12;

//Calculate the viewbox area	
function zoom() {

    if (RotateX == 0)
        RotateX = SVGWIDTH / 2;
    if (RotateY == 0)
        RotateY = SVGHEIGHT / 2;

    if ((!!zm.translate()) && (!!zm.scale() || zm.scale() == 0)) {
        //calculate the centroid
        translate = zm.translate();
        var scale = zm.scale();

        CURRENT_ZOOM = scale;
        if ((scale >= minScale) && (scale <= maxScale)) {
            if (translate[0] && translate[1]) {
                mainVM.ljdirectionsVM.svg.attr("transform", "translate(" + (translate[0]) + "," + (translate[1]) + ") scale(" + scale + ") rotate(" + Rotation + ", " + RotateX + ", " + RotateY + ")");
                mainVM.ljdirectionsVM.svg.selectAll("#pathGroup circle")
                                  .attr("r", function () {
                                      return DEFAULTSIZE / scale;
                                  });
                mainVM.ljdirectionsVM.svg.selectAll("#pathGroup text")
                                  .attr("font-size", function () {
                                      return DEFAULTSIZE / scale;
                                  })
                                .attr("transform", function () {
                                    return CustomTransformForLabelTranslate(scale);
                                });
            }
            else {
                //This is where is has issues
                var currentTransform = $('svg#mainSVG g')[0].attributes[0].value.split('scale')[0];
                mainVM.ljdirectionsVM.svg.attr("transform", currentTransform + " scale(" + scale + ")");
            }
            setSlider(scale);
        }
    }
}

function setSlider(scale) {
    X_SCALE = -35 + ((35 + 40) * (maxScale - scale) / (maxScale - minScale));
    d3.select("#slidemover").attr("transform", "translate( " + X_SCALE + " ,0)");
}

function getBoundingBox(pathpoints, w, h, BoxSize, InitialZoom) {
    var VBoxvalues = pathpoints.split(' ').join(' ').split(',').join(' ').split(' ');
    var Vvalues = pathpoints.split(' ');
    var Xvalues, zoomLevel;
    var Yvalues;
    for (i = 0; i < Vvalues.length; i++) {
        var splitval = Vvalues[i].split(',')
        if (i == 0) {
            Xvalues = splitval[0];
            Yvalues = splitval[1];
        }
        else {
            Xvalues = Xvalues + " " + splitval[0];
            Yvalues = Yvalues + " " + splitval[1];
        }
    }
    var XBoxvalues = Xvalues.split(' ');
    var YBoxvalues = Yvalues.split(' ');
    for (var i = 0; i < XBoxvalues.length; i++) {
        XBoxvalues[i] = parseInt(XBoxvalues[i]);
    }
    for (var i = 0; i < YBoxvalues.length; i++) {
        YBoxvalues[i] = parseInt(YBoxvalues[i]);
    }

    var Xmax = Math.max.apply(Math, XBoxvalues);
    var Xmin = Math.min.apply(Math, XBoxvalues);
    var Ymax = Math.max.apply(Math, YBoxvalues);
    var Ymin = Math.min.apply(Math, YBoxvalues);
    var Xmid = (Xmax + Xmin) / 2
    var Ymid = (Ymax + Ymin) / 2

    width = (w ? w : ($("#SVGBox").width() ? $("#SVGBox").width() : 900));
    height = (h ? h : ($("#SVGBox").height() ? $("#SVGBox").height() : 700));
    width = width * (100 - BBOX_PADDING) / 100
    height = height * (100 - BBOX_PADDING) / 100

    if (!!BoxSize) {
        width = width + (width * (BoxSize) / 100 / 2)
        height = height + (height * (BoxSize) / 100 / 2)
    }



    ASPECT_RATIO = width / height; //Aspect Ratio of the SVG BOX

    var xDist = (Xmax - Xmin);
    var yDist = (Ymax - Ymin);
    MAP_WIDTH = xDist;
    MAP_HEIGHT = yDist;

    ZOOM_SCALE = zm.scale();

    if (InitialZoom) {
        ZOOM_SCALE = Math.min(width / xDist, height / yDist);
    }
    if (ZOOM_SCALE > maxScale) {
        ZOOM_SCALE = maxScale;
    }
    if (ZOOM_SCALE < minScale) {
        ZOOM_SCALE = minScale;
    }

    if (w < 320 && h < 320 //walking is 250x250
        && ZOOM_SCALE > maxWalkingScale) {
        ZOOM_SCALE = maxWalkingScale;
    }

    zoomLevel = ZOOM_SCALE;


    var Xp = width * (BBOX_PADDING) / 2 / 100; //+ BBOX_PADDING
    var Yp = height * (BBOX_PADDING) / 2 / 100; //+ BBOX_PADDING

    var XScaled = Xp + (width / 2);
    var YScaled = Yp + (height / 2);

    var x3 = XScaled - ((xDist * zoomLevel) / 2);
    var y3 = YScaled - ((yDist * zoomLevel) / 2);


    var xLeft = (Xmin * zoomLevel - x3);
    var yTop = (Ymin * zoomLevel - y3);
    //RemoveControls();
    //DrawControls();
    var lineWidth = Math.ceil(8 / (zoomLevel ? zoomLevel : 1));
    var bigRadius = Math.ceil(lineWidth * 2);
    var smallRadius = Math.ceil(bigRadius * 0.9);
    if (lineWidth < 3) lineWidth = 3;
    if (bigRadius < 10) bigRadius = 10;
    if (smallRadius < 9) smallRadius = 9;
    RotateX = Xmid;
    RotateY = Ymid;
    return [(xLeft), (yTop), Xmin, Ymin, xDist, yDist, zoomLevel, Xmid, Ymid, lineWidth, bigRadius, smallRadius];
}

function getBoundingBoxP(pathpoints, w, h, BoxSize, InitialZoom) {
    var VBoxvalues = pathpoints.split(' ').join(' ').split(',').join(' ').split(' ');
    var Vvalues = pathpoints.split(' ');
    var Xvalues, zoomLevel;
    var Yvalues;
    for (i = 0; i < Vvalues.length; i++) {
        var splitval = Vvalues[i].split(',')
        if (i == 0) {
            Xvalues = splitval[0];
            Yvalues = splitval[1];
        }
        else {
            Xvalues = Xvalues + " " + splitval[0];
            Yvalues = Yvalues + " " + splitval[1];
        }
    }
    var XBoxvalues = Xvalues.split(' ');
    var YBoxvalues = Yvalues.split(' ');
    for (var i = 0; i < XBoxvalues.length; i++) {
        XBoxvalues[i] = parseInt(XBoxvalues[i]);
    }
    for (var i = 0; i < YBoxvalues.length; i++) {
        YBoxvalues[i] = parseInt(YBoxvalues[i]);
    }

    var Xmax = Math.max.apply(Math, XBoxvalues);
    var Xmin = Math.min.apply(Math, XBoxvalues);
    var Ymax = Math.max.apply(Math, YBoxvalues);
    var Ymin = Math.min.apply(Math, YBoxvalues);
    var Xmid = (Xmax + Xmin) / 2
    var Ymid = (Ymax + Ymin) / 2

    width = (w ? w : ($("#SVGBox").width() ? $("#SVGBox").width() : 900));
    height = (h ? h : ($("#SVGBox").height() ? $("#SVGBox").height() : 700));
    width = width * (100 - BBOX_PADDING) / 100
    height = height * (100 - BBOX_PADDING) / 100

    if (!!BoxSize) {
        width = width + (width * (BoxSize) / 100 / 2)
        height = height + (height * (BoxSize) / 100 / 2)
    }



    ASPECT_RATIO = width / height; //Aspect Ratio of the SVG BOX

    var xDist = (Xmax - Xmin);
    var yDist = (Ymax - Ymin);
    MAP_WIDTH = xDist;
    MAP_HEIGHT = yDist;

    ZOOM_SCALE = zm.scale();

    if (InitialZoom) {
        ZOOM_SCALE = Math.min(width / xDist, height / yDist);
    }
    if (ZOOM_SCALE > maxScale) {
        ZOOM_SCALE = maxScale;
    }
    if (ZOOM_SCALE < minScale) {
        ZOOM_SCALE = minScale;
    }

    if (w < 720 && h < 320 //walking is 250x250
        && ZOOM_SCALE > maxWalkingScale) {
        ZOOM_SCALE = maxWalkingScale;
    }

    if (ZOOM_SCALE > 1.5) {
        zoomLevel = ZOOM_SCALE - (ZOOM_SCALE * 0.5);
    }
    else
    {
        zoomLevel = ZOOM_SCALE - (ZOOM_SCALE * 0.1);
    }


    var Xp = width * (BBOX_PADDING) / 2 / 100; //+ BBOX_PADDING
    var Yp = height * (BBOX_PADDING) / 2 / 100; //+ BBOX_PADDING

    var XScaled = Xp + (width / 2);
    var YScaled = Yp + (height / 2);

    var x3 = XScaled - ((xDist * zoomLevel) / 2);
    var y3 = YScaled - ((yDist * zoomLevel) / 2);


    var xLeft = (Xmin * zoomLevel - x3);
    var yTop = (Ymin * zoomLevel - y3);
    //RemoveControls();
    //DrawControls();
    var lineWidth = Math.ceil(8 / (zoomLevel ? zoomLevel : 1));
    var bigRadius = Math.ceil(lineWidth * 2);
    var smallRadius = Math.ceil(bigRadius * 0.9);
    if (lineWidth < 3) lineWidth = 3;
    if (bigRadius < 10) bigRadius = 10;
    if (smallRadius < 9) smallRadius = 9;
    RotateX = Xmid;
    RotateY = Ymid;
    return [(xLeft), (yTop), Xmin, Ymin, xDist, yDist, zoomLevel, Xmid, Ymid, lineWidth, bigRadius, smallRadius];
}

function getBoundingBoxForVML(BBox, w, h) {
    width = (w ? w : ($("#SVGBox").width() ? $("#SVGBox").width() : $("#map_canvas").width()));
    height = (h ? h : ($("#SVGBox").height() ? $("#SVGBox").height() : $("#map_canvas").height()));
    var realWidth = width;
    var realHeight = height;
    width = width * (100 - BBOX_PADDING) / 100
    height = height * (100 - BBOX_PADDING) / 100
    var Xp = width * (BBOX_PADDING) / 2 / 100 //+ BBOX_PADDING
    var Yp = height * (BBOX_PADDING) / 2 / 100 //+ BBOX_PADDING
    var XScaled = Xp + (width / 2);
    var YScaled = Yp + (height / 2);
    var x3 = XScaled - ((BBox[4] * BBox[6]) / 2);
    var y3 = YScaled - ((BBox[5] * BBox[6]) / 2);
    var viewBoxLeft = (BBox[2] - x3);//BBox[7]-(BBox[4]/2)-Xp;
    var viewBoxTop = (BBox[3] - y3);//BBox[8]-(BBox[5]/2)-Yp;
    var viewBoxRight = (BBox[2] + BBox[4] + x3);//BBox[7]-(BBox[4]/2)-Xp;
    var viewBoxBottom = (BBox[3] + BBox[5] + y3);//BBox[8]-(BBox[5]/2)-Yp;
    var viewBoxWidth = viewBoxRight - viewBoxLeft;
    var viewBoxHeight = viewBoxBottom - viewBoxTop;
    var zoom = Math.min(realWidth / viewBoxWidth, realHeight / viewBoxHeight);

    if (zoom > maxScale) {
        zoom = maxScale;
    }
    if (zoom < minScale) {
        zoom = minScale;
    }
    if (w < 320 && h < 320 //walking is 250x250
    && zoom > maxWalkingScale) {
        zoom = maxWalkingScale;
    }

    var lineWidth = 8;//Math.ceil(3/(zoomLevel ? zoomLevel : 1));
    var bigRadius = 10;//Math.ceil(lineWidth*2);
    var smallRadius = 9;//Math.ceil(bigRadius * 0.9);
    if (lineWidth < 3) lineWidth = 3;
    if (bigRadius < 10) bigRadius = 10;
    if (smallRadius < 9) smallRadius = 9;
    return [viewBoxLeft, viewBoxTop, viewBoxWidth, viewBoxHeight, zoom, lineWidth, bigRadius, smallRadius];

}



function getBoundingBoxForZoom(pathpoints, w, h, ZOOM_TYPE, newScale) {
    var Xshift, YShift;
    Xshift = 50
    Yshift = 20
    width = (w ? w : ($("#SVGBox").width() ? $("#SVGBox").width() : $("#map_canvas").width()));
    height = (h ? h : ($("#SVGBox").height() ? $("#SVGBox").height() : $("#map_canvas").height()));
    width = (width * (100 - BBOX_PADDING) / 100) * (BBOX_PADDING) / 2 / 100
    height = (height * (100 - BBOX_PADDING) / 100) * (BBOX_PADDING) / 2 / 100
    var gbb = getBoundingBox(pathpoints, w, h);
    var scale = zm.scale();
    if (ZOOM_TYPE == 1) scale = scale + 0.1; 	//Scale up
    else if (ZOOM_TYPE == 0) scale = scale - 0.1; //Scale down 
    else scale = newScale || scale;
    if (scale < minScale) {
        scale = minScale;
    }
    else if (scale > maxScale) {
        scale = maxScale;
    }

    if ((scale >= minScale) && (scale <= maxScale)) {
        gbb[0] = gbb[7] * scale - (width) / 2 - Xshift * scale;
        gbb[1] = gbb[8] * scale - (height) / 2 - Yshift * scale;
        gbb[6] = scale;
    }
    return gbb;
}


function GetWidth() {
    var x = 0;
    if ($('#SVGBox').width()) {
        x = $('#SVGBox').width();
    } else if ($("#map_canvas").width()) {
        x = $("#map_canvas").width();
    } else if (self.innerHeight) {
        x = self.innerWidth;
    }
    else if (document.documentElement && document.documentElement.clientHeight) {
        x = document.documentElement.clientWidth;
    }
    else if (document.body) {
        x = document.body.clientWidth;
    }
    return x;
}

function GetHeight() {
    var y = 0;
    if ($('#SVGBox').height()) {
        y = $('#SVGBox').height();
    } else if ($("#map_canvas").height()) {
        y = $("#map_canvas").height();
    } else if (self.innerHeight) {
        y = self.innerHeight;
    }
    else if (document.documentElement && document.documentElement.clientHeight) {
        y = document.documentElement.clientHeight;
    }
    else if (document.body) {
        y = document.body.clientHeight;
    }
    return y;
}

function dropHandler(d) {
    //alert('dropped');
}

function dragmove(d) {
    d.x += d3.event.dx;
    if (d.x > 40) d.x = 40
    if (d.x < -35) d.x = -35

    if ((d.x <= 40) && (d.x >= -35)) {


        var newScale = (minScale + maxScale) * (40 - d.x) / 75;
        var BBox = getBoundingBoxForZoom(mainVM.ljdirectionsVM.currentFileObject.pathpoints, $("#SVGBox").width(), $("#SVGBox").height(), -1, newScale)
        zm.translate([-(BBox[0]), -(BBox[1])]).scale(BBox[6]);
        zoom();

        PIXEL_X_SCALE = d.x;
    }
}

function DrawControls() {
    BoxSize = 0;
    X_SCALE = 0;
    ZoomType = 0;

    var isTouchSupported = 'ontouchstart' in window.document;
    if (isTouchSupported == false) {
        var drag = d3.behavior.drag()
	   .on("drag", dragmove)
	   .on("dragend", dropHandler);
        //have to remove before adding in order to prevent duplicate controls from being drawn
        d3.select("#gZoom").remove();
        var g1 = d3.select("#mainSVG").append('g').attr("transform", " translate(20, 20)").attr("id", "gZoom");
        var SliderCnt = g1.append("g").attr("id", "SliderCnt");
        var controlzone = SliderCnt.append("g").attr("id", "controlzone");
        var rollover = SliderCnt.append("g").attr("class", "rollover");
        SliderCnt.append("rect").attr("id", "bkpanel").attr("x", "-10").attr("y", "-5").attr("width", "50").attr("height", "150").attr("fill", "none").on('mousedown.drag', null);
        var min = rollover.append('svg:circle').attr("id", "minus").attr("r", "15").attr("cx", 10).attr("cy", 10).attr("fill", "#2A9FDA").attr("stroke", "#e9e9e9").attr("stroke-width", "1");
        rollover.on('mousedown', function () {
            var scale = zm.scale();

            BoxSize = 0;
            if ((scale - 0.1 >= minScale) && (scale - 0.1 <= maxScale)) {
                var BBox = getBoundingBoxForZoom(mainVM.ljdirectionsVM.currentFileObject.pathpoints, $("#SVGBox").width(), $("#SVGBox").height(), 0)
                zm.translate([-(BBox[0]), -(BBox[1])]).scale(BBox[6]);

                zoom();
            }

        });
        rollover.on('dblclick', function () {
            event.cancelBubble = true;
            try { event.stopPropagation(); } catch (e) { }
            return false;
        });
        rollover.append('svg:line').attr("x1", 2).attr("x2", 17).attr("y1", 10).attr("y2", 10).attr("stroke", "#fff").attr("stroke-width", "2");
        controlzone.append('svg:line').attr("x1", "9.5").attr("x2", "9.5").attr("y1", "20").attr("y2", "120").attr("stroke", "#666");
        controlzone.append('svg:line').attr("x1", "10.5").attr("x2", "10.5").attr("y1", "20").attr("y2", "120").attr("stroke", "#ddd");
        var slidezone = controlzone.append("g").attr("id", "slidezone").attr("transform", "rotate(-90 12,65.5)");
        var slidemover = slidezone.append("g").attr("id", "slidemover").attr("transform", "translate(0,0)").data([{ x: 0, y: 0 }])
					.call(drag);
        slidemover.append("svg:polygon").attr("id", "slider").attr("focusable", "true").attr("points", "-1.5,55.5 10.5,55.5 10.5,69.34615325927734 4.5,75.5 -1.5,69").attr("fill", "#ffffff").attr("stroke", "#666");
        var rollover2 = SliderCnt.append("g").attr("class", "rollover");
        var max = rollover2.append('svg:circle').attr("id", "plus").attr("r", "15").attr("cx", 10).attr("cy", 130).attr("fill", "#2A9FDA").attr("stroke", "#e9e9e9").attr("stroke-width", "1");
        rollover2.on('mousedown', function () {
            var scale = zm.scale();

            BoxSize = 1;
            if ((scale + 0.1 >= minScale) && (scale + 0.1 <= maxScale)) {
                var BBox = getBoundingBoxForZoom(mainVM.ljdirectionsVM.currentFileObject.pathpoints, $("#SVGBox").width(), $("#SVGBox").height(), 1)
                zm.translate([-(BBox[0]), -(BBox[1])]).scale(BBox[6]);
                zoom();
            }
        });
        rollover2.on('dblclick', function () {
            event.cancelBubble = true;
            try { event.stopPropagation(); } catch (e) { }
            return false;
        });
        rollover2.append('svg:line').attr("x1", "2").attr("x2", "17").attr("y1", "130").attr("y2", "130").attr("stroke", "#fff").attr("stroke-width", "2");
        rollover2.append('svg:line').attr("x1", "10").attr("x2", "10").attr("y1", "123").attr("y2", "137").attr("stroke", "#fff").attr("stroke-width", "2");
        var rollover3 = SliderCnt.append("g").attr("class", "rollover");
        var max = rollover3.append('svg:circle').attr("id", "reset").attr("r", "15").attr("cx", 10).attr("cy", 164).attr("fill", "#2A9FDA").attr("stroke", "#e9e9e9").attr("stroke-width", "1");
        rollover3.append('svg:path').attr("d", "m10.00197,155c-2.99438,0 -5.22321,0.98152 -6.95624,3.80855l-2.04573,-0.98151l0.46114,5.38576l5.15313,-2.69363l-1.92819,-0.92389c1.12873,-1.93193 3.1707,-2.8513 4.94592,-2.8513c3.95885,0 8.07593,3.32347 7.73158,8.42276c-0.26824,3.97375 -3.55422,6.88342 -7.51307,6.88342c-1.5213,0 -2.93033,-0.47827 -4.09071,-1.29074l-1.60644,0.95346c1.60117,1.29529 3.63409,2.07216 5.84785,2.07216c5.15766,0 9.33878,-4.20569 9.33878,-9.39363s-4.18038,-9.39136 -9.33803,-9.39136l0,-0.00003l0.00001,-0.00002z")
					.attr("fill", "#ffffff");
        rollover3.on('mousedown', function () {
            if (RESET[0] == 0 && RESET[1] == 0 && RESET_SCALE == 0) {
                mainVM.ljdirectionsVM.resizeSVG();
                return;
            }
            mainVM.ljdirectionsVM.svg.attr("transform", "translate( " + RESET[0] + "," + RESET[1] + ")scale(" + RESET_SCALE + ")");
            zm.translate([RESET[0], RESET[1]]);
            zm.scale(RESET_SCALE);
            zoom();
        });
        rollover3.on('dblclick', function () {
            event.cancelBubble = true;
            try { event.stopPropagation(); } catch (e) { }
            return false;
        });
    }
    else {
        var deviceAgent = navigator.userAgent.toLowerCase();
        var agentID = deviceAgent.match(/(iphone|ipod|ipad)/);
        if (agentID) {
            //have to remove before adding in order to prevent duplicate controls from being drawn
            d3.select("#gReset").remove();
            var g3 = d3.select("#mainSVG").append('g').attr("transform", " translate(-9, 0)").attr("id", "gReset");

            var Reset = g3.append("g").attr("id", "Reset");
            Reset.append("svg:path")
					   .attr("d", "M47.679,11.881c-10.835,0-19.619,8.783-19.619,19.619c0,10.835,8.784,19.618,19.619,19.618c10.835,0,19.619-8.783,19.619-19.618C67.297,20.665,58.514,11.881,47.679,11.881z M47.679,49.172c-9.76,0-17.672-7.912-17.672-17.672c0-9.761,7.912-17.674,17.672-17.674S65.351,21.74,65.351,31.5C65.351,41.26,57.439,49.172,47.679,49.172z")
					   .attr("fill", "#ffffff");

            Reset.append("svg:path")
						.attr("d", "M47.679,13.827c-9.76,0-17.672,7.913-17.672,17.674c0,9.76,7.912,17.672,17.672,17.672S65.351,41.26,65.351,31.5C65.351,21.74,57.439,13.827,47.679,13.827z M48.169,44.11c-2.938,0-5.637-1.025-7.761-2.734l2.132-1.258c1.54,1.072,3.41,1.703,5.429,1.703c5.254,0,9.615-3.839,9.971-9.082c0.457-6.729-5.007-11.113-10.261-11.113c-2.356,0-5.066,1.213-6.564,3.762l2.559,1.219l-6.839,3.554l-0.612-7.106l2.715,1.295c2.301-3.73,5.259-5.025,9.232-5.025c6.845,0,12.394,5.549,12.394,12.394S55.014,44.11,48.169,44.11z")
						.attr("fill", "#2A9FDA");

            Reset.append('svg:path').attr("d", "M48.169,19.323c-3.974,0-6.932,1.295-9.232,5.025l-2.715-1.295l0.612,7.106l6.839-3.554l-2.559-1.219c1.498-2.549,4.208-3.762,6.564-3.762c5.254,0,10.718,4.385,10.261,11.113c-0.356,5.243-4.717,9.082-9.971,9.082c-2.019,0-3.889-0.631-5.429-1.703l-2.132,1.258c2.125,1.709,4.823,2.734,7.761,2.734c6.845,0,12.394-5.549,12.394-12.394S55.014,19.323,48.169,19.323z")
						.attr("fill", "#ffffff");
            Reset.on('touchend', function () {
                if (RESET[0] == 0 && RESET[1] == 0 && RESET_SCALE == 0) {
                    mainVM.ljdirectionsVM.resizeSVG();
                    return;
                }
                mainVM.ljdirectionsVM.svg.attr("transform", "translate( " + RESET[0] + "," + RESET[1] + ")scale(" + RESET_SCALE + ")");
                zm.translate([RESET[0], RESET[1]]);
                zm.scale(RESET_SCALE);

                zoom();
            });

        }
        else {
            //have to remove before adding in order to prevent duplicate controls from being drawn
            d3.select("#gZoomIn").remove();
            //var g1 = d3.select("#mainSVG").append('g').attr("transform" ," translate(0, 0)").attr("id", "gZoomIn");

            var g1 = d3.select("#mainSVG").append('g').attr("transform", " translate(-10, 0)").attr("id", "gZoomIn");
            var Zoomin = g1.append("g").attr("id", "Zoomin");

            Zoomin.append("svg:path")
						.attr("d", "M49.408,15.021c-10.784,0-19.525,8.742-19.525,19.525c0,10.784,8.742,19.525,19.525,19.525c10.783,0,19.525-8.741,19.525-19.525C68.934,23.764,60.191,15.021,49.408,15.021z M49.408,52.221c-9.76,0-17.672-7.913-17.672-17.674c0-9.76,7.912-17.672,17.672-17.672s17.673,7.912,17.673,17.672C67.081,44.308,59.168,52.221,49.408,52.221z")
						.style("fill", "#ffffff");
            Zoomin.append("svg:path")
						.attr("d", "M49.408,16.875c-9.76,0-17.672,7.912-17.672,17.672c0,9.761,7.912,17.674,17.672,17.674s17.673-7.913,17.673-17.674C67.081,24.787,59.168,16.875,49.408,16.875z M61.754,37H51.428v10.289H48V37H37.495v-3.428H48V23.029h3.428v10.543h10.326V37z")
						.attr("style", "fill:#2A9FDA");
            Zoomin.append("svg:polygon")
						.attr("points", "48,37 48,47.289 51.428,47.289 51.428,37 61.754,37 61.754,33.572 51.428,33.572 51.428,23.029 48,23.029 48,33.572 37.495,33.572 37.495,37")
						.attr("fill", "#ffffff");
            Zoomin.on('touchend', function () {
                SVGZoomIn();
            });
            Zoomin.on('mouseup', function () {
                SVGZoomIn();
            });
            //have to remove before adding in order to prevent duplicate controls from being drawn
            d3.select("#gZoomOut").remove();
            var g2 = d3.select("#mainSVG").append('g').attr("transform", " translate(-5, 45)").attr("id", "gZoomOut");

            var Zoomout = g2.append("g").attr("id", "Zoomout");
            Zoomout.append("svg:path")
					   .attr("d", "M44.408,11.881c-10.835,0-19.619,8.784-19.619,19.618c0,10.836,8.784,19.619,19.619,19.619c10.835,0,19.619-8.783,19.619-19.619C64.027,20.666,55.244,11.881,44.408,11.881z M44.409,49.172c-9.76,0-17.673-7.912-17.673-17.673c0-9.76,7.913-17.672,17.673-17.672c9.76,0,17.671,7.912,17.671,17.672C62.08,41.26,54.168,49.172,44.409,49.172z")
					   .attr("fill", "#ffffff");

            Zoomout.append("svg:path")
						.attr("d", "M44.409,13.828c-9.76,0-17.673,7.912-17.673,17.672c0,9.761,7.913,17.673,17.673,17.673c9.76,0,17.671-7.912,17.671-17.673C62.08,21.74,54.168,13.828,44.409,13.828z M56.754,33.953H32.495v-3.428h24.259V33.953z")
						.attr("fill", "#2A9FDA");

            Zoomout.append('rect').attr({ x: 32.495, y: 30.525, width: 24.259, height: 3.428 })
						.attr("fill", "#ffffff");
            Zoomout.on('touchend', function () {
                SVGZoomOut();
            });
            Zoomout.on('mouseup', function () {
                SVGZoomOut();
            });
            //have to remove before adding in order to prevent duplicate controls from being drawn
            d3.select("#gReset").remove();
            var g3 = d3.select("#mainSVG").append('g').attr("transform", " translate(-9, 87)").attr("id", "gReset");

            var Reset = g3.append("g").attr("id", "Reset");
            Reset.append("svg:path")
					   .attr("d", "M47.679,11.881c-10.835,0-19.619,8.783-19.619,19.619c0,10.835,8.784,19.618,19.619,19.618c10.835,0,19.619-8.783,19.619-19.618C67.297,20.665,58.514,11.881,47.679,11.881z M47.679,49.172c-9.76,0-17.672-7.912-17.672-17.672c0-9.761,7.912-17.674,17.672-17.674S65.351,21.74,65.351,31.5C65.351,41.26,57.439,49.172,47.679,49.172z")
					   .attr("fill", "#ffffff");

            Reset.append("svg:path")
						.attr("d", "M47.679,13.827c-9.76,0-17.672,7.913-17.672,17.674c0,9.76,7.912,17.672,17.672,17.672S65.351,41.26,65.351,31.5C65.351,21.74,57.439,13.827,47.679,13.827z M48.169,44.11c-2.938,0-5.637-1.025-7.761-2.734l2.132-1.258c1.54,1.072,3.41,1.703,5.429,1.703c5.254,0,9.615-3.839,9.971-9.082c0.457-6.729-5.007-11.113-10.261-11.113c-2.356,0-5.066,1.213-6.564,3.762l2.559,1.219l-6.839,3.554l-0.612-7.106l2.715,1.295c2.301-3.73,5.259-5.025,9.232-5.025c6.845,0,12.394,5.549,12.394,12.394S55.014,44.11,48.169,44.11z")
						.attr("fill", "#2A9FDA");

            Reset.append('svg:path').attr("d", "M48.169,19.323c-3.974,0-6.932,1.295-9.232,5.025l-2.715-1.295l0.612,7.106l6.839-3.554l-2.559-1.219c1.498-2.549,4.208-3.762,6.564-3.762c5.254,0,10.718,4.385,10.261,11.113c-0.356,5.243-4.717,9.082-9.971,9.082c-2.019,0-3.889-0.631-5.429-1.703l-2.132,1.258c2.125,1.709,4.823,2.734,7.761,2.734c6.845,0,12.394-5.549,12.394-12.394S55.014,19.323,48.169,19.323z")
						.attr("fill", "#ffffff");
            Reset.on('touchend', function () {
                SVGResetZoom();
            });
            Reset.on('mouseup', function () {
                SVGResetZoom();
            });

            //have to remove before adding in order to prevent duplicate controls from being drawn
            //d3.select("#gRotateRight").remove();
            //var g4 = d3.select("#mainSVG").append('g').attr("transform", " translate(18, 143)").attr("id", "gRotateRight");

            //var RotateRight = g4.append("g").attr("id", "RotateRight");
            //RotateRight.append('circle').attr("r", 18).attr("cx", 20).attr("cy", 20).attr("fill", "#2A9FDA").attr("stroke", "#ffffff").attr("stroke-width", "2");
            //RotateRight.append('svg:path').attr("transform", "scale(-0.8, 0.8)translate(-41,8)").attr("d", "M28.4,15.1c-2.7-7.7-10-8-13.6-8.2c0-2.8,0-4.6,0-4.8c0-0.7-1-0.8-1.4-0.5L0.9,10.4c-0.4,0.4-0.4,1,0,1.4 l12.5,8.8c0.4,0.4,1.4,0.1,1.4-0.5c0-0.2,0-2.1,0-4.7c4.6-0.3,8,0.4,9.5,2.6c2.5,3.5,0.8,8.4,0.4,9.2c-0.6,1.1,0.7,1.5,1.1,1 C26.6,26.9,30.3,23.7,28.4,15.1z")
			//			.attr("fill", "#ffffff");
            //RotateRight.on('touchend', function () {
            //    SVGRotateRight();
            //});
            //RotateRight.on('mouseup', function () {
            //    SVGRotateRight();
            //});

            ////have to remove before adding in order to prevent duplicate controls from being drawn
            //d3.select("#gRotateLeft").remove();
            //var g5 = d3.select("#mainSVG").append('g').attr("transform", " translate(18, 183)").attr("id", "gRotateLeft");

            //var RotateLeft = g5.append("g").attr("id", "RotateLeft");
            //RotateLeft.append('circle').attr("r", 18).attr("cx", 20).attr("cy", 20).attr("fill", "#2A9FDA").attr("stroke", "#ffffff").attr("stroke-width", "2");
            //RotateLeft.append('svg:path').attr("transform", "scale(0.8, 0.8)translate(9,8)").attr("d", "M28.4,15.1c-2.7-7.7-10-8-13.6-8.2c0-2.8,0-4.6,0-4.8c0-0.7-1-0.8-1.4-0.5L0.9,10.4c-0.4,0.4-0.4,1,0,1.4 l12.5,8.8c0.4,0.4,1.4,0.1,1.4-0.5c0-0.2,0-2.1,0-4.7c4.6-0.3,8,0.4,9.5,2.6c2.5,3.5,0.8,8.4,0.4,9.2c-0.6,1.1,0.7,1.5,1.1,1 C26.6,26.9,30.3,23.7,28.4,15.1z")
			//			.attr("fill", "#ffffff");

            //RotateLeft.on('touchend', function () {
            //    SVGRotateLeft();
            //});
            //RotateLeft.on('mouseup', function () {
            //    SVGRotateLeft();
            //});
        }
    }
    //have to remove before adding in order to prevent duplicate controls from being drawn
    d3.select("#gCompass").remove();
    var g4 = d3.select("#mainSVG").append('g').attr("transform", " translate(" + (GetWidth() - 50) + ", 10)").attr("id", "gCompass");
    var Compass = g4.append("g").attr("id", "Compass");


    Compass.append('svg:path').attr("d", "m13.847,0l-13.847,26.654l13.848,-5.063l14.152,5.156l-14.153,-26.747zm0,3.366l10.933,20.755l-10.933,-4.391v-16.364l0,0z")
				.attr("fill", "#4890CD");
    Compass.append('svg:path').attr("d", "m4.943,50v-21.223h4.146l8.642,14.174v-14.174h3.959v21.223h-4.276l-8.511,-13.84v13.84h-3.96l0,0z")
					.attr("fill", "#4890CD");

    setSlider(zm.scale());
}

function SVGZoomIn() {
    //alert("clicked");
    //zm.scale(zm.scale() * ZOOM_SCALE);
    /* CURRENT_ZOOM=CURRENT_ZOOM + ((ZOOM_INCREMENT / 100) + .007) ;
    var CurrTranslate = zm.translate();
    zm.translate([(CurrTranslate[0] - (30)),(CurrTranslate[1] - (30))]);
    zm.scale(CURRENT_ZOOM);	
    zoom(); */
    var scale = zm.scale();
    BoxSize = 1;
    if ((scale + 0.1 >= minScale) && (scale + 0.1 <= maxScale)) {
        var BBox = getBoundingBoxForZoom(mainVM.ljdirectionsVM.currentFileObject.pathpoints, $("#SVGBox").width(), $("#SVGBox").height(), 1)
        zm.translate([-(BBox[0]), -(BBox[1])]).scale(BBox[6]);
        zoom();
    }
}

function SVGZoomOut() {
    var scale = zm.scale();
    BoxSize = 0;
    if ((scale - 0.1 >= minScale) && (scale - 0.1 <= maxScale)) {
        var BBox = getBoundingBoxForZoom(mainVM.ljdirectionsVM.currentFileObject.pathpoints, $("#SVGBox").width(), $("#SVGBox").height(), 0)
        zm.translate([-(BBox[0]), -(BBox[1])]).scale(BBox[6]);

        zoom();
    }
}

function SVGResetZoom() {
    if (RESET[0] == 0 && RESET[1] == 0 && RESET_SCALE == 0) {
        mainVM.ljdirectionsVM.resizeSVG();
        return;
    }
    mainVM.ljdirectionsVM.svg.attr("transform", "translate(" + (RESET[0]) + "," + (RESET[1]) + ") scale(" + RESET_SCALE + ") rotate(" + Rotation + ", " + width / 2 + ", " + height / 2 + ")");
    zm.translate([RESET[0], RESET[1]]);
    zm.scale(RESET_SCALE);
    zoom();
}

function SVGRotateDegree(degrees) {
    if (!translate) translate = [];
    if (translate.length < 2) {
        translate[0] = 0;
        translate[1] = 0;
    }
    if (RotateX == 0)
        RotateX = SVGWIDTH / 2;
    if (RotateY == 0)
        RotateY = SVGHEIGHT / 2;
    var compass = d3.select('#gCompass');
    var compassBBox = compass.node().getBBox();
    compass.attr("transform", "translate(" + (GetWidth() - 50) + ", 10)rotate(" + degrees + ", " + (compassBBox.width / 2) + ", " + (compassBBox.height / 2) + ")");
    mainVM.ljdirectionsVM.svg.attr("transform", "translate(" + (translate[0]) + "," + (translate[1]) + ") scale(" + CURRENT_ZOOM + ") rotate(" + degrees + ", " + RotateX + ", " + RotateY + ")");
    mainVM.ljdirectionsVM.svg.selectAll('#Labels g.movableText').each(function () {
        var g = d3.select(this);
        var transform = g.attr('transform');
        var myRotation = g.attr('data-rotation');
        var myBBox = g.node().getBBox();
        g.attr('transform', transform.substring(0, transform.indexOf('rotate(') + 7) + (myRotation - degrees) + ',' + (myBBox.width / 2) + ',' + (myBBox.height / 2) + ')');
    });
    zoom();
}

function SVGRotateRight() {
    Rotation = Rotation + 30;
    if (Rotation == 360) Rotation = 0;
    SVGRotateDegree(Rotation);
}

function SVGRotateLeft() {
    Rotation = Rotation - 30;
    if (Rotation == -30) Rotation = 330;
    SVGRotateDegree(Rotation);
}

function GetLabelsAsSVG(labels) {
    var retVal = '<g id=\"Labels\">';
    for (var i = 0; i < labels.length; i++) {
        var lbl = labels[i];
        retVal += "<g class=\"movableText\" data-rotation=\""+lbl.Rotation+"\" transform=\"translate(" + lbl.X + "," + lbl.Y + ")scale("+lbl.Scale+")rotate(" + lbl.Rotation + ")\" data-id=\"" + lbl.ID + "\" data-index=\"" + i + "\" data-icon=\"" + lbl.Icon + "\">";
        if (lbl.IconXML) retVal += "<g class=\"icon\">" + lbl.IconXML + "</g>";
        if (lbl.TextString) retVal += "<text class=\"" + lbl.Class + " " + lbl.Color + "\">" + lbl.TextString + "</text>";
        retVal += "</g>";
    }
    return retVal + "</g>";
}

function AddLabelsToSVG(svg, labels) {
    var lbls = GetLabelsAsSVG(labels);
    try {
        xml = $.parseXML('<svg xmlns="https://www.w3.org/2000/svg" xmlns:xlink="https://www.w3.org/1999/xlink" version="1.1" x="0px" y="0px" width="' + SVGWIDTH + 'px" height="' + SVGHEIGHT + 'px" viewBox="0 0 ' + SVGWIDTH + ' ' + SVGHEIGHT + '" enable-background="new 0 0 ' + SVGWIDTH + ' ' + SVGHEIGHT + '" xml:space="preserve">'+lbls+'</svg>');
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
        svg.node().appendChild(importedNode);
    }
}


function CustomTransformForLabelTranslate(scale)
{
    var translateTxt = "";
    if (scale < 0.30) {
        translateTxt= "translate(" + (1 / scale) * -3 + "," + (1 / scale) * 3 + ")";
    }
    else
        if (scale > 0.30 && scale < 0.90) {
            translateTxt= "translate(" + (1 / scale) * (-1.5) + "," + (1 / scale) * (1.5) + ")";
        } else
            if (scale > 1.30) {
                translateTxt= "translate(" + (0.95) * scale + "," + (-0.95) * scale + ")";
            }
    return translateTxt;
}