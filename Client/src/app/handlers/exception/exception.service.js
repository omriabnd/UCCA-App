
/* Copyright (C) 2017 Omri Abend, The Rachel and Selim Benin School of Computer Science and Engineering, The Hebrew University. */
(function () {
  'use strict';

  angular.module('zAdmin.exceptionOverwrite')
	.service('$exceptionHandler', exceptionService);

	/** @ngInject */
	function exceptionService($log) {

		return function myExceptionHandler(exception, cause) {
	      // logErrorsToBackend(exception, cause);
	      $log.info(exception.message, cause);
	    };
	}

})();
