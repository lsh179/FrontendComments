// (function ($) {
//     var fileObj;
//     var backFileObj;
//     var stylesheets;
//     var sheet;
//     var upt;
//     var _serviceConfig;
//     var _upFunc;
//     var _cancelFunc;
//     var _complated = false;
//     var _returnObj = {};
//
//     $.fn.uploader = function (options, serviceConfig, upFunc, cancelFunc) {
//         var ops = $.extend(defaults, options);
//         _serviceConfig = serviceConfig;
//         _upFunc = upFunc;
//         _cancelFunc = cancelFunc;
//
//         return this.each(function () {
//             $(this).on("click", comfirm);
//         });
//     };
//     var Uploading = function () { };
//     Uploading.prototype = {
//         show: function (upFunc) {
//             _upFunc = upFunc;
//             comfirm();
//         }
//     }
//     $.fn.noclickuploader = function (options, serviceConfig, upFunc, cancelFunc) {
//         var ops = $.extend(defaults, options);
//         _serviceConfig = serviceConfig;
//         _upFunc = upFunc;
//         _cancelFunc = cancelFunc;
//         var up = new Uploading();
//         return up;
//     };
//     var defaults = {
//         fileSplitSize: 1024 * 1024
//     }
//     function comfirm() {
//         var _source = $(this);
//         var upt = '<div >' +
//             ' <div style="text-align: center"><input type="file" name="file" id="file" class="inputfile" />' +
//             '<label for="file">选择文件</label></div> <p>&nbsp;</p>' +
//             '<div id="file_effect_p"><a class="file-effect" data-name="" data-process="0%"></a>' +
//             ' <br /><div>保存名称：<input class="customer-file-effect" type="text" /><div> ' +
//             '<br /><button id="submitLink" class="btn file_link" data-loading-text="上传中"  data-uped-text="已上传"' +
//             ' data-complate-text="已完成">上传</button>' +
//             '&nbsp;<button id="cancelLink" class="btn file_link">取消</button></div></div><br /></div>' +
//             '<div style="text-align: center"> <button id="closeLink" class="btn file_link">取消</button></div><div style="position:absolute;left:48%;top:10%;z-index:9999;display:none" id="loadingDiv"><img src="http://192.168.1.45/Content/Resource/images/loading.gif" style="width:40px;height:40px;"/></div></div>';
//         var cf = $.dialog({
//             title: '文件上传',
//             content: upt,
//             columnClass: 'autoColumn',
//             closeIcon: false,
//             backgroundDismiss: false
//         });
//
//         $("#file_effect_p").hide();
//         $("#closeLink").click(function () {
//             cf.close();
//         });
//         $(".customer-file-effect").change(function () {
//             if ($(this).val() == "") {
//                 $("#submitLink").attr("disabled", "disabled");
//                 $(this).addClass("error");
//             }
//             else {
//                 $("#submitLink").removeAttr("disabled");
//                 $(this).removeClass("error");
//             }
//         })
//         var eleFile = document.getElementById("file");
//         stylesheets = document.styleSheets;
//
//         if (stylesheets) {
//             sheet = stylesheets[stylesheets.length - 1];
//         } else {
//             var style = document.createElement('style');
//             document.head.appendChild(style);
//         }
//         var currentFontSize = "0%";//获取当前伪元素字体大小。
//         var cssRulesLength = (sheet.cssRules.length);//不‘-1’是因为这样才是在最后一位，否则加入的样式会变成倒数第二
//
//         sheet.insertRule('.file-up::before{ width:' + currentFontSize + '}', cssRulesLength);//在最后一个style标签的最后位置添加当前字体大小样式。这么做是为了后面删除添加上去的cssRule，否则最后css表会变得巨大无比
//
//         eleFile.addEventListener("change", function (event) {
//             $("#submitLink").attr("disabled", "disabled");
//             _complated = false;
//             // 获取文件
//             var files = event.target.files;
//             // 遍历文件，显示文件列表信息
//             var htmlFile = '', index = 0, length = files.length;
//             if (length > 0) {
//                 var file = files[index];
//                 fileObj = {};
//                 fileObj.file = file;
//                 fileObj.name = file.name;
//                 fileObj.size = file.size;
//                 fileObj.start = 0;
//                 fileObj.type = file.type || "";
//                 fileObj.indenty = _serviceConfig.indenty;
//                 fileObj.indentyDisplay = _serviceConfig.indentyDisplay;
//                 fileObj.project = _serviceConfig.project;
//                 fileObj.id = "";
//                 fileObj.key = (file.lastModifiedDate + "").replace(/\W/g, '') + fileObj.size + fileObj.type.replace(/\W/g, '');
//                 backFileObj = deepClone(fileObj);
//                 $(".file-effect").removeClass(".file-up");
//                 $(".file-effect").text(fileObj.name);
//                 $(".file-effect").data("name", fileObj.name);
//                 $(".file-effect").data("process", "0%");
//                 $(".customer-file-effect").val(fileObj.name);
//
//                 $("#file_effect_p").show();
//                 $("#closeLink").hide();
//                 var sendData = new FormData();
//                 sendData.append("fileid", fileObj.id);
//                 sendData.append("localKey", fileObj.key);
//                 sendData.append("indenty", fileObj.indenty);
//                 sendData.append("project", fileObj.project);
//                 var xhr_filesize = new XMLHttpRequest();
//                 //     xhr_filesize.open("GET", "ManagerService.asmx/CheckFile?filename=" + encodeURIComponent(fileObj.name), true);
//                 xhr_filesize.open("POST", _serviceConfig.fileCheckService, true);
//                 $("#loadingDiv").show();
//                 xhr_filesize.onreadystatechange = function (e) {
//                     if (xhr_filesize.readyState == 4) {
//                         if (xhr_filesize.status == 200 && xhr_filesize.responseText) {
//                             $("#loadingDiv").hide();
//                             var json = eval("(" + xhr_filesize.responseText + ")");
//                             fileObj.start = Number(json.length);
//                             fileObj.id = json.id;
//                             $(".file-effect").data("process", ((Number(fileObj.start) / Number(fileObj.size)) * 100));
//
//                             if (fileObj.start >= fileObj.size && fileObj.size > 0) {
//                                 $("#submitLink").button("uped");
//                                 $("#submitLink").removeAttr("disabled");
//                                 _complated = true;
//                                 $.confirm({
//                                     title: '提示',
//                                     content: '已上传,是否重新上传？',
//                                     confirmButton: "确定",
//                                     cancelButton: "取消",
//                                     confirm: function () {
//                                         _complated = false;
//                                         fileObj = deepClone(backFileObj);
//                                         $("#submitLink").click();
//                                     },
//                                     cancel: function () {
//                                         $("#submitLink").click();
//                                     }
//                                 });
//                             }
//                             else {
//                                 $("#submitLink").button("reset");
//                                 $("#submitLink").removeAttr("disabled");
//
//                             }
//                             if (fileObj.start > 0) {
//                                 $(".file-effect").addClass("file-up");
//                             }
//                             else {
//                                 $(".file-effect").removeClass("file-up");
//                             }
//                             procesing();
//                         }
//                         else if (xhr_filesize.status == 500) {
//                             $("#loadingDiv").hide();
//                             alert(xhr_filesize.responseText);
//                         }
//                     }
//                 };
//                 xhr_filesize.send(sendData);
//             }
//             else {
//                 $("#file_effect_p").hide();
//             }
//         }, false);
//
//         $("#submitLink").click(function () {
//             if (_complated) {
//                 _returnObj.id = fileObj.id;
//                 _returnObj.filename = $(".customer-file-effect").val();
//                 var index = fileObj.name.lastIndexOf('.');
//                 if (index > -1) {
//                     _returnObj.extension = fileObj.name.substr(index, fileObj.name.length - index);
//                 } else {
//                     _returnObj.extension = "";
//                 }
//                 cf.close();
//                 if (_upFunc && typeof _upFunc == 'function') {
//                     _upFunc(_returnObj, _source);
//                 }
//             }
//             else {
//                 $(this).button("loading");
//                 //上传
//                 upload();
//                 $(".file-effect").addClass("file-up");
//                 $(".customer-file-effect").attr("disabled", "disabled");
//             }
//         });
//         $("#file_effect_p #cancelLink").on("click", function () {
//             cf.close();
//             if (_cancelFunc && typeof _cancelFunc == 'function') {
//                 _cancelFunc();
//             }
//         });
//
//
//     }
//     function upload() {
//         if (fileObj) {
//             var data = new FormData();
//             data.append("name", encodeURIComponent(fileObj.name));
//             var st = fileObj.start;
//             var ed = Number(fileObj.start) + Number(defaults.fileSplitSize);
//             var fe = fileObj.file.slice(st, ed);
//             data.append("file", fe);
//             data.append("start", fileObj.start);
//             data.append("size", fileObj.size);
//             data.append("localKey", fileObj.key);
//             data.append("indenty", fileObj.indenty);
//             data.append("indentyDisplay", fileObj.indentyDisplay);
//             data.append("project", fileObj.project);
//             data.append("fileid", fileObj.id);
//             // XMLHttpRequest 2.0 请求
//             var xhr = new XMLHttpRequest();
//             //"/ManagerService.asmx/uploadFile"
//             xhr.open("post", _serviceConfig.fileUploadService, true);
//             xhr.setRequestHeader("X_Requested_With", "XMLHttpRequest");
//
//             // 上传进度中
//             xhr.upload.addEventListener("progress", function (e) {
//                 $(".file-up").data("process", Math.ceil(((e.total + Number(fileObj.start)) / Number(fileObj.size)) * 100));
//                 procesing();
//                 // objStateElement.backgroundSize(fileid, (e.loaded + start) / size * 100);
//             }, false);
//             xhr.onreadystatechange = function (e) {
//                 if (xhr.readyState == 4) {
//                     if (xhr.status == 200 && xhr.responseText) {
//                         var json = JSON.parse(xhr.responseText);
//                         fileObj.id = json.id;
//                         if (ed >= fileObj.size) {
//                             //上传完成了，返回上传对象的信息
//                             _complated = true;
//                             $(".customer-file-effect").removeAttr("disabled");
//                             $("#submitLink").button("uped");
//                             setTimeout(function () { $("#submitLink").click(); }, 100);
//                         }
//                         else {
//                             //继续上传
//                             fileObj.start = Number(json.length);
//                             upload();
//                         }
//                     }
//                     else if (xhr.status == 500) {
//                         alert(xhr.responseText);
//                     } else {
//                         _complated = true;
//                         $(".customer-file-effect").removeAttr("disabled");
//                         $("#submitLink").button("uped");
//                     }
//                 }
//             };
//             xhr.send(data);
//         }
//     }
//     function procesing() {
//         var proc = $(".file-up").data("process");
//         if (proc > 100)
//             proc = 100;
//         var scontent = $(".file-up").data("name");
//         var index = sheet.cssRules.length - 1;
//         sheet.deleteRule(index);//删除最后一行样式（这里是前面添加的字体大小样式，不直接删除是为了防止误删除影响其他属性
//         sheet.insertRule('.file-up::before{ width:' + proc + '%;content:"' + scontent + '" }', index);
//     }
// })(jQuery);


(function($){

    var _serviceConfig;
    var _can;
    var _complated;
    var Uploading = function(){};

    $.fn.initUploader = function (options, serviceConfig, upFunc, delFunc, cancelFunc){
        var ops = $.extend(defaults,options);
        _serviceConfig = serviceConfig;

        var upLoading = new Uploading();
        upLoading.view=$(this);

        upLoading.show=function (upFunc,delFunc,images) {

            this.view[0].uploadFunc= upFunc;
            this.view[0].delFunc=delFunc;
            this.view[0].finishFiles = images;
            createUI(this.view);
        };

        $(this)[0].file=[];
        $(this)[0].uploadFiles=[];
        $(this)[0].finishFiles=[];

        return upLoading;
    };

    var defaults = {
        fileSplitSize: 1024 * 1024,
        videoPreview:"data:image/jpeg;base64,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3p9DXS+FdRLW0eW+eE7D9O1ezmcFVpQxET5rI6joV6mEn8vlv96NG3ja1kls3J3QOUye4/hP5Yq6pp2uRBLm31CP7koEUn16qf5j8qhRq8Q+oJxThUYNPBoAdRSUUALRSUUALRSUUALRSUUALRSUUALRSUUALRSUUALSeKf+RD1b/rzk/lRT9cgmv/B+pWlshkuJbd0RB1YkcCqh8SIqawfoeNxD5V+ldLoPhG+1srKwNvad5WH3v90d/wCVdN4f8CW9hGlzq5SaYAEQjlF+v94/p9a6ae+AXZCNqjjivcxeape7R+//ACPl8DkTk/aYnRdv8yHT9N03w/beVZxAOR8znlm+p/pTZrl5jyePSoGYsck0leHKUpvmk7s+ohCNOKjBWSFopKKksWikooAWikooAWikooAWikooAWikooAWikooAWikooAWikooAWikooAWikooAWmmgmmk0AITUEjYBqRjRaQfa72OL+EHc30FAGgo+w6KM8SS/Mfx/wDrYrz3xTd7nitgf9tv5D+tdvrl2DIV3YRBya8tvbhry9km5+duB7dq9PKqPPW53tH8zws/xPs8P7Jby/JHT+BLDzLua9YcRjYv1PWu+rJ8O2H9naNDERh2G5/qa1a5cZW9tWlLod+W4b6vho03vu/VgelVJ6tHpVSeuY7iIfdFFA6CigDUm+/+FR5p8x+f8KZmgAzRmjNGaAOU8bab9osUvEX54T83+6a5PQrz7JqCqxwkvyn69q9SnhS4geFxlXUgivJNSsn07UZbZs/I3yn1HY17eXTVajLDz/r/AIZny+c05YbEQxlP5+v/AAVoer2ezU9MmsZD95eD6HsfwPNZFu7gGOUbZYyUcehHWqnhrVTLDFKT86/K/wBa2dagEVzHqEX+qnwkuOzfwn8en5V49SDpycJbo+ko1Y1aaqQ2YxWp4NV0apgag0JAaWmCnUALRSUUALRSUUALRSUUALRSUUALRSUUALRSUUALUiTtH904qKigCV53k+8xNR5pKKAFopKKAFopKKAFopKKAFopKKAFopKKAFopKKAFopKKAFopKKAFopKKAFopKKAFopKKAFozSUhoACaYTSk1GxoAY7YFadgostOe6fh5fu/Tt/jWfa25vLtYv4ern2qxrV2ufKQgIg/CgDk/E2oFLYxhvnmOPw71j+GdOOo6xECMxxfO/wCH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",
        pdfPreview:"data:image/png;base64,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",
        docPreview:"data:image/png;base64,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"
    };

    function createUI(uploadView){
        uploadView.empty();
        var view = '<div class="lm-input-group">'+
            '<input class="lm-input lm-input-default lm-input-shadow lm-img-title" readonly="readonly" value="还未选择文件">'+

            '<div class="lm-btn lm-btn-default lm-file" style="display: inline-block">选择'+
            '<input class="fileUpload" type="file" multiple>'+
            '</div>'+
            '</div>'+
            '<button class="lm-btn lm-btn-theme lm-upload" style="margin-left: 8px;">上传</button>'+
            '<div class="ImageBox DisBox"></div>';

        uploadView.append(view);

        createImageView(uploadView);

        uploadView.find(".fileUpload").on('change',function(){
            onSelectFiles(uploadView);
        });

        uploadView.find(".lm-upload").on('click',function(){

            if (uploadView[0].uploadFiles.length > 0){
                checkFile(uploadView);
            }else {
                $.showMessage({message:"请先选择文件"})
            }
        });

        imageCount(uploadView);

    }

    function createImageView(uploadView){

        if (uploadView[0].finishFiles && uploadView[0].finishFiles.length > 0){
            uploadView.find(".ImageBox").show();
            for (var i = 0; i < uploadView[0].finishFiles.length; i++){

                var file=uploadView[0].finishFiles[i];
                var imageView={};

                if(file.type){

                    if(file.type.indexOf("video")!=-1 || file.type.indexOf("application")!=-1){

                        imageView = $('<div><a class="fancybox fancybox.iframe" href="'+initFileReadPath(file.id)+'" rel="gallery" title="'+file.name+'">' +
                            '<img src="'+initFileImagePath(file.id)+'" alt=""/></a>'+
                            '<div class="ImageInfo"><span title="'+file.name+'">'+file.name+'</span><i class="fa fa-trash-o"></i></div></div>');

                    }else{

                        switch(file.type){

                            case "image/gif":
                            case "image/png":
                            case "image/jpeg":
                            case "image/bmp":

                                imageView = $('<div><a class="fancybox" href="'+initImageReadPath(file.id)+'" rel="gallery" title="'+file.name+'">' +
                                    '<img src="'+initImageReadPath(file.id)+'" alt=""/></a>'+
                                    '<div class="ImageInfo"><span title="'+file.name+'">'+file.name+'</span><i class="fa fa-trash-o"></i></div></div>');
                                break;
                        }

                    }

                }else if(file.name){

                    var arr=file.name.split(".");
                    var fileType=arr[arr.length-1];

                    switch(fileType.toLowerCase()){

                        case "gif":
                        case "png":
                        case "jpg":
                        case "bmp":

                            imageView = $('<div><a class="fancybox" href="'+initImageReadPath(file.id)+'" rel="gallery" title="'+file.name+'">' +
                                '<img src="'+initImageReadPath(file.id)+'" alt=""/></a>'+
                                '<div class="ImageInfo"><span title="'+file.name+'">'+file.name+'</span><i class="fa fa-trash-o"></i></div></div>');

                            break;

                        case "mp4":
                        case "avi":
                        case "wmv":
                        case "rmvb":
                        case "mkv":

                        case "pdf":
                        case "doc":
                        case "docx":

                            imageView = $('<div><a class="fancybox fancybox.iframe" href="'+initFileReadPath(file.id)+'" rel="gallery" title="'+file.name+'">' +
                                '<img src="'+initFileImagePath(file.id)+'" alt=""/></a>'+
                                '<div class="ImageInfo"><span title="'+file.name+'">'+file.name+'</span><i class="fa fa-trash-o"></i></div></div>');

                            break;
                    }
                }


                uploadView.find(".ImageBox").append(imageView);
                imageView.attr("id",file.id);

                uploadView.find(".fancybox").fancybox();

                imageView.find("i").on("click",function(){

                    var view = $(this).parent().parent();

                    for (var i = 0; i < uploadView[0].finishFiles.length; i++){
                        if (view.attr('id') == uploadView[0].finishFiles[i].id){

                            if (uploadView[0].delFunc && typeof uploadView[0].delFunc == 'function') {
                                uploadView[0].delFunc(uploadView[0].finishFiles[i]);
                            }
                            uploadView[0].finishFiles.splice(i,1);
                            view.remove();
                            imageCount(uploadView);
                            break;
                        }
                    }

                    uploadView.find(".fancybox").fancybox();

                });

            }
        }
    }

    function initImagePath(id){
        return _serviceConfig.previewService+'/'+id+'/100,200/para?uid='+_serviceConfig.indenty+"&un="+_serviceConfig.indentyDisplay+"&proj="+_serviceConfig.project;
    }

    function initImageReadPath(id){
        return _serviceConfig.previewService.replace("Thumbnail","Read")+'/'+id+'/para?uid='+_serviceConfig.indenty+"&un="+_serviceConfig.indentyDisplay+"&proj="+_serviceConfig.project;
    }

    function initFileImagePath(id){
        return _serviceConfig.previewService.replace("IMG","File")+'/'+id+'/100,200/para?uid='+_serviceConfig.indenty+"&un="+_serviceConfig.indentyDisplay+"&proj="+_serviceConfig.project;
    }

    function initFileReadPath(id){
        return _serviceConfig.previewService.replace("IMG","File").replace("Thumbnail","Read")+'/'+id+'/para?uid='+_serviceConfig.indenty+"&un="+_serviceConfig.indentyDisplay+"&proj="+_serviceConfig.project;
    }

    function handleFileAfterCheck(checkFile,uploadViewDomObj,res){

        if (uploadViewDomObj.uploadFiles.length > 0) {

            for (var k = 0; k < uploadViewDomObj.uploadFiles.length; k++) {

                if (checkFile.viewId == uploadViewDomObj.uploadFiles[k].viewId) {

                    uploadViewDomObj.uploadFiles.splice(k, 1);
                    break;
                }
            }

        }

        if (uploadViewDomObj.file.length > 0) {

            for (var j = 0; j < uploadViewDomObj.file.length; j++) {

                if (checkFile.viewId == uploadViewDomObj.file[j].viewId) {

                    uploadViewDomObj.file.splice(j, 1);
                    break;
                }
            }

        }

        if (uploadViewDomObj.uploadFunc && typeof uploadViewDomObj.uploadFunc == 'function') {

            uploadViewDomObj.uploadFunc(res);

            if(res.extension){

                switch(res.extension.toLowerCase()){

                    case ".mp4":
                    case ".avi":
                    case ".wmv":
                    case ".rmvb":
                    case ".mkv":

                    case ".pdf":
                    case ".docx":
                    case ".doc":

                        $(uploadViewDomObj).find(".ImageInfo > span").each(function () {
                            var self=$(this);
                            if(self.text()==res.filename){

                                self.parent().parent().find("img").attr("src",initFileImagePath(res.id));
                                self.parent().parent().children("a").attr("href",initFileReadPath(res.id))
                                    .attr("rel","gallery").attr("title",res.filename);
                                return false;
                            }
                        });
                        break;

                    case ".gif":
                    case ".png":
                    case ".jpeg":
                    case ".jpg":
                    case ".bmp":

                        $(uploadViewDomObj).find(".ImageInfo > span").each(function () {
                            var self=$(this);
                            if(self.text()==res.filename){

                                self.parent().parent().children("a").attr("rel","gallery").attr("title",res.filename);
                                return false;
                            }
                        });

                        break;
                }
            }

        }

    }

    function checkFile(uploadView){
        for (var i = 0; i < uploadView[0].uploadFiles.length; i++){
            var file = uploadView[0].uploadFiles[i];
            var fileObj = {};
            fileObj.file = file;
            fileObj.viewId = file.viewId;
            fileObj.loading = file.loading;
            fileObj.name = file.name;
            fileObj.size = file.size;
            fileObj.start = 0;
            fileObj.type = file.type || "";
            fileObj.indenty = _serviceConfig.indenty;
            fileObj.indentyDisplay = _serviceConfig.indentyDisplay;
            fileObj.project = _serviceConfig.project;
            fileObj.id = "";
            fileObj.key = (file.lastModifiedDate + "").replace(/\W/g, '') + fileObj.size + fileObj.type.replace(/\W/g, '');
            var sendData = new FormData();
            sendData.append("fileid", fileObj.id);
            sendData.append("localKey", fileObj.key);
            sendData.append("indenty", fileObj.indenty);
            sendData.append("project", fileObj.project);
            var xhr_filesize = new XMLHttpRequest();
            xhr_filesize.open("POST", _serviceConfig.fileCheckService, true);
            xhr_filesize.file = fileObj;
            //fileObj.loading.show();
            xhr_filesize.onreadystatechange = function (e) {
                if (this.readyState == 4) {
                    if (this.status == 200 && this.responseText) {
                        var json = eval("(" + this.responseText + ")");
                        this.file.start = Number(json.length);
                        this.file.id = json.id;

                        if (this.file.start >= this.file.size && this.file.size > 0) {
                            _complated = true;
                            //this.file.loading.data("process", ((Number(this.file.start) / Number(this.file.size)) * 100));
                            this.file.loading.hide();
                            var res = respones(this.file);
                            this.file.res = res;

                            uploadView[0].finishFiles.push(this.file);
                            // uploadView[0].file.splice($.inArray(this.file,uploadView[0].file),1);
                            // uploadView[0].uploadFiles.splice($.inArray(this.file,uploadView[0].file),1);

                            handleFileAfterCheck(this.file,uploadView[0],res);
                        }else {
                            upload(this.file,uploadView);
                        }

                    }
                    else if (this.status == 500) {
                        alert(this.responseText);
                    }
                }
            };
            xhr_filesize.send(sendData);
        }
    }

    function respones(file){
        var returnObj = {};
        returnObj.id = file.id;
        returnObj.filename = file.name;
        var index = file.name.lastIndexOf('.');
        if (index > -1) {
            returnObj.extension = file.name.substr(index, file.name.length - index);
        } else {
            returnObj.extension = "";
        }
        return returnObj
    }

    function onSelectFiles(uploadView){

        //获取上传文件的数量
        var inputFile = uploadView.find('.fileUpload')[0];

        if (inputFile && inputFile.files.length > 0){

            // if(uploadView[0].finishFiles.length + uploadView[0].file.length + inputFile.files.length > 6){
            //     $.showMessage({message:'最多只可以选择6张图片'});
            //     return;
            // }

            var imgPath = inputFile.value;
            var extn = imgPath.substring(imgPath.lastIndexOf('.') + 1).toLowerCase();

            // if (extn != "gif" && extn != "png" && extn != "jpg" && extn != "jpeg" && extn != "bmp" && extn != "mp4" && extn != "pdf" && extn != "docx"){
            //     $.showMessage({message:'请选择图像文件'});
            //     return; //have problem in chrome
            // }

            var cloneFiles=[];

            for(var t=0;t<inputFile.files.length;t++){

                if(inputFile.files[t].type){

                    if(inputFile.files[t].type.indexOf("video")!=-1){

                        cloneFiles.push(inputFile.files[t]);
                    }else{

                        switch(inputFile.files[t].type){

                            case "image/gif":
                            case "image/png":
                            case "image/jpeg":
                            case "image/bmp":

                            case "application/pdf":
                            case "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
                            case "application/msword":

                                cloneFiles.push(inputFile.files[t]);
                                break;
                        }

                    }
                }

            }

            if(cloneFiles.length < inputFile.files.length){
                $.showMessage({message:'包含不支持的文件类型，已取消选中'});
            }

            if (typeof (FileReader) == "undefined"){
                $.showMessage({message:'你的浏览器不支持FileReader！'});
                return;
            }

            if(uploadView[0].file && uploadView[0].file.length>0){

                var tempLen=uploadView[0].file.length;
                while(tempLen--){
                    // for(var k=0;k<inputFile.files.length;k++){
                    //     if(uploadView[0].file && uploadView[0].file.length >0 &&(uploadView[0].file[tempLen].name==inputFile.files[k].name)){
                    //         uploadView[0].file.splice(tempLen,1);
                    //         break;
                    //     }
                    // }
                    for(var k=0;k<cloneFiles.length;k++){
                        if(uploadView[0].file && uploadView[0].file.length >0 &&(uploadView[0].file[tempLen].name==cloneFiles[k].name)){
                            uploadView[0].file.splice(tempLen,1);
                            break;
                        }
                    }
                }
            }


            //Array.prototype.push.apply(uploadView[0].file,inputFile.files);
            Array.prototype.push.apply(uploadView[0].file,cloneFiles);

            if(uploadView[0].finishFiles && uploadView[0].finishFiles.length > 0){

                var len=uploadView[0].file.length;
                while(len--){
                    for(var l=0;l<uploadView[0].finishFiles.length;l++){

                        if(uploadView[0].file && uploadView[0].file.length >0 &&(uploadView[0].file[len].name==uploadView[0].finishFiles[l].name)){

                            uploadView[0].file.splice(len,1);
                            break;
                        }
                    }
                }
            }


            var image_holder = uploadView.find(".ImageBox");

            image_holder.empty();
            uploadView[0].uploadFiles=[];

            createImageView(uploadView);
            // 循环所有要上传的图片
            for (var i = 0; i < uploadView[0].file.length; i++) {

                var reader = new FileReader();
                reader.file = uploadView[0].file[i];

                reader.onload = function (e) {
                    this.file.viewId = GUID();
                    var view = $('<div></div>');

                    if(e.target.result.indexOf("data:video")!=-1){

                        //$("<img />", {"src":"Images/video.jpg"}).appendTo(view); //original
                        $('<a class="fancybox fancybox.iframe" href=" "><img src="'+defaults.videoPreview+'" alt="" /></a>').appendTo(view);

                    }else if(e.target.result.indexOf("data:application/vnd.openxmlformats-officedocument.wordprocessingml.document")!=-1
                        || e.target.result.indexOf("data:application/msword")!=-1){

                        $('<a class="fancybox fancybox.iframe" href=" "><img src="'+defaults.docPreview+'" alt="" /></a>').appendTo(view);
                    }
                    else if(e.target.result.indexOf("data:application/pdf")!=-1){

                        $('<a class="fancybox fancybox.iframe" href=" "><img src="'+defaults.pdfPreview+'" alt="" /></a>').appendTo(view);

                    }else{

                        //$("<img />", {"src": e.target.result}).appendTo(view); //original
                        $('<a class="fancybox" href="'+e.target.result+'"><img src="'+e.target.result+'" alt=""/></a>').appendTo(view);
                        //why alt necessary?
                        //$('.fancybox').fancybox(); //why not function

                    }

                    var loading = $('<div class="Loading"><span data-process="0">未上传</span></div>');
                    loading.appendTo(view);
                    var imageInfo = $('<div class="ImageInfo"><span title="'+this.file.name+'">'+this.file.name+'</span><i class="fa fa-trash-o"></i></div>');
                    imageInfo.appendTo(view);
                    imageInfo[0].imageFile = this.file;
                    //loading.hide();
                    image_holder.append(view);
                    this.file.loading = loading;

                    uploadView[0].uploadFiles.push(this.file);

                    uploadView.find(".fancybox").fancybox();

                    imageInfo.find("i").on("click",function(){

                        $(this).parent().parent().remove();

                        if (uploadView[0].uploadFiles.length > 0) {

                            for (var k = 0; k < uploadView[0].uploadFiles.length; k++) {

                                if ($(this).parent()[0].imageFile.viewId == uploadView[0].uploadFiles[k].viewId) {

                                    uploadView[0].uploadFiles.splice(k, 1);
                                    break;
                                }
                            }

                        }

                        if (uploadView[0].file.length > 0) {

                            for (var j = 0; j < uploadView[0].file.length; j++) {

                                if ($(this).parent()[0].imageFile.viewId == uploadView[0].file[j].viewId) {

                                    uploadView[0].file.splice(j, 1);
                                    break;
                                }
                            }

                        }

                        if (uploadView[0].finishFiles.length > 0) {


                            for (var i = 0; i < uploadView[0].finishFiles.length; i++) {

                                if ($(this).parent()[0].imageFile.viewId == uploadView[0].finishFiles[i].viewId) {

                                    if (uploadView[0].delFunc && typeof uploadView[0].delFunc == 'function') {

                                        if(uploadView[0].finishFiles[i].id){
                                            uploadView[0].delFunc(uploadView[0].finishFiles[i]);
                                        }else{
                                            uploadView[0].delFunc(uploadView[0].finishFiles[i].res);
                                        }

                                    }
                                    uploadView[0].finishFiles.splice(i, 1);
                                    break;
                                }
                            }

                        }

                        imageCount(uploadView);

                        uploadView.find(".fancybox").fancybox();

                    });
                };

                image_holder.show();
                reader.readAsDataURL(uploadView[0].file[i]);

            }

            uploadView.find(".fileUpload").val("");//Add
        }else {
            $.showMessage({message:'未选择文件'});
        }

        imageCount(uploadView);
    }

    function imageCount(uploadView){

        var count=uploadView[0].file.length + uploadView[0].finishFiles.length;

        if (count > 0){
            uploadView.find(".lm-img-title").val("已选择"+count+"个文件");
            uploadView.find(".ImageBox").show();
        }else {
            uploadView.find(".ImageBox").hide();
            uploadView.find(".lm-img-title").val("还未选择文件")
        }
    }

    function upload(fileObj,uploadView) {
        if (fileObj) {
            var data = new FormData();
            data.append("name", encodeURIComponent(fileObj.name));
            var st = fileObj.start;
            var ed = Number(fileObj.start) + Number(defaults.fileSplitSize);
            var fe = fileObj.file.slice(st, ed);
            data.append("file", fe);
            data.append("start", fileObj.start);
            data.append("size", fileObj.size);
            data.append("localKey", fileObj.key);
            data.append("indenty", fileObj.indenty);
            data.append("indentyDisplay", fileObj.indentyDisplay);
            data.append("project", fileObj.project);
            data.append("fileid", fileObj.id);
            // XMLHttpRequest 2.0 请求
            var xhr = new XMLHttpRequest();
            //"/ManagerService.asmx/uploadFile"
            xhr.open("post",_serviceConfig.fileUploadService, true);
            xhr.setRequestHeader("X_Requested_With", "XMLHttpRequest");

            xhr.file = fileObj;
            fileObj.loading.show();
            // 上传进度中
            xhr.upload.file = fileObj;
            xhr.upload.addEventListener("progress", function (e) {
                //this.file.loading.data("process", Math.ceil(((e.total + Number(this.file.start)) / Number(this.file.size)) * 100));
                this.file.loading.data("process", ((Number(e.total +fileObj.start) / Number(fileObj.size)) * 100));
                procesing(this.file);
            }, false);
            xhr.onreadystatechange = function (e) {
                if (xhr.readyState == 4) {
                    if (xhr.status == 200 && xhr.responseText) {
                        var json = JSON.parse(xhr.responseText);
                        this.file.id = json.id;
                        this.file.loading.data("process", ((Number(fileObj.start) / Number(fileObj.size)) * 100));
                        procesing(this.file);
                        if (ed >= this.file.size) {
                            //上传完成了，返回上传对象的信息
                            _complated = true;
                            this.file.loading.hide();
                            var res = respones(this.file);
                            this.file.res = res;

                            uploadView[0].finishFiles.push(this.file);
                            handleFileAfterCheck(this.file,uploadView[0],res);
                        }
                        else {
                            //继续上传
                            this.file.start = Number(json.length);
                            upload(this.file,uploadView);
                        }
                    }
                    else if (xhr.status == 500) {
                        alert(xhr.responseText);
                    } else {
                        _complated = true;
                    }
                }
            };
            xhr.send(data);
        }
    }

    function procesing(file) {
        var proc = file.loading.data("process");
        if (proc > 100)
            proc = 100;
        file.loading.find("span").text(parseInt(proc)+"%");
    }

})(jQuery);