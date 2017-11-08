(function ($, document) {
    var LmLoading = function (selector, optios) {
        var DefaultOpts = {
            loadText: "加载中...",
            imageData: "data:image/gif;base64,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",
            backgroundcolor: ";background: rgba(233, 233, 232, 0.75);  filter: progid:DXImageTransform.Microsoft.Alpha(opacity=75);",
            formatDiv: '<div tag="Lmloading" class="Lmloading mloading mloading-full mloading-mask" style="position:absolute;top:0;left:0;width:100%;height:100%;z-index: 9999;$backgroundcolor$">        <div class="mloading-body">            <div class="mloading-bar" style="margin-top: -31px; margin-left: -140px;">                <img class="mloading-icon" src="$imageData$">                <span class="mloading-text">$loadText$</span>            </div>        </div>    </div>'
        };
        this.$element = $(selector);
        //默认参数
        this.options = $.extend({}, DefaultOpts, optios);
    };
    LmLoading.prototype = {
        _showDiv: null,
        _init: function () {
            if (this.$element.find('>div[tag=Lmloading]').length > 0) {
                this._showDiv = $(this.$element.find('>div[tag=Lmloading]')[0]);
            } else {
                this._createLmloadingdiv();
            }
        },
        start: function () {
            if (this._showDiv) {
                this._showDiv.show()
                var bardiv = $(this._showDiv.find(".mloading-bar"));
                if (bardiv) {
                    if ((this._showDiv.height() < bardiv.outerWidth() || this._showDiv.width() < bardiv.outerHeight())) {
                        bardiv.css("background-color", "transparent");
                        bardiv.css("box-shadow", "0 1px 2px rgba(0, 0, 0, 0)");
                    } else {
                        bardiv.css("background-color", "#fff");
                        bardiv.css("box-shadow", "0 1px 2px rgba(0, 0, 0, 0.27)");
                    }
                }
            }
        },
        stop: function () {
            if (this._showDiv) {
                this._showDiv.hide()
            }
        },
        _createLmloadingdiv: function () {
            this.$element.append(this.options.formatDiv.bind(this.options));
            this._showDiv = $(this.$element.find('>div[tag=Lmloading]'));
        },
        startAjaxrestfull: function (url, param, method, callback, errorfuction) {
            var current = this;
            this.start();
            ajaxWebApi(url, param, method, function (data) {
                current.stop();
                if (callback) {
                    callback(data);
                }
            }, function () {
                current.stop();
                if (errorfuction) {
                    errorfuction();
                }
            });
            return false;
        },
        request: function (url, param, method, callback, errorfuction) {
            var current = this;
            this.start();
            ajaxWebApi(url, param, method, function (data) {
                current.stop();
                if (callback) {
                    callback(data);
                }
            }, function () {
                current.stop();
                if (errorfuction) {
                    errorfuction();
                }
            });
            return false;
        }
    };
    $.fn.InitLoading = function (options) {
        var df = new LmLoading(this, options);
        df._init();
        return df;
    };
    IsIE = function () { //ie?
        if (!!window.ActiveXObject || "ActiveXObject" in window)
            return true;
        else
            return false;
    };

})(jQuery, document);