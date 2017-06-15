var express = require('express');
var routes = express.Router();
var db = require('../config/db');

routes.get('/account/:user', function(request, response) {
    db.query('SELECT email, balance from customers WHERE id=?', [request.params.user], function(err, results, fields) {
        if (err) {
            console.log('error: ', err);
            throw err;
        }
        response.end(JSON.stringify({"results": results}));
    });
});

routes.get('/email/:user', function(request, response) {
    db.query('SELECT email from customers WHERE id=?', [request.params.user], function(err, results, fields) {
        if (err) {
            console.log('error: ', err);
            throw err;
        }
        response.end(JSON.stringify(results));
    });
});

routes.post('/topup', function (req, res) {
    db.query('INSERT INTO balance_history SET `credit`=?, `type`=?,`customer_id`=?;UPDATE `customers` SET `balance`= `balance` + ? WHERE `id`=?', [req.body.credit, req.body.type, req.body.customer_id, req.body.credit, req.body.customer_id], function (error, results, fields) {
        if (error){
            throw error;
        } else {
            res.end(JSON.stringify(results));
        }
    });
});

routes.put('/customer/device', function (req, res) {
    db.query('UPDATE `device_information` SET `hardware`=?, `type`=?, `model`=?, `brand`=?, `device`=?, `manufacturer`=?, `user`=?, `serial`=?, `host`=?, `device_id`=?, `bootloader`=?, `board` =?, `display`=? WHERE `customer_id`=?', [req.body.hardware, req.body.type, req.body.model, req.body.brand, req.body.device, req.body.manufacturer, req.body.user, req.body.serial, req.body.host, req.body.device_id, req.body.bootloader, req.body.board, req.body.display, req.body.customer_id]
        , function (error, results, fields) {
            if (error){
                throw error;
            } else {
                res.end(JSON.stringify(results));
            }
        });
});

routes.get('/customer/:user/device/', function(request, response) {
    db.query('SELECT * from device_information WHERE customer_id=?', [request.params.user], function(err, results, fields) {
        if (err) {
            console.log('error: ', err);
            throw err;
        }
        response.end(JSON.stringify({"results": results}));
    });
});

module.exports = routes;