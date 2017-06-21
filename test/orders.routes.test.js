process.env.APP_EMAIL = 'test';
process.env.APP_PASSWORD = 'test';

var chai = require('chai');
var chaiHttp = require('chai-http');
var server = require('../server');
var should = chai.should();

chai.use(chaiHttp);

describe('order routes tests', function () {

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

    it('returns an array on GET /orders/:user', function (done) {
        chai.request(server)
            .get('/orders/:user')
            .set('Authorization', 'Bearer ' + token)
            .end(function (request, response) {
                response.should.have.status(200);
                response.body.should.be.an('object');
                done();
            });
    });

    it('returns an array on GET /order/:id', function (done) {
        chai.request(server)
            .get('/order/:id')
            .set('Authorization', 'Bearer ' + token)
            .end(function (request, response) {
                response.should.have.status(200);
                response.body.should.be.an('object');
                done();
            });
    });

    it('returns an array on GET /order/current/:user', function (done) {
        chai.request(server)
            .get('/order/current/:user')
            .set('Authorization', 'Bearer ' + token)
            .end(function (request, response) {
                response.should.have.status(200);
                response.body.should.be.an('object');
                done();
            });
    });
});