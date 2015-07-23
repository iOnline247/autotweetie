var fs = require('fs');
var request = require('request');
var cheerio = require('cheerio');
var blogs = require('./utils/blogs');
var requestFrequencyMs = 2000;

function init() {
	request(url, function(error, response, html) {
		if(!error) {
			var $ = cheerio.load(html);

			console.log($('#BlogArchive1_ArchiveList').html());
		}

		setTimeout(init, requestFrequencyMs);
	});
}

init();

console.log('AutoTweetie initialized...');
