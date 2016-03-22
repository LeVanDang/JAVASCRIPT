<%--
 *-------------------------------------------------------------------------------
 * All Rights Reserved. Copyright(C) Nihon Unisys, Ltd.
 * revision : $Revision$
 * vendor   : Nihon Unisys, Ltd.
 * author   : USOLV Nguyen Manh Chuan
 * since    : 2016/03/15 
 * tagId    : 4000：MA120202：034
 *-------------------------------------------------------------------------------
 * revision marking
 *-------------------------------------------------------------------------------
--%>
<%@page import="jp.co.unisys.ngit.MA.MAZZ.MAZZCD00.constants.MACodeConstants"%>
<%@page import="jp.co.unisys.ngit.ZP.ZPZZ.ZPZZCD00.constants.ZPCodeConstants"%>
<%@page import="jp.co.unisys.ngit.MA.MAZZ.MAZZ1204.vo.KobetsuGenkaServiceMeisaiInfoVO"%>
<%@page import="jp.co.unisys.maia.util.code.CodeManager"%>
<%@page import="jp.co.unisys.ngit.ZP.ZPZZ.ZPZZ4603.NGITDateUtil"%>
<%@page import="jp.co.unisys.maia.util.SystemPropertiesFactory"%>
<%@ page language="java" contentType="text/html; charset=UTF-8" pageEncoding="UTF-8"%>
<jsp:include
	page="/WEB-INF/jsp/ZP/ZPZZ/ZPZZ0201/GZPZZ0201M08_dialogTableList.jsp"
	flush="false" />
<script type="text/javascript">       $(function() {
          $("#GMA120202M01-ServiceEdit-form-id").initComponent();
      })

      function ajax_MA120211(url, data, callback, formId, errorCallback, isBlockPage, async) {

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
                    
                    if (isNotEmpty(errorCallback)) {
                        errorCallback(json);
                    }
                
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

      $("#GMA120202M01_service-table-div table.table-list tbody tr").mousedown(function(e) {

            if (e.button == 2) {

                var serviceKobetsuMitsumoriIraiStatus = $(this).closest("tr").find("[name=serviceKobetsuMitsumoriIraiStatusH]").val();
                
                // 見積依頼状況：登録中
         	    if(serviceKobetsuMitsumoriIraiStatus == '<%=MACodeConstants.CMAZZ046_01%>') {
         	    	$("#GMA120202M01_ContextMenu_Service a[href='#GMA120202M01_kobetsuGenkaMitsumoriKaitoReferContextmenu']").closest("li").addClass("disabled");
                } 
         	   
         	   
         	    // 見積依頼状況：""
         	    else if(serviceKobetsuMitsumoriIraiStatus == '') {
         	    	$("#GMA120202M01_ContextMenu_Service a[href='#GMA120202M01_kobetsuGenkaMitsumoriKaitoReferContextmenu']").closest("li").addClass("disabled");
                }
                
         	    else {
         	    	$("#GMA120202M01_ContextMenu_Service a[href='#GMA120202M01_kobetsuGenkaMitsumoriKaitoReferContextmenu']").closest("li").removeClass("disabled");
         	    }
            }
      });
      
      $("#GMA120202M01_service-table-div table.table-list tbody tr").contextMenu(
           {
               menu : 'GMA120202M01_ContextMenu_Service',
               tableDiv: 'GMA120202M01_service-table-div'
           },
           function(action, el, pos) {
               var mitsumoriNo = $('#GMA120202M01-Form-Id [name=mitsumoriNoH]').val();
               var mitsumoriId = $('#GMA120202M01-Form-Id [name=mitsumoriIdH]').val();
               var mitsumoriStatus = $('#GMA120202M01-Form-Id [name=mitsumoriStatusH]').val();

               var $row = $(el).closest("tr");
               var mitsumoriMeisaiId = $row.find('[name=serviceMitsumoriMeisaiIdH]').val();
               var mitsumoriMeisaiGyoNo = $row.find('[name=serviceMitsumoriMeisaiGyoNoH]').val();
               var serviceKobetsuMitsumoriIraiStatus = $row.find('[name=serviceKobetsuMitsumoriIraiStatusH]').val();
               var serviceKobetsuShohinCd = $row.find('[name=serviceKobetsuShohinCdH]').val();
               
               if (action == "GMA120202M01_refer-kobetsu-mitsumori-service") {
                   
                   var data = addQueryString('op', 'initKobetsuGenkaMitsumoriMeisaiService');
                   data = addQueryString('mitsumoriMeisaiIdH', mitsumoriMeisaiId, data);
                   data = addQueryString('mitsumoriMeisaiGyoNoH', mitsumoriMeisaiGyoNo, data);
                   data = addQueryString('kobetsuShohinCdH', serviceKobetsuShohinCd, data);

                   if($('#GMA120203M01-dialog').length == 0) {
                       $('#hide').append('<div id="GMA120203M01-dialog"></div>');
                   }
                   
                   loadPage($('#GMA120203M01-dialog'), '<html:rewrite action="/MA/MA12/MA120203" />', data, function() {
                       $.GMA120203M01_openDialog(function() {
                           var reloadForm = $('#GMA120202M01_reloadForm_service');
                           _loadPage($('#GMA120202M01-table-id'), reloadForm.attr('action'), reloadForm.serialize(), 
                                   function(){ $("#GMA120202M01-table-id").initComponent(); }, 'GMA120202M01-Form-Id');
                        });
                   }, 'GMA120202M01-Form-Id');
                   
               } else if (action == "GMA120202M01_edit-kobetsu-mitsumori-service") {
                   if(!$.GMA120202M01_check_01()) {
                       return false;
                   }
                   if(!$.GMA120202M01_check_02($row)) {
                       return false;
                   }
                   
                   var data = addQueryString('op', 'initKobetsuMitsumoriServiceEdit');
                   data = addQueryString('mitsumoriNoH', mitsumoriNo, data);
                   data = addQueryString('mitsumoriIdH', mitsumoriId, data);
                   data = addQueryString('mitsumoriMeisaiIdH', mitsumoriMeisaiId, data);
                   data = addQueryString('mitsumoriMeisaiGyoNoH', mitsumoriMeisaiGyoNo, data);

                   if($('#GMA120204M01-dialog').length == 0) {
                       $('#hide').append('<div id="GMA120204M01-dialog"></div>');
                   }
                   
                   loadPage($('#GMA120204M01-dialog'), '<html:rewrite action="/MA/MA12/MA120204" />', data, function() {
                       $.GMA120204M01_openDialog(function() {
                           var reloadForm = $('#GMA120202M01_reloadForm_service');
                           _loadPage($('#GMA120202M01-table-id'), reloadForm.attr('action'), reloadForm.serialize(), 
                                   function(){ $("#GMA120202M01-table-id").initComponent(); }, 'GMA120202M01-Form-Id');
                       });
                   }, 'GMA120202M01-Form-Id');
               } else if (action == "GMA120202M01_kobetsuGenkaMitsumoriIraiinfoCopyContextmenu") {
                   
                   var data = addQueryString('op', 'initKobetsuGenkaMitsumoriIraiInfoCopy');
                   data = addQueryString('mitsumoriNoH', mitsumoriNo, data);
                   data = addQueryString('mitsumoriIdH', mitsumoriId, data);
                   data = addQueryString('copyMotoKobetsuShohinCdH', serviceKobetsuShohinCd, data);
                   data = addQueryString('serviceKobetsuMitsumoriIraiStatusH', serviceKobetsuMitsumoriIraiStatus, data);
                   data = addQueryString('copyMotoMitsumoriMeisaiIdH', mitsumoriMeisaiId, data);
                   
                   if($('#GMA120218M01-dialog').length == 0) {
                       $('#hide').append('<div id="GMA120218M01-dialog"></div>');
                   }
                   
                   loadPage($('#GMA120218M01-dialog'), '<html:rewrite action="/MA/MA12/MA120218" />', data, function() {
                       $.GMA120218M01_openDialog(function() {
                           var reloadForm = $('#GMA120202M01_reloadForm_service');
                           _loadPage($('#GMA120202M01-table-id'), reloadForm.attr('action'), reloadForm.serialize(), 
                                   function(){ $("#GMA120202M01-table-id").initComponent(); }, 'GMA120202M01-Form-Id');
                       });
                   }, 'GMA120202M01-Form-Id');
               } else if (action == "GMA120202M01_kobetsuGenkaMitsumoriKaitoReferContextmenu") {
            	   
                   var data = addQueryString('op', 'initKobetsuGenkaMitsumoriKaito');
                   data = addQueryString('serviceKobetsuShohinCdH', serviceKobetsuShohinCd, data);

                   if($('#GMA120217M01-dialog').length == 0) {
                       $('#hide').append('<div id="GMA120217M01-dialog"></div>');
                   }
                   
                   loadPage($('#GMA120217M01-dialog'), '<html:rewrite action="/MA/MA12/MA120217" />', data, function() {
                       $.GMA120217M01_openDialog(function() {
                           var reloadForm = $('#GMA120202M01_reloadForm_service');
                           _loadPage($('#GMA120202M01-table-id'), reloadForm.attr('action'), reloadForm.serialize(), 
                                   function(){ $("#GMA120202M01-table-id").initComponent(); }, 'GMA120202M01-Form-Id');
                       });
                   }, 'GMA120202M01-Form-Id');
               }
           }
       );

       $("#GMA120202M01_service-table-div table.table-list tbody tr").off('dblclick').on('dblclick', function() {
           $row = $(this);
           var mitsumoriMeisaiId = $row.find('[name=serviceMitsumoriMeisaiIdH]').val();
           var mitsumoriMeisaiGyoNo = $row.find('[name=serviceMitsumoriMeisaiGyoNoH]').val();
           var serviceKobetsuShohinCd = $row.find('[name=serviceKobetsuShohinCdH]').val();
           
           var data = addQueryString('op', 'initKobetsuGenkaMitsumoriMeisaiService');
           data = addQueryString('mitsumoriMeisaiIdH', mitsumoriMeisaiId, data);
           data = addQueryString('mitsumoriMeisaiGyoNoH', mitsumoriMeisaiGyoNo, data);
           data = addQueryString('kobetsuShohinCdH', serviceKobetsuShohinCd, data);

           if($('#GMA120203M01-dialog').length == 0) {
               $('#hide').append('<div id="GMA120203M01-dialog"></div>');
           }

           loadPage($('#GMA120203M01-dialog'), '<html:rewrite action="/MA/MA12/MA120203" />', data, function() {
               $.GMA120203M01_openDialog(function() {});
           }, 'GMA120202M01-Form-Id');
       });

       $('#GMA120202_SERVICE_CHECKBOX_ALL').toggleCheckbox(
               $('#GMA120202M01_service-table-div table.table-list tbody .check46'));

       $('#GMA120202M02-kobetsuGenkaKaitoTorikomiButton').off('click').on('click', function() {
           $.confirmMsgBox("個別原価回答を取り込みます。よろしいですか？", function() {
               var mitsumoriNo = $('#GMA120202M01-Form-Id [name=mitsumoriNoH]').val();
               var mitsumoriId = $('#GMA120202M01-Form-Id [name=mitsumoriIdH]').val();
               var kobetsuGenkaMitsumoriDomainIraisakiKbn =
                   $('#GMA120202M01 input[name=kobetsuGenkaMitsumoriDomainIraisakiKbn]').val();
               var data = addQueryString('op', 'updateKobetsuGenkaKaitoShutokuService');
               data = addQueryString('mitsumoriIdH', mitsumoriId, data);
               data = addQueryString('mitsumoriNoH', mitsumoriNo, data);
               $('[name=serviceMitsumoriMeisaiIdH]').each(function() {
                   data = addQueryString('mitsumoriMeisaiIdHArray', $(this).val(), data);
               });

               ajax_MA120211('<html:rewrite action="/MA/MA12/MA120211" />', data, function(json) {
                   $.infoMsgBox(json.hyojunMessage, function() {
                       var reloadForm = $('#GMA120202M01_reloadForm_service');
                       _loadPage($('#GMA120202M01-table-id'), reloadForm.attr('action'), reloadForm.serialize(), 
                               function(){ $("#GMA120202M01-table-id").initComponent(); }, 'GMA120202M01-Form-Id');
                   });
               }, 'GMA120202M01-Form-Id'
               , function(json){
                   if(!isEmpty(json.hyojunMessage)) {
                       $.infoMsgBox(json.hyojunMessage);
                   }
                   
                });
           });
       });
       
       $("#GMA120202M02-kobetsuGenkaMitsumoriIraiButton").off("click").on("click", function() {
       	var $selectedRows = $('#GMA120202M01_service-table-div table.table-list tbody tr').has('.check46:checked');
           if($selectedRows.length == 0) {
               $(this).dropdown('toggle');
               $.infoMsgBox('操作対象が選択されていません。');
               return;
           }
           var mitsumoriNo = $('#GMA120202M01-Form-Id [name=mitsumoriNoH]').val();
           var mitsumoriId = $('#GMA120202M01-Form-Id [name=mitsumoriIdH]').val();
           var mitsumoriStatus = $('#GMA120202M01-Form-Id [name=mitsumoriStatusH]').val();
           var kobetsuGenkaMitsumoriDomainIraisakiKbn =
               $('#GMA120202M01 input[name=kobetsuGenkaMitsumoriDomainIraisakiKbn]').val();
           var serviceKobetsuMitsumoriKaitoRequestYmd = 
               $('#GMA120202M01-ServiceEdit-form-id [name=serviceKobetsuMitsumoriKaitoRequestYmd]').val();
           var serviceKobetsuMitsumoriKaitoIraiBiko = 
               $('#GMA120202M01-ServiceEdit-form-id [name=serviceKobetsuMitsumoriKaitoIraiBiko]').val();
           var serviceTeikyoYmd = $('#GMA120202M01-ServiceEdit-form-id [name=serviceTeikyoYmd]').val();
           
           $.confirmMsgBox('個別原価見積を' + $selectedRows.length +'件依頼します。よろしいですか？', function() {
           	
           	var data = addQueryString('op', 'updateKobetsuMitsumoriIraiService');
               data = addQueryString('mitsumoriIdH', mitsumoriId, data);
               data = addQueryString('mitsumoriNoH', mitsumoriNo, data);
               data = addQueryString('serviceKobetsuMitsumoriKaitoRequestYmd', 
                       serviceKobetsuMitsumoriKaitoRequestYmd , data);
               data = addQueryString('serviceKobetsuMitsumoriKaitoIraiBiko', 
                       serviceKobetsuMitsumoriKaitoIraiBiko, data);
               data = addQueryString('serviceTeikyoYmd', serviceTeikyoYmd, data);
               
               $selectedRows.each(function() {
                   data = addQueryString('mitsumoriMeisaiIdHArray',
                           $(this).find('[name=serviceMitsumoriMeisaiIdH]').val(), data);
               });

               ajax('<html:rewrite action="/MA/MA12/MA120209" />', data, function(json) {
                   $.infoMsgBox(json.hyojunMessage, function() {
                       var reloadForm = $('#GMA120202M01_reloadForm_service');
                       _loadPage($('#GMA120202M01-table-id'), reloadForm.attr('action'), reloadForm.serialize(),
                               function(){ $("#GMA120202M01-table-id").initComponent();}, 'GMA120202M01-Form-Id');
                   });
               // USOL-V Dang Ngoc Minh 2015/08/18 UPDATE TOPIC_07 START
               // }, 'GMA120202M01-ServiceEdit-form-id');
               }, 'GMA120202M01-Form-Id');
               // USOL-V Dang Ngoc Minh 2015/08/18 UPDATE TOPIC_07 END
           });
           
       });
       
       $("#GMA120202M02-saisaibanButton").off("click").on("click", function() {
       	var $selectedRows = $('#GMA120202M01_service-table-div table.table-list tbody tr').has('.check46:checked');
           if($selectedRows.length == 0) {
               $(this).dropdown('toggle');
               $.infoMsgBox('操作対象が選択されていません。');
               return;
           }
           
           // USOL-V Vu Kim Khanh 2016/01/15 UPDATE SEQ005586O START
           var msg = "個別見積依頼番号を再採番します。<br/>";
           msg += "ステータスは「登録中」となり、個別依頼回答データは削除されます。よろしいですか？";
           // USOL-V Vu Kim Khanh 2016/01/15 UPDATE SEQ005586O END
           var mitsumoriNo = $('#GMA120202M01-Form-Id [name=mitsumoriNoH]').val();
           var mitsumoriId = $('#GMA120202M01-Form-Id [name=mitsumoriIdH]').val();
           var mitsumoriStatus = $('#GMA120202M01-Form-Id [name=mitsumoriStatusH]').val();
           var kobetsuGenkaMitsumoriDomainIraisakiKbn =
               $('#GMA120202M01 input[name=kobetsuGenkaMitsumoriDomainIraisakiKbn]').val();
           var serviceKobetsuMitsumoriKaitoRequestYmd = 
               $('#GMA120202M01-ServiceEdit-form-id [name=serviceKobetsuMitsumoriKaitoRequestYmd]').val();
           var serviceKobetsuMitsumoriKaitoIraiBiko = 
               $('#GMA120202M01-ServiceEdit-form-id [name=serviceKobetsuMitsumoriKaitoIraiBiko]').val();
           var serviceTeikyoYmd = $('#GMA120202M01-ServiceEdit-form-id [name=serviceTeikyoYmd]').val();
           
           $.confirmMsgBox(msg, function() {
               var data = addQueryString('op', 'updateMitsumoriIraiNoSaiSaiban');
               data = addQueryString('mitsumoriIdH', mitsumoriId, data);
               data = addQueryString('kobetsuGenkaMitsumoriDomainIraisakiKbn', 
                       kobetsuGenkaMitsumoriDomainIraisakiKbn, data);
               $selectedRows.each(function() {
                   data = addQueryString('mitsumoriMeisaiIdHArray', 
                           $(this).find('[name=serviceMitsumoriMeisaiIdH]').val(), data);
               });

               ajax('<html:rewrite action="/MA/MA12/MA120214" />', data, function(json) {
                   $.infoMsgBox(json.hyojunMessage, function() {
                       var reloadForm = $('#GMA120202M01_reloadForm_service');
                       _loadPage($('#GMA120202M01-table-id'), reloadForm.attr('action'), reloadForm.serialize(),
                               function(){ $("#GMA120202M01-table-id").initComponent();}, 'GMA120202M01-Form-Id');
                   });
               }, 'GMA120202M01-Form-Id');
           });
       });
       
       $("input[name='selectRadioButton']").off('change').on('change', function() {
       	var shoriTaishoChecked = $(this).val() == '1';
       	
       	if(shoriTaishoChecked) {
        	var reloadForm = $('#GMA120202M01_reloadForm_service');
        	var query = reloadForm.serialize();
        	query = addQueryString("selectRadioButton","1",query);
        	query = addQueryString("currentSortkeyB",$("input[name='currentSortkeyB']").val() ,query);
        	_loadPage($('#GMA120202M01-table-id'), reloadForm.attr('action'), query,
                    function(){ 
        					$("#GMA120202M01-table-id").initComponent();
        			}, 'GMA120202M01-Form-Id');
        }
        
        else{
        	var reloadForm = $('#GMA120202M01_reloadForm_service');
        	var query = reloadForm.serialize();
        	query = addQueryString("selectRadioButton","2",query);
        	query = addQueryString("currentSortkeyA",$("input[name='currentSortkeyA']").val() ,query);
        	
         	_loadPage($('#GMA120202M01-table-id'), reloadForm.attr('action'), query,
                     function(){ 
		             		$("#GMA120202M01-table-id").initComponent();
		             }, 'GMA120202M01-Form-Id');
        }
       });
       
       function callFssFileTenpu() {
            // USOL-V Dang Ngoc Minh 2015/11/10 UPDATE SEQ004469O START
            var mitsumoriNoH = $('#GMA120202M01-Form-Id [name=mitsumoriNoH]').val();
	       	window.open("<%=SystemPropertiesFactory.getProperty("MA_system", "fss.file.tenpu.url")%>" + mitsumoriNoH, "_target");
            // USOL-V Dang Ngoc Minh 2015/11/10 UPDATE SEQ004469O END
       }
       -->
   </script>
<!-- コンテキストメニュー -->
<ul id="GMA120202M01_ContextMenu_Service" style="width: 220px"
	class="contextMenu">
	<li><a href="#GMA120202M01_refer-kobetsu-mitsumori-service"><i
			class="ic-refer-record" />照会</a></li>
	<li><a href="#GMA120202M01_edit-kobetsu-mitsumori-service"><i
			class="ic-edit-record" />編集</a></li>
	<li><a
		href="#GMA120202M01_kobetsuGenkaMitsumoriIraiinfoCopyContextmenu"><i
			class="blank-icon" />個別原価見積依頼情報コピー</a></li>
	<li><a
		href="#GMA120202M01_kobetsuGenkaMitsumoriKaitoReferContextmenu"><i
			class="blank-icon" />個別原価見積回答照会</a></li>
</ul>
<h5>個別原価見積基本</h5>
<div class="row-fluid">
	<form class="span12" id="GMA120202M01-ServiceEdit-form-id">
		<table class="table-single table table-bordered table-condensed">
			<colgroup>
				<col width="20%">
				<col width="30%">
				<col width="17%">
				<col width="33%">
			</colgroup>
			<tbody>
				<tr>
					<td class="caption">回答希望日<span
						class="invalid-icon serviceKobetsuMitsumoriKaitoRequestYmd"></span></td>
					<td><input type="text" class="date input-small"
						name="serviceKobetsuMitsumoriKaitoRequestYmd"
						value="${outVO.kobetsuGenkaServiceEditInfoVO.serviceKobetsuMitsumoriKaitoRequestYmd}" />
						<i class="ic-help tooltip-right"
						title="回答希望日はyyyyMMdd形式で入力してください。"></i></td>
					<%-- USOL-V Vu Kim Khanh 2016/01/15 UPDATE SEQ005586O START --%>
					<td class="caption required">導入・サポートサービス予定日<span
						class="invalid-icon serviceTeikyoYmd"></span></td>					
					<td><input type="text" class="date input-small"
						name="serviceTeikyoYmd"
						value="${outVO.kobetsuGenkaServiceEditInfoVO.serviceTeikyoYmd}" />
						<i class="ic-help tooltip-right"
						title="導入・サポートサービス予定日はyyyyMMdd形式で入力してください。また、個別原価見積依頼時は必須項目です。"></i></td>
					<%-- USOL-V Vu Kim Khanh 2016/01/15 UPDATE SEQ005586O END --%>
				</tr>
				<tr>
					<td class="caption">見積依頼備考欄<span
						class="invalid-icon serviceKobetsuMitsumoriKaitoIraiBiko"></span></td>
					<td colspan="3"><textarea
							name="serviceKobetsuMitsumoriKaitoIraiBiko" cols="80" rows="3"
							class="span8" style="width: 650px;">${outVO.
                               kobetsuGenkaServiceEditInfoVO.serviceKobetsuMitsumoriKaitoIraiBiko}</textarea></td>
				</tr>
			</tbody>
		</table>
	</form>
</div>
<h5>個別原価見積明細一覧</h5>
<div class="row-fluid">
	<div class="span12">
		<div class="row row-button">
			<div class="span6">
				<span class="btn-group">
					<button type="button" class="btn"
						id="GMA120202M02-kobetsuGenkaMitsumoriIraiButton">個別原価見積依頼</button>
				</span> <span class="btn-group">
					<button type="button" class="btn"
						id="GMA120202M02-saisaibanButton">再採番</button>
				</span> <span class="btn-group">
				<%
					String selectB = request.getParameter("selectRadioButton");
					Object selectBS = session.getAttribute("selectRadioButtonS");
					if (selectB == null && selectBS == null) 
					    selectB = "1";
					else if(selectB == null && selectBS != null)
					    selectB = selectBS.toString();
					session.setAttribute("selectRadioButtonS", selectB);
				%>
				<label class="radio inline">
					<input type="radio" name="selectRadioButton" value="1" <% if("1".equalsIgnoreCase(selectB)){%>checked<%}%>>依頼
				</label> <label class="radio inline">
					<input type="radio" name="selectRadioButton" value="2" <% if("2".equalsIgnoreCase(selectB)){%>checked<%}%>>回答
				</label>
				</span>
			</div>
			<div class="span6 text-right">
				<span class="btn-group">
					<button type="button" class="btn" id="GMA120202M02-fssFileTenpuButton" onclick="callFssFileTenpu();">FSSファイル添付</button>
				</span> 
				<span class="btn-group">
					<button type="button" class="btn" id="GMA120202M02-kobetsuGenkaKaitoTorikomiButton">個別原価回答取込</button>
				</span>
			</div>
		</div>
		<% if ("1".equalsIgnoreCase(selectB)) { %>
		
		<logic:present name="outVO" property="pagingCollection">	
		<div class="table-fixed-list" data-height="268px" id="GMA120202M01_service-table-div">
			<table
				class="table-list table table-bordered table-condensed table-striped table-highlights">
				<tags:listHeader columnInfoId="GMA120202M01_SERVICE_ICHIRAN_TABLE"
					reloadTagId="GMA120202M01_reloadForm_service"
					sortItemName="${outVO.pagingCollection.sortKey}"
					sortOrder="${outVO.pagingCollection.sortOrder}" />
				<tbody>
					<logic:iterate
						collection="${outVO.pagingCollection.dataCollection}"
						id="kobetsuGenkaMeisaiInfo" indexId="id">
						<tr>
							<td><center>
									<input type="hidden" name="serviceMitsumoriMeisaiIdH"
										value="${kobetsuGenkaMeisaiInfo.serviceMitsumoriMeisaiId}" />
									<input type="hidden" name="serviceMitsumoriMeisaiGyoNoH"
										value="${kobetsuGenkaMeisaiInfo.serviceMitsumoriMeisaiGyoNo}" />
									<input type="hidden" name="serviceKobetsuShohinCdH"
										value="${kobetsuGenkaMeisaiInfo.serviceKobetsuShohinCd}" />
									<input type="hidden" name="serviceKobetsuMitsumoriIraiStatusH"
										value="${kobetsuGenkaMeisaiInfo.serviceKobetsuMitsumoriIraiStatus}" />
									<input type="hidden" name="currentSortkeyA" value="${outVO.pagingCollection.sortKey}" />
									<input name="shoriTaishoSelectCheckbox" class="check46"
										type="checkbox" />
								</center></td>

							<%-- USOL-V Ta Thi Thanh Huyen 2015/07/21 UPDATE(DELETE) KADAIBL-056 START --%>
							<%-- <td>${kobetsuGenkaMeisaiInfo.serviceMitsumoriMeisaiGyoNo}</td> --%>
							<%-- USOL-V Ta Thi Thanh Huyen 2015/07/21 UPDATE(DELETE) KADAIBL-056 END --%>

							<%-- USOL-V Ta Thi Thanh Huyen 2015/07/21 UPDATE(ADD)     START --%>
							<td><tags:formatNumber value="${kobetsuGenkaMeisaiInfo.serviceMitsumoriMeisaiGyoNo}"
                                format="#####.#####" /></td>
                            <%-- USOL-V Ta Thi Thanh Huyen 2015/07/21 UPDATE(ADD) KADAIBL-056 END --%>

							<td>${kobetsuGenkaMeisaiInfo.serviceKobetsuMitsumoriIraiNo}</td>

                            <%-- USOL-V Le Van Dang 2015/09/09 UPDATE SEQ004068O START --%>
                            <td>
                            <%
                            KobetsuGenkaServiceMeisaiInfoVO kobetsuGenkaMeisaiInfoVO = (KobetsuGenkaServiceMeisaiInfoVO)kobetsuGenkaMeisaiInfo;
                            if(CodeManager.hasCode(MACodeConstants.CMAZZ046, kobetsuGenkaMeisaiInfoVO.getServiceKobetsuMitsumoriIraiStatus())) { 
                            %>
                                <tags:label id="CMAZZ046" value="${kobetsuGenkaMeisaiInfo.serviceKobetsuMitsumoriIraiStatus}"/>
                            <%} %>
                            <%-- USOL-V Le Van Dang 2015/09/09 UPDATE SEQ004068O END --%>
                            </td>

                            <td>
                            <%-- USOL-V Le Van Dang 2015/09/09 UPDATE SEQ004068O START --%>
                            <%
                            if(CodeManager.hasCode(ZPCodeConstants.CZZ00002, kobetsuGenkaMeisaiInfoVO.getHikiukeKahiFlg())) { 
                            %>
                                <tags:label id="CZZ00002" value="${kobetsuGenkaMeisaiInfo.hikiukeKahiFlg}"/>
                            <%} %>
                            </td>
                            <%-- USOL-V Le Van Dang 2015/09/09 UPDATE SEQ004068O END --%>

							<td class="number"><tags:formatNumber
									value="${kobetsuGenkaMeisaiInfo.serviceKobetsuMitsumoriMoney}"
									format="###,###,###,###" /></td>
							<td class="number"><tags:formatNumber
									value="${kobetsuGenkaMeisaiInfo.teijiTanka}"
									format="###,###,###,###" /></td>		
							<td>${kobetsuGenkaMeisaiInfo.serviceShohinCd}</td>
							<td>${kobetsuGenkaMeisaiInfo.serviceShohinName}</td>
							<td>${kobetsuGenkaMeisaiInfo.serviceTaishoShohinCd}</td>
							<td>${kobetsuGenkaMeisaiInfo.serviceTaishoShohinName}</td>		
							<td>${kobetsuGenkaMeisaiInfo.serviceShohinBetsumei}</td>		
							<td>${kobetsuGenkaMeisaiInfo.serviceYakujoName}</td>
							<td>${kobetsuGenkaMeisaiInfo.koseiName}</td>

                            <%-- USOL-V Le Van Dang 2015/09/09 UPDATE SEQ004068O START --%>
                            <td>
                            <%
                            if(CodeManager.hasCode(ZPCodeConstants.CMA14024, kobetsuGenkaMeisaiInfoVO.getTehaiServiceNaiyoKbn())){ 
                            %>
                                <tags:label id="CMA14024" value="${kobetsuGenkaMeisaiInfo.tehaiServiceNaiyoKbn}"/>
                            <%} %>
                            </td>
                            <%-- USOL-V Le Van Dang 2015/09/09 UPDATE SEQ004068O END --%>

							<td class="number"><tags:formatNumber
                                    value="${kobetsuGenkaMeisaiInfo.serviceKobetsuShohinQty}"
                                    format="###,###,###,###" />
							</td>
							<td class="number"><tags:formatNumber
									value="${kobetsuGenkaMeisaiInfo.kobetsuGenkaMitsumoriMoneyGokeiC}"
									format="###,###,###,###" /></td>
							<td>${kobetsuGenkaMeisaiInfo.serviceYoryoshoNo}</td>		
							<td class="date"><tags:formatDate
									value="${kobetsuGenkaMeisaiInfo.kobetsuGenkaMitsumoriYukoKigenYmd}"
									to="<%=NGITDateUtil.yyyyMMdd%>"
									from="<%=NGITDateUtil.yyyyMMdd_NS%>" /></td>
						</tr>
					</logic:iterate>
				</tbody>
			</table>
			</div>
		</logic:present>	
		
		<%} else { %>
		<logic:present name="outVO" property="pagingCollectionKaito">
		<div class="table-fixed-list" data-height="268px" id="GMA120202M01_service-table-div">
			<table
				class="table-list table table-bordered table-condensed table-striped table-highlights">
				<tags:listHeader columnInfoId="GMA120202M01_KAITO_SERVICE_ICHIRAN_TABLE"
					reloadTagId="GMA120202M01_reloadForm_service"
					sortItemName="${outVO.pagingCollectionKaito.sortKey}"
					sortOrder="${outVO.pagingCollectionKaito.sortOrder}" />
				<tbody>
					<logic:iterate
						collection="${outVO.pagingCollectionKaito.dataCollection}"
						id="kobetsuGenkaMeisaiInfo" indexId="id">
						<tr>
							<td><center>
									<input type="hidden" name="serviceMitsumoriMeisaiIdH"
										value="${kobetsuGenkaMeisaiInfo.serviceMitsumoriMeisaiId}" />
									<input type="hidden" name="serviceMitsumoriMeisaiGyoNoH"
										value="${kobetsuGenkaMeisaiInfo.serviceMitsumoriMeisaiGyoNo}" />
									<input type="hidden" name="serviceKobetsuShohinCdH"
										value="${kobetsuGenkaMeisaiInfo.serviceKobetsuShohinCd}" />
									<input type="hidden" name="currentSortkeyB" value="${outVO.pagingCollectionKaito.sortKey}" />
									<input type="hidden" name="serviceKobetsuMitsumoriIraiStatusH"
										value="${kobetsuGenkaMeisaiInfo.serviceKobetsuMitsumoriIraiStatus}" />
									<input name="shoriTaishoSelectCheckbox" class="check46"
										type="checkbox" />
								</center></td>

							<%-- USOL-V Ta Thi Thanh Huyen 2015/07/21 UPDATE(DELETE) KADAIBL-056 START --%>
							<%-- <td>${kobetsuGenkaMeisaiInfo.serviceMitsumoriMeisaiGyoNo}</td> --%>
							<%-- USOL-V Ta Thi Thanh Huyen 2015/07/21 UPDATE(DELETE) KADAIBL-056 END --%>

							<%-- USOL-V Ta Thi Thanh Huyen 2015/07/21 UPDATE(ADD) KADAIBL-056 START --%>
                            <td><tags:formatNumber value="${kobetsuGenkaMeisaiInfo.serviceMitsumoriMeisaiGyoNo}"
                                format="#####.#####" /></td>
                            <%-- USOL-V Ta Thi Thanh Huyen 2015/07/21 UPDATE(ADD) KADAIBL-056 END --%>

							<td>${kobetsuGenkaMeisaiInfo.serviceKobetsuMitsumoriIraiNo}</td>

                            <%-- USOL-V Le Van Dang 2015/09/09 UPDATE SEQ004068O START --%>
                            <td>
                            <%
                            KobetsuGenkaServiceMeisaiInfoVO kobetsuGenkaMeisaiInfoVO = (KobetsuGenkaServiceMeisaiInfoVO)kobetsuGenkaMeisaiInfo;
                            if(CodeManager.hasCode(MACodeConstants.CMAZZ046, kobetsuGenkaMeisaiInfoVO.getServiceKobetsuMitsumoriIraiStatus())) { 
                            %>
                                <tags:label id="CMAZZ046" value="${kobetsuGenkaMeisaiInfo.serviceKobetsuMitsumoriIraiStatus}"/>
                            <%} %>
                            </td>
                            <%-- USOL-V Le Van Dang 2015/09/09 UPDATE SEQ004068O END --%>

                            <%-- USOL-V Le Van Dang 2015/09/09 UPDATE SEQ004068O START --%>
                            <td>
                            <%
                            if(CodeManager.hasCode(ZPCodeConstants.CZZ00002, kobetsuGenkaMeisaiInfoVO.getHikiukeKahiFlg())) {  
                            %>
                                <tags:label id="CZZ00002" value="${kobetsuGenkaMeisaiInfo.hikiukeKahiFlg}"/>
                            <%} %>
                            </td>
                            <%-- USOL-V Le Van Dang 2015/09/09 UPDATE SEQ004068O END --%>

							<td class="number"><tags:formatNumber
									value="${kobetsuGenkaMeisaiInfo.serviceKobetsuMitsumoriMoney}"
									format="###,###,###,###" /></td>
							<td class="number"><tags:formatNumber
									value="${kobetsuGenkaMeisaiInfo.teijiTanka}"
									format="###,###,###,###" /></td>
							<td><c:choose>
									<c:when test="${fn:length(kobetsuGenkaMeisaiInfo.serviceKobetsuMitsumoriKaitoyoComment)>7}">
										${fn:substring(kobetsuGenkaMeisaiInfo.serviceKobetsuMitsumoriKaitoyoComment, 0, 7)}...
									</c:when>
									<c:otherwise>
										${kobetsuGenkaMeisaiInfo.serviceKobetsuMitsumoriKaitoyoComment}
									</c:otherwise>
								</c:choose></td>
							<td>
								<c:choose>
									<c:when test="${fn:length(kobetsuGenkaMeisaiInfo.kobetsuShohinEtcKeiyakuJoko)>7}">
										${fn:substring(kobetsuGenkaMeisaiInfo.kobetsuShohinEtcKeiyakuJoko, 0, 7)}...
									</c:when>
									<c:otherwise>
										${kobetsuGenkaMeisaiInfo.kobetsuShohinEtcKeiyakuJoko}
									</c:otherwise>
								</c:choose>
							</td>

                            <%-- USOL-V Le Van Dang 2015/09/09 UPDATE SEQ004068O START --%>
                            <td>
                            <%
                            if(CodeManager.hasCode(ZPCodeConstants.CZZ00003,kobetsuGenkaMeisaiInfoVO.getServiceKobetsuShohinCallcenterUseFlg())){ 
                            %>
                                <tags:label id="CZZ00003" value="${kobetsuGenkaMeisaiInfo.serviceKobetsuShohinCallcenterUseFlg}"/>
                            <%} %>
                            </td>
                            <%-- USOL-V Le Van Dang 2015/09/09 UPDATE SEQ004068O END --%>

                            <%-- USOL-V Le Van Dang 2015/09/09 UPDATE SEQ004068O START --%>
                            <td>
                            <% 
                            if(CodeManager.hasCode(MACodeConstants.CMAZZ027, kobetsuGenkaMeisaiInfoVO.getKobetsuShohinServiceYobitaiKbn())){ 
                            %>
                                <tags:label id="CMAZZ027" value="${kobetsuGenkaMeisaiInfo.kobetsuShohinServiceYobitaiKbn}"/>
                            <%} %>
                            </td>
                            <%-- USOL-V Le Van Dang 2015/09/09 UPDATE SEQ004068O END --%>

							<td>${kobetsuGenkaMeisaiInfo.kobetsuShohinServiceStartJikanD}</td>
							<td>${kobetsuGenkaMeisaiInfo.kobetsuShohinServiceEndJikanD}</td>
							<td class="date"><tags:formatDate
									value="${kobetsuGenkaMeisaiInfo.kobetsuGenkaMitsumoriYukoKigenYmd}"
									to="<%=NGITDateUtil.yyyyMMdd%>"
									from="<%=NGITDateUtil.yyyyMMdd_NS%>" /></td>
							<td>${kobetsuGenkaMeisaiInfo.serviceShohinCd}</td>
							<td>${kobetsuGenkaMeisaiInfo.serviceShohinName}</td>
							<td>${kobetsuGenkaMeisaiInfo.serviceTaishoShohinCd}</td>
							<td>${kobetsuGenkaMeisaiInfo.serviceTaishoShohinName}</td>
							<td>${kobetsuGenkaMeisaiInfo.serviceShohinBetsumei}</td>
							<td>${kobetsuGenkaMeisaiInfo.serviceYakujoName}</td>
							<td>${kobetsuGenkaMeisaiInfo.koseiName}</td>

                            <%-- USOL-V Le Van Dang 2015/09/09 UPDATE SEQ004068O START --%>
                            <td>
                            <%
                            if(CodeManager.hasCode(ZPCodeConstants.CMA14024, kobetsuGenkaMeisaiInfoVO.getTehaiServiceNaiyoKbn())){ 
                            %>
                                <tags:label id="CMA14024" value="${kobetsuGenkaMeisaiInfo.tehaiServiceNaiyoKbn}"/>
                            <%} %>
                            </td>		
                            <%-- USOL-V Le Van Dang 2015/09/09 UPDATE SEQ004068O END --%>

							<td class="number"><tags:formatNumber
                                    value="${kobetsuGenkaMeisaiInfo.serviceKobetsuShohinQty}"
                                    format="###,###,###,###" />
							</td>		
							<td class="number"><tags:formatNumber
									value="${kobetsuGenkaMeisaiInfo.kobetsuGenkaMitsumoriMoneyGokeiC}"
									format="###,###,###,###" /></td>		
							<td>${kobetsuGenkaMeisaiInfo.serviceYoryoshoNo}</td>		
							
                            <%-- USOL-V Le Van Dang 2016/03/21 ADD グループ番号⑫　要求番号121 START --%>
                            <td class="date">
                                <tags:formatDate value="${kobetsuGenkaMeisaiInfo.kobetsuGenkaKaitoTorikomiDate}"
                                  to="<%=NGITDateUtil.yyyyMMdd_HHmmss%>" from="<%=NGITDateUtil.yyyyMMddHHmmssSSS%>"/>
                             </td>
                             <%-- USOL-V Le Van Dang 2016/03/21 ADD グループ番号⑫　要求番号121 END --%>
						</tr>
					</logic:iterate>
				</tbody>
			</table>
			</div>
		</logic:present>
		
		<%} %>
	</div>
</div>
<tags:reloadForm formName="MA120202Form" action="/MA/MA12/MA120202"
		op="searchKobetsuGenkaMitsumoriEditService"
		id="GMA120202M01_reloadForm_service" />
<div class="pagingCommonPart" />
<input type="hidden" name="kobetsuGenkaMitsumoriDomainIraisakiKbn"
	value="${outVO.kobetsuGenkaMitsumoriSearchConditionVO.kobetsuGenkaMitsumoriDomainIraisakiKbn}" />

