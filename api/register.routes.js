var express = require('express');
var routes = express.Router();
var bcrypt = require('bcryptjs');
var db = require('../config/db');
var salt = bcrypt.genSaltSync(10);

routes.get('/register/:id', function(request, response) {
    db.query('SELECT register_history.order_id, register_history.customer_id, register_history.timestamp, orders.price_total from register_history INNER JOIN orders ON orders.id = register_history.order_id WHERE register_history.register_id=? ORDER BY register_history.timestamp DESC', [request.params.id], function(err, results, fields) {
        if (err) {
            console.log('error: ', err);
            throw err;
        }
        response.end(JSON.stringify({"results": results}));
    });
});

routes.post('/register', function (req, res) {
    db.query('INSERT INTO customers SET email =?, password = ?;INSERT INTO orders (status, price_total, customer_id) SELECT 0, 0, id FROM customers WHERE email = ?;INSERT INTO device_information (customer_id) SELECT id FROM customers WHERE email = ?', [req.body.email, bcrypt.hashSync(req.body.password, salt), req.body.email, req.body.email], function (error, results, fields) {
        if (error) throw error;
        res.end(JSON.stringify(results));
    });
});

module.exports = routes;