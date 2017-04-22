var app = angular.module('app', [
    'ngAnimate',
    'ngResource',
    'ui.router',
    'ui.bootstrap',
    'angular-loading-bar',
    'oc.lazyLoad',
    'nouislider'
]);

var globalArray = [];
var dataArray = new Array();
var destinationCities = new Array();
var sourceCities = new Array();

Array.prototype.contains = function(v) {
    for(var i = 0; i < this.length; i++) {
        if(this[i].id === v.id) return true;
    }
    return false;
};

Array.prototype.uniquecity = function() {
    var arr = [];
    for(var i = 0; i < this.length; i++) {
        if(!arr.contains(this[i])) {
            arr.push(this[i].cityName);
        }
    }
    return arr; 
}
 