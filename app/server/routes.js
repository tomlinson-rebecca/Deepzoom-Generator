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
			
			/*
			DM.generateDZC(req, function(dzcFile, err){
				console.log("Appending final stuff to DZC.");

				if (err){
					console.log("e");
					res.status(400).send(err);
				} else{
					console.log(dzcFile);
				//	res.status(200).send(o);
					
				}

				//Maybe could call dm.genDzc here, after all the deepzoom gen is done

			}) */

			if (e){
				
				res.status(400).send(e);
			} else{
				
				res.status(200).send(o);
				
			}
			
			
			
		});
	});
};