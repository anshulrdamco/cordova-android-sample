//CODE PULLED (and modified) FROM http://www.codeproject.com/Articles/11011/JavaScript-Date-Format
//times and zf functions pulled from http://www.codeproject.com/Articles/16010/Extending-JavaScript-Intrinsic-Objects-with-Protot

// a global month names array
var gsMonthNames = new Array(
'January',
'February',
'March',
'April',
'May',
'June',
'July',
'August',
'September',
'October',
'November',
'December'
);
// a global day names array
var gsDayNames = new Array(
'Sunday',
'Monday',
'Tuesday',
'Wednesday',
'Thursday',
'Friday',
'Saturday'
);

String.prototype.times = function(n)
{
 var s = '';
 for (var i = 0; i < n; i++)
  s += this;

 return s;
}

String.prototype.zf = 
  function(n) { return '0'.times(n - this.length) + this; }
  
// the date format prototype
Date.prototype.ljFormat = function(f)
{
    if (!this.valueOf())
        return ' ';

    var d = this;

    return f.replace(/(yyyy|mmmm|mmm|mm|dddd|ddd|dd|hh|h|am|nn|ss|a\/p)/gi,
        function($1)
        {
            switch ($1.toLowerCase())
            {
            case 'yyyy': return d.getFullYear();
            case 'mmmm': return gsMonthNames[d.getMonth()];
            case 'mmm':  return gsMonthNames[d.getMonth()].substr(0, 3);
            case 'mm':   return (d.getMonth() + 1).toString().zf(2);
            case 'dddd': return gsDayNames[d.getDay()];
            case 'ddd':  return gsDayNames[d.getDay()].substr(0, 3);
            case 'dd':   return d.getDate().zf(2);
            case 'hh':   return ((h = d.getHours() % 12) ? h : 12).toString().zf(2);
            case 'h':   return ((h = d.getHours() % 12) ? h : 12).toString().zf(1);	//added
            case 'nn':   return d.getMinutes().toString().zf(2);
            case 'ss':   return d.getSeconds().toString().zf(2);
            case 'a':  return d.getHours() < 12 ? 'a' : 'p';
			case 'am':  return d.getHours() < 12 ? 'AM' : 'PM';		//added
            }
        }
    );
}