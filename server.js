var express = require("express");
var mysql = require('mysql');
var app = express();
var bodyParser = require('body-parser');
var expressJWT = require('express-jwt');
var jwt = require('jsonwebtoken');
var bcrypt = require('bcrypt');
var salt = bcrypt.genSaltSync(10);
var _ = require('lodash');

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

app.use( bodyParser.json({
    limit: '50mb'
}) );
app.use(bodyParser.urlencoded({
    extended: true,
    limit: '50mb'
}));

app.use(express.static('public'));

app.use(expressJWT({ secret: 'zeersecret'}).unless({ path: ['/loginAuth', '/loginRegister', /^\/order.*/, /^\/register.*/, /^\/product.*/, /^\/account.*/, /^\/customer.*/]}));

app.get('/secret', function(request, response) {
    connection.query('SELECT * from secret', function(err, results, fields) {
        if (err) {
            console.log('error: ', err);
            throw err;
        }
        response.send(JSON.stringify({"results": results}));
    });
});

app.get('/secret2', function(request, response) {
    connection.query('SELECT * from secret', function(err, results, fields) {
        if (err) {
            console.log('error: ', err);
            throw err;
        }
        response.send(JSON.stringify({"results": results}));
    });
});

app.get('/product/allergies', function(request, response) {
    connection.query('SELECT * FROM allergies', function(err, results, fields) {
        if (err) {
            console.log('error: ', err);
            throw err;
        }
        response.end(JSON.stringify({"results": results}));
    });
});

app.get('/orders/:user', function(request, response) {
    connection.query('SELECT * FROM orders WHERE customer_id=? AND `status` =1 ORDER BY timestamp DESC', [request.params.user], function(err, results, fields) {
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

app.get('/orderl/', function(request, response) {

    response.end(Buffer.from("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", 'base64'));
});

app.get('/products/:user/category/:category', function(request, response) {
    connection.query('(SELECT product_orders.product_id AS id, product_orders.quantity, products.name, products.price, products.size, products.alcohol, products.category_id as category_id, product_category.name as category_name FROM orders JOIN product_orders ON (product_orders.order_id = orders.id) JOIN products ON products.id = product_orders.product_id JOIN product_category ON product_category.id = products.category_id AND products.category_id = ? WHERE orders.status = 0 AND orders.customer_id = ? ORDER BY category_id ) UNION ( SELECT products.id, 0 AS quantity, products.name, products.price, products.size, products.alcohol, products.category_id, product_category.name as category_name FROM products JOIN product_category ON product_category.id = products.category_id AND products.category_id = ? WHERE products.id NOT IN ( SELECT product_orders.product_id FROM orders JOIN product_orders ON (product_orders.order_id = orders.id) JOIN products ON products.id = product_orders.product_id WHERE orders.status = 0 AND orders.customer_id = ? ) ) ORDER BY category_id, id', [request.params.category, request.params.user, request.params.category, request.params.user, ], function(err, results, fields) {
        if (err) {
            console.log('error: ', err);
            throw err;
        }
        response.end(JSON.stringify({"results": results}));
    });
});

app.get('/products/:user', function(request, response) {
    function mergeByProductId(arr) {
        return _(arr)
            .groupBy(function(item) {
                return item.id;
            })
            .map(function(group) {
                return _.mergeWith.apply(_, [{}].concat(group, function(obj, src) {

                    if (Array.isArray(obj)) {
                        return obj.concat(src);
                    }
                }))
            })
            .orderBy(['category_id'], ['asc'])
            .values()
            .value();
    }
    connection.query({sql: '(SELECT product_orders.product_id AS id, product_orders.quantity, products.name, products.price, products.size, products.alcohol, products.image as products_image, products.category_id as category_id, product_category.name as category_name, allergies.description, allergies.image FROM orders JOIN product_orders ON (product_orders.order_id = orders.id) JOIN products ON products.id = product_orders.product_id JOIN product_category ON product_category.id = products.category_id LEFT JOIN product_allergy ON product_allergy.product_id=products.id LEFT JOIN allergies ON allergies.id=product_allergy.allergy_id WHERE orders.status = 0 AND orders.customer_id = ? ORDER BY products.category_id ) UNION (SELECT products.id, 0 AS quantity, products.name, products.price, products.size, products.alcohol, products.image as products_image, products.category_id, product_category.name as category_name, allergies.description, allergies.image FROM products JOIN product_category ON product_category.id = products.category_id LEFT JOIN product_allergy ON product_allergy.product_id=products.id LEFT JOIN allergies ON allergies.id=product_allergy.allergy_id WHERE products.id NOT IN (SELECT product_orders.product_id FROM orders JOIN product_orders ON (product_orders.order_id = orders.id) JOIN products ON products.id = product_orders.product_id WHERE orders.status = 0 AND orders.customer_id = ?) ) ORDER BY category_id, id', nestTables: true }, [request.params.user, request.params.user], function(err, results, fields) {
        if (err) {
            console.log('error: ', err);
            throw err;
        }
        results.forEach(function(row) {

            row.id = row[''].id;
            row.name = row[''].name;
            row.price = row[''].price;
            row.size = row[''].size;
            row.product_image = row[''].products_image;
            row.alcohol = row[''].alcohol;
            row.category_id = row[''].category_id;
            row.category_name = row[''].category_name;
            row.quantity = row[''].quantity;
            row.allergies = [].concat({ description: row[''].description, image: row[''].image });

            delete row[''];
        });

        response.end(JSON.stringify({"results": mergeByProductId(results)}));
    });
});

app.post('/order/pay', function (req, res) {
    connection.query('INSERT INTO balance_history SET `credit`=?,`customer_id`=?;UPDATE `customers` SET `balance`= `balance` - ? WHERE `id`=?;INSERT INTO `register_history` SET `order_id`=?, `customer_id`=?, `register_id`=?', [req.body.credit, req.body.customer_id, req.body.credit, req.body.customer_id, req.body.order_id, req.body.customer_id, req.body.register_id], function (error, results, fields) {
        if (error){
            throw error;
        } else {
            res.end(JSON.stringify(results) );
        }
    });
});

app.get('/products', function(request, response) {
    function mergeByProductId(arr) {
        return _(arr)
            .groupBy(function(item) {
                return item.id;
            })
            .map(function(group) {
                return _.mergeWith.apply(_, [{}].concat(group, function(obj, src) {

                    if (Array.isArray(obj)) {
                        return obj.concat(src);
                    }
                }))
            })
            .orderBy(['category_id'], ['asc'])
            .values()
            .value();
    }
    connection.query({sql: 'SELECT products.*, product_category.name as category_name, allergies.description, allergies.image FROM products LEFT JOIN product_category ON product_category.id = products.category_id LEFT JOIN product_allergy ON product_allergy.product_id=products.id LEFT JOIN allergies ON allergies.id=product_allergy.allergy_id ORDER BY products.category_id, products.id', nestTables: true }, function(err, results, fields) {
        if (err) {
            console.log('error: ', err);
            throw err;
        }
        results.forEach(function(row) {

            row.id = row['products'].id;
            row.name = row['products'].name;
            row.product_image = row['products'].image;
            row.price = row['products'].price;
            row.size = row['products'].size;
            row.alcohol = row['products'].alcohol;
            row.category_name = row['product_category'].category_name;
            row.category_id = row['products'].category_id;
            row.allergies = [].concat({ description: row['allergies'].description, image: row['allergies'].image });

            delete row['products'];
            delete row['product_category'];
        });

        response.end(JSON.stringify({"results": mergeByProductId(results)}));
    });
});

app.get('/products/order/:id', function(request, response) {
    function mergeByProductId(arr) {
        return _(arr)
            .groupBy(function(item) {
                return item.product_id;
            })
            .map(function(group) {
                return _.mergeWith.apply(_, [{}].concat(group, function(obj, src) {

                    if (Array.isArray(obj)) {
                        return obj.concat(src);
                    }
                }))
            })
            .orderBy(['category_id'], ['asc'])
            .values()
            .value();
    }
    connection.query({sql: 'SELECT products.*, product_category.name as category_name, product_orders.*, allergies.description, allergies.image FROM orders INNER JOIN product_orders ON product_orders.order_id=orders.id LEFT JOIN products ON products.id=product_orders.product_id LEFT JOIN product_category ON products.category_id=product_category.id LEFT JOIN product_allergy ON product_allergy.product_id=products.id LEFT JOIN allergies ON allergies.id=product_allergy.allergy_id WHERE orders.id = ? ORDER BY products.category_id, products.id', nestTables: true }, [request.params.id], function(err, results, fields) {
        if (err) {
            console.log('error: ', err);
            throw err;
        }
        results.forEach(function(row) {

            row.id = row['product_orders'].id;
            row.name = row['products'].name;
            row.product_image = row['products'].image;
            row.price = row['products'].price;
            row.size = row['products'].size;
            row.alcohol = row['products'].alcohol;
            row.category_id = row['products'].category_id;
            row.category_name = row['product_category'].category_name;
            row.order_id = row['product_orders'].order_id;
            row.product_id = row['product_orders'].product_id;
            row.customer_id = row['product_orders'].customer_id;
            row.quantity = row['product_orders'].quantity;
            row.timestamp = row['product_orders'].timestamp;
            row.allergies = [].concat(row['allergies']);

            delete row['product_orders'];
            delete row['products'];
            delete row['product_category'];
        });

        response.end(JSON.stringify({"results": mergeByProductId(results)}));
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

app.put('/order/price/edit', function(request, response) {
    connection.query('UPDATE `orders` SET `price_total`=? WHERE `id`=?', [request.body.price_total, request.body.order_id], function(err, results, fields) {
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

app.put('/product/edit', function(request, response) {
    var allergies = request.body.allergies.split(',');
    var allergy_values = allergies.map(function(allergy){return "('"+ request.body.product_id +"', (SELECT id FROM allergies WHERE description = '"+ allergy +"'))"}).join(',');
    connection.query('DELETE FROM `product_allergy` WHERE `product_id`=?;UPDATE `products` SET `name`=?, `price`=?, `size`=?, `alcohol`=?, `category_id`=(SELECT id FROM product_category WHERE product_category.name = ?), `image`=? WHERE `id`=?;INSERT INTO product_allergy (product_id, allergy_id) VALUES ' + allergy_values, [request.body.product_id, request.body.name, request.body.price, request.body.size, request.body.alcohol, request.body.category_name, request.body.image, request.body.product_id], function(err, results, fields) {
        if (err) {
            console.log('error: ', err);
            throw err;
        }
        response.end(JSON.stringify({"results": results}));
    });
});

app.delete('/product/delete', function(request, response) {
    connection.query('DELETE FROM `product_allergy` WHERE `product_id`=?;DELETE FROM `products` WHERE `id`=?', [request.body.product_id, request.body.product_id], function(err, results, fields) {
        if (err) {
            console.log('error: ', err);
            throw err;
        }
        response.end(JSON.stringify({"results": results}));
    });
});

app.post('/product/add', function (request, res) {
    var allergies = request.body.allergies.split(',');
    var product_name = request.body.name;
    connection.query('INSERT INTO products SET `name`=?, `price`=?, `size`=?, `alcohol`=?, `category_id`=(SELECT id FROM product_category WHERE product_category.name = ?), `image`=?;INSERT INTO product_allergy (product_id, allergy_id) VALUES ' + allergies.map(function(allergy){return "((SELECT id FROM products WHERE name = '"+ product_name +"'), (SELECT id FROM allergies WHERE description = '"+ allergy +"'))"}).join(','), [request.body.name, request.body.price, request.body.size, request.body.alcohol, request.body.category_name, request.body.image], function (error, results, fields) {
        if (error) throw error;
        res.end(JSON.stringify(results));
    });
});

app.put('/order/edit', function(request, response) {
    connection.query('UPDATE `orders` SET `status`=1 WHERE `id`=?;INSERT INTO `orders` (status, price_total, customer_id) SELECT 0, 0, ? FROM `orders` WHERE NOT EXISTS (SELECT * FROM `orders` WHERE status=0 AND price_total=0 AND customer_id = ?) LIMIT 1;', [request.body.id, request.body.customer_id, request.body.customer_id], function(err, results, fields) {
        if (err) {
            console.log('error: ', err);
            throw err;
        }
        response.end(JSON.stringify({"results": results}));
    });
});

app.put('/order/pending', function(request, response) {
    connection.query('UPDATE `orders` SET `pending`=? WHERE `id`=?', [request.body.pending, request.body.order_id], function(err, results, fields) {
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

app.get('/account/:user', function(request, response) {
    connection.query('SELECT email, balance from customers WHERE id=?', [request.params.user], function(err, results, fields) {
        if (err) {
            console.log('error: ', err);
            throw err;
        }
        response.end(JSON.stringify({"results": results}));
    });
});


app.get('/email/:user', function(request, response) {
    connection.query('SELECT email from customers WHERE id=?', [request.params.user], function(err, results, fields) {
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
    connection.query('INSERT INTO customers SET email =?, password = ?;INSERT INTO orders (status, price_total, customer_id) SELECT 0, 0, id FROM customers WHERE email = ?;INSERT INTO device_information (customer_id) SELECT id FROM customers WHERE email = ?', [req.body.email, bcrypt.hashSync(req.body.password, salt), req.body.email, req.body.email], function (error, results, fields) {
        if (error) throw error;
        res.end(JSON.stringify(results));
    });
});

app.post('/topup', function (req, res) {
    connection.query('INSERT INTO balance_history SET `credit`=?, `type`=?,`customer_id`=?;UPDATE `customers` SET `balance`= `balance` + ? WHERE `id`=?', [req.body.credit, req.body.type, req.body.customer_id, req.body.credit, req.body.customer_id], function (error, results, fields) {
        if (error){
            throw error;
        } else {
            res.end(JSON.stringify(results));
        }
    });
});

app.put('/customer/device', function (req, res) {
    connection.query('UPDATE `device_information` SET `hardware`=?, `type`=?, `model`=?, `brand`=?, `device`=?, `manufacturer`=?, `user`=?, `serial`=?, `host`=?, `device_id`=?, `bootloader`=?, `board` =?, `display`=? WHERE `customer_id`=?', [req.body.hardware, req.body.type, req.body.model, req.body.brand, req.body.device, req.body.manufacturer, req.body.user, req.body.serial, req.body.host, req.body.device_id, req.body.bootloader, req.body.board, req.body.display, req.body.customer_id]
        , function (error, results, fields) {
            if (error){
                throw error;
            } else {
                res.end(JSON.stringify(results));
            }
        });
});

app.get('/customer/:user/device/', function(request, response) {
    connection.query('SELECT * from device_information WHERE customer_id=?', [request.params.user], function(err, results, fields) {
        if (err) {
            console.log('error: ', err);
            throw err;
        }
        response.end(JSON.stringify({"results": results}));
    });
});

app.get('/register/:id', function(request, response) {
    connection.query('SELECT register_history.order_id, register_history.customer_id, register_history.timestamp, orders.price_total from register_history INNER JOIN orders ON orders.id = register_history.order_id WHERE register_history.register_id=? ORDER BY register_history.timestamp DESC', [request.params.id], function(err, results, fields) {
        if (err) {
            console.log('error: ', err);
            throw err;
        }
        response.end(JSON.stringify({"results": results}));
    });
});

app.get('/product/categories', function(request, response) {
    connection.query('SELECT * FROM product_category', function(err, results, fields) {
        if (err) {
            console.log('error: ', err);
            throw err;
        }
        response.end(JSON.stringify({"results": results}));
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

app.post('/loginAuth', function (req, res) {
    connection.query('SELECT * FROM customers WHERE email =?', [req.body.email], function (error, results, fields) {
        if (error) {
            throw error;
        } else {
            if(results.length > 0){
                if( bcrypt.compareSync(req.body.password, results[0].password) ) {
                    var token = jwt.sign({ user: results[0].id }, 'zeersecret');
                    res.status(200).json(token);
                } else {
                    res.sendStatus(401);
                }
            } else {
                res.sendStatus(401);
            }
        }
    });
});

app.post('/loginRegister', function (req, res) {
    connection.query('SELECT * FROM register WHERE id =?', [req.body.email], function (error, results, fields) {
        if (error) {
            throw error;
        } else {
            if(results.length > 0){
                if( bcrypt.compareSync(req.body.password, results[0].password) ) {
                    var token = jwt.sign({ user: results[0].id }, 'zeersecret');
                    res.status(200).json(token);
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
