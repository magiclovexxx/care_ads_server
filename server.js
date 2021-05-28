const express = require('express');
var routes = require('./routes/controller');
var shopee = require('./api/shopee.js');
var bodyParser = require('body-parser');
const app = express();
var cron = require('node-cron');

require('dotenv').config();

mode = process.env.MODE

slave = process.env.SLAVE

if(slave == "localhost"){
    var port = 4000;
}else{
    var port = 3000;
}

app.use(bodyParser.urlencoded({ extended: true }));

app.set('view engine', 'ejs');
app.set('views', './views');

// Website routes
app.use('/', routes);


app.listen(port, function () {

    console.log("Starting at port: " + port);
});
