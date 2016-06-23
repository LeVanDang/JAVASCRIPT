/*-----------------------------------------------------------------------------
  common-ajax.js
 -----------------------------------------------------------------------------*/

/******************************************************************************
 * 関数名   : ajax
 * 機能概要 : ajaxによる非同期通信を行います。
 * 引数     : url             : URL
 *            data            : リクエストパラメータ(Mapまたはクエリー文字列)
 *            callback : 正常終了時のコールバック関数
 *            formId          : エラーメッセージを表示するフォームのID
 *            errorCallback   : カスタムエラー時のコールバック関数
 *            isBlockPage     : true: 通信中はページをブロックする false: しない
 *            async           : true: 非同期 false: 同期
 * 戻り値   : なし
 ******************************************************************************/
function ajax(url, data, callback, formId, errorCallback, isBlockPage, async) {

    // 非同期通信の実行
    _ajax(url, data, callback, formId, errorCallback, isBlockPage, async);
}

/******************************************************************************
 * 関数名   : ajaxForForm
 * 機能概要 : ajaxによる非同期通信を行います。
 * 引数     : form           : フォームのIDまたはフォームのjQueryオブジェクト
 *            callback       : 正常終了時のコールバック関数
 *            isBlockPage    : true: 通信中はページをブロックする false: しない
 *            options.action         : アクション
 *            options.op             : オペレーション識別子
 *            options.params         : 追加パラメータ(Map)
 *            options.formId         : エラーメッセージを表示するフォームのID
 *            options.errorCallback  : カスタムエラー時のコールバック関数
 *            options.async          : true: 非同期 false: 同期
 * 戻り値   : なし
 ******************************************************************************/
function ajaxForForm(form, callback, isBlockPage, options) {

    // オプションのデフォルト値を設定する
    options = $.extend({
        action: "",
        op: "",
        params: null,
        formId:"",
        errorCallback: function(errorMessage) {$.globalProperties.msgBox.errorMsgBox(errorMessage);}
    }, options);

    // フォームの設定
    var formObj = _setForm(form, options.action, options.op, options.params);

    // 非同期通信の実行
    _ajax(formObj.attr("action"), formObj.serialize(), callback, options.formId, options.errorCallback, isBlockPage, options.async);
}

/******************************************************************************
 * 関数名   : _ajax
 * 機能概要 : ajaxによる非同期通信を行います。
 * 引数     : url             : URL
 *            data            : リクエストパラメータ(Mapまたはクエリー文字列)
 *            callback : 正常終了時のコールバック関数
 *            formId          : エラーメッセージを表示するフォームのID
 *            errorCallback   : カスタムエラー時のコールバック関数
 *            isBlockPage     : true: 通信中はページをブロックする false: しない
 *            async           : true: 非同期 false: 同期
 * 戻り値   : なし
 ******************************************************************************/
function _ajax(url, data, callback, formId, errorCallback, isBlockPage, async) {

    // isBlockPageが指定されなかった場合の対処
    if (isBlockPage != true && isBlockPage != false) {
        isBlockPage = true;
    }

    // asyncが指定されなかった場合の対処
    if (async != true && async != false) {
        async = true;
    } 

    // 別ウィンドウ呼出し判定結果
    if ($("#keep-isChildWindow-hidden").val() == "true") {
        // 親画面が居なければクローズ
        if (!opnerClosedChildClose()) {
            // 処理は中断
            return;
        }
        // 子画面用パラメータを付加
        if (isNotEmpty(data) && typeof data != "string") {
            data = $.extend({
                childFlg: true
            }, data);
        } else {
            data = addQueryString("childFlg", true, data);
        }
    }
    
    // ページのブロック
    if (isBlockPage) {
        blockPage();
    }

    // 非同期通信の実行
    $.ajax({
        type: "POST",
        url: url,
        data: data,
        async: async,
        dataType: "json",
        timeout: $.globalProperties.ajax.ajaxTimeout,
        success: function(json, textStatus, XMLHttpRequest) {
            if (json.status == "00") {
                if (isNotEmpty(callback)) {
                    callback(json);
                }
            } else if ((json.status == "01") || (json.status == "02")) {

                // TODO check empty
                var formObj = $("#" + formId);

                _valid(formObj, json.errorMessageJson, json.status);
            } else if (json.status == "03") {
                if (isNotEmpty(errorCallback)) {
                    errorCallback(json.errorMessage);
                }
            }else {
                forwardCommonGyoumuError(json.errorMessage);
            }
        },
        error: function(XMLHttpRequest, textStatus, errorThrown) {
            if (textStatus == "timeout") {
                // タイムアウトの場合
                $.globalProperties.msgBox.errorMsgBox($.globalProperties.ajax.ajaxTimeoutMessage);
            } else {
                var errstr = "XMLHttpRequest : " + XMLHttpRequest.status + ",textStatus : " + textStatus + ",errorThrown : " + errorThrown.message;
                forwardSystemError(errstr);
            }
        },
        complete: function(XMLHttpRequest, textStatus) {
            // ページのブロック解除
            if (isBlockPage) {
                unblockPage();
            }
        }
    });
}

/******************************************************************************
 * 関数名   : loadPage
 * 機能概要 : ページを読み込みます。
 * 引数     : obj           : 読み込んだページを追加するjQueryオブジェクト
 *            url           : URL
 *            data          : リクエストパラメータ(Mapまたはクエリー文字列)
 *            callback      : 正常終了時のコールバック関数
 *            formId        : エラーメッセージを表示するフォームのID
 *            errorCallback : カスタムエラー時のコールバック関数
 *            isBlockPage   : true: 通信中はページをブロックする false: しない
 *            async         : true: 非同期 false: 同期
 * 戻り値   : なし
 ******************************************************************************/
function loadPage(obj, url, data, callback, formId, errorCallback, isBlockPage, async) {

    // ページの読み込み
    _loadPage(obj, url, data, callback, formId, errorCallback, isBlockPage, async);
};

/******************************************************************************
 * 関数名   : loadPageForForm
 * 機能概要 : ページを読み込みます。
 * 引数     : obj            : 読み込んだページを追加するjQueryオブジェクト
 *            form           : フォームのIDまたはフォームのjQueryオブジェクト
 *            callback       : 正常終了時のコールバック関数
 *            isBlockPage    : true: 通信中はページをブロックする false: しない
 *            options.action         : アクション
 *            options.op             : オペレーション識別子
 *            options.params         : 追加パラメータ(Map)
 *            options.formId         : エラーメッセージを表示するフォームのID
 *            options.errorCallback  : カスタムエラー時のコールバック関数
 *            options.async          : true: 非同期 false: 同期
 * 戻り値   : なし
 ******************************************************************************/
function loadPageForForm(obj, form, callback, isBlockPage, options) {

    // オプションのデフォルト値を設定する
    options = $.extend({
        action: "",
        op: "",
        params: null,
        errorCallback: function(errorMessage) {$.globalProperties.msgBox.errorMsgBox(errorMessage);}
    }, options);

    // フォームの設定
    var formObj = _setForm(form, options.action, options.op, options.params);

    // ページの読み込み
    _loadPage(obj, formObj.attr("action"), formObj.serialize(), callback, options.formId, options.errorCallback, isBlockPage, options.async);
};

/******************************************************************************
 * 関数名   : _loadPage
 * 機能概要 : ページを読み込みます。
 * 引数     : obj           : 読み込んだページを追加するjQueryオブジェクト
 *            url           : URL
 *            data          : リクエストパラメータ(Mapまたはクエリー文字列)
 *            callback      : 正常終了時のコールバック関数
 *            form          : エラーメッセージを表示するフォームのID
 *            errorCallback : カスタムエラー時のコールバック関数
 *            isBlockPage   : true: 通信中はページをブロックする false: しない
 *            async         : true: 非同期 false: 同期
 * 戻り値   : なし
 ******************************************************************************/
function _loadPage(obj, url, data, callback, formId, errorCallback, isBlockPage, async) {

    // isBlockPageが指定されなかった場合の対処
    if (isBlockPage != true && isBlockPage != false) {
        isBlockPage = true;
    }

    // asyncが指定されなかった場合の対処
    if (async != true && async != false) {
        async = true;
    }

    // 別ウィンドウ呼出し判定結果
    if ($("#keep-isChildWindow-hidden").val() == "true") {
        // 親画面が居なければクローズ
        if (!opnerClosedChildClose()) {
            // 処理は中断
            return;
        }
        // 子画面用パラメータを付加
        if (isNotEmpty(data) && typeof data != "string") {
            data = $.extend({
                childFlg: true
            }, data);
        } else {
            data = addQueryString("childFlg", true, data);
        }
    }

    // ページのブロック
    if (isBlockPage) {
        blockPage();
    }

    // 非同期通信の実行
    $.ajax({
        type: "POST",
        url: url,
        data: data,
        async: async,
        dataType: "html",
        timeout: $.globalProperties.ajax.ajaxTimeout,
        success: function(html, textStatus, XMLHttpRequest) {
            var json = parseJSON(html);
            if (isNotEmpty(json)) {
                // レスポンスがJSON形式だった場合はエラーメッセージを表示する
                if ((json.status == "01") || (json.status == "02")) {
                    // obj.html(""); エラー時は削除する必要がないためコメントアウト
                    var formObj = $("#" + formId);

                    _valid(formObj, json.errorMessageJson, json.status);
                } else if (json.status == "03") {
                    if (isNotEmpty(errorCallback)) {
                        errorCallback(json.errorMessage);
                    }
                } else {
                    forwardCommonGyoumuError(json.errorMessage);
                }
            } else {
                // レスポンスがJSON形式でなかった場
                obj.html(html);
                $("#" + formId).resetError();

                // LongNP Add Start
                if (obj.find(".pagingCommonPart").length > 0) {
                    var pagingParentDiv = obj.find(".pagingCommonPart:first").parent();

                    obj.stripeTable();
                    obj.find("div.table-fixed-list").fixedTable();
                    // ハイライト
                    obj.find("table.table-highlights").tableHighlight();
                    // initTableList
                    obj.find("table.table-list").initTableList();

                    // ページングの設定
                    obj.find(".pagingCommonPart").paging({isReload:true, obj:pagingParentDiv, formId:formId});
                    // ソートリンクの設定
                    obj.find("a.sort-link").sortLink({isReload:true, obj:pagingParentDiv, formId:formId});

                    var errorMessage = "";
                    if (obj.find("input.GZPZZ0201M08_errorMessage").length > 0) {
                        errorMessage = obj.find("input.GZPZZ0201M08_errorMessage").val();
                    }
                    if (errorMessage != "") {
                        // ページの一部をロードする場合をチェックする
                        var errorMessageDiv = obj.closest("div.modal").find("div.dialog-error-msg");

                        // ページ全体をロードする場合をチェックする
                        if (errorMessageDiv.length < 1) {
                            errorMessageDiv = obj.find("div.dialog-error-msg");

                            // ページ全体をロードする場合
                            if (errorMessageDiv.length > 0) {
                                obj.find("div.modal").addClass("isFullLoadPage");
                            }
                        }

                        if (errorMessageDiv.length < 1) {
                            $("#message").html("<div class='error dialog-error-msg'>" + errorMessage + "</div>");
                        } else {
                            errorMessageDiv.html(errorMessage);
                            errorMessageDiv.closest("div.modal").dialog();
                        }
                    }
                }
                // LongNP Add End

                //$("div.error-msg-area").html("");
                if (isNotEmpty(callback)) {
                    callback();
                }
            }
        },
        error: function(XMLHttpRequest, textStatus, errorThrown) {
            if (textStatus == "timeout") {
                // タイムアウトの場合
                $.globalProperties.msgBox.errorMsgBox($.globalProperties.ajax.ajaxTimeoutMessage);
            } else {
                var errstr = "XMLHttpRequest : " + XMLHttpRequest.status + ",textStatus : " + textStatus + ",errorThrown : " + errorThrown.message;
                forwardSystemError(errstr);
            }
        },
        complete: function(XMLHttpRequest, textStatus) {
            // ページのブロック解除
            if (isBlockPage) {
                unblockPage();
            }
        }
    });
}

/******************************************************************************
 * 関数名   : parseJSON
 * 機能概要 : JSON形式の文字列をオブジェクトに変換します。
 * 引数     : json : JSON形式の文字列
 * 戻り値   : オブジェクト。変換できなかった場合はnull。
 ******************************************************************************/
function parseJSON(json) {

    var obj = null;

    try {
        json = json.replace(/\r/g, "");
        json = json.replace(/\n/g, "");
        // Trac #3638 : jquery.upload()無いでのjquery.html()でのタグの属性取得時に
        //              ' が " で取得されてしまい、jquery.parseJSON() でエラーになること
        //              への対応。 関連 BaseAction.java
        // start
        json = json.replace(/"\\\\/g, "\\\"");
        json = json.replace(/\\\\"/g, "\\\"");
        // Trac #3638 end
        // Trac #4052 :【IE8対応】 #3638 での対応ではIE8では動作しないため異なる設定とし
        //             ている。 BaseAction.java にて、User-Agentに "MSIE"が含まれる
        //             場合のマークとして上記にしている。
        // start
        json = json.replace(/\\\\&gt;/g, ">");
        json = json.replace(/\\\\&lt;/g, "<");
        // end
        
        // タスクNo.509 エラー画面のメッセージ先頭にある「・」の位置がIE11の場合メッセージから遠い 対応 Start
        // Firefox用
        json = json.replace(/"\\&quot;/g, "\\\"");
        json = json.replace(/\\&quot;"/g, "\\\"");
        
        // IE用
        json = json.replace(/'/g, "");
        json = json.replace(/\"error-message-inline\"/g, "\\\"error-message-inline\\\"");
        // End

        obj = $.parseJSON(json);
    } catch(e) {
    }

    return obj;
}

/******************************************************************************
 * 関数名   : addQueryString
 * 機能概要 : クエリー文字列にパラメータを追加します。
 * 引数     : name  : パラメータ名
 *            value : 値
 *            query : クエリー文字列
 * 戻り値   : クエリー文字列
 ******************************************************************************/
function addQueryString(name, value, query) {
    if (value != void 0) {
        if (query != void 0 && query.length > 0) {
            query += "&" + encodeURIComponent(name) + "=" + encodeURIComponent(value);
        } else {
            query = encodeURIComponent(name) + "=" + encodeURIComponent(value);
        }
    }
    return query;
};

/******************************************************************************
 * 関数名   : uploadFile
 * 機能概要 : 非同期でファイルアップロード処理を行います。
 * 引数     : obj      : アップロードするファイルのjQueryオブジェクト
 *            url      : URL
 *            data     : リクエストパラメータ(Map)
 *            callback : 読み込み完了時のコールバック関数
 *            isBlock  : true: 通信中はページをブロックする false: しない
 * 戻値     : なし
 ******************************************************************************/
function uploadFile(obj, url, data, callback, isBlock) {

    // isBlockPageが指定されなかった場合の対処
    if (isBlock != true && isBlock != false) {
        isBlock = true;
    }

    // 別ウィンドウ呼出し判定結果
    if ($("#keep-isChildWindow-hidden").val() == "true") {
        // 親画面が居なければクローズ
        if (!opnerClosedChildClose()) {
            // 処理は中断
            return;
        }
        // 子画面用パラメータを付加
        if (isNotEmpty(data) && typeof data != "string") {
            data = $.extend({
                childFlg: true
            }, data);
        } else {
            data = addQueryString("childFlg", true, data);
        }
    }

    // ページのブロック
    if (isBlock) {
        blockPage();
    }

    // ファイルアップロードの実行
    obj.upload(url, data, function(responseText) {

        var json = parseJSON(responseText);
        if (isNotEmpty(json)) {
            if (json.status == "00") {
                obj.removeClass("isUploadFileValid");
                callback(json);
            } else if ((json.status == "01") || (json.status == "02")) {
                var formObj = "<form />";
                formObj = obj.wrapAll(formObj).parent('form');

                _valid(formObj, json.errorMessageJson, json.status);

                formObj.after(obj).remove();
                obj.addClass("isUploadFileValid");
            } else if (json.status == "03") {
                if (isNotEmpty(errorCallback)) {
                    errorCallback(json.errorMessage);
                }
            }else {
                forwardCommonGyoumuError(json.errorMessage);
            }
        } else {
            var html = $('<div/>').html(responseText).contents();
            var errorMessage = html.find("#error-box > div:first").text();
            forwardSystemError(errorMessage);
        }

        // ページのブロック解除
        if (isBlock) {
            unblockPage();
        }

    }, "text");
}

function _valid(formObj, errorMessageJson, status) {

    formObj.resetError();

    var unhandled = {};
    var errorItems = 0;
    var errorMessage = "";

    $.each(errorMessageJson, function(key, value) {
        if (value.indexOf("<ul") == 0 || value.indexOf("<UL") == 0) {
            // Case occur LogicException
            errorMessage = value;
            return;
        }

        var itemKey = key.split("_")[0];

        if ("org.apache.struts.action.GLOBAL_MESSAGE" == itemKey) {
            unhandled[key] = value;
        } else {
            var input = formObj.find(":input[name='" + itemKey + "']:not(:hidden)");

            if (!input.length) {
                unhandled[key] = value;
            } else {
                var span = formObj.find("span.invalid-icon." + itemKey.replace("[","\\[").replace("]","\\]"));

                if (!span.length) {
                    unhandled[key] = value;
                } else {
                    if (span.is(":has(i.invalid-mark)")) {
                        value = span.find("i.invalid-mark").attr("data-original-title") + "<br/>" + value;
                    } else {
                        errorItems += 1;
                    }

                    span.html("<i class='invalid-mark ic-exclamation tooltip-top' title='" + value + "'></i>");
                    span.find(".tooltip-top").tooltip();

                    // フォーカス時にフォーマットを変換する
                    input.focus(function() {
                        span.find(".tooltip-top").tooltip("show");
                    });
                    // フォーカスが外れたときにフォーマットを変換する
                    input.blur(function() {
                        span.find(".tooltip-top").tooltip("hide");
                    });
                }

                // スタイル変更
                input.addClass("error");
            }
        }
    });

    var errorMessageString = "";
    if (status == "02") {
        errorMessageString = "<ul class=\"bottom\">" + $.map(errorMessageJson, function(value, key) {
            return "<li>" + value + "</li>";
        }).join("") + "</ul>";
    }

    // add message special
    if (errorItems > 0) {
        unhandled["ItemCheck_ZPZZOL00"] = "入力項目にエラーが存在します。入力項目左の<i class='ic-exclamation'></i>でエラー内容を確認してください。";
    }

    if (!$.isEmptyObject(unhandled)) {
        errorMessage = "<ul class=\"bottom error-message-inline\">" + $.map(unhandled, function(value, key) {
            return "<li>" + value + "</li>";
        }).join("") + "</ul>";
    }

    var errorDivObj;
    var isDialog = false;
    if ((formObj.length == 0) || (formObj.closest("div.modal").length == 0)) {
        errorDivObj = $("#message");
        errorMessage = "<div class='error dialog-error-msg'>" + errorMessage + "</div>";
    } else {
        errorDivObj = formObj.closest("div.modal").find("div.error-msg-area");
        isDialog = true;
    }

    errorDivObj.html(errorMessage)
    if ((isDialog) && (errorDivObj.closest("div.modal").css('display') != 'none')) {
        errorDivObj.closest("div.modal").dialog();
    }

    if (status == "02") {
        $.globalProperties.msgBox.errorMsgBox(errorMessageString);
    }
}