/*-----------------------------------------------------------------------------
  common.js
 -----------------------------------------------------------------------------*/

/*-----------------------------------------------------------------------------
  共通
 -----------------------------------------------------------------------------*/

/******************************************************************************
 * 関数名   : isEmpty
 * 機能概要 : 値が空かどうかをチェックします。
 * 引数     : value : 値
 * 戻り値   : true:undefined、null、"" false:その他
 ******************************************************************************/
function isEmpty(value) {
    if (value != void 0 && value != null && value != "") {
        return false;
    }
    return true;
};

/******************************************************************************
 * 関数名   : isNotEmpty
 * 機能概要 : 値が空でないかどうかをチェックします。
 * 引数     : value : 値
 * 戻り値   : true:なんらかの値が設定されている場合 false:その他
 ******************************************************************************/
function isNotEmpty(value) {
    return !(isEmpty(value));
};


/*-----------------------------------------------------------------------------
  文字列操作
 -----------------------------------------------------------------------------*/

/******************************************************************************
 * 関数名   : padLeft
 * 機能概要 : 文字列の先頭に指定された文字を指定された文字数になるまで付加します。
 * 引数     : str     : 文字列
 *            length  : 文字列長
 *            padChar : 付加する文字(1文字)
 * 戻り値   : 付加後の文字列
 ******************************************************************************/
function padLeft(str, length, padChar) {
    return _pad(str, length, padChar, true);
}

/******************************************************************************
 * 関数名   : padRight
 * 機能概要 : 文字列の末尾に指定された文字を指定された文字数になるまで付加します。
 * 引数     : str     : 文字列
 *            length  : 文字列長
 *            padChar : 付加する文字(1文字)
 * 戻り値   : 付加後の文字列
 ******************************************************************************/
function padRight(str, length, padChar) {
    return _pad(str, length, padChar, false);
}

/******************************************************************************
 * 関数名   : _pad
 * 機能概要 : 文字列の先頭または末尾に指定された文字を指定された文字数になるまで
 *            付加します。
 * 引数     : str     : 文字列
 *            length  : 文字列長
 *            padChar : 付加する文字(1文字)
 *            left    : true:先頭 false:末尾
 * 戻り値   : 付加後の文字列
 ******************************************************************************/
function _pad(str, length, padChar, left) {

    var result = str + "";

    // 文字列が空の場合は空文字を設定
    if (isEmpty(result)) {
        result = "";
    }

    // 付加する文字が指定されていないまたは2文字以上の場合は
    // 文字列をそのまま返す
    if (isEmpty(padChar) || padChar.length > 1) {
        return result;
    }

    // 文字列が文字列長以上の場合はそのまま返す
    if (result.length >= length) {
        return result;
    }

    // 付加する文字列を生成
    var pad = ""
    for (var i = 0; i < length - result.length; i++) {
        pad += padChar;
    }

    // 文字列に付加文字列を付加
    if (left) {
        result = pad + result;
    } else {
        result = result + pad;
    }

    return result;
}


/*-----------------------------------------------------------------------------
  日付
 -----------------------------------------------------------------------------*/

/******************************************************************************
 * 関数名   : formatDate
 * 機能概要 : 日付オブジェクトを指定されたフォーマットで文字列に変換します。
 *            使用できる書式は以下のとおりです。
 *              yyyy : 年
 *              MM   : 月
 *              dd   : 日
 *              HH   : 時
 *              mm   : 分
 *              ss   : 秒
 *              SSS  : ミリ秒
 * 引数     : date   : 日付オブジェクト
 *            format : フォーマット
 * 戻り値   : 日付(文字列)
 ******************************************************************************/
function formatDate(date, format) {

    if (isEmpty(date)) {
        return null;
    }

    var result = format;

    // 年
    if (result.indexOf("yyyy") > -1) {
        result = result.replace(/yyyy/, date.getFullYear());
    }
    // 月
    if (result.indexOf("MM") > -1) {
        result = result.replace(/MM/, padLeft(date.getMonth() + 1, 2, "0"));
    }
    // 日
    if (result.indexOf("dd") > -1) {
        result = result.replace(/dd/, padLeft(date.getDate(), 2, "0"));
    }
    // 時
    if (result.indexOf("HH") > -1) {
        result = result.replace(/HH/, padLeft(date.getHours(), 2, "0"));
    }
    // 分
    if (result.indexOf("mm") > -1) {
        result = result.replace(/mm/, padLeft(date.getMinutes(), 2, "0"));
    }
    // 秒
    if (result.indexOf("ss") > -1) {
        result = result.replace(/ss/, padLeft(date.getSeconds(), 2, "0"));
    }
    // ミリ秒
    if (result.indexOf("SSS") > -1) {
        result = result.replace(/SSS/, padRight(date.getMilliseconds(), 3, "0"));
    }

    return result;
}

/******************************************************************************
 * 関数名   : parseDate
 * 機能概要 : 指定されたフォーマットで記述された日付を日付オブジェクトに変換します。
 *            使用できる書式はformatDate関数を参照してください。
 * 引数     : date   : 日付(文字列)
 *            format : フォーマット
 * 戻り値   : 日付オブジェクト(存在しない日付の場合はnull)
 ******************************************************************************/
function parseDate(date, format) {

    var year = 1900;
    var month = 1;
    var day = 1;
    var hour = 0;
    var minute = 0;
    var second = 0;
    var milliSecond = 0;
    var start;
    var set = false;

    if (isEmpty(date)) {
        return null;
    }

    // 年
    if ((start = format.indexOf("yyyy")) > -1) {
        year = date.substring(start, start + 4) - 0;
        set = true;
    }
    // 月
    if ((start = format.indexOf("MM")) > -1) {
        month = date.substring(start, start + 2) - 1;
        set = true;
    }
    // 日
    if ((start = format.indexOf("dd")) > -1) {
        day = date.substring(start, start + 2) - 0;
        set = true;
    }
    // 時
    if ((start = format.indexOf("HH")) > -1) {
        hour = date.substring(start, start + 2) - 0;
        set = true;
    }
    // 分
    if ((start = format.indexOf("mm")) > -1) {
        minute = date.substring(start, start + 2) - 0;
        set = true;
    }
    // 秒
    if ((start = format.indexOf("ss")) > -1) {
        second = date.substring(start, start + 2) - 0;
        set = true;
    }
    // ミリ秒
    if ((start = format.indexOf("SSS")) > -1) {
        milliSecond = date.substring(start, start + 3) - 0;
        set = true;
    }

    // 不正な書式の場合はnullを返す
    if (!set) {
        return null;
    }

    var result = new Date(year, month, day, hour, minute, second, milliSecond);

    // 日付の存在チェック
    if (year != result.getFullYear()) {
        return null;
    }
    if (month != result.getMonth()) {
        return null;
    }
    if (day != result.getDate()) {
        return null;
    }
    if (hour != result.getHours()) {
        return null;
    }
    if (minute != result.getMinutes()) {
        return null;
    }
    if (second != result.getSeconds()) {
        return null;
    }
    if (milliSecond != result.getMilliseconds()) {
        return null;
    }

    return result;
}

/******************************************************************************
 * 関数名   : convertDateFormat
 * 機能概要 : 日付のフォーマットを変換します。
 *            使用できる書式はformatDate関数を参照してください。
 * 引数     : date         : 日付(文字列)
 *            beforeFormat : 変換前フォーマット
 *            afterFormat  : 変換後フォーマット
 * 戻り値   : 日付(文字列)
 ******************************************************************************/
function convertDateFormat(date, beforeFormat, afterFormat) {

    var dateObj = parseDate(date, beforeFormat);
    if (dateObj == null && parseDate(date, afterFormat) != null) {
    	return date
    }

    return formatDate(dateObj, afterFormat);
}

/******************************************************************************
 * 関数名   : getSystemDate
 * 機能概要 : システム日付を指定したフォーマットで取得します。
 * 引数     : format : 日付フォーマット(省略時はyyyyMMdd)
 * 戻値     : システム日付
 ******************************************************************************/
function getSystemDate(format) {

    if (isEmpty(format)) {
        format = "yyyyMMdd";
    }
    var now = new Date();

    return formatDate(now, format);
};


/*-----------------------------------------------------------------------------
  数値
 -----------------------------------------------------------------------------*/

/******************************************************************************
 * 関数名   : formatNumber
 * 機能概要 : 数値を指定されたフォーマットで文字列に変換します。
 *            使用できる書式は以下のとおりです。
 *              # : 数字(値が0の場合は表示しない)
 *              0 : 数字(値が0の場合は0を表示する)
 *              . : 小数点
 *              , : カンマ
 * 引数     : number : 数値
 *            format : フォーマット
 * 戻り値   : 数値(文字列)
 ******************************************************************************/
function formatNumber(number, format) {

    var real, decimal;
    var realFormat, decimalFormat;

    // 数値を整数部と小数部に分解
    var str = new String(number);
    if (str.indexOf(".") > -1) {
        // 小数点が2つ以上ある場合はそのまま返す
        if (str.split(".").length != 2) {
            return number;
        }
        real = str.split(".")[0];
        decimal = str.split(".")[1];
    } else {
        real = str;
        decimal = "";
    }
    // マイナス符号を取得
    var minus = "";
    if (real.substring(0, 1) == "-") {
        minus = "-";
        real = real.substring(1);
    }
    // 整数部と小数部に数値以外が含まれている場合はそのまま返す
    if (!real.match(/^[0-9]*$/) || !decimal.match(/^[0-9]*$/)) {
        return number;
    }

    // フォーマットを整数部と小数部に分解
    if (format.indexOf(".") > -1) {
        realFormat = format.split(".")[0];
        decimalFormat = format.split(".")[1];
    } else {
        realFormat = format;
        decimalFormat = "";
    }

    // 整数部の整形
    var result = "";
    for (var i = realFormat.length - 1; i >= 0; i--) {
        var fmt = realFormat.substring(i, i + 1);

        if (fmt != "#" && fmt != "0") {
            // #,0以外の場合はそのまま出力
            result = fmt + result;
        } else {
            // 次の桁の数字を取得
            var digit = "";
            if (real.length > 0) {
                digit = real.substring(real.length - 1);
                real = real.substring(0, real.length - 1);
            }
            if (isNotEmpty(digit)) {
                result = digit + result;
            } else {
                result = fmt + result;
            }
        }
    }
    while (isNotEmpty(result) && !result.substring(0, 1).match(/[0-9]{1}/)) {
        result = result.substring(1);
    }


    // 小数部の整形
    if (isNotEmpty(decimalFormat)) {
        result += ".";
        for (var i = 0; i < decimalFormat.length; i++) {
            var fmt = decimalFormat.substring(i, i + 1);

            if (fmt != "#" && fmt != "0" && decimal.length > 0) {
                // #,0以外の場合はそのまま出力
                result += fmt;
            } else {
                // 次の桁の数字を取得
                var digit = "";
                if (decimal.length > 0) {
                    digit = decimal.substring(0, 1);
                    decimal = decimal.substring(1);
                }
                if (isNotEmpty(digit)) {
                    result += digit;
                } else {
                    result += fmt;
                }
            }
        }
        while (isNotEmpty(result) && !result.substring(result.length - 1).match(/[0-9]{1}/)) {
            result = result.substring(0, result.length - 1);
        }
    }

    return minus + result;
}

/******************************************************************************
 * 関数名   : parseNumber
 * 機能概要 : 文字列の数値を数値に変換します。
 *            文字列が数値として不正なフォーマットの場合はnullを返します。
 * 引数     : number : 数値(文字列)
 * 戻り値   : 数値
 ******************************************************************************/
function parseNumber(number) {

    if (isEmpty(number)) {
        return null;
    }

    // 数値の書式でない場合はnullを返す
    if (!number.match(/^-?[0-9,]*\.?[0-9]*$/)) {
        return null;
    }

    // 数字、小数点、マイナス符号以外の文字を除去する
    var result = number.replace(/[^0-9\.-]/g, "");

    return new Number(result);
}
