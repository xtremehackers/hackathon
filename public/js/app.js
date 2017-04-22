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
var atlantaData = [];
var dataArray = new Array();
var destinationCities = new Array();
var sourceCities = new Array();

Array.prototype.contains = function(v) {
    for(var i = 0; i < this.length; i++) {
        if (this[i].cityName === v.cityName) return true;
    }
    return false;
};

Array.prototype.uniquecity = function() {
    var arr = [];
    for(var i = 0; i < this.length; i++) {
        if(!arr.contains(this[i])) {
            arr.push(this[i]);
        }
    }
    return arr; 
}
 