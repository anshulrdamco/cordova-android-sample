var BrowserDetect = {
	init: function () {
		this.browser = this.searchString(this.dataBrowser) || "An unknown browser";
		this.version = this.searchVersion(navigator.userAgent)
			|| this.searchVersion(navigator.appVersion)
			|| "an unknown version";
		this.OS = this.searchString(this.dataOS) || "an unknown OS";
	},
	searchString: function (data) {
		for (var i = 0; i < data.length; i++) {
			var dataString = data[i].string;
			var dataProp = data[i].prop;
			this.versionSearchString = data[i].versionSearch || data[i].identity;
			if (dataString) {
				if (dataString.indexOf(data[i].subString) != -1)
					return data[i].identity;
			}
			else if (dataProp)
				return data[i].identity;
		}
	},
	searchVersion: function (dataString) {
		var index = dataString.indexOf(this.versionSearchString);
		if (index == -1) return;
		return parseFloat(dataString.substring(index + this.versionSearchString.length + 1));
	},
	dataBrowser: [
		{
			string: navigator.userAgent,
			subString: "Chrome",
			identity: "Chrome"
		},
		{
			 string: navigator.userAgent,
			 subString: "AppleWebKit",
			 identity: "Safari Mobile",
			 versionSearch: "Version"
		},
		{
			string: navigator.userAgent,
			subString: "OmniWeb",
			versionSearch: "OmniWeb/",
			identity: "OmniWeb"
		},
		{
			string: navigator.vendor,
			subString: "Apple",
			identity: "Safari",
			versionSearch: "Version"
		},
		{
			prop: window.opera,
			identity: "Opera",
			versionSearch: "Version"
		},
		{
			string: navigator.vendor,
			subString: "iCab",
			identity: "iCab"
		},
		{
			string: navigator.vendor,
			subString: "KDE",
			identity: "Konqueror"
		},
		{
			string: navigator.userAgent,
			subString: "Firefox",
			identity: "Firefox"
		},
		{
			string: navigator.vendor,
			subString: "Camino",
			identity: "Camino"
		},
		{		// for newer Netscapes (6+)
			string: navigator.userAgent,
			subString: "Netscape",
			identity: "Netscape"
		},
		{
			string: navigator.userAgent,
			subString: "MSIE",
			identity: "Explorer",
			versionSearch: "MSIE"
		},
		{
			string: navigator.userAgent,
			subString: "Gecko",
			identity: "Mozilla",
			versionSearch: "rv"
		},
		{ 		// for older Netscapes (4-)
			string: navigator.userAgent,
			subString: "Mozilla",
			identity: "Netscape",
			versionSearch: "Mozilla"
		}
	],
	dataOS: [
		{
			string: navigator.platform,
			subString: "Win",
			identity: "Windows"
		},
		{
			string: navigator.platform,
			subString: "Mac",
			identity: "Mac"
		},
		{
			string: navigator.userAgent,
			subString: "iPhone",
			identity: "iPhone/iPod"
		},
		{
			string: navigator.platform,
			subString: "Linux",
			identity: "Linux"
		}
	]

};
BrowserDetect.init();

var minVersions = [
					{ browser: "Explorer", minVersion: 8 }
					, { browser: "Firefox", minVersion: 5 }
					, { browser: "Chrome", minVersion: 10 }
					, { browser: "Safari", minVersion: 4 }
					, { browser: "Opera", minVersion: 12 }
					, { browser: "Safari Mobile", minVersion: 4 } //iPad , iPhone
					];
var browserSupported = false;
for (var mv = 0; mv < minVersions.length ; mv++) {
	if (minVersions[mv].browser == BrowserDetect.browser && (BrowserDetect.version=="an unknown version" || minVersions[mv].minVersion <= BrowserDetect.version)) {
		browserSupported = true;
		break;
	}
}
if(BrowserDetect.browser != "Explorer"){
	browserSupported = true;
}
if (!browserSupported) {
	alert("Your browser is not supported, and may not work correctly.\r\n\
\r\n\
    Recommended Browsers: \r\n\
	    = Internet Explorer 9-10+ \r\n\
	    = Firefox 19-22+ \r\n\
	    = Chrome 25-28+ \r\n\
	    = Safari 4-6+ \r\n\
\r\n\
(" + BrowserDetect.browser + " " + BrowserDetect.version + "; dataBrowser:" + this.dataBrowser + " userAgent: " + navigator.userAgent  + ") \r\n\
");
}