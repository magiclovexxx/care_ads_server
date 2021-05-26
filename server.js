const express = require('express');
var routes = require('./routes/controller');
var shopee = require('./api/shopee.js');
var bodyParser = require('body-parser');
const app = express();
const port = 3000;

app.use(bodyParser.urlencoded({ extended: true }));

app.set('view engine', 'ejs');
app.set('views', './views');

// Website routes
app.use('/', routes);


(async () => {
	await shopee.shopee_cron_check()
})();

app.listen(port, function () {

    console.log("Starting at port 3000...");
});
