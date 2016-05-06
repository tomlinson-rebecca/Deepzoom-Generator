var exports = module.exports;
var fs = require('fs'); //file system
var fsx = require('fs-extra');
var sharp = require('sharp');
var archiver = require('archiver');


exports.generateDeepzoom = function(files, callback){
	var dir = __dirname + "/../public/collection/" + files.file.filename;
	fs.mkdirSync(dir);
	fs.readFile(files.file.path, function(err, data){
		var newPath = dir + "/" + files.file.originalname;
		var id = files.file.originalname.substr(0, files.file.originalname.lastIndexOf('.'));
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
					sharp(newPath).tile(256).toFile(desFile,
	      				function(error, info){
	        			if(error){
	        				console.log("Error here");
	          				callback(null, error);
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
							callback("collection/"+ id + '.zip', null);
	        			}
	    			});
				}
			});		
		}


	});
};