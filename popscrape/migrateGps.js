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


DB.getData('*', 'population', '1=1', null, 'id', 'asc', 2, function(err, res) {
	for(var i in res) {
		var row = res[i];

		var l = row["latLng"].replace(/[.,sšvd ]/g, "").split('″');
		console.log(l);


		continue;
		var lat = l[0].split(' ')[0].replace(/[°′″]/g, '-').split('-');
		var lng = l[1].split(' ')[1].replace(/[°′″]/g, '-').split('-');

		info["lat"] = ConvertDMSToDD(Number(lat[0]), Number(lat[1]), Number(lat[2]), 'N');
		info["lng"] = ConvertDMSToDD(Number(lng[0]), Number(lng[1]), Number(lng[2]), 'W');
		info["latLng"] = value;
	}

});