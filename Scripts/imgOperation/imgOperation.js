/**
 * Created by Administrator on 2017/7/9.
 */

(function ($) {

    var d=document,isRun=false, startX=0, startY=0, endX=0, endY=0, rX=0, rY=0, bgX=0, bgY=0, $b=null;
    var ww=0,wh=0,i=null,img=null,imgw=0,imgh=0,scaleSize=1;
    
    function evnt(event) {

        var evn = event, eventDoc, doc, body, button = evn.button;
        evn.target = evn.target || evn.srcElement; // Calculate pageX/Y if missing and clientX/Y available
        if (evn.pageX == null && evn.clientX != null) {
            eventDoc = evn.target.ownerDocument || document;
            doc = eventDoc.documentElement;
            body = eventDoc.body;
            evn.pageX = evn.clientX + (doc && doc.scrollLeft || body && body.scrollLeft || 0) - (doc && doc.clientLeft || body && body.clientLeft || 0);
            evn.pageY = evn.clientY + (doc && doc.scrollTop || body && body.scrollTop || 0) - (doc && doc.clientTop || body && body.clientTop || 0);
        }
        if (!evn.PReventDefault) {
            evn.preventDefault = function () {
                this.returnValue = false;
            }
        }
        if (!evn.stopPropagation) {
            evn.stopPropagation = function () {
                this.cancelBubble = true;
            }
        }
        if (evn.which == null && (evn.charCode != null || evn.keyCode != null)) {
            evn.which = evn.charCode != null ? evn.charCode : evn.keyCode;
        } // Add which for click: 1 === left; 2 === middle; 3 === right // Note: button is not normalized, so don't use it
        if (!evn.which && button !== undefined) {
            evn.which = (button & 1 ? 1 : (button & 2 ? 3 : (button & 4 ? 2 : 0)));
        }
        return evn
    }

    function getOffset(o) {
        var left = 0, top = 0;
        while (o != null && o != document.body) {
            top += o.offsetTop;
            left += o.offsetLeft;
            o = o.offsetParent;
        }
        return {left: left, top: top};
    }

    $.fn.ImgOperation=function($b_){
        $b=$b_;
        d=$b_;
        ww = parseInt($b.style.width);
        wh = parseInt($b.style.height);
        i = $b.getElementsByTagName('img')[0];
        img = i.style;
        imgw = parseInt(img.width);
        imgh = parseInt(img.height);
        scaleSize = 1;
        
        imgOpetion();
    };
    
    $.fn.InitImgState=function () {
        rs();
    };

    function rs() {
        var w, h; //以完全显示图片为基准,如果改为>，则为以铺满屏幕为基准
        if (ww / wh < imgw / imgh) {
            w = ww;
            h = imgh * ww / imgw;
            bgX = 0;
            bgY = -(h - wh) / 2;
            scaleSize = ww / imgw; //初始比率
        } else {
            w = imgw * wh / imgh;
            h = wh;
            bgX = -(w - ww) / 2;
            bgY = 0;
            scaleSize = wh / imgh;
        }
        img.width = w + "px";
        img.height = h + "px";
        img.left = bgX + "px";
        img.top = bgY + "px";
    }

    function imgOpetion() {
        var bind = function (b, a, c) {

            b.addEventListener ?
                b.addEventListener(a, function (event) {c.call(b, evnt(event));}, false)
                : b.attachEvent("on" + a, function (event) {c.call(b, evnt(window.event));});

        }, on = function (b, o) {
            for (var a in o) {
                bind(b, a, o[a]);  //document  事件名  o.a
            }
        };

        rs();
        /* Init */
        on(d, {
            "mousedown": function (e) { //按中建快速还原大小/
                // console.log("clickDown");
                if (e.which === 2) {
                    rs();
                }
                if (e.which === 1 && e.target && (e.target === i || e.target === $b)) {

                    isRun = true;
                    startX = e.pageX;
                    startY = e.pageY;
                    e.preventDefault();
                }
            },
            "mouseup": function (e) {
                // console.log("resetUp");
                if (e.which !== 1) {
                    return;
                }
                img.cursor = "default";
                isRun = false;
                if (typeof(rX) !== "undefined")//这个判断原作没有，去掉该判断会出现单击后，放大缩小不是鼠标位置的情况；处理加载后就点击的情况；即rX是undefined

                {
                    bgX = rX;
                    bgY = rY;
                }
                e.preventDefault();
            },
            "mousemove": function (e) {
                if (e.which !== 1) {
                    return;
                }
                if (isRun) {
                    e.preventDefault();
                    img.cursor = "move";
                    endX = e.pageX;
                    endY = e.pageY;
                    rX = bgX + endX - startX;
                    rY = bgY + endY - startY;
                    img.left = rX + "px";
                    img.top = rY + "px";
                }
            },
            "mousewheel": function (e) { //以鼠标为中心缩放，同时进行位置调整
                var deltaY = 0;
                var x = e.pageX;
                var y = e.pageY;
                e.preventDefault();
                if (e.target && (e.target === i)) {

                    var l = getOffset($b);
                    x = x - l.left;
                    y = y - l.top;
                    var p = (e.wheelDelta) / 1200;
                    var ns = scaleSize;
                    ns += p;
                    ns = ns < 0.1 ? 0.1 : (ns > 5 ? 5 : ns); //可以缩小到0.1,放大到5倍 //计算位置，以鼠标所在位置为中心 //以每个点的x、y位置，计算其相对于图片的位置，再计算其相对放大后的图片的位置
                    bgX = bgX - (x - bgX) * (ns - scaleSize) / (scaleSize);
                    bgY = bgY - (y - bgY) * (ns - scaleSize) / (scaleSize);
                    scaleSize = ns; //更新倍率
                    img.width = imgw * ns + "px";
                    img.height = imgh * ns + "px";
                    img.top = bgY + "px";
                    img.left = bgX + "px";
                }
            }
        });
    }

})(jQuery);
