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
	var entry = "https://cs.wikipedia.org/wiki/Kategorie:Seznamy_katastr%C3%A1ln%C3%ADch_%C3%BAzem%C3%AD";
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
				// console.log(body);
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

				// console.log(info);

				if(info["population"] || info["population"] == 0)
					self.importDbData(info, done);
				else
					done(null, 0);
					// console.log(info);
			});

		});
	};

	this.fetchDetailLink = function(link, done) {
		if(!link) return done(null);
		link = entryBase + link;

		console.log(' >> ', link);
		request.get(link, function(err, html, body) {
			if(err) throw err;
			var $ = cheerio.load(body);
			var info = [];

			var first = true;
			$(".wikitable tr").each(function(id, row) {
				if(first) {
					first = false;
					return;
				}	

				var name = $(this).find('td:nth-child(1)>a').text();
				var linkDetail = $(this).find('td:nth-child(1)>a').attr('href');
				var size = $(this).find('td:nth-child(4)').text();
				if(linkDetail) 
					info.push({link: linkDetail, size: size, name: name});
			});

			if(LIMIT)
				info = info.slice(0, LIMIT);

			async.mapLimit(info, 5, self.fetchDetail, done);
		});
	};

	this.fetchDetailLinks = function(list) {
		if(LIMIT)
			list = list.slice(0, LIMIT);

		console.log('Fetching details for #', list.length, 'items');
		async.mapLimit(list, 5, self.fetchDetailLink, function(err, res) {
			if(err) throw err;

			var merged = [].concat.apply([], res);

			console.log('END with', merged.length, 'data');
		});
	};

	this.processList = function(err, html, body) {
		if(err) throw err;

		var list = [];
		var $ = cheerio.load(body);

		$(".mw-category a").each(function(id, region) {
			list.push(region.attribs.href);
		});


		self.fetchDetailLinks(list);
	};

	// DB.delete('population', '1=1', function() {
	request.get(entry, self.processList);
	// });
}




var scr = new Scraper();