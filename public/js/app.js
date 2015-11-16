var app = angular.module("ACA", ['ngRoute']);
app.config(function ($routeProvider){
	$routeProvider
		.when('/', {
			controller: 'MainController',
			templateUrl: 'js/views/playlist.html'
		})
		.when('/nowplaying', {
			controller: 'MainController',
			templateUrl: 'js/views/now-playing.html'
		});
});