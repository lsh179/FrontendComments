//转换器
var Poster = {
    //模型转换字符串
    stringifyModel: function (jsonObj) {
        return JSON.stringify(jsonObj, function (k, v) {
            if (typeof v == "function")
                return v.toString();
            else
                return v;
        });
    },
    //字符串转回PostModel，如果是没有定义的类型 会返回普通object
    parsePostModel: function (jstr) {
        var obj = JSON.parse(jstr);
        console.log(obj._methodName);
        var model;

        for (var item in obj) {
            var v = obj[item];
            if (typeof v === 'string' && v.indexOf('function') == 0) {
                //查找fuction
                var bodyStart = v.indexOf('{');
                var bodyEnd = v.lastIndexOf('}');
                var bodyStr = v.substring(bodyStart + 1, bodyEnd);
                var argStart = v.indexOf('(');
                var argEnd = v.indexOf(')');
                var args = argEnd - argStart == 1 ? "" : v.substring(argStart + 1, argEnd);
                obj[item] = new Function(args, bodyStr);
            }
        }
        var constructorclass = obj["_constructorClass"];
        switch (constructorclass) {
            case 'ArgPostModel':
                model = new ArgPostModel(obj["_methodName"], obj["_paras"]);
                break;
            case 'EventPostModel':
                model = new EventPostModel(obj["_eventHandler"]);
                break;
            case 'InjectionPostModel':
                model = new InjectionPostModel(obj["_paras"]);
                break;
        }
        if (model) {
            for (var item in obj) {
                model[item] = obj[item];
            }
            return model;
        }
        else {
            return obj;
        }

    }
};
//基类，提供了构造方法的名称和域方法,提供一个回调参数
function PostModel(_consClass, _callbackfunc) {
    this._constructorClass = _consClass;
    this._callback = _callbackfunc;
    this.ConstructorClass = function () {
        return this._constructorClass;
    };
    this._scope;
    this.Scope = function (scope) {
        this._scope = scope;
    };
    this.ScopeSequence = function (scopeSqString) {
        var scopeArray = scopeSqString.split(".");
        var scopeLength = scopeArray.length;
        for (var i = 0; i < scopeLength - 1; i++) {
            if (this._scope) {
                this._scope = this._scope[scopeArray[i]];
            }
            else {
                this._scope = window[scopeArray[i]];
            }
        }
        return scopeArray[scopeLength - 1];
    }
};

//直接调用MapService方法参数组
function ArgPostModel(Method, ParametersArray, _callbackfunc) {
    PostModel.call(this, 'ArgPostModel', _callbackfunc);
    this._methodName = Method;
    this._paras = ParametersArray;
    this.MethodName = function () {
        return this._methodName;
    };
    this.Parameter = function (_p) {
        this._paras = _p;
    };
    this.Excute = function () {
        this._methodName = this.ScopeSequence(this._methodName);
        var _applyMethod = this._scope ? this._scope[this._methodName] : window[this._methodName];
        if (_applyMethod) {
            var callbackarg = _applyMethod.apply(this, this._paras);
            if (this._callback)
                this._callback(callbackarg);
        }
    };
};

//事件委托的参数列表由MapService提供，双方通过文档协议保持一致
function EventPostModel(_EventHandler, _excuteFunc) {
    PostModel.call(this, 'EventPostModel');
    this._eventHandler = _EventHandler;
    this._excuteFunction = _excuteFunc;
    this.Excute = function () {
        this._eventHandler = this.ScopeSequence(this._eventHandler);
        if (this._scope) {
            this._scope[this._eventHandler] = this._excuteFunction;
        }
        else {
            window[this._eventHandler] = this._excuteFunction;
        }
    };
};

//事件注入，由调用方编写的事件注入到MapService中执行,Parameters为Array
function InjectionPostModel(injectFunc, ParametersArray, _callbackfunc) {
    PostModel.call(this, 'InjectionPostModel', _callbackfunc);
    this._paras = ParametersArray;
    this._injectionFunction = injectFunc;
    this.Excute = function () {
        var callbackarg = this._injectionFunction.apply(this, this._paras);
        if (this._callback)
            this._callback(callbackarg);
    };
};


function WebViewInvokeModel(Method, Parameters) {
    PostModel.call(this, "WebViewInvokeModel");
    this._methodName = Method;
    this._paras = Parameters;
    this.Excute = function () {
        this._methodName = this.ScopeSequence(this._methodName);
        var _applyMethod = this._scope ? this._scope[this._methodName] : window[this._methodName];
        if (_applyMethod) {
            //if ((this._paras.startsWith("{") && this._paras.endsWith("}")) || (this._paras.startsWith("[") && this._paras.endsWith("]"))) {
            //    this._paras = JSON.parse(this._paras);
            //}
            if (this._paras)
            {
                this._paras = JSON.parse(this._paras);
            }
            else
            {
                this._paras = [this._paras];
            }
            var callbackarg = _applyMethod.apply(this, this._paras);
            return callbackarg;
        }
    };
}
function WebViewEventModel(Event, _webViewIndentify, _callBack) {
    PostModel.call(this, "WebViewEventModel");
    this._eventName = Event;
    this._wv_indentify = _webViewIndentify;
    this._callbackMethod = _callBack;
    this.Excute = function () {
        this._eventName = this.ScopeSequence(this._eventName);
        var _cln = this._callbackMethod;

        var webviewhandler = window[this._wv_indentify];
        if (webviewhandler) {
            if (this._scope) {
                this._scope[this._eventName] = function (eventResult) {
                    if (eventResult && typeof eventResult == "object") {
                        eventResult = JSON.stringify(eventResult);
                    }
                    webviewhandler[_cln](eventResult);
                };
            } else {
                window[this._eventName] = function (eventResult) {
                    if (eventResult && typeof eventResult == "object") {
                        eventResult = JSON.stringify(eventResult);
                    }
                    webviewhandler[_cln](eventResult);
                };
            }
        }
    };
}
//直接调用js方法的路径，Method为方法名，可以包含域，Argument为参数字符串
function WebViewInvoke(Method, Argument) {
    var pom = new WebViewInvokeModel(Method, Argument);
    return pom.Excute();
}
//带回调的调用js方法的路径，前两个参数与直接调用一致，_webViewIndentify为webview注册名，
//_callBack为回调函数名
//_callbackArgu 有3种取值，null为空，Invoke为js方法返回值，还可以传入自定义字符串，将原样传入_callBack
function WebViewInvokeCallBack(Method, Argument, _webViewIndentify, _callBack, _callbackArgu) {
    var rtv = WebViewInvoke(Method, Argument);
    if (rtv && typeof rtv == "object") {
        rtv = JSON.stringify(rtv);
    }
    var webviewhandler = window[_webViewIndentify];
    if (webviewhandler) {
        switch (_callbackArgu) {
            case 'null':
                webviewhandler[_callBack]();
                break;
            case 'Invoke':
                webviewhandler[_callBack](rtv);
                break;
            default:
                webviewhandler[_callBack](_callbackArgu);
                break;
        }
    }
}

function WebViewInvokeEvent(Event, _webViewIndentify, _callBack) {
    var eom = new WebViewEventModel(Event, _webViewIndentify, _callBack);
    eom.Excute();
}


//注册监听，用于捕获地图子窗口返回的消息
window.addEventListener('message', function (e) {
    var pm = Poster.parsePostModel(e.data);
    pm.Excute();
}, false);