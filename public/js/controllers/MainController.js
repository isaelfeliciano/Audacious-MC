app.controller('MainController', ['$scope', '$http', '$window', 'playlist', 'postRequest', 'audaciousStatus', function ($scope, $http, $window, playlist, postRequest, audaciousStatus){
	$scope.ip = '10.0.0.219';

	Storage.prototype.setObj = function(key, obj){
		return this.setItem(key, JSON.stringify(obj))
	};

	Storage.prototype.getObj = function(key){
		return JSON.parse(this.getItem(key))
	};

	var checkStatus = function () {
		console.log('Checking status');
		$http.get('http://10.0.0.219:3000/audaciousApi/audaciousStatus')
		.success(function (res){
			if(res === 'off'){
				window.location = '/#/start-audacious';
			} else{
				var e = document.getElementById('bt-play');
				if (!document.getElementById('playback-status')){
					res = res.replace(/\s/g, '');
					if (res === 'playing'){
						e.innerHTML = '&#xf04c;<span id="playback-status">playing</span>';
					} else{
						e.innerHTML = '&#xf04b;<span id="playback-status">paused</span>';
					}
				}
			}
		});
	}
	checkStatus();

	var toggleIcons = function (){
		var e = document.getElementById('bt-play');
		var ee = document.getElementById('playback-status');
		console.log(ee.innerHTML);
		var innerHtml = '&#xf04c;';
		if (ee.innerHTML === 'paused'){
			// Toggle icons
			e.innerHTML = '&#xf04c;<span id="playback-status">playing</span>';
		} else{
			e.innerHTML = '&#xf04b;<span id="playback-status">paused</span>';
		}
	};

	/*(function setButtonsStatus (){
		$http({
			method: 'GET',
			url: '/audaciousApi/playbackStatus'
		})
		.success(function (res){
			console.log('hola ' +res);
			var e = document.getElementById('playback-status');
			if (res.replace(/\s/g, '') === 'paused'){
				e.innerHTML = '&#xf04b;<span id="playback-status" >paused</span>';
			} else{
				e.innerHTML = 'hola';
			}
		});
	})();*/

	// Socket.io setup
	var socket = io.connect('http://'+$scope.ip+':3001/', {
		'reconnection': true,
		'reconnectionDelayMax': 2000,
		'timeout': 3000
	});
	socket.on('event', function (data){
		$scope.songChange();
	});

	socket.on('disconnect', function (){
		// What to do when socket disconnect
	});
	
	if (localStorage.getItem('playlist')){
		$scope.playlist = localStorage.getObj('playlist').songs;
		console.log('Stored Playlist: ');
		// console.log(storedPlaylist);
	}else {
		playlist.success(function (data){
			console.log("playlist downloaded: ");
			console.log(data);
			$scope.playlist = data.songs;
		});
		playlist.error(function (data){
			console.log(data);
		});
	}

	$scope.playSong = function (item) {
		checkStatus();
		var songId = item.target.attributes['song-id'].value;
		var data = {songId: songId};
		var callback = function (html){
			console.log('callback executed')
		}
		postRequest.fn({
			url: 'http://'+$scope.ip+':3000/audaciousCmd/playSong',
			data: data
		});
	}

	$scope.btForward = function (){
		checkStatus();
		postRequest.fn({
			url: '/audaciousCmd/next-previous',
			data: {cmd: 'next'}
		})
		.success(function (res){
			// console.log(res);
		});
	}

	$scope.btBackward = function (){
		checkStatus();
		postRequest.fn({
			url: '/audaciousCmd/next-previous',
			data: {cmd: 'previous'}
		})
		.success(function (res){
			// console.log(res);
		});
	}

	$scope.playpause = function (){
		checkStatus();
		postRequest.fn({
			url: '/audaciousCmd/playpause',
			data: {cmd: 'playpause'}
		});
		toggleIcons();
	}

	$scope.btPlaylist = function (){
		window.location = '/#/playlist';
	}
	$scope.btNowplaying = function (){
		window.location = '/#/nowplaying';
	}

	$scope.songChange = function (){
		var defaultData = {artist: 'N/A', album: 'N/A', title: 'N/A'};
		$scope.currentSong = defaultData;
		$http.get('http://'+$scope.ip+':3000/audaciousApi/currentSong')
		.success(function (data){
			data = data || defaultData;
			if (data.title.length > 18){
				if (document.getElementById('current-title')){
					var e = document.getElementById('current-title');
					e.setAttribute('class', 'title');
					// e.setAttribute('class', 'title scroll');
				}
			} else{
					if (document.getElementById('current-title')){
						document.getElementById('current-title').setAttribute('class', 'title');
					}
			  }
			$scope.currentSong = data;
		})
		.error(function (data){
			console.log(data)
		});
	}
	$scope.songChange();

	$scope.startAudacious = function(){
		postRequest.fn({
			url: '/audaciousCmd/start-audacious',
			data: {cmd: 'start'}
		})
		.success(function (res){
			if (res === 'OK'){
				var e = document.getElementById('bt-on');
				e.setAttribute('class', 'pure-button pure-button-primary green');
				setTimeout(function(){
					$window.location.href = 'http://10.0.0.219:3000/#/nowplaying';
				}, 1000);
			}
		})
	}
}]);