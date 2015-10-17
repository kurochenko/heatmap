var MySQL = require('mysql-custom');

var config = {
	host: "timetables-cluster.cluster-c3wf97boae1g.eu-west-1.rds.amazonaws.com",
	user: "heatmap",
	password: "heatmap007",
	database: "heatmap"
};

var DB = new MySQL(config);

exports.handler = function(e, context) {

	console.log('Fetching data');
	DB.getData('lat, lng, population as count, size', 'population', 'population > 0', null, 'size', 'DESC', function(err, res) {
		if(err) throw err;
		console.log('Data readed', res.length);
		var out = [];

		for(var i in res) {
			var row = res[i];
			out.push(Object.keys(row).map(function(k) { return row[k] }));
		}
		context.succeed(out);
	});
	console.log('Fetching data bottom');
};
