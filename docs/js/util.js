
/*-------------------------
 textをhtmlで表示できる形式に変換する。
・urlエンコード
・改行コードをBRタグに変換

--------------------------*/
function util_txt2html(str){
	str = str.replace( /&/g , "&amp;" );
	str = str.replace( /</g , "&lt;" );
	str = str.replace( />/g , "&gt;" );
	str = str.replace( /\r\n|\r|\n/g , "<br>" );

	return str;

}


function make_filename(base, postfix){

	var date = new Date();
  var ret = base
    	+ date.getFullYear()
    	+ ('0' + (date.getMonth() + 1)).slice( -2 )
    	+ ('0' + (date.getDate())).slice( -2 )
    	+ ('0' + (date.getHours())).slice( -2 )
    	+ ('0' + (date.getMinutes())).slice( -2 ) + '.' + postfix;

	return ret;
}


function get_separator(word, key, template){
	if (key != null && template != null){
		var i = template.indexOf(key);
		if (i > 0){
			if (template[i-1] == '<'){
				// IRI
				return ['', ''];
			}
		}
	}

	if (word.indexOf('http') == 0 && template.indexOf('@') < 0){
		// 文字がhttp開始、テンプレートが「@」を含まない場合はIRI
		return ['<', '>'];
	}

	if (word.indexOf('\n') < 0){
		return ['"', '"'];
	}
	if (word.indexOf('"""') < 0){
		return ['"""', '"""'];
	}

	if (word.indexOf("'''") < 0){
		return ["'''", "'''"];
	}

		return ['"', '"']; // TODO

}

function replace_literal(word){
	// literalに利用するとおかしくなる文字をエスケープする
	word = word.replaceAll('"', '\\"');

	return word;
}


function replace_uri(word){
	// uriに利用できない文字をエスケープする
	word = word.replaceAll(' ', '%20');
	word = word.replaceAll('\n', '_');
	word = word.replaceAll('#', '_');
	word = word.replaceAll('<', '_');
	word = word.replaceAll('>', '_');
	word = word.replaceAll('"', '_');
	word = word.replaceAll('{', '_');
	word = word.replaceAll('}', '_');
	word = word.replaceAll('^', '_');
	word = word.replaceAll('|', '_');
	word = word.replaceAll('[', '_');
	word = word.replaceAll(']', '_');
	word = word.replaceAll('\'', '_');
	return word;
}