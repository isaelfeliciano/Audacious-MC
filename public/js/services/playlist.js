app.factory('playlist', ['$http', function ($http){
	if (window.localStorage.getItem('playlist')){
		return false;
	}else{
		return $http.get('http://10.0.0.219:3000/audaciousApi/playlist')
			.success(function (data){
				var dataJson = JSON.stringify(data.songs);
				window.localStorage.setItem('playlist', dataJson);
				console.log('Playlist From Server: ');
				console.log(data.songs);
				return data;
			})
			.error(function (data){
				return data;
			});
	}
}]);