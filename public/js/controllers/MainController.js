app.controller('MainController', ['$scope', '$http', 'playlist', 'postRequest', function ($scope, $http, playlist, postRequest){
	$scope.ip = '10.0.0.219';

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
		var songId = item.target.attributes['song-id'].value;
		var data = {songId: songId};
		var callback = function (html){
			console.log('callback executed')
		}
		postRequest.fn({
			url: 'http://'+$scope.ip+':3000/audaciousCmd/playSong',
			data: data
		}, callback);
	}

	$scope.btForward = function (){
		postRequest.fn({
			url: '/audaciousCmd/next-previous',
			data: {cmd: 'next'}
		})
	}

	$scope.btBackward = function (){
		postRequest.fn({
			url: '/audaciousCmd/next-previous',
			data: {cmd: 'previous'}
		})
	}

	$scope.playpause = function (){
		postRequest.fn({
			url: '/audaciousCmd/playpause',
			data: {cmd: 'playpause'}
		});
	}

	$scope.songChange = function (){
		$http.get('http://'+$scope.ip+':3000/audaciousApi/currentSong')
		.success(function (data){
			if (data.title.length > 18){
				var e = document.getElementById('current-title');
				e.setAttribute('class', 'title');
				e.setAttribute('class', 'title scroll');
				$scope.currentSong = data;
			} else{
					document.getElementById('current-title').setAttribute('class', 'title');
					$scope.currentSong = data;
			}
		})
		.error(function (data){
			console.log(data)
		});
	}
	$scope.songChange();
}]);