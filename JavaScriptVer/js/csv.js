
var csv_file;
var csv_data;

$(window).load(function() {

	$('#csv_file').change(function(event){
		if (!event.currentTarget.files.length){
			return;
		}
		csv_file = event.currentTarget.files[0];
	});


	$('#csv_read').click(function(event){
		var val = $('input[name="csv_file_type"]:checked').val();

		if (val == 'file' && csv_file != null){
			readFromLocal(csv_file, function(str){
				parse_csv(str);
			});
		} else if (val == 'text'){
				parse_csv($('#csv_textarea').val());
		}
			$('#property_select').removeAttr('disabled');

	});

	$('input[name="csv_file_type"]').change(function(event){
		var val = $('input[name="csv_file_type"]:checked').val();
		if (val == 'text'){
			$('#csv_textarea').slideDown(500);
		} else {
			$('#csv_textarea').slideUp(50);
		}
	});

	$('#csv_textarea').hide();


	function parse_csv(str){
		Papa.parse(str, {delimiter:",", header: false, encoding: "UTF-8", download:false, complete: function(results, file) {
			if (results.errors.length == 0){
				csv_data = results;
				csv_prev(csv_data.data);
			} else {
				// TODO errpr
			}
		}});
	}
});


function csv_prev(data){
	$('#csv_prev_table').html('');
	var lines = '';

	if (data == null || data.length == 0){
		return;
	}

	// ヘッダ
	lines += '<tr>';
	for (var i=0; i<data[0].length; i++){
		data[0][i] = data[0][i].trim(); // headerのBOM等のごみを削除// 
		lines += '<th>' + data[0][i] + '</th>';
	}	
	lines += '</tr>\n';
	var len = 5;
	if (data.length < len){
		len = data.length;
	}

	for (var i=1; i<len; i++){
		var line = data[i];
		lines += '<tr>';
		for (var j=0; j<line.length; j++){
			lines += '<td>' + util_txt2html(line[j]) + '</td>';
		}	
		lines += '</tr>\n';
	}
	$('#csv_prev_table').html(lines);

}

