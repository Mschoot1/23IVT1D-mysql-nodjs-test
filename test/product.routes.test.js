process.env.APP_EMAIL = 'test';
process.env.APP_PASSWORD = 'test';

var chai = require('chai');
var chaiHttp = require('chai-http');
var server = require('../server');
var should = chai.should();

chai.use(chaiHttp);

describe('rental routes api v1', function () {

    before(function (done) {
        var user = {
            email: process.env.APP_EMAIL,
            password: process.env.APP_PASSWORD
        };

        chai.request(server)
            .post('/loginAuth')
            .send(user)
            .end(function (err, res) {
                res.body.should.be.an('string');
                token = res.body;
                done();
            });
    });

    it('returns an array on GET /products/:user/category/:category', function (done) {
       chai.request(server)
           .get('/products/:user/category/:category')
           .set('Authorization', 'Bearer ' + token)
           .end(function (err, res) {
               res.should.have.status(200);
               res.body.should.be.a('object');
               done();
           });
    });

    it('returns an array on GET /products/:user', function (done) {
       chai.request(server)
           .get('/products/:user')
           .set('Authorization', 'Bearer ' + token)
           .end(function (err, res) {
               res.should.have.status(200);
               res.body.should.be.a('object');
               done();
           });
    });

    it('returns an array on GET /products', function (done) {
       chai.request(server)
           .get('/products')
           .set('Authorization', 'Bearer ' + token)
           .end(function (err, res) {
               res.should.have.status(200);
               res.body.should.be.a('object');
               done();
           });
    });

    it('returns an array on GET /products/order/:id', function (done) {
       chai.request(server)
           .get('/products/order/:id')
           .set('Authorization', 'Bearer ' + token)
           .end(function (err, res) {
               res.should.have.status(200);
               res.body.should.be.a('object');
               done();
           });
    });

    it('returns an array on GET /product/categories', function (done) {
       chai.request(server)
           .get('/product/categories')
           .set('Authorization', 'Bearer ' + token)
           .end(function (err, res) {
               res.should.have.status(200);
               res.body.should.be.a('object');
               done();
           });
    });

    it('returns an array on GET /product/allergies', function (done) {
       chai.request(server)
           .get('/product/allergies')
           .set('Authorization', 'Bearer ' + token)
           .end(function (err, res) {
               res.should.have.status(200);
               res.body.should.be.a('object');
               done();
           });
    });
});
