require('shelljs/global');
var exports = module.exports;
var fs = require('fs'); //file system
var fsx = require('fs-extra');
var sharp = require('sharp');
var archiver = require('archiver');


var id;
var dir;
var filename;
var dzcName;
var dzis = [];
var dziNames = [];

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

//tiling is a sharp thing
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

	exec('unzip '+newPath+' -d '+dir);
	
	if(fs.existsSync(dir + '/__MACOSX')){
  		fsx.removeSync(dir + '/__MACOSX', function(err){
    		if(err) return console.error(err);
  		});
    }

    if(fs.existsSync(__dirname + "/../public/collection" + "/" + id + ".zip")){
  		fsx.removeSync(__dirname + "/../public/collection" + "/" + id + ".zip", function(err){
    		if(err) return console.error(err);
  		});
    }

	cd(dir);
	ls('*.*').forEach(function(file) {
		if(file.split('.').pop() != "zip"){
			images.push(file);
		}
	});
	cd(currentDir);


	var count = 0;
	console.log(images); //list of each image to be processed

	//create a .dzc file and header content
	fs.writeFile(dzcName, '<Collection xmlns="http://schemas.microsoft.com/deepzoom/2009" '+
	'MaxLevel="14" TileSize="256" Format="jpg"> <Items>', 
	function (err) {
		if (err) throw err;
		console.log('Saved!');
	  });
	
	for(var i = 0; i < images.length ; i ++){
		
		var desFile = dir+'/'+images[i].substr(0, images[i].lastIndexOf('.'));  //TODO where its given the .dzi name? I removed it
		dziNames[i] = images[i].substr(0, images[i].lastIndexOf('.'));
		console.log(images[i].substr(0, images[i].lastIndexOf('.')));
		 //data should have the contents of the file. Place this somewhere we can access each .dzi
		
		
		 dzis[i] = desFile+".dzi";
		tileImage(dir+'/'+images[i], desFile, function(err){
			count ++;
			if(err){
				callback(err)
			}else if(count == images.length-1){
				cd(__dirname + "/../public/collection");
				
				//console.log("filename: " +filename);
				exec('zip -r '+ id + '.zip ' + filename);
				cd(currentDir);

				callback(null);
			}
		});
	
	}
	
};

//gets called from homepage when button is pressed?
exports.generateDeepzoom = function(files, callback){


	//makes the folder to store the collection
	dir = __dirname + "/../public/collection/" + files.file.filename;
	filename = files.file.filename;

	console.log("Entering generateDeepzoom");
	console.log("dir: "+dir);
	console.log("filename: "+filename); 

	fs.mkdirSync(dir);
	fs.readFile(files.file.path, function(err, data){

		//organizing where the outputted folder will go

		var newPath = dir + "/" + files.file.originalname; //put original zip in the results
		id = files.file.originalname.substr(0, files.file.originalname.lastIndexOf('.')); //name of given zip (birds etc)
		var desFile = dir + "/" + id + '.dzi'; //TODO could this be causing the .dzi in the name? birds_images.dzi... prob replaced later
		dzcName = dir+'/'+id+'.dzc';

		console.log("newPath: "+newPath);
		console.log("id: "+id);
		console.log("desFile: "+desFile);

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

					//where the actual conversion will take place
					if(extension == 'zip'){
						generateBatch(newPath, function(e){
							if(e){
								callback(null, error);
							}else{

								generateDZC();

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

 var generateDZC = function(){
	console.log("Gen callback");
	var count = 0; //wait until all .dzis are read to callback
	//add each .dzi's information to the .dzc
	for(var i = 0; i < dzis.length ; i++){
		//console.log(dziNames[i]);
			var currName = dziNames[i];
			
			(function(x) {
				fs.readFile(dzis[x], 'utf8', (err, data) => {
					if (err) throw err;

					//parse the .dzi and obtain the size attribute
					var n = data.indexOf("<Size");
					var res = data.substring(n);
					var m = res.indexOf("/>");
					var size =  res.substring(0, m+2);
					console.log(size);
					console.log(x);
					console.log(dziNames[x]);

					//TODO: With size, make each entry for the .dzc
					let appendStr = ' <I Id="'+dziNames[x]+'" N="'+x+'" Source="'+dziNames[x]+'.dzi"> ' +
						size +
						'</I>' ;
					console.log(appendStr);
					fs.appendFile(dzcName, appendStr,
						function (err) {
							if (err) throw err;
							count++;

							if(count == dzis.length-1){
								//append final stuff in the callback
								//append closer stuff to the .dzc
								fs.appendFile(dzcName, '  </Items></Collection>', 
								function (err) {
									if (err) throw err;
									console.log('Finished dzc!');
								});
							}

						});
				  
				});
				
			})(i)
		}
		
};


