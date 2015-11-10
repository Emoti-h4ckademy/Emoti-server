/**
 * Created by Carlos on 10/11/15.
 */

console.log("We are in bootstrapdb - 1");

module.exports = {

    bootstrapdb: function(req, res, next){
        console.log('\n\nBOOTSTRAPDB Module <--');
        next();
    },
    dothings: function (){
        console.log('We are doing amazing things');
    }

}

console.log("We are in bootstrapdb - 2");