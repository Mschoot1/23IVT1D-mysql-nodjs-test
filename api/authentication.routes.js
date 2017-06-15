var express = require('express');
var routes = express.Router();
var db = require('../config/db');
var bcrypt = require('bcrypt');
var jwt = require('jsonwebtoken');
var salt = bcrypt.genSaltSync(10);

routes.post('/loginAuth', function (req, res) {
    db.query('SELECT * FROM customers WHERE email =?', [req.body.email], function (error, results, fields) {
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

routes.post('/loginRegister', function (req, res) {
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

module.exports = routes;