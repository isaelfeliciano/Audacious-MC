var express = require('express');
var router = express.Router();
var exec = require('child_process').exec;
var spawn = require('child_process').spawn;

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
	var currentSong = exec('audtool current-song', function (err, sto, ste){
		if (err){
			res.send('Error: '+ err)
		} else {
			sto = sto.replace(/\n/g, '').split(/\s*\-\s/);
			res.send({
				artist: sto[0],
				album: sto[1],
				title: sto[2]
			});
		}
	});
});

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

module.exports = router;
