var mysql = require('mysql');

var config = {
	host: "##",
	user: "##",
	password: "##",
	database: "##"
};


exports.handler = function(e, context) {

	var connection = mysql.createConnection(config);

	connection.connect(function(err) {
		if (err) {
			console.error('error connecting: ' + err.stack);
			return;
		}

		bllat = e.bl.lat
		bllon = e.bl.lon

		trlat = e.tr.lat
		trlon = e.tr.lon

		var params = [trlat, bllat, trlon, bllon]

		var q = 'SELECT * FROM stops_aggregated  WHERE (stop_lat <= ? AND stop_lat >= ?) AND (stop_lon <= ? AND stop_lat >= ?)'
		var res = []
		connection.query(q, params, function (error, results, fields) {
			for (var i = 0; i < results.length; i++) {
				res.push({
					id: results[i]['stop_id'],
					name: results[i]['stop_name'],
					lat: results[i]['stop_lat'],
					lon: results[i]['stop_lon'],
					arrivalCnt: results[i]['arrivalCnt']
				})
			}

			context.done(null, res.map(function(row){ return [row.lat, row.lon, row.arrivalCnt]}));
		});

		connection.end(function(err) {
			console.log('Disconnected from DB')
		});
	});
};

// exports.handler({
// 	bl: {
// 		lat: 50,
// 		lon: 14.2
// 	},
// 	tr: {
// 		lat: 50.1,
// 		lon: 14.6
// 	}
// }, null)
// {"bl":{"lat": 50,"lon": 14.2},"tr": {"lat": 50.1,"lon": 14.6}}