/**
 * Created by Lsh179 on 2017/9/18.
 */
function InitElementDic(Obj) {
    //是否为Json对象或者数组对象
    if (isJsonObj(Obj) || isArray(Obj)) {
        //判断Json对象是否为叶子级别
        if (Obj.hasOwnProperty('ID')) {
            PageModel.Model[Obj['ID']] = Obj;
        }
        //对其子项进行递归处理
        for (var item in Obj) {
            InitElementDic(Obj[item]);
        }
    }
}

var PageModel = {
    Model: {}
};

PageModel.Get = function (key) {
    return PageModel.Model[key];
};

PageModel.Add = function (key, mdl) {
    PageModel.Model[key] = mdl;
};
// var a = [{id:"2016",totalnum:"123"}];
// a["2016"]

PageModel.SetArray = function (key, mdls, idkey) {
    var narray = [];
    if (!idkey) {
        idkey = "id";
    }
    for (var i = 0; i < mdls.length; i++) {
        var value = deepClone(mdls[i]);
        narray.push(value);
        if (mdls[i][idkey]) {
            narray[mdls[i][idkey]] = value;
        }
    }
    PageModel.Model[key] = narray;
    return PageModel.Model[key];
};

PageModel.Add_Index= function (key, mdls, idkey) {
    var narray = [];
    if (!idkey) {
        idkey = "id";
    }
    for (var i = 0; i < mdls.length; i++) {
        if (mdls[i][idkey]) {
            narray[mdls[i][idkey]] = i;
        }
    }
    PageModel.Model[key] = mdls;
    PageModel.Model[key+'index'] = narray;
    return PageModel.Model[key];
};

PageModel.GetAItem=function (key,id,index) {
    if(index)
    {
        return PageModel.Model[key][index];
    }
    return PageModel.Model[key][PageModel.Model[key+'index'][id]];
}
PageModel.SetAItem=function (key,id,value,index) {
    if(index)
    {
        PageModel.Model[key][index];
        return true;
    }
     PageModel.Model[key][PageModel.Model[key+'index'][id]]=value;
     return true;
}
PageModel.RemoveAItem=function (key,id,index,idkey) {
    if(index)
    {
        PageModel.Model[key].slice(index,1);
        PageModel.Add_Index(key,PageModel.Model[key],idkey);
        return true;
    }
     PageModel.Model[key].slice(PageModel.Model[key+'index'][id],1);
     PageModel.Add_Index(key,PageModel.Model[key],idkey);
     return true;
}



PageModel.MapAction = function (container, action, paras, completeMethod, completed) {

    var frame = window.frames[0];
    if (container && container.find("iframe").length > 0) {
        var findex = container.find("iframe:first").attr("frameindex");
        frame = window.frames[findex];
    }
    if(!container)
    {
        container=$(document);
    }
    var gid = container.find("iframe:first").attr("id");
    if (gid && !PageModel.Get("FrameLoadinfo")[gid]) {
        setTimeout(function () {
            PageModel.MapAction(container, action, paras, completeMethod, completed);
        }, 500);
        return;
    }
    if (completed) {
        PageModel.MapActionCompleted = completed;
    }
    if (completeMethod) {
        var listner = new EventPostModel(completeMethod, function () {
            try {
                var rpara = [];
                for (var i = 0; i < arguments.length; i++) {
                    rpara.push(arguments[i]);
                }
                var result = new ArgPostModel('PageModel.MapActionCompleted', rpara);
                var resultstr = Poster.stringifyModel(result);
                window.parent.postMessage(resultstr, "*");
            } catch (e) {

            }
        });
        var strListnerEvent = Poster.stringifyModel(listner);
        frame.postMessage(strListnerEvent, '*');
    }
    if (action) {
        var beginAction = new ArgPostModel(action, paras && paras.length && paras.length >= 0 ? paras : [paras]);
        var str = Poster.stringifyModel(beginAction);
        frame.postMessage(str, '*');
    }
}

PageModel.MapActionCompleted = null;

PageModel.MapClear = function (model) {
    this.MapAction(model ? model.container : null, "Pan");
    this.MapAction(model ? model.container : null, "Clean");
}

PageModel.AddMap2Model = function (container) {
    if (container.find("iframe").length <= 0) {
        var gid = GUID();
        container.prepend($("#mapdiv").html());
        container.find("iframe:first").attr("frameindex", $("body").find("iframe").length - 1);
        container.find("iframe:first").attr("id", gid);
        PageModel.Get("FrameLoadinfo")[gid] = false;
        var iframe = document.getElementById(gid);
        if (iframe.attachEvent) {
            iframe.attachEvent("onload", function () {
                PageModel.Get("FrameLoadinfo")[gid] = true;
            });
        } else {
            iframe.onload = function () {
                PageModel.Get("FrameLoadinfo")[gid] = true;
            };
        }
    }
    document.getElementById(container.find("iframe:first").attr("id")).focus();
}

PageModel.SetFrames=function () {
    var atrindex=0;
    $(document).find("iframe").each(function () {
        var gid = GUID();
        $(this).attr("frameindex", atrindex++);
        $(this).attr("id", gid);
        var icontainer = $(this);
        PageModel.Get("FrameLoadinfo")[gid] = false;
        var iframe =  $(this)[0];
        if (iframe.attachEvent) {
            iframe.attachEvent("onload", function () {
                PageModel.Get("FrameLoadinfo")[gid] = true;
                $(icontainer).parents(".MapContainer").hide();
                $(icontainer).parents(".MapContainer").css("opacity",1);
            });
        } else {
            iframe.onload = function () {
                PageModel.Get("FrameLoadinfo")[gid] = true;
                // $(icontainer).parents(".MapContainer").hide();
                // $(icontainer).parents(".MapContainer").css("opacity",1);
            };
        }
        $(this).attr("src", PageModel.SConfig.MapUrl);
    });
}

PageModel.Add("FrameLoadinfo",[]);

PageModel.AddProp=function (propName,getfunc,setfunc)
{
    Object.defineProperty(PageModel, propName, {
        get: function () {
            if(getfunc)
            {
               return getfunc();
            }
        },
        set: function (newValue) {
            if(setfunc)
            {
                setfunc(newValue);
            }
        },
        enumerable: true,
        configurable: true
    });
};
PageModel.GetSystemConfig=function (reload) {
    if (PageModel.Get("SystemConfig") && !reload) {
        return PageModel.Get("SystemConfig");
    }
    else
    {
        if(PageModel.SystemConfigUrl)
        {
            ajaxWebApiSync(PageModel.SystemConfigUrl, {}, WebApiAction.Get, function (datas) {
                PageModel.Add("SystemConfig", datas);
                if (datas.UserInfo) {
                    IndexModel.UserName=datas.UserInfo.Realname;
                }
            });
        }
        return PageModel.Get("SystemConfig");
    }
};
PageModel.GetBussinesConfig=function (reload) {
    if (PageModel.Get("BussinesConfig") && !reload) {
        return PageModel.Get("BussinesConfig");
    }
    else
    {
        if(PageModel.BussinesConfigUrl)
        {
            ajaxWebApiSync(PageModel.BussinesConfigUrl, {}, WebApiAction.Get, function (datas) {
                PageModel.Add("BussinesConfig", datas);
            });
        }
        return PageModel.Get("BussinesConfig");
    }
};

PageModel.AddProp("SConfig",function () {
    return PageModel.GetSystemConfig();
});
PageModel.AddProp("BusConfig",function () {
    return PageModel.GetBussinesConfig();
});
var IndexModel = MVVM.define({
    name: "IndexModel",
    UMenus: [],
    Setumenus: function (datas) {
        this.UMenus = MenuManager.InitMenus(datas);
    },
    EventCenterIds: [],
    UserName: "用户名称",
    onExitClick: function (ele, model) {
        $.showModal({
            title: "退出提示", message: "您确定要退出"+PageModel.SConfig.SystemName+"吗?", ok: function () {
                alert("退出成功");
            }
        });
    },
    onModifyPasswordClick: function (ele, model) {
        $.showModal({
            title: "退出提示", message: "您确定要退出"+PageModel.SConfig.SystemName+"吗?", ok: function () {
                alert("退出成功");
            }
        });
    },
});