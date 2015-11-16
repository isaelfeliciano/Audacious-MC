app.factory('audaciousStatus', ['$http', function ($http){
	return $http.get('http://10.0.0.219:3000/audaciousStatus')
		.success(function (data){
			console.log(data);
			return data;
		})
		.error(function (err) {
			console.log(err);
			return err;
		});
}])

.factory('postRequest', ['$http', function ($http){
	return {
		fn: function(options, callback){
			$http({
				method: 'post',
				url: options.url,
				data: options.data
			}).success(function (res){
				if (callback !== undefined) {callback(res)}
			});
		}
	}
}])