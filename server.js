var express = require("express");
var mysql = require('mysql');
var app = express();
var bodyParser = require('body-parser');
var expressJWT = require('express-jwt');
var jwt = require('jsonwebtoken');
var bcrypt = require('bcrypt');
var salt = bcrypt.genSaltSync(10);

var db_config = {
    host: 'eu-cdbr-west-01.cleardb.com',
    user: 'b7097498a52cf9',
    password: '418717e7',
    database: 'heroku_c8fc5906c0a0752'
};

var connection;

function handleDisconnect() {
    console.log('connecting to db');
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

app.use( bodyParser.json() );
app.use(bodyParser.urlencoded({
    extended: true
}));

app.use(expressJWT({ secret: 'zeersecret'}).unless({ path: ['/login', /^\/customers.*/]}));

app.post('/loginAuth', function (req, res) {
    var myToken = jwt.sign({ email: 'test'}, 'zeersecret');
    res.status(200).json(myToken);
});

app.get('/secret', function(request, response) {
    connection.query('SELECT * from secret', function(err, rows, fields) {
        if (err) {
            console.log('error: ', err);
            throw err;
        }
        response.send([rows]);
    });
});

app.get('/customers', function(request, response) {
    connection.query('SELECT * from customers', function(err, rows, fields) {
        if (err) {
            console.log('error: ', err);
            throw err;
        }
        response.send([rows]);
    });
});

app.get('/customers/:id?', function (req, res) {
    connection.query('select * from customers where id=?', [req.params.id], function (error, results, fields) {
        if (error) throw error;
        res.end(JSON.stringify(results));
    });
});

app.post('/customers', function (req, res) {
    var postData  = { email: req.body.email, password: bcrypt.hashSync(req.body.password, salt)};
    connection.query('INSERT INTO customers SET ?', postData, function (error, results, fields) {
        console.log(postData);
        if (error) throw error;
        res.end(JSON.stringify(results));
    });
});

app.post('/login', function (req, res) {
    connection.query('SELECT * FROM customers WHERE email =?', [req.body.email], function (error, results, fields) {
        if (error) {
            throw error;
        } else {
            if(results.length > 0){
                if( bcrypt.compareSync(req.body.password, results[0].password) ) {
                    res.sendStatus(200);
                } else {
                    res.sendStatus(401);
                }
            } else {
                res.sendStatus(401);
            }
        }
    });
});

app.put('/customers', function (req, res) {
    connection.query('UPDATE `customers` SET `email`=?,`password`=? where `id`=?', [req.body.email,req.body.password, req.body.id], function (error, results, fields) {
        if (error) throw error;
        res.end(JSON.stringify(results));
    });
});

app.delete('/customers', function (req, res) {
    console.log(req.body);
    connection.query('DELETE FROM `customers` WHERE `id`=?', [req.body.id], function (error, results, fields) {
        if (error) throw error;
        res.end('Deleted');
    });
});
var port = process.env.PORT || 9998;
app.listen(port, function() {
    console.log("Listening on " + port);
});
