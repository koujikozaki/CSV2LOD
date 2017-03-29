
//var index_id = '';
var id_index = -1;

$(window).load(function() {
	$('#ttl_make').click(function(event){
		var contents = $('#rdf_template').val();

		$('#ttl_result').val(turtle_convert(contents));
		var filename = 'output_';
		if (csv_file != null){
			filename = csv_file.name + '_';
		}

		var ttl_filename = make_filename(filename, 'ttl');
		$('#ttl_filename').val(ttl_filename);
		$('#ttl_download').removeAttr('disabled');
	});

	$('#ttl_download').click(function(event){
		writeToLocal($('#ttl_filename').val(), $('#ttl_result').val());
	});


});

String.prototype.replaceAll = function (org, dest){
  return this.split(org).join(dest);
};

function turtle_convert(template){
	var header = [];
	var contents = [];
	var prefix = [];

	if (template == null || template.trim() == ''){
		alert('テンプレートを作成もしくは読み込んでください');
		return;
	}

	if (csv_data == null || csv_data.data == null || csv_data.data.length < 1){
		alert('CSVファイルを読み込んでください');
		return;
	}

	var lines = template.split('\n');

	// まずはコマンド行のID列を検索
	for (var i=0; i<lines.length; i++){
		var line = lines[i];

		if (line.indexOf('##') >= 0){
			// コマンド行
			if (ttl_find_id(line)){
				break;
			}
		}
	}

	// 次にはコンテンツを生成
	for (var i=0; i<lines.length; i++){
		var line = lines[i];

		if (line.indexOf('##') >= 0){
			// コマンド行
			if (is_mapping_splitter(line, true)){
				i = ttl_replace_template(lines, i, contents, id_index);
			}
			continue;
		}
		if (line.indexOf('@prefix') == 0){
			prefix.push(line);
		} else {
			contents.push(line);
		}
	}

	// 次にヘッダを生成
	for (var j=0; j<lines.length; j++){
		var line = lines[j];

		if (line.indexOf('##') >= 0){
			if (is_mapping_splitter(line, true)){
				// コンテンツ終了行までジャンプ
				j = i;
			}

			// コマンド行
			header.push(ttl_replace_command(line, contents.join('\n'), header.join('\n'), prefix));
			continue;
		}

	}

	//#kozaki 2016/08/22 最後行の最終列が「空」のとき，「.」でなく「;」で終わるバグを修正
	//alert(contents[contents.length-2]);
	if (contents[contents.length-2].indexOf(';') == (contents[contents.length-2].length-1)){
		contents[contents.length-2] = contents[contents.length-2].substring(0,contents[contents.length-2].length-1) + '.';
	}
	//alert(contents[contents.length-2]);


	return header.join('\n') + contents.join('\n');
}

function is_mapping_splitter(line, isstart){
	if (isstart){
		if (line.indexOf('mapping-rules-start') >= 0){
			return true;
		}
	} else {
		if (line.indexOf('mapping-rules-end') >= 0){
			return true;
		}
	}
}

function ttl_find_id(line, contents){
	if (line.indexOf('ID=') >= 0){
		var line = line.substring(line.indexOf('=')+1);
		var _id = -1;
		if (line.indexOf('[[') == 0 && line.indexOf(']]') > 0){
			id = line.substring('[['.length, line.length - ']]'.length);
		} else {
			id = '';
		}

	// ヘッダ列が何番目かを取得する
		id_index = -1;
		var header = csv_data.data[0];
		for (var i=0; i<header.length; i++){
			if ((header[i] != "") && (header[i] == id)){
				id_index = i;
				break;
			}
		}
		return true;
	}
	return false;
}


function ttl_replace_command(line, contents, header, prefix){
	var content = '';
	if (line.indexOf('cc:attributionName=') >= 0){
		content = line.substring(line.indexOf('=')+1);
		var sep = get_separator(content);
		if (header.indexOf('cc:license') >= 0){
			content = '   cc:attributionName '+sep[0] + content + sep[1] + ' .';
		} else {
			content = '<> cc:attributionName '+sep[0] + content + sep[1] + ' ;';
		}
	}
	if (line.indexOf('cc:license=') >= 0){
		content = line.substring(line.indexOf('=')+1);
		if (header.indexOf('cc:attributionName') >= 0){
			content = '   cc:license <'+content+'> .';
		} else {
			content = '<> cc:license <'+content+'> ;';
		}
	}
	if (line.indexOf('baseIRI=') >= 0){
		var base = line.substring(line.indexOf('=')+1);
		//#kozaki 2015/09/11　basepropを導入
		var baseprop = base.substring(0,base.length-1) + '/property#';
		//if(base.indexOf('#')>=0){
		//	 baseprop =.replace('#property','/property');
		//}
		content += '@base <' + base + '> .\n';
//		content += '@prefix bp: <' + baseprop + '> .\n';
		//content += '@prefix bp: <' + base + '> .\n';
		content += ttl_make_prefix(contents, prefix);
	}

	return content;

}

// TODO ここを、テンプレートから生成するように変更する
function ttl_make_prefix(content, prefixes){
	var contents = '';

	var shorts = [];
	for (var i=0; i<prefixes.length; i++){
		var word = prefixes[i].trim();
		if (word.indexOf(' ') >= 0){
			word = word.substring(word.indexOf(' '));
			if (word.indexOf(':') >= 0){
				word = word.substring(0, word.indexOf(':')).trim();
				shorts.push(word);
			}
		}
	}
	// デフォルトprefix
	for (var i=0; i<shorts.length; i++){
		if (ttl_id_used_namespace(shorts[i], content)){
//			contents += '@prefix ' + namespace_base[i].short + ': <' + namespace_base[i].namespace + '> .\n';
			contents += prefixes[i] + '\n';
		}
	}
/*
	for (var i=0; i<prefixes.length; i++){
		var val = $(prefixes[i]).val();
		val = val.split(',');
		if (ttl_id_used_namespace(val[0], content)){
			contents += '@prefix ' + val[0] + ': <' + val[1] + '> .\n';
		}
	}
*/

	return contents.trim();
}

function ttl_id_used_namespace(namespace, contents){
	if (namespace == 'cc'){
		// 例外的に常にtrue
		return true;
	}

	var ns = namespace + ':';
	if (contents.indexOf(' ' + ns) >= 0 || contents.indexOf('^^' + ns) >= 0){
		return true;
	}


	return false;
}


function ttl_replace_template(lines, i , content, id_index){
	var header = csv_data.data[0];
	var data = csv_data.data;

	for (var l=1; l<data.length; l++){
		var key = [];
		for (var n=i; n<lines.length; n++){
			var index = 0;
			var line = lines[n];
			if (is_mapping_splitter(line, false)){
				break;
			}
			if (line.indexOf('##') >= 0){
				if (content.length > 0){
					if (content[content.length-1].indexOf(';') == (content[content.length-1].length-1)){
						content[content.length-1] = content[content.length-1].substring(0,content[content.length-1].length-1) + '.';
					}
				}
				continue;
			}

			if (line.indexOf('ID') == 0){
				var id = null;
				if (id_index == -1){
					id = l;
				} else {
					id = data[l][id_index];
					id = replace_uri(id);
				}
				line = line.replace('ID', '<' + id + '>');
			}

			//keyにテンプレート内の[[・・・]]の箇所を抽出して格納する．
			while(true){
				var si = line.indexOf('[[', index);
				var li = line.indexOf(']]', index);
				if (si >= 0 && li >= si){
					key.push(line.substring(si + '[['.length, li));
					index = li;
				} else {
					break;
				}
			}

			//テンプレート内の[[・・・]]の箇所をCSVから読み込んだデータで置換する
			var work = line;
			for (var j=0; j<key.length; j++){
				for (var k=0; k<header.length; k++){
					
					//#kozaki keyの特殊処理をするために，配列の入ったkeyといかの処理の用のtarget_keyに分ける
					var target_key = key[j];
					var noNeedSep = false; //セパレーター不要（データをそのまま出力する）際のフラグ 
					if(target_key.indexOf('+=')==0){
						target_key = target_key.substring('+='.length);
						noNeedSep = true;
					}
						
					if (header[k] == target_key){
						 // データを囲うセパレータを取得する
						var sep = get_separator(data[l][k], '[[' + target_key + ']]', work);
						var datum = data[l][k];

						if (sep[0] == '<'){
							// urlの場合は利用不可文字列をエスケープ
							datum =  replace_uri(datum);

							if (datum.indexOf('http') != 0 && datum.indexOf(':') >= 0){
								// namespaceの省略形を用いているのでsuffix/prefixは無し
								sep[0] = '';
								sep[1] = '';
							}
						} else {
							datum =  replace_literal(datum);
						}
						
						//データの置換処理
						if(noNeedSep){//セパレータ不要時の処理
							sep[0] = '';
							sep[1] = '';
							target_key = '+='+target_key;
						}
						var work_ = work.replaceAll('[[' + target_key + ']]' , sep[0] + datum + sep[1]);

						// データがヒットし、datumが空白、かつ、中間ノードを含まない場合はスキップ
						if (work_ != work && datum == '' &&
								(work.split('[').length == work.split(']').length)){
							work = '';
							break;
						}
						work = work_;

						break;
					}
				}
			}
			if (work != ''){
				content.push(work);
			}
		}
	}

	return n;
}
