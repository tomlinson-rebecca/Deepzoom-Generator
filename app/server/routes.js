var DM = require('./deepzoom-manager');
var multer  = require('multer');

module.exports = function(app) {
	var uploading = multer({
	  dest: __dirname + '/collection/',
	  limits: {fileSize: 100000000, files:1},
	});

	app.get('/', function(req, res){
		res.render('home');
	});

	//new survey
	app.post('/uploadCollection', uploading.single('file'), function(req, res){
		DM.generateDeepzoom(req, function(o, e){
			if (e){
				res.status(400).send(e);
			} else{
				res.status(200).send(o);

			}
		});
	});
};