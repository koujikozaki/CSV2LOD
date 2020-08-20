
/**
 * 名前空間情報 
 */
var namespace_data =
[
	{ "name" : "Schema.org", "short" : "schema" , "namespace" : "http://schema.org/" },
	{ "name" : "IPA共通語彙基盤", "short" : "ic" , "namespace" : "http://imi.go.jp/ns/core/rdf#" },
	{ "name" : "ダブリンコア(DC)", "short" : "dc" , "namespace" : "http://purl.org/dc/elements/1.1/" },
	{ "name" : "DCタームズ", "short" : "dcterms" , "namespace" : "http://purl.org/dc/terms/" },
	{ "name" : "FOAF", "short" : "foaf" , "namespace" : "http://xmlns.com/foaf/0.1/" },
	{ "name" : "SKOS", "short" : "skos" , "namespace" : "http://www.w3.org/2004/02/skos/core#" },
	{ "name" : "Geo vocabulary", "short" : "geo" , "namespace" : "http://www.w3.org/2003/01/geo/wgs84_pos#" }

];

var namespace_base =
[
	{ "short" : "owl" , "namespace" : "http://www.w3.org/2002/07/owl#" },
	{ "short" : "rdf" , "namespace" : "http://www.w3.org/1999/02/22-rdf-syntax-ns#" },
	{ "short" : "rdfs" , "namespace" : "http://www.w3.org/2000/01/rdf-schema#" },
	{ "short" : "xsd" , "namespace" : "http://www.w3.org/2001/XMLSchema" },
	{ "short" : "cc" , "namespace" : "http://creativecommons.org/ns#" }
];


var datatypes =
[
	{ "name" : "文字列（言語指定なし）", "datatype" : "ITEM"},
	{ "name" : "@ja 文字列（日本語）", "datatype" : "ITEM@ja"},
	{ "name" : "@en 文字列（英語）", "datatype" : "ITEM@en"},
	{ "name" : "文字列（xsd:string）", "datatype" : "ITEM^^xsd:string"},
	{ "name" : "整数", "datatype" : "ITEM^^xsd:integer"},
	{ "name" : "小数", "datatype" : "ITEM^^xsd:double"},
	{ "name" : "論理型", "datatype" : "ITEM^^xsd:boolean"},
	{ "name" : "IRI", "datatype" : "<ITEM>"}
];

/** テンプレート未入力の場合のデフォルト値 */
var template_default = 'http://data.lodosaka.jp';


var template_file;


$(window).load(function() {
	$('#property_vocab').html('');

	var contents = '';

	contents += '<tr >';
	contents += '<td ></td>';
	contents += '<td >Base Property</td>';
	contents += '<td >bp:</td>';
	contents += '<td ><input type="text" placeholder="http://data.lodosaka.jp"id="bp_name" ></td>';
	contents += '</tr>\n';

	for (var i=0; i<namespace_data.length; i++){
		var line = namespace_data[i];

		contents += '<tr >';
		contents += '<td ><input type="checkbox" name="template_prefix" value="' + line.short + ',' + line.namespace + '" checked></td>';
		contents += '<td >' + line.name + '</td>';
		contents += '<td >' + line.short + ':</td>';
		contents += '<td >' + line.namespace + '</td>';
		contents += '</tr>\n';
	}

	$('#property_vocab').html(contents);

	$('#template_make').click(function(event){
		template_make();
	});

	$('#property_select').click(function(event){
		if (csv_data != null){
			template_prev(csv_data.data); // TODO
		}
	});

	$('#template_download').click(function(event){
		writeToLocal(make_filename('template_', 'txt'), $('#rdf_template').val());
	});

	$('#template_file').change(function(event){
		if (!event.currentTarget.files.length){
			return;
		}
		template_file = event.currentTarget.files[0];
	});

	$('#template_read').click(function(event){
		var content = null;
		readFromLocal(template_file, function(str){
			$('#rdf_template').val(str);
		});
	});

});


function template_prev(data){
	$('#csv_property_table').html('');
	var lines = '';

	if (data == null || data.length == 0){
		return;
	}

	// ヘッダ
	var header = data[0];
	lines += '<tr>';
	lines += '<th>ID列</th><th>項目名</th><th>プロパティ名</th><th>データ型</th>';
	lines += '</tr>\n';

	for (i=0; i<header.length; i++){
		var line = header[i];
		var line_keys = [];

		for (var j=0; j<property_data.length; j++){
			if (!template_is_candidate(property_data[j].output)){
				// 選択されていないnamespaceは選択対象としない
				continue;
			}
			var keys = property_data[j].keywords;
			keys = keys.split(' ');
			for (var k=0; k<keys.length; k++){
				if (line.indexOf(keys[k]) >= 0){
					// hit
					line_keys.push(property_data[j]);
					break;
				}
			}
		}

		lines += '<tr>';
		lines += '<td rowspan="' + (line_keys.length + 2) + '"><input type="radio" name="id" value="'+header[i]+'"></td>';
		lines += '<td rowspan="' + (line_keys.length + 2) + '">' + util_txt2html(header[i]) + '</td>';
		// 一行目は項目名そのもの
		lines += '<td><input type="checkbox" name="template_prop_' + i + '" value="ID bp:' + header[i] + ' ITEM" checked>bp:' + line + '</td><td><select>';
//		lines += '<option value="ITEM@ja">@ja 文字列（日本語）</option>';
		for (var j=0; j<datatypes.length; j++){
			lines += '<option value="' + datatypes[j].datatype + '">' + datatypes[j].name + '</option>';
		}

		lines += '</select></td>';
		lines += '</tr>\n';

		for (var j=0; j<line_keys.length; j++){
			lines += '<tr>';
			lines += '<td><input type="checkbox" name="template_prop_' + i +'" value="' + line_keys[j].output + '">' + util_txt2html(line_keys[j].prop + '(' + line_keys[j].pname + ')') + '</td>';
			lines += '<td><select>';
			if (line_keys[j].datatype instanceof Array && line_keys[j].dtname instanceof Array){
				for (var k=0; k<line_keys[j].datatype.length; k++){
					lines += '<option value="' + line_keys[j].datatype[k] + '">' + util_txt2html(line_keys[j].dtname[k]) + '</option>';
				}
			} else {
				lines += '<option value="' + line_keys[j].datatype + '">' + util_txt2html(line_keys[j].dtname) + '</option>';
			}
			lines += '</select></td>';
			lines += '</tr>\n';
		}

		// 最終行はその他
		lines += '<tr>';
		lines += '<td><input type="checkbox" name="template_prop_' + i + '" value="ID ** ITEM">その他<input type="text"></td><td><select>';
		for (var j=0; j<datatypes.length; j++){
			lines += '<option value="' + datatypes[j].datatype + '">' + datatypes[j].name + '</option>';
		}
		lines += '</select></td>';
		lines += '</tr>\n';
	}
	lines += '<td><input type="radio" name="id" value="" checked></td><td colspan="3">ID自動付与</td></tr>\n';

	$('#csv_property_table').html(lines);
}

function template_is_candidate(prop){
	var output = prop;

	for (var i=0; i<namespace_base.length; i++){
		if (output.indexOf(' ' + namespace_base[i].short + ':') >= 0){
			return true;
		}
	}

	var prefixes = $('input[name = "template_prefix"]:checked');
	for (var i=0; i<prefixes.length; i++){
		var val = $(prefixes[i]).val();
		val = val.split(',');
		if (output.indexOf(' ' + val[0] + ':') >= 0){
			return true;
		}
	}
	return false;
}

function template_is_used(namespace, contents){
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

function template_get_value(i){
	var header = csv_data.data[0];
	var ret = [];
	var props = $('input[name = "template_prop_' + i +'"]');
	if (props.length == 0){
		return null;
	}

	props = $('input[name = "template_prop_' + i +'"]:checked');

	for (var j=0; j<props.length; j++){
		var prop = props[j];
		var format = $(prop).val();
		var type = $(prop).parent().next().children('select').val();
		var free_input = $(prop).next();
		// 最終行の自由入力
		if (free_input.length > 0){
			var free = $(free_input).val();
			format = format.replace('**', free);
		}

		type = type.trim().replace('ITEM', '[[' + header[i].trim() + ']]');
		ret.push(format.replace('ITEM', type));

//		ret.push(format.replace('ITEM', '[[' + header[i].trim() + ']]'+ type.trim()));
	}

	return ret;
}

function template_make(){
	if (csv_data == null || csv_data.data == null || csv_data.data.length < 1){
		alert('CSVファイルを読み込んでください');
		return;
	}

	var contents = '';


	contents += template_make_base();
//	header += template_make_prefix(contents);
	contents += template_make_license();
	contents += template_make_prefix();
	contents += template_make_contents();

	$('#rdf_template'). val(contents);

}

function template_make_base(){
	var contents = '';

//	contents += '##baseIRI=' +template + postfix + '\n';
	contents += '##baseIRI=' +get_base_iri() + '\n';


	return contents;
}

function get_base_iri(){
	var postfix = '/';
	if ($('input[name="template_base_pfx"]:checked').val() == 'file'){
		postfix = '#';
	}

	var template = $('#template_base').val().trim();
	if (template == ''){
		// テンプレート未入力の場合は"http:://data.lodosaka.jp/"とする
		template = template_default;

		if (csv_file != null){
			template += '/' + csv_file.name;
		}
	}
	return template + postfix;
}

function template_make_license(){
	var contents = '';

	var id = $('input[name="id"]:checked').val();

	if (id == null || id== ''){
		id = 'AUTO';
	} else {
		id = '[[' + id + ']]';
	}
	contents += '##ID=' + id +'\n';

	var credit = $('#license_credit').val();
	contents += '##cc:attributionName=' + credit +'\n';
	var license = '';
	if ($('input[name="license_type"]:checked').val() == 'cc'){
		license = $('#license_cc').val();
	} else {
		license = $('#license_name').val();
	}

	contents += '##cc:license=' + license +'\n';

	return contents;

}

function template_make_prefix(){
	var prefixes = $('input[name = "template_prefix"]:checked');
	var contents = '';

	// デフォルトprefix
/*
	contents += '@prefix owl: <http://www.w3.org/2002/07/owl#> .\n';
	contents += '@prefix rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#> .\n';
	contents += '@prefix rdfs: <http://www.w3.org/2000/01/rdf-schema#> .\n';
	contents += '@prefix xsd: <http://www.w3.org/2001/XMLSchema> .\n';
	contents += '@prefix cc:   <http://creativecommons.org/ns#> .\n';
*/
	// Base
	var bp_name = $('#bp_name').val().trim();
	if (bp_name == ''){
		bp_name = get_base_iri();
	}
	//#kozaki 2016/08/22
	if ($('input[name="template_base_pfx"]:checked').val() == 'file'){
		contents += '@prefix bp: <' + bp_name.replace('#','') + '/property/> . \n';
	}
	else{
		contents += '@prefix bp: <' + bp_name + 'property/> . \n';
	}
//	contents += '@prefix bp: <' + bp_name + '> . \n';

	// 固定分
	for (var i=0; i<namespace_base.length; i++){
//		if (template_is_used(namespace_base[i].short, content)){
//		if (template_is_candidate(namespace_base[i].short)){

			contents += '@prefix ' + namespace_base[i].short + ': <' + namespace_base[i].namespace + '> .\n';
//		}
	}

	// 選択分
	for (var i=0; i<prefixes.length; i++){
		var val = $(prefixes[i]).val();
		val = val.split(',');
//		if (template_is_candidate(val[0])){
//		if (template_is_used(val[0], content)){
			contents += '@prefix ' + val[0] + ': <' + val[1] + '> .\n';
//		}
	}

	// 自由入力分
	var free = $('#free_prefix').val();
	var frees = free.split("\n");
	for (var i=0; i<frees.length; i++){
		var line = frees[i];
		var elms = line.split(':');
		if (elms.length != 3){
			continue;
		}
		contents += '@prefix ' + elms[0].trim() + ': ' + elms[1].trim() + ":" + elms[2].trim() + ' .\n';
	}

	return contents;
}

function template_make_contents(){
	if (csv_data == null || csv_data.data == null || csv_data.data.length == 0){
		return;
	}

	var header = csv_data.data[0];

	var contents = '';

	var temps = [];

	contents += '##mapping-rules-start\n';

	for (var i=0; i<header.length ; i++){
		var props = $('input[name = "template_prop_' + i +'"]');
		if (props.length == 0){
			break;
		}

//		props = $('input[name = "template_prop_' + i +'"]:checked');

		var formats = template_get_value(i);
		for (var j=0; j<formats.length; j++){
			var format = formats[j];
			temps.push(format);
		}

	}
	contents += template_make_contents_(temps);

	contents += '##mapping-rules-end\n';

	return contents;
}

function template_make_contents_(templates){
	var props = {};
	var work = [];
	var ret = 'ID ';

	// まずは中間ノードを必要とするデータのpropertyを抽出
	for (var i=0; i<templates.length; i++){
		var template = templates[i];
		template = template.replace('ID ', ' ');

		if (template.indexOf('[') >= 0 && (template.indexOf('[') != template.indexOf('[['))){
			var temps = template.split(' ');
			if (temps.length >= 3){
				for (var j=1; j<temps.length; j++){
					var w = temps[j].trim();
					if (w != ''){
						if (props[w] == undefined){
							props[w] = [];
						}
						props[w].push(template);
						break;
					}
				}
				if (w == ''){
					work.push(template);
				}
			} else {
					work.push(template);
			}
		} else {
			work.push(template);
		}
	}

	for (var i=0; i<work.length; i++){
		ret += work[i] + ' ;\n';
	}

	for (var key in props){
		var elms = props[key];
		if (elms.length > 1){
			for (var j=0; j<elms.length; j++){
				var elm = elms[j];
				if (j != (elms.length-1)){
					elm = elm.substring(0, elm.lastIndexOf(']')) + ' ;\n';
				} else {
					elm += ' ;\n';
				}
				if (j != 0){
					var index = elm.indexOf('[') + 1;
					elm = elm.substring(index);
					for (var k=0; k<index; k++){
						elm = ' ' + elm;
					}
				}
				ret += elm;
			}
		} else {
			ret += elms[0] + ' ;\n';
		}
	}

	ret = ret.trim();
	if (ret == 'ID'){
		ret = '';
	} else {
		ret = ret.substring(0, ret.length - 1) + '.\n';
	}

	return ret;
}
