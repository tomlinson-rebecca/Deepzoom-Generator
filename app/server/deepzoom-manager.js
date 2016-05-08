require('shelljs/global');
var exports = module.exports;
var fs = require('fs'); //file system
var fsx = require('fs-extra');
var sharp = require('sharp');
var archiver = require('archiver');


var id;
var dir;

var generateOne = function(newPath, desFile, callback){
	//convert only one image
	sharp(newPath).tile(256).toFile(desFile,
			function(error, info){
		if(error){
			console.log("Error here");
				callback(error);
		}else{
			var output = fs.createWriteStream(__dirname + "/../public/collection/" + id + '.zip');
			var zipArchive = archiver('zip');

			output.on('close', function() {
					console.log(zipArchive.pointer() + ' total bytes');
					console.log('archiver has been finalized and the output file descriptor has closed.');
			});

			zipArchive.on('error', function(err) {
					throw err;
			});

			zipArchive.pipe(output);

			zipArchive.bulk([
			    { src: ['**/*'], cwd: dir, expand: true }
			])
			zipArchive.finalize();
			callback(null);
		}
	});
};

var tileImage = function(newPath, desFile, callback){
	sharp(newPath).tile(256).toFile(desFile,
			function(error, info){
		if(error){
			console.log("Error here");
				callback(error);
		}else{
			callback(null);
		}
	});
};

var generateBatch = function(newPath, callback){
	var readStream = fs.createReadStream(newPath);
	var currentDir = __dirname;
	var images = [];

	console.log('newPath: '+ newPath);
	console.log('dir: ' + dir);

	exec('unzip '+newPath+' -d '+dir);
	
	cd(dir);
	ls('*.*').forEach(function(file) {
		if(file.split('.').pop() != "zip"){
			images.push(file);
		}
	});
	cd(currentDir);


	for(var i = 0; i < images.length - 1; i ++){
		var desFile = dir+'/'+images[i].substr(0, images[i].lastIndexOf('.'))+'.dzi';

		tileImage(dir+'/'+images[i], desFile, function(err){
			if(err) callback(err);
		});
	}

	tileImage(dir+'/'+images[images.length-1],
		dir+'/'+images[images.length-1].substr(0, images[images.length-1].lastIndexOf('.'))+'.dzi',
		function(err){
			if (!err){
				var output = fs.createWriteStream(__dirname + "/../public/collection/" + id + '.zip');
				var zipArchive = archiver('zip');

				output.on('close', function() {
						console.log(zipArchive.pointer() + ' total bytes');
						console.log('archiver has been finalized and the output file descriptor has closed.');
				});

				zipArchive.on('error', function(err) {
						throw err;
				});

				zipArchive.pipe(output);

				zipArchive.bulk([
				    { src: ['**/*'], cwd: dir, expand: true }
				])
				zipArchive.finalize();
				callback(null);
			}
	});

};


exports.generateDeepzoom = function(files, callback){
	dir = __dirname + "/../public/collection/" + files.file.filename;
	fs.mkdirSync(dir);
	fs.readFile(files.file.path, function(err, data){
		var newPath = dir + "/" + files.file.originalname;
		id = files.file.originalname.substr(0, files.file.originalname.lastIndexOf('.'));
		var desFile = dir + "/" + id + '.dzi';

		if(fs.existsSync(desFile)){
  			fsx.removeSync(dir, function(err){
    			if(err) return console.error(err);
  			});
    	}
		if(fs.existsSync(newPath)){
			fsx.removeSync(newPath);
		}else{
			fs.writeFile(newPath, data, function(err){
				if(err){
					callback(null, err);
				}else{
					var extension = files.file.originalname.split('.').pop();
					if(extension == 'zip'){
						generateBatch(newPath, function(e){
							if(e){
								callback(null, error);
							}else{
								callback("collection/"+ id + '.zip', null);
							}
						});
					}else{
						generateOne(newPath, desFile, function(e){
							if(e){
								callback(null, error);
							}else{
								callback("collection/"+ id + '.zip', null);
							}
						});
					}
				}
			});		
		}
	});
};


