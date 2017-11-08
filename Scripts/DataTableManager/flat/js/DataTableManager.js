/**
 * Created by Lsh179 on 2017/9/6.
 */

(function ($) {
    var AllTables = [];

    function LmDataTable() {
    };
    var defaulttopt = {
        minwidth: 0,
        name: 'table',
        automatchsize: true,
        sortable: true
    };
    var defaultcopt = {
        minwidth: 0,
        width: "1*",
        calcwidth: -1,
        sortfield: "none",
        combinerow: "no",
        colname: "notset",
        joincols: "",
        colindex: -1
    };

    LmDataTable.prototype = {
        toption: {},
        colopts: [],
        lastsortcol: null,
        name: 'table',
        TableSort: null,
        _lasthandpwidth: -1,
        Sizechanged: function () {
            if (this._lasthandpwidth != $(this.$ele).parent().width()) {
                this._contenthandler();
            }
            // if(this.toption.automatchsize)
            // {
            //     $(this.$ele).find("tbody").css("max-height",$(this.$ele).parent().height()-$(this.$ele).find("thead").height());
            //
            //     console.log("parent-height");
            //     console.log($(this.$ele).parent().height());
            //
            //     console.log("thead-height");
            //     console.log((this.$ele).find("thead").height());
            //
            //     console.log("tbody max-height");
            //     console.log($(this.$ele).find("tbody").css("max-height"));
            // }
        },
        _initTable: function (ele, option) {
            AllTables.push(this);
            this.$ele = ele;
            this.toption = $.extend({}, defaulttopt, option, $(ele).data());
            if (this.toption.name != 'table') {
                this.name = this.toption.name;
            } else {
                this.name = GUID();
            }
            if (this.toption.automatchsize) {
                $(ele).addClass("automatchtable");
            } else {
                $(ele).removeClass("automatchtable");
            }
            this._getColoptions();
            this._attouchEvent();
            this._contenthandler();
            this._combinerow();
            $(ele).data("tableobj", this);
            // if(this.toption.automatchsize)
            // {
            //     $(this.$ele).find("tbody").css("max-height",$(this.$ele).parent().height()-$(this.$ele).find("thead").height());
            // }
        },
        _getColoptions: function () {
            var tobj = this;
            tobj.colopts = [];
            var i = 0;
            this.$ele.find("thead tr").each(function (index) {
                $(this).find("th").each(function (index2) {

                    if ($(this).css("display") != "none") {

                        var colspan = $(this).prop("colspan");
                        if (colspan == 1) {
                            var copt = $.extend({cursort: "none"}, defaultcopt, $(this).data());
                            var colindex = copt.colindex < 0 ? index2 : copt.colindex;

                            $(this).attr("colindex", colindex);
                            copt.colindex = colindex;

                            if (copt.colname == 'notset') {
                                copt.colname = "name" + colindex;
                                $(this).attr("data-colname", copt.colname);
                            }

                            //???
                            if (copt.minwidth <= 0) {
                                copt.minwidth = tobj.toption.minwidth;
                            }

                            //为排序字段增加排序按钮
                            if (copt.sortfield != 'none') {
                                if ($(this).find(">div.sortcol").length <= 0) {
                                    $(this).html('<div class="sortcol"><div><div class="sorttitle">' + $(this).html() + '</div><div class="sortspan"><i class="fa fa-caret-up"/><i class="fa fa-caret-down"/></div></div></div>')
                                }
                            }

                            if ((copt.width + '').indexOf("*") >= 0) {
                                copt.calcwidth = -1 * parseFloat(copt.width.replace("*", ""));
                            } else {
                                copt.calcwidth = parseFloat(copt.width + '');
                            }

                            if (tobj.toption.automatchsize == false && copt.calcwidth < 0) {
                                copt.calcwidth = 0;
                            }

                            if (tobj.toption.automatchsize == true && copt.calcwidth == 0) {
                                copt.calcwidth = -1;
                            }
                            if (copt.calcwidth > 0) {
                                $(this).css("width", copt.calcwidth - 1);
                                $(this).css("min-width", copt.calcwidth - 1);
                            }

                            if (copt.minwidth > 0 && copt.calcwidth <= 0) {
                                $(this).css("min-width", copt.minwidth - 1);
                            }

                            copt.$ele = $(this);
                            //tobj.colopts[colindex] =copt;
                            // tobj.colopts[copt.colname] =copt;
                            tobj.colopts[i] = copt;
                            tobj.colopts[i].colindex = index2;
                            i++;
                        }
                    }

                });
            });
        },
        _contenthandler: function () {
            var tobj = this;
            var trs = tobj.$ele.find("tbody tr");
            // if(trs.length<=0)
            // {
            //     return;
            // }
            if (this.toption.automatchsize) {
                this._calcmatchsize();
            } else {
                this._calcnomatchsize();
            }
        },
        _calcmatchsize: function () {
            var tobj = this;

            var relwidth = tobj.colopts.where(function (opt) {
                return opt.calcwidth > 0;
            }).sum(function (opt) {
                return opt.calcwidth;
            });

            var autoparts = tobj.colopts.where(function (opt) {
                    return opt.calcwidth < 0
                }).sum(function (opt) {
                    return opt.calcwidth;
                }) * -1;

            var matchsize = autoparts > 0 ? ($(tobj.$ele.parent()).width() - relwidth - $(tobj.$ele).prop("border") * (tobj.colopts.length - 1)) / autoparts : 0;
            var trs = tobj.$ele.find("tbody tr");
            var awidth = 0;

            for (var i = 0; i < tobj.colopts.length; i++) {
                var copt = tobj.colopts[i];
                if (copt.calcwidth < 0) {
                    copt.$ele.css("width", Math.floor(matchsize * copt.calcwidth * -1) - 1);
                    copt.$ele.css("min-width", Math.max(copt.minwidth, Math.floor(matchsize * copt.calcwidth * -1) - 1));

                    awidth += Math.max(copt.minwidth, Math.floor(matchsize * copt.calcwidth * -1) - 1);

                } else {
                    awidth += copt.calcwidth - 1;
                }

                for (var j = 0; j < trs.length; j++) {

                    var thWidth = parseInt(copt.$ele.css("min-width"));

                    //var td=trs.eq(j).find("td").eq(i);  //第j行 i列的td
                    var td = trs.eq(j).find("td").eq(copt.colindex);
                    var span = td.children("span");

                    span.css({
                        "white-space": "nowrap",
                        "overflow": "hidden",
                        "text-overflow": "ellipsis",
                        "width": thWidth - 10
                    });

                    if (i == tobj.colopts.length - 1) {

                        td.css("width", thWidth);
                    } else {

                        td.css("min-width", thWidth);
                    }

                }

                // for(var j=0;j<trs.length;j++)
                // {
                //     var ctd = $($(trs[j]).children()[copt.colindex]);
                //     if(copt.calcwidth<0)
                //     {
                //         $(ctd.children()[0]).css("width",Math.floor(matchsize*copt.calcwidth*-1)-1);
                //         if(copt.minwidth>0)
                //         {
                //             ctd.css("min-width",copt.minwidth);
                //         }
                //     }
                //
                //     //td对应的表头列固定高度时
                //     if(copt.calcwidth>0)
                //     {
                //         $(ctd.children()[0]).css("width",copt.calcwidth-1);
                //         //ctd.css("width",copt.calcwidth);
                //     }
                // }
            }

            var realWidth = $(tobj.$ele.parent()).width();
            var theadItem = $(this.$ele).find("thead");

            if (realWidth > awidth) {

                var addWidth = realWidth - awidth;
                var thLast = theadItem.find("th:last");

                var tempWidth = parseInt(thLast.css("min-width"));
                thLast.css("min-width", tempWidth + addWidth);
                trs.find("td:last").css("width", tempWidth + addWidth);

                var checkValue = parseInt($(this.$ele).find("thead").css("width")) - realWidth;
                if (checkValue > 0) {
                    thLast.css("min-width", parseInt(thLast.css("min-width")) - checkValue);
                }

            }

            if (this.toption.automatchsize) {
                $(this.$ele).find("tbody").css("height", $(this.$ele).parent().height() - $(this.$ele).find("thead").height());
            }

            //$(this.$ele).find("tbody").css("width",Math.max($(this.$ele).parent().width()-2,awidth));
        },
        _calcnomatchsize: function () {
            var tobj = this;
            var trs = tobj.$ele.find("tbody tr");
            var calcol = tobj.colopts.where(function (opt) {
                return opt.calcwidth > 0 || opt.minwidth > 0;
            });
            if (calcol.length <= 0) {
                return;
            }
            for (var j = 0; j < trs.length; j++) {
                for (var i = 0; i < calcol.length; i++) {
                    var ctd = $($(trs[j]).children()[calcol.colindex]);
                    if (calcol.minwidth > 0) {
                        $(ctd).css("min-width", calcol.minwidth);
                    }
                    if (calcol.calcwidth > 0) {
                        $($(ctd).children()[0]).css("width", calcol.calcwidth - 1);
                    }
                }
            }
        },
        _combinerow: function () {
            var tobj = this;
            var combinerows = tobj.colopts.where(function (opt) {
                return opt.combinerow == "yes";
            });
            if (combinerows.length > 0) {
                var trs = tobj.$ele.find("tbody tr");
                for (var i = 0; i < combinerows.length; i++) {
                    var copt = combinerows[i];
                    var joinclos = Str2List(copt.joincols, ",").where(function (col) {
                        return tobj.colopts[col];
                    }).select(function (col) {
                        return tobj.colopts[col];
                    }).concat(copt);
                    var lastvalue = '';
                    var lasttd = null;
                    for (var j = 0; j < trs.length; j++) {
                        var trchilds = $(trs[j]).children();
                        var cvalue = joinclos.select(function (aopt) {
                            return aopt.colindex >= 0 && aopt.colindex < trchilds.length ? $(trchilds[aopt.colindex]).html() : '';
                        }).join(",");
                        if (cvalue == lastvalue && copt.colindex >= 0 && copt.colindex < trchilds.length) {
                            $(trchilds[copt.colindex]).hide();
                            if (lasttd != null) {
                                lasttd.prop("rowspan", lasttd.prop("rowspan") + 1);
                            }
                        }
                        if (cvalue != lastvalue && copt.colindex >= 0 && copt.colindex < trchilds.length) {
                            lasttd = $(trchilds[copt.colindex]);
                        }
                        lastvalue = cvalue;
                    }
                }
            }
        },
        _attouchEvent: function () {
            var tobj = this;
            if (this.toption.sortable) {
                $(this.$ele).on("click", "th >div.sortcol", function () {
                    tobj.$ele.find("th .sortspan i").removeClass("select");
                    var cth = $(this).parent("th");
                    var colindex = parseInt($(cth).attr("colindex"));
                    var coptitem = tobj.colopts[colindex];
                    if (coptitem.cursort != 'asc') {
                        coptitem.cursort = "asc";
                        $(cth).find(".fa-caret-up").addClass("select");
                    } else {
                        coptitem.cursort = "desc";
                        $(cth).find(".fa-caret-down").addClass("select");
                    }

                    if (tobj.lastsortcol != coptitem) {
                        if (tobj.lastsortcol) {
                            tobj.lastsortcol.cursort = "none";
                        }
                        tobj.lastsortcol = coptitem;
                    }

                    if (tobj.TableSort) {
                        tobj.TableSort(tobj.lastsortcol);
                    }
                });
            }

            $(this.$ele).on("lmsoptchange", "thead tr", function () {
                tobj._getColoptions();
            });
            $(this.$ele).on("lmsoptchange", "tbody", function () {
                tobj._combinerow();
                tobj._contenthandler();
            });
            // $(this.$ele).load(function () {
            //     tobj._contenthandler();
            // });
        }
    };


    $.fn.ScanDataTable = function () {
        var tabledics = [];
        $(this).find("table.lmtable").each(function () {

            if($(this).data("dynamictable")){

                var tobj =new LmDataTable();
                tobj._initTable($(this));
                tabledics.push(tobj);
                tabledics[tobj.name] = tobj;

            }else{

                if(!$(this).data("tableobj"))
                {
                    var tobj =new LmDataTable();
                    tobj._initTable($(this));
                    tabledics.push(tobj);
                    tabledics[tobj.name] = tobj;

                }else {
                    var tobj = $(this).data("tableobj");
                    tabledics.push(tobj);
                    tabledics[tobj.name] = tobj;
                }
            }
        });
        return tabledics;
    };
    $.fn.LmDataTable = function () {
        var table = $(this).get(0).nodeName.toLowerCase() == 'table' ? $(this) : $(this).find("table:first");
        if (!$(table).data("tableobj")) {
            var tobj = LmDataTable();
            tobj._initTable($(table));
        } else {
            return $(this).data("tableobj");
        }
    };

    $(function () {
        $(window).resize(function () {

            if (AllTables.length > 0) {
                for (var i = 0; i < AllTables.length; i++) {
                    AllTables[i].Sizechanged();
                }
            }
        });
    });
})(jQuery);