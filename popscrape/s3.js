var fs = require('fs');
var stream = require('stream');
var unzip = require('unzip2')
var AWS = require('aws-sdk');
var util = require('util');
var async = require('async');

var config = {
	"region": "eu-west-1",
	"bucket": "heatgtfs",
	"keys": {
		"accessKeyId": "AKIAJEDHBPQPA46SRU5Q",
		"secretAccessKey": "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"
	}
}

AWS.config.update(config.keys);
AWS.config.update({region: config.region});
var s3 = new AWS.S3({params: {Bucket: config.bucket}});


function saveS3(entry) {
	console.log('Saving')
	console.log(entry)
}

exports.handler = function(event, context) {

	console.log("Reading options from event:", util.inspect(event, {depth: 5}));


	// var srcBucket = event.Records[0].s3.bucket.name;
	// var srcKey = decodeURIComponent(event.Records[0].s3.object.key.replace(/\+/g, " "));

	var srcBucket = config.bucket;
	var srcKey = 'unzip.zip';

	// console.log(srcBucket)
	// console.log(srcKey)

	async.waterfall([
		function download(next) {
			next(null, s3.getObject({
				Key: srcKey
			}).createReadStream());
		},
		function unzipFile(response, next) {
			// console.log(response)
			console.log('Saving');

			var str = fs.createWriteStream('./test.zip');
			response.pipe(str);
			str.on('error', console.log);
			

			// response.pipe(unzip.Parse())
			// 	.on('entry', saveS3)
			// 	.on('finish', next)
			   // .on('finish', next);

			// response.pipe(unzip.Extract({
			// 	path: '/Users/kurochenko/tmp/hmap/out/'
			// }));
		},
		function upload(xyz, next) {
			// console.log(xyz)
			next()
		}
		// ,
		// function upload() {
		// 	s3.putObject({
		// 		Bucket: srcBucket,
		// 		Key: dstKey,
		// 		Body: data,
		// 		ContentType: contentType
		// 	},
		// 	next);
		// }
	], function (err) {
			if (err) {
				// console.error(err);
			} else {
				// console.log('ok');
			}

			// context.done();
		}
	)
}

exports.handler()