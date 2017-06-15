var express = require('express');
var routes = express.Router();
var db = require('../config/db');

routes.get('/orders/:user', function(request, response) {
    db.query('SELECT * FROM orders WHERE customer_id=? AND `status` =1 ORDER BY timestamp DESC', [request.params.user], function(err, results, fields) {
        if (err) {
            console.log('error: ', err);
            throw err;
        }
        response.end(JSON.stringify({"results": results}));
    });
});

routes.get('/order/:id', function(request, response) {
    db.query('SELECT * FROM orders WHERE id=?', [request.params.id], function(err, results, fields) {
        if (err) {
            console.log('error: ', err);
            throw err;
        }
        response.end(JSON.stringify({"results": results}));
    });
});

routes.post('/order/pay', function (req, res) {
    db.query('INSERT INTO balance_history SET `credit`=?,`customer_id`=?;UPDATE `customers` SET `balance`= `balance` - ? WHERE `id`=?;INSERT INTO `register_history` SET `order_id`=?, `customer_id`=?, `register_id`=?', [req.body.credit, req.body.customer_id, req.body.credit, req.body.customer_id, req.body.order_id, req.body.customer_id, req.body.register_id], function (error, results, fields) {
        if (error){
            throw error;
        } else {
            res.end(JSON.stringify(results) );
        }
    });
});

routes.get('/order/current/:user', function(request, response) {
    db.query('SELECT * FROM orders WHERE status=0 AND customer_id=?', [request.params.user], function(err, results, fields) {
        if (err) {
            console.log('error: ', err);
            throw err;
        }
        response.end(JSON.stringify({"results": results}));
    });
});

routes.put('/order/price/edit', function(request, response) {
    db.query('UPDATE `orders` SET `price_total`=? WHERE `id`=?', [request.body.price_total, request.body.order_id], function(err, results, fields) {
        if (err) {
            console.log('error: ', err);
            throw err;
        }
        response.end(JSON.stringify({"results": results}));
    });
});

routes.put('/order/edit', function(request, response) {
    db.query('UPDATE `orders` SET `status`=1 WHERE `id`=?;INSERT INTO `orders` (status, price_total, customer_id) SELECT 0, 0, ? FROM `orders` WHERE NOT EXISTS (SELECT * FROM `orders` WHERE status=0 AND price_total=0 AND customer_id = ?) LIMIT 1;', [request.body.id, request.body.customer_id, request.body.customer_id], function(err, results, fields) {
        if (err) {
            console.log('error: ', err);
            throw err;
        }
        response.end(JSON.stringify({"results": results}));
    });
});

routes.put('/order/pending', function(request, response) {
    db.query('UPDATE `orders` SET `pending`=? WHERE `id`=?', [request.body.pending, request.body.order_id], function(err, results, fields) {
        if (err) {
            console.log('error: ', err);
            throw err;
        }
        response.end(JSON.stringify({"results": results}));
    });
});

module.exports = routes;
