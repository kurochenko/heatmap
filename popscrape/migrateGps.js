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

function ConvertDMSToDD(degrees, minutes, seconds, direction) {
    var dd = degrees + minutes/60 + seconds/(60*60);

    if (direction == "S" || direction == "W") {
        dd = dd * -1;
    } // Don't do anything for N or E
    return dd;
}

DB.getData('latLng, id', 'population', 'latLng IS NOT NULL ', null, 'id', 'asc', function(err, res) {

	async.each(res, function(row, done) {
		console.log('Updating row ', row['id']);
		var info = {};
		var l = row["latLng"].replace(/[\n.sšvd ]/g, "").split(',');

		// console.log(row["latLng"], l);

		var lat = l[0].replace(/″/g, '').replace(/[°′]/g, '-').split('-');
		var lng = l[1].replace(/″/g, '').replace(/[°′]/g, '-').split('-');
			

		info["lat"] = Math.abs(ConvertDMSToDD(Number(lat[0]), Number(lat[1]), Number(lat[2]), 'N'));
		info["lng"] = Math.abs(ConvertDMSToDD(Number(lng[0]), Number(lng[1]), Number(lng[2]), 'E'));

		DB.update('population', info, 'id = ?', row['id'], done);
	}, function(err, res) {

		console.log(err, res);
	});
});