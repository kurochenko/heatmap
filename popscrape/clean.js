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
	database: "heatmap",
	connectionLimit: 1,
};

var LIMIT = false;
var DB = new MySQL(config);


var Cleaner = function() {
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

	this.updateDbData = function(data, done) {
		
		DB.update('population', data, 'id = ?', data.id, function(err, res) {
			done(err, res);
		});
	};

	this.fetchDetail = function(info, done) {
		var link = entryBase + info.link;

		console.log(' >>> ', link);
		// if(info["id"] !== 7053)
		// 	return done(null)

		request.get(link, function(err, html, body) {
			console.log(' << parsing', link);
			if(err) throw err;
			var $ = cheerio.load(body);
			// console.log(body);
			$(".infobox tr").each(function(id, line) {
				var label = $(this).find('td:nth-child(1)').text();
				var value = $(this).find('td:nth-child(2)').text();


				if(label == 'obyvatel:' || label == 'počet obyvatel:') {
					// console.log('FIRST: ', $(this).find('td:nth-child(2)').html().replace(/-.*/, ''));
					// console.log(value);
					if(value)
						value = $(this).find('td:nth-child(2)').html().replace(/-.*/, '').replace(/&[^&]*;/g, '').replace(/[a-zA-Z].*/, '').replace(/<sup.*<\/sup>/g, '');
					// console.log(value);

					var count = value.split('(')[0].replace(/[^0-9.]/g, "");
					count = Number(count);
					
					// console.log(count);
					if(isNaN(count)) {
						console.log('Wrong info: '.red);
						console.log(info, count);
						return;
					}

					// console.log(value.split('(')[0]);
					info["population"] = count;
				}

				if(label == 'zeměpisné souřadnice:' || label == "zeměp. souřadnice:") {
					var l = value.replace(/[\n.sšvd ]/g, "").split(',');
					var lat = l[0].replace(/″/g, '').replace(/[°′]/g, '-').split('-');
					var lng = l[1].replace(/″/g, '').replace(/[°′]/g, '-').split('-');

					info["lat"] = Math.abs(ConvertDMSToDD(Number(lat[0]), Number(lat[1]), Number(lat[2]), 'N'));
					info["lng"] = Math.abs(ConvertDMSToDD(Number(lng[0]), Number(lng[1]), Number(lng[2]), 'E'));

					info["latLng"] = value;
				}

			});
			
			// console.log(info);
			// return;

			console.log('saving: ', info);
			if(info["population"] || info["population"] == 0)
				self.updateDbData(info, done);
			else
				done(null, 0);
				// console.log(info);
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

			async.mapLimit(info, 4, self.fetchDetail, done);
		});
	};

	this.processList = function(err, list) {
		if(err) throw err;

		console.log("processing #", list.length);
		async.each(list, self.fetchDetail, function(err, res) {
			console.log(" === END === ");
			console.log("processed #", list.length);
		});
	};

	// DB.delete('population', '1=1', function() {
	DB.getData('*', 'population', 'population > 40000 ORDER BY population', self.processList);
	// });
}




var scr = new Cleaner();