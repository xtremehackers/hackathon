app
    .config(function ($stateProvider, $urlRouterProvider){
        $urlRouterProvider.otherwise("/home");


        $stateProvider
        
            //------------------------------
            // HOME
            //------------------------------
        
            .state ('home', {
                url: '/home',
                templateUrl: 'views/home.html',
                resolve: {
                    loadPlugin: function($ocLazyLoad) {
                        return $ocLazyLoad.load ([
                            {
                                name: 'vendors',
                                insertBefore: '#app-level-js',
                                files: [
                                    'vendors/sparklines/jquery.sparkline.min.js'
                                ]
                            }
                        ])
                    }
                }
            })
        

            //------------------------------
            // DEFAULT
            //------------------------------
        
            .state ('default', {
                url: '/default',
                templateUrl: 'views/default.html'
            })
			
    });
