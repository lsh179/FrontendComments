/**
 * Created by Lsh179 on 2017/8/30.
 */
var  MessageManagerModel = MVVM.define({
    name:"MessageManagerModel",
    UserMessageUnread:0,
    P2pMessageUnread:0,
    MessageBoxView:false,
    MessageBoxTitle:'',
    CUid:'',
    CUname:'',
    ViewMessageType:'',
    UserMessageLists:[],
    P2pShowMessages:[],
    P2pShowUsers:[],
    InputP2pmessage:'',
    SelectP2pUser:null,
    OnlineUsers:[],
    OnLineDepts:[],
    MessageAction:{},
    SeeP2p:false,
    opacity:0,
    DefaultHtml:'<div class="MessageBox" lm-controller="MessageManagerModel"><div class="Message_fold" lm-css-opacity="opacity" lm-vcase="MessageBoxView" lm-click="ShowMessageBox" vcaseexp="MessageBoxView==false" ><div   ><i class="fa fa-envelope-o"></i><span class="altinfo" lm-vcase="UserMessageUnread" vcaseexp="UserMessageUnread&gt;0"></span>消息(<span lm-text="UserMessageUnread"></span>)</div><div lm-click="ShowMessageBox"  lm-vcase="SeeP2p" vcaseexp="SeeP2p==true"><i class="fa fa-comments-o"></i><span class="altinfo" lm-vcase="P2pMessageUnread" vcaseexp="P2pMessageUnread&gt;0"></span>聊天(<span lm-text="P2pMessageUnread"></span>)</div></div><div class="Message_Window"  lm-vcase="MessageBoxView" vcaseexp="MessageBoxView==true" ><div class="header"><div class="title" lm-text="MessageBoxTitle"></div><div class="right"><div style="display: inline-block;width: 100px;" lm-vcase="SeeP2p" vcaseexp="SeeP2p==true"><select  lm-text="ViewMessageType" class="dropdown"><option value="0">查看消息</option><option value="1">站内聊天</option></select></div><span lm-click="closeMessageWindow"><i class="fa fa-close"></i></span></div></div><div class="bcontent"><div class="P2pMessageLists" lm-vcase="ViewMessageType" vcaseexp="ViewMessageType==1" ><div class="leftuser"><div class="navbox"><ul class="nav"><li lm-forjsons="P2pShowUsers" lm-click="SelectUser" lm-if="OnlineState==false"><a href="#" lm-text="Label"></a></li><li lm-forjsons="P2pShowUsers" lm-click="SelectUser"><a href="#" style="color:red">{{Label}}</a></li></ul></div></div><div class="rightbody"><div class="contentbtn" lm-click="FreashMoreMsg"><span>查看更多</span></div><div><div lm-forjsons="P2pShowMessages"  lm-if="Sendid==$model$.CUid" class="P2pMessageLeftItem"><div class="UName" lm-text="Sendor"></div><div class="NMContent">{{Content}}<div class="STime" lm-text="Sendtime"></div></div></div><div  class="P2pMessageRightItem"><div class="UName" lm-text="Sendor"></div><div class="NMContent">{{Content}}<div class="STime" lm-text="Sendtime"></div></div></div></div></div><div class="messageinput"><input type="text" lm-text="InputP2pmessage"/><button lm-click="SendP2pMsg">发送</button></div></div><div class="UserMessageLists"  lm-vcase="ViewMessageType" vcaseexp="ViewMessageType==0" ><div><div lm-forjsons="UserMessageLists" class="UserMessageItem"><div class="UName" lm-text="Sendor"></div><div class="UmessageType"><span lm-vcase="AutoRead" vcaseexp="AutoRead==false">消息</span><span lm-vcase="AutoRead" vcaseexp="AutoRead==true">通知</span></div><div class="NMContent"><span  lm-click="ReadMessage" lm-css-color="FontColor">{{Title}}</span><div class="STime" lm-text="SendTime"></div></div></div></div><div class="contentbtn"><span lm-click="loadmoreUserMessage">查看更多</span></div></div></div></div></div>',
    P2pUserMessages:[],
    Init:function (container,uid,realname) {
        container.append(this.DefaultHtml);
        MVVM.scan();
        container.ScanSelect();
        var manager = this;
        this.SeeP2p = true;
        socketCore.SetReciverMessageAction(function () {},function (allmsgs) {
                    manager.UserMessageLists  = [];
                    manager.UserMessageLists  = allmsgs.select(function (m) {
                        var nobj = deepClone(m);
                        nobj.ReadMessage=function (ele,model) {
                            if(model.AutoRead==true)
                            {
                                if(model.MoudleName&& manager.MessageAction[model.MoudleName])
                                {
                                    manager.MessageAction[model.MoudleName](model);
                                }else {
                                    $.showMessage({message: model.Content, type: $.MessageType.Info});
                                }
                            }else {
                                $.showMDialog({title:"消息信息",width:400,height:150
                                    ,Content:'<div style="line-height: 30px;text-align: center;">'+model.Content+'</div><div style="display: inline-block"><button  mdialogbtn="close" style="width: 70px;height: 24px;margin: 10px;">关闭</button></div></div>'
                                });
                            }
                            if(!model.Read)
                            {
                                socketCore.ReadUserMessage(model);
                                model.Read=true;
                                model.FontColor="#ccc";
                                manager.ApplyProp("UserMessageLists");
                            }
                        };
                        if(m.Read)
                        {
                            nobj.FontColor="#ccc";
                        }else {
                            nobj.FontColor="#000";
                        }
                        return nobj;
                    });
                },function (tcount) {
                    manager.UserMessageUnread = tcount;
                    if(manager.UserMessageUnread>0)
                    {
                        manager.opacity=0.5;
                    }else {
                        manager.opacity=0;
                    }
                });
        if(true)
        {
            this.CUid =uid; //socketCore.SocketServerInfo.UID;
            this.CUname = realname;
            socketCore.ReadOnlineUser(function (udata,odata) {
                    manager.OnlineUsers =deepClone(udata) ;
                    manager.OnLineDepts=[].concat(manager.P2pUserMessages);
                    for(var i=0;i<odata.length;i++)
                    {
                        var dname = odata[i];
                        var goback={
                            Label:'返回('+dname+')',
                            OnlineState:false,
                            SelectUser:function (ele, model) {
                                manager.P2pShowUsers = manager.OnLineDepts;
                            }
                        };
                        var deptinfo={
                            Label:dname,
                            Users:[],
                            OnlineState:false,
                            SelectUser:function (ele, model) {
                                manager.P2pShowUsers = model.Users;
                            }
                        };
                        var deptusers = manager.OnlineUsers.where(function (u) {
                            return u&&u.Dept==dname;
                        });
                        deptinfo.Users.push(goback);
                        for(var j=0;j<deptusers.length;j++)
                        {
                            deptinfo.Users.push({
                                Label:deptusers[j].RealName,
                                UserId:deptusers[j].UserId,
                                Sendid:deptusers[j].UserId,
                                Sendor:deptusers[j].RealName,
                                Dept:deptusers[j].Dept,
                                OnlineState:deptusers[j].OnlineState,
                                SelectUser:function (ele, model) {
                                    manager.SelectP2pUser = model;
                                }
                            });
                        }
                        manager.OnLineDepts.push(deptinfo);
                    }
                    manager.P2pShowUsers =  manager.OnLineDepts;
            });
            socketCore.SetPp2messageAction(function (data) {
                    var user =manager.GetChartUser($.extend({Count:0},data));
                    data.CUid=manager.CUid;
                    user.Messages.push(data);
                    if(  !manager.MessageBoxView || manager.ViewMessageType=='0'|| !manager.SelectP2pUser||manager.SelectP2pUser.UserId!=data.Sendid)
                    {
                        user.UnReadCount+=1;
                        user.Label = user.Sendor+ '('+user.UnReadCount+')';
                        manager.P2pUserMessagesChanged();
                    }else {
                        manager.P2pShowMessages = user.Messages;
                    }
            },function (datas) {
                manager.P2pUserMessages = [];
                for(var i=0;i<datas.length;i++)
                {
                    manager.GetChartUser(datas[i]);
                }
                manager.P2pUserMessagesChanged();
            },
            function (datas) {
               var user=manager.GetChartUser($.extend({Count:0}, manager.SelectP2pUser));
                for(var i=0;i<datas.length;i++)
                {
                    datas[i].CUid=manager.CUid;
                    user.Messages.unshift(datas[i]);
                }
                manager.P2pShowMessages = user.Messages;
                manager.P2pUserMessagesChanged();
            },
            function (data) {
                var user=manager.GetChartUser(data);
                user.UnReadCount=0;
                user.Label = user.Sendor;
                manager.P2pUserMessagesChanged();
            }
            );
        }
    },
    SetMessageAction:function (name,callback) {
        this.MessageAction[name]=callback;
    },
    GetChartUser:function (data) {
        var manager = this;
        var user = manager.P2pUserMessages.first(function (u) {
            return u.Sendid== data.Sendid;
        });
        if(!user) {
            user = {
                Label: data.Sendor +( data.Count>0 ? '(' + data.Count + ')':''),
                OnlineState: true,
                UnReadCount: data.Count,
                Sendor: data.Sendor,
                Sendid: data.Sendid,
                UserId: data.Sendid,
                Messages: [],
                Dept: '',
                SelectUser: function (ele, model) {
                    model.Label = model.Sendor;
                    manager.SelectP2pUser = model;
                }
            };
            manager.P2pUserMessages.push(user);
        }
        return user;
    },
    SendP2pMsg:function (ele, model) {
        var manager = model;
        if(model.SelectP2pUser&&model.SelectP2pUser.UserId&&model.SelectP2pUser.UserId!=socketCore.SocketServerInfo.UID)
        {
            socketCore.SendMessage(model.SelectP2pUser.UserId,model.InputP2pmessage);
            var user=manager.GetChartUser(model.SelectP2pUser);
            user.Messages.push({
                Sendtime : new Date().Format("MM-dd hh:mm:ss"),
                Sendid :manager.CUid,
                CUid:manager.CUid,
                Sendor : manager.CUname,
                Content :model.InputP2pmessage
            });
            manager.P2pShowMessages = user.Messages;
            manager.P2pUserMessagesChanged();
        }
        model.InputP2pmessage='';
    },
    loadmoreUserMessage:function (ele, model) {
        if(model.UserMessageLists.length>0)
        {
            var lasttime =new Date(new Date().Format("yyyy-")+model.UserMessageLists[model.UserMessageLists.length-1].SendTime).Format('yyyy-MM-dd hh:mm:59');
            socketCore.LoadMoreUserMessage(lasttime);
        }
    },
    ShowMessageBox:function (ele, model) {
        model.MessageBoxView = true;
        model.ViewMessageType='0';
    },
    closeMessageWindow:function (ele, model) {
        model.MessageBoxView = false;
    },
    FreashMoreMsg:function (ele,model) {
        var manager = model;
        if(model.SelectP2pUser&&model.SelectP2pUser.UserId&&model.SelectP2pUser.UserId!=socketCore.SocketServerInfo.UID)
        {
            var user=manager.GetChartUser(model.SelectP2pUser);
            if(user.UnReadCount>0)
            {
                socketCore.GetP2pMessages(model.SelectP2pUser.UserId,'');
            }else if(user.Messages.length>0){
                socketCore.GetP2pMessages(model.SelectP2pUser.UserId,new Date(new Date().Format('yyyy-')+user.Messages[0].Sendtime).Format('yyyy-MM-dd hh:mm:59'));
            }else {
                socketCore.GetP2pMessages(model.SelectP2pUser.UserId,new Date().Format('yyyy-MM-dd hh:mm:ss'));
            }
            manager.P2pUserMessagesChanged();
        }
        return
    },
    PropertyChanged: function (name, newvalue, oldvalue) {
            switch (name) {
                case "ViewMessageType":
                    if(newvalue=='0')
                    {
                        this.MessageBoxTitle="用户系统消息列表";
                        socketCore.FreashUserMessage();
                    }else {
                        this.MessageBoxTitle="用户聊天消息列表"+(this.SelectP2pUser?"("+this.SelectP2pUser.Dept+'-'+this.SelectP2pUser.Label+")":"");
                      //  socketCore.FreashUserMessage()
                    }
                    break;
                case "SelectP2pUser":
                    this.MessageBoxTitle="用户聊天消息列表"+(this.SelectP2pUser?"("+this.SelectP2pUser.Dept+'-'+this.SelectP2pUser.Label+")":"");
                    var user=this.GetChartUser(this.SelectP2pUser);
                    if (user.UnReadCount > 0) {
                        socketCore.GetP2pMessages(user.UserId, '');
                    }
                    this.P2pShowMessages = user.Messages;
                    break;

            }
    },
    P2pUserMessagesChanged:function () {
        var manager = this;
        var adddept = [];
        var count = 0;
        for(var i=0;i<manager.P2pUserMessages.length;i++)
        {
            var uid = manager.P2pUserMessages[i];
            if(manager.OnLineDepts.any(function (dept) {
                    return dept.UserId==uid.UserId;
                }))
            {
                continue;
            }else {
                adddept.push(uid);
            }
            if(uid.UnReadCount>0)
            {
                count +=1;
            }
        }
        manager.P2pMessageUnread = count;
        manager.OnLineDepts =adddept.concat(manager.OnLineDepts);
        if(manager.P2pShowUsers&&manager.P2pShowUsers.length>0&&manager.P2pShowUsers[0].Label.indexOf('返回')<0)
        {
            manager.P2pShowUsers =  manager.OnLineDepts;
        }
    }
});
