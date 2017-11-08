;(function ($) { $.fn.datepicker.language['zh'] = {
    days: ['周日', '周一', '周二', '周三', '周四', '周五', '周六'],
    daysShort: ['日', '一', '二', '三', '四', '五', '六'],
    daysMin: ['日', '一', '二', '三', '四', '五', '六'],
    months: ['一月', '二月', '三月', '四月', '五月', '六月', '七月', '八月', '九月', '十月', '十一月', '十二月'],
    monthsShort: ['一月', '二月', '三月', '四月', '五月', '六月', '七月', '八月', '九月', '十月', '十一月', '十二月'],
    today: '今天',
    clear: '清除',
    dateFormat: 'yyyy-mm-dd',
    timeFormat: 'hh:ii',
    firstDay: 1
}; })(jQuery);

(function ($, document) {
    $.fn.lmdatepicker = function (options) {
        options.language = 'zh';
        options.autoClose = true;
        options.todayButton = new Date();
        options.clearButton = true;
        options.onSelect = function (fdate, date, inst) {
            $(inst.el).change();
        };
		 return this.each(function () {
					var isinput = this.nodeName == 'INPUT';
					var inputctr = this;
                    var opt = {};
					if(!isinput&&$(this).find("input"))
					{
						inputctr = $(this).find("input");
                        var sname=['startDate','firstDay','dateFormat','altField','altFieldDateFormat','toggleSelected','keyboardNav','minView','showOtherMonths','selectOtherMonths','moveToOtherMonthsOnSelect','showOtherYears','selectOtherYears','moveToOtherYearsOnSelect','minDate','maxDate','disableNavWhenOutOfRange','multipleDates','multipleDatesSeparator','todayButton','clearButton','showEvent','autoClose','monthsField','prevHtml','nextHtml','timepicker','onlyTimepicker','dateTimeSeparator','timeFormat','minHours','maxHours','minMinutes','maxMinutes','hoursStep','minutesStep'];
                        var lname =['startdate','firstday','dateformat','altfield','altfielddateformat','toggleselected','keyboardnav','minview','showothermonths','selectothermonths','movetoothermonthsonselect','showotheryears','selectotheryears','movetootheryearsonselect','mindate','maxdate','disablenavwhenoutofrange','multipledates','multipledatesseparator','todaybutton','clearbutton','showevent','autoclose','monthsfield','prevhtml','nexthtml','timepicker','onlytimepicker','datetimeseparator','timeformat','minhours','maxhours','minminutes','maxminutes','hoursstep','minutesstep'];
                        opt =  $.extend(true, options, $(inputctr).data());
                        for(var key in opt)
                        {
                            if($.inArray(key,lname)>=0)
                            {
                                opt[sname[$.inArray(key,lname)]] = opt[key];
                            }
                        }
					}							
					var picker = $(inputctr).datepicker(opt).data('datepicker');
					if(!isinput){
					    $(this).find(".datepickerbutton").click(function () {
							picker.show();
						});
					}
		});
	};
})(jQuery, document);