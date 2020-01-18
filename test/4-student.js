var chai = require('chai');
var chaiHttp = require('chai-http');
var server = require('../bin/server-test');
var should = chai.should();

chai.use(chaiHttp);

describe('Student', function() {
    this.timeout(12000);

    before(done => {
        setTimeout(() => {
            done();
        }, 10000);
    });

    it('Route GET ALL - FAIL', (done) => {
        chai.request(server)
            .get('/api/v1/student/JSON')
            .end((err, res) => {
                res.should.have.status(200);
                res.body.message.should.equal('Não foram encontrados estudantes.');
                done();
            })
    });

    it('Route POST - New student - OK', function (done) {
            chai.request(server)
            .post('/api/v1/student')
            .send(
                {
                    "name": "Mary",
                    "lastName": "Mah",
                    "age": 18,
                    "course": 
                    {
                        "id": 2,
                        "name": "NodeJs",
                        "period": "1",
                        "city": "Coronel Fabriciano",
                        "teacher": [
                            {
                                "id": 3,
                                "name": "Antony",
                                "lastName": "Stark"
                            },
                            {
                                "id": 2,
                                "name": "Bruce",
                                "lastName": "Banner"
                            }
                        ]
                     }
                }
            )
            .end(function(err, res){
                res.should.have.status(201);
                done();
            });
    });

    it('Route POST - New student - FAIL less than 17 years old', function (done) {
        chai.request(server)
            .post('/api/v1/student')
            .send(
                {
                    "name": "Mary",
                    "lastName": "Mah",
                    "age": 16,
                    "course": 
                    {
                        "id": 2,
                        "name": "NodeJs",
                        "period": "1",
                        "city": "Coronel Fabriciano",
                        "teacher": [
                            {
                                "id": 3,
                                "name": "Antony",
                                "lastName": "Stark"
                            },
                            {
                                "id": 2,
                                "name": "Bruce",
                                "lastName": "Banner"
                            }
                        ]
                     }
                }
            )
            .end(function(err, res){
                res.should.have.status(422);
                done();
            });
    });

    it('Route POST - New student - FAIL less than 2 teachers at course', function (done) {
        chai.request(server)
            .post('/api/v1/student')
            .send(
                {
                    "name": "Mary",
                    "lastName": "Mah",
                    "age": 18,
                    "course": 
                    {
                        "id": 2,
                        "name": "NodeJs",
                        "period": "1",
                        "city": "Coronel Fabriciano",
                        "teacher": [
                            {
                                "id": 2,
                                "name": "Antony",
                                "lastName": "Stark"
                            }
                        ]
                     }
                }
            )
            .end(function(err, res){
                res.should.have.status(422);
                done();
            });
    });

    it('Route GET ALL - OK', (done) => {
        chai.request(server)
            .get('/api/v1/student/JSON')
            .end( (err, res) => {
                res.should.have.status(200);
                done();
            })
    });

    it('Route UPDATE - OK', (done) => {
        chai.request(server)
            .put('/api/v1/student/1')
            .send(
                {
                    "name": "Mary",
                    "lastName": "Mah",
                    "age": 20,
                    "course": 
                    {
                        "id": 3,
                        "name": "Science",
                        "period": "1",
                        "city": "Fabriciano",
                        "teacher": 
                        [{
                            "id": 3,
                            "name": "Peter",
                            "lastName": "Quill"
                        },
                        {
                            "id": 2,
                            "name": "Antony",
                            "lastName": "Stark"
                        }]
                     }
                }
            )
            .end((err, res) => {
                res.should.have.status(200);
                done();
            });
    });

    it('Route UPDATE - FAIL', (done) => {
        chai.request(server)
            .put('/api/v1/student/1')
            .send(
                {
                    "name": "Mary",
                    "lastName": "Mah",
                    "age": 18,
                    "course": 
                    {
                        "id": 3,
                        "name": "NodeJs",
                        "period": "1",
                        "city": "Coronel Fabriciano",
                        "teacher": [
                            {
                                "id": 2,
                                "name": "Antony",
                                "lastName": "Stark"
                            }]
                     }
                }
            )
            .end((err, res) => {
                res.should.have.status(422);
                done();
            });
    });

    it('Route DELETE BY ID - OK', (done) => {
        chai.request(server)
            .delete('/api/v1/student/1')
            .end((err, res) => {
                res.should.have.status(200);
                done();
            });
    });

    it('Route DELETE BY ID - FAIL', (done) => {
        chai.request(server)
            .delete('/api/v1/student/100')
            .end((err, res) => {
                res.should.have.status(204);
                done();
            });
    });
});
