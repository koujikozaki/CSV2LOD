

var licenses = 
[
	{'uri' : 'http://creativecommons.org/publicdomain/zero/1.0/deed.ja', 'name': 'PD(パブリック・ドメイン)'},
	{'uri' : 'http://creativecommons.org/licenses/by/4.0/deed.ja', 'name': 'CC-BY(表示)'},
	{'uri' : 'http://creativecommons.org/licenses/by-sa/4.0/deed.ja', 'name': 'CC-BY-SA(表示-継承)'},
	{'uri' : 'http://creativecommons.org/licenses/by-nd/4.0/deed.ja', 'name': 'CC-BY-ND(表示-改変禁止)'},
	{'uri' : 'http://creativecommons.org/licenses/by-nc/4.0/deed.ja', 'name': 'CC-BY-NC(表示-非営利)'},
	{'uri' : 'http://creativecommons.org/licenses/by-nc-sa/4.0/deed.ja', 'name': 'CC-BY-NC-SA(表示-非営利-継承)'},
	{'uri' : 'http://creativecommons.org/licenses/by-nc-nd/4.0/deed.ja', 'name': 'CC-BY-NC-ND(表示-非営利-改変禁止)'}
];

$(window).load(function() {
	var contents = '';

	for (var i=0; i<licenses.length; i++){
		var license = licenses[i];
		contents += '<option value="' + license.uri + '">' + license.name + '</option>';
	}

	$('#license_cc').html(contents);

});