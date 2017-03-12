/**
 * Animated load block
 */
/* Copyright (C) 2017 Omri Abend, The Rachel and Selim Benin School of Computer Science and Engineering, The Hebrew University. */
(function () {
    'use strict';

    angular.module('zAdmin.theme')
        .directive('setSortable', setSortable);

    /** @ngInject */
    function setSortable($timeout, $rootScope) {
        return {
            restrict: 'A',
            scope:{
              isSortable: '='
            },
            link: function ($scope, elem) {
                if($scope.isSortable){
                    var element = $(elem)[0];
                    $(element).attr('ui-sortable');
                }
            }
        };
    }

})();