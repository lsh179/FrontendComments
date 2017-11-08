/**
 * Created by Administrator on 2017/7/28.
 */

var DialogManager={
    AllDialog:[],
    DefaultOpt:{
        modelbgcolor:"rgba(0, 0, 0, .3)",
        widthpercent:0.6,
        heightpercent:0.6,
        minwidth:600,
        minheight:400,
        headClass:'lm-dialog-header',
        contentClass:'lm-dialog-content',
        mainClass:'lm-dialog-box',
        titlespan:'<span></span>',
        maxbutton:'<div><i class="fa fa-window-maximize"></i></div>',
        minbutton:'<div><i class="fa fa-window-minimize"></i></div>',
        closebutton:'<div><i class="fa fa-close"></i></div>',
        resizeable:true,
        dragable:true,
        minable:true,
        maxable:true,
        align:'center',
        valign:'middle',
        left:0,
        right:0,
        top:0,
        bottom:0,
    },
    ShowModelDialog:function (moudleName,option) {
        option =  $.extend({}, DialogManager.DefaultOpt, option);
        if(!option.container)
        {
            var defaultModeldiv = $("body>div[Tag=LmDefaultModel]");
            if(!defaultModeldiv||defaultModeldiv.length<=0)
            {
                $("body").append("<div Tag='LmDefaultModel' style='width: 100%;height: 100%;overflow: hidden;display: none;position: absolute;left: 0;top: 0;'></div>");
                defaultModeldiv = $("body>div[Tag=LmDefaultModel]");
            }
            option.container = defaultModeldiv;
        }
        if(!option.modelbgcolor)
        {
            option.modelbgcolor = this.DefaultOpt.modelbgcolor;
        }
        var model = gunplaCore.Opencontent(option.container,moudleName,false);
        var container = model.container;
        if(option.dialogcontainer)
        {
            container = option.dialogcontainer;
        }
        container.parent().css("background-color",option.modelbgcolor);
        container.parent().show();
        model.dialogcontainer = container;
        model.dialog=$(container).LmDialog(option);
        model.dialog.Show();
        model.dialog.owner=model;
        model.dialog.onclose=function () {
            this.owner.dialogcontainer.parent().hide();
            if(this.owner && this.owner.container)
            {
                this.owner.container.hide();
            }
            if(this.owner && this.owner.leave)
            {
                this.owner.leave();
            }
        }
        return model;
    },
    ShowDialog:function () {

    }
};


(function ($, document) {
    LmDialog = function (selector, options) {
        if($(selector).data("lmdialogobj"))
        {
            var obj = $(selector).data("lmdialogobj");
            obj.option =  $.extend({}, options);
            obj._getoption();
            obj.rerender();
            return obj;
        }else{
            this.dialogid =  GUID();
            this.container = $(selector);
            this.option =  $.extend({}, options);
            this._getoption();
            this._init();
            this.container.data("lmdialogobj",this);
        }
        return this;
    },
    LmDialog.prototype = {
        Owner:null,
        state:'normal',
        _getoption:function () {
            if(this.container.attr("dialog-resizeable"))
            {
                this.option.resizeable = this.container.attr("dialog-resizeable")=='true'||this.container.attr("dialog-resizeable")=='1';
            }
            if(this.container.attr("dialog-dragable"))
            {
                this.option.dragable = this.container.attr("dialog-dragable")=='true'||this.container.attr("dialog-dragable")=='1';
            }
            if(this.container.attr("dialog-minable"))
            {
                this.option.minable = this.container.attr("dialog-minable")=='true'||this.container.attr("dialog-minable")=='1';
            }
            if(this.container.attr("dialog-maxable"))
            {
                this.option.maxable = this.container.attr("dialog-maxable")=='true'||this.container.attr("dialog-maxable")=='1';
            }
            if(this.container.attr("dialog-title"))
            {
                this.option.title = this.container.attr("dialog-title");
            }
            if(this.container.attr("dialog-minwidth"))
            {
                this.option.minwidth = parseInt(this.container.attr("dialog-minwidth"));
            }
            if(this.container.attr("dialog-minheight"))
            {
                this.option.minheight = parseInt(this.container.attr("dialog-minheight"));
            }
            if(this.container.attr("dialog-widthpercent"))
            {
                this.option.widthpercent = parseFloat(this.container.attr("dialog-widthpercent"));
            }
            if(this.container.attr("dialog-heightpercent"))
            {
                this.option.heightpercent = parseFloat(this.container.attr("dialog-heightpercent"));
            }
        },
        _init: function () {
            if(this.container.find(">div:first"))
            {
                this.render();
            }
        },
        render:function () {
            this.container.addClass(this.option.mainClass);
            this.content = this.container.find(">div:first");
            this.content.addClass(this.option.contentClass);
            this.header = $("<div dragcontent='dragcontent'></div>");
            this.header.addClass(this.option.headClass);
            this.titleSapn=$(this.option.titlespan).html(this.option.title);
            this.titleSapn.appendTo(this.header);
            this.closebutton = $(this.option.closebutton);
            this.closebutton.attr("lmbtn","closebutton");
            this.closebutton.appendTo(this.header);
            this.maxbutton = $(this.option.maxbutton);
            this.maxbutton.attr("lmbtn","maxbutton");
            this.maxbutton.appendTo(this.header);
            this.minbutton = $(this.option.minbutton);
            this.minbutton.attr("lmbtn","minbutton");
            this.minbutton.appendTo(this.header);
            this.header.appendTo(this.container);
            if(!this.option.minable)
            {
                this.minbutton.hide();
            }
            if(!this.option.maxable)
            {
                this.maxbutton.hide();
            }
            this._initPosition();
            this._attchEvent();
        },
        rerender:function () {
            this.titleSapn.html(this.option.title);
            if(!this.option.minable)
            {
                this.minbutton.hide();
            }else {
                this.minbutton.show();
            }
            if(!this.option.maxable)
            {
                this.maxbutton.hide();
            }else {
                this.maxbutton.show()
            }
            this._initPosition();
        },
        _initPosition:function () {
            if(Number(this.option.widthpercent)<=0)
            {
                if(this.state=='normal')
                {
                    var cmodel = this;
                    this.container.css("max-width",this.container.parent().width()-this.option.left-this.option.right);
                    $.ready(function () {
                        cmodel._setAlign(cmodel.container.width());
                    });
                    cmodel._setAlign(cmodel.container.width());
                }else{

                }
            }else {
                if(this.state=='normal') {
                    this.defaultWidth = Math.min(this.container.parent().width() - this.option.left - this.option.right, Math.max(this.option.widthpercent > 1 ? this.option.widthpercent : this.option.widthpercent * this.container.parent().width(), this.option.minwidth));
                    this.container.css("width", this.defaultWidth);
                    this._setAlign(this.defaultWidth);
                }else{

                }
            }
            if(Number(this.option.heightpercent)<=0)
            {
                if(this.state=='normal') {
                    var cmodel = this;
                    this.container.css("max-height", this.container.parent().height() - this.option.top - this.option.bottom);
                    $.ready(function () {
                        cmodel._setvAlign(cmodel.container.height());
                    });
                    cmodel._setvAlign(cmodel.container.height());
                }else {

                }
             }else {
                if(this.state=='normal') {
                    this.defaultHeight = Math.min(this.container.parent().height() - this.option.top - this.option.bottom, Math.max(this.option.heightpercent > 1 ? this.option.heightpercent : this.option.heightpercent * this.container.parent().height(), this.option.minheight));
                    this.container.css("height", this.defaultHeight);
                    this._setvAlign(this.defaultHeight);
                }else {

                }
            }
        },
        _setAlign:function (width) {
            switch(this.option.align)
            {
                case 'left':
                    this.container.css("left",this.option.left);
                    break;
                case 'center':
                    this.container.css("left",(this.container.parent().width() -width)/2 );
                    break;
                case 'right':
                    this.container.css("left",this.container.parent().width() -width-this.option.right );
                    break;
            }
        },
        _setvAlign:function (height) {
            switch(this.option.valign)
            {
                case 'top':
                    this.container.css("top",this.option.top);
                    break;
                case 'middle':
                    this.container.css("top",(this.container.parent().height() -height)/2 );
                    break;
                case 'bottom':
                    this.container.css("top",this.container.parent().height() -height-this.option.bottom);
                    break;
            }
        },
        Show:function () {
            if(this.container)
            {
                this.container.show();
            }
        },
        _attchEvent:function () {
            var cmodel = this;
            this.container.on("mousedown","[lmbtn=closebutton]",function (e) {
                e.stopPropagation();
                cmodel.Hide();
            });
            this.container.on("mousedown","[lmbtn=minbutton]",function (e) {
                e.stopPropagation();
                cmodel.content.hide();
            });
            this.container.on("mousedown","[lmbtn=maxbutton]",function (e) {
                e.stopPropagation();
                cmodel.content.show();
            });
            if(this.option.dragable)
            {
                var dragopt = {};
                dragopt.minWidth = this.option.minwidth;
                dragopt.minHeight = this.option.minheight;
                if(this.option.resizeable)
                {
                    dragopt.direction="all";
                }
                try {
                    this.container.dragging(dragopt);
                }catch (e){

                }
            }
            $(window).resize(function () {
                cmodel._initPosition();
            });
        },
        Hide:function () {
            if(this.onclose)
            {
                this.onclose();
            }
            if(this.container)
            {
                this.container.hide();
            }
        },
        Remove:function () {
            if(this.onclose)
            {
                this.onclose();
            }
            if(this.container)
            {
                this.container.remove();
            }
        }
    },
    $.fn.LmDialog = function (option) {
        return new LmDialog($(this), option);
    }
})(jQuery, document);