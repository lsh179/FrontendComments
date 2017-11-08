var gunplaCore = {
    LibraryUrl: "",
    strComponentList: "",
    theme: "",
    models: {},
    moduleModels: {},
    moduleModelDefs: {},
    curMenu: null,
    menuItem: null,
    loadModule: function (moduleName) {
        if (gunplaCore.moduleModels[moduleName]) {
            var model = gunplaCore.moduleModels[moduleName];
            return model;
        }
        var nguid = GUID() + moduleName;
        var val = moduleName;

        if (val == "") {
            return;
        }

        var name = val;
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
        var modifyModel = model;
        modifyModel += 'gunplaCore.moduleModels["' + val + '"]=' + varName + ';';
        modifyModel = '<script type="text/javascript">' + modifyModel + '</script>';
        key = "currentName" + expose;

        var viewnode = $(gunplaCore.getView(val));
        viewnode.attr("guid", nguid);
        var view = viewnode.toArray().select(function (cview) {
            return $(cview).prop("outerHTML")
        }).join(''); //viewnode.prop("outerHTML");
        if (funcName != "") {

            model.container = $('[guid="' + model.guid + '"]');
            view += '<script type="text/javascript"> ' + varName + '.container=$(\'[guid="' + nguid + '"]\');' + funcName + "(" + varName + ");" + "</script>";
            // view += '<script type="text/javascript"> ' + funcName + "(" + varName + ")" + "</script>";
        }

        var template = func + view + executefun;

        var temp = document.createElement('div');
        $(template).appendTo(temp);
        for (var i = 0; i < temp.children.length; i++) {
            $(temp.children[i]).attr(key, name);
        }

        var str = "";
        for (var i = 0; i < temp.children.length; i++) {
            str += temp.children[i].outerHTML;
        }

        // if (executefunName != "") {
        //     str += '<script type="text/javascript">' + executefunName + "(" + varName + ")" + "</script>";
        // }


        $(modifyModel).appendTo(window.document.body);
        var cmodel = gunplaCore.moduleModels[val];
        cmodel.guid = nguid;
        cmodel.content = str;
        cmodel.modelName = varName;
        cmodel.moduleName = moduleName;
        cmodel.everyExecuteFunc = '<script type="text/javascript">' + executefunName + "(" + varName + ")" + "</script>";
        return cmodel;
    },
    loadCloneModule: function (moduleName, cloneKey) {
        if (!moduleName) {
            return;
        }
        var val = moduleName;
        var guid = GUID().replace(/-/g, "");
        if (!gunplaCore.moduleModelDefs[moduleName]) {
            var nmodel = {
                name: moduleName,
                prikey: moduleName + guid,
                varname: "",
                modifyModel: "",
                exeContent: ""
            };
            var func = gunplaCore.getFunction(nmodel.name);
            var functionIndex = findWordStartIndex("function", func);
            var funcName = "";
            if (functionIndex >= 0) {
                func = func.substr(functionIndex + 8, func.length - (functionIndex + 8));
                var index = func.indexOf("(");
                funcName = func.substr(0, index);
                funcName = funcName + nmodel.prikey;
                func = '<script type="text/javascript"> function ' + funcName + func.substr(index, func.length - index) + "</script>";
            } else {
                func = '<script type="text/javascript">' + func + "</script>";
            }
            var executefun = gunplaCore.getExecuteFun(val);
            functionIndex = findWordStartIndex("function", executefun);
            var executefunName = "";
            if (functionIndex >= 0) {
                executefun = executefun.substr(functionIndex + 8, executefun.length - (functionIndex + 8));
                var index = executefun.indexOf("(");
                executefunName = executefun.substr(0, index);
                executefunName = executefunName + nmodel.prikey;
                executefun = '<script type="text/javascript"> function ' + executefunName + executefun.substr(index, executefun.length - index) + "</script>";
            } else {
                executefun = '<script type="text/javascript">' + executefun + "</script>";
            }

            var model = gunplaCore.getModel(nmodel.name);
            var varIndex = findWordStartIndex("var", model);
            var equalIndex = findWordStartIndex("=", model);
            var varName = nmodel.varname = model.substr(varIndex + 3, equalIndex - (varIndex + 3)).trimRight() + nmodel.prikey;
            model = model.substr(0, varIndex + 3) + varName + model.substr(equalIndex, model.length - equalIndex);
            nmodel.modifyModel = '<script type="text/javascript">' + model + 'gunplaCore.moduleModels["' + nmodel.prikey + '"]=' + nmodel.varname + ';</script>';

            var viewnode = $(gunplaCore.getView(val));
            viewnode.attr("guid", nmodel.prikey);
            var view = viewnode.prop("outerHTML");
            if (funcName != "") {
                view += '<script type="text/javascript"> ' + varName + '.container=$(\'[guid="' + nmodel.prikey + '"]\');' + funcName + "(" + varName + ")" + "</script>";
                // view += '<script type="text/javascript"> ' + funcName + "(" + varName + ")" + "</script>";
            }
            nmodel.exeContent = func + view + executefun;
            nmodel.everyExecuteFunc = '<script type="text/javascript">' + executefunName + "(" + varName + ")" + "</script>";
            // if (executefunName != "") {
            //     nmodel.exeContent += '<script type="text/javascript">' + executefunName + "(" + varName + ")" + "</script>";
            // }
            gunplaCore.moduleModelDefs[moduleName] = nmodel;
        }
        var modeldef = gunplaCore.moduleModelDefs[moduleName];
        var key = Date.now();
        if (cloneKey) {
            key = cloneKey;
            if (gunplaCore.moduleModelDefs[moduleName] && gunplaCore.moduleModels[gunplaCore.moduleModelDefs[moduleName].prikey + cloneKey]) {
                return gunplaCore.moduleModels[gunplaCore.moduleModelDefs[moduleName].prikey + cloneKey];
            }
        }
        $(modeldef.modifyModel.replaceAll(modeldef.prikey, modeldef.prikey + key)).appendTo(window.document.body);
        var model = gunplaCore.moduleModels[modeldef.prikey + key];
        model.guid = modeldef.prikey + key;
        model.content = modeldef.exeContent.replaceAll(modeldef.prikey, modeldef.prikey + key);
        model.everyExecuteFunc = modeldef.everyExecuteFunc.replaceAll(modeldef.prikey, modeldef.prikey + key);
        return model;
    },
    dialogID: "lm-def-dialog-private",
    StationContainer: null,
    MenuContainer: null,
    InitContainer: function (option) {
        if (option.MenuContainer) {
            gunplaCore.MenuContainer = option.MenuContainer;
        }
        if (option.StationContainer) {
            gunplaCore.StationContainer = option.StationContainer;
        }
    },
    InitMenus: function (datas) {
        MenuManager.InitMenus(datas);
    },
    ShowStation: function (model) {
        StationManager.show(model);
    },
    ModelOpencontent: function (model, moduleName, subPath, isClone, cloneKey) {
        var smodel = isClone ? this.loadCloneModule(moduleName, cloneKey) : this.loadModule(moduleName);
        var container = model.container;
        if (subPath) {
            if (subPath.indexOf("#") >= 0) {
                container = $(subPath);
            } else {
                // container = $(model.container.find(subPath)[0]);
                container = model.container.find(subPath).eq(0);
            }
            container.find(">div").hide();
        }
        if (smodel.container) {
            smodel.container.show();
            $(smodel.everyExecuteFunc).appendTo(window.document.body);
        } else {
            $(smodel.content).appendTo(container);
            smodel.container = $('[guid="' + smodel.guid + '"]');
            for (var i = 0; i < smodel.container.length; i++) {
                MVVM.scan(smodel.container[i], smodel);
            }
            $(smodel.everyExecuteFunc).appendTo(window.document.body);
        }
        if (smodel.enter) {
            if( model.lastEntersubmodel&& model.lastEntersubmodel.leave&& model.lastEntersubmodel!=smodel)
            {
                model.lastEntersubmodel.leave();
            }
            smodel.enter(gunplaCore, moduleName);
            model.lastEntersubmodel  = smodel;
        }
        model.addmodel(smodel);

        return smodel;
    },
    Opencontent: function (container, moduleName, isClone, cloneKey) {
        if (!container) {
            container = $("body");
        }
        var smodel = isClone ? this.loadCloneModule(moduleName, cloneKey) : this.loadModule(moduleName);
        if (smodel.container) {
            smodel.container.show();
            $(smodel.everyExecuteFunc).appendTo(window.document.body);
        } else {
            $(smodel.content).appendTo(container);
            smodel.container = $('[guid="' + smodel.guid + '"]');
            for (var i = 0; i < smodel.container.length; i++) {
                MVVM.scan(smodel.container[i], smodel);
            }
            // MVVM.scan( smodel.container[0],smodel);
            $(smodel.everyExecuteFunc).appendTo(window.document.body);
        }
        if (smodel.enter) {
            smodel.enter(gunplaCore, moduleName);
        }
        return smodel;
    },
    Showmodel: function (container, model) {
        if (!container) {
            container = $("body");
        }
        var key = "currentName" + expose;
        container.find(">div").each(function () {
            if ($(this).attr(key)) {
                $(this).hide();
            }
        });
        if (model.container) {
            model.container.show();
            $(model.everyExecuteFunc).appendTo(window.document.body);
        } else {
            $(model.content).appendTo(container);
            model.container = $('[guid="' + model.guid + '"]');
            for (var i = 0; i < model.container.length; i++) {
                MVVM.scan(model.container[i], model);
            }
            // MVVM.scan( model.container[0],model);
            $(model.everyExecuteFunc).appendTo(window.document.body);
        }
    },
    CloseClone: function (model) {
        if (model.container) {
            model.container.remove();
        }
        if (model.guid && this.moduleModels[model.guid]) {
            delete this.moduleModels[model.guid];
        }
        delete model;
    },
    History: function () {
        MenuManager.HistoryBack();
    },
    getView: function (name) {
        var currentName = name;
        var template = '';
        if (gunplaCore.theme) {
            $.ajax(
            {
                url: '../Templates/Modules/' + currentName + '/' + gunplaCore.theme + '/view/index.htm',
                async: false,
                dataType: "text",
                success: function (text) {
                    template = text;
                },
                error: function (text) {
                    $.ajax(
                    {
                        url: '../Templates/Modules/' + currentName + '/view/index.htm',
                        async: false,
                        dataType: "text",
                        success: function (text) {
                            template = text;
                        },
                        error: function (text) {
                            $.ajax(
                            {
                                url: '../Templates/Modules/' + currentName + '/' + "default" + '/view/index.htm',
                                async: false,
                                dataType: "text",
                                success: function (text) {
                                    template = text;
                                },
                                error: function (text) {

                                }
                            });
                        }
                    });
                }
            });
        } else {
            $.ajax(
            {
                url: '../Templates/Modules/' + currentName + '/view/index.htm',
                async: false,
                dataType: "text",
                success: function (text) {
                    template = text;
                },
                error: function (text) {
                    $.ajax(
                    {
                        url: '../Templates/Modules/' + currentName + '/' + "default" + '/view/index.htm',
                        async: false,
                        dataType: "text",
                        success: function (text) {
                            template = text;
                        },
                        error: function (text) {

                        }
                    });
                }
            });
        }
        return template;
    },
    getModel: function (name) {
        var currentName = name;
        var template = '';
        if (gunplaCore.theme) {
            $.ajax(
            {
                url: '../Templates/Modules/' + currentName + '/' + gunplaCore.theme + '/model/model.js',
                async: false,
                dataType: "text",
                success: function (text) {
                    template = text;
                },
                error: function (text) {
                    $.ajax(
                    {
                        url: '../Templates/Modules/' + currentName + '/model/model.js',
                        async: false,
                        dataType: "text",
                        success: function (text) {
                            template = text;
                        },
                        error: function (text) {
                            $.ajax(
                            {
                                url: '../Templates/Modules/' + currentName + '/' + 'default' + '/model/model.js',
                                async: false,
                                dataType: "text",
                                success: function (text) {
                                    template = text;
                                },
                                error: function (text) {

                                }
                            });
                        }
                    });
                }
            });
        } else {
            $.ajax(
            {
                url: '../Templates/Modules/' + currentName + '/model/model.js',
                async: false,
                dataType: "text",
                success: function (text) {
                    template = text;
                },
                error: function (text) {
                    $.ajax(
                    {
                        url: '../Templates/Modules/' + currentName + '/' + 'default' + '/model/model.js',
                        async: false,
                        dataType: "text",
                        success: function (text) {
                            template = text;
                        },
                        error: function (text) {

                        }
                    });
                }
            });
        }
        return template;
    },
    getFunction: function (name) {
        var currentName = name;
        var template = '';
        if (gunplaCore.theme) {
            $.ajax(
            {
                url: '../Templates/Modules/' + currentName + '/' + gunplaCore.theme + '/function/executeOne.js',
                async: false,
                dataType: "text",
                success: function (text) {
                    template = text;
                },
                error: function (text) {
                    $.ajax(
                    {
                        url: '../Templates/Modules/' + currentName + '/function/executeOne.js',
                        async: false,
                        dataType: "text",
                        success: function (text) {
                            template = text;
                        },
                        error: function (text) {
                            $.ajax(
                            {
                                url: '../Templates/Modules/' + currentName + '/' + 'default' + '/function/executeOne.js',
                                async: false,
                                dataType: "text",
                                success: function (text) {
                                    template = text;
                                },
                                error: function (text) {

                                }
                            });
                        }
                    });
                }
            });
        } else {
            $.ajax(
            {
                url: '../Templates/Modules/' + currentName + '/function/executeOne.js',
                async: false,
                dataType: "text",
                success: function (text) {
                    template = text;
                },
                error: function (text) {
                    $.ajax(
                    {
                        url: '../Templates/Modules/' + currentName + '/' + 'default' + '/function/executeOne.js',
                        async: false,
                        dataType: "text",
                        success: function (text) {
                            template = text;
                        },
                        error: function (text) {

                        }
                    });
                }
            });
        }
        return template;
    },
    getExecuteFun: function (name) {
        var currentName = name;
        var template = '';
        if (gunplaCore.theme) {
            $.ajax(
            {
                url: '../Templates/Modules/' + currentName + '/' + gunplaCore.theme + '/function/executeEvery.js',
                async: false,
                dataType: "text",
                success: function (text) {
                    template = text;
                },
                error: function (text) {
                    $.ajax(
                    {
                        url: '../Templates/Modules/' + currentName + '/function/executeEvery.js',
                        async: false,
                        dataType: "text",
                        success: function (text) {
                            template = text;
                        },
                        error: function (text) {
                            $.ajax(
                            {
                                url: '../Templates/Modules/' + currentName + '/' + "default" + '/function/executeEvery.js',
                                async: false,
                                dataType: "text",
                                success: function (text) {
                                    template = text;
                                },
                                error: function (text) {

                                }
                            });
                        }
                    });
                }
            });
        } else {
            $.ajax(
            {
                url: '../Templates/Modules/' + currentName + '/function/executeEvery.js',
                async: false,
                dataType: "text",
                success: function (text) {
                    template = text;
                },
                error: function (text) {
                    $.ajax(
                    {
                        url: '../Templates/Modules/' + currentName + '/' + "default" + '/function/executeEvery.js',
                        async: false,
                        dataType: "text",
                        success: function (text) {
                            template = text;
                        },
                        error: function (text) {

                        }
                    });
                }
            });
        }
        return template;
    },
    getFunctionUrl: function (name) {
        return '../Templates/Modules/' + name + '/function/function.js';
    },
    loadCSS: function () {
        if (gunplaCore.theme) {
            var themeCssUrl = "../Content/css/" + gunplaCore.theme + ".css";
            if (($("link[href='" + themeCssUrl + "']")).length == 0) {
                var head = $('head');
                $("<link>" + "</link>").attr({ href: themeCssUrl, type: 'text/css', rel: 'stylesheet' }).appendTo(head);
            }
        }
    },
    loadJS: function () {
        if (gunplaCore.theme) {
            var themeJsUrl = "../Content/script/" + gunplaCore.theme + ".js";
            if (($("script[src='" + themeJsUrl + "']")).length == 0) {
                var head = $('head');
                $("<script>" + "</script>").attr({ src: themeJsUrl, type: 'text/javascript' }).appendTo(head);
            }
        }
    },
    //加载js组件的js和css
    loadPlugins: function () {
        var componentObjList = JSON.parse(gunplaCore.strComponentList);
        if (componentObjList && componentObjList.length > 0) {
            for (var i = 0; i < componentObjList.length; i++) {
                var obj = {};
                obj.folderName = componentObjList[i];
                obj.jsName = componentObjList[i] + ".js";
                obj.cssName = componentObjList[i] + ".css";
                gunplaCore.loadPluginJS(obj);
                gunplaCore.loadPluginCSS(obj);
            }
        }
    },
    //加载组件的js
    loadPluginJS: function (obj) {
        if (gunplaCore.theme) {
            var themeJsUrl = gunplaCore.LibraryUrl + obj.folderName + '/' + gunplaCore.theme + '/js/' + obj.jsName;
            if (($("script[src='" + themeJsUrl + "']")).length == 0) {
                $.ajax(
                {
                    url: themeJsUrl,
                    async: false,
                    dataType: "text",
                    success: function (text) {
                        var head = $('head');
                        $("<script type='text/javascript'>" + text + "</script>").appendTo(head);
                    },
                    error: function (text) {
                        var jsUrl = gunplaCore.LibraryUrl + obj.folderName + "/default" + '/js/' + obj.jsName;
                        if (($("script[src='" + jsUrl + "']")).length == 0) {
                            $.ajax(
                            {
                                url: jsUrl,
                                async: false,
                                dataType: "text",
                                success: function (text) {
                                    var head = $('head');
                                    $("<script type='text/javascript'>" + text + "</script>").appendTo(head);
                                },
                                error: function (text) {
                                    var defaultThemeJsUrl = gunplaCore.LibraryUrl + obj.folderName + '/js/' + obj.jsName;
                                    if (($("script[src='" + defaultThemeJsUrl + "']")).length == 0) {
                                        $.ajax(
                                        {
                                            url: defaultThemeJsUrl,
                                            async: false,
                                            dataType: "text",
                                            success: function (text) {
                                                var head = $('head');
                                                $("<script type='text/javascript'>" + text + "</script>").appendTo(head);
                                            },
                                            error: function (text) {

                                            }
                                        });
                                    }
                                }
                            });
                        }
                    }
                });
            }
        } else {
            var jsUrl = gunplaCore.LibraryUrl + obj.folderName + "/default" + '/js/' + obj.jsName;
            if (($("script[src='" + jsUrl + "']")).length == 0) {
                $.ajax(
                {
                    url: jsUrl,
                    async: false,
                    dataType: "text",
                    success: function (text) {
                        var head = $('head');
                        $("<script type='text/javascript'>" + text + "</script>").appendTo(head);
                    },
                    error: function (text) {
                        var defaultThemeJsUrl = gunplaCore.LibraryUrl + obj.folderName + '/js/' + obj.jsName;
                        if (($("script[src='" + defaultThemeJsUrl + "']")).length == 0) {
                            $.ajax(
                            {
                                url: defaultThemeJsUrl,
                                async: false,
                                dataType: "text",
                                success: function (text) {
                                    var head = $('head');
                                    $("<script type='text/javascript'>" + text + "</script>").appendTo(head);
                                },
                                error: function (text) {

                                }
                            });
                        }
                    }
                });
            }
        }
    },
    //加载组件的css
    loadPluginCSS: function (obj) {
        if (gunplaCore.theme) {
            var themeCSSUrl = gunplaCore.LibraryUrl + obj.folderName + '/' + gunplaCore.theme + '/css/' + obj.cssName;
            if (($("link[href='" + themeCSSUrl + "']")).length == 0) {
                $.ajax(
                {
                    url: themeCSSUrl,
                    async: false,
                    dataType: "text",
                    success: function (text) {
                        var head = $('head');
                        $('<style type="text/css">' + text + '</style>').appendTo(head);
                    },
                    error: function (text) {
                        var cssUrl = gunplaCore.LibraryUrl + obj.folderName + "/default" + '/css/' + obj.cssName;
                        if (($("link[href='" + cssUrl + "']")).length == 0) {
                            $.ajax(
                            {
                                url: cssUrl,
                                async: false,
                                dataType: "text",
                                success: function (text) {
                                    var head = $('head');
                                    $('<style type="text/css">' + text + '</style>').appendTo(head);
                                },
                                error: function (text) {
                                    var defaultThemeCSSUrl = gunplaCore.LibraryUrl + obj.folderName + '/css/' + obj.cssName;
                                    if (($("link[href='" + defaultThemeCSSUrl + "']")).length == 0) {
                                        $.ajax(
                                        {
                                            url: defaultThemeCSSUrl,
                                            async: false,
                                            dataType: "text",
                                            success: function (text) {
                                                var head = $('head');
                                                $('<style type="text/css">' + text + '</style>').appendTo(head);
                                            },
                                            error: function (text) {

                                            }
                                        });
                                    }
                                }
                            });
                        }
                    }
                });
            }
        } else {
            var cssUrl = gunplaCore.LibraryUrl + obj.folderName + "/default" + '/css/' + obj.cssName;
            if (($("link[href='" + cssUrl + "']")).length == 0) {
                $.ajax(
                {
                    url: cssUrl,
                    async: false,
                    dataType: "text",
                    success: function (text) {
                        var head = $('head');
                        $('<style type="text/css">' + text + '</style>').appendTo(head);
                    },
                    error: function (text) {
                        var defaultThemeCSSUrl = gunplaCore.LibraryUrl + obj.folderName + '/css/' + obj.cssName;
                        if (($("link[href='" + defaultThemeCSSUrl + "']")).length == 0) {
                            $.ajax(
                            {
                                url: defaultThemeCSSUrl,
                                async: false,
                                dataType: "text",
                                success: function (text) {
                                    var head = $('head');
                                    $('<style type="text/css">' + text + '</style>').appendTo(head);
                                },
                                error: function (text) {

                                }
                            });
                        }
                    }
                });
            }
        }
    }
};

var StationManager = {
    lastModel: null,
    show: function (model) {
        if (this.lastModel) {
            this.close(this.lastModel);
        }
        if (model.container) {
            model.container.show();
            $(model.everyExecuteFunc).appendTo(window.document.body);
        } else {
            $(model.content).appendTo(gunplaCore.StationContainer);
            model.container = $('[guid="' + model.guid + '"]');
            for (var i = 0; i < model.container.length; i++) {
                MVVM.scan(model.container[i], model);
            }
            // MVVM.scan( model.container[0],model);
            $(model.everyExecuteFunc).appendTo(window.document.body);
        }
        this.lastModel = model;
    },
    close: function (model) {
        if (model.container) {
            model.container.hide();
        }
    }
};

var MenuManager = {
    AllMenus: [],
    HistoryMenus: [],
    InitMenus: function (datas) {
        MenuManager.AllMenus = [];
        MenuManager.HistoryMenus = [];
        var guid = GUID();
        for (var i = 0; i < datas.length; i++) {
            var pmenu = datas[i];
            pmenu.menuid = guid + i;
            MenuManager.AllMenus.push(pmenu);
            if (pmenu.SubMenus && pmenu.SubMenus.length > 0) {
                        for (var j = 0; j < pmenu.SubMenus.length; j++) {
                            if(pmenu.SubMenus[j].MoudleName)
                            {
                                pmenu.SubMenus[j].parentMenu =  pmenu;
                                pmenu.SubMenus[j].menuid = guid + i + "_" + j;
                                pmenu.SubMenus[j].parentmenuid = guid + i;
                                pmenu.SubMenus[j].Model = gunplaCore.loadModule(pmenu.SubMenus[j].MoudleName);
                                pmenu.SubMenus[j].Model.Menu = pmenu.SubMenus[j];
                                pmenu.SubMenus[j].click = function (ele, menu) {
                                    MenuManager.AddAction2History(menu);
                                };
                                MenuManager.AllMenus.push(pmenu.SubMenus[j]);
                            }
                         }
                 }
             if(pmenu.MoudleName)
             {
                 pmenu.Model = gunplaCore.loadModule(pmenu.MoudleName);
                 pmenu.Model.Menu = pmenu;
                 //pmenu.SubMenus = [];
                 pmenu.click = function (ele, menu) {
                     MenuManager.AddAction2History(menu);
                 };
             }
        }
        return datas;
    },
    HistoryBack: function () {
        if (MenuManager.HistoryMenus.length > 0) {
            var menu = MenuManager.HistoryMenus.pop();
            MenuManager.MenuSelect(menu);
        } else {
            MenuManager.TakeFirst();
        }
    },
    MenuSelect: function (menu) {
        if (MenuManager.CurrentMenu) {
            MenuManager.MenuLeavel(MenuManager.CurrentMenu);
            if (MenuManager.HistoryMenus.length > 5) {
                MenuManager.HistoryMenus.splice(0, 1);
            }
            MenuManager.HistoryMenus.push(MenuManager.CurrentMenu);
        }
        MenuManager.CurrentMenu = menu;
        if (gunplaCore.MenuContainer) {
            gunplaCore.MenuContainer.find("[menuid=" + menu.menuid + "]").addClass("select").siblings().removeClass("select");
            if (menu.parentmenuid) {
                gunplaCore.MenuContainer.find("[menuid=" + menu.parentmenuid + "]").addClass("select").siblings().removeClass("select");
            }
            if (menu.Model && menu.Model.enter) {
                menu.Model.enter(gunplaCore, menu.Model.moduleName);
            }
        }
    },
    MenuLeavel: function (menu) {
        if (gunplaCore.MenuContainer) {
            gunplaCore.MenuContainer.find("[menuid=" + menu.menuid + "]").removeClass("select");
            if (menu.parentmenuid) {
                gunplaCore.MenuContainer.find("[menuid=" + menu.parentmenuid + "]").removeClass("select");
            }
            if (menu.Model && menu.Model.leave) {
                menu.Model.leave();
            }
        }
    },
    TakeFirst: function () {
        if (MenuManager.AllMenus.length > 0) {
            var pf = MenuManager.AllMenus[0];
            if (pf.SubMenus && pf.SubMenus.length > 0) {
                MenuManager.MenuSelect(pf.SubMenus[0]);
            } else {
                MenuManager.MenuSelect(pf);
            }
        }
    },
    AddAction2History: function (menu) {
        MenuManager.MenuSelect(menu);
    },
    CurrentMenu: null
};


