

/*
 プロパティ推薦情報
*/
var property_data = 
[
	{  "prop" : "rdfs:label", "pname" : "ラベル", "datatype" : ["ITEM@ja", "ITEM@en"], "dtname" : ["文字列（日本語）", "文字列（英語）"], "keywords" : "名前 名称 名 label name", "output" : "ID rdfs:label ITEM",},
	{  "prop" : "rdfs:comment", "pname" : "ラベル", "datatype" : ["ITEM@ja", "ITEM@en"], "dtname" : ["文字列（日本語）", "文字列（英語）"], "keywords" : "説明 コメント 概要 comment", "output" : "ID rdfs:label ITEM",},
	{  "prop" : "rdfs:seeAlso", "pname" : "参考情報", "datatype" : "ITEM", "dtname" : "IRI", "keywords" : "参照 参考 参考情報 Web", "output" : "ID rdfs:seeAlso <ITEM>",},
	{  "prop" : "foaf:homepage", "pname" : "Webサイト", "datatype" : "ITEM", "dtname" : "IRI", "keywords" : "Web ページ サイト", "output" : "ID foaf:homepage <ITEM>",},
	{  "prop" : "schma:name",  "pname" : "名前",  "datatype" : "ITEM@ja",  "dtname" : "文字列（日本語）",  "keywords" : "名前 名称 名", "output" : "ID schma:name ITEM",},
	{  "prop" : "geo:lat",  "pname" : "緯度",  "datatype" : "ITEM^^xsd:double",  "dtname" : "小数（座標）",  "keywords" : "緯度 Y lat",  "output" : "ID geo:lat ITEM",  },
	{  "prop" : "ic:座標/ic:緯度",  "pname" : "緯度",  "datatype" : "ITEM^^xsd:float",  "dtname" : "小数（座標）",  "keywords" : "緯度 Y",  "output" : "ID  ic:座標 [ic:緯度  ITEM]",  },
	{  "prop" : "geo:long",  "pname" : "経度",  "datatype" : "ITEM^^xsd:double",  "dtname" : "小数（座標）",  "keywords" : "経度 X long",  "output" : "ID  geo:long ITEM",  },
	{  "prop" : "ic:座標/ic:経度",  "pname" : "経度",  "datatype" : "ITEM^^xsd:float",  "dtname" : "小数（座標）",  "keywords" : "経度 X",  "output" : "ID ic:座標 [ic:経度  ITEM]",  }


];
