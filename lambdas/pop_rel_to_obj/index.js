var MySQL = require('mysql-custom');
var async = require('async');
var config = {
    host: "timetables-cluster.cluster-c3wf97boae1g.eu-west-1.rds.amazonaws.com",
    user: "heatmap",
    password: "heatmap007",
    database: "heatmap"
};
var DB = new MySQL(config);

console.log('Loading function');
function insertItem(event, context, dynamodb) {


    DB.getData('id, lat, lng, population as count, size', 'population', 'population > 0', null, 'size', 'DESC', function (err, res) {
        if (err)
            throw err;
        console.log('Data readed', res.length);
        var out = [];
        var params = {
            RequestItems: {
                "population": [
                ]
            }
        };
        var chunks = [];
        var chunkId = -1;
        for (var i in res) {


            var row = res[i];
            out.push(Object.keys(row).map(function (k) {
                return row[k]
            }));
            if (!((i) % 25)) {
                chunks[++chunkId] = [];
            }

            chunks[chunkId].push(
                    {
                        PutRequest: {
                            Item: {
                                "id": {"N": out[i][0] + ""},
                                "lat": {"N": out[i][1] + ""},
                                "lng": {"N": out[i][2] + ""},
                                "size": {"N": out[i][4] + ""},
                                "population": {"N": out[i][3] + ""},
                            }
                        }

                    }

            );
        }


        console.log("Length: ", chunks.length);
        async.eachLimit(chunks, 5, function (chunk, done) {
            var env = JSON.parse(JSON.stringify(params));
            env.RequestItems.population = chunk;

            dynamodb.batchWriteItem(params, function (err, data) {
                if (err)
                    console.log(JSON.stringify(err, null, 2));
                else {
                    //console.log(JSON.stringify(data, null, 2));
                    console.log("super");
                }

                done();
            });

        }, function (err, res) {

            if (err)
                throw err;
            console.log('Imported');

            context.succeed(out);
        });

    });
}


function deleteTable(event, context, dynamodb) {

    var params = {
        TableName: "population"
    };
    dynamodb.deleteTable(params, function (err, data) {
        if (err)
            console.log(JSON.stringify(err, null, 2));
        else
            console.log(JSON.stringify(data, null, 2));
        context.succeed();
    });
}

function createTable(event, context, dynamodb) {
    var params = {
        TableName: "population",
        KeySchema: [
            {AttributeName: "id", KeyType: "HASH", }
        ],
        AttributeDefinitions: [
            {AttributeName: "id", AttributeType: "N"}
        ],
        ProvisionedThroughput: {
            ReadCapacityUnits: 10,
            WriteCapacityUnits: 5
        }
    };
    dynamodb.createTable(params, function (err, data) {


        if (err)
            console.log(JSON.stringify(err, null, 2));
        else
            console.log(JSON.stringify(data, null, 2));
        context.succeed();
    });
}


exports.handler = function (event, context) {
    var config = {
        accessKeyId: '',
        secretAccessKey: ''
    };
    
    var aws = require('aws-sdk');
    var dynamodb = new aws.DynamoDB();
    //createTable(event, context, dynamodb);
    insertItem(event, context, dynamodb);
    //deleteTable(event, context, dynamodb);


};