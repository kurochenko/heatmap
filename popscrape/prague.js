'use strict'

var colors = require('colors');
var request = require('request');
var async = require('async');
var cheerio = require('cheerio');
var MySQL = require('mysql-custom');
var stream = require('stream');
var config = {
	host: "timetables-cluster.cluster-c3wf97boae1g.eu-west-1.rds.amazonaws.com",
	user: "heatmap",
	password: "heatmap007",
	database: "heatmap"
};

var LIMIT = false;
var DB = new MySQL(config);


var Scraper = function() {
	var self = this;
	var entry = "https://cs.wikipedia.org/wiki/Seznam_katastr%C3%A1ln%C3%ADch_%C3%BAzem%C3%AD_Prahy_podle_po%C4%8Dtu_obyvatel";
	var entryBase = "https://cs.wikipedia.org";

	function ConvertDMSToDD(degrees, minutes, seconds, direction) {
	    var dd = degrees + minutes/60 + seconds/(60*60);

	    if (direction == "S" || direction == "W") {
	        dd = dd * -1;
	    } // Don't do anything for N or E
	    return dd;
	}

	this.importDbData = function(data, done) {
		
		DB.insert('population', data, function(err, res) {
			done(err, res);
		});
	};

	this.fetchDetail = function(info, done) {
		var link = entryBase + info.link;
		console.log(' >>> ', link);

		DB.get('id', 'population', 'link = ?', info.link, function(err, res) {
			if(err) throw err;

			if(res) return done(null, 1);


			request.get(link, function(err, html, body) {
				console.log(' << parsing', link);
				if(err) throw err;
				var $ = cheerio.load(body);
				$(".infobox tr").each(function(id, line) {
					var label = $(this).find('td:nth-child(1)').text();
					var value = $(this).find('td:nth-child(2)').text();
					
					// console.log(label, value);
					// console.log(label, value)
					if(label == 'obyvatel:' || label == 'počet obyvatel:') {
						var count = value.split('(')[0].replace(/[^0-9.]/g, "");
						count = Number(count);
						
						if(isNaN(count)) {
							console.log('Wrong info: '.red);
							console.log(info, count);
							return;
						}

						// console.log(value.split('(')[0]);
						info["population"] = count;
					}

					if(label == 'zeměpisné souřadnice:') {
						var l = value.replace(/[\n.sšvd ]/g, "").split(',');

						var lat = l[0].replace(/″/g, '').replace(/[°′]/g, '-').split('-');
						var lng = l[1].replace(/″/g, '').replace(/[°′]/g, '-').split('-');

						info["lat"] = Math.abs(ConvertDMSToDD(Number(lat[0]), Number(lat[1]), Number(lat[2]), 'N'));
						info["lng"] = Math.abs(ConvertDMSToDD(Number(lng[0]), Number(lng[1]), Number(lng[2]), 'E'));

						info["latLng"] = value;
					}

				});
	
				if(info["population"] || info["population"] == 0)
					self.importDbData(info, done);
				else
					done(null, 0);
					// console.log(info);
			});

		});
	};

	this.fetchDetails = function(list, done) {
		async.eachLimit(list, 5, self.fetchDetail, function(err) {
			throw err;
		});
	}

	this.processList = function(err, html, body) {
		if(err) throw err;

		var list = [];
		var $ = cheerio.load(body);
		var first = true;

		$(".wikitable tr").each(function(id, row) {
			if(first) {
				first = false;
				return;
			}
			
			var info = {
				name: $(this).find('td:nth-child(2) a').text(),
				link: $(this).find('td:nth-child(2) a').attr("href"),
				population: $(this).find('td:nth-child(3)').text().replace(/[^0-9]/g, ''),
				size:$(this).find('td:nth-child(5)').text() / 100,
			};

			list.push(info);
			// list.push(region.attribs.href);
		});


		self.fetchDetails(list);
	};

	// DB.delete('population', '1=1', function() {
	request.get(entry, self.processList);
	// });
}




var scr = new Scraper();