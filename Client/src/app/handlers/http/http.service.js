
/* Copyright (C) 2017 Omri Abend, The Rachel and Selim Benin School of Computer Science and Engineering, The Hebrew University. */
(function () {
  'use strict';

  angular.module('zAdmin.http',[
  	'zAdmin.const',
  	])
	.service('httpService', httpService);

	/** @ngInject */
	function httpService($http,$q,$timeout,$rootScope,$location,ENV_CONST,Core,storageService,$state) {
		
		var is_dev = ($location.host() === 'localhost') || ENV_CONST.IS_DEV;
		var url = (is_dev && ENV_CONST.IS_DEV ) ? ENV_CONST.TEST_URL : ENV_CONST.PROD_URL;

		/*var is_prod_server = ($location.absUrl().indexOf($rootScope.PROD_CONST.HOST) > -1);
		if(is_prod_server){
			// for ucca production server
			url = $rootScope.PROD_CONST.API_ENDPOINT;
		}*/

		function SuccessResults (successResult) {
			var response = {
				code:1,
				message:"Success",
				data:successResult.data
			}
			return response;
		}

		function ErrorResults (errorResult) {
			var response = {
				code:999,
				message:"Failed",
				data:errorResult
			}
			var type= {
				"-1": "error",
				"400" : "error",
				"401" :	"info",
				"403" :	"info",
				"404" : "error",
				"415" :	"error",
				"429" :	"error",
				"500" : "warning",
				"502" : "warning",
				"503" : "warning"
			}
			$rootScope.$pageFinishedLoading = true;
			Core.showNotification(type[errorResult.status],errorResult.statusText+":\n"+fetchError(errorResult))
			redirectToLoginOnTokenExpired(errorResult)
			throw errorResult;
		}

		function fetchError(errorResult){
			var res = "";
			if(!!errorResult && !!errorResult.data){
				if(Array.isArray(errorResult.data)){
					res = errorResult.data[0]
				}else if(typeof errorResult.data == "object"){
					if(!!Object.keys(errorResult.data)[0]){
						var moreInfo = Object.keys(errorResult.data)[0] == 'detail' ? "" : ": "+Object.keys(errorResult.data)[0];
						res = errorResult.data[Object.keys(errorResult.data)[0]] + moreInfo
					}
				}
			}
			return res;
		}

		function redirectToLoginOnTokenExpired(errorResult){
			if(errorResult && errorResult.data && errorResult.data.detail == "Invalid token."){
				storageService.clearLocalStorage()
				$state.go('auth',{reload:true})
			}
		}

		function httpRequest(requestType, requestStringName, bodyData, notFromCache, fromResources) {

			if($rootScope.PROD_CONST){
				var requestURL = buildRequestURL(requestType, requestStringName, bodyData, notFromCache, fromResources)
				return requestType(requestURL, bodyData, {cache: !notFromCache}).then(
					SuccessResults,ErrorResults
				);
			}else{
				return $http.get('settings.json').then(function(settings){
					$rootScope.PROD_CONST = settings.data;
					var requestURL = buildRequestURL(requestType, requestStringName, bodyData, notFromCache, fromResources)
					return requestType(requestURL, bodyData, {cache: !notFromCache}).then(
						SuccessResults,ErrorResults
					);
				})
			}

		}
		function buildRequestURL(requestType, requestStringName, bodyData, notFromCache, fromResources){
			var is_prod_server = ($location.absUrl().indexOf($rootScope.PROD_CONST.HOST) > -1);
			if(is_prod_server){
				// for ucca production server
				url = $rootScope.PROD_CONST.API_ENDPOINT;
			}

			var requestURL = url + '/'+ requestStringName;

			if(fromResources){
				requestURL = requestStringName;
			}
			
			if(requestType===$http.get){
				if(bodyData && Object.keys(bodyData).length){
					var bodyDataJson = bodyData;
					Object.keys(bodyData).forEach(function(object,index){
						requestURL += index==0 ? '?' : '&';
						requestURL += bodyData[object]['searchKey']+'='+ bodyData[object]['searchValue'];
					})
				}
			}
			if(requestType===$http.delete){
				requestURL += bodyData;
			}
			return requestURL
		}

		function getHeaders(){
			var headers = {"Content-Type": "application/json"}
			var UserInfo = storageService.getObjectFromLocalStorage('UserInfo');
			if(!!UserInfo && !!UserInfo.token){
				headers = {
				    "Content-Type": "application/json",
				    "Authorization": "Token " + UserInfo.token
				}
			}
			return headers
		}
		var handler = {
		  getRequest: function (requestStringName, bodyData, notFromCache,fromResources) {
		    $http.defaults.headers.get = getHeaders();
		    return httpRequest($http.get, requestStringName,  bodyData, notFromCache, fromResources);
		  },
		  postRequest: function (requestStringName, bodyData, notFromCache,fromResources) {
		    $http.defaults.headers.post = getHeaders();
		    return httpRequest($http.post, requestStringName,  bodyData, notFromCache, fromResources);
		  },
		  putRequest: function (requestStringName, bodyData, notFromCache,fromResources) {
		    $http.defaults.headers.put = getHeaders();
		    return httpRequest($http.put, requestStringName,  bodyData, notFromCache, fromResources);
		  },
		  deleteRequest: function (requestStringName, bodyData, notFromCache,fromResources) {
		    $http.defaults.headers.delete = getHeaders();
		    return httpRequest($http.delete, requestStringName,  bodyData, notFromCache, fromResources);
		  }
		}
		return handler;
	};

})();
