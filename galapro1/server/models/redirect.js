const mongoose = require('mongoose');

const redirectSchema = mongoose.Schema({
    data:{
        type:String
    },
});

module.exports = mongoose.model('Redirect',redirectSchema);