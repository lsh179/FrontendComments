function contains(array, obj) {
    var i = array.length;
    while (i--) {
        if (array[i] === obj) {
            return true;
        }
    }
    return false;
}
$.ajaxSetup({
    statusCode: {
        401: function (x) {
            $.showMessage({ message: "用户未登录或Cookie已过期", type: $.MessageType.Info });
            Relogin();
        }
        ,
        403: function (x) {
            var json = JSON.parse(x.responseText);
            $.showMessage({ message: json.Message, type: $.MessageType.Error });
        }
        ,
        500: function (x) {
            var json = JSON.parse(x.responseText);
            $.showMessage({ message: json.Message, type: $.MessageType.Error });
        }
        ,
        501: function (x) {
            var json = JSON.parse(x.responseText);
            $.showMessage({ message: json.Message, type: $.MessageType.Error });
        }
        ,
        503: function (x) {
            var json = JSON.parse(x.responseText);
            $.showMessage({ message: json.Message, type: $.MessageType.Error });
        }
    }
});
var WebApiAction = { Put: 'Put', Post: 'Post', Get: 'Get', Delete: 'Delete' };
var loginrequest="http://192.168.1.45:801/LoginRequest.ashx";
var exprietokenurl="http://192.168.1.45:801/AuthService.asmx/ExpireToken";
var uidcname='userid';
var tokencname='lb_token';

function ajaxWebApi(url, postdata, action, successfuction, errorfuction, completeFunction, context) {
    var def = $.Deferred();
    postdata = JSON.parse(JSON.stringify(postdata));
    if(postdata instanceof Array)
    {
        postdata = {"":postdata};
    }
    $.ajax({
        url: url,
        type: action,
        data: postdata,
        dataType: 'json',
        success: function (data, textStatus, xhr, a, b, c) {
            if (xhr.getResponseHeader("PagerResponse")) {
                data.Total_Count =xhr.getResponseHeader("Total_Count");
            }
            if(xhr.getResponseHeader("queryid"))
            {
                data.queryid =xhr.getResponseHeader("queryid");
            }
            if (successfuction) {
                successfuction(data, context);
            }
            def.resolve(data);
        },
        error: function (x, e) {
            if (errorfuction) {
                var json ={Message:'出错了'};
                try {
                    json = JSON.parse(x.responseText);
                }catch (e){
                    json ={Message:'出错了'};
                }
                errorfuction(json.Message);
            }
        },
        complete: function (x) {
            if (completeFunction)
                completeFunction();
        }
    });
    return def.promise();
}

function Relogin() {
    $.showMDialog({title:"登陆窗口",width:400,height:150
        ,Content:'<div style="line-height: 30px;text-align: center;"><div style="width: 100%;text-align: left;"><span style="width: 120px;text-align: right;display: inline-block;">用户名:</span><input type="text" name="uname" style="width: 180px;"/></div><div style="text-align: left;width: 100%;"><span style="width: 120px;text-align: right;display: inline-block;">密码:</span><input type="password" name="password" style="width: 180px;"/></div><div style="display: inline-block"><button style="width: 70px;height: 24px;margin: 10px;" mdialogbtn="confirm">登陆</button><button  mdialogbtn="close" style="width: 70px;height: 24px;margin: 10px;">关闭</button></div></div>'
        ,OnConfirm:function (content) {
            var uname = content.find("input[name=uname]").val();
            var password = content.find("input[name=password]").val();
            if(!uname||!password)
            {
                $.showMessage({message:"用户名和密码不能为空"});
                return false;
            }else {
                var def = $.Deferred();
                $.ajax({
                    url: loginrequest,
                    type: "post",
                    data: {username:uname,password:password,rem:true},
                    dataType: 'json',
                    async: false,
                    success: function (data, textStatus, xhr, a, b, c) {
                        if(data.Pass)
                        {
                            var uid = data.AuthenticationToken.User.UID;
                            var token = data.AuthenticationToken.Token;
                            setCookie(uidcname,uid);
                            setCookie(tokencname,token);
                        }else {
                            $.showMessage({message:data.ErrorMessage});
                            return false;
                        }
                    },
                    error: function (x, e) {
                    },
                    complete: function (x) {
                    }
                });
                return def.promise();
            }
        }
    });
}

function Loginout() {
    var uid = getCookie(uidcname);
    var token = getCookie(tokencname);
    delCookie(uidcname);
    delCookie(tokencname);
    ajaxWebApi(exprietokenurl,{uid:uid,token:token},WebApiAction.Post,null,null,function () {
        window.location.reload();
    });
}

function setCookie(name,value)
{
    var Days = 30;
    var exp = new Date();
    exp.setTime(exp.getTime() + Days*24*60*60*1000);
    document.cookie = name + "="+ escape (value) + ";expires=" + exp.toGMTString()+";path=/";
}

function getCookie(name)
{
    var arr,reg=new RegExp("(^| )"+name+"=([^;]*)(;|$)");
    if(arr=document.cookie.match(reg))
        return unescape(arr[2]);
    else
        return null;
}
function delCookie(name)
{
    var exp = new Date();
    exp.setTime(exp.getTime() - 1);
    var cval=getCookie(name);
    if(cval!=null)
    {
        document.cookie= name + "="+cval+";expires="+exp.toGMTString()+";path=/";
    }
}

function ajaxWebApiSync(url, postdata, action, successfuction, errorfuction, completeFunction, context) {
    var def = $.Deferred();
    postdata = JSON.parse(JSON.stringify(postdata));
    if(postdata instanceof Array)
    {
        postdata = {"":postdata};
    }
    $.ajax({
        url: url,
        type: action,
        data: postdata,
        dataType: 'json',
        async: false,
        success: function (data, textStatus, xhr, a, b, c) {
            if (xhr.getResponseHeader("PagerResponse")) {
                data.Total_Count = xhr.getResponseHeader("Total_Count");
            }
            if (successfuction) {
                successfuction(data, context);
            }
            def.resolve(data);
        },
        error: function (x, e) {
            if (errorfuction) {
                var json ={Message:'出错了'};
                try {
                    json = JSON.parse(x.responseText);
                }catch (e){
                    json ={Message:'出错了'};
                }
                errorfuction(json.Message);
            }
        },
        complete: function (x) {
            if (completeFunction)
                completeFunction();
        }
    });
    return def.promise();
}

function AjaxCallbackObj(url, settings, action, successfuction, errorfuction, completeFunction) {
    var scope = this;
    this.url = url;
    this.settings = deepClone(settings);
    this.action = action;
    this.successfuction = successfuction;
    this.errorfuction = errorfuction;
    this.completeFunction = completeFunction;

    this.get = function () {
        $.ajax({
            url: scope.url,
            type: scope.action,
            data: scope.settings.pagerObj,
            dataType: 'json',
            beforeSend: function (XMLHttpRequest) {
                //ShowLoading();
            },
            success: function (data, textStatus, xhr) {
                if (xhr.getResponseHeader("PagerResponse")) {
                    data.Total_Count = xhr.getResponseHeader("Total_Count");
                }
                if (scope.successfuction) {
                    scope.successfuction(data, scope);
                }
            },  //闭包返回函数,该函数自带上下文
            error: function (x, e) {
                // scope.errorfuction(x.responseText, scope);
                //if (errorfuction) {
                //    var json = JSON.parse(x.responseText);
                //    errorfuction(json.Message);
                //}
            }
        });
    }
}

function ajaxPost(url, postdata, successfuction, errorfuction, completeFunction) {

    postdata = JSON.parse(JSON.stringify(postdata));
    if(postdata instanceof Array)
    {
        postdata = {"":postdata};
    }
    $.ajax({
        url: url,
        type: "POST",
        data: postdata,
        success: function (json) {
            if (json) {
                try {
                    var sif = eval("(" + json + ")");
                    if (successfuction) {
                        successfuction(sif);
                    }
                }
                catch (e) {

                }
            }
        },
        error: function (x, e) {
            //try {
            //    if (errorfuction) {
            //        errorfuction(x.responseText);
            //    }
            //}
            //catch (e) {

            //}
        },
        complete: function (x) {
            try {
                if (completeFunction)
                    completeFunction();
                //   alert(x.responseText);
            }
            catch (e) {

            }
        }
    })
}
function GetRandom(seed) {
    return Math.floor(Math.random() * (seed + 1));
}

var _login_confirm;
function _global_logining() {
    var host = window.location.host;
    var ccr = '<iframe src=' + PageModel.SystemSet.authenticationPage + "?redirectUrl=http://" + host + "/_global_auth.aspx" + ' style="border: none;width:100%;height:500px;margin:0;padding:0;overflow:hidden"></iframe>'
    //ccr=PageModel.SystemSet.authenticationPage ;
    _login_confirm = $.dialog({
        title: '登录',
        columnClass: 'col-md-offset-2 col-md-8',
        content: ccr
    });
}
function _global_logined() {
    if (_login_confirm)
        _login_confirm.close();
}
$.fn.serializeObject = function () {
    var o = {};
    var a = this.serializeArray();
    $.each(a, function () {
        if (o[this.name] !== undefined) {
            if (!o[this.name].push) {
                o[this.name] = [o[this.name]];
            }
            o[this.name].push(this.value || '');
        } else {
            o[this.name] = this.value || '';
        }
    });
    return o;
};

String.prototype.format = function (args) {
    var result = this;
    if (arguments.length > 0) {
        if (arguments.length == 1 && typeof (args) == "object") {
            for (var key in args) {
                if (args[key] != undefined) {
                    var reg = new RegExp("({" + key + "})", "g");
                    result = result.replace(reg, args[key]);
                }
            }
        }
        else {
            for (var i = 0; i < arguments.length; i++) {
                if (arguments[i] != undefined) {
                    var reg = new RegExp("({)" + i + "(})", "g");
                    result = result.replace(reg, arguments[i]);
                }
            }
        }
    }
    return result;
}

String.prototype.bind = function (args) {
    var result = this;

    var result = result.replace(/\$\w+\$/gi, function (matchs) {

        var returns = args[matchs.replace(/\$/g, "")];
        return (returns + "") == "undefined" || (returns + "") == "null" ? "" : returns;
    });
    return result;
}

//判断一个对象是否为json对象
function isJsonObj(obj) {
    var isjson = typeof (obj) == "object" && Object.prototype.toString.call(obj).toLowerCase() == "[object object]" && !obj.length;
    return isjson;
}

//判断一个对象是否为数组对象
function isArray(obj) {
    return Object.prototype.toString.call(obj) === '[object Array]';
}

function ShowAlter(info, title) {
    if (typeof btoa === "undefined") {
        btoa = BASE64.encoder;
        atob = BASE64.decoder;
    }

    $.alert({
        title: (title ? title : '提示'),
        content: info,
        backgroundDismiss: true,
        confirmButton: "确定"
    });
}

// 对Date的扩展，将 Date 转化为指定格式的String   
// 月(M)、日(d)、小时(h)、分(m)、秒(s)、季度(q) 可以用 1-2 个占位符，   
// 年(y)可以用 1-4 个占位符，毫秒(S)只能用 1 个占位符(是 1-3 位的数字)   
// 例子：   
// (new Date()).Format("yyyy-MM-dd hh:mm:ss.S") ==> 2006-07-02 08:09:04.423   
// (new Date()).Format("yyyy-M-d h:m:s.S")      ==> 2006-7-2 8:9:4.18   
Date.prototype.Format = function (fmt) { //author: meizz   
    var o = {
        "M+": this.getMonth() + 1,                 //月份   
        "d+": this.getDate(),                    //日   
        "h+": this.getHours(),                   //小时   
        "m+": this.getMinutes(),                 //分   
        "s+": this.getSeconds(),                 //秒   
        "q+": Math.floor((this.getMonth() + 3) / 3), //季度   
        "S": this.getMilliseconds()             //毫秒   
    };
    if (/(y+)/.test(fmt))
        fmt = fmt.replace(RegExp.$1, (this.getFullYear() + "").substr(4 - RegExp.$1.length));
    for (var k in o)
        if (new RegExp("(" + k + ")").test(fmt))
            fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : (("00" + o[k]).substr(("" + o[k]).length)));
    return fmt;
}

Date.isLeapYear = function (year) {
    return (((year % 4 === 0) && (year % 100 !== 0)) || (year % 400 === 0));
};

Date.getDaysInMonth = function (year, month) {
    return [31, (Date.isLeapYear(year) ? 29 : 28), 31, 30, 31, 30, 31, 31, 30, 31, 30, 31][month];
};

Date.prototype.Compare=function (ndate) {
    return this.getTime()-ndate.getTime();
}

Date.prototype.isLeapYear = function () {
    return Date.isLeapYear(this.getFullYear());
};

Date.prototype.getDaysInMonth = function () {
    return Date.getDaysInMonth(this.getFullYear(), this.getMonth());
};

Date.prototype.addMonths = function (value) {
    var n = this.getDate();
    this.setDate(1);
    this.setMonth(this.getMonth() + value);
    this.setDate(Math.min(n, this.getDaysInMonth()));
    return this;
};

Date.prototype.addMonth = function (value) {
    var year = this.getFullYear(), month = this.getMonth(),day = this.getDate(),hour=this.getHours(),min=this.getMinutes(),sec=this.getSeconds(),mil = this.getMilliseconds();
    var nmonth =(month+value)%12,nyear=year+ Math.floor(parseFloat(month+value)/12);
    var n = new Date(nyear,nmonth,1);
    var nday = Math.min(day,n.monthTotal());
    n.setDate(nday);
    n.setHours(hour,min,sec,mil);
    return n;
};
Date.prototype.addDay = function (value) {
    return new Date(this.getTime()+ value*24*3600*1000);
};
Date.prototype.monthTotal = function () {
    var year = this.getFullYear(), month = this.getMonth(),day = 1;
    var cd = new Date(year,month,day);
    var nd = new Date((month+1>11?year+1:year),(month+1>11?0:month+1),day);
    return (nd.getTime()-cd.getTime())/(24*3600*1000);
};

Date.prototype.zerotime=function () {
    var nd =  new Date(this.getTime());
    nd.setHours(0,0,0,0);
    return nd;
},
Date.prototype.lasttime=function () {
    var nd =  new Date(this.getTime());
    nd.setHours(23,59,59,999);
    return nd;
},
Date.prototype.fdayOfWeek=function () {
    var wdy = this.getDay();
    if(wdy==0)
    {
        wdy=7;
    }
    return this.addDay(1-wdy).zerotime();
};
Date.prototype.edayOfWeek=function () {
    return this.fdayOfWeek().addDay(6).lasttime();
};
Date.prototype.fdayOfMonth=function () {
    var year = this.getFullYear(), month = this.getMonth(),day = this.getDate(),hour=this.getHours(),min=this.getMinutes(),sec=this.getSeconds(),mil = this.getMilliseconds();
    return new Date(year,month,1);
};
Date.prototype.edayOfMonth=function () {
    return this.fdayOfMonth().addMonth(1).addDay(-1).lasttime();
};
Date.prototype.fdayOfSeason=function () {
    var year = this.getFullYear(), month = this.getMonth(),day = this.getDate(),hour=this.getHours(),min=this.getMinutes(),sec=this.getSeconds(),mil = this.getMilliseconds();
    return new Date(year,Math.floor(month/3)*3 ,1);
};
Date.prototype.edayOfSeason=function () {
    return this.fdayOfSeason().addMonth(3).addDay(-1).lasttime();
};
Date.prototype.fdayOfYear=function () {
    var year = this.getFullYear(), month = this.getMonth(),day = this.getDate(),hour=this.getHours(),min=this.getMinutes(),sec=this.getSeconds(),mil = this.getMilliseconds();
    return new Date(year,0 ,1);
};
Date.prototype.edayOfYear=function () {
    return this.fdayOfYear().addMonth(12).addDay(-1).lasttime();
};

function Str2List (str,splitStr,removeEmpty) {
    if(!str)
    {
        return [];
    }
    if(!splitStr)
    {
        splitStr=',';
    }
    if(removeEmpty==undefined||removeEmpty==null)
    {
        removeEmpty = true;
    }
    var narray = str.split(splitStr);
    var tmp =[];
    if(removeEmpty) {
        for (var i = 0; i < narray.length;i++)
        {
            if(narray[i]!=null&&narray[i]!='')
            {
                tmp.push(narray[i]);
            }
        }
        return tmp;
    }

    return narray;
}
String.prototype.ToArray=function (splitStr,removeEmpty) {
    if(!this)
    {
        return [];
    }
    if(!splitStr)
    {
        splitStr=',';
    }
    if(removeEmpty==undefined||removeEmpty==null)
    {
        removeEmpty = true;
    }
    var narray = this.split(splitStr);
    var tmp =[];
    if(removeEmpty) {
        for (var i = 0; i < narray.length;i++)
        {
            if(narray[i]!=null&&narray[i]!='')
            {
                tmp.push(narray[i]);
            }
        }
        return tmp;
    }

    return narray;
}

Array.prototype.select=function (op) {
    var narray =[];
    for(var i=0;i<this.length;i++)
    {
        if(op)
        {
            narray.push(op(this[i]));
        }else {
            narray.push(deepClone(this[i]));
        }
    }
    return narray;
}

Array.prototype.where=function (op) {
    var narray =[];
    for(var i=0;i<this.length;i++)
    {
        if(op)
        {
            if(op(this[i])) {
                narray.push(deepClone(this[i]));
            }
        }else {
            narray.push(deepClone(this[i]));
        }
    }
    return narray;
};


Array.prototype.any=function (op) {
    if(!op){
        return false;
    }
    for(var i=0;i<this.length;i++)
    {
        if(op(this[i])) {
            return  true;
        }
    }
    return false;
}

Array.prototype.first=function (op) {
    if(!op){
        if(this.length>0)
        {
           return this[0];
        }else {
            return undefined;
        }
    }
    for(var i=0;i<this.length;i++)
    {
        if(op(this[i])) {
            return  this[i];
        }
    }
    return undefined;
}

Array.prototype.all=function (op) {
    if(!op){
        return false;
    }
    for(var i=0;i<this.length;i++)
    {
        if(!op(this[i])) {
            return  false;
        }
    }
    return true;
}

Array.prototype.sum=function (op) {
    var result=0.0;
    for(var i=0;i<this.length;i++)
    {
        if(op)
        {
           result = result + op(this[i]);
        }else {
            result = result +parseFloat(this[i]+'');
        }
    }
    return result;
};

Array.prototype.indexOf = function(val) {
    for (var i = 0; i < this.length; i++) {
        if (this[i] == val) return i;
    }
    return -1;
};

Array.prototype.remove = function(val) {
    var index = this.indexOf(val);
    if (index > -1) {
        this.splice(index, 1);
    }
};

/*
 * 功能：生成一个GUID码，其中GUID以14个以下的日期时间及18个以上的16进制随机数组成，GUID存在一定的重复概率，但重复概率极低，理论上重复概率为每10ms有1/(16^18)，即16的18次方分之1，重复概率低至可忽略不计
 * 免责声明：此代码为作者学习专用，如在使用者在使用过程中因代码问题造成的损失，与作者没有任何关系
 * 日期：2014年9月4日
 * 作者：wyc
 */

String.prototype.replaceAll = function(s1,s2){
    return this.replace(new RegExp(s1,"gm"),s2);
}


function GUID() {
    this.date = new Date();

    /* 判断是否初始化过，如果初始化过以下代码，则以下代码将不再执行，实际中只执行一次 */
    if (typeof this.newGUID != 'function') {

        /* 生成GUID码 */
        GUID.prototype.newGUID = function () {
            this.date = new Date();
            var guidStr = '';
            sexadecimalDate = this.hexadecimal(this.getGUIDDate(), 16);
            sexadecimalTime = this.hexadecimal(this.getGUIDTime(), 16);
            for (var i = 0; i < 9; i++) {
                guidStr += Math.floor(Math.random() * 16).toString(16);
            }
            guidStr += sexadecimalDate;
            guidStr += sexadecimalTime;
            while (guidStr.length < 32) {
                guidStr += Math.floor(Math.random() * 16).toString(16);
            }
            return this.formatGUID(guidStr);
        }

        /*
         * 功能：获取当前日期的GUID格式，即8位数的日期：19700101
         * 返回值：返回GUID日期格式的字条串
         */
        GUID.prototype.getGUIDDate = function () {
            return this.date.getFullYear() + this.addZero(this.date.getMonth() + 1) + this.addZero(this.date.getDay());
        }

        /*
         * 功能：获取当前时间的GUID格式，即8位数的时间，包括毫秒，毫秒为2位数：12300933
         * 返回值：返回GUID日期格式的字条串
         */
        GUID.prototype.getGUIDTime = function () {
            return this.addZero(this.date.getHours()) + this.addZero(this.date.getMinutes()) + this.addZero(this.date.getSeconds()) + this.addZero(parseInt(this.date.getMilliseconds() / 10));
        }

        /*
        * 功能: 为一位数的正整数前面添加0，如果是可以转成非NaN数字的字符串也可以实现
         * 参数: 参数表示准备再前面添加0的数字或可以转换成数字的字符串
         * 返回值: 如果符合条件，返回添加0后的字条串类型，否则返回自身的字符串
         */
        GUID.prototype.addZero = function (num) {
            if (Number(num).toString() != 'NaN' && num >= 0 && num < 10) {
                return '0' + Math.floor(num);
            } else {
                return num.toString();
            }
        }

        /* 
         * 功能：将y进制的数值，转换为x进制的数值
         * 参数：第1个参数表示欲转换的数值；第2个参数表示欲转换的进制；第3个参数可选，表示当前的进制数，如不写则为10
         * 返回值：返回转换后的字符串
         */
        GUID.prototype.hexadecimal = function (num, x, y) {
            if (y != undefined) {
                return parseInt(num.toString(), y).toString(x);
            } else {
                return parseInt(num.toString()).toString(x);
            }
        }

        /*
         * 功能：格式化32位的字符串为GUID模式的字符串
         * 参数：第1个参数表示32位的字符串
         * 返回值：标准GUID格式的字符串
         */
        GUID.prototype.formatGUID = function (guidStr) {
            var str1 = guidStr.slice(0, 8) + '-',
              str2 = guidStr.slice(8, 12) + '-',
              str3 = guidStr.slice(12, 16) + '-',
              str4 = guidStr.slice(16, 20) + '-',
              str5 = guidStr.slice(20);
            return str1 + str2 + str3 + str4 + str5;
        }
    }

    return GUID.prototype.newGUID();
}

function isIE() { //ie?
    if (!!window.ActiveXObject || "ActiveXObject" in window)
        return true;
    else
        return false;
}

(function (jQuery) {

    if (jQuery.browser) return;

    jQuery.browser = {};
    jQuery.browser.mozilla = false;
    jQuery.browser.webkit = false;
    jQuery.browser.opera = false;
    jQuery.browser.msie = false;

    var nAgt = navigator.userAgent;
    jQuery.browser.name = navigator.appName;
    jQuery.browser.fullVersion = '' + parseFloat(navigator.appVersion);
    jQuery.browser.majorVersion = parseInt(navigator.appVersion, 10);
    var nameOffset, verOffset, ix;

    // In Opera, the true version is after "Opera" or after "Version" 
    if ((verOffset = nAgt.indexOf("Opera")) != -1) {
        jQuery.browser.opera = true;
        jQuery.browser.name = "Opera";
        jQuery.browser.fullVersion = nAgt.substring(verOffset + 6);
        if ((verOffset = nAgt.indexOf("Version")) != -1)
            jQuery.browser.fullVersion = nAgt.substring(verOffset + 8);
    }
        // In MSIE, the true version is after "MSIE" in userAgent 
    else if ((verOffset = nAgt.indexOf("MSIE")) != -1) {
        jQuery.browser.msie = true;
        jQuery.browser.name = "Microsoft Internet Explorer";
        jQuery.browser.fullVersion = nAgt.substring(verOffset + 5);
    }
        // In Chrome, the true version is after "Chrome" 
    else if ((verOffset = nAgt.indexOf("Chrome")) != -1) {
        jQuery.browser.webkit = true;
        jQuery.browser.name = "Chrome";
        jQuery.browser.fullVersion = nAgt.substring(verOffset + 7);
    }
        // In Safari, the true version is after "Safari" or after "Version" 
    else if ((verOffset = nAgt.indexOf("Safari")) != -1) {
        jQuery.browser.webkit = true;
        jQuery.browser.name = "Safari";
        jQuery.browser.fullVersion = nAgt.substring(verOffset + 7);
        if ((verOffset = nAgt.indexOf("Version")) != -1)
            jQuery.browser.fullVersion = nAgt.substring(verOffset + 8);
    }
        // In Firefox, the true version is after "Firefox" 
    else if ((verOffset = nAgt.indexOf("Firefox")) != -1) {
        jQuery.browser.mozilla = true;
        jQuery.browser.name = "Firefox";
        jQuery.browser.fullVersion = nAgt.substring(verOffset + 8);
    }
        // In most other browsers, "name/version" is at the end of userAgent 
    else if ((nameOffset = nAgt.lastIndexOf(' ') + 1) <
    (verOffset = nAgt.lastIndexOf('/'))) {
        jQuery.browser.name = nAgt.substring(nameOffset, verOffset);
        jQuery.browser.fullVersion = nAgt.substring(verOffset + 1);
        if (jQuery.browser.name.toLowerCase() == jQuery.browser.name.toUpperCase()) {
            jQuery.browser.name = navigator.appName;
        }
    }
    // trim the fullVersion string at semicolon/space if present 
    if ((ix = jQuery.browser.fullVersion.indexOf(";")) != -1)
        jQuery.browser.fullVersion = jQuery.browser.fullVersion.substring(0, ix);
    if ((ix = jQuery.browser.fullVersion.indexOf(" ")) != -1)
        jQuery.browser.fullVersion = jQuery.browser.fullVersion.substring(0, ix);

    jQuery.browser.majorVersion = parseInt('' + jQuery.browser.fullVersion, 10);
    if (isNaN(jQuery.browser.majorVersion)) {
        jQuery.browser.fullVersion = '' + parseFloat(navigator.appVersion);
        jQuery.browser.majorVersion = parseInt(navigator.appVersion, 10);
    }
    jQuery.browser.version = jQuery.browser.majorVersion;
})(jQuery);


function deepClone(obj) {
    var result, oClass = isClass(obj);
    //确定result的类型
    if (oClass === "Object") {
        result = {};
    } else if (oClass === "Array") {
        result = [];
    } else {
        return obj;
    }
    for (key in obj) {
        var copy = obj[key];
        if (isClass(copy) == "Object") {
            result[key] = arguments.callee(copy);//递归调用
        } else if (isClass(copy) == "Array") {
            result[key] = arguments.callee(copy);
        } else {
            result[key] = obj[key];
        }
    }
    return result;
}

function cloneJSON(obj){
    var sobj = JSON.stringify(obj);
    return JSON.parse(sobj)||{};
}

function isClass(o) {
    if (o === null) return "Null";
    if (o === undefined) return "Undefined";
    return Object.prototype.toString.call(o).slice(8, -1);
}

var DownLoadFile = function (options) {
    var config = $.extend(true, { method: 'post' }, options);
    var $iframe = $('<iframe id="down-file-iframe" />');
    var $form = $('<form target="down-file-iframe" method="' + config.method + '" />');
    $form.attr('action', config.url);
    for (var key in config.data) {
        $form.append("<input type='hidden' name='" + key + "' value='" + config.data[key] + "' />");
    }
    $iframe.append($form);
    $(document.body).append($iframe);
    $form[0].submit();
    $iframe.remove();
}

function getToday() {
    var month = "";
    if (((new Date()).getMonth() + 1) < 10) {
        month = "0" + ((new Date()).getMonth() + 1);
    } else {
        month = ((new Date()).getMonth() + 1);
    }
    return (new Date()).getFullYear() + "-" + month + "-" + (new Date()).getDate();
}


function ResetChartSize(parent, ele, chart) {
    var h = parent.clientHeight; //高度
    var w = parent.clientWidth;

    //alert('w='+w+'h='+h);
    ele.style.height = h + 'px';
    ele.style.width = w + 'px';
    chart.resize();
}
function closeWindows() {
    var browserName = navigator.appName;
    var browserVer = parseInt(navigator.appVersion);
    //alert(browserName + " : "+browserVer);

    //document.getElementById("flashContent").innerHTML = "<br>&nbsp;<font face='Arial' color='blue' size='2'><b> You have been logged out of the Game. Please Close Your Browser Window.</b></font>";

    if(browserName == "Microsoft Internet Explorer"){
        var ie7 = (document.all && !window.opera && window.XMLHttpRequest) ? true : false;
        if (ie7)
        {
            //This method is required to close a window without any prompt for IE7 & greater versions.
            window.open('','_parent','');
            window.close();
        }
        else
        {
            //This method is required to close a window without any prompt for IE6
            this.focus();
            self.opener = this;
            self.close();
        }
    }else{
        //For NON-IE Browsers except Firefox which doesnt support Auto Close
        try{
            this.focus();
            self.opener = this;
            self.close();
        }
        catch(e){

        }

        try{
            window.location.href="about:blank";
            window.close();
        }
        catch(e){

        }
    }
}

function DynamicBindForm(opt) {
    if(!opt.container)
    {
        throw "动态生成参数不对";
    }
    var result ={
        namekey:opt.Namekey?opt.Namekey:'name',
        valuekey:opt.Valuekey?opt.Valuekey:'value',
        container:opt.container,
        orginSources:[],
        itemrender:function (findex, field) {
            return field[this.namekey]+'：<input type="text" lm-text="'+field[this.namekey]+'" />';
        },
        rowrender:function (findex, field,lastrow) {
            return findex%2==0?$('<div></div>'):lastrow;
        },
        model:null,
        rerender:function (fields) {
            this.orginSources = fields;
            this.container.empty();
            var dynObj={};
            dynObj.name="Dynamic"+GUID();
            var lastrow=null;
            for(var i=0;i<this.orginSources.length;i++)
            {
                var crow = this.rowrender(i,this.orginSources[i],lastrow).append(this.itemrender(i,this.orginSources[i]));
                if(crow!=lastrow)
                {
                    if(lastrow!=null)
                    {
                        lastrow.appendTo(this.container);
                    }
                    lastrow = crow;
                }
                dynObj[this.orginSources[i][this.namekey]] = this.orginSources[i][this.valuekey];
            }
            if(lastrow!=null)
            {
                lastrow.appendTo(this.container);
            }
            this.container.attr(prefix+"controller",dynObj.name);
            var dynmodel = MVVM.define(dynObj);
            this.model = dynmodel;
            var tmpform = this;
            dynmodel.PropertyChanged=function (name,newvalue,oldvalue) {
                for(var i=0;i<tmpform.orginSources.length;i++)
                {
                    var cfiled = tmpform.orginSources[i];
                    if(cfiled[tmpform.namekey]==name)
                    {
                        cfiled[tmpform.valuekey]=newvalue;
                    }
                }
            }
            MVVM.scan(this.container.get(0),dynmodel);
            this.model = dynmodel;
        }
    };
    if(opt.itemrender)
    {
        result.itemrender=opt.itemrender;
    }
    if(opt.rowrender)
    {
        result.rowrender=opt.rowrender;
    }
    if(opt.Fields&&opt.Fields.length>0)
    {
        result.rerender(opt.Fields);
    }
    return result;
}

function ScrollSingle(ele){
    ele.each(

        function () {
            var eventType = 'mousewheel';
            // 火狐是DOMMouseScroll事件
            if (document.mozHidden !== undefined) {
                eventType = 'DOMMouseScroll';
            }
            $(this).on(eventType, function(event) {
                // 一些数据
                var scrollTop = this.scrollTop,
                    scrollHeight = this.scrollHeight,
                    height = this.clientHeight;

                var delta = (event.originalEvent.wheelDelta) ? event.originalEvent.wheelDelta : -(event.originalEvent.detail || 0);

                if ((delta > 0 && scrollTop <= delta) || (delta < 0 && scrollHeight - height - scrollTop <= -1 * delta)) {
                    // IE浏览器下滚动会跨越边界直接影响父级滚动，因此，临界时候手动边界滚动定位
                    this.scrollTop = delta > 0? 0: scrollHeight;
                    // 向上滚 || 向下滚
                    event.preventDefault();
                }
            });

        }
    );

}
