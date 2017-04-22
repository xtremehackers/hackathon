app.directive('fileModel', ['$parse', function ($parse) {
    return {
        restrict: 'A',
        link: function(scope, element, attrs) {
            var model = $parse(attrs.fileModel);
            var modelSetter = model.assign;

            element.bind('change', function(){
            	if (navigator.appVersion.toString().indexOf('.NET') > 0)
            		modelSetter(scope, element[0].files[0]);
            else
            {
            	scope.$apply(function(){
                    modelSetter(scope, element[0].files[0]);
                });
            }
                
            });
        }
    };
}]);