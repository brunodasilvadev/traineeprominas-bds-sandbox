var chai = require('chai');
var chaiHttp = require('chai-http');
var server = require('../bin/server-test');
var should = chai.should();

chai.use(chaiHttp);

describe('Teacher', function() {
    this.timeout(12000);

    before(done => {
        setTimeout(() => {
            done();
        }, 10000);
    });

    it('Route GET ALL - FAIL', (done) => {
        chai.request(server)
            .get('/api/v1/teacher/JSON')
            .end((err, res) => {
                res.should.have.status(200);
                res.body.message.should.equal('Não foram encontrados professores.');
                done();
            })
    });

    it('Route POST - New teacher - OK', function (done) {
            chai.request(server)
            .post('/api/v1/teacher')
            .send({ 'name': 'Iron', 'lastName': 'Fist', 'phd': true})
            .end(function(err, res){
                res.should.have.status(201);
                done();
            });
    });

    it('Route POST - New teacher - OK', function (done) {
        chai.request(server)
        .post('/api/v1/teacher')
        .send({ 'name': 'Antony', 'lastName': 'Stark', 'phd': true})
        .end(function(err, res){
            res.should.have.status(201);
            done();
        });
    });

    it('Route POST - New teacher - OK', function (done) {
        chai.request(server)
            .post('/api/v1/teacher')
            .send({ 'name': 'Frank', 'lastName': 'De boer', 'phd': true})
            .end(function(err, res){
                res.should.have.status(201);
                done();
            });
    });

    it('Route POST - New teacher - FAIL phd false', function (done) {
        chai.request(server)
            .post('/api/v1/teacher')
            .send({ 'name': 'Iron', 'lastName': 'Fist', 'phd': false})
            .end(function(err, res){
                res.should.have.status(422);
                done();
            });
    });

    it('Route GET ALL - OK', (done) => {
        chai.request(server)
            .get('/api/v1/teacher/JSON')
            .end( (err, res) => {
                res.should.have.status(200);
                done();
            })
    });

    it('Route UPDATE - OK', (done) => {
        chai.request(server)
            .put('/api/v1/teacher/1')
            .send({ 'name': 'Iron', 'lastName': 'Fist', 'phd': true})
            .end((err, res) => {
                res.should.have.status(200);
                done();
            });
    });

    it('Route UPDATE - FAIL - phd false', (done) => {
        chai.request(server)
            .put('/api/v1/teacher/2')
            .send({ 'name': 'Iron', 'lastName': 'Fist', 'phd': false})
            .end((err, res) => {
                res.should.have.status(422);
                done();
            });
    });

    it('Route DELETE BY ID - OK', (done) => {
        chai.request(server)
            .delete('/api/v1/teacher/1')
            .end((err, res) => {
                res.should.have.status(200);
                done();
            });
    });

    it('Route DELETE BY ID - FAIL', (done) => {
        chai.request(server)
            .delete('/api/v1/teacher/100')
            .end((err, res) => {
                res.should.have.status(204);
                done();
            });
    });
});
