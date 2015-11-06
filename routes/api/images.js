/**
 * Created by Carlos on 6/11/15.
 */
var express = require('express');
var router = express.Router();

/* GET users listing. */
router.get('/', function(req, res, next) {
    res.send('Beautiful images should be found here!');
});

module.exports = router;
