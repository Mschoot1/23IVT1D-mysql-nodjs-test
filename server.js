var express = require("express");
var mysql = require('mysql');
var app = express();

var db_config = {
    host: 'eu-cdbr-west-01.cleardb.com',
    user: 'b7097498a52cf9',
    password: '418717e7',
    database: 'heroku_c8fc5906c0a0752'
};

var connection;

function handleDisconnect() {
    console.log('1. connecting to db:');
    connection = mysql.createConnection(db_config);

    connection.connect(function(err) {
        if (err) {
            console.log('2. error when connecting to db:', err);
            setTimeout(handleDisconnect, 1000);
        }
    });
    connection.on('error', function(err) {
        console.log('3. db error', err);
        if (err.code === 'PROTOCOL_CONNECTION_LOST') {
            handleDisconnect();
        } else {
            throw err;
        }
    });
}

handleDisconnect();

app.get('/login', function(request, response) {
    connection.query('SELECT * from customers', function(err, rows, fields) {
        if (err) {
            console.log('error: ', err);
            throw err;
        }
        response.send([rows]);
    });
});

var port = process.env.PORT || 9999;
app.listen(port, function() {
    console.log("Listening on " + port);
});
