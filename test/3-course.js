var chai = require('chai');
var chaiHttp = require('chai-http');
var server = require('../bin/server-test');
var should = chai.should();

chai.use(chaiHttp);

describe('Course', function() {
    this.timeout(12000);

    before(done => {
        setTimeout(() => {
            done();
        }, 10000);
    });

    it('Route GET ALL - FAIL', (done) => {
        chai.request(server)
            .get('/api/v1/course/JSON')
            .end((err, res) => {
                res.should.have.status(200);
                res.body.message.should.equal('Não foram encontrados cursos.');
                done();
            })
    });

    it('Route POST - New course - OK', function (done) {
            chai.request(server)
            .post('/api/v1/course')
            .send(
                {
                    "name": "NodeJs",
                    "period": 8,
                    "city": "Coronel Fabriciano",
                    "teacher":
                    [{
                        "id": 2,
                        "name": "Iron",
                        "lastName": "Fist"
                    },
                     {
                        "id": 3,
                        "name": "Antony",
                        "lastName": "Stark"
                    }]
                }
            )
            .end(function(err, res){
                res.should.have.status(201);
                done();
            });
    });

    it('Route POST - New course - OK', function (done) {
        chai.request(server)
            .post('/api/v1/course')
            .send(
                {
                    "name": "MongoDb",
                    "period": 8,
                    "city": "Coronel Fabriciano",
                    "teacher":
                        [{
                            "id": 2,
                            "name": "Iron",
                            "lastName": "Fist"
                        },
                        {
                            "id": 3,
                            "name": "Antony",
                            "lastName": "Stark"
                        }]
                }
            )
            .end(function(err, res){
                res.should.have.status(201);
                done();
            });
    });

    it('Route POST - New course - FAIL', function (done) {
        chai.request(server)
            .post('/api/v1/course')
            .send(
                {
                    "name": "NodeJs",
                    "period": 8,
                    "city": "Coronel Fabriciano",
                    "teacher":
                    [{
                        "id": 1,
                        "name": "Antony",
                        "lastName": "Stark"
                    }]
                }
            )
            .end(function(err, res){
                res.should.have.status(422);
                done();
            });
    });

    it('Route GET ALL - OK', (done) => {
        chai.request(server)
            .get('/api/v1/course/JSON')
            .end( (err, res) => {
                res.should.have.status(200);
                done();
            })
    });

    it('Route UPDATE - OK', (done) => {
        chai.request(server)
            .put('/api/v1/course/1')
            .send(
                {
                    "name": "C#",
                    "period": 8,
                    "city": "Timóteo",
                    "teacher":
                    [{
                        "id": 3,
                        "name": "Antony",
                        "lastName": "Stark"
                    },
                        {
                        "id": 2,
                        "name": "Bruce",
                        "lastName": "Banner"
                    }]
                }
            )
            .end((err, res) => {
                res.should.have.status(200);
                done();
            });
    });

    it('Route UPDATE - FAIL', (done) => {
        chai.request(server)
            .put('/api/v1/course/1')
            .send(
            {
                "name": "NodeJs",
                "period": 8,
                "city": "Coronel Fabriciano",
                "teacher":
                [{
                    "id": 1,
                    "name": "Antony",
                    "lastName": "Stark"
                }]
            }
            )
            .end((err, res) => {
                res.should.have.status(422);
                done();
            });
    });

    it('Route DELETE BY ID - OK', (done) => {
        chai.request(server)
            .delete('/api/v1/course/1')
            .end((err, res) => {
                res.should.have.status(200);
                done();
            });
    });

    it('Route DELETE BY ID - FAIL', (done) => {
        chai.request(server)
            .delete('/api/v1/course/100')
            .end((err, res) => {
                res.should.have.status(204);
                done();
            });
    });
});
