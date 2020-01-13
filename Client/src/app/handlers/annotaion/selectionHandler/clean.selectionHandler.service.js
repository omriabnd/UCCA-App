/* Copyright (C) 2017 Omri Abend, The Rachel and Selim Benin School of Computer Science and Engineering, The Hebrew University. */
(function () {
    'use strict';

    angular.module('zAdmin.annotation.selectionHandler')
        .service('CleanSelectionHandlerService', CleanSelectionHandlerService);

    /** @ngInject */
    function CleanSelectionHandlerService(CleanDataService, $rootScope, $q, Core, AssertionService) {
        console.log("CleanSelectionHandlerService is here")
    }

})();