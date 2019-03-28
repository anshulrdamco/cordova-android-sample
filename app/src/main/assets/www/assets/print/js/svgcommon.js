var SVGHEIGHT = 0;
var SVGWIDTH = 0;
var minScale = 0.125;//0.3
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
var RotateX = 0, RotateY = 0;

var AREA = height;

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
        var translate = zm.translate();
        var scale = Math.min(maxScale, Math.max(minScale, zm.scale()));
        //$("#SVGBox").width()
        var tx = Math.min(Math.max(SVGWIDTH * scale * (-0.9), translate[0]), $("#SVGBox").width() * 0.9),
            ty = Math.max(SVGHEIGHT * scale * (-0.9), Math.min($("#SVGBox").height() * 0.9, translate[1]));

        CURRENT_ZOOM = scale;
        if (tx && ty) {
            MAPSVG.attr("transform", "translate(" + (tx) + "," + (ty) + ") scale(" + scale + ") rotate(" + Rotation + ", " + RotateX + ", " + RotateY + ")");
            $('#YouAreHere circle').attr("r", 15 / scale);
            $('#YouAreHere text').attr("r", 20 / scale);
            $("#pathGroup circle").attr("r",DEFAULTSIZE / scale);
            $("#pathGroup text").attr("font-size", DEFAULTSIZE / scale)
                                .attr("transform", function () {
                                    return CustomTransformForLabelTranslate(scale);
                                });

            mainVM.ContentsGeofences().CurrentScale(scale);
            mainVM.pushContentAndGeoFenceInMap(100);

        } else {
            //This is where is has issues
            var attribute = $('svg#mainSVG g')[0].attributes[0];
            var currentTransform = "";
            if (attribute) currentTransform = attribute.value.split('scale')[0];
            MAPSVG.attr("transform", currentTransform + " scale(" + scale + ") rotate(" + Rotation + ", " + RotateX + ", " + RotateY + ")");
            $('#YouAreHere circle').attr("r", 15 / scale);
            $('#YouAreHere text').attr("r", 20 / scale);
            $("#pathGroup circle").attr("r", DEFAULTSIZE / scale);
            $("#pathGroup text").attr("font-size", DEFAULTSIZE / scale)
                                .attr("transform", function () {
                                    return CustomTransformForLabelTranslate(scale);
                                });
        }
        setSlider(scale);
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
    var lineWidth = Math.ceil(3 / (zoomLevel ? zoomLevel : 1));
    var bigRadius = Math.ceil(lineWidth * 2);
    var smallRadius = Math.ceil(bigRadius * 0.9);
    if (lineWidth < 3) lineWidth = 3;
    if (bigRadius < 10) bigRadius = 10;
    if (smallRadius < 9) smallRadius = 9;
    RotateX = Xmid;
    RotateY = Ymid;
    return [(xLeft), (yTop), Xmin, Ymin, xDist, yDist, zoomLevel, Xmid, Ymid, lineWidth, bigRadius, smallRadius];
}

function getBoundingBoxPoint(CenterX, CenterY, InitialZoom, elementID, HEIGHT, WIDTH, SCALE) {
    var Xmax = parseInt(CenterX) + (WIDTH * .05);
    var Xmin = parseInt(CenterX) - (WIDTH * .05);
    var Ymax = parseInt(CenterY) + (HEIGHT * .05);
    var Ymin = parseInt(CenterY) - (HEIGHT * .05);
    var Xmid = CenterX;
    var Ymid = CenterY;

    width = $("#" + elementID).width();
    height = $("#" + elementID).height();
    width = width * (100 - BBOX_PADDING) / 100
    height = height * (100 - BBOX_PADDING) / 100

    /*if (!!BoxSize) {
        width = width + (width * (BoxSize) / 100 / 2)
        height = height + (height * (BoxSize) / 100 / 2)
    }*/

    ASPECT_RATIO = width / height; //Aspect Ratio of the SVG BOX

    var xDist = (Xmax - Xmin);
    var yDist = (Ymax - Ymin);
    MAP_WIDTH = xDist;
    MAP_HEIGHT = yDist;

    SCALE = zm.scale();

    if (InitialZoom) {
        var SP_ASPECT_RATIO = xDist / yDist; //ASPECT RATIO of the Shortest Path Bounding Box

        if (SP_ASPECT_RATIO >= ASPECT_RATIO) //if the aspect ratio of the SP Bounding Box is greater than the SVG BOX aspect ratio we should consider width for the aspect ratio
        {
            SCALE = width / xDist;
        }
        else //if the aspect ratio of the SP Bounding Box is less than the SVG BOX aspect ratio we should consider height for the aspect ratio
        {
            SCALE = height / yDist;
        }
    }
    if (SCALE > maxScale) {
        SCALE = maxScale;
    }
    if (SCALE < minScale) {
        SCALE = minScale;
    }
    zoomLevel = SCALE;


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
    RotateX = Xmid;
    RotateY = Ymid;
    return [(xLeft), (yTop), Xmin, Ymin, xDist, yDist, zoomLevel, Xmid, Ymid];
}

function getBoundingBoxForZoomPoint(x, y, w, h, ZOOM_TYPE, newScale) {
    var Xshift, YShift;
    Xshift = 50;
    Yshift = 20;
    width = w ? w : $("#SVGBox").width();
    height = h ? h : $("#SVGBox").height();
    width = (width * (100 - BBOX_PADDING) / 100) * (BBOX_PADDING) / 2 / 100;
    height = (height * (100 - BBOX_PADDING) / 100) * (BBOX_PADDING) / 2 / 100;
    var gbb = getBoundingBoxPoint(x, y, false, 'SVGBox', h, w, zm.scale());
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
        var BBox = getBoundingBoxForZoomPoint(mainVM.YouAreHere.x, mainVM.YouAreHere.y, $("#SVGBox").width(), $("#SVGBox").height(), -1, newScale)
        zm.translate([-(BBox[0]), -(BBox[1])]).scale(BBox[6]);
        zoom();

        PIXEL_X_SCALE = d.x;
    }
}

function DrawControls() {
    BoxSize = 0;
    X_SCALE = 0;
    ZoomType = 0;
    //have to remove before adding in order to prevent duplicate controls from being drawn
    d3.select("#gCompass").remove();
    var g4 = d3.select("#mainSVG").append('g').attr("transform", " translate(10,70)").attr("id", "gCompass");
    var Compass = g4.append("g").attr("id", "Compass");


    Compass.append('svg:path').attr("d", "m13.847,0l-13.847,26.654l13.848,-5.063l14.152,5.156l-14.153,-26.747zm0,3.366l10.933,20.755l-10.933,-4.391v-16.364l0,0z")
				.attr("fill", "#4890CD");
    Compass.append('svg:path').attr("d", "m4.943,50v-21.223h4.146l8.642,14.174v-14.174h3.959v21.223h-4.276l-8.511,-13.84v13.84h-3.96l0,0z")
					.attr("fill", "#4890CD");

    setSlider(zm.scale());
}

function SVGZoomIn() {
    var scale = zm.scale();
    BoxSize = 1; // added hack for preventing deep zoom
    if ((scale + 0.1 >= minScale) && (scale + 0.1 <= maxScale)) {
        var BBox = getBoundingBoxForZoomPoint(mainVM.YouAreHere.x, mainVM.YouAreHere.y, $("#SVGBox").width(), $("#SVGBox").height(), 1)
        zm.translate([-(BBox[0]), -(BBox[1])]).scale(BBox[6]);
        zoom();
    }
}

function SVGZoomOut() {
    var scale = zm.scale();
    BoxSize = 0; // added hack for preventing deep zoom
    if ((scale - 0.1 >= minScale) && (scale - 0.1 <= maxScale)) {
        var BBox = getBoundingBoxForZoomPoint(mainVM.YouAreHere.x, mainVM.YouAreHere.y, $("#SVGBox").width(), $("#SVGBox").height(), 0)
        zm.translate([-(BBox[0]), -(BBox[1])]).scale(BBox[6]);

        zoom();
    }
}

function SVGResetZoom() {
    if (MAPSVG) {
        MAPSVG.attr("transform", "translate( " + RESET[0] + "," + RESET[1] + ")scale(" + RESET_SCALE + ")");
        zm.translate([RESET[0], RESET[1]]);
        zm.scale(RESET_SCALE);
        zoom();
    }
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
    compass.attr("transform", "translate(10, 70)rotate(" + degrees + ", " + (compassBBox.width / 2) + ", " + (compassBBox.height / 2) + ")");
    MAPSVG.attr("transform", "translate(" + (translate[0]) + "," + (translate[1]) + ") scale(" + CURRENT_ZOOM + ") rotate(" + degrees + ", " + RotateX + ", " + RotateY + ")");
    MAPSVG.selectAll('#Labels g.movableText').each(function () {
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
    mainVM.ContentsGeofences().MapRotation(Rotation);
}

function SVGRotateLeft() {
    Rotation = Rotation - 30;
    if (Rotation == -30) Rotation = 330;
    SVGRotateDegree(Rotation);
    mainVM.ContentsGeofences().MapRotation(Rotation);
}

function GetLabelsAsSVG(labels) {
    var retVal = '<g id=\"Labels\">';
    for (var i = 0; i < labels.length; i++) {
        var lbl = labels[i];
        retVal += "<g class=\"movableText\" data-rotation=\"" + lbl.Rotation + "\" transform=\"translate(" + lbl.X + "," + lbl.Y + ")scale("+lbl.Scale+")rotate(" + lbl.Rotation + ")\" data-id=\"" + lbl.ID + "\" data-index=\"" + i + "\" data-icon=\"" + lbl.Icon + "\">";
        if (lbl.IconXML) retVal += "<g class=\"icon\">" + lbl.IconXML + "</g>";
        if (lbl.TextString) retVal += "<text class=\"" + lbl.Class + " " + lbl.Color + "\">" + lbl.TextString + "</text>";
        retVal += "</g>";
    }
    return retVal + "</g>";
}

function AddLabelsToSVG(svg, labels) {
    var lbls = GetLabelsAsSVG(labels);
    try {
        xml = $.parseXML('<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" version="1.1" x="0px" y="0px" width="' + SVGWIDTH + 'px" height="' + SVGHEIGHT + 'px" viewBox="0 0 ' + SVGWIDTH + ' ' + SVGHEIGHT + '" enable-background="new 0 0 ' + SVGWIDTH + ' ' + SVGHEIGHT + '" xml:space="preserve">' + lbls + '</svg>');
    }
    catch (e) {
        if (e.message.indexOf("Invalid XML") == 0) {
            var resp = confirm("You need to add SVG support to your browser to see maps; would you like to download it?");
            if (resp) {
                window.location.href = "http://www.adobe.com/devnet/svg/adobe-svg-viewer-download-area.html";
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

function CustomTransformForLabelTranslate(scale) {
    var translateTxt = "";
    if (scale < 0.30) {
        translateTxt = "translate(" + (1 / scale) * -3 + "," + (1 / scale) * 3 + ")";
    }
    else
        if (scale > 0.30 && scale < 0.90) {
            translateTxt = "translate(" + (1 / scale) * (-1.5) + "," + (1 / scale) * (1.5) + ")";
        } else
            if (scale > 1.30) {
                translateTxt = "translate(" + (0.95) * scale + "," + (-0.95) * scale + ")";
            }
    return translateTxt;
}
