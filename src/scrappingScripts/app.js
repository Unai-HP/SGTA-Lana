const express = require('express');
var cors = require('cors')
const app = express();
app.use(cors())
const router = express.Router();

const path = __dirname;
const port = 8080;

const { Manipulator } = require('./scrapping');

router.use(function (req,res,next) {
    console.log('/' + req.method);
    next();
});

router.get('/BasicData', async function(req,res){
	//example localhost:8080/BasicData?origin=Bilbo&destination=Vladivostok
	const origin = req.query.origin;
	const destination = req.query.destination;
	const scraper = new Manipulator();

	scraper.getBasicData(origin, destination).then(basic_data => {
		res.json(basic_data);
		scraper.finish();
	}).catch(err => {
		console.log(err);
		res.json(err);
	})
    
});

router.get('/FullData', async function(req,res){
	//example localhost:8080/FullData?origin=Bilbo&destination=Vladivostok
	const origin = req.query.origin;
	const destination = req.query.destination;
	const scraper = new Manipulator();

	scraper.getBasicData(origin, destination).then(basic_data => {
		scraper.getDetailedDirections(basic_data).then(detailed_data => {
		res.json(detailed_data);
		scraper.finish();
		}).catch(err => {
			console.log(err);
			res.json(err);
		})
	}).catch(err => {
		console.log(err);
		res.json(err);
	})
  
});

app.use(express.static(path));
app.use('/', router);

app.listen(port, function () {
  console.log('Listening on port '+port)
})
