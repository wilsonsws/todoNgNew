(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
    typeof define === 'function' && define.amd ? define(factory) :
      global.storedb = factory()
}(this, function () {
  'use strict';
  return function (collectionName) {
    collectionName = collectionName ? collectionName : 'default';

    var err;
    var cache = localStorage[collectionName] ? JSON.parse(localStorage[collectionName]) : [];

    return {

      insert: function (obj, callback) {
        obj["_id"] = new Date().valueOf();
        cache.push(obj);
        localStorage.setItem(collectionName, JSON.stringify(cache));
        if (callback)
          callback(err, obj);
      },

      find: function (obj, callback) {
        if (arguments.length == 0) {
          return cache;
        } else {
          var result = [];

          for (var key in obj) {
            for (var i = 0; i < cache.length; i++) {
              if (cache[i][key] == obj[key]) {
                result.push(cache[i]);
              }
            }
          }
          if (callback)
            callback(err, result);
          else
            return result;
        }
      },

      update: function (obj, upsert, callback) {

        for (var key in obj) {
          for (var i = 0; i < cache.length; i++) {
            if (cache[i][key] == obj[key]) {

              end_loops:
                for (var upsrt in upsert) {
                  switch (upsrt) {
                    case "$inc":
                      for (var newkey in upsert[upsrt]) {
                        cache[i][newkey] = parseInt(cache[i][newkey]) + parseInt(upsert[upsrt][newkey]);
                      }
                      break;

                    case "$set":
                      for (var newkey in upsert[upsrt]) {
                        cache[i][newkey] = upsert[upsrt][newkey];
                      }
                      break;

                    case "$push":
                      for (var newkey in upsert[upsrt]) {
                        cache[i][newkey].push(upsert[upsrt][newkey]);
                      }
                      break;

                    default:
                      upsert['_id'] = cache[i]['_id'];
                      cache[i] = upsert;
                      break end_loops;
                  }
                }
            }
          }
        }
        localStorage.setItem(collectionName, JSON.stringify(cache));
        if (callback)
          callback(err);

      },

      remove: function (obj, callback) {
        if (arguments.length == 0) {
          localStorage.removeItem(collectionName);
        } else {

          for (var key in obj) {
            for (var i = cache.length - 1; i >= 0; i--) {
              if (cache[i][key] == obj[key]) {
                cache.splice(i, 1);
              }
            }
          }
          localStorage.setItem(collectionName, JSON.stringify(cache));
        }

        if (callback)
          callback(err);

      }

    };
  };
}));

angular.module('myApp', []).controller('todoCtrl', function($scope) {
$scope.content = '';
$scope.fstatus = '';
$scope.todos = storedb('todos').find();
$scope.edit = false;
$scope.incomplete = false;
$scope.timer = '0';

$scope.creatItem = function() {
    $scope.edit = false;
 };
 
$scope.editItem = function(time) {
   $scope.edit = true;
   var olddata = storedb('todos').find({"time":time});
   $scope.timer = olddata[0].time;
   $scope.content = olddata[0].content;
};

$scope.changeFinish = function(time) {
	storedb('todos').update({"time":time}, {"$set":{"fstatus":true}},function(err){
            if(!err){ $scope.todos = storedb('todos').find();} 
			else {alert(err)}
            })
};

$scope.changeRelease = function(time) {
	storedb('todos').update({"time":time}, {"$set":{"fstatus":false}},function(err){
            if(!err){ $scope.todos = storedb('todos').find();} 
			else {alert(err)}
            })
};

$scope.deletItem = function(time) {
	storedb('todos').remove({"time":time},function(err){
            if(!err){ $scope.todos = storedb('todos').find();} 
			else {alert(err)}
            })
};

$scope.updateItem = function(){
    if (!$scope.edit){
	    var tid = new Date();
	    var newtime = tid.getTime();
	    storedb('todos').insert({"time":newtime, "content":$scope.content, "fstatus":$scope.fstatus },function(err){
            if(!err){ $scope.todos = storedb('todos').find();} 
			else {alert(err)}
            })
	}
	else {
	   		storedb('todos').update({"time":$scope.timer}, {"$set":{"content":$scope.content}},function(err){
            if(!err){ $scope.todos = storedb('todos').find(); $scope.edit = false;} 
			else {alert(err)}
            })
		}
};

$scope.$watch('content', function() {$scope.test();});

$scope.test = function() {
  $scope.incomplete = false;
  if ($scope.content.length) {
     $scope.incomplete = true;
  }
};

$scope.rreset = function(){ 
	localStorage.clear(); 
	$scope.todos = storedb('todos').find();
	};

});