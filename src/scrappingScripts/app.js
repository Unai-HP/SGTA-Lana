const express = require('express');
const app = express();
const router = express.Router();

const path = __dirname;
const port = 8080;

const { Manipulator } = require('./scrapping');

router.use(function (req,res,next) {
    console.log('/' + req.method);
    next();
});

router.get('/Data', function(req,res){
    //example localhost:8080/basicdata?origin=Bilbo&destination=Vladivostok
    const origin = req.query.origin;
    const destination = req.query.destination;
    const scraper = new Manipulator();

    scraper.getBasicData(origin, destination).then(data => {
      res.json(data);
    }).catch(err => {
      console.log(err);
      res.json(err);
    })
    
});

app.use(express.static(path));
app.use('/', router);

app.listen(port, function () {
  console.log('Example app listening on port 8080!')
})
