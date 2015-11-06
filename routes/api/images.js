/**
 * Created by Carlos on 6/11/15.
 */
var express = require('express');
var router = express.Router();
var ImageCtrl = require('../../controllers/images');



/* GET users listing. */

router.get('/', function(req, res, next) {
    res.send('Beautiful images should be found here!');
});

router.route('/prueba')
    .get(ImageCtrl.findAllImages)
    .post(ImageCtrl.addImage);

//app.use('/api', router);

module.exports = router;
