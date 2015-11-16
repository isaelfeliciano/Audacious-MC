var express = require('express');
var router = express.Router();
var exec = require('child_process').exec
var app = require('../app');

router.post('/playSong', function (req, res) {
	var songId = req.body.songId;
	console.log(req.body);
	var playSong = exec('audtool playlist-jump '+songId, function (err, stdout, stderr){
		if (err) {
			// console.log(err);
			res.send(err)
		}else {
			var play = exec('audtool playback-play', function (err, stdout, stderr){
				if (err){ 
					console.log('Error playing '+err)
				}else {
					res.end("OK");
				}
			});
		}
	});
});

router.post('/playpause', function (req, res){
	var playPause = exec('audtool playback-playpause', function (e, so, se){
		if(e){
			res.send(e);
		}else{
			res.send('OK')
		}
	});
});

router.post('/next-previous', function (req, res){
	var cmd = (req.body.cmd === 'next') ? 'playlist-advance' : 'playlist-reverse';
	var playPause = exec('audtool '+ cmd, function (e, so, se){
		if(e){
			res.send(e);
		}else{
			res.send('OK')
		}
	});
});

router.hola = function(sockt){
	socket = sockt;
}

module.exports = router;
 
