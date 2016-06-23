/*-----------------------------------------------------------------------------
  common-screen.js
 -----------------------------------------------------------------------------*/

/******************************************************************************
 * 関数名   : doSubmit
 * 機能概要 : フォームをサブミットします。
 * 引数     : form                : フォームのIDまたはフォームのjQueryオブジェクト
 *            options.action      : アクション
 *            options.op          : オペレーション識別子
 *            options.params      : 追加パラメータ(Map)
 *            options.isBlockPage : true:ページをブロックする false:ページをブロックしない
 * 戻り値   : なし
 ******************************************************************************/
function doSubmit(form, options) {

    // オプションのデフォルト値を設定する
    options = $.extend({
        action: "",
        op: "",
        params: null,
        isBlockPage: $.globalProperties.screen.doSubmit.isBlockPage
    }, options);
    // 別ウィンドウ呼出し判定結果
    if ($("#keep-isChildWindow-hidden").val() == "true") {
    	
    	// 親画面が居なければクローズ
    	if (!opnerClosedChildClose()) {
    		// 処理は中断
    		return false;
    	}
    		
        options = $.extend(true, options, {
            params: {childFlg: true},
        });
    }


    // フォームの設定
    var formObj = _setForm(form, options.action, options.op, options.params);

    // ページのブロック
    if (options.isBlockPage) {
        blockPage();
    }
    
    // ブラウザバック対策用フラグをたてる
    $("#isAlreadySent").val("true");

    // フォームをサブミットする
    formObj.get(0).submit();
};

/******************************************************************************
 * 関数名   : _setForm
 * 機能概要 : フォームに各種値を設定します。
 * 引数     : form              : フォームのIDまたはフォームのjQueryオブジェクト
 *            options.action    : アクション
 *            options.op        : オペレーション識別子
 *            options.params    : 追加パラメータ(Map)
 * 戻り値   : なし
 ******************************************************************************/
function _setForm(form, action, op, params) {

    // フォームのjQueryオブジェクト取得
    var formObj;
    if (typeof form == 'string') {
        formObj = $("#" + form);
    } else {
        formObj = form;
    }

    // フォームの属性にアクションを設定する
    if (isNotEmpty(action)) {
        formObj.attr("action", action);
    }

    // フォームにオペレーション識別子のHidden項目を追加する
    if (isNotEmpty(op)) {
        if (formObj.find(":input[name='op']").length > 0) {
            formObj.find(":input[name='op']").val(op);
        } else {
            $("<input>")
            .attr("type", "hidden")
            .attr("name", "op")
            .val(op)
            .appendTo(formObj);
        }
    }

    if (formObj.find(":input[name='formId']").length > 0) {
        formObj.find(":input[name='formId']").val(formObj.attr("id"));
    } else {
        $("<input>")
        .attr("type", "hidden")
        .attr("name", "formId")
        .val(formObj.attr("id"))
        .appendTo(formObj);
    }

    // 追加パラメータをHidden項目として追加する
    if (isNotEmpty(params)) {
        for (var name in params) {
            var value = params[name];
            if (formObj.find(":checkbox[name='" + name + "'],:radio[name='" + name + "']").length > 0) {

                // チェックボックス、ラジオボタンの場合は値に該当するタグをチェックする
                // 値に該当するタグが存在しないことまでは考慮しない
                formObj.find("*[name='" + name + "'][value='" + value + "']").attr("checked", true);

            } else if (formObj.find(":input[name='" + name + "']").length > 0
                    || formObj.find("textarea[name='" + name + "']").length > 0
                    || formObj.find("select[name='" + name + "']").length > 0) {

                // その他input、テキストエリア、セレクトの場合は値を設定する
                formObj.find("*[name='" + name + "']").val(value);

            } else {

                // 名前に該当するタグが見つからない場合はHidden項目を追加する
                $("<input>")
                .attr("type", "hidden")
                .attr("name", name)
                .val(value)
                .appendTo(formObj);
            }
        }
    }

    return formObj;
}

/******************************************************************************
 * 関数名   : blockPage
 * 機能概要 : ページをブロックします。
 * 引数     : options.message : メッセージ
 * 戻り値   : なし
 ******************************************************************************/
var _blockCount = 0;
function blockPage(options) {

    // オプションのデフォルト値を設定する
    options = $.extend({
        message: $.globalProperties.screen.blockPage.message
    }, options);

    // ページをブロックする
    if (_blockCount <= 0) {
        $.blockUI({
            message: $.globalProperties.screen.blockPage.icon + options.message,
            css: $.globalProperties.screen.blockPage.messageCss,
            overlayCSS: $.globalProperties.screen.blockPage.overlayCss,
            baseZ: 9999,
            fadeIn: 0
        });
        _blockCount = 1;
    } else {
        _blockCount++;
    }
};

/******************************************************************************
 * 関数名   : blockPage
 * 機能概要 : ページをブロックします。
 * 引数     : なし
 * 戻り値   : なし
 ******************************************************************************/
function blockPageForChild() {

    // ページをブロックする
    if (_blockCount <= 0) {
    	_blockPageForChild();
        $('.blockOverlay').click(
        		function() {
        			unblockPage();
        			$.confirmMsgBox(
        					'子画面を閉じてブロックを解除しますか？',
        					function () {
        						closeAllChildWindow();
        					},
        					function () {
        						blockPageForChild();
        					});
        			}
        		); 
        _blockCount = 1;
    } else {
        _blockCount++;
    }
};

function _blockPageForChild() {
    $.blockUI({
        message: '子画面表示中<br>（画面クリックで子画面を終了し、ブロック解除）',
        baseZ: 9999
    });

}


/******************************************************************************
 * 関数名   : unblockPage
 * 機能概要 : ページのブロックを解除します。
 * 引数     : なし
 * 戻り値   : なし
 ******************************************************************************/
function unblockPage() {
    if (_blockCount <= 1) {
        $.unblockUI();
        _blockCount = 0;
    } else {
        _blockCount--;
    }
};

/******************************************************************************
 * 関数名   : asyncUnblockPage
 * 機能概要 : すべての子画面が存在しない場合のみ非同期でページのブロックを解除します。
 * 引数     : なし
 * 戻り値   : なし
 ******************************************************************************/
function asyncUnblockPage() {
	_asyncUnblockPage(0);
};
function _asyncUnblockPage(cnt) {
    setTimeout(function(){
    	var wincnt = 0;
        for (var i = 0; i < _winArray.length; i++) {
            if (!_winArray[i].closed) {
                wincnt++;
            }
        }
    	if (wincnt == 0) {
    		unblockPage();
    	} else if (cnt > 10) {
    		return;
    	} else {
    		cnt++;
    		_asyncUnblockPage(cnt);
    	}
      }, 300);

}


/******************************************************************************
 * 関数名   : openChildWindow
 * 機能概要 : 子画面をモードレスで開きます。
 *            この関数で開いた子画面は親画面のクローズや画面遷移時に自動的に閉じます。
 * 引数     : url                 : URL
 *            windowName          : 子画面名
 *            options.width       : 子画面の幅
 *            options.height      : 子画面の高さ
 *            options.left        : 子画面の左位置
 *            options.top         : 子画面の上位置
 *            options.menubar     : メニューバー有無(yesまたはno)
 *            options.toolbar     : ツールバー有無(yesまたはno)
 *            options.location    : アドレスバー有無(yesまたはno)
 *            options.status      : ステータスバー有無(yesまたはno)
 *            options.resizable   : リサイズ可否(yesまたはno)
 *            options.scrollbars  : スクロールバー有無(yesまたはno)
 *            options.isAutoClose : true:親画面遷移時に自動的に閉じる false:閉じない
 * 戻り値   : 子画面のウィンドウオブジェクト
 ******************************************************************************/
function openChildWindow(url, windowName, options) {

    // オプションのデフォルト値を設定する
    options = $.extend({
        width: $.globalProperties.screen.openChildWindow.width,
        height: $.globalProperties.screen.openChildWindow.height,
        left: $.globalProperties.screen.openChildWindow.left,
        top: $.globalProperties.screen.openChildWindow.top,
        menubar: $.globalProperties.screen.openChildWindow.menubar,
        toolbar: $.globalProperties.screen.openChildWindow.toolbar,
        location: $.globalProperties.screen.openChildWindow.location,
        status: $.globalProperties.screen.openChildWindow.status,
        resizable: $.globalProperties.screen.openChildWindow.resizable,
        scrollbars: $.globalProperties.screen.openChildWindow.scrollbars,
        isAutoClose: true
    }, options);

    var option = "";

    if (isNotEmpty(options.width)) {
        option += "width=" + options.width + ",";
    }
    if (isNotEmpty(options.height)) {
        option += "height=" + options.height + ",";
    }
    if (isNotEmpty(options.left)) {
        option += "left=" + options.left + ",";
    }
    if (isNotEmpty(options.top)) {
        option += "top=" + options.top + ",";
    }
    if (isNotEmpty(options.menubar)) {
        option += "menubar=" + options.menubar + ",";
    }
    if (isNotEmpty(options.toolbar)) {
        option += "toolbar=" + options.toolbar + ",";
    }
    if (isNotEmpty(options.location)) {
        option += "location=" + options.location + ",";
    }
    if (isNotEmpty(options.status)) {
        option += "status=" + options.status + ",";
    }
    if (isNotEmpty(options.resizable)) {
        option += "resizable=" + options.resizable + ",";
    }
    if (isNotEmpty(options.scrollbars)) {
        option += "scrollbars=" + options.scrollbars + ",";
    }

    if (option.length > 0) {
        option = option.substring(0, option.length - 1);
    }

    var win = window.open(url, windowName, option);

    if (options.isAutoClose) {
        _winArray.push(win);
    }

    return win;
}
var _winArray = new Array();

/******************************************************************************
 * 関数名   : openModalChildWindow
 * 機能概要 : 子画面をモーダルで開きます。
 * 引数     : url                : URL
 *            windowName         : 子画面名
 *            options.width      : 子画面の幅
 *            options.height     : 子画面の高さ
 *            options.left       : 子画面の左位置
 *            options.top        : 子画面の上位置
 *            options.center     : センター表示(yesまたはno)
 *                                 ※left、topが指定された場合は無効
 *            options.status     : ステータスバー有無(yesまたはno)
 *            options.scrollbars : スクロールバー有無(yesまたはno)
 *            options.resizable  : リサイズ可否(yesまたはno)
 *            options.help       : ヘルプボタン有無(yesまたはno)
 *            options.minimize   : 最小化ボタン有無(yesまたはno)
 *            options.maximize   : 最大化ボタン有無(yesまたはno)
 *            options.arguments  : 子画面に渡す引数
 * 戻り値   : 子画面の戻り値
 ******************************************************************************/
function openModalChildWindow(url, options) {

    // オプションのデフォルト値を設定する
    options = $.extend({
        width: $.globalProperties.screen.openModalChildWindow.width,
        height: $.globalProperties.screen.openModalChildWindow.height,
        left: $.globalProperties.screen.openModalChildWindow.left,
        top: $.globalProperties.screen.openModalChildWindow.top,
        center: $.globalProperties.screen.openModalChildWindow.center,
        status: $.globalProperties.screen.openModalChildWindow.status,
        scrollbars: $.globalProperties.screen.openModalChildWindow.scrollbars,
        resizable: $.globalProperties.screen.openModalChildWindow.resizable,
        help: $.globalProperties.screen.openModalChildWindow.help,
        minimize: $.globalProperties.screen.openModalChildWindow.minimize,
        maximize: $.globalProperties.screen.openModalChildWindow.maximize,
        arguments: null
    }, options);

    var option = "";

    if (isNotEmpty(options.width)) {
        option += "dialogWidth=" + options.width + ";";
    }
    if (isNotEmpty(options.height)) {
        option += "dialogHeight=" + options.height + ";";
    }
    if (isNotEmpty(options.left)) {
        option += "dialogLeft=" + options.left + ";";
    }
    if (isNotEmpty(options.top)) {
        option += "dialogTop=" + options.top + ";";
    }
    if (isNotEmpty(options.center)) {
        option += "center=" + options.center + ";";
    }
    if (isNotEmpty(options.status)) {
        option += "status=" + options.status + ";";
    }
    if (isNotEmpty(options.scrollbars)) {
        option += "scroll=" + options.scrollbars + ";";
    }
    if (isNotEmpty(options.resizable)) {
        option += "resizable=" + options.resizable + ";";
    }
    if (isNotEmpty(options.help)) {
        option += "help=" + options.help + ";";
    }
    if (isNotEmpty(options.minimize)) {
        option += "minimize=" + options.minimize + ";";
    }
    if (isNotEmpty(options.maximize)) {
        option += "maximize=" + options.maximize + ";";
    }

    return window.showModalDialog(url, options.arguments, option);
}

//子画面のウィンドウオブジェクト
var childWindow;
//子画面オープンの最大待機時間(ms)
var sleepTime = 300;

/******************************************************************************
 * 関数名   : openChildWindowForPost
 * 機能概要 : 子画面をモードレスで開き、POST送信します。
 *            この関数で開いた子画面は親画面のクローズや画面遷移時に自動的に閉じます。
 * 引数     : form                : フォームのIDまたはフォームのjQueryオブジェクト
 * 			  screenId            : 呼出先画面ID
 *            options.width      : 子画面の幅
 *            options.height     : 子画面の高さ
 *            options.action      : アクション
 *            options.op          : オペレーション識別子
 *            options.params      : 追加パラメータ(Map)
 *            options.isBlockPage : true:ページをブロックする false:ページをブロックしない
 * 戻り値   : なし
 ******************************************************************************/
function openChildWindowForPost(form, screenId, options) {
	
	var logMark = $("#keep-logmark-hidden").val();
	
    options = $.extend({
        width: $.globalProperties.screen.openChildWindow.width,
        height: $.globalProperties.screen.openChildWindow.height,
        isBlockPage: false,
    }, options);
    options = $.extend(true, options, {
        params: {childFlg: true},
    });


	closeAllChildWindow();
	childWindow = openChildWindow("about:blank", screenId + "_" + logMark, {width: options.width, height: options.height, status: "yes", resizable: "yes", scrollbars: "yes"} );		
	var iniTime = (new Date).getTime();
	var nowTime = (new Date).getTime();
	while ((childWindow.document.readyState != "complete") && (nowTime < (iniTime + sleepTime))) {
		nowTime = (new Date).getTime();
	}
	
	// 子画面を閉じた場合にはブロックを解除する
	childWindow.onbeforeunload = function () {
	    if(((event.clientX > document.body.clientWidth) && (event.clientY<0)) || event.altKey ) {
	    	unblockPage();
	    }
	}
	
	// 子画面をターゲットにフォームをサブミットする
	$(form).attr("target", screenId + "_" + logMark);
	
	// 送信
	doSubmit(form ,options);
	
	// 子画面表示時にもdoSubmitが呼ばれてブラウザバックの制御が入ってしまうため、doSubmit後に制御を解除する
	$("#isAlreadySent").val("false");
	
	// 親画面をブロックする
	blockPageForChild();
}


/******************************************************************************
 * 関数名   : closeAllChildWindow
 * 機能概要 : モードレスで開いている子画面をすべて閉じます。
 * 引数     : なし
 * 戻り値   : なし
 ******************************************************************************/
function closeAllChildWindow() {
    for (var i = 0; i < _winArray.length; i++) {
        if (!_winArray[i].closed) {
            _winArray[i].close();
        }
    }
}

/******************************************************************************
 * 関数名   : opnerClosedChildClose
 * 機能概要 : 親画面が閉じられるまたは画面遷移された場合、この子画面を閉じます。
 * 引数     : なし
 * 戻り値   : なし
 ******************************************************************************/
function opnerClosedChildClose() {
	try {
		if(window.opener.closed || window.name.split("_")[1] != window.opener.document.getElementById("keep-logmark-hidden").value) {
			$.errorMsgBox("親画面が閉じられたまたは画面遷移されたため子画面を閉じます。", function () {
				window.close();
			});
			return false;
		}
	} catch (e) {
		$.errorMsgBox("親画面が閉じられたまたは画面遷移されたため子画面を閉じます。", function () {
			window.close();
		});
		return false;
	}
	
	// TODO add here
	return true;
}

/******************************************************************************
 * 関数名   : forwardCommonGyomError
 * 機能概要 : 共通業務エラー画面へサブミットします。
 * 引数     : errorMessage        : 共通業務エラー画面で表示するエラーメッセージ
 * 戻り値   : なし
 ******************************************************************************/
function forwardCommonGyoumuError(errorMessage) {
	doSubmit($("#jsonBaseAction-form"), {op: "forwardCommonGyoumuError", params: {errorMessage: errorMessage}});
}

/******************************************************************************
 * 関数名   : forwardSystemError
 * 機能概要 : システムエラー画面へサブミットします。
 *            サービスセッションにキー：S_SystemException_Keyに例外が格納されている場合、その例外メッセージが表示される
 * 引数     : errorMessage        : システムエラー画面で表示するエラーメッセージ
 * 戻り値   : なし
 ******************************************************************************/
function forwardSystemError(errorMessage) {
	doSubmit($("#jsonBaseAction-form"), {op: "forwardSystemError", params: {errorMessage: errorMessage}});
}

/******************************************************************************
 * 関数名   : _viewDialog
 * 機能概要 : open dialog project selected
 * 引数     : viewDialog.url   : url
 *            viewDialog.op        : 照会子画面オペレーションID
 *            viewDialog.screenId    : 照会子画面画面ID
 *            viewDialog.formData
 * 
 * 戻り値   : なし
 ******************************************************************************/
function _viewDialog(viewDialog){
    // Only one
    if ($("#" + viewDialog.screenId + "_dialog").length < 1) {
        $("#hide").append("<div id='" + viewDialog.screenId + "_dialog'></div>");
    }

    // Load sub screen into div
    var subScreenDivObj = $("#" + viewDialog.screenId + "_dialog" );
    var data = viewDialog.formData;
    data.op = viewDialog.op;

    loadPage(subScreenDivObj, viewDialog.url, data, function(){
        // Open dialog
        eval("$." + viewDialog.screenId + "_openDialog();");
        // rebind message to  GZPZZ0201M08_errorMessage
    }
    //, "formID for validate"
    );
};

/******************************************************************************
 * 関数名   : _clearRedirect
 * 機能概要 : 
 * 引数     : clearRedirect.url   : url
 *            clearRedirect.op    : クリア後遷移先オペレーションID
 *            clearRedirect.serviceId
 *            clearRedirect.formId
 * 
 * 戻り値   : なし
 ******************************************************************************/
function _clearRedirect(clearRedirect) {
    if(isNotEmpty(clearRedirect.serviceId)){
        doSubmit(clearRedirect.formId);
    } else {
        _ajax(clearRedirect.url, {op:clearRedirect.op}, function(){
            _displaySelectedButton(false);
        });
    }
};

/******************************************************************************
 * 関数名   : _displaySelectedButton
 * 機能概要 : 遷移先画面での選択キー情報表示有無フラグを設定する.
 * 引数     : dispFlag 選択キー情報の表示有無フラグ　表示する：true/表示しない:false
 * 
 * 戻り値   : なし
 ******************************************************************************/
function _displaySelectedButton(dispFlag) {
    $("#GZPZZ0201M03-selectedProjectPopover").show();
    $("#GZPZZ0201M03-selectedProjectPopover").popover({
        content:$("#GZPZZ0201M03_popoverContent").html()
        , selector:$("#GZPZZ0201M03-selectedProjectPopover")
        , title:$("#GZPZZ0201M03_popoverTitle").html()
        , placement:"bottom"
        , html:true});
    if (dispFlag){
        $("#GZPZZ0201M03-selectedProjectPopover").html("選択情報有");
        $("#GZPZZ0201M03-selectedProjectPopover").addClass("btn-danger");
        $("#GZPZZ0201M03-selectedProjectPopover").removeClass("active");
        $("#GZPZZ0201M03-selectedProjectPopover").popover('show');
    } else {
        $("#GZPZZ0201M03-selectedProjectPopover").html("選択情報無");
        $("#GZPZZ0201M03-selectedProjectPopover").removeClass("btn-danger");
        $("#GZPZZ0201M03-selectedProjectPopover").addClass("active");
        $("#GZPZZ0201M03-selectedProjectPopover").popover('destroy');
    }
};

/******************************************************************************
 * 関数名   : _downloadErrorReportCSV
 * 機能概要 : 
 * 引数     :
 * 
 * 戻り値   : なし
 ******************************************************************************/
function _downloadErrorReportCSV() {

    _ajax($("#GZPZZ0201M01_actionDownloadCSV").val(), {op:"downloadErrorReportCSV"}, function(data){
        window.location.href = data.url;
    });
};