/****************************************************************
 * 		 前端MVVM框架的实现
 *       DOM的处理前期全采用jQuery代替
 *****************************************************************/
var root = document.documentElement;
var Registry = {}; //将函数曝光到此对象上，方便访问器收集依赖
var prefix = 'lm-'; //命名私有前缀
var expose = Date.now();
var subscribers = prefix + expose;
var stopRepeatAssign = false;
var rchecktype = /^(?:array|object)$/i; //判断当前的类型只能是数组或者对象
var documentFragment = document.createDocumentFragment();

function noop() { }

MVVM = function () { };

var VMODELS = MVVM.vmodels = {};

MVVM.AopAction = { Before: 'Before', After: 'After', AfterAsync: "AfterAsync", Both: "Both" };

MVVM.AOP = function (vm, funcName, invokeFunc, actionType) {
    //if (MVVM.handlers == undefined) {
    //    MVVM.handlers = {};
    //}

    //if (MVVM.handlers[vm._id] == undefined) {
    //    MVVM.handlers[vm._id] = [];
    //}

    //MVVM.handlers[vm._id].push({
    //    vm: vm,
    //    handler: vm[funcName],
    //    invokeHandler: invokeFunc,
    //    AopAction: actionType
    //});

    if (typeof (vm) == 'function')
        vm = vm.prototype;

    if (typeof (vm[funcName]) != 'function')
        return;

    if (typeof (invokeFunc) != 'function')
        return;

    var target = vm[funcName];
    if (actionType == MVVM.AopAction.Before) {
        vm[funcName] = function () {
            var returnValue = invokeFunc.apply(this, arguments);
            var args = [];
            for (var i = 0; i < arguments.length; i++) {
                args.push(arguments[i]);
            }
            args.push(returnValue);
            return target.apply(this, args);
        }
    }
    else if (actionType == MVVM.AopAction.After) {
        vm[funcName] = function () {
            var returnValue = target.apply(this, arguments);
            invokeFunc.apply(this, arguments);
            return returnValue;
        }
    }
}

MVVM.AjaxAOP = function (vm, funcName, invokeFunc) {
    if (typeof (vm) == 'function')
        vm = vm.prototype;

    if (typeof (vm[funcName]) != 'function')
        return;

    if (typeof (invokeFunc) != 'function')
        return;

    var target = vm[funcName];
    vm[funcName] = function () {
        var promise = target.apply(this, arguments);
        if (promise != undefined && promise != null) {
            promise.then(invokeFunc);
        }
    }
}

MVVM.ResetAOP = function (vm, funcName) {
    vm[funcName] = vm._originalModel[funcName];
}

MVVM.executeAop = function (vmid, fn, aopAction) {
    if (MVVM.handlers != undefined && MVVM.handlers[vmid] != undefined) {
        for (var i = 0; i < MVVM.handlers[vmid].length; i++) {
            if (MVVM.handlers[vmid][i].handler === fn &&
            (MVVM.handlers[vmid][i].AopAction === aopAction ||
                MVVM.handlers[vmid][i].AopAction === MVVM.AopAction.Both)) {
                MVVM.handlers[vmid][i].invokeHandler.call(this, null);
            }
        }
    }
}

MVVM.define = function (scope) {
    //    var scope = {};
    //收集所有定义
    //    factory(scope);
    //生成带get set控制器与自定义事件能力的vm对象
    var model = modelFactory(scope);
    model.sp={};
    model.thisObj = model;
    //改变函数引用变成转化后vm对象,而不是scope对象
    stopRepeatAssign = true;
    //    factory(model)
    stopRepeatAssign = false;
    model._id = scope.name;
    model.currentObj = model;
    model.sprop=function (proname) {
        return this.orginSource[proname];
    };
    model.spropjson=function (proname) {
        var result = {};
        if(this.orginSource[proname].getJson){
           return this.orginSource[proname].getJson();
        }else {
            return this.orginSource[proname];
        }
    };

    model.prop=function (pname, obj) {
        if($.type(scope[pname])=== "object" )
        {
            for (var sk in  obj) {
                model.orginSource[pname][sk] = obj[sk];
            }
        }else {
            model[pname] = obj;
        }
    }
    for (var k in scope) {
        if($.type(scope[k])=== "function")
        {
            continue;
        }
        if($.type(scope[k])=== "object" )
        {
            model.sp[k]= model.orginSource[k];
            DefineSubObjprop(model,k);
        }
    }

    return VMODELS[scope.name] = model;
};

function DefineSubObjprop(model, propname) {
    Object.defineProperty(model,propname, {
        get: function() {
            if(model.orginSource)
            {
                return model.orginSource[propname];
            }
            return model[propname];
        },
        set: function(newValue) {
            if(model.prop)
            {
                model.prop(propname,newValue);
            }else {
                if(model.orginSource) {
                    for (var sk in  newValue) {
                        model.orginSource[propname][sk] = newValue[sk];
                    }
                }else {
                    for (var sk in  newValue) {
                        model[propname][sk] = newValue[sk];
                    }
                }
            }
        },
        enumerable: true,
        configurable: true
    });
}

//===============================================
//	数据源转化工厂,元数据转转成视图模型对象
//	对应多出
//	1 set/get方法
//	2 自定义事件能力
//================================================
function modelFactory(scope) {
    //复杂数据生成方式,Array/Object
    if ($.isArray(scope)) {
        var originalArr = scope.concat(); //原数组的作为新生成的监控数组的originalModel而存在
        scope.length = 0;
        var collection = new Collection(scope); //生成带控制的基本结构
        collection.push(originalArr);
        return collection;
    }

    var vmodel = {}, //转化后真正的视图模型对象
        originalModel = {}, //原始模型数据
        accessingProperties = {}, //监控属性,转化成set get访问控制器
        watchProperties = arguments[2] || {}, //强制要监听的属性
        normalProperties = {}; //普通属性
    vmodel.validate = function () {
        return false;
    }

    vmodel.orginSource =deepClone(scope);
    //分解创建句柄
    for (var k in scope) {
        parseModel(k,
            scope[k],
            originalModel,
            normalProperties,
            accessingProperties,
            watchProperties);
    }

    //转成访问控制器
    vmodel = Object.defineProperties(vmodel, withValue(accessingProperties));

    //没有转化的函数,混入到新的vm对象中
    for (var name in normalProperties) {
        vmodel[name] = normalProperties[name];
    }

    watchProperties.vmodel = vmodel;
    aaObserver.call(vmodel); //赋予自定义事件能力
    vmodel._id = generateID();
    vmodel._accessors = accessingProperties;
    vmodel._originalModel = originalModel; //原始值
    vmodel[subscribers] = [];
    vmodel.changed = function (e, model, propertyName) {
        if (e.target.type == "checkbox") {
            var str = "";
            $("input[name='" + e.currentTarget.name + "']").each(function (index, checkbox) {
                if ($(checkbox).is(':checked') == true) {
                    str += $(checkbox).val() + ",";
                }
            });

            if (str.length > 0 && (str.lastIndexOf(",") == str.length - 1)) {
                str = str.substr(0, str.length - 1);
            }
            model[propertyName] = str;
        }else if($(e.target).attr("contenteditable")){
            model[propertyName] = $(e.target).text();
        }
        else {
            model[propertyName] = $(e.target).val();
        }
    }

    vmodel.reset = function () {
        for (var property in this) {
            if (property === "_id") {
                continue;
            }

            if (jQuery.type(this[property]) === "array") {

            } else if (jQuery.type(this[property]) === "function") {

            } else if (jQuery.type(this[property]) === "string") {
                this[property] = "";
            } else if (jQuery.type(this[property]) === "boolean") {
                this[property] = false;
            } else if (jQuery.type(this[property]) === "number") {
                this[property] = 0;
            } else if (jQuery.type(this[property]) === "object") {
                this[property] = {};
            } else if (jQuery.type(this[property]) === "date") {
                this[property] = Date.now();
            }
        }
    }

    vmodel.set = function (obj) {
        for (var property in obj) {
            if (this.hasOwnProperty(property) === true) {
                this[property] = obj[property];
            }
        }
    }

    vmodel.getJson = function (exclude) {
        var json = {};
        var excludeprops = Str2List(this['excludeprops']);
        var jsonprops =  Str2List(this['jsonprops']);
        for (var property in this) {
            if (jQuery.type(this[property]) === "function"|| property === "jsonprops"|| property === "excludeprops"|| property === "children"|| property === "parentModel"|| property === "_originalModel"||property=="_id"||property=="currentObj"||property=="sp"||property=="orginSource"||property=="name" ||property.indexOf("lm-")==0 ||property=="_accessors" ||property=="thisObj" ) {
                continue;
            }
            if(excludeprops.length>0&&$.inArray(property,excludeprops)>=0)
            {
                continue;
            }
            if(jsonprops.length>0&&$.inArray(property,jsonprops)<0)
            {
                continue;
            }
            json[property] = this[property];
        }
        return json;
    }
    vmodel.ApplyProp=function (proname) {
        if(this._accessors[proname]&&this._accessors[proname].length>0)
        {
            notifySubscribers(this._accessors[proname]);
        }
    }
    originalModel.PropertyChanged = function (name,newvalue,oldvalue) {
        if(vmodel.PropertyChanged)
        {
            vmodel.PropertyChanged(name,newvalue,oldvalue);
        }
    }

    vmodel.leaveall=function () {
         if(vmodel.children)
         {
             for(var ci =0;ci<vmodel.children.length;ci++)
             {
                 if(ci.leaveall)
                 {
                     ci.leaveall();
                 }
                 if(ci.leave)
                 {
                     ci.leave();
                 }
             }
         }
    }

    vmodel.addmodel=function (model) {
        model.parentModel = this;
        if(!this.children)
        {
            this.children = [];
        }
        if($.inArray(model,this.children)<0)
        {
            this.children.push(model);
        }
    }
    return vmodel;
}

//解析模型,转化成对应的set/get处理方法
function parseModel(name,
    val,
    originalModel,
    normalProperties,
    accessingProperties,
    watchProperties) {
    //缓存原始值
    originalModel[name] = val;
    //得到值类型
    var valueType = $.type(val);
    //如果是函数，不用监控，意味着这是事件回调句柄
    if (valueType === 'function') {
        return normalProperties[name] = val;
    }
    //如果值类型是对象,并且有get方法,为计算属性
    if (valueType === "object" &&typeof val.get === "function" && Object.keys(val).length <= 2) {

    } else {
        //否则为监控属性
        var accessor = createAccessingProperties(valueType,
            originalModel,
            name,
            val,
            watchProperties);
    }
    //保存监控处理
    accessingProperties[name] = accessor;
}

//==================================================
//	创建监控属性或数组，自变量，由用户触发其改变
//	1 基本数据结构
//	2 数组结构
//	3 对象结构
//====================================================
function createAccessingProperties(valueType, originalModel, name, val, watchProperties) {
    var accessor = function (newValue) {
        var vmodel = watchProperties.vmodel;
        var preValue = originalModel[name];
        if (arguments.length) { //set
            if (stopRepeatAssign) {
                return; //阻止重复赋值
            }
            //确定是新设置值
            //if (!isEqual(preValue, newValue)) {
            originalModel[name] = newValue; //更新$model中的值
            //自身的依赖更新
            if(originalModel.PropertyChanged&&preValue!=newValue)
            {
                originalModel.PropertyChanged(name,newValue,preValue);
            }
            accessor.curElement = originalModel.curElement;
            notifySubscribers(accessor);
            delete accessor.curElement;
            delete originalModel.curElement;
            //}
        } else { //get
            collectSubscribers(accessor); //收集视图函数
            return accessor.$vmodel || preValue; //返回需要获取的值
        }
    };

    if (accessor[subscribers] == undefined) {
        accessor[subscribers] = [] //订阅者数组,保存所有的view依赖映射
    }

    //生成监控属性要区分内部值的类型
    if (rchecktype.test(valueType)) { //复杂数据,通过递归处理
        //复杂结构
        var complexValue = modelFactory(val, val);
        accessor._vmodel = complexValue;
        if(complexValue._model)
        {
            originalModel[name] = complexValue._model;
        }
    } else {
        //普通的基本类型
        originalModel[name] = val;
    }

    return accessor;
}


//通知依赖于这个访问器的订阅者更新自身
function notifySubscribers(accessor) {
    var list = accessor[subscribers];
    if (list && list.length) {
        var args = [].slice.call(arguments, 1)
        for (var i = list.length, fn; fn = list[--i];) {
            var el = fn.element;
            if(el==accessor.curElement)
            {
                continue;
            }
            //            var bindway = getBindWayInfo(el);
            //            if (el.type == "text" && (bindway == "v2m" || bindway == "all")) {
            fn.handler(fn.evaluator.apply(0, fn.args || []), el, fn);
            //            }
        }
    }
}


//收集依赖于这个访问器的订阅者
function collectSubscribers(accessor) {
    if (Registry[expose]) { //只有当注册了才收集
        var list = accessor[subscribers];
        list && ensure(list, Registry[expose]); //只有数组不存在此元素才push进去
    }
}

function ensure(target, item) {
    //只有当前数组不存在此元素时只添加它
    if (target.indexOf(item) === -1) {
        target.push(item);
    }
    return target;
}

//创建对象访问规则
function withValue(access) {
    var descriptors = {}
    for (var i in access) {
        descriptors[i] = {
            get: access[i],
            set: access[i],
            enumerable: true,
            configurable: true
        }
    }
    return descriptors;
}

function generateID() {
    return prefix +
        Math.random().toString(36).substring(2, 15) +
        Math.random().toString(36).substring(2, 15);
}

function parseExprProxy(code, scopes, data) {
    parseExpr(code, scopes, data);
    //如果存在求值函数
    if (data.evaluator) {
        //找到对应的处理句柄
        data.handler = bindingExecutors[data.type];
        data.evaluator.toString = function () {
            return data.type + " binding to eval(" + code + ")"
        }
        //方便调试
        //这里非常重要,我们通过判定视图刷新函数的element是否在DOM树决定
        //将它移出订阅者列表
        registerSubscriber(data);
    }
}

//生成求值函数与
//视图刷新函数
function parseExpr(code, scopes, data) {
    var dataType = data.type;
    var name = "vm" + expose;
    var prefix = "var " + data.value + " = " + name + "." + data.value;
    data.args = [scopes];
    //绑定类型
    if (dataType === 'linkto' || dataType === "container" || dataType == "loadHtml" || dataType == "deletethisnode") {
        code = "'" + data.value + "'";
        code = code.replace("(", ".call(this,");
        code = "\nreturn " + code + ";" //IE全家 Function("return ")出错，需要Function("return ;")
        var fn = Function.apply(noop, [name].concat("'use strict';\n" + code));
    } else if (dataType === 'click') {
        code = 'click'
        code = code.replace("(", ".call(this,");
        code = "\nreturn " + code + ";" //IE全家 Function("return ")出错，需要Function("return ;")
        var lastIndex = code.lastIndexOf("\nreturn")
        var header = code.slice(0, lastIndex)
        var footer = code.slice(lastIndex)
        code = header + "\nif(MVVM.openComputedCollect) return ;" + footer;
        var fn = Function.apply(noop, [name].concat("'use strict';\n" + prefix + ";" + code))
    } else {
        var code = "\nif(jQuery.type(" +
            data.value +
            ")=='function')\n  " +
            data.value +
            "['functionName']='" +
            data.value +
            "'; \nreturn " +
            data.value +
            ";";
        var fn = null;
        try {
            fn = Function.apply(noop, [name].concat("'use strict';\n" + prefix + ";" + code));
        } catch (e) {

        }
    }
    //生成求值函数
    data.evaluator = fn;
}

/*********************************************************************
 *                         依赖收集与触发                             *
 **********************************************************************/
function registerSubscriber(data) {
    Registry[expose] = data; //暴光此函数,方便collectSubscribers收集
    MVVM.openComputedCollect = true; //排除事件处理函数
    var fn = data.evaluator;
    if (fn) { //如果是求值函数
        var arg = data.args[0];
        //MVVM.executeAop(arg._id, fn.apply(0, data.args), MVVM.AopAction.Before);

        data.handler(fn.apply(0, data.args), data.element, data);

        //MVVM.executeAop(arg._id, fn.apply(0, data.args), MVVM.AopAction.After);
    }
    MVVM.openComputedCollect = false;
    delete Registry[expose];
}




var bindingHandlers = {
    css: function (data, vmodel) {
        var text = data.value.trim();
        data.handlerName = "attr"; //handleName用于处理多种绑定共用同一种bindingExecutor的情况
        parseExprProxy(text, vmodel, data);
    },
    click: function (data, vmodel) {
        var value = data.value;
        data.type = "on";
        data.hasArgs = void 0;
        data.handlerName = "on";
        parseExprProxy(value, vmodel, data);
    },
    change: function (data, vmodel) {
        var value = data.value;
        data.type = "on";
        data.hasArgs = void 0;
        data.handlerName = "on";
        parseExprProxy(value, vmodel, data);
    },
    text: function (data, vmodel) {
        parseExprProxy(data.value, vmodel, data);

        var newData = {};
        newData.args = data.args;
        newData.element = data.element;
        newData.name = prefix + "change";
        newData.type = "on";
        newData.hasArgs = void 0;
        newData.handlerName = "on";
        newData.value = "changed";
        newData.param = data.value;
        parseExprProxy(newData.value, vmodel, newData);
    },
    forjsons: function (data, vmodel) {
        var value = data.value;
        data.type = "forjsons";
        data.hasArgs = void 0;
        data.handlerName = "forjsons";
        parseExprProxy(value, vmodel, data);
    },
    foritems: function (data, vmodel) {
        var value = data.value;
        data.type = "foritems";
        data.hasArgs = void 0;
        data.handlerName = "foritems";
        parseExprProxy(value, vmodel, data);
    },
    subdomain: function (data, vmodel) {
        var value = data.value;
        data.type = "subdomain";
        data.hasArgs = void 0;
        data.handlerName = "subdomain";
        parseExprProxy(value, vmodel, data);
    },
    for: function (data, vmodel) {
        var value = data.value;
        data.type = "for";
        data.hasArgs = void 0;
        data.handlerName = "for";
        parseExprProxy(value, vmodel, data);
    },
    linkto: function (data, vmodel) {
        var value = data.value;
        data.type = "linkto";
        data.hasArgs = void 0;
        data.handlerName = "linkto";
        parseExprProxy(value, vmodel, data);
    },
    container: function (data, vmodel) {
        var value = data.value;
        data.type = "container";
        data.hasArgs = void 0;
        data.handlerName = "container";
        parseExprProxy(value, vmodel, data);
    },
    loadhtml: function (data, vmodel) {
        var value = data.value;
        data.type = "loadHtml";
        data.hasArgs = void 0;
        data.handlerName = "loadHtml";
        parseExprProxy(value, vmodel, data);
    },
    deletethisnode: function (data, vmodel) {
        var value = data.value;
        data.type = "deletethisnode";
        data.hasArgs = void 0;
        data.handlerName = "deletethisnode";
        parseExprProxy(value, vmodel, data);
    },
    vcase:function (data, vmodel) {
        if($(data.element).attr("vcaseexp"))
        {
          //  var text = data.value.trim();
            var texts = Str2List(data.value.trim());
            for(var j=0;j<texts.length;j++)
            {
                var ntext =texts[j];
                var ndata = $.extend({},data);
                ndata.type="vcase";
                ndata.value=ntext;
                parseExprProxy(ntext, vmodel, ndata);
            }
            $(data.element).removeAttr(prefix+"vcase");
            // data.type="vcase";
            // parseExprProxy(text, vmodel, data);
        }
    },
    ecase:function (data, vmodel) {
        if($(data.element).attr("ecaseexp"))
        {
            // var text = data.value.trim();
            // data.type="ecase";
            // parseExprProxy(text, vmodel, data);
            var texts = Str2List(data.value.trim());
            for(var j=0;j<texts.length;j++)
            {
                var ntext =texts[j];
                var ndata = $.extend({},data);
                ndata.type="ecase";
                ndata.value=ntext;
                parseExprProxy(ntext, vmodel, ndata);
            }
            $(data.element).removeAttr(prefix+"ecase");
        }
    },
    eon:function (data,vmodel) {
        var value = data.value;
        data.type = "eon";
        data.hasArgs = void 0;
        data.handlerName = "eon";
        parseExprProxy(value, vmodel, data);
    },
    rcase:function (data, vmodel) {
        if($(data.element).attr("rcaseexp"))
        {
            // var text = data.value.trim();
            // data.type="rcase";
            // parseExprProxy(text, vmodel, data);
            var texts = Str2List(data.value.trim());
            for(var j=0;j<texts.length;j++)
            {
                var ntext =texts[j];
                var ndata = $.extend({},data);
                ndata.type="rcase";
                ndata.value=ntext;
                parseExprProxy(ntext, vmodel, ndata);
            }
            $(data.element).removeAttr(prefix+"rcase");
        }
    }
}

//执行最终的处理代码
var bindingExecutors = {
    //修改css
    css: function (val, elem, data) {
        var method = data.type,
            attrName = data.param;
        $(elem).css(attrName, val);
    },
    on: function (val, elem, data) {
        var fn = data.evaluator;
        var args = data.args;
        var vmodels = data.vmodels;

        var callback = function (e) {
            e.stopPropagation();
            if(args[0]._originalModel)
            {
                args[0]._originalModel.curElement = elem;
            }
            if (e.currentTarget.type == "text" || e.currentTarget.type == "textarea") {
                setTimeout(function () {
                    var result = fn.apply(0, args).call(this, e, args[0], data.param);
                    //return result;
                }, 500);
            } else {
                var cobj=$.extend({},e);
                cobj.target=$(this)[0];
                var result = fn.apply(0, args).call(this,data.name==(prefix+"click")?cobj:e, args[0], data.param);
                //return result;
            }
        }

        var eventType = data.name.replace(prefix, "");
        if (eventType == "click") {
            elem.addEventListener('click', callback, false);
        } else if (eventType == "text" || eventType == "change") {
            var bindway = getBindWayInfo(elem);
            if (bindway == "all" || bindway == "v2m") {
                if (elem.type != undefined && elem.type == "radio") {
                 //   $("input[name='" + elem.name + "']").change(callback);
                    $(elem).change(callback);
                } else if (elem.type != undefined && elem.type == "checkbox") {
                    // $("input[name='" + elem.name + "']").change(callback);
                    $(elem).change(callback);
                } else if (elem.type != undefined && elem.type == "select-one") {
                    //$(elem).change(callback);
                    //elem.onchange = callback;
                    $(elem).change(function (e) {
                        callback(e);
                    });
                } if($(elem).attr("contenteditable")){
                    $(elem).blur(function (e) {
                        callback(e);
                    });
                } else {
                    var testinput = document.createElement('input');
                    $(elem).change(function (e) {
                        callback(e);
                    });
                    if(elem.type=='text'||elem.type=='textarea')
                    {
                        if ('oninput' in testinput) {
                            elem.addEventListener("input", callback, false);
                        } else {
                            elem.onpropertychange = callback;
                        }
                    }
                }
            }
        }

        data.evaluator = data.handler = noop;
    },
    eon:function (val, elem, data) {
        var fn = data.evaluator;
        var args = data.args;
        var callback = function (e) {
                e.stopPropagation();
                var cobj=$.extend({},e);
                cobj.target=$(this)[0];
                fn.apply(0, args).call(this,cobj, args[0], data.param);
        }
        var eventType = data.name.replace(prefix+"eon-", "");
        if(eventType)
        {
            elem.addEventListener(eventType, callback, false);
        }
    },
    text: function (val, elem, data) {
        var bindway = getBindWayInfo(elem);
        if (bindway == "all" || bindway == "m2v") {
            if (data.nodeType === 3) {
                data.node.data = val;
            } else {
                if (elem.type == "select-one") {
                    $(elem).val(val);
                    $(elem).data("selectvalue",val);
                    try {
                        $(elem).trigger("lmschange");
                    }catch (error){
                    }
                }
                 else if (elem.type == "radio") {
                    // $("input[name='" + elem.name + "']")
                    //     .each(function (index, radio) {
                    //         if ($(radio).val() == val) {
                    //             $(radio).prop("checked", true);
                    //         } else {
                    //             $(radio).prop("checked", false);
                    //         }
                    //     });
                    if ($(elem).val() == val) {
                            $(elem).prop("checked", true);
                     } else {
                            $(elem).prop("checked", false);
                    }
                } else if (elem.type == "checkbox") {
                    // $("input[name='" + elem.name + "']")
                    //     .each(function (index, checkbox) {
                    //         if ($(checkbox).val() == val ||
                    //             (","+val + ",").indexOf(","+$(checkbox).val()+",") >= 0) {
                    //             $(checkbox).prop("checked", true);
                    //         } else {
                    //             $(checkbox).prop("checked", false);
                    //         }
                    //         if($(checkbox).data("ccontent"))
                    //         {
                    //             $(checkbox).data("ccontent").Reset();
                    //         }
                    //     });
                    if ($(elem).val() == val || (","+val + ",").indexOf(","+$(elem).val()+",") >= 0) {
                        $(elem).prop("checked", true);
                    } else {
                        $(elem).prop("checked", false);
                    }
                } else if (elem.type == "text" || elem.type == "textarea") {
                    $(elem).val(val);
                } else {
                    $(elem).text(val);
                }
            }
        }
    },
    forjsons: function (val, elem, data) {
        var fn = data.evaluator;
        var args = data.args;
        var result = fn.apply(0, args);
        createForJsonsNodes(elem, result, data);
        MVVM.scan(data.parentElement, data.args[0]);
    },
    foritems: function (val, elem, data) {
        var fn = data.evaluator;
        var args = data.args;
        var result = fn.apply(0, args);
        createForItemsNodes(elem, result, data);
    },
    subdomain: function (val, elem, data) {
        var subpname = data.value;
        if(data.args[0].orginSource[subpname]&&(!data.args[0].orginSource[subpname].name|| data.args[0].orginSource[subpname].name.indexOf("lmsubdomain"+data.args[0].name)<0))
        {
            MVVM.openComputedCollect = false;
            delete Registry[expose];
            data.args[0].orginSource[subpname].name= "lmsubdomain"+data.args[0].name+subpname+Date.now();
            $(elem).attr(prefix+"controller", data.args[0].orginSource[subpname].name);
            $(elem).removeAttr(prefix+"subdomain");
            data.args[0].sp[subpname]= data.args[0].orginSource[subpname]=MVVM.define(data.args[0].orginSource[subpname]);
            data.args[0].addmodel(data.args[0].sp[subpname]);
            MVVM.scan(elem,data.args[0].orginSource[subpname]);
        }else{
            if(data.args[0].orginSource[subpname]&& data.args[0].orginSource[subpname].name&&data.args[0].orginSource[subpname].name.indexOf("lmsubdomain"+data.args[0].name)>=0)
            {
                MVVM.openComputedCollect = false;
                delete Registry[expose];
                $(elem).attr(prefix+"controller", data.args[0].orginSource[subpname].name);
                $(elem).removeAttr(prefix+"subdomain");
                MVVM.scan(elem,data.args[0].orginSource[subpname]);
            }
        }
    },
    for: function (val, elem, data) {
        var fn = data.evaluator;
        var args = data.args;
        var result = fn.apply(0, args);
        createForNodes(elem, result, data);
    },
    linkto: function (val, elem, data) {
        if (val == "") {
            return;
        }

        var args = data.args;
        var name = val;
        var element = elem;
        var key = Date.now();

        var func = gunplaCore.getFunction(val);
        var functionIndex = findWordStartIndex("function", func);
        var funcName = "";
        if (functionIndex >= 0) {
            func = func.substr(functionIndex + 8, func.length - (functionIndex + 8));
            var index = func.indexOf("(");
            funcName = func.substr(0, index);
            funcName = funcName + key;
            func = '<script type="text/javascript"> function ' +
                funcName +
                func.substr(index, func.length - index) +
                "</script>";
        } else {
            func = '<script type="text/javascript">' + func +
                 "</script>";
        }

        key = Date.now();
        var executefun = gunplaCore.getExecuteFun(val);
        functionIndex = findWordStartIndex("function", executefun);
        var executefunName = "";
        if (functionIndex >= 0) {
            executefun = executefun.substr(functionIndex + 8, executefun.length - (functionIndex + 8));
            var index = executefun.indexOf("(");
            executefunName = executefun.substr(0, index);
            executefunName = executefunName + key;
            executefun = '<script type="text/javascript"> function ' +
                executefunName +
                executefun.substr(index, executefun.length - index) +
                "</script>";
        } else {
            executefun = '<script type="text/javascript">' + executefun +
                 "</script>";
        }

        key = Date.now();
        var model = gunplaCore.getModel(val);
        var varIndex = findWordStartIndex("var", model);
        var equalIndex = findWordStartIndex("=", model);
        var varName = model.substr(varIndex + 3, equalIndex - (varIndex + 3));
        varName = varName.trimRight() + key;
        model = model.substr(0, varIndex + 3) + varName + model.substr(equalIndex, model.length - equalIndex);
        var guid = (new GUID()).newGUID();
        model += varName + '.container=$("[guid=\'' + guid + '\']")';

        var key = "currentName" + expose;
        model = '<script type="text/javascript" ' + key + '="' + name + '" executeEveryfun="' + executefunName + '(' + varName + ')' + '"> ' + model + "</script>";
        if (funcName != "") {
            model += '<script type="text/javascript"> ' + funcName + "(" + varName + ")" + "</script>";
        }

        var view = gunplaCore.getView(val);
        var template = func + model + view + executefun;
        args[0][subscribers + "-" + name] = template;
        var callback = function (e) {
            var containerid = $(element).attr("containerid");

            if (containerid == undefined)
                return;

            var ismultidialog = $("#" + containerid).attr("ismultidialog");
            var isclonenode = $("#" + containerid).attr("isclonenode");
            $(document.getElementById(containerid).parentElement).find("[id='" + containerid + "']").each(function () {
                $(this).css("z-index", 0);

                if (ismultidialog != "true" && $(this).attr("moduleName")) {
                    $(this).remove();
                }
            });

            var container = null;
            if (isclonenode == "false") {
                container = document.getElementById(containerid);
            } else {
                //container = $(document.getElementById(containerid).parentElement).find("[moduleName='" + name + "']");
                //$(container).remove();
                container = document.getElementById(containerid).cloneNode();
                $(container).attr("moduleName", name);
                $(container).attr("guid", guid);
                $(container).attr("isModuleContainer", true);
                $(container).appendTo(document.getElementById(containerid).parentElement);
                $(container).show();
            }

            var isExist = false;
            var key = "currentName" + expose;
            var everyFunc = "";
            for (var i = 0; i < container.childNodes.length; i++) {
                if ($(container.childNodes[i]).attr(key) == name) {
                    if (container.childNodes[i].type != "text/javascript" && container.childNodes[i].type != "text/css") {
                        $(container.childNodes[i]).show();
                    } else if (container.childNodes[i].type == "text/javascript") {
                        if ($(container.childNodes[i]).attr("executeEveryfun")) {
                            everyFunc = $(container.childNodes[i]).attr("executeEveryfun");
                        }
                    }
                    isExist = true;
                } else {
                    $(container.childNodes[i]).hide();
                }
            }

            if (isExist == false) {
                var temp = document.createElement('div');
                $(template).appendTo(temp);
                for (var i = 0; i < temp.children.length; i++) {
                    $(temp.children[i]).attr(key, name);
                }

                var str = "";
                for (var i = 0; i < temp.children.length; i++) {
                    str += temp.children[i].outerHTML;
                }

                $(str).appendTo(container);
                try {
                    $('<script type="text/javascript"> ' + executefunName + "(" + varName + ")" + "</script>").appendTo(container);
                } catch (e) {

                }

            } else {
                try {
                    $('<script type="text/javascript"> ' + everyFunc + "</script>").appendTo(container);
                } catch (e) {

                }
            }
            MVVM.scan();
        }

        $(elem).attr('href', '#');
        elem.addEventListener('click', callback, false);
    },
    container: function (val, elem, data) {
        var args = data.args;
        args[0][subscribers + "-" + "container"] = elem;
    },
    loadHtml: function (val, elem, data) {
        var template = gunplaCore.getView(val);
        $(template).appendTo(elem);
    },
    deletethisnode: function (val, elem, data) {
        if (val == "true" || val == true) {
            $(elem).remove();
        }
    },
    vcase: function (val, elem, data) {
        var model = data.args[0];
        try {
            delete Registry[expose];
            if (eval("model." +evalexpression($(elem).attr("vcaseexp")))) {
                $(elem).show();
            }else {
                $(elem).hide();
            }
        } catch (e) {
        }
    },
    ecase: function (val, elem, data) {
        var model = data.args[0];
        try {
            delete Registry[expose];
            if (eval("model." +evalexpression($(elem).attr("ecaseexp")))) {
                $(elem).attr("disabled",false);
            }else {
                $(elem).attr("disabled",true);
            }
        } catch (e) {
        }
    },
    rcase: function (val, elem, data) {
        var model = data.args[0];
        try {
            delete Registry[expose];
            if (eval("model." +evalexpression($(elem).attr("rcaseexp")))) {
                $(elem).attr("readonly",false);
            }else {
                $(elem).attr("readonly",true);
            }
        } catch (e) {
        }
    }
}

function evalexpression(orginexp,replacename) {
    if(!replacename)
    {
        replacename='model';
    }
    var newexp = orginexp.replace(/\$model\$./g,replacename+'.');
    if(newexp.startWith(replacename+'.'))
    {
        return newexp.substr((replacename+'.').length);
    }
    return newexp;
}

function recursiveNode(node) {
    if (node.type == "select-one") {

    }
}

//根据数组及html上的索引替换相应值
function createForNodes(node, array, data) {
    var changedHandler = node.onchange;

    if (data.modelNode == undefined) {
        data.parentElement = node.parentElement;
        data.modelNode = node.cloneNode(true);
    }

    var oldNode = node;
    //data.parentElement.removeChild(node);
    var temp = data.modelNode.cloneNode(true);
    $(node).empty();
    for (var i = 0; i < temp.children.length; i++) {
        node.appendChild(temp.children[i].cloneNode(true));
    }

    //node.onchange = changedHandler;

    if (data.args != undefined && data.args != null && data.args.length > 0) {
        for (var i = 0; i < data.args.length; i++) {
            for (var property in data.args[i]._accessors) {
                if (data.args[i]._accessors[property][subscribers] != undefined &&
                    data.args[i]._accessors[property][subscribers] != null &&
                    data.args[i]._accessors[property][subscribers].length > 0) {
                    for (var j = 0; j < data.args[i]._accessors[property][subscribers].length; j++) {
                        if (oldNode == data.args[i]._accessors[property][subscribers][j].element) {
                            data.args[i]._accessors[property][subscribers][j].element = node;
                        }
                    }
                }
            }
        }
    }

    //data.parentElement.appendChild(node);
    data.element = node;

    node.removeAttribute(data.name);
    scanNodeAndReplace(node, array, data);
}

//扫描用数组值填充的节点的{{}}文本进行替换
function scanNodeAndReplace(node, array, data) {
    if (node.childNodes != undefined) {
        for (var i = 0; i < node.childNodes.length; i++) {
            var childNode = node.childNodes[i];
            MVVM.scan(childNode, data.args[0]);

            if (childNode.nodeType === 3) {
                var tokens = tokenize(childNode.data);
                var str = "";
                for (var j = 0; j < tokens.length; j++) {
                    if (tokens[j].expr == false) {
                        str += tokens[j].value;
                    } else {
                        str += array[tokens[j].value.trim()];
                    }
                }
                childNode.data = (str);
            } else {
                scanNodeAndReplace(childNode, array, data);
                scanNodeAttributesAndReplace(childNode, array);
            }
        }
    }
}

//获取绑定信息
function getBindWayInfo(elem) {
    var attributes = elem.attributes;
    if (attributes != undefined) {
        for (var i = 0; i < attributes.length; i++) {
            var name = attributes[i].name;
            if (name.indexOf(prefix + "bindway") >= 0) {
                return attributes[i].value;
            }
        }
    }

    return "all";
}

//根据Josn数组和模板复制生成节点
function createForJsonsNodes(node, array, data) {
    var orginvalue = null;
    if(node.parentElement && node.parentElement.type && node.parentElement.type == "select-one")
    {
        orginvalue = $(node.parentElement).val();
        if(!orginvalue&&$(node.parentElement).data("selectvalue"))
        {
            orginvalue = $(node.parentElement).data("selectvalue");
        }
    }
    if(data.parentElement && data.parentElement.type && data.parentElement.type == "select-one")
    {
        orginvalue = $(data.parentElement).val();
        if(!orginvalue&&$(data.parentElement).data("selectvalue"))
        {
            orginvalue = $(data.parentElement).data("selectvalue");
        }
    }
    if (data.modelNode == undefined) {
        data.modelNode = getModelNode(node);
        data.modelNode2 = [];
        for (var i = 0; i < data.modelNode.length; i++) {
            data.modelNode2.push(data.modelNode[i].cloneNode(true));
        }

        data.parentElement = node.parentElement;
        for (var i = data.modelNode.length - 1; i >= 0; i--) {
            data.parentElement.removeChild(data.modelNode[i]);
        }

        data.modelNode = data.modelNode2;
    }
    clearNodeAdded(data.parentElement);

    if (array != undefined && array != null) {
        for (var i = 0; i < array.length; i++) {
            var tempModelNode = getUseModelNode(data.modelNode, array[i], i, array.length);
            var newNode = tempModelNode.cloneNode(true);
            if (newNode.getAttribute(prefix + "forjsons")) {
                newNode.removeAttribute(data.name);
                newNode.removeAttribute(prefix + "forjsons");
            }
            scanChildNodeForJsonsAttr(newNode, array[i], data);
            data.parentElement.appendChild(newNode);
            newNode.removeAttribute(data.name);
            newNode.removeAttribute(prefix + "forjsons");
            scanJsonsNodeAndReplace(newNode, array[i]);
            if (data.args != undefined) {
                MVVM.scan(newNode, array[i]);
            }
        }
    }

    if(data.parentElement && data.parentElement.type && data.parentElement.type == "select-one")
    {
        $(data.parentElement).val(orginvalue);
    }
    for (var i = 0; i <= data.modelNode.length - 1; i++) {
        if($(data.modelNode[i]).attr("mconstnode"))
        {
            var newNode2 = data.modelNode[i].cloneNode(true);
            data.parentElement.appendChild(newNode2);
            MVVM.scan(newNode2,data.args[0]);
        }
    }
    $(data.parentElement).trigger("lmsoptchange");
}
//根据Josn数组和模板复制生成节点
function createForItemsNodes(node, array, data) {
    var orginvalue = null;
    if(node.parentElement && node.parentElement.type && node.parentElement.type == "select-one")
    {
        orginvalue = $(node.parentElement).val();
        if(!orginvalue&&$(node.parentElement).data("selectvalue"))
        {
            orginvalue = $(node.parentElement).data("selectvalue");
        }
    }
    if(data.parentElement && data.parentElement.type && data.parentElement.type == "select-one")
    {
        orginvalue = $(data.parentElement).val();
        if(!orginvalue&&$(data.parentElement).data("selectvalue"))
        {
            orginvalue = $(data.parentElement).data("selectvalue");
        }
    }
    if (data.modelNode == undefined) {
        data.modelNode = getModelNode(node);
        data.modelNode2 = [];
        for (var i = 0; i < data.modelNode.length; i++) {
            data.modelNode2.push(data.modelNode[i].cloneNode(true));
        }

        data.parentElement = node.parentElement;
        for (var i = data.modelNode.length - 1; i >= 0; i--) {
            data.parentElement.removeChild(data.modelNode[i]);
        }

        data.modelNode = data.modelNode2;
    }
    clearNodeAdded(data.parentElement);

    if (array != undefined && array != null) {
        for (var i = 0; i < array.length; i++) {
            var tempModelNode = getUseModelNode(data.modelNode, array[i], i, array.length);
            var newNode = $($(tempModelNode.cloneNode(true)).prop("outerHTML").replace(/\{\{value\}\}/g,array[i]).replace(/lmsrc/g,"src").replace(/lmsrc/g,"href"));
            $(data.parentElement).append(newNode);
            newNode.removeAttr(data.name);
            newNode.removeAttr(prefix + "foritems");
            if (data.args != undefined) {
                MVVM.scan(newNode[0], array[i]);
            }
        }
    }
    if(data.parentElement && data.parentElement.type && data.parentElement.type == "select-one")
    {
        $(data.parentElement).val(orginvalue);
    }
    for (var i = 0; i <= data.modelNode.length - 1; i++) {
        if($(data.modelNode[i]).attr("mconstnode"))
        {
            var newNode2 = data.modelNode[i].cloneNode(true);
            data.parentElement.appendChild(newNode2);
            MVVM.scan(newNode2,data.args[0]);
        }
    }
    $(data.parentElement).trigger("lmsoptchange");
}

function getUseModelNode(modelNodes, model, arrayIndex, arrayLength) {
    for (var i = 0; i < modelNodes.length; i++) {
        if (modelNodes[i].getAttribute(prefix + "index")) {
            if (modelNodes[i].getAttribute(prefix + "index") == arrayIndex) {
                return modelNodes[i];
            }
        }
        else if (modelNodes[i].getAttribute(prefix + "islastitem")) {
            if (modelNodes[i].getAttribute(prefix + "islastitem") == "true" && arrayIndex == (arrayLength - 1)) {
                return modelNodes[i];
            }
            else if (modelNodes[i].getAttribute(prefix + "islastitem") == "false" && arrayIndex < (arrayLength - 1)) {
                return modelNodes[i];
            }
        }
        else if (modelNodes[i].getAttribute(prefix + "if")) {
            try {
                if (eval("model." + evalexpression(modelNodes[i].getAttribute(prefix + "if")))) {
                    return modelNodes[i];
                }
            } catch (e) {
                continue;
            }
        }
        else if (modelNodes[i].getAttribute(prefix + "case")) {
            try {
                if (eval("model." + evalexpression(modelNodes[i].getAttribute(prefix + "case")))) {
                    return modelNodes[i];
                }
            } catch (e) {
                continue;
            }
        } else {
            return modelNodes[i];
        }
    }

    return null;
}

function getModelNode(node) {
    var modelNodes = [];
    var index = 0;
    for (var i = 0; i < node.parentNode.children.length; i++) {
        if (node.parentNode.children[i] == node) {
            index = i;
            break;
        }
    }

    for (var i = index; i < node.parentNode.children.length; i++) {
        if($(node.parentNode.children[i]).attr("constnode"))
        {
            $(node.parentNode.children[i]).removeAttr("constnode")
            $(node.parentNode.children[i]).attr("mconstnode",true);
        }
        modelNodes.push(node.parentNode.children[i]);
    }

    return modelNodes;
}

function scanChildNodeForJsonsAttr(newNode, array, data) {
    if (newNode.getAttribute(prefix + "forjsons")) {
        var attributeValue = newNode.getAttribute(prefix + "forjsons");
        newNode.removeAttribute(prefix + "forjsons");
        var tempData = {};
        for (var p in data) {
            if (p != "modelNode" && p != "modelNode2") {
                tempData[p] = data[p];
            }
        }
        tempData.element = newNode;
        tempData.value = attributeValue;
        createForJsonsNodes(newNode, array[attributeValue], tempData);
    }
    for (var i = 0; i < newNode.children.length; i++) {
        scanChildNodeForJsonsAttr(newNode.children[i], array, data);
    }
}

//扫描用数组值填充的节点中attribute的{{}}文本进行替换
function scanNodeAttributesAndReplace(node, array) {
    var attributes = node.attributes;
    if (attributes != undefined) {
        for (var i = 0; i < attributes.length; i++) {
            var value = attributes[i].value;
            var tokens = tokenize(value);
            var str = "";
            for (var j = 0; j < tokens.length; j++) {
                if (tokens[j].expr == false) {
                    str += tokens[j].value;
                } else {
                    str += array[tokens[j].value.trim()];
                }
            }
            attributes[i].value = (str);
            if(attributes[i].name=='lmstyle')
            {
                $(node).attr("style",(str));
            }
            if(attributes[i].name=='lmsrc')
            {
                $(node).attr("src",(str));
            }

            var name = attributes[i].name;
            if (name.indexOf("{{") >= 0 && name.indexOf("}}") >= 0) {
                tokens = tokenize(name);
                str = "";
                for (var j = 0; j < tokens.length; j++) {
                    if (tokens[j].expr == false) {
                        str += tokens[j].value;
                    } else {
                        str += array[tokens[j].value.trim()];
                    }
                }
                node.removeAttribute(name);
                if (str != "") {
                    node.setAttribute(str, null);
                }
            }
        }
    }
}

//清空已添加的节点
function clearNodeAdded(parentElement) {
    for (var i = parentElement.childNodes.length - 1; i >= 0; i--) {
        if($(parentElement.childNodes[i]).attr("constnode"))
        {
            continue;
        }else {
            parentElement.removeChild(parentElement.childNodes[i]);
        }
    }
}

//扫描用json进行填充的节点的{{}}文本进行替换
function scanJsonsNodeAndReplace(node, objData) {
    if (node.childNodes != undefined) {
        for (var i = 0; i < node.childNodes.length; i++) {
            var childNode = node.childNodes[i];
            if (childNode.nodeType === 3) {
                var tokens = tokenize(childNode.data);
                var str = "";
                for (var j = 0; j < tokens.length; j++) {
                    if (tokens[j].expr == false) {
                        if (tokens[j].value == null) {
                            str += "";
                        } else {
                            str += tokens[j].value;
                        }
                    } else {
                        if (objData[tokens[j].value.trim()] ) {
                            str += objData[tokens[j].value.trim()];
                        } else {
                            if(tokens[j].value=='value')
                            {
                                str += "{{value}}";
                            }else {
                                str += "";
                            }
                        }
                    }
                }
                childNode.data = (str);
            } else {
                scanJsonsNodeAndReplace(childNode, objData);
                scanNodeAttributesAndReplace(childNode, objData);
            }
        }
    }
    scanNodeAttributesAndReplace(node, objData);
}

var isEqual = Object.is ||
    function (v1, v2) {
        if (v1 === 0 && v2 === 0) {
            return 1 / v1 === 1 / v2
        } else if (v1 !== v1) {
            return v2 !== v2
        } else {
            return v1 === v2;
        }
    }


function isClass(o) {
    if (o === null) return "Null";
    if (o === undefined) return "Undefined";
    return Object.prototype.toString.call(o).slice(8, -1);
}

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
            result[key] = arguments.callee(copy); //递归调用
        } else if (isClass(copy) == "Array") {
            result[key] = arguments.callee(copy);
        } else {
            result[key] = obj[key];
        }
    }
    return result;
}

function isIE() { //ie?
    if (!!window.ActiveXObject || "ActiveXObject" in window)
        return true;
    else
        return false;
}

if (String.prototype.trimLeft == undefined) {
    String.prototype.trimLeft = function () {
        return this.replace(/(^\s*)/g, "");
    }
}

if (String.prototype.trimRight == undefined) {
    String.prototype.trimRight = function () {
        return this.replace(/(\s*$)/g, "");
    }
}

function findWordStartIndex(word, content) {
    var sections = content.split("\n");
    var count = 0;
    var isStartNote = false;
    for (var i = 0; i < sections.length; i++) {
        if (sections[i].trimLeft().startWith("//")) {
            count += sections[i].length + 1;
            continue;
        } else if (sections[i] != "/*/" && sections[i].trimLeft().startWith("/*") && sections[i].trimRight().endWith("*/")) {
            count += sections[i].length + 1;
            continue;
        }
        else if (sections[i].indexOf(word) < 0) {
            count += sections[i].length + 1;
            continue;
        } else {
            var indexInSection = sections[i].indexOf(word);
            count += indexInSection;
            return count;
        }
    }
}

String.prototype.startWith = function (compareStr) {
    return this.indexOf(compareStr) == 0;
}

String.prototype.endWith = function (compareStr) {
    return this.indexOf(compareStr) == (this.length - compareStr.length);
}

//同一个容器DIV里模块切换
function ShowModuleInContainer(moduleName, containerId) {
    var container = document.getElementById(containerId);
    //$(container).show();
    if (container != null) {
        var key = "currentName" + expose;
        var isExist = false;
        for (var i = 0; i < container.childNodes.length; i++) {
            if ($(container.childNodes[i]).attr(key) == moduleName) {
                if (container.childNodes[i].type != "text/javascript" && container.childNodes[i].type != "text/css") {
                    $(container.childNodes[i]).show();
                }
                isExist = true;
            }
        }

        if (isExist == false) {
            var id = Date.now();
            $("<div id='" + id + "' style='display:none' lm-linkto='" + moduleName + "' containerid='" + containerId + "'>").appendTo(document.body);
            MVVM.scan();
            $("#" + id).trigger("click");
        } else {
            var executeEveryfun = "";
            for (var i = 0; i < container.childNodes.length; i++) {
                if ($(container.childNodes[i]).attr(key) == moduleName) {
                    if (container.childNodes[i].type != "text/javascript" && container.childNodes[i].type != "text/css") {
                        $(container.childNodes[i]).show();
                    }

                    if ($(container.childNodes[i]).attr("executeEveryfun")) {
                        executeEveryfun = $(container.childNodes[i]).attr("executeEveryfun");
                    }
                } else {
                    $(container.childNodes[i]).hide();
                }
            }

            if (executeEveryfun != "") {
                $('<script type="text/javascript"> ' + executeEveryfun + "</script>").appendTo(container);
            }
        }
    }
}