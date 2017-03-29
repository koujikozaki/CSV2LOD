function writeToLocal(filename, content) {
	var ua = navigator.userAgent.toLowerCase();

  if (ua.indexOf('msie') >= 0 || (window.navigator != null &&  window.navigator.msSaveBlob != null)) {  // MS IE

		filename = 'C:\\tmp\\' + filename;
			// インターネットオプションで「スクリプトを実行しても安全だとマークされていない
			// ActiveX コントロールの初期化とスクリプトの実行（セキュリティで保護されていない）」
			// を有効にする必要あり
		var fso = new ActiveXObject('Scripting.FileSystemObject');
			// ファイルを新規作成して書き込みモードで開く (文字コードはUTF-16)
			// cf. http://msdn.microsoft.com/ja-jp/library/cc428044.aspx
			//     http://msdn.microsoft.com/ja-jp/library/cc428042.aspx
		var file = fso.OpenTextFile(filename,
						    2,     // 1: 読み取り専用, 2: 書き込み, 8: 追記
						    true,  // ファイルが存在しなければ新規作成するかどうか
						    -1     // -2: OSのデフォルト文字コード, -1: UTF-16, 0: ASCII
						   );
		file.Write(content);
		file.Close();
		alert('書き込みが完了しました：[' + filename + ']');

	} else if (typeof Blob !== "undefined") {
			writeToLocalHTML5(content, filename);
   } else {
		alert('エラー: ローカルファイルへの書き込み方がわかりません・・・');
	}

	function writeToLocalHTML5(content, filename){
		var supportsDownloadAttribute = 'download' in document.createElement('a');

     if(supportsDownloadAttribute) {
			var blob = new Blob([ content ], { "type" : "application/x-msdownload" });

/*			 
			// Aタグのhref属性にBlobオブジェクトを設定し、リンクを生成
		    var a = document.createElement("a");
		    a.href = URL.createObjectURL(blob);
		    a.target = '_blank';
		    a.download = filename;
		    a.click();
*/
        var url = (window.URL || window.webkitURL);
        var data = url.createObjectURL(blob);
        var e = document.createEvent("MouseEvents");
        e.initMouseEvent("click", true, false, window, 0, 0, 0, 0, 0, false, false, false, false, 0, null);
        var a = document.createElementNS("http://www.w3.org/1999/xhtml", "a");
        a.href = data;
        a.download = filename;   
        a.dispatchEvent(e);

     } else {
       window.open('data:attachment/csv;charset=utf-8,' + encodeURI(content));
     }
	}
}

function readFromLocal(fileinfo, cb){
/*
	$.get(filename, function(data){  
//	    alert(data);
		var unicodeArray = str2Array(data);
		var encoding = Encoding.detect(unicodeArray);  
//		var utf8Array = Encoding.convert(unicodeArray, 'UTF8', 'SJIS');
		alert(encoding);
	});

	function str2Array(str) {
	    var array = [],i,il=str.length;
	    for(i=0;i<il;i++) array.push(str.charCodeAt(i));
	    return array;
	}
*/
	if (window.File && window.FileReader && window.Blob) {
		var reader = new FileReader();


		if (reader.readAsBinaryString != null){
		  reader.addEventListener("load", function(event){
				// バイナリデータを取得
				var raw = reader.result;
				// バイト配列を格納する変数
				var bytes = [];
				// バイナリデータを順に取得（0xffとの論理積でバイト値に変換（1））
				for (var i = 0; i < raw.length; i++){
				  bytes[i] = raw.charCodeAt(i) & 0xff;
				}
				var utf8bytes = Encoding.convert(bytes, 'UTF8', 'AUTO');  
				if (cb != null){
					cb(bytes2str(utf8bytes));
				}
			});
			reader.readAsBinaryString(fileinfo);
		} else {
		  reader.addEventListener("load", function(event){
				var raw = reader.result;
				var bytes = new Uint8Array(raw);
				var utf8bytes = Encoding.convert(bytes, 'UTF8', 'AUTO');  
				if (cb != null){
					cb(bytes2str(utf8bytes));
				}
			});

			reader.readAsArrayBuffer(fileinfo);
		}
	} else {
		var text =$.ajax({
			  url:filename,
			dataType: 'binary',
		 	 async : false,
			 beforeSend:function(xhr){
			    xhr.overrideMimeType("text/plain; charset=x-user-defined");
	//		  }
			}
		}).responseText;
	//	var str_array=text.split('');//1文字ずつ配列に入れる
		var utf8Array=Encoding.convert(text, 'UTF8', 'AUTO');//UTF-8に変換
	  var convert=utf8Array.join('');//配列を文字列に戻す
	}

/*
    var xhr = new XMLHttpRequest();
    xhr.open('GET', filename, true);
    xhr.responseType = 'arraybuffer';
    xhr.onload = function(e) {
        // ArrayBufferで返ってくる
        console.log(this.response.byteLength);
//			var utf8Array=Encoding.convert(str_array, 'UTF8', 'AUTO');//UTF-8に変換
    };

    xhr.send();
*/
}

function bytes2str(arr) {
    if (arr == null)
        return null;
    var result = "";
    var i;
    while (i = arr.shift()) {
        if (i <= 0x7f) {
            result += String.fromCharCode(i);
        } else if (i <= 0xdf) {
            var c = ((i&0x1f)<<6);
            c += arr.shift()&0x3f;
            result += String.fromCharCode(c);
        } else if (i <= 0xe0) {
            var c = ((arr.shift()&0x1f)<<6)|0x0800;
            c += arr.shift()&0x3f;
            result += String.fromCharCode(c);
        } else {
            var c = ((i&0x0f)<<12);
            c += (arr.shift()&0x3f)<<6;
            c += arr.shift() & 0x3f;
            result += String.fromCharCode(c);
        }
    }
    return result;
}

/*
function writeToLocal(filename, content) {
	var ua = navigator.userAgent.toLowerCase();
	try {
	    if (ua.indexOf('firefox') != -1) {  // Firefox
			filename = (ua.indexOf('windows') != -1 ? 'C:\\tmp\\' : '/tmp/') + filename;
			// ローカルファイルにアクセスする権限を取得
			// fileスキームじゃない場合は about:config で
			// signed.applets.codebase_principal_support を true にする必要あり;
			netscape.security.PrivilegeManager.enablePrivilege('UniversalXPConnect');
			// ファイルコンポーネントの取得＋ローカルファイル操作用のインターフェイスの取得;
			var file = Components.classes['@mozilla.org/file/local;1'].createInstance(Components.interfaces.nsILocalFile);
			file.initWithPath(filename);
			var fileStream = Components
			    .classes['@mozilla.org/network/file-output-stream;1']
			    .createInstance(Components.interfaces.nsIFileOutputStream);
			// ファイルが存在しない場合は664の権限で新規作成して書き込み権限で開く
			// cf. https://developer.mozilla.org/en/NsIFileOutputStream
			//     http://www.oxymoronical.com/experiments/apidocs/interface/nsIFileOutputStream;
			fileStream.init(file,
					0x02 | 0x08,  // 0x01: 読み取り専用, 0x02: 書き込み, 0x03: 読み書き, 0x08: 新規作成, 0x10: 追記
					0664,         // mode
					0             // 第4引数は現在サポートしていないとか
				       );
			// cf. http://www.oxymoronical.com/experiments/apidocs/interface/nsIConverterOutputStream
			var converterStream = Components
			    .classes['@mozilla.org/intl/converter-output-stream;1']
			    .createInstance(Components.interfaces.nsIConverterOutputStream);
			converterStream.init(fileStream, 'UTF-8', content.length,
					     Components.interfaces.nsIConverterInputStream.DEFAULT_REPLACEMENT_CHARACTER);
			converterStream.writeString(content);
			converterStream.close();
			fileStream.close();
			alert('書き込みが完了しました！');
	    } else if (ua.indexOf('chrome') != -1) {  // Google Chrome
    // chrome以外は弾く
    var ua = navigator.userAgent.toLowerCase();
    if (ua.indexOf('chrome') == -1) {
        alert("This Page is Google Chrome only!");
    }

    function errorCallback(e) {
        alert("Error: " + e.name);
    }

    function fsCallback(fs) {
        fs.root.getFile(filename, {create: true}, function(fileEntry) {
            fileEntry.createWriter(function(fileWriter) {

                fileWriter.onwriteend = function(e) {
                    alert("Success! : " + fileEntry.fullPath);
                };

                fileWriter.onerror = function(e) {
                    alert("Failed: " + e);
                };

                var output = new Blob([content], {type: "text/plain"});
                fileWriter.write(output);
            }, errorCallback);
        }, errorCallback);
    }
    // クオータを要求する。PERSISTENTでなくTEMPORARYの場合は
    // 直接 webkitRequestFileSystem を呼んでよい
    navigator.webkitPersistentStorage.requestQuota(1024,
        webkitRequestFileSystem(PERSISTENT, 1024, fsCallback, errorCallback),
    errorCallback);
	    } else if (ua.indexOf('msie')) {  // MS IE
			filename = 'C:\\tmp\\' + filename;
			// インターネットオプションで「スクリプトを実行しても安全だとマークされていない
			// ActiveX コントロールの初期化とスクリプトの実行（セキュリティで保護されていない）」
			// を有効にする必要あり
			var fso = new ActiveXObject('Scripting.FileSystemObject');
			// ファイルを新規作成して書き込みモードで開く (文字コードはUTF-16)
			// cf. http://msdn.microsoft.com/ja-jp/library/cc428044.aspx
			//     http://msdn.microsoft.com/ja-jp/library/cc428042.aspx
			var file = fso.OpenTextFile(filename,
						    2,     // 1: 読み取り専用, 2: 書き込み, 8: 追記
						    true,  // ファイルが存在しなければ新規作成するかどうか
						    -1     // -2: OSのデフォルト文字コード, -1: UTF-16, 0: ASCII
						   );
			file.Write(content);
			file.Close();
			alert('書き込みが完了しました！');
	    } else {
			alert('エラー: ローカルファイルへの書き込み方がわかりません・・・');
	    }
	} catch (e) {
	    alert('Error: ' + e);
	}
}
*/