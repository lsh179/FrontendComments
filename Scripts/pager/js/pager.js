(function ($, document) {
    var LmPager = function (selector, options) {
        var DefaultOpts = {
            MaxPageview: 5,
            PageSizeselect: [20, 50, 100],
            //  LocalPage: false,
            PageChange: null,
            Pageloading: null,

            PageType: "normal",
            WithTotalInfo: true,
            TotalFormat: "共查询到{0}数据",
        }
        this.$element = $(selector);
        //默认参数
        this.options = $.extend({}, DefaultOpts, options);
    };
    LmPager.prototype = {
        _pageDiv: null,
        _init: function () {
            if (this.$element.find('>div[tag=LmPager]').length <= 0) {
                this._createLmPagerdiv();
            }
            this._pageDiv = $(this.$element.find('>div[tag=LmPager]')[0]);
            if (this._pageDiv.attr("id")) {
                this.Pageid = this._pageDiv.attr("id");
            } else {
                this.Pageid = GUID();
                this._pageDiv.attr("id", this.Pageid);
            }
            this._pagesView = $(this._pageDiv.find("div[tag=PagesView]")[0]);
            this._recordCountDiv = $(this._pageDiv.find("span[tag=PagesResultcount]")[0]);
            this._currentPagediv = $(this._pageDiv.find("input[tag=CurrentPageIndex]")[0]);
            this._pagesView.html();
            this.PageIndex = 1;
            this.RecordCount = 0;
            this.PageCount = 0;
            this.PageSize = this.options.PageSizeselect[0];
            var CurrentPage = this;
            $(document).on("click", '#' + this.Pageid + ' a.tcdNumber', function () {
                CurrentPage.CaculatePagechange(parseInt($(this).text()));
            });
            $(document).on("click", '#' + this.Pageid + ' a.prevPage', function () {
                CurrentPage.CaculatePagechange(parseInt(CurrentPage._pagesView.children("span.current").text()) - 1);
            });
            $(document).on("click", '#' + this.Pageid + ' a.nextPage', function () {
                CurrentPage.CaculatePagechange(parseInt(CurrentPage._pagesView.children("span.current").text()) + 1);
            });
            $(document).on("keyup", '#' + this.Pageid + ' .input-page-num', function (event) {
                if (event.keyCode == "13") {
                    $(this).val(CurrentPage.CaculatePagechange(parseInt($(this).val())));
                }
            });
            $(document).on("click", '#' + this.Pageid + ' .page-up', function () {
                var inputControl = $(CurrentPage._pageDiv.find(".input-page-num")[0]);
                inputControl.val(CurrentPage.CaculatePagechange(parseInt(inputControl.val()) - 1));
            });
            $(document).on("click", '#' + this.Pageid + ' .page-down', function () {
                var inputControl = $(CurrentPage._pageDiv.find(".input-page-num")[0]);
                inputControl.val(CurrentPage.CaculatePagechange(parseInt(inputControl.val()) + 1));
            });
            $(document).on("change", '#' + this.Pageid + ' .select-numprepage', function () {
                CurrentPage.CaculatePagechange(1, parseInt($(this).val()));
            });
        },

        CaculatePagechange: function (newIndex, pageSize) {
            if (pageSize != null) {
                if (pageSize <= 0) {
                    return "";
                }
                this.PageIndex = 1;
                this.PageSize = pageSize;
                if (this.options.PageChange) {
                    this.options.PageChange(this, this.PageIndex, this.PageSize);
                }
                return this.PageIndex;
            }
            if (newIndex == null || this.PageIndex == newIndex) {
                return newIndex;
            }
            if (newIndex <= 0) {
                newIndex = 1;
            }
            if (newIndex > this.PageCount) {
                newIndex = this.PageCount;
            }
            if (this.PageIndex == newIndex) {
                return newIndex;
            }
            this.PageIndex = newIndex;
            if (this.options.PageChange) {
                this.options.PageChange(this, newIndex, this.PageSize);
            }
            return newIndex;
        },

        ResetpageInfo: function (recordCount) {
            var pageIndex = this.PageIndex;
            this._pagesView.empty();
            var psplit = Math.floor(this.options.MaxPageview / 2);
            this.PageCount = Math.ceil(recordCount / this.PageSize);
            if (pageIndex > 1) {
                this._pagesView.append('<a href="javascript:;" class="prevPage">&lt;</a>');
            } else {
                this._pagesView.append('<span class="disabled">&lt;</span>');
            }
            var start = 1, end = this.PageCount;
            if (this.options.PageType == 'normal') {
                if (this.PageCount > this.options.MaxPageview + 2) {
                    if (pageIndex - psplit - 2 > 0) {
                        this._pagesView.append('<a href="javascript:;" class="tcdNumber">' + 1 + '</a>');
                        this._pagesView.append('<span class="morePage">...</span>');
                        start = Math.max(Math.min(pageIndex - psplit, this.PageCount - this.options.MaxPageview - 1), 1);
                    }
                    end = Math.min(pageIndex + psplit, this.PageCount);
                }
                for (; start <= end && start <= this.PageCount; start++) {
                    if (start != pageIndex) {
                        this._pagesView.append('<a href="javascript:;" class="tcdNumber">' + start + '</a>');
                    } else {
                        this._pagesView.append('<span class="current">' + start + '</span>');
                    }
                }
                if (end + 1 < this.PageCount) {
                    this._pagesView.append('<span class="morePage">...</span>');
                }
                if (end < this.PageCount) {
                    this._pagesView.append('<a href="javascript:;" class="tcdNumber">' + this.PageCount + '</a>');
                }
            } else {
                start = Math.max(pageIndex - psplit, 1);
                end = Math.min(pageIndex + psplit, this.PageCount);
                if (end - start < this.options.MaxPageview) {
                    if (start == 1) {
                        end = Math.min(this.options.MaxPageview, this.PageCount);
                    }
                    if (end == this.PageCount) {
                        start = Math.max(1, this.PageCount - this.options.MaxPageview + 1);
                    }
                }
                for (; start <= end && start <= this.PageCount; start++) {
                    if (start != pageIndex) {
                        this._pagesView.append('<a href="javascript:;" class="tcdNumber">' + start + '</a>');
                    } else {
                        this._pagesView.append('<span class="current">' + start + '</span>');
                    }
                }
            }
            if (pageIndex < this.PageCount) {
                this._pagesView.append('<a href="javascript:;" class="nextPage">&gt;</a>');
            } else {
                this._pagesView.append('<span class="disabled">&gt;</span>');
            }
            if (this._recordCountDiv) {
                this._recordCountDiv.html(this.options.TotalFormat.format(recordCount));
            }
            this._currentPagediv.val(pageIndex);
        },

        _createLmPagerdiv: function () {
            var guid = GUID();
            var pagedivstr = '<div tag="LmPager" id="' + guid + '" class="lmPager">';
            pagedivstr += ' <div class="page-control"><div tag="PagesView" class="tcdPageCode" ></div><select class="select-numprepage">';
            for (var i = 0; i < this.options.PageSizeselect.length; i++) {
                pagedivstr += '<option  value="{0}">{0}条/页</option>'.format(this.options.PageSizeselect[i]);
            }
            pagedivstr += '</select>';
            if (this.options.PageType == "normal") {
                pagedivstr += '<span>跳转至</span>';
                pagedivstr += '<div class="page-skip">';
                pagedivstr += '<input type="text"  tag="CurrentPageIndex" class="input-page-num" value="1">';
                pagedivstr += '<div class="page-up-down">';
                pagedivstr += '    <div class="page-up"><i class="fa fa-angle-up page-up-icon"></i></div>';
                pagedivstr += '    <div class="page-down"><i class="fa fa-angle-down page-down-icon"></i></div>';
                pagedivstr += '</div></div>';
            }
            pagedivstr += '</div>';
            if (this.options.PageType == "normal" && this.options.WithTotalInfo) {
                pagedivstr += '<span class="pageTotalview" tag="PagesResultcount">共查询到数据</span>';
            }
            pagedivstr += '</div>';

            $(this.$element).append(pagedivstr);
        },
        Ajaxpagequery: function (url, param, callback,webaction) {
            var curPage = this;
            if(!webaction)
            {
                webaction= WebApiAction.Get;
            }
            param.PageIndex = this.PageIndex;
            param.PageSize = this.PageSize;
            if (this.options.Pageloading) {
                this.options.Pageloading.startAjaxrestfull(url, param, webaction, function (data) {
                    for (var i = 0; i < data.length; i++) {
                        data[i].pageNumber = (curPage.PageIndex - 1) * curPage.PageSize + i + 1;
                    }
                    if (data.Total_Count) {
                        curPage.ResetpageInfo(data.Total_Count);
                    }
                    if (callback) {
                        callback(data);
                    }
                });
            } else {
                ajaxWebApi(url, param, webaction, function (data) {
                    for (var i = 0; i < data.length; i++) {
                        data[i].pageNumber = (curPage.PageIndex - 1) * curPage.PageSize + i + 1;
                    }
                    if (data.Total_Count) {
                        curPage.ResetpageInfo(data.Total_Count);
                    }
                    if (callback) {
                        callback(data);
                    }
                });
            }
            return false;
        },
        request: function (url, param,webaction, callback) {
            var curPage = this;
            if(!webaction)
            {
                webaction= WebApiAction.Get;
            }
            param.PageIndex = this.PageIndex;
            param.PageSize = this.PageSize;
            if (this.options.Pageloading) {
                this.options.Pageloading.startAjaxrestfull(url, param, webaction, function (data) {
                    for (var i = 0; i < data.length; i++) {
                        data[i].pageNumber = (curPage.PageIndex - 1) * curPage.PageSize + i + 1;
                    }
                    if (data.Total_Count) {
                        curPage.ResetpageInfo(data.Total_Count);
                    }
                    if (callback) {
                        callback(data);
                    }
                });
            } else {
                ajaxWebApi(url, param, webaction, function (data) {
                    for (var i = 0; i < data.length; i++) {
                        data[i].pageNumber = (curPage.PageIndex - 1) * curPage.PageSize + i + 1;
                    }
                    if (data.Total_Count) {
                        curPage.ResetpageInfo(data.Total_Count);
                    }
                    if (callback) {
                        callback(data);
                    }
                });
            }
            return false;
        }
    };
    $.fn.InitPager = function (options) {
        if (!options.MaxPageview) {
            options.MaxPageview = 5;
        }
        options.PageType = "normal";
        var df = new LmPager(this, options);
        df._init();
        return df;
    };
    $.fn.InitSmallPager = function (options) {
        if (!options.MaxPageview) {
            options.MaxPageview = 3;
        }
        options.PageType = "small";
        options.WithTotalInfo = "false";
        var df = new LmPager(this, options);
        df._init();
        return df;
    };

})(jQuery, document);