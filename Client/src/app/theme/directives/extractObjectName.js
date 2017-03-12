/**
 * Auto expand textarea field
 */
/* Copyright (C) 2017 Omri Abend, The Rachel and Selim Benin School of Computer Science and Engineering, The Hebrew University. */
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

                $timeout/* Copyright (C) 2017 Omri Abend, The Rachel and Selim Benin School of Computer Science and Engineering, The Hebrew University. */
(function () {
                    //DOM has finished rendering
                    elem[0].value = $scope.fieldElem.name;
                });
            }
        };
    }

})();