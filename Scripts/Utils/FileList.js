if (typeof jQuery === 'undefined') {
    throw new Error('jquery is request');
}
;
(function ($, document, window) {
    var MyFileList = function (selecter, filelistdata, serverConfig) {
        this.$selecter = $(selecter);
        this.listdatas = filelistdata;
        this.config = serverConfig;
        this._init();

    }

    $(document).on("mousedown", ".downloadfile_span", function (e) {
        var downloadhandler = $(this);
        $.confirm({
            content: '是否下载？',
            title: '下载确认',
            cancelButton: '取消', // hides the cancel button.
            confirmButton: '确定',
            cancelButtonClass: 'btn-info',
            confirm: function () {
                window.open(downloadhandler.parent().parent().parent().find("a").attr("data-down"), "_blank");
            }
        });
        //
    });

    $(document).on("mousedown", ".sharefile_span", function (e) {
        var deletehandler = $(this);
        var text = deletehandler.parent().parent().parent().find("a").attr("data-down");
        if (window.clipboardData) {
            window.clipboardData.setData('text', text);
            $.alert({
                title: '提示:',
                content: '文件地址已放入剪贴板!',
                confirmButton: '确定',
                confirmButtonClass: 'btn-info',
                confirm: function () {
                }
            });
        } else {
            $.alert({
                title: '提示:',
                content: '<div style="overflow: hidden;">文件地址:' + text + '</div>',
                confirmButton: '确定',
                confirmButtonClass: 'btn-info',
                confirm: function () {

                }
            });
        }
    });
    MyFileList.prototype = {
        constructor: MyFileList,
        _init: function () {
            var that = this;
            var length = that.listdatas.length;

            var panel = that._createPanel(that.listdatas, config);
            that.$selecter.append($(panel));
        },



        _createPanel: function (datas, serverConfig) {
            var that = this;
            var panelDiv = document.createElement("div");
            //$(panelDiv).attr("class", "panel");
            var title = that._createPanelTile("所有文件：" + datas.length);
            $(panelDiv).append($(title));
            var body = that._createPanelBody(datas, serverConfig);
            $(panelDiv).append($(body));
            return panelDiv;
        },
        _createPanelTile: function (title) {
            var tileDiv = document.createElement("div");
            //$(tileDiv).attr("class", "panel-heading filepanel_head");
            $(tileDiv).css("padding-bottom", "10px");
            $(tileDiv).attr("id", "headrow");

            var table = '<table style="width:100%"><tr><td align="left">' + title + '</td><td align="right">' + '<button style="padding-left: 0px; padding-right: 0px; padding-bottom: 0px; padding-top: 0px; line-height: 26px; width: 58px;font-size:13px;color:#030303;background-color:#f5f5f5" id="btnExport" class="btn btn-default" value="筛选" onclick="ShowFilterPanel();">筛选</button>' + '</td></tr></table>';
            $(tileDiv).html(table);
            return tileDiv;
        },
        _createPanelBody: function (datas, serverConfig) {
            var that = this;
            var bodyDiv = document.createElement("div");
            $(bodyDiv).attr("class", "panel_body");
            var body = that._createFileList(datas, serverConfig);
            $(bodyDiv).append($(body));
            return bodyDiv;
        },
        _createFileList: function (datas, serverConfig) {
            var that = this;
            var listUl = document.createElement("ul");
            if (datas) {
                var fileItems = datas;
                var length = fileItems.length;
                for (var i = 0; i < length; i++) {
                    var obj = fileItems[i];
                    var file = that._createFile(obj, serverConfig);
                    $(listUl).append($(file));
                }
            }
            return listUl;
        },
        _createFileshow: function (fileobj, serviceConfig) {
            var filetype = "File";
            var style = "";
            switch (fileobj.FileType) {
                case ".png":
                case ".jpg":
                case ".bmp":
                case ".ico":
                case ".gif":
                case ".jpge":
                    filetype = "IMG";
                    break;
                case ".doc":
                case ".docx":
                case ".ppt":
                case ".pptx":
                case ".pps":
                case ".zip":
                case ".jar":
                case ".html":
                case ".htm":
                    style = 'style="width: 96px; height: 96px;padding-top:10px;"';
            }
            fileobj.imgsrc = serviceConfig.fileService + "/" + filetype + "/Thumbnail/" + fileobj.FilePath + "/para?uid="
                + serviceConfig.indenty + "&un=" + serviceConfig.indentyDisplay + "&proj=" + serviceConfig.project;
            fileobj.filehref = serviceConfig.fileService + "/" + filetype + "/Read/" + fileobj.FilePath + "/para?uid="
                + serviceConfig.indenty + "&un=" + serviceConfig.indentyDisplay + "&proj=" + serviceConfig.project;
            fileobj.downhref = serviceConfig.fileService + "/" + filetype + "/Download/" + fileobj.FilePath + "/para?uid="
                + serviceConfig.indenty + "&un=" + serviceConfig.indentyDisplay + "&proj=" + serviceConfig.project;
            fileobj.fancytype = filetype == "IMG" ? "" : "fancybox.iframe"; // 
            var content = ' <div  class="file-panel"><a title="' + fileobj.Display + '" data-down="$downhref$" title="$filename$" href="$filehref$" rel="gallery" class=" file-box fancybox $fancytype$" id="$entityid$"><img class="filelist-img" ' + style + ' src="$imgsrc$" /> ' +
                '<div class="$editclass$">' +
                '<input name="$sourcemark$_entity[]" type="hidden" value="$entityid$" />' +
                '<input name="$sourcemark$_name[]" type="hidden" value="$filename$" />' +
                '<input name="$sourcemark$_type[]" type="hidden" value="$extension$" /> ' +
                '<input name="$sourcemark$_id[]" type="hidden" value="$id$" />' +
                '<span class="filename" row="1">$filename$</span>' +
                //'<div class="oprate">' +
                //'<span title="编辑" class="opbtn edit_span"><span class=" glyphicon glyphicon-pencil"></span></span>' +
                //'<span title="删除" class="opbtn delete_span"><span class=" glyphicon glyphicon-remove"></span></span>' +
                //'<span title="下载" class="opbtn download_span"><span class=" glyphicon glyphicon-download"></span></span>' +
                //'<sapn title="分享" class="opbtn share_span"  ><span class=" glyphicon glyphicon-share"></span></span>' +
                //'</div>' +
                '</div></a></div>';
            content = content.replace(/\$\w+\$/gi, function (matchs) {
                var returns = fileobj[matchs.replace(/\$/g, "")];
                return (returns + "") == "undefined" ? "" : returns;
            });
            return content;
        },
        _createFileName: function (filename) {
            if (!filename) filename = '';
            var content = ' <div class="file-name-div">'
                + '            <p class="file-name" title="' + filename + '">'
                + filename
                + '                          </p>'
                + '                      </div>';
            return content;
        },
        _createOtherInfo: function (username, datetime, stepname, upLocation, department, length) {
            if (username == undefined || username == null || username == "") {
                username = "未知";
            }
            if (datetime == undefined || datetime == null || datetime == "") {
                datetime = "";
            }
            if (upLocation == undefined || upLocation == null || upLocation == "") {
                upLocation = "无";
            }
            var oth = " ";
            if (department && length) {
                oth = '     <div class="file-otherinfo">部位：' + department + '</div>'
                       + '     <div class="file-otherinfo">长度：' + length + '</div>';
            }

            var content = '<div class="file-otherinfo-div">'
               + '     <div class="file-otherinfo">上传人：<span class="file-otherinfo-value">' + username + '</span></div>'
               + '     <div class="file-otherinfo">上传时间：<span class="file-otherinfo-value">' + datetime + '</span></div>'
               + '    <div class="file-otherinfo">上传地点：<span class="file-otherinfo-value">' + upLocation + '</span></div>'
               + oth
               + '   <div style="position: absolute;top: 32px; right: -3px;">'
               + '                                         <span style="display: inline-block; float: left; height: 20px;width:   10px;background:url(../resource/images/tag_bg_left.png) no-repeat "></span>'
               + '                                     <span style="color: #fff; font-size: 12px; padding-left: 5px;overflow: hidden; text-overflow: ellipsis; white-space: nowrap;max-width:100px; padding-right: 8px;display: inline-block;float: left; height: 20px;background:url(../resource/images/tag_bg_middle.png) repeat-x"  title="' + stepname + '">' + stepname + '</span>'
               + '                                   <span style="display: inline-block;float: left; width: 3px;height: 20px;background:url(../resource/images/tag_bg_right.png) no-repeat"></span>'
               + '                                 </div>'
               + '     </div>';
            return content;
        },
        _createUserInfo: function (username, time) {
            var content = ' <div class="file-user-div">'
                + '                            <span class="filetime border-right">'
                + '                               <i class="glyphicon glyphicon-user myioc"></i>'
                + '                              <span>' + username + '</span>'
                + '                          </span>'
                + '                          <span class="filetime">'
                + '                              <i class="glyphicon glyphicon-time myioc"></i>'
                + '                             <span><time datetime="' + time + '">' + time + '</time></span>'
                + '                         </span>'
                + '                     </div>';
            return content;
        },
        _createBtn: function () {
            var content = '<div class="file-btn-div">'
                + '                    <span>'
                + '                       <button class="btn  downloadfile_span defaultSmallbtn" >下载</button>'
                + '                 </span>'
                + '                <span>'
                + '                  <button class="btn sharefile_span defaultSmallbtn">分享</button>'
                + '            </span>'
                + '       </div>';
            return content;
        },
        _createFile: function (objData, serverConfig) {
            var that = this;
            var li = document.createElement("li");
            var div = document.createElement("div");
            $(li).append(div);
            // 创建容器
            var filePanel = document.createElement("div");
            $(filePanel).attr("class", "content-panel");
            $(div).append($(filePanel));

            //创建文件名
            var filename = that._createFileName(objData.Display);
            $(filePanel).append($(filename));
            //创建文件信息
            var otherInfo = that._createOtherInfo(objData.UserName, objData.UpTime, objData.FileStepName, objData.UpLocation, objData.Department, objData.Length);
            $(filePanel).append($(otherInfo));
            //创建用户信息
            //var userInfo = that._createUserInfo(objData.UserName, objData.UpTime);
            //$(filePanel).append($(userInfo));
            //创建文件展示框
            var fileshow = that._createFileshow(objData, serverConfig);
            $(filePanel).append($(fileshow));
            //创建按钮
            var btn = that._createBtn();
            $(div).append($(btn));
            return li;
        }
    },
$.fn.myfilelist = function (option, config) {
    if (option) {
        var data = new MyFileList(this, option, config);
    }
}
})(window.jQuery, window.document, window)