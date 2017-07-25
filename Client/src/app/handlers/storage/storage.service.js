
/* Copyright (C) 2017 Omri Abend, The Rachel and Selim Benin School of Computer Science and Engineering, The Hebrew University. */
(function () {
  'use strict';

  angular.module('zAdmin.storage')
	.service('storageService', storageService);

	/** @ngInject */
	function storageService() {

		var storage = {
		    
		    saveInLocalStorage: function(key,value){
		      localStorage.setItem(key, value);
		    },
		    deleteFromLocalStorage: function(key){
		      localStorage.removeItem(key);
		    },
		    getFromLocalStorage: function(key){
		      return localStorage.getItem(key);
		    },
		    saveObjectInLocalStorage: function(key, value){
		      localStorage.setItem(key, JSON.stringify(value));
		    },
		    getObjectFromLocalStorage: function(key){
		    	try{
		    		return JSON.parse(localStorage.getItem(key));
		    	}catch(e){
		    		console.error(e);
		    		return {};
		    	}
		    },
		    clearLocalStorage: function(){
		      localStorage.clear();
		    }
		}

		return storage;
	}

})();
