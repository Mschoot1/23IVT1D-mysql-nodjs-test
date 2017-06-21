process.env.APP_EMAIL = 'test';
process.env.APP_PASSWORD = 'test';

var chai = require('chai');
var chaiHttp = require('chai-http');
var server = require('../server');
var should = chai.should();

chai.use(chaiHttp);

describe('Authentication routes api v1', function () {

    it('returns an error on POST /api/v1/login with invalid credentials ', function (done) {
        var credentials = {
            email: "",
            password: ""
        };
        chai.request(server)
            .post('/loginAuth')
            .send(credentials)
            .end(function (err, res) {
                res.should.have.status(401);
                done();
            });
    });

    it('returns a token on POST /api/v1/login with valid credentials', function (done) {
        var credentials = {
            email: process.env.APP_EMAIL,
            password: process.env.APP_PASSWORD
        };
        console.log(credentials);
        chai.request(server)
            .post('/loginAuth')
            .send(credentials)
            .end(function (err, res) {
                res.should.have.status(200);
                res.body.should.be.an('string');
                done();
            });
    });
});