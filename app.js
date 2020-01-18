var express = require('express');
var bodyParser = require('body-parser');
const baseAPI = '/api/v1';
const baseApiSecure = "/api/v1.1";
const cors = require('cors');
var jwt = require('express-jwt');
var jwks = require('jwks-rsa');

var jwtCheck = jwt({
    secret: jwks.expressJwtSecret({
        cache: true,
        rateLimit: true,
        jwksRequestsPerMinute: 5,
        jwksUri: 'https://traineeprominas-bds-sandbox.auth0.com/.well-known/jwks.json'
    }),
    audience: 'https://traineeprominas-bds-sandbox.herokuapp.com',
    issuer: 'https://traineeprominas-bds-sandbox.auth0.com/',
    algorithms: ['RS256']
});

/* definition models */
const userModel = require('./src/models/user');
const teacherModel = require('./src/models/teacher');
const courseModel = require('./src/models/course');
const studentModel = require('./src/models/student');

var app = express();
app.use(cors());
app.options('*', cors());
app.use(bodyParser.urlencoded({ extended: true}));
app.use(bodyParser.json());

/* definition of routes */
app.use(`${baseAPI}/`, require('./src/routes/index'));
app.use(`${baseAPI}`, require('./src/routes/user'));
app.use(`${baseAPI}`, require('./src/routes/teacher'));
app.use(`${baseAPI}`, require('./src/routes/course'));
app.use(`${baseAPI}`, require('./src/routes/student'));

//Routes 1.1
app.use(`${baseApiSecure}`, jwtCheck, require('./src/routes/user'));
app.use(`${baseApiSecure}`, jwtCheck, require('./src/routes/teacher'));
app.use(`${baseApiSecure}`, jwtCheck, require('./src/routes/course'));
app.use(`${baseApiSecure}`, jwtCheck, require('./src/routes/student'));


module.exports = app;
