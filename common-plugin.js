/*-----------------------------------------------------------------------------
  common-plugin.js
 -----------------------------------------------------------------------------*/

/******************************************************************************
 * プラグイン名 : dialog
 * 機能概要     : ダイアログを表示します。
 *                ダイアログの幅を指定する場合はdata-widthを設定してください。
 *                  例) <div class="modal hide" data-width="1000px">
 * 引数         : なし
 * オプション   : keaboard : true:Escキーでダイアログを閉じる false:閉じない
 * メソッド     : close : ダイアログを閉じる
 ******************************************************************************/
(function($) {

    // ダイアログのz-index
    var _dialogZIndex = 1050;
    
    // ダイアログの位置および幅調整
    // 修正: 2014/10/16
    //       標準化追加検討 G0101 対応で判断条件と計算方法を変更。
    function _adjustDialog(dialog, width) {

        if($(window).width() > 750) {
            // 業務指定のダイアログの幅を指定する。
            dialog.css({
                "width": width
            });
            // 縦方向位置調整
            // 親画面(Window)の高さが子画面(Dailog)の高さより小さい場合は、親画面の上部からの決まった位置にする。
            var top = 0;
            var topAdjustValue = $.globalProperties.plugin.dialog.topAdjustValue;
            if ((dialog.height() + topAdjustValue + topAdjustValue) > $(window).height()) {
                top = (dialog.height() - $(window).height()) / 2 + topAdjustValue;
            }

            // 横方向位置調整
            // 親画面(Window)の幅が子画面(Dailog)の幅より小さい場合は、親画面の左側からの決まった位置にする。
            var left = 0;
            var leftAdjustValue = $.globalProperties.plugin.dialog.leftAdjustValue;
            if ((dialog.width() + leftAdjustValue + leftAdjustValue) > $(window).width()) {
                left = (dialog.width() - $(window).width()) / 2 + leftAdjustValue;
            }

            // ダイアログの表示位置指定
            dialog.css({
                "margin-top": function() { return $(window).scrollTop() - (dialog.height() / 2)  + top;},
                "margin-left": function() { return $(window).scrollLeft() -($(this).width() / 2) + left;}
            });
        } else {
            dialog.css({
                "width": "auto",
                "margin-top": 0,
                "margin-left": 0
            });
        }
    }

    // タブ切り替えで位置が変更にならないように、
    // ダイアログの固定高さでの位置および幅調整
    // 修正: 2014/10/16
    //       標準化追加検討 G0101 対応で判断条件と計算方法を変更。
    function _adjustDialogFixed(dialog, width, height) {

        if($(window).width() > 750) {
        
            // 業務指定のダイアログの幅を指定する。
            dialog.css({
                "width": width
            });

            // 縦方向位置調整
            // 親画面(Window)の高さが子画面(Dailog)の高さより小さい場合は、親画面の上部からの決まった位置にする。
            var top = 0;
            var topAdjustValue = $.globalProperties.plugin.dialog.topAdjustValue;
            if ((height + topAdjustValue + topAdjustValue) > $(window).height()) {
                top = (height - $(window).height()) / 2 + topAdjustValue;
            }

            // 横方向位置調整
            // 親画面(Window)の幅が子画面(Dailog)の幅より小さい場合は、親画面の左側からの決まった位置にする。
            var left = 0;
            var leftAdjustValue = $.globalProperties.plugin.dialog.leftAdjustValue;
            if ((width + leftAdjustValue + leftAdjustValue) > $(window).width()) {
                left = (width - $(window).width()) / 2 + leftAdjustValue;
            }

            // ダイアログの表示位置指定
            // ドラッグで移動されている場合に設定されている top, left の値はリセット(削除)しないで位置を保持する。
            // リセットはdialog()関数で最初に一度行うようにしている。
            dialog.css({
                "margin-top": function() { return $(window).scrollTop() - (height / 2)  + top;},
                "margin-left": function() { return $(window).scrollLeft() -(width / 2) + left;}
            });
        } else {
            dialog.css({
                "width": "auto",
                "margin-top": 0,
                "margin-left": 0
            });
        }
    }


    // プラグイン定義
    $.fn.dialog = function(options) {

        var dialog = this;

        if (typeof options == 'string') {

            // メソッド

            // 調整
            if (options == "close") {
                // TQ103対応: 2014/05/26 begin
                // 当該ダイアログ非表示にする際にマークとして追加したAnchorタグを削除する。
                dialog.find(".dialogLastItem").remove();
                // TQ103 end
                // 標準化追加検討 G010 begin
                $(window).off('mousemove');
                // G010 end
                // #4321 : 2014/10/20
                // コンテキストメニューの見切れ調整
                if ( dialog.find(".modal-body").hasClass("dialogModalBodyOpendMark") ){
                	dialog.find(".modal-body").removeClass("dialogModalBodyOpendMark");
                }
                // #4321 end
                dialog.modal("hide");
            } else {
                return this;
            }

        } else {

            // オプションのデフォルト値を設定する
            options = jQuery.extend( {
                keyboard: $.globalProperties.plugin.dialog.keyboard,resizable: false
            }, options);

            // Escキーで閉じる機能を使用する場合はtabindexを設定する
            if (options.keyboard) {
                dialog.attr("tabindex", "-1");
            }
            // ダイアログのz-indexを設定する(開くたびにインクリメントする)
            dialog.css("z-index", _dialogZIndex++);
            // ダイアログの幅を取得
            var width = dialog.data("width");
            if (isEmpty(width)) {
                width = "540px"; // Bootstrapのデフォルトの幅
            }
            // Bootstrapの設定でボディ部の高さが最大400pxなのを変更する
            $(".modal-body", dialog).css("max-height", 1000);
            // スクロールバーの位置を退避する
            var scrollTop = $(window).scrollTop();
            var oldFocus = jQuery().modal.Constructor.prototype.enforceFocus;
            jQuery().modal.Constructor.prototype.enforceFocus = function(){};

            // 業務子画面(dialog)のドラッグやカーソルなどの設定を行う。
            if ((dialog.attr("id") != "info-msg-box")
                && (dialog.attr("id") != "error-msg-box")
                && (dialog.attr("id") != "confirm-msg-box")
                && (dialog.attr("id") != "custom-msg-box")) {

            	// 移動(ドラッグ)されていた場合に初期位置に戻す。(標準化追加検討 G0101: 2014/10/16)
                // IE8 でdialog.draggable()を設定したタイミングで "position: relative;" が設定されて
                // しまうので、"position: absolute;"を設定する。(標準化追加検討 G0101: 2014/10/24)
                dialog.css({
                   "top": "",
                   "left": "",
                   "position": "absolute"
                });

                // ヘッダーとフッターをハンドルとしてドラッグの設定をおこなう。
                dialog.draggable({handle: ".modal-header, .modal-footer"});

                // ヘッダーとボディーに移動カーソルを設定する。(標準化追加検討 G0101: 2014/10/16)
                dialog.find(".modal-header").css({
                   "cursor": "move"
                });
                dialog.find(".modal-footer").css({
                   "cursor": "move"
                });

                // #4321 : 2014/10/20
                // コンテキストメニューの見切れ調整
                // アクティブの業務ダイアログを判断するために modal-body にクラスを設定する。
                if ( ! (dialog.find(".modal-body").hasClass("dialogModalBodyOpendMark")) ){
                    dialog.find(".modal-body").addClass("dialogModalBodyOpendMark");
                }
                // #4321 end
                // ダイアログの位置・幅を調整する。業務用のダイアログは事前に調整してから表示する。
                _adjustDialog(dialog, width, scrollTop);
            }
            
            // モーダルを開く
            dialog.modal({backdrop: "static", keyboard: options.keyboard});
            
            // enforceFocus 機能を復元する
            jQuery().modal.Constructor.prototype.enforceFocus = oldFocus;
            // 複数子画面を立ち上げたとき、一番手前の子画面以外は操作させない
            $(".modal-backdrop:last").css("z-index", _dialogZIndex - 2);
            // 変更されたスクロールバーの位置を戻す
            $(window).scrollTop(scrollTop);
            // ダイアログの位置・幅を調整する
            _adjustDialog(dialog, width, scrollTop);
            // 固定テーブルのヘッダ幅調整
            $("div.table-fixed-list", dialog).fixedTable("adjust");

            // TQA タブ切り替えで位置が変更になる。
            // Begin
            // Windowの幅が変更された場合、ダイアログの位置・幅を調整する
            // $(window).resize(function(event) {
            //     _adjustDialog(dialog, width);
            // });
            // ダイアログの高さを取得
            var height = dialog.height();
            if (isEmpty(height)) {
                dialog.css({
                    "top": "",
                    "left": ""
                });
                height = "1000px"; // ボディー部の最大高さを設定する。
            }
            // Windowの幅が変更された場合、ダイアログの位置・幅を調整する
            if ( $(this).find(".tabbable")[0] ) {
               // タブが存在するダイアログの場合は、最初に表示した高さで位置の調整を行う。
               $(window).resize(function(event) {
                   dialog.css({
                       "top": "",
                       "left": ""
                   });
                   _adjustDialogFixed(dialog, width,height);
               });
            } else {
               // タブが存在しないダイアログの場合は、表示されているダイアログの高さで位置の調整を行う。
               $(window).resize(function(event) {
                   dialog.css({
                       "top": "",
                       "left": ""
                   });
                   _adjustDialog(dialog, width);
               });
            }
            // TQA end
            // 標準化追加検討 G0101 : 親画面外にドラッグされた場合に親画面内に戻す
            // Begin
            $(window).on('mousemove',function() {
                var top          = Number(dialog.css("top").replace("px", ""));
                var marginTop    = Number(dialog.css("margin-top").replace("px", ""));
                var left         = Number(dialog.css("left").replace("px", ""));
                var marginLeft   = Number(dialog.css("margin-left").replace("px", ""));
                var dialogTop    = top  + marginTop;
                var dialogLeft   = left + marginLeft;
                   if( dialogTop < 0 ) {
                     dialog.css("top",(-marginTop) + "px");
                }
                if( dialogLeft < 0 ) {
                     dialog.css("left",(-marginLeft) + "px");
                }
            });
            // G010 end
            // TQ103対応: 2013/05/26 begin
            // validation で呼ばれた場合に、業務ＡＰで初回に設定したフォーカス位置をこのマークのタグに設定して保持する。
            var prev_focusItemIndex = dialog.find(".dialogLastItem").attr('focusItemIndex');
            // TQ103 end
            // タブキー押下時に他ダイアログにフォーカスが移動しないための目印となるタグを追加
            dialog.find(".dialogLastItem").remove();
            dialog.append("<a class='dialogLastItem' href='' />");
            // ダイアログ内入力フィールドおよびボタンのグループを取得
            var inputItem = dialog.find(":input:not(:hidden,:disabled),.btn:not(:hidden,:disabled)");
            // 入力フィールドおよびボタンのグループのはじめのオブジェクトを取得し、フォーカスを当てる
            // TQ103対応: 2013/05/26 begin
            // var firstItem = inputItem[0];
            var focusItemIndex = options.focusItemIndex;
            if ( focusItemIndex == null || focusItemIndex == "" ) {
            	if ( prev_focusItemIndex == null || prev_focusItemIndex == "") {
                	focusItemIndex = 0;
            	} else {
            		focusItemIndex = prev_focusItemIndex;
            	}
            }
            var firstItem = inputItem[focusItemIndex];
            dialog.find(".dialogLastItem").attr('focusItemIndex',""+focusItemIndex);
            // TQ103 end
            firstItem.focus();
            // 目印にフォーカスが当たった場合、ダイアログ表示時にフォーカスしたオブジェクトにフォーカスを当てる
            $(".dialogLastItem").focusin(function(){
                // TQ102 対応　2014/5/23 begin
            	// firstItem.focus();
            	// タブを考慮して "a(Anchor)"タグのセレクターを追加する。
            	dialog.find(":input:not(:hidden,:disabled),.btn:not(:hidden,:disabled),a").first().focus();
            	// TQ102 end
            });
            // TQ102 対応　2014/5/23 begin
            // 先頭項目でのShift+TABキー押下で、当該ダイアログのアクティブな後尾項目にフォーカスを当てる
            // FireBugs でデバッグする際は、「inputItemFirst.is(':focus');」行以前で停止するとフォーカスが
            // ステップ実行をするとそちらにフォーカスが移動してしまうので、期待通りの遷移にならないので
            // 注意すること。
            $(dialog).keydown(function(event){
                var inputItemList,inputItemFirst,inputItemLast,hasFocus;
                if ( event.which == 9) {
                    if (event.shiftKey){
                        inputItemList  = dialog.find(":input:not(:hidden,:disabled),.btn:not(:hidden,:disabled),a:not(.dialogLastItem)");
                        inputItemFirst = inputItemList.first();
                        inputItemLast  = inputItemList.last();
                        hasFocus = inputItemFirst.is(':focus');
                        if (hasFocus){
                             inputItemLast.focus();
                             return false;
                        }
                    }
                }
                return true;
            });
            // TQ102 end
        }

        return this;
    };
})(jQuery);

/******************************************************************************
 * プラグイン名 : infoMsgBox
 * 機能概要     : 情報メッセージボックスを表示します。
 * 引数         : message        : メッセージ
 *                callbackOk     : OKボタン押下時のコールバック関数
 * オプション   : なし
 ******************************************************************************/
(function($) {

    // 情報メッセージボックス
    var _infoMsgBox = $("<div class='modal' id='info-msg-box'>"
                    + "<div class='modal-header'><h4>"
                    + $.globalProperties.plugin.infoMsgBox.title
                    + "</h4></div>"
                    + "<div class='modal-body'><p class='message text-info' style='word-break: break-all'></p></div>"
                    + "<div class='modal-footer'>"
                    + "<button type='button' class='btn ok'>OK</button>"
                    + "</div>"
                    + "</div>");

    // プラグイン定義
    $.infoMsgBox = function(message, callbackOk) {
        $(".message", _infoMsgBox)
            .html(message);
        $(".ok", _infoMsgBox)
            .unbind("click")
            .click(function() {
                _infoMsgBox.dialog("close");
                _infoMsgBox.remove();
                if (isNotEmpty(callbackOk)) { callbackOk(); }
            });
        _infoMsgBox.dialog();
    }
})(jQuery);

/******************************************************************************
 * プラグイン名 : errorMsgBox
 * 機能概要     : エラーメッセージボックスを表示します。
 * 引数         : message        : メッセージ
 *                callbackOk     : OKボタン押下時のコールバック関数
 * オプション   : なし
 ******************************************************************************/
(function($) {

    // エラーメッセージボックス
    var _errorMsgBox = $("<div class='modal' id='error-msg-box'>"
                    + "<div class='modal-header'><h4>"
                    + $.globalProperties.plugin.errorMsgBox.title
                    + "</h4></div>"
                    + "<div class='modal-body'><p class='message text-error' style='word-break: break-all'></p></div>"
                    + "<div class='modal-footer'>"
                    + "<button type='button' class='btn ok'>OK</button>"
                    + "</div>"
                    + "</div>");

    // プラグイン定義
    $.errorMsgBox = function(message, callbackOk) {
        $(".message", _errorMsgBox)
            .html(message);
        $(".ok", _errorMsgBox)
            .unbind("click")
            .click(function() {
                _errorMsgBox.dialog("close");
                _errorMsgBox.remove();
                if (isNotEmpty(callbackOk)) { callbackOk(); }
            });
        _errorMsgBox.dialog();
    }
})(jQuery);

/******************************************************************************
 * プラグイン名 : confirmMsgBox
 * 機能概要     : 確認メッセージボックスを表示します。
 * 引数         : message        : メッセージ
 *                callbackOk     : OKボタン押下時のコールバック関数
 *                callbackCancel : キャンセルボタン押下時のコールバック関数
 * オプション   : なし
 ******************************************************************************/
(function($) {

    // 確認メッセージボックス
    var _confirmMsgBox = $("<div class='modal' id='confirm-msg-box'>"
                    + "<div class='modal-header'><h4>"
                    + $.globalProperties.plugin.confirmMsgBox.title
                    + "</h4></div>"
                    + "<div class='modal-body'><p class='message' style='word-break: break-all'></p></div>"
                    + "<div class='modal-footer'>"
                    + "<a href='javascript:void(0);' class='btn ok'>OK</a>"
                    + "<a href='javascript:void(0);' class='btn cancel'>キャンセル</a>"
                    + "</div>"
                    + "</div>");

    // プラグイン定義
    $.confirmMsgBox = function(message, callbackOk, callbackCancel) {
        $(".message", _confirmMsgBox)
            .html(message);
        $(".ok", _confirmMsgBox)
            .unbind("click")
            .click(function() {
                _confirmMsgBox.dialog("close");
                _confirmMsgBox.remove();
                if (isNotEmpty(callbackOk)) { callbackOk(); }
            });
        $(".cancel", _confirmMsgBox)
            .unbind("click")
            .click(function() {
                _confirmMsgBox.dialog("close");
                _confirmMsgBox.remove();
                if (isNotEmpty(callbackCancel)) { callbackCancel(); }
            });
        _confirmMsgBox.dialog();
    }
})(jQuery);

/******************************************************************************
 * プラグイン名 : customMsgBox
 * 機能概要     : カスタムメッセージボックスを表示します。
 * 引数         : type    : タイプ("info","error","confirm")
 *                message : メッセージ
 *                buttons : ボタン名称とコールバック関数の連想配列
 *                           例) { "OK": function() { ... }, 
 *                                 "キャンセル": function() { ... } }
 * オプション   : なし
 ******************************************************************************/
(function($) {

    // カスタムメッセージボックス
    var _customMsgBox = $("<div class='modal' id='custom-msg-box'>"
                    + "<div class='modal-header'><h4></h4></div>"
                    + "<div class='modal-body'><p class='message' style='word-break: break-all'></p></div>"
                    + "<div class='modal-footer'>"
                    + "</div>"
                    + "</div>");

    // プラグイン定義
    $.customMsgBox = function(type, message, buttons) {

        $(".modal-body p", _customMsgBox).removeClass("text-info").removeClass("text-error");

        if (type == "info") {
            $(".modal-header h4", _customMsgBox).html($.globalProperties.plugin.infoMsgBox.title);
            $(".modal-body p", _customMsgBox).addClass("text-info");
        } else if (type == "error") {
            $(".modal-header h4", _customMsgBox).html($.globalProperties.plugin.errorMsgBox.title);
            $(".modal-body p", _customMsgBox).addClass("text-error");
        } else if (type == "confirm") {
            $(".modal-header h4", _customMsgBox).html($.globalProperties.plugin.confirmMsgBox.title);
        } else {
            return false;
        }

        $(".message", _customMsgBox).html(message);
        $(".modal-footer a", _customMsgBox).remove();
        
        for (var name in buttons) {
            var callback = buttons[name];
            var button = $("<a href='javascript:void(0);' class='btn'></a>");
            
            button.html(name);
            button.data("callback", callback);
            button.click(function() {
                _customMsgBox.dialog("close");
                var callback = $(this).data("callback");
                if (isNotEmpty(callback)) { callback(); }
                _customMsgBox.remove();
            });
            
            $(".modal-footer", _customMsgBox).append(button);
        }

        _customMsgBox.dialog();
    }
})(jQuery);

/******************************************************************************
 * プラグイン名 : dateTextbox
 * 機能概要     : 日付入力のテキストボックスを設定します。
 *                テキストボックスにフォーカスがあたると入力値を"yyyyMMdd"形式に
 *                整形します。フォーカスが外れると"yyyy/MM/dd"形式に整形します。
 *                日付のフォーマットはglobalPropertiesで変更可能です。
 *                Datepicker for Bootstrapの機能を利用したDatePickerを追加します。
 * 引数         : なし
 * オプション   : datepicker : true:DatePickerを使用する false:使用しない
 ******************************************************************************/
(function($) {

    // 日付フォーマット
    var _dateFormat = $.globalProperties.screen.dateTextbox.dateFormat;
    // テキストボックスフォーカス時の日付フォーマット
    var _focusDateFormat = $.globalProperties.screen.dateTextbox.focusDateFormat;
    // Datepicker起動アイコン
    var _datepickerIcon = $.globalProperties.screen.dateTextbox.datepickerIcon;

    // プラグイン定義
    $.fn.dateTextbox = function(options) {

        // オプションのデフォルト値を設定する
        options = jQuery.extend( {
            datepicker: $.globalProperties.screen.dateTextbox.datepicker
        }, options);

        this.each(function() {

            if (!$(this).hasClass("applied-date-textbox")) {

                // 最大文字数を設定し、テキストボックスの設定を行う
                $(this).attr("maxlength", _dateFormat.length);
                $(this).addClass("input-small");

                // 現在の入力値のフォーマットを変換する
                $(this).val(convertDateFormat($(this).val(), _focusDateFormat, _dateFormat));

                if (!$(this).attr("readonly") && !$(this).attr("disabled")) {
                    // フォーカス時に日付フォーマットを変換する
                    $(this).focus(function() {
                        $(this).val(convertDateFormat($(this).val(), _dateFormat, _focusDateFormat));
                    });
                    // フォーカスが外れたときに日付フォーマットを変換する
                    $(this).blur(function() {
                        $(this).val(convertDateFormat($(this).val(), _focusDateFormat, _dateFormat));
                    });
                    // ダブルクリックでシステム日付を設定する
                    $(this).dblclick(function() {
                        if (isEmpty($(this).val())) {
                            $(this).val(getSystemDate(_focusDateFormat));
                        }
                    });
                }

                // Datepickerの設定
                if (options.datepicker == true && !$(this).attr("readonly") && !$(this).attr("disabled") ) {
                    // テキストボックスの後ろにアイコンを追加する
                    var icon = $(_datepickerIcon);
                    $(this).after(icon);
                    // アイコンがクリックされたときにdatepickerを表示する
                    var dateTextbox = $(this);
                    icon.click(function() {
                        dateTextbox.datepicker({
                            onClose: function(dateText, inst) { dateTextbox.datepicker("destroy"); }
                        }).datepicker("show");
                    });
                }

                $(this).addClass("applied-date-textbox");
            }
        });

        return this;
    };
})(jQuery);

/******************************************************************************
 * プラグイン名 : numberTextbox
 * 機能概要     : 数値入力のテキストボックスを設定します。
 *                テキストボックスにフォーカルがあたると入力値のカンマを除去します。
 *                フォーカスが外れるとカンマを付与します。
 *                小数点以下の桁数を揃えたい場合はテキストボックスにdata-decimal
 *                属性を追加して小数点以下の桁数を指定してください。
 *                data-decimalで指定した桁数で値が0の場合は表示しない(例：4.10⇒4.1)ように
 *                する場合は、さらにdata-hide-zero-decimal属性を指定してください。
 *                  例) <input type="text" class="number" data-decimal="2" />
 *                      <input type="text" class="number" data-decimal="2" data-hide-zero-decimal="true" />
 * 引数         : なし
 * オプション   : なし
 ******************************************************************************/
(function($) {

    // プラグイン定義
    $.fn.numberTextbox = function() {

        this.each(function() {

            var numberFormat = "###,###,###,###,###,###,###";
            var decimal = $(this).data("decimal") - 0;
            var hideZeroDecimal = $(this).data("hide-zero-decimal");

            // 小数点以下の桁数が指定された場合はフォーマットを変更する
            if (decimal > 0) {
                if(hideZeroDecimal){
                    numberFormat += "." + padLeft("", decimal, "#");
                }else{
                    numberFormat += "." + padLeft("", decimal, "0");
                }
            }

            if (!$(this).hasClass("applied-number-textbox")) {

                // 現在の入力値のフォーマットを変換する
                if (isNotEmpty($(this).val())) {
                	// Trac #4071 :
                	// $(this).val(formatNumber($(this).val(), numberFormat));
                	// start
                	$(this).val(formatNumber(parseNumber($(this).val()), numberFormat));
                	// end #4071 
                }

                if (!$(this).attr("readonly") && !$(this).attr("disabled")) {
                    // フォーカス時にフォーマットを変換する
                    $(this).focus(function() {
                        if (isNotEmpty($(this).val())) {
                            $(this).val(parseNumber($(this).val()));
                            setPositionAtEnd($(this));
                        }
                    });
                    // フォーカスが外れたときにフォーマットを変換する
                    $(this).blur(function() {
                        if (isNotEmpty($(this).val())) {
                        	// Trac #4071 :
                       	 	// $(this).val(formatNumber($(this).val(), numberFormat));
                        	// start
                        	 $(this).val(formatNumber(parseNumber($(this).val()), numberFormat));
                         	// end #4071 
                        }
                    });
                }

                $(this).addClass("applied-number-textbox");
            }
        });

        return this;
    };
})(jQuery);

/******************************************************************************
 * プラグイン名 : fixedTable
 * 機能概要     : テーブルのボディ部の高さを固定します。
 *                また、ヘッダとボディを分割して横スクロールを同期します。
 *                ボディ部の高さはdata-heightで設定してください。
 *                  例) <div class="table-fixed-list" data-height="250px">
 *                        <table class="table-list"> ... </table>
 *                      </div>
 * 引数         : なし
 * オプション   : なし
 * メソッド     : adjust : ヘッダの幅を調整する
 ******************************************************************************/
(function($) {

    // ヘッダの幅をスクロールバー分だけ短くする調整値
    var _adjustHeaderWidth = 17;

    // プラグイン定義
    $.fn.fixedTable = function(options) {

        // 初期化処理
        this.each(function() {

            if (typeof options == 'string') {

                // メソッド

                // 調整
                if (options == "adjust") {
                    var headerDiv = $("table.table-fixed-list-header", $(this)).parent();
                    var bodyDiv = $("table.table-fixed-list-body", $(this)).parent();
                    headerDiv.width(bodyDiv.width() - _adjustHeaderWidth);
                } else {
                    return this;
                }

            } else {

                if (!$(this).hasClass("applied-fixed-table")) {

                    var height = $(this).data("height");

                    // thead,tbody,colgroupを抽出
                    var table = $(this).children("table.table-list");
                    var header = $("thead", table);
                    var body = $("tbody", table);
                    var colgroup = $("colgroup", table);
                    var tableAttributes = table.prop("attributes");

                    // ヘッダのみのテーブルを生成
                    var headerTable = $("<table>");
                    headerTable.addClass("table-list table-fixed-list-header table table-bordered table-condensed")
                        .append(colgroup.clone())
                        .append(header);
                    // ボディのみのテーブルを作成
                    var bodyTable = $("<table>");
                    $.each(tableAttributes, function() {
                        bodyTable.attr(this.name, this.value);
                    });

                    bodyTable.addClass("table-list table-fixed-list-body table table-bordered table-condensed table-striped")
                        .append(colgroup.clone())
                        .append(body);

                    // 現在の一覧テーブルのdivにヘッダのdivを追加する
                    var headerDiv = $("<div>")
                        .css("overflow-x", "hidden")
                        .css("clear", "both")
                        .append(headerTable);
                    // 縦スクロールバーの分だけ幅を短くする
                    headerDiv.width($(this).width() - _adjustHeaderWidth);
                    table.before(headerDiv);
                    // 現在の一覧テーブルのdivにボディのdivを追加する
                    var bodyDiv = $("<div>")
                        .addClass("bottom-space")
                        .css("overflow-x", "auto")
                        .css("overflow-y", "scroll")
                        .css("width", "100%")
                        .css("height", height)
                        .append(bodyTable);
                    table.before(bodyDiv);

                    // ヘッダとボディの横スクロールバーを同期させる
                    bodyDiv.syncScrollX(headerDiv);
                	// #3354 : 2014/06/02 start
                	// タブキー押下でテーブルのヘッダーとボディーがずれる 
                    // ボディとヘッダの横スクロールバーを同期させる
                	headerDiv.syncScrollX(bodyDiv);
                	// #3354 end
                	
                    // 元のテーブルを削除
                    table.remove();

                    // Windowの幅が変更された場合、ヘッダの幅を調整する
                    $(window).resize(function(event) {
                        headerDiv.width(bodyDiv.width() - _adjustHeaderWidth);
                    });

                    $(this).addClass("applied-fixed-table");
                }
            }

        });

        return this;
    }
})(jQuery);

/******************************************************************************
 * プラグイン名 : stripeTable
 * 機能概要     : テーブルをストライプにするための設定を行います。IE対応です。
 * 引数         : なし
 * オプション   : なし
 ******************************************************************************/
(function($) {

    $.fn.stripeTable = function() {
        $("table.table-striped tbody tr:nth-child(odd) td", this).addClass("odd");
    };
})(jQuery);

/******************************************************************************
 * プラグイン名 : clearInputValue
 * 機能概要     : 入力値をクリアします。
 *                指定されたオブジェクトおよびオブジェクトの子孫要素の入力値を
 *                クリアします。
 * 引数         : なし
 * オプション   : なし
 ******************************************************************************/
(function($) {

    // 入力値のクリア
    function _clear(obj) {

        if (obj.length == 0) {
            return;
        }

        obj.each(function() {

            if ($(this).is(":text,:password,:file,:hidden,textarea")) {

                $(this).val("");

                if ($(this).is(":file")) {
                    // IEの場合、ファイルのvalueをクリアすることができない
                    // IEでファイルのクリアを行いたい場合はファイルのinputタグをspanタグで囲むこと
                    //   例) <span><input type="file" name="xxx"></span>
                    $(this).parent("span").each(function() {
                        var tmp = $(this).html();
                        $(this).html(tmp);
                    });
                }

            } else if ($(this).is(":checkbox,:radio")) {

                $(this).attr("checked", false);

            } else if ($(this).is("select")) {

                if (!$(this).is("select[multiple]")) {
                    $(this).children("option:first").attr("selected", true);
                } else {
                    $(this).children("option").attr("selected", false);
                }

            } else {
                _clear($(":input", $(this)));
            }
        });
    }

    // プラグイン定義
    $.fn.clearInputValue = function() {

        _clear(this);

        return this;
    };
})(jQuery);

/******************************************************************************
 * プラグイン名 : toggleCheckbox
 * 機能概要     : チェックボックスをONにした場合、対象のチェックボックスを全て
 *                ONにします。OFFにした場合は全てOFFにします。
 * 引数         : checkboxes : 変更対象のチェックボックスのjQueryオブジェクト
 * オプション   : なし
 ******************************************************************************/
(function($) {

    $.fn.toggleCheckbox = function(checkboxes) {

        // 切り替え対象チェックボックスの確認
        if (isEmpty(checkboxes)) {
            return false;
        }

        this.each(function() {
            $(this).click(function() {
                checkboxes.attr("checked", $(this).is(":checked"));
            });
        });
        
        var all = this;
        checkboxes.click(function() {
            if (!$(this).is(":checked")) {
                all.attr("checked", false);
            }
        });

        return this;
    };
})(jQuery);

/******************************************************************************
 * プラグイン名 : syncScrollX
 * 機能概要     : 2つの横スクロールバーのスクロール位置を同期します。
 * 引数         : sync : 同期対象のdivのjQueryオブジェクト
 * オプション   : なし
 ******************************************************************************/
(function($) {

    $.fn.syncScrollX = function(sync) {

        // 同期対象の確認
        if (isEmpty(sync)) {
            return null;
        }

        var scroll = this;

        // scrollイベントに対する処理
        this.scroll(function() {

            // スクロール位置を取得する
            var scrollLeft = scroll.scrollLeft();

            // スクロールバーのスクロール位置を同期する
            sync.each(function() {

                $(this).scrollLeft(scrollLeft);
            });
        });

        // ウィンドウのリサイズイベント時にスクロールバーの位置を初期化する
        $(window).resize(function(event) {
            scroll.scrollLeft(0);
        });

        return this;
    };
})(jQuery);

/******************************************************************************
 * プラグイン名 : clickByEnterKey
 * 機能概要     : 指定された範囲内の入力部品でEnterキーが押下された場合、特定の
 *                ボタンをクリックします。
 *                クリックされるボタンのクラスに"click-by-enter"を設定してください。
 * 引数         : なし
 * オプション   : なし
 ******************************************************************************/
(function($) {

    $.fn.clickByEnterKey = function() {

        this.each(function() {
            
            var button = $(this).find(".click-by-enter");
            $(this).find(":input").each(function() {
                if (!($(this).hasClass("click-by-enter")) && !($(this)[0].nodeName == "button")) {
                    $(this).keyup(function(event) {
                        if (event.keyCode == 13) {
                            button.click();
                        }
                    });
                }
            });
        });

        return this;
    };
})(jQuery);

/******************************************************************************
 * プラグイン名 : globalProperties
 * 機能概要     : GlobalPropertiesの値を設定します。
 *                引数の設定値に設定した値のみが上書きされます。
 * 引数         : prop : 設定値
 * オプション   : なし
 ******************************************************************************/
(function($) {

    $.fn.globalProperties = function(prop) {
        $.extend(true, $.globalProperties, prop);
    };
})(jQuery);

// LongNP Add Start
/******************************************************************************
 * プラグイン名 : yearMonthTextbox
 * 機能概要     : 日付入力のテキストボックスを設定します。
 *                テキストボックスにフォーカスがあたると入力値を"yyyyMM"形式に
 *                整形します。フォーカスが外れると"yyyy/MM"形式に整形します。
 *                日付のフォーマットはglobalPropertiesで変更可能です。
 *                Datepicker for Bootstrapの機能を利用したDatePickerを追加します。
 * 引数         : なし
 * オプション   : datepicker : true:DatePickerを使用する false:使用しない
 ******************************************************************************/
(function($) {

    // 日付フォーマット
    var _dateFormat = $.globalProperties.screen.yearMonthTextbox.dateFormat;
    // テキストボックスフォーカス時の日付フォーマット
    var _focusDateFormat = $.globalProperties.screen.yearMonthTextbox.focusDateFormat;

    // プラグイン定義
    $.fn.yearMonthTextbox = function(options) {

        // オプションのデフォルト値を設定する
        options = jQuery.extend( {
            datepicker: $.globalProperties.screen.dateTextbox.datepicker
        }, options);

        this.each(function() {

            if (!$(this).hasClass("applied-date-textbox")) {

                // 最大文字数を設定し、テキストボックスの設定を行う
                $(this).attr("maxlength", _dateFormat.length);
                $(this).addClass("input-mini");

                // 現在の入力値のフォーマットを変換する
                $(this).val(convertDateFormat($(this).val(), _focusDateFormat, _dateFormat));

                if (!$(this).attr("readonly") && !$(this).attr("disabled")) {
                    // フォーカス時に日付フォーマットを変換する
                    $(this).focus(function() {
                        var dateTextbox = $(this);
                        dateTextbox.ympicker({
                            onClose: function(dateText, inst) {
                                dateTextbox.ympicker("destroy"); }
                        }).ympicker("show");

                        dateTextbox.val(convertDateFormat(dateTextbox.val(), _dateFormat, _focusDateFormat));
                    });
                    // フォーカスが外れたときに日付フォーマットを変換する
                    $(this).blur(function() {
                        $(this).val(convertDateFormat($(this).val(), _focusDateFormat, _dateFormat));
                    });
                    // ダブルクリックでシステム日付を設定する
                    $(this).dblclick(function() {
                        if (isEmpty($(this).val())) {
                            $(this).val(getSystemDate(_focusDateFormat));
                        }
                    });
                }

                $(this).addClass("applied-date-textbox");
            }
        });

        return this;
    };
})(jQuery);

function setPositionAtEnd(element) {
    var length = element.val().length;
    // For IE Only
    if (document.selection) {
         var fieldRange = document.selection.createRange();
         fieldRange.moveStart('character', -length);
         fieldRange.moveStart('character', length);
         fieldRange.moveEnd('character', 0);
         fieldRange.select();
    }
    else if (element.selectionStart || element.selectionStart == '0') {
        // Firefox/Chrome
        element.selectionStart = length;
        element.selectionEnd = length;
    }
}

/******************************************************************************
 * プラグイン名 : tableHighlight
 * 機能概要     : ハイライト
 * 引数         : なし
 * オプション   : なし
 ******************************************************************************/
(function($) {

    $.fn.tableHighlight = function() {
        if (!$(this).hasClass("applied-table-highlight")) {
            $(this).find("tbody tr").hover(
                    function() {
                        $(this).addClass('hv');
                    },
                    function() {
                        $(this).removeClass('hv');
                    }
                );
        }

        $(this).addClass("applied-table-highlight");

        return this;
    };
})(jQuery);
// LongNP Add End