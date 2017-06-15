var express = require('express');
var routes = express.Router();
var db = require('../config/db');
var _ = require('lodash');
var fs = require('fs');

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

routes.get('/products/:user/category/:category', function(request, response) {
    db.query('(SELECT product_orders.product_id AS id, product_orders.quantity, products.name, products.price, products.size, products.alcohol, products.category_id as category_id, product_category.name as category_name FROM orders JOIN product_orders ON (product_orders.order_id = orders.id) JOIN products ON products.id = product_orders.product_id JOIN product_category ON product_category.id = products.category_id AND products.category_id = ? WHERE orders.status = 0 AND orders.customer_id = ? ORDER BY category_id ) UNION ( SELECT products.id, 0 AS quantity, products.name, products.price, products.size, products.alcohol, products.category_id, product_category.name as category_name FROM products JOIN product_category ON product_category.id = products.category_id AND products.category_id = ? WHERE products.id NOT IN ( SELECT product_orders.product_id FROM orders JOIN product_orders ON (product_orders.order_id = orders.id) JOIN products ON products.id = product_orders.product_id WHERE orders.status = 0 AND orders.customer_id = ? ) ) ORDER BY category_id, id', [request.params.category, request.params.user, request.params.category, request.params.user, ], function(err, results, fields) {
        if (err) {
            console.log('error: ', err);
            throw err;
        }
        response.end(JSON.stringify({"results": results}));
    });
});

routes.get('/products/:user', function(request, response) {
    db.query({sql: '(SELECT product_orders.product_id AS id, product_orders.quantity, products.name, products.price, products.size, products.alcohol, products.image as products_image, products.category_id as category_id, product_category.name as category_name, allergies.description, allergies.image FROM orders JOIN product_orders ON (product_orders.order_id = orders.id) JOIN products ON products.id = product_orders.product_id JOIN product_category ON product_category.id = products.category_id LEFT JOIN product_allergy ON product_allergy.product_id=products.id LEFT JOIN allergies ON allergies.id=product_allergy.allergy_id WHERE orders.status = 0 AND orders.customer_id = ? ORDER BY products.category_id ) UNION (SELECT products.id, 0 AS quantity, products.name, products.price, products.size, products.alcohol, products.image as products_image, products.category_id, product_category.name as category_name, allergies.description, allergies.image FROM products JOIN product_category ON product_category.id = products.category_id LEFT JOIN product_allergy ON product_allergy.product_id=products.id LEFT JOIN allergies ON allergies.id=product_allergy.allergy_id WHERE products.id NOT IN (SELECT product_orders.product_id FROM orders JOIN product_orders ON (product_orders.order_id = orders.id) JOIN products ON products.id = product_orders.product_id WHERE orders.status = 0 AND orders.customer_id = ?) ) ORDER BY category_id, id', nestTables: true }, [request.params.user, request.params.user], function(err, results, fields) {
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

routes.get('/products', function(request, response) {
    db.query({sql: 'SELECT products.*, product_category.name as category_name, allergies.description, allergies.image FROM products LEFT JOIN product_category ON product_category.id = products.category_id LEFT JOIN product_allergy ON product_allergy.product_id=products.id LEFT JOIN allergies ON allergies.id=product_allergy.allergy_id ORDER BY products.category_id, products.id', nestTables: true }, function(err, results, fields) {
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

routes.get('/products/order/:id', function(request, response) {
    db.query({sql: 'SELECT products.*, product_category.name as category_name, product_orders.*, allergies.description, allergies.image FROM orders INNER JOIN product_orders ON product_orders.order_id=orders.id LEFT JOIN products ON products.id=product_orders.product_id LEFT JOIN product_category ON products.category_id=product_category.id LEFT JOIN product_allergy ON product_allergy.product_id=products.id LEFT JOIN allergies ON allergies.id=product_allergy.allergy_id WHERE orders.id = ? ORDER BY products.category_id, products.id', nestTables: true }, [request.params.id], function(err, results, fields) {
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

routes.put('/product/quantity/edit', function(request, response) {
    db.query('UPDATE `product_orders` SET `quantity`=? WHERE `product_id`=? AND customer_id=? AND order_id = ?', [request.body.quantity, request.body.product_id, request.body.customer_id, request.body.order_id], function(err, results, fields) {
        if (err) {
            console.log('error: ', err);
            throw err;
        }
        response.end(JSON.stringify({"results": results}));
    });
});

routes.delete('/product/quantity/delete', function(request, response) {
    db.query('DELETE FROM `product_orders` WHERE `product_id`=? AND customer_id=? AND order_id = ?', [request.body.product_id, request.body.customer_id, request.body.order_id], function(err, results, fields) {
        if (err) {
            console.log('error: ', err);
            throw err;
        }
        response.end(JSON.stringify({"results": results}));
    });
});

routes.put('/product/edit', function(request, response) {
    var allergies = request.body.allergies.split(',');
    var allergy_values = allergies.map(function(allergy){return "('"+ request.body.product_id +"', (SELECT id FROM allergies WHERE description = '"+ allergy +"'))"}).join(',');
    if(request.body.image.startsWith("http://")){
        db.query('DELETE FROM `product_allergy` WHERE `product_id`=?;UPDATE `products` SET `name`=?, `price`=?, `size`=?, `alcohol`=?, `category_id`=(SELECT id FROM product_category WHERE product_category.name = ?), `image`=? WHERE `id`=?;INSERT INTO product_allergy (product_id, allergy_id) VALUES ' + allergy_values, [request.body.product_id, request.body.name, request.body.price, request.body.size, request.body.alcohol, request.body.category_name, request.body.image, request.body.product_id], function(err, results, fields) {
            if (err) {
                console.log('error: ', err);
                throw err;
            }
            response.end(JSON.stringify({"results": results}));
        });
    } else {
        var base64Data = request.body.image;
        var binaryData = new Buffer(base64Data, 'base64').toString('binary');

        var fileName = Date.now();

        fs.writeFile("./public/images/"+ fileName +".jpg", binaryData, "binary", function (err) {
            if (err) throw err;
            db.query('DELETE FROM `product_allergy` WHERE `product_id`=?;UPDATE `products` SET `name`=?, `price`=?, `size`=?, `alcohol`=?, `category_id`=(SELECT id FROM product_category WHERE product_category.name = ?), `image`=? WHERE `id`=?;INSERT INTO product_allergy (product_id, allergy_id) VALUES ' + allergy_values, [request.body.product_id, request.body.name, request.body.price, request.body.size, request.body.alcohol, request.body.category_name, "http://mysql-test-p4.herokuapp.com/images/"+ fileName +".jpg", request.body.product_id], function(err, results, fields) {
                if (err) {
                    console.log('error: ', err);
                    throw err;
                }
                response.end(JSON.stringify({"results": results}));
            });
        });
    }
});

routes.delete('/product/delete', function(request, response) {
    db.query('DELETE FROM `product_allergy` WHERE `product_id`=?;DELETE FROM `products` WHERE `id`=?', [request.body.product_id, request.body.product_id], function(err, results, fields) {
        if (err) {
            console.log('error: ', err);
            throw err;
        }
        response.end(JSON.stringify({"results": results}));
    });
});

routes.post('/product/add', function (request, res) {
    var allergies = request.body.allergies.split(',');
    var product_name = request.body.name;

    var base64Data = request.body.image;
    var binaryData = new Buffer(base64Data, 'base64').toString('binary');

    var fileName = Date.now();

    fs.writeFile("./public/images/"+ fileName +".jpg", binaryData, "binary", function (err) {
        if (err) throw err;

        db.query('INSERT INTO products SET `name`=?, `price`=?, `size`=?, `alcohol`=?, `category_id`=(SELECT id FROM product_category WHERE product_category.name = ?), `image`=?;INSERT INTO product_allergy (product_id, allergy_id) VALUES ' + allergies.map(function(allergy){return "((SELECT id FROM products WHERE name = '"+ product_name +"'), (SELECT id FROM allergies WHERE description = '"+ allergy +"'))"}).join(','), [request.body.name, request.body.price, request.body.size, request.body.alcohol, request.body.category_name, "http://mysql-test-p4.herokuapp.com/images/"+ fileName +".jpg"], function (error, results, fields) {
            if (error) throw error;
            res.end(JSON.stringify(results));
        });
    });
});

routes.post('/product/quantity/add', function (request, res) {
    var postData  = { order_id: request.body.order_id, product_id: request.body.product_id, customer_id: request.body.customer_id, quantity: request.body.quantity};
    db.query('INSERT INTO product_orders SET ?', postData, function (error, results, fields) {
        console.log(postData);
        if (error) throw error;
        res.end(JSON.stringify(results));
    });
});

routes.get('/product/categories', function(request, response) {
    db.query('SELECT * FROM product_category', function(err, results, fields) {
        if (err) {
            console.log('error: ', err);
            throw err;
        }
        response.end(JSON.stringify({"results": results}));
    });
});

routes.get('/product/allergies', function(request, response) {
    db.query('SELECT * FROM allergies', function(err, results, fields) {
        if (err) {
            console.log('error: ', err);
            throw err;
        }
        response.end(JSON.stringify({"results": results}));
    });
});

module.exports = routes;