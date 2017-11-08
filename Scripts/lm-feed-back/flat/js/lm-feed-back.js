
//显示一个消息提示框
$.extend({
    MessageType:{
        Info:'Info',
        Success:'Success',
        Error:'Error',
        Warning:'Warning'
    },
    AllMessage:[],
    showMessage:function (opt){
        var TimeOut;
        var defaults = {
            time:3000,
            message:'',
            maxCount:3,
            type: $.MessageType.Info,
            icon:null,
            color:null
        };
        var options = $.extend({},defaults,opt);

        switch (options.type){
            case $.MessageType.Info:
                options.icon = "fa-info-circle";
                options.color = "#5c7ee5";
                break;
            case $.MessageType.Success:
                options.icon = "fa-check-circle";
                options.color = "#00a854";
                break;
            case $.MessageType.Error:
                options.icon = "fa-times-circle";
                options.color = "#f04134";
                break;
            case $.MessageType.Warning:
                options.icon = "fa-exclamation-circle";
                options.color = "#ffbf00";
                break;
        }


        var view = $('<div class="lm-message-box"><i class="fa $icon$" style="color:$color$"></i><span>$message$</span></div>'.bind(options));
        $('body').append(view);
        view.css("margin-left",-1*view.width()/2);
        if ($.AllMessage.length >= options.maxCount){
            var v = $.AllMessage[0];
            v.hide();
            v.remove();
            $.AllMessage.splice(0,1);
            for (var i = 0; i < $.AllMessage.length; i++){
                var vv = $.AllMessage[i];
                vv.css("margin-top",vv.height() * i * 1.3);
            }
        }
        view.css("margin-top",view.height()* $.AllMessage.length*1.3);
        $.AllMessage.push(view);
        view.id = $.AllMessage.length;

        view.show();

        view.mouseover(
            function(){
                stopTimeOut(TimeOut);
            }
        ).mouseout(
            function(){
                TimeOut = startTimeOut();
            }
        );

        TimeOut = startTimeOut();

        function startTimeOut(){
            var time = setTimeout(function () {
                view.hide();
                view.remove();
                for (var i = 0; i < $.AllMessage.length; i++){
                    if (view.id == $.AllMessage[i].id){
                        $.AllMessage.splice(i,1);
                    }
                }
                for (var j = 0; j < $.AllMessage.length; j++){
                    var vv = $.AllMessage[j];
                    vv.css("margin-top",vv.height() * j * 1.3);
                }
            },options.time);

            return time;
        }

        function stopTimeOut(time){
            if (time){
                clearTimeout(time);
            }
        }

    }
});

//显示一个模态对话框
$.extend({
    ModalType:{
        Base:'Base',
        Input:'Input'
    },
    showModal:function(opt){
        var defaults = {
            title:'提示',
            message:'您确定要这么做吗?',
            message_tip: "",
            type: $.ModalType.Base,
            ok:null,
            btns:2
        };
        var options = $.extend({},defaults,opt);
        var view;
        switch (options.type){
            case $.ModalType.Base:
                if (options.btns === 2) {
                    view = $('<div class="ui-modal-box-full"><div class="ui-modal-box"> <span class="ui-modal-title">$title$</span> <span class="ui-modal-message icon-answer">$message$<em>$message_tip$</em></span><div class="ui-modal-footer"><button class="danger">删除</button><button class="success">取消</button></div></div></div>'.bind(options));
                } else if (options.btns === 1) {
                    view = $('<div class="ui-modal-box-full"><div class="ui-modal-box"> <span class="ui-modal-title">$title$</span> <span class="ui-modal-message icon-answer">$message$<em>$message_tip$</em></span><div class="ui-modal-footer"><button class="danger" style="display: none;">删除</button><button class="success">取消</button></div></div></div>'.bind(options));
                }
                break;

            case $.ModalType.Input:
                view = $('<div class="ui-modal-box-full"><div class="ui-modal-box"> <span class="ui-modal-title">$title$</span><div style="padding: 10px 0"> <input class="lm-input lm-input-default" style="width: 96%" type="text" placeholder="$message$"></div><div class="ui-modal-footer"><button class="lm-btn lm-btn-theme lm-bnt-done">确定</button><button class="lm-btn lm-btn-default lm-bnt-cancel">取消</button></div></div></div>'.bind(options));
                break;

            default:
                // TODO...
                break;
        }

        $('body').append(view);
        view.show();

        var box = $(".ui-modal-box");
        box.css("margin-left",-1*box.width()/2);
        box.css("margin-top",-1*box.height()/2);

        // 取消操作
        $(view.find(".ui-modal-box  .success")).click(function(){
            view.hide();
            view.remove();
        });

        // 删除操作
        $(view.find(".ui-modal-box .danger")).click(function(){
            if(options.ok){
                switch (options.type) {
                    case $.ModalType.Base:
                        options.ok();
                        view.hide();
                        view.remove();
                        break;
                    case $.ModalType.Input:
                        var val = $(view.find(".lm-input-default")).val();
                        if (val){
                            options.ok(val);
                            view.hide();
                            view.remove();
                        }else {
                            $.showMessage({message:'请输入'+options.title+'名称'});
                        }
                        break;
                }

            }else {
                view.hide();
                view.remove();
            }
        });

    }
});
//显示一个模态对话框
$.extend({
    showMDialog:function(opt){
        var defaults = {
            title:'窗口',
            OnConfirm:function () {
                $.showMessage({message:'刚确认了一个对话框'});
                return true;
            },
            width:600,
            height:400,
            Content:'<div>这是一个弹出页面<button mdialogbtn="close">关闭</button><button mdialogbtn="confirm">确定</button></div>',
        };
        var options = $.extend({},defaults,opt);
        var view = $('<div class="ui-modal-box-full"><div class="ui-modal-box"><span class="ui-modal-title">$title$</span><div style="padding: 10px 0"> </div></div></div>'.bind(options));
        var box = view.find(".ui-modal-box");
        box.css("width",options.width);
        box.css("height",options.height);
        box.css("margin-left",-options.width/2);
        box.css("margin-top",-options.height/2);
        var content = $(options.Content);
        content.appendTo(box.find(">div:first"));
        $('body').append(view);
        view.show();
        $(view.find("[mdialogbtn=confirm]")).click(function(){
            if(options.OnConfirm)
            {
                if(!options.OnConfirm(content))
                {
                    return;
                }
            }
            view.hide();
            view.remove();
        });
        $(view.find("[mdialogbtn=close]")).click(function(){
            view.hide();
            view.remove();
        });


    }

});

//显示一个通知框
$.extend({
    NotificationType:{
        Info:'Info',
        Success:'Success',
        Error:'Error',
        Warning:'Warning'
    },
    AllNotification:[],
    showNotification:function (opt){
        var TimeOut;
        var defaults = {
            time:5000,
            title:'',
            message:'',
            maxCount:3,
            type: $.NotificationType.Info,
            icon:null,
            color:null,
            see:null
        };
        var options = $.extend({},defaults,opt);

        switch (options.type){
            case $.NotificationType.Info:
                options.icon = "fa-info-circle";
                options.color = "#5c7ee5";
                break;
            case $.NotificationType.Success:
                options.icon = "fa-check-circle";
                options.color = "#00a854";
                break;
            case $.NotificationType.Error:
                options.icon = "fa-times-circle";
                options.color = "#f04134";
                break;
            case $.NotificationType.Warning:
                options.icon = "fa-exclamation-circle";
                options.color = "#ffbf00";
                break;
        }


        var view = $('<div class="ui-notification-box"><i class="fa $icon$" style="font-size:28px;float:left;color:$color$"></i><div class="ui-notification-content"><div><span class="ui-notification-title">$title$</span><i class="fa fa-close ui-close-i"></i></div><div class="ui-notification-message"><span>$message$</span></div><button class="lm-btn lm-btn-theme" style="float: right;">查看信息</button></div></div></div>'.bind(options));
        $('body').append(view);
        //view.css("margin-left",-1*view.width()/2);
        view.css("right",-1*view.width());
        if ($.AllNotification.length >= options.maxCount){
            var v = $.AllNotification[0];
            v.fadeOut("slow");
            v.remove();
            $.AllNotification.splice(0,1);
            for (var i = 0; i < $.AllNotification.length; i++){
                var vv = $.AllNotification[i];
                vv.css("margin-top",vv.height() * i * 1.5);
                vv.animate({right:'10px'});
            }
        }
        view.css("margin-top",view.height()* $.AllNotification.length*1.5);
        $.AllNotification.push(view);
        view.id = $.AllNotification.length;

        view.show();

        view.mouseover(
            function(){
                stopTimeOut(TimeOut);
            }
        ).mouseout(
            function(){
                TimeOut = startTimeOut();
            }
        );

        view.animate({right:'10px'});

        $(view.find(".ui-close-i")).click(function(){
            view.fadeOut("slow");
            view.remove();
        });

        $(view.find(".ui-notification-bnt")).click(function(){
            view.fadeOut("slow");
            view.remove();
            if(options.see){
                options.see(view);
            }
        });

        TimeOut = startTimeOut();

        function startTimeOut(){
            var time = setTimeout(function () {
                view.fadeOut("slow");
                view.remove();
                for (var i = 0; i < $.AllNotification.length; i++){
                    if (view.id == $.AllNotification[i].id){
                        $.AllNotification.splice(i,1);
                    }
                }
                for (var j = 0; j < $.AllNotification.length; j++){
                    var vv = $.AllNotification[j];
                    vv.css("margin-top",vv.height() * j * 1.5);
                    vv.animate({right:'10px'});
                }
            },options.time);
            return time;
        }

        function stopTimeOut(time){
            if (time){
                clearTimeout(time);
            }
        }

    }
});
