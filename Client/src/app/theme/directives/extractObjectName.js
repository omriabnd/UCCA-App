/**
 * Auto expand textarea field
 */
(function () {
    'use strict';

    angular.module('zAdmin.theme')
        .directive('extractObjectName', extractObjectName);

    /** @ngInject */
    function extractObjectName($timeout) {
        return {
            restrict: 'A',
            scope:{
              fieldElem:"="
            },
            link: function ($scope, elem) {

                $timeout(function () {
                    //DOM has finished rendering
                    elem[0].value = $scope.fieldElem.name;
                });
            }
        };
    }

})();