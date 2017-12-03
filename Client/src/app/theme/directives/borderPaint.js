/* Copyright (C) 2017 Omri Abend, The Rachel and Selim Benin School of Computer Science and Engineering, The Hebrew University. */
(function () {
    'use strict';

    angular.module('zAdmin.theme')
        .directive('borderPaint', borderPaint);

    /** @ngInject */
    function borderPaint($timeout, $parse, DataService) {

        var directive = {
            restrict:'A',
            link: lincFunc,
            replace:false

        };

        function lincFunc(scope, element, attrs){
            var borderStyles = "{border: 1px solid}";


            // scope.$watch('scope.dirCtrl.token.backgroundColor',function(newVal,oldVal){
            //     console.log(scope.dirCtrl.token.backgroundColor);
            //     var parentUnit  = DataService.getUnitById(DataService.getParentUnitId(scope.dirCtrl.parentId));
            // });
        }

        return directive;
    }

})();