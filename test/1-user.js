var chai = require('chai');
var chaiHttp = require('chai-http');
var server = require('../bin/server-test');
var should = chai.should();

chai.use(chaiHttp);

describe('User', function () {
    this.timeout(12000);

    before(done => {
        setTimeout(() => {
            done();
        }, 10000);
    });

    it('Route GET ALL - FAIL', (done) => {
        chai.request(server)
            .get('/api/v1/user/JSON')
            .end((err, res) => {
                res.should.have.status(200);
                res.body.message.should.equal('Não foram encontrados usuários.');
                done();
            })
    });

    it('Route POST - New user admin - OK', (done) => {
        chai.request(server)
            .post('/api/v1/user')
            .send({ 'name': 'James', 'lastName': 'Rodrigues', 'profile': 'admin' })
            .end((err, res) => {
                res.should.have.status(201);
                done();
            });
    });

    it('Route POST - New user guess - OK', (done) => {
        chai.request(server)
            .post('/api/v1/user')
            .send({ 'name': 'James', 'lastName': 'Rodrigues', 'profile': 'guess' })
            .end((err, res) => {
                res.should.have.status(201);
                done();
            });
    });

    it('Route POST - New user - FAIL profile teste', (done) => {
        chai.request(server)
            .post('/api/v1/user')
            .send({ 'name': 'James', 'lastName': 'Rodrigues', 'profile': 'teste' })
            .end((err, res) => {
                res.should.have.status(422);
                done();
            });
    });

    it('Route GET ALL - OK', (done) => {
        chai.request(server)
            .get('/api/v1/user/JSON')
            .end((err, res) => {
                res.should.have.status(200);
                res.should.be.json;
                done();
            })
    });

    it('Route UPDATE - OK', (done) => {
        chai.request(server)
            .put('/api/v1/user/1')
            .send({ 'name': 'James', 'lastName': 'Rodrigues', 'profile': 'guess' })
            .end((err, res) => {
                res.should.have.status(200);
                done();
            });
    });

    it('Route UPDATE - FAIL - profile teste', (done) => {
        chai.request(server)
            .put('/api/v1/user/1')
            .send({ 'name': 'James', 'lastName': 'Rodrigues', 'profile': 'teste' })
            .end((err, res) => {
                res.should.have.status(422);
                done();
            });
    });

    it('Route DELETE BY ID - OK', (done) => {
        chai.request(server)
            .delete('/api/v1/user/1')
            .end((err, res) => {
                res.should.have.status(200);
                done();
            });
    });

    it('Route DELETE BY ID - FAIL', (done) => {
        chai.request(server)
            .delete('/api/v1/user/100')
            .end((err, res) => {
                res.should.have.status(204);
                done();
            });
    });
});
