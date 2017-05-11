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
    database: 'heroku_c8fc5906c0a0752',
    multipleStatements: true
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

app.use(expressJWT({ secret: 'zeersecret'}).unless({ path: ['/allergie', '/topup', '/register', '/login', /^\/customers.*/, /^\/balance.*/, /^\/product.*/, /^\/current_order.*/, /^\/order.*/]}));

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

app.get('/allergie', function(request, response) {
    response.writeHead(200,{'Content-Type':'text/json'});

    var allergie1 = {
        allergieimage:"eggs_icon",
        allergieinformatie:"this product contains eggs."
    };

    var allergie2 = {
        allergieimage:"celery_icon",
        allergieinformatie:"This product contains celery."
    };

    var allergie3 = {
        allergieimage:"fish_icon",
        allergieinformatie:"This product contains fish."
    };

    var allergie4 = {
        allergieimage:"milk_icon",
        allergieinformatie:"This product contains milk"
    };

    var allergieenArray=[allergie1,allergie2,allergie3,allergie4];

    var json = JSON.stringify(allergieenArray);

    response.end(json);
});

app.get('/orders/:user', function(request, response) {
    connection.query('SELECT * FROM orders WHERE customer_id=? ORDER BY status, id DESC', [request.params.user], function(err, results, fields) {
        if (err) {
            console.log('error: ', err);
            throw err;
        }
        response.end(JSON.stringify({"results": results}));
    });
});

app.get('/order/:id', function(request, response) {
    connection.query('SELECT * FROM orders WHERE id=?', [request.params.id], function(err, results, fields) {
        if (err) {
            console.log('error: ', err);
            throw err;
        }
        response.end(JSON.stringify({"results": results}));
    });
});

app.get('/products/:user', function(request, response) {
    connection.query('SELECT product_orders.product_id AS id, product_orders.quantity, products.name, products.price, products.size, products.alcohol, products.category_id, product_category.name as category_name FROM orders JOIN product_orders ON (product_orders.order_id = orders.id) JOIN products ON products.id = product_orders.product_id JOIN product_category ON product_category.id = products.category_id WHERE orders.status = 0 UNION SELECT products.id, 0 AS quantity, products.name, products.price, products.size, products.alcohol, products.category_id, product_category.name as category_name FROM products JOIN product_category ON product_category.id = products.category_id WHERE products.id NOT IN (SELECT product_orders.product_id FROM orders JOIN product_orders ON (product_orders.order_id = orders.id) JOIN products ON products.id = product_orders.product_id WHERE orders.status = 0)', [request.params.user], function(err, results, fields) {
        if (err) {
            console.log('error: ', err);
            throw err;
        }
        response.end(JSON.stringify({"results": results}));
    });
});

app.get('/products/order/:id', function(request, response) {
    connection.query('SELECT products.*, product_category.name as category_name, product_orders.* FROM orders INNER JOIN product_orders ON product_orders.order_id=orders.id LEFT JOIN products ON products.id=product_orders.product_id LEFT JOIN product_category ON products.category_id=product_category.id WHERE orders.id = ? ORDER BY products.category_id, products.id', [request.params.id], function(err, results, fields) {
        if (err) {
            console.log('error: ', err);
            throw err;
        }
        response.end(JSON.stringify({"results": results}));
    });
});

app.get('/order/current/:user', function(request, response) {
    connection.query('SELECT * FROM orders WHERE status=0 AND customer_id=?', [request.params.user], function(err, results, fields) {
        if (err) {
            console.log('error: ', err);
            throw err;
        }
        response.end(JSON.stringify({"results": results}));
    });
});

app.put('/product/quantity/edit', function(request, response) {
    connection.query('UPDATE `product_orders` SET `quantity`=? WHERE `product_id`=? AND customer_id=? AND order_id = ?', [request.body.quantity, request.body.product_id, request.body.customer_id, request.body.order_id], function(err, results, fields) {
        if (err) {
            console.log('error: ', err);
            throw err;
        }
        response.end(JSON.stringify({"results": results}));
    });
});

app.delete('/product/quantity/delete', function(request, response) {
    connection.query('DELETE FROM `product_orders` WHERE `product_id`=? AND customer_id=? AND order_id = ?', [request.body.product_id, request.body.customer_id, request.body.order_id], function(err, results, fields) {
        if (err) {
            console.log('error: ', err);
            throw err;
        }
        response.end(JSON.stringify({"results": results}));
    });
});

app.post('/product/quantity/add', function (request, res) {
    var postData  = { order_id: request.body.order_id, product_id: request.body.product_id, customer_id: request.body.customer_id, quantity: request.body.quantity};
    connection.query('INSERT INTO product_orders SET ?', postData, function (error, results, fields) {
        console.log(postData);
        if (error) throw error;
        res.end(JSON.stringify(results));
    });
});

app.get('/customers', function(request, response) {
    connection.query('SELECT * from customers', function(err, results, fields) {
        if (err) {
            console.log('error: ', err);
            throw err;
        }
        response.end(JSON.stringify({"results": results}));
    });
});

app.get('/balance/:user', function(request, response) {
    connection.query('SELECT balance from customers WHERE id=?', [request.params.user], function(err, results, fields) {
        if (err) {
            console.log('error: ', err);
            throw err;
        }
        response.end(JSON.stringify(results));
    });
});

app.get('/customers/:id?', function (req, res) {
    connection.query('select * from customers where id=?', [req.params.id], function (error, results, fields) {
        if (error) throw error;
        res.end(JSON.stringify(results));
    });
});

app.post('/register', function (req, res) {
    var postData  = { email: req.body.email, password: bcrypt.hashSync(req.body.password, salt)};
    connection.query('INSERT INTO customers SET ?', postData, function (error, results, fields) {
        console.log(postData);
        if (error) throw error;
        res.end(JSON.stringify(results));
    });
});

app.post('/topup', function (req, res) {
    var postData  = { credit: req.body.credit, customer_id: req.body.customer_id, type: req.body.type };
    connection.query('INSERT INTO balance_history SET `credit`=?, `type`=?,`customer_id`=?;UPDATE `customers` SET `balance`= `balance` + ? WHERE `id`=?', [req.body.credit, req.body.type, req.body.customer_id, req.body.credit, req.body.customer_id], function (error, results, fields) {
        if (error){
            throw error;
        } else {
            res.end(JSON.stringify(results));
        }
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
