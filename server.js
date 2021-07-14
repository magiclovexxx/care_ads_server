const express = require('express');
var routes = require('./routes/controller');
var bodyParser = require('body-parser');
const app = express();

require('dotenv').config();

var port = process.env.PORT

app.use(bodyParser.urlencoded({ extended: true }));

app.set('view engine', 'ejs');
app.set('views', './views');

// Website routes
app.use('/', routes);

app.listen(port, function () {
    console.log("Starting at port: " + port);
});
