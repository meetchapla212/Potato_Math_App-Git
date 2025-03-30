const express = require('express');
var cors = require('cors')
const http = require('http');
const bodyParser = require('body-parser');
const app = express();
const config = require('./config');
const router_admin_v1 = require('./router/router_admin_v1');
const router_app_v1 = require('./router/router_app_v1');
const ev = require('express-validation');


app.use(cors())
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
	extended: true
}));

app.use(express.static('./uploads'));
app.use(express.static('./assets'));

router_admin_v1.set(app);
router_app_v1.set(app);

//Database connection
const db = require('./db');
const start_migration = require('./controllers/_migration').start_migration;
db.sync().then(() => {
	console.log('DB Connection successful.');
	start_migration();
}).catch((error) => { console.log(error) });


app.use(function (err, req, res, next) {
	// specific for validation errors
	if (err instanceof ev.ValidationError) return res.status(err.status).json(err);
	// other type of errors, it *might* also be a Runtime Error
	// example handling
	if (process.env.NODE_ENV !== 'production') {
		return res.status(500).send(err.stack);
	} else {
		return res.status(500);
	}
	
});

app.listen(config.port, () => console.log('App listening on port ' + config.port));
