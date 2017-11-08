(function ($, document) {
    LmDraggor = function (selector, options) {
        var dopts = {
            direction: "none",//支持resize类型有horizon,vertical,all,none 
            limit: "inside",//
            hander: "",
            maxWidth: "100%",
            maxHeight: "100%",
            minWidth: "300",
            minHeight: "200",
            minLeft: 15,
            minRight: 15,
            minBottom: 15,
            sizeChanged: null
        };
        this.options = $.extend({}, dopts, options);
        var odrag = $(selector).data("lmdraggor");
        if (odrag) {
            odrag._init();
        } else {
            this.$element = $(selector);
            this._init();
            this._attachEvent();
            $(selector).data("lmdraggor", this);
        }
    },
    LmDraggor.prototype = {
        parent: null,
        parentbg: null,
        pWidth: 0,
        pHeight: 0,
        width: 0,
        height: 0,
        _caction: "drag",
        enable: true,
        lastposition: null,
        _init: function () {
            this.parent = this.$element.parent();
            this.pWidth = this.parent.width();
            this.pHeight = this.parent.height();
            this.width = this.$element.width();
            this.height = this.$element.height();
            this.$element.css({ "left": (this.pWidth - this.width) / 2, "top": (this.pHeight - this.height) / 2 });
            this.lastposition = null;
            this.enable = true;
            this._caction = "";
            if (this.parent.find(">div[Tag=LmDraggingbg]").length <= 0) {
                this.parent.prepend('<div style="display:none;position:absolute;top:0;left:0;height:100%;width:100%;background-color:transparent;z-index:9999" Tag="LmDraggingbg"></div>')
            }
            this.parentbg = $(this.parent.find(">div[Tag=LmDraggingbg]"));
            this.$element.css("position", "absolute");
            this.parent.css("overflow", "hidden");
            if (this.options.hander && this.options.hander != "") {
                $(this.$element.find(this.options.hander)).css({ "cursor": "move" });
            }
            if(this.options.direction=="horizon"||this.options.direction=="all")
            {
                if (this.$element.find(">div[Tag=LmDrggingh]").length <= 0)
                {
                    this.$element.append('<div Tag="LmDrggingh" moveway="dragsizehl" title="拖拽改变窗口宽度" style="z-index:10000;position:absolute;left:0;top:0;bottom:0;width:3px;cursor:e-resize;background-color:transparent;"></div>')
                    this.$element.append('<div Tag="LmDrggingh" moveway="dragsizehr" title="拖拽改变窗口宽度"  style="z-index:10000;position:absolute;right:0;top:0;bottom:0;width:3px;cursor:e-resize;background-color:transparent;"></div>')
                }
                this.$element.find(">div[Tag=LmDrggingh]").show();
            } else {
                this.$element.find(">div[Tag=LmDrggingh]").remove();
            }
            if (this.options.direction == "vertical" || this.options.direction == "all")
            {
                if (this.$element.find(">div[Tag=LmDrggingv]").length <= 0)
                {
                    this.$element.append('<div Tag="LmDrggingv" moveway="dragsizevt" title="拖拽改变窗口高度"  style="z-index:10000;position:absolute;left:0;top:0;right:0;height:3px;cursor:n-resize;background-color:transparent;"></div>')
                    this.$element.append('<div Tag="LmDrggingv" moveway="dragsizevb" title="拖拽改变窗口高度"  style="z-index:10000;position:absolute;bottom:0;left:0;right:0;height:3px;cursor:n-resize;background-color:transparent;"></div>')
                }
                this.$element.find(">div[Tag=LmDrggingv]").show();
            } else {
                this.$element.find(">div[Tag=LmDrggingv]").remove();
            }
        },
        _attachEvent: function () {
            var thisDrag = this;
            this.parent.resize(function () {
                thisDrag.pWidth = thisDrag.parent.width();
                thisDrag.pHeight = thisDrag.parent.height();
            });
            this.$element.resize(function () {
                thisDrag.width = thisDrag.$element.width();
                thisDrag.height = thisDrag.$element.height();
            });
            $(this.$element.find("div[dragcontent=dragcontent]")).mousedown(function (e) {
                if (thisDrag.enable) {
                    thisDrag.lastposition = e;
                    thisDrag._caction = "drag";
                    CurrentDrag = thisDrag;
                    thisDrag.parentbg.show();
                }
            });
            if (this.options.hander && this.options.hander != "") {
                $(this.$element.find(this.options.hander)).mousedown(function (e) {
                    if (thisDrag.enable) {
                        thisDrag.lastposition = e;
                        thisDrag._caction = "drag";
                        CurrentDrag = thisDrag;
                        thisDrag.parentbg.show();
                    }
                });
            }

            if(this.options.direction=="horizon"||this.options.direction=="all")
            {
                this.$element.find(">div[Tag=LmDrggingh]").mousedown(function (e) {
                    if (thisDrag.enable) {
                        thisDrag.lastposition = e;
                        thisDrag._caction = $(this).attr("moveway");
                        CurrentDrag = thisDrag;
                        thisDrag.parentbg.show();
                    }
                });
            } else {
            }
            if (this.options.direction == "vertical" || this.options.direction == "all")
            {
                this.$element.find(">div[Tag=LmDrggingv]").mousedown(function (e) {
                    if (thisDrag.enable) {
                        thisDrag.lastposition = e;
                        thisDrag._caction = $(this).attr("moveway");
                        CurrentDrag = thisDrag;
                        thisDrag.parentbg.show();
                    }
                });
            }

        },
        Reposition: function (e) {
            if (this.enable) {
                switch (this._caction) {
                    case "drag":
                        this._setdragposition(e);
                        break;
                    case "dragsizehl":
                        this._setdraghlsize(e);
                        break;
                    case "dragsizehr":
                        this._setdraghrsize(e);
                        break;
                    case "dragsizevt":
                        this._setdragvtsize(e);
                        break;
                    case "dragsizevb":
                        this._setdragvbsize(e);
                        break;
                    case "dragsizeall":
                        this._setdragallsize(e);
                        break;
                }
                this.lastposition = e;
            }
        },
        _setdragposition: function (e) {
            if (this.lastposition) {
                this.$element.css({ "left": this._getmovex(e), "top": this._getmovey(e) });
            }
        },
        _getmovex: function (e) {
            var curLeft = parseInt(this.$element.css("left") == "auto" ? "0" : this.$element.css("left"));
            var newLeft = curLeft + (e.pageX - this.lastposition.pageX);

            if (this.options.limit == "inside") {
                newLeft = Math.max(this.options.minLeft - this.width, Math.min(this.pWidth - this.options.minRight, newLeft));
            }
            return newLeft;
        },
        _getmovey: function (e) {
            var curTop = parseInt(this.$element.css("top") == "auto" ? "0" : this.$element.css("top"));
            var newTop = curTop + (e.pageY - this.lastposition.pageY);
            if (this.options.limit == "inside") {
                newTop = Math.max(0, Math.min(this.pHeight - this.options.minBottom, newTop));
            }
            return newTop;
        },
        _setdraghlsize: function (e) {
            if (this.lastposition) {
                var curLeft = parseInt(this.$element.css("left") == "auto" ? "0" : this.$element.css("left"));
                var newLeft = this._getmovex(e);
                if (curLeft != newLeft) {
                    var newwidth=Math.max(this.width - (newLeft - curLeft),this.options.minWidth);
                    if(newwidth!=this.width)
                    {
                        this.$element.css({ "width": this.width - (newLeft - curLeft), "left": newLeft });
                        this.width = this.width - (newLeft - curLeft);
                    }
                }
            }
        },
        _setdraghrsize: function (e) {
            if (this.lastposition) {
                var curLeft = parseInt(this.$element.css("left") == "auto" ? "0" : this.$element.css("left"));
                var newLeft = this._getmovex(e);
                if (curLeft != newLeft) {
                    var newwidth=Math.max(this.width + (newLeft - curLeft),this.options.minWidth);
                    if(newwidth!=this.width) {
                        this.$element.css("width", this.width + (newLeft - curLeft));
                        this.width = this.width + (newLeft - curLeft);
                    }
                }
            }
        },
        _setdragvtsize: function (e) {
            if (this.lastposition) {
                var curTop = parseInt(this.$element.css("top") == "auto" ? "0" : this.$element.css("top"));
                var newTop = this._getmovey(e);
                if (curTop != newTop) {
                    var newheight=Math.max(this.height - (newTop - curTop),this.options.minHeight);
                    if(newheight!=this.height) {
                        this.$element.css({"top": newTop, "height": this.height - (newTop - curTop)});
                        this.height = this.height - (newTop - curTop);
                    }
                }
            }
        },
        _setdragvbsize: function (e) {
            if (this.lastposition) {
                var curTop = parseInt(this.$element.css("top") == "auto" ? "0" : this.$element.css("top"));
                var newTop = this._getmovey(e);
                if (curTop != newTop) {
                    var newheight=Math.max(this.height + (newTop - curTop),this.options.minHeight);
                    if(newheight!=this.height) {
                        this.$element.css({"height": this.height + (newTop - curTop)});
                        this.height = this.height + (newTop - curTop);
                    }
                }
            }
        },
        _setdragallsize: function (e) {

        },
        Disable: function () {
            this.enable = false;
            this.$element.find(">div[Tag=LmDrggingh]").hide();
            this.$element.find(">div[Tag=LmDrggingv]").hide();
            if (this.options.hander && this.options.hander != "") {
                $(this.$element.find(this.options.hander)).css({ "cursor": "default" });
            }
        },
        Enable: function () {
            this.enable = false;
            this.$element.find(">div[Tag=LmDrggingh]").show();
            this.$element.find(">div[Tag=LmDrggingv]").show();
            if (this.options.hander && this.options.hander != "") {
                $(this.$element.find(this.options.hander)).css({ "cursor": "move" });
            }
        }
    },
    $.fn.dragging = function (option) {
        return new LmDraggor($(this), option);
    }
})(jQuery, document);
var CurrentDrag;
$(function () {
    $(document).mouseup(function (e) {
        if (CurrentDrag && CurrentDrag.parentbg) {
            CurrentDrag.parentbg.hide();
        }
        CurrentDrag = null;
    });

    $(document).mousemove(function (e) {
        if (CurrentDrag && CurrentDrag.Reposition) {
            CurrentDrag.Reposition(e);
        }
    });
});