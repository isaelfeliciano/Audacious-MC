app.controller('MainController', ['$scope', '$http', '$window', 'playlist', 'postRequest', 'audaciousStatus', function ($scope, $http, $window, playlist, postRequest, audaciousStatus){
	$scope.ip = '10.0.0.219';

	var checkStatus = function () {
		console.log('Checking status');
		$http.get('http://10.0.0.219:3000/audaciousApi/audaciousStatus')
		.success(function (res){
			if(res === 'off'){
				window.location = '/#/start-audacious';
			}else{
				// $window.location.href = 'http://10.0.0.219:3000/#/nowplaying';
			}
		});
	}
	checkStatus();

	// Socket.io setup
	var socket = io.connect('http://'+$scope.ip+':3001/', {
		reconnection: true
	});
	socket.on('event', function(data){
		$scope.songChange();
	});

	playlist.success(function (data){
		$scope.playlist = data.songs;
	});
	playlist.error(function (data){
		console.log(data);
	});

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
		var e = document.getElementById('bt-play');
		e.innerHTML = '<span><i class="bt-play center-v pointer fa fa-2x" ng-click="playpause()" style="padding-top:0.1em;">&#xf04c;</i></span>';
		checkStatus();
		postRequest.fn({
			url: '/audaciousCmd/playpause',
			data: {cmd: 'playpause'}
		});
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