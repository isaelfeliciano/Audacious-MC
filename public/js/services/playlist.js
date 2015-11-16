app.factory('playlist', ['$http', function ($http){
	return $http.get('http://10.0.0.219:3000/audaciousApi/playlist')
		.success(function (data){
			return data;
		})
		.error(function (data){
			return data;
		});
}]);