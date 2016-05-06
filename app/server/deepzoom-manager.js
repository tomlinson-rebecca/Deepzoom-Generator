var exports = module.exports;
var fs = require('fs'); //file system
var fsx = require('fs-extra');
var sharp = require('sharp');
var archiver = require('archiver');


exports.generateDeepzoom = function(files, callback){
	fs.readFile(files.file.path, function(err, data){

		var newPath = __dirname + "/../public/collection/" + files.file.originalname;
		var id = files.file.originalname.substr(0, files.file.originalname.lastIndexOf('.'));
		var desFile = __dirname + "/../public/collection/" + id + '.dzi';

		fs.writeFile(newPath, data, function(err){
			if(err){
				callback(null, err);
			}else{
				sharp(newPath).tile(256).toFile(desFile,
      				function(error, info){
        			if(error){
          				callback(null, error);
        			}
    			});
				var output = fs.createWriteStream(__dirname + "/../public/collection/"+ id + '.zip');
				var zipArchive = archiver('zip');

				zipArchive.pipe(output);

				zipArchive.bulk([
				    { src: [id + ".dzi", id + "_*"], cwd: __dirname + "/../public/collection/", expand: true }
				]);

				zipArchive.finalize();
				callback(__dirname + "/../public/collection/"+ id + '.zip', null);
			}
		});
	});
};