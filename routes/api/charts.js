/**
 * Created by Carlos on 6/11/15.
 */
var express = require('express');
var router = express.Router();
var ImageCtrl = require('../../controllers/images');
var TestUtils = require('../../lib/test/testUtils');


/* GET charts listing. */
router.get('/', function(req, res) {
    var data = [];
    data[0] = {
        State: "MON",
        anger: "42153",
        contempt: "85640",
        disgust: "52083",
        happiness: "183159",
        neutral: "198724",
        sadness: "74257",
        surprise: "50277"
    };
    data[1] = {
        State: "TUE",
        anger: "362642",
        contempt: "828669",
        disgust: "515910",
        happiness: "1523681",
        neutral: "1804762",
        sadness: "601943",
        surprise: "862573"
    };
    data[2] = {
        State: "WED",
        anger: "157204",
        contempt: "343207",
        disgust: "202070",
        happiness: "727124",
        neutral: "754420",
        sadness: "264160",
        surprise: "407205",
    };
    data[3] = {
        State: "THU",
        anger: "2159981",
        contempt: "4499890",
        disgust: "2704659",
        happiness: "8819342",
        neutral: "10604510",
        sadness: "3853788",
        surprise: "4114496"
    };
    data[4] = {
        State: "FRI",
        anger: "261701",
        contempt: "587154",
        disgust: "358280",
        happiness: "1290094",
        neutral: "1464939",
        sadness: "466194",
        surprise: "511094"
    };
    data[5] = {
        State: "SAT",
        anger: "196918",
        contempt: "403658",
        disgust: "211637",
        happiness: "968967",
        neutral: "916955",
        sadness: "325110",
        surprise: "478007"
    }
    data[6] = {
        State: "SUN",
        anger: "259034",
        contempt: "552339",
        disgust: "310504",
        happiness: "1215966",
        neutral: "1231572",
        sadness: "450818",
        surprise: "641667"
    }
    console.log(data);
    res.json(data);
});

module.exports = router;


