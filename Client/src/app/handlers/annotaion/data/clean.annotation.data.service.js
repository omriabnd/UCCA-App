(function() {
    'use strict';

    angular.module('zAdmin.annotation.data')
        .factory('CleanDataService',CleanDataService);

    function CleanDataService($q, $http, apiService, $rootScope, restrictionsValidatorService, ENV_CONST, Core, AssertionService) {
        console.log("CleanDataService is here")
    }

})();
