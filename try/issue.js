var readability = require('../lib/readability'),
	request = require('request');
var url = "http://sondages.blog.lemonde.fr/2012/05/02/les-debats-televises-de-lentre-deux-tours-ont-peu-deffet/";
var url2 = "http://www.lexpress.fr/actualite/politique/qu-attendez-vous-du-debat-presidentiel_1110261.html";
var ignoreWords = [
	"strong",
	"avait", 
	"entre", 
	"faire", 
	"cisif", 
	"celui"
];

function isIgnored(mot) {
	for (var i = 0; i < ignoreWords.length; i++) {
		if(ignoreWords[i] == mot) {
			return true;
		}
	};
	return false;
}
function tab_ref(tab) {
	tableau = [];
	for(var i = 0; i < tab.length; i++) {
		var mot = tab[i].toLowerCase().trim();
		if(!(mot in tableau)) {
			tableau[mot] = {occurence:0};
		}
		tableau[mot].occurence = tableau[mot].occurence + 1;
	};
	for(var i = 0; i < tab.length; i++) {
		if(tableau[mot].occurence <= 1) {
			delete tableau[mot];
		}
	};
	retour = [];
	retour[0] = tableau;
	retour[1] = tab;
	return retour;
}

request({url:url, 'encoding':'binary'}, function (error, response, html) {
	var encoding;
	if(response['headers']['content-type']) {
		var content_type = response['headers']['content-type'].split('=');
		if(content_type.length == 2) encoding = content_type[1].toUpperCase();
	}
  if (!error && response.statusCode == 200) {
    readability.parse(html, url, {encoding:encoding}, function(result) {
    	//console.log(result.title, result.content);
    	var natural = require('natural'),
  		tokenizer = new natural.WordTokenizer();
  		var reference_1 = tab_ref(tokenizer.tokenize(result.content));
  		suite(reference_1[0],reference_1[1]);
	});
  }
});

function suite(mots, keys) {
	var enCommun = [];
	var totalEnCommun = 0;
request({url:url2, 'encoding':'binary'}, function (error, response, html) {
		var encoding;
  		if(response['headers']['content-type']) {
  			var content_type = response['headers']['content-type'].split('=');
  			if(content_type.length == 2) encoding = content_type[1].toUpperCase();
  		}
  	 	if (!error && response.statusCode == 200) {
  	 	  	readability.parse(html, url, {encoding:encoding}, function(result) {
  	 	  		//console.log(result.title, result.content);
  	 	  		var natural = require('natural'),
  	 			tokenizer = new natural.WordTokenizer();
  	 			var reference_2 = tab_ref(tokenizer.tokenize(result.content));
  	 			var mots2 = reference_2[0];
  	 			var keys2 = reference_2[1];
  	 			for(var i = 0; i < keys2.length; i++) {
  	 				var mot2 = keys2[i].toLowerCase().trim();
  	 				for (var j = 0; j < keys.length; j++) {
  	 					var mot = keys[j].toLowerCase().trim();
  	 					if(mot == mot2 && mot.length > 4) {
  	 						var score = natural.JaroWinklerDistance(mot, mot2);
  	 						if(isIgnored(mot) || mot in enCommun) {
  	 						} else {
  	 							var occurence = 0;/* = score;*/
  	 							if(mot in mots) {
  	 								occurence += mots[mot].occurence;
  	 							}
  	 							if(mot2 in mots2) {
  	 								occurence += mots2[mot2].occurence;
  	 							}
  	 							enCommun[mot] = occurence;
  	 							totalEnCommun+=occurence;
  	 						}
  	 					} else if(mot.length > 4) {
  	 						var score = natural.JaroWinklerDistance(mot, mot2);
  	 						if(score >= 0.999) {
  	 							//console.log(mot + '!=' + mot2 + '   (' + score + ')');
  	 							if(isIgnored(mot) || mot in enCommun) {
  	 							
  	 							} else {
  	 								var occurence = 0;/* = score;*/
  	 								if(mot in mots) {
  	 									occurence += mots[mot].occurence;
  	 								}
  	 								if(mot2 in mots2) {
  	 									occurence += mots2[mot2].occurence;
  	 								}
  	 								enCommun[mot] = occurence;
  	 								totalEnCommun+=occurence;
  	 							}
  	 						}
  	 					}
  	 				};
  	 			};
  	 			var nb_mots = ((mots2.length + mot.length) / 4);
  	 			var mots_sim = totalEnCommun;
  	 			console.log(mots2.length);
  	 			console.log(mot.length);
  	 			console.log((mots_sim * 100) / nb_mots);
  			});
  	 	}
});
}