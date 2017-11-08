function  formatImg(fileobj, serviceConfig) {
    var filetype = "File";
    var style = 'style="width: 110px; height:auto;"';
    switch (fileobj.extension.toLowerCase()) {
        case ".png":
        case ".jpg":
        case ".bmp":
        case ".ico":
        case ".gif":
        case ".tif":
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
            style = 'style="height: 96px;width: 90px;padding-top:5px;"';
    }


    
    fileobj.editclass = fileobj.edit ? 'edit' : 'read';
    fileobj.imgsrc = serviceConfig.fileService + "/" + filetype + "/Thumbnail/" + fileobj.id + "/para?uid="
        + serviceConfig.indenty + "&un=" + serviceConfig.indentyDisplay + "&proj=" + serviceConfig.project;
    fileobj.filehref = serviceConfig.fileService + "/" + filetype + "/Read/" + fileobj.id + "/para?uid="
        + serviceConfig.indenty + "&un=" + serviceConfig.indentyDisplay + "&proj=" + serviceConfig.project;
    fileobj.downhref = serviceConfig.fileService + "/" + filetype + "/Download/" + fileobj.id + "/para?uid="
        + serviceConfig.indenty + "&un=" + serviceConfig.indentyDisplay + "&proj=" + serviceConfig.project;
    fileobj.fancytype = filetype == "IMG" ? "" : "fancybox.iframe";// 
    var content = '<a  data-down="$downhref$" data-share="$filehref$" title="$filename$" href="$filehref$" rel="gallery" class="event_box fancybox $fancytype$" id="$entityid$"><img ' + style + '  src="$imgsrc$" />' +
        '<div class="$editclass$">' +
        '<input name="$sourcemark$_entity[]" type="hidden" value="$entityid$" />' +
        '<input name="$sourcemark$_name[]" type="hidden" value="$filename$" />' +
        '<input name="$sourcemark$_type[]" type="hidden" value="$extension$" /> ' +
        '<input name="$sourcemark$_id[]" type="hidden" value="$id$" />' +
        '<span class="filename" row="1">$filename$</span>' +
        '<div class="oprate">' +
        '<span title="编辑" class="opbtn edit_span" ><span class="glyphicon glyphicon-pencil"></span></span>' +
        '<span title="删除" class="opbtn delete_span" ><span class="glyphicon glyphicon-remove"></span></span>' +
        '<span title="下载" class="opbtn download_span" ><span class="glyphicon glyphicon-download"></span></span>' +
        '<sapn title="分享" class="opbtn share_span"  ><span class="glyphicon glyphicon-share"></span></span>' +
        '</div>' +
        '</div>' + '</a>';
    content = content.replace(/\$\w+\$/gi, function (matchs) {
        var returns = fileobj[matchs.replace(/\$/g, "")];
        return (returns + "") == "undefined" ? "" : returns;
    });
    return content;
}
$(document).on("mousedown", ".oprate", function (e) {
    e.preventDefault();
});
$(document).on("mousedown", ".edit_span", function (e) {
    e.preventDefault();
    var edithandler = $(this);
   
    $.confirm({
        content: ' <input type="text" class="confirm_input" value="' + edithandler.parent().parent().find(".filename").text() + '" />',
        title: '修改名称',
        cancelButton: '取消', // hides the cancel button.
        confirmButton: '确定',
        cancelButtonClass: 'btn-info',
        confirm: function () {
            var val = this.$content.find('input').val(); // get the input value.
            if (val.trim() == '') { // validate it.
                var input = this.$content.find('input');
                input.addClass("error");
                setTimeout(function() {
                    input.removeClass("error");
                }, 800);
                return false; // dont close the dialog. (and maybe show some error.)
            }
            else {
                edithandler.parent().parent().find(".filename").text(val);
                edithandler.parent().parent().parent().attr("title", val);
                var pid = edithandler.parent().parent().parent().attr("id");
                var selector = 'input[name$="_name[]"]';
                edithandler.parent().parent().find(selector).val(val);
            }

        }
    });
});
$(document).on("mousedown", ".delete_span", function (e) {
    e.preventDefault();
    var deletehandler = $(this);
    $.confirm({
        content: '是否删除？',
        title: '删除确认',
        cancelButton: '取消', // hides the cancel button.
        confirmButton: '确定',
        cancelButtonClass: 'btn-info',
        confirm: function () {
            var eventbox = deletehandler.parent().parent().parent().remove();
        }
    });
});


$(document).on("mousedown",".share_span", function (e) {
    e.preventDefault();
    var deletehandler = $(this);
    var text = deletehandler.parent().parent().parent().data("share");
    if (window.clipboardData) {
        window.clipboardData.setData('text', text);
        $.alert({
            title: '提示:',
            content: '文件地址已放入剪贴板!',
            confirmButton: '确定',
            confirmButtonClass: 'btn-info',
            confirm: function() {
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


//$(document).on("mousedown",".share_span", function (e) {
//    e.preventDefault();
//    var deletehandler = $(this);
//    var isload = false;
//    if (!isload) {
//        $(this).zclip({
//            path: '../script/zclip/ZeroClipboard.swf', //记得把ZeroClipboard.swf引入到项目中 
//            copy: function() {
//                return $(deletehandler).parent().parent().parent().data("down");
//            },
//            afterCopy: function() { /* 复制成功后的操作 */
//                alert("☺ 复制成功</div></div>");
//            }
//        });
//        isload = true;
//        $(this).mousedown();
//    }
//});

    



$(document).on("mousedown", ".download_span", function (e) {
    e.preventDefault();
    var downloadhandler = $(this);
    $.confirm({
        content: '是否下载？',
        title: '下载确认',
        cancelButton: '取消', // hides the cancel button.
        confirmButton: '确定',
        cancelButtonClass: 'btn-info',
        confirm: function () {
            window.open(downloadhandler.parent().parent().parent().data("down"),"_blank");
        }
    });
   //
});