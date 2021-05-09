const express = require('express');
const db = require('./db/db.js')
var routes = require('./routes/controller');
var bodyParser = require('body-parser');
const app = express();
const port = 3000;

app.use(bodyParser.urlencoded({extended: true}));

app.set('view engine', 'ejs');
app.set('views', './views');

// Website routes
app.use('/', routes);

app.listen(port, function () {
    console.log("Starting at port 3000...");
});
