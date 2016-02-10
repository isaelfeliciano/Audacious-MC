var express = require('express');
var router = express.Router();
var exec = require('child_process').exec;
var spawn = require('child_process').spawn;
var fs = require('fs');
var path = require('path');

if(!Array.prototype.last){
	Array.prototype.last = function(){
		return this[this.length - 1];
	}

	Array.prototype.beforeLast = function(){
		return this[this.length - 2];
	}
}

router.get('/audaciousStatus', function (req, res){
	var audaciousStatus = exec('ps -A | grep audacious', function (err, stdout, stderr){
		if (err) {
			res.send('off');
			console.log('Audacious is off');
		}else {
			playbackStatus = exec('audtool playback-status', function (err, stdout, stderr){
				if (err) {
					console.log('playbackStatus error: '+err);
				} else {
					res.send(stdout);
					console.log(stdout);
				}
			});
		} 
	});
	console.log('status');
});

router.get('/currentSong', function (req, res){
	getCurrentSong.asObj(function(result){
		res.send(result);
	});
});

var getCurrentSong = {
	asObj: function(callback){
		var currentSong = exec('audtool current-song', function (e, sto, ste){
			if (e){
				res.send('Error: '+ e)
			} else {
				sto = sto.replace(/\n/g, '').split(/\s*\-\s/);
				var songData = {
					artist: sto[0],
					album: sto[1],
					title: sto[2]
				};
				callback(songData);
			}
		});
	},
	fileName: function(callback){
		var myexec = exec('audtool current-song-filename', function (e, sto, ste){
			if (e){
				res.send('Error: '+ e)
			} else {
				sto = sto.replace(/\n/g, '');
				var songData = sto;
				callback(songData);
			}
		});
	},
	coverImage: function(playlistName, callback){
		var plName = playlistName;
		// Get File Name of the current song
		this.fileName(function(result){
			var flName = result;
			console.log(flName);
			var songPath = path.dirname(flName);
			var songName = path.basename(flName);
			var imagesPath = '/home/isael/web-dev/new-aca/aca/cover-images/';
			// Get type of the image from current song cover
			exec('eyeD3 ' + '"'+flName+'"', function(e, sto, ste){
				if(e){
					console.log('Error getting info from eyeD3');
				} else{
					var imageType = sto.split(/\[(.*?)\]/).beforeLast().split('/')[1];
					var flNameImg = songName.replace('.mp3', '.'+imageType);
					var flNameImg = songName.replace('.m4a', '.'+imageType);
					// Check if image exist already, create it if not
					fs.access(imagesPath+plName+'/'+flNameImg, fs.F_OK, function(err){
						if (err){
							console.log('Image Not Found, Creating...');
							console.log('	'+err);
							// Creating cover image
							exec('eyeD3 --write-images='+imagesPath+plName+ ' "'+flName+'"', function(e, sto, ste){
								if(e){
									console.log('Image Couldnt be created: ');
									console.log('	'+e);
								}else{
									console.log('Image created');
									var imageType = sto.split(/\[(.*?)\]/).beforeLast().split('/')[1];
									songName = songName.replace('.mp3', '.'+imageType);
									songName = songName.replace('.m4a', '.'+imageType);
									var oldPath = imagesPath+plName+'/FRONT_COVER.'+imageType;
									var newPath = imagesPath+plName+'/'+songName;
									fs.rename(oldPath, newPath, function(e){
										if(e){
											console.log('File was not renamed');
											console.log('	'+e);
										}else{
											console.log('File renamed');
											// Get the file to send it to client
											fs.readFile(imagesPath+plName+'/'+songName, function(e, data){
												if (e) throw e;
												callback(data);
											});
										}
									});
								}
							});
						} else{
							console.log('Image was found');
							// Image exist, Get file to send it to client
							fs.readFile(imagesPath+plName+'/'+flNameImg, function(e, data){
								if (e) throw e;
								callback(data);
							});
						}
					});
				}
			});
		});
	}
};


router.get('/playbackStatus', function (req, res){
	playbackStatus = exec('audtool playback-status', function (err, stdout, stderr){
		if (err) {
			console.log('playbackStatus error: '+err);
		} else {
			res.send(stdout);
			console.log(stdout);
		}
	});
});

router.get('/playlist', function (req, res){
	var playlistLongString = '';
	var playlistDisplayData = [];
	var playlistJson = {songs: []};

	var playlist = spawn('audtool', ['playlist-display']);
	playlist.stdout.on('data', function (data){
		playlistLongString += data.toString();
	});
	playlist.on('close', function (code){
		playlistDisplayData = playlistLongString.split('\n'); // Make the long string in array
		var data = playlistDisplayData;
		var totalTracks = data[0].match(/(\d)\w+/g); // Take from first line the number of tracks
			for (var i = 1; i <= parseInt(totalTracks); i++){
				if (playlistDisplayData[i] !== undefined){
					var songData = playlistDisplayData[i].split(/\s*\|\s/);
					var songId = songData[0].replace(/\s/g, '');
					var songDuration = songData[2].replace(/\s/g, '');
					songData = songData[1].split(/\s*\-\s/);

					playlistJson['songs'].push({
						songId: songId.replace(/\s/g, ''),
						songDuration: songDuration,
						songArtist: songData[0],
						songAlbum: songData[1],
						songTitle: songData[2]
					});
				} else{
					console.log('End of the list');
				}
			}
			res.json(playlistJson);
			console.log('JSON sended');
	});
});

router.get('/cover-image', function(req, res){
	var playlistName = exec('audtool current-playlist-name', function(e, sto, ste){
		if(e){
			console.log('Error getting playlist-name')
		}else{
			sto = sto.replace(/\n/g, '');
			fs.access('cover-images/'+sto, fs.F_OK, function(err){
				if (err){
					console.log("Directory not exist");
					fs.mkdir('cover-images/'+sto, function(err){
						if (err){
							console.log("Error Making Directory: "+ err)
						}else{
							console.log('Directory created');

						}
					});
				}else{
					console.log('Directory exist');
					getCurrentSong.coverImage(sto, function(image){
						res.writeHead(200, {'Content-Type': 'image/jpg'});
						res.end(image, 'binary');
					});
				}
			})
		}
	})
})

module.exports = router;
