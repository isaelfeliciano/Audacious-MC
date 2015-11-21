app.factory('audaciousStatus', ['$http', function ($http){
	return $http.get('http://10.0.0.219:3000/audaciousApi/audaciousStatus')
		.success(function (data){
			console.log('data: '+data);
			return data;
		})
		.error(function (err) {
			console.log('error: '+err);
			return err;
		});
}])

.factory('postRequest', ['$http', function ($http){
	return {
		fn: function(options){
			return $http({
				method: 'post',
				url: options.url,
				data: options.data
			})
			.success(function (res){
				return res
			})
			.error(function (err){
				return err
			});
		}
	}
}])