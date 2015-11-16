app.controller('SocketIoController', ['$scope', 'MainController', function ($scope, MainController){
	console.log('SocketIoController');
	$scope.songChange();
}])
var socket = io.connect('http://10.0.0.219:3001/', {
		reconnection: true
	});
	socket.on('event', function(data){
	});