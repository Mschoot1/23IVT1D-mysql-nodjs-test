var express = require("express");
var bodyParser = require('body-parser');
var expressJWT = require('express-jwt');
var db = require('./config/db');
var productRoutes = require('./api/product.routes');
var authRoutes = require('./api/authentication.routes');
var ordersRoutes = require('./api/orders.routes');
var registerRoutes = require('./api/register.routes');
var customerRoutes = require('./api/customer.routes');
var config = require('./config/config');

var app = express();

app.use(bodyParser.json({limit: '50mb'}));
app.use(bodyParser.urlencoded({extended: true, limit: '50mb'}));

app.use(express.static('public'));

app.use(expressJWT({secret: config.secretkey}).unless({path: [
    '/loginAuth',
    '/loginRegister',
    '/register']}));

app.use('/', productRoutes);
app.use('/', authRoutes);
app.use('/', ordersRoutes);
app.use('/', registerRoutes);
app.use('/', customerRoutes);

var port = process.env.PORT || config.webPort;

app.listen(port, function () {
    console.log("Listening on " + port);
});

module.exports = app;