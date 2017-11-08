/**
 * Created by Lsh179 on 2017/8/24.
 */

var wsImpl = window.WebSocket || window.MozWebSocket;
var socketCore={
    ServerState:'stop',
    SocketServer:null,
    SocketServerInfo:{
        SocketUrl:'',
        SocketProtocols:'',
        ServerState:false,
        UID:'',
        Token:'',
        SystemName:''
    },
    Init:function (config,option) {
        this.SocketServerInfo = $.extend({},this.SocketServerInfo,config,option);
        this._start();
    },
    LoadConfig:function (apiurl,option) {
        var tmp = this;
        ajaxWebApiSync(apiurl,{},WebApiAction.Get,function (data) {
            tmp.SocketServerInfo = $.extend({},tmp.SocketServerInfo,data[0],option);
            tmp._start();
        });
    },
    UserMessages:{
        name:"UserMessagesModel",
        UnreadTotalcount:0,
        UnreadMessagecount:0,
        UnreadNoticecount:0,
        Messages:[],
        GetMessageLists:function () {
            var rtvalue = new Array();
            if(this.Messages)
            {
                for(var mkey in this.Messages)
                {
                    if($.type(this.Messages[mkey])==='function')
                    {
                    }else {
                        rtvalue.push(this.Messages[mkey]);
                    }
                }
                rtvalue = rtvalue.sort(function (a,b) {
                    return b.SendOrder-a.SendOrder;
                });
            }
            return rtvalue;
        },
        OnReciverMessage:null,
        LoadMessageLists:null,
        MessageReCounted:null
    },
    P2pMessages:[],
    ListenerModel:{},
    _onlineUsers:[],
    _onlineDepts:[],
    QuickNoticeAction:[],
    _sendMessageQueue:[],
    _start:function () {
        this.ServerState="start";
        var tmp = this;
        if(!this.SocketServer)
        {
            this.SocketServer = new wsImpl("{SocketUrl}/{UID}/{Token}/{SystemName}".format(this.SocketServerInfo),this.SocketServerInfo.SocketProtocols);
            this.SocketServer.onopen=function () {
                tmp._onopen();
            };
            this.SocketServer.onclose=function () {
                tmp._onclose();
            };
            this.SocketServer.onmessage=function (e) {
                tmp._onmessage( e.data );
            };
        }
    },
    _onopen:function () {
        this.ServerState = 'started';
        $.showMessage({ message: '已成功连接消息服务器', type: $.MessageType.Info });
        this.send(null);
    },
    send:function (message) {
        if(message)
        {
            this._sendMessageQueue.unshift(message);
        }
        if(this.ServerState=="started")
        {
            while (this._sendMessageQueue.length>0)
            {
                var sendmsg = this._sendMessageQueue.pop();
                this.SocketServer.send(sendmsg);
            }
        }
    },
    _onclose:function () {
        $.showMessage({ message: '消息服务器断开连接', type: $.MessageType.Info });
    },
    _onmessage:function (datastr) {
      try {
          var data = JSON.parse(datastr);
          if(data && data.Type)
          {
              switch(data.Type)
              {
                  case "UserMessageNotice":
                      this._handUserMessageNotice(data);
                      break;
                  case "P2PMessageNotice":
                      this._handP2PMessageNotice(data);
                      break;
                  case "ModelNotice":
                      this._handModelNotice(data);
                      break;
                  case "QuickNotice":
                      this._handQuickNotice(data);
                      break;
              }
          }else
          {
              $.showMessage({ message: '不识别消息类型', type: $.MessageType.Warning });
              //alert("不识别消息类型!");
          }
      }catch (e){
          $.showMessage({ message: '消息处理出错', type: $.MessageType.Error });
        //  alert("消息处理出错!");
      }
    },
    _handModelNotice:function (data) {
        if(data.ModelName&&this.ListenerModel[data.ModelName].length>0)
        {
            for(var i=0;i<this.ListenerModel[data.ModelName].length;i++)
            {
                this.ListenerModel[data.ModelName][i](data.NoticeType,data.EntityId,data.EntityJson?JSON.parse(data.EntityJson):{} ,data.OldEntityJson?JSON.parse(data.OldEntityJson):{});
            }
        }
    },
    _handP2PMessageNotice:function (data) {
        switch(data.NoticeType)
        {
            case "Add":
                $.showMessage({message: data.Contents[0].Content+'('+data.Contents[0].Sendor+')', type: $.MessageType.Info});
                if(this.P2pMessages.Add)
                {
                    this.P2pMessages.Add(data.Contents[0]);
                }
                break;
            case "List":
                if(this.P2pMessages.List)
                {
                    this.P2pMessages.List(data.Contents);
                }
                break;
            case "Count":
                if(this.P2pMessages.Count)
                {
                    this.P2pMessages.Count(data.Contents);
                }
                break;
            case "Clear":
                if(this.P2pMessages.Count)
                {
                    this.P2pMessages.Count(data.Contents[0]);
                }
                break;
        }
    },
    _handUserMessageNotice:function (data) {
        switch(data.NoticeType)
        {
            case "Add":
                if(!this.UserMessages.Messages[data.Messages[0].Messageid])
                {
                    this.UserMessages.Messages[data.Messages[0].Messageid] = data.Messages[0];
                    $.showMessage({message: data.Messages[0].Title, type: $.MessageType.Info});
                    this.UserMessages.UnreadTotalcount +=1;
                    if(!data.Messages[0].AutoRead)
                    {
                        this.UserMessages.UnreadMessagecount +=1;
                    }else {
                        this.UserMessages.UnreadNoticecount +=1;
                    }
                    if(this.UserMessages.MessageReCounted)
                    {
                        this.UserMessages.MessageReCounted( this.UserMessages.UnreadTotalcount,this.UserMessages.UnreadMessagecount,this.UserMessages.UnreadNoticecount);
                    }
                    if(this.UserMessages.OnReciverMessage)
                    {
                        this.UserMessages.OnReciverMessage(data.Messages[0]);
                    }
                    if(this.UserMessages.LoadMessageLists)
                    {
                        this.UserMessages.LoadMessageLists(this.UserMessages.GetMessageLists());
                    }
                }
                break;
            case "Read":
                this.UserMessages.UnreadTotalcount -=1;
                if(!data.Messages[0].AutoRead)
                {
                    this.UserMessages.UnreadMessagecount -=1;
                }else {
                    this.UserMessages.UnreadNoticecount -=1;
                }
                if(this.UserMessages.Messages[data.Messages[0].Messageid])
                {
                    this.UserMessages.Messages[data.Messages[0].Messageid].Read=true;
                }
                if(this.UserMessages.MessageReCounted)
                {
                    this.UserMessages.MessageReCounted( this.UserMessages.UnreadTotalcount,this.UserMessages.UnreadMessagecount,this.UserMessages.UnreadNoticecount);
                }
                if(this.UserMessages.LoadMessageLists)
                {
                    this.UserMessages.LoadMessageLists(this.UserMessages.GetMessageLists());
                }
                break;
            case "List":
                if(data.Messages&&data.Messages.length>0)
                {
                    for(var i=0;i<data.Messages.length;i++)
                    {
                        this.UserMessages.Messages[data.Messages[i].Messageid] = data.Messages[i];
                    }
                }
                if(this.UserMessages.LoadMessageLists)
                {
                    this.UserMessages.LoadMessageLists(this.UserMessages.GetMessageLists());
                }
                break;
            case "Count":
                this.UserMessages.UnreadTotalcount = data.UnReadcount;
                this.UserMessages.UnreadMessagecount = data.UnReadnormalcount;
                this.UserMessages.UnreadNoticecount = data.UnReadautocount;
                if(this.UserMessages.MessageReCounted)
                {
                    this.UserMessages.MessageReCounted( this.UserMessages.UnreadTotalcount,this.UserMessages.UnreadMessagecount,this.UserMessages.UnreadNoticecount);
                }
                break;
        }
    },
    _handQuickNotice:function (data) {
        if(data.NoticeType=='UserpswdChanged'&&Loginout)
        {
            $.showMessage({
                message: data.NoticeContent, type: $.MessageType.Info
            });
            Loginout();
            return;
        }
        if(data.NoticeType&&this.QuickNoticeAction[data.NoticeType])
        {
            this.QuickNoticeAction[data.NoticeType](data.NoticeContent);
        }else{
            if(data.NoticeContent)
            {
                $.showMessage({message: data.NoticeContent, type: $.MessageType.Info});
            }
        }
    },

    AddModelListener:function (modelName,callback) {
        if(!this.ListenerModel[modelName])
        {
            this.ListenerModel[modelName] = new Array();
        }
        this.ListenerModel[modelName].push(callback);
        this.send(JSON.stringify({
            MessageType:"RegisterModel",
            Content:modelName
        }));
    },

    SetReciverMessageAction:function (reciverMessage,loadMessageLists,messageReCounted) {
        this.UserMessages.OnReciverMessage = reciverMessage;
        this.UserMessages.LoadMessageLists = loadMessageLists;
        this.UserMessages.MessageReCounted = messageReCounted;
    },
    ReadUserMessage:function (msg) {
     //   delete this.UserMessages.Messages[msg.Messageid];
        this.UserMessages.Messages[msg.Messageid].Read = true;
        if(!msg.Read)
        {
            this.UserMessages.UnreadTotalcount -=1;
            if(!msg.AutoRead)
            {
                this.UserMessages.UnreadMessagecount -=1;
            }else {
                this.UserMessages.UnreadNoticecount -=1;
            }
            if(this.UserMessages.MessageReCounted)
            {
                this.UserMessages.MessageReCounted( this.UserMessages.UnreadTotalcount,this.UserMessages.UnreadMessagecount,this.UserMessages.UnreadNoticecount);
            }
            this.send(JSON.stringify({
                MessageType:"ReadMessage",
                Content:{
                    msgid:msg.Messageid
                }
            }));
        }
    },
    FreashUserMessage:function () {
        this.send(JSON.stringify({
            MessageType:"ListMessage",
            Content:{
                history:""
            }
        }));
    },
    LoadMoreUserMessage:function (lasttime) {
        this.send(JSON.stringify({
            MessageType:"ListMessage",
            Content:{
                history:lasttime
            }
        }));
    },
    AlterQuickNoticeAction:function (noticeType,callback) {
        this.QuickNoticeAction[noticeType] = callback;
    } ,
    ReadOnlineUser:function (UserChanged) {
        var soc = this;
        if(!this.ListenerModel['OnlineUserModel'])
        {
            this.ListenerModel['OnlineUserModel'] = new Array();
        }
        this.ListenerModel["OnlineUserModel"] .push(function (type,id,data,olddaata) {
            if(type=='Add')
            {
                soc._onlineDepts=[];
                soc._onlineUsers=[];
                for(var i=0;i<data.length;i++)
                {
                    if(!contains(soc._onlineDepts,data[i].DeptName))
                    {
                        soc._onlineDepts.push(data[i].DeptName)
                    }
                    if(data[i].DeptHuman)
                    {
                        for(var j=0;j<data[i].DeptHuman.length;j++)
                        {
                            data[i].DeptHuman[j].Dept=data[i].DeptName;
                            soc._onlineUsers.push(data[i].DeptHuman[j]);
                            soc._onlineUsers[data[i].DeptHuman[j].UserId] = data[i].DeptHuman[j];
                        }
                    }
                }
                if(UserChanged)
                {
                    UserChanged(soc._onlineUsers,soc._onlineDepts);
                }
            }
            if(type=='Edit'&&soc._onlineUsers[id])
            {
                soc._onlineUsers[id].OnlineState = true;
                if(UserChanged)
                {
                    UserChanged(soc._onlineUsers,soc._onlineDepts);
                }
            }
            if(type=='Deleted'&&soc._onlineUsers[id])
            {
                soc._onlineUsers[id].OnlineState = false;
                if(UserChanged)
                {
                    UserChanged(soc._onlineUsers,soc._onlineDepts);
                }
            }
        });
        this.send(JSON.stringify({
            MessageType:"ReadOnlineUsers",
            Content:''
        }));

    },
    SetPp2messageAction:function (reciver, counted, readed, clear) {
        this.P2pMessages.Add = reciver;
        this.P2pMessages.List = readed;
        this.P2pMessages.Count = counted;
        this.P2pMessages.Clear = clear;
    },
    GetP2pMessages:function (readid, lasttime) {
        if(readid==this.SocketServerInfo.UID)
        {
            return;
        }
        this.send(JSON.stringify({
            MessageType:"ReadP2PMessage",
            Content:{
                p2pid:readid,
                history:lasttime
            }
        }));
    },
    SendMessage:function (reciverid,msg) {
        if(reciverid==this.SocketServerInfo.UID)
        {
            return;
        }
        this.send(JSON.stringify({
            MessageType:"P2PMessage",
            Content:{
                userid:reciverid,
                message:msg
            }
        }));
    }
};
