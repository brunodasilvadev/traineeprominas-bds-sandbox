var express = require('express');
var router = express.Router();

router.get('/',  (req, res, next) => {
    res.status(200).send({
        title: 'SandBox',
        version: '0.0.1'
    });
});

module.exports = router;