app.service('appService', ['$http', function($http){
	var s = this; 
	
	s.fetchExcelData = function(){
		return $http.get('/api/getExcelData/1');
	}
		 
}]);