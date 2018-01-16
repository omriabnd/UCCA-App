(function() {
    'use strict';

    angular.module('zAdmin.annotation.directives')
        .directive('unitCategory',unitCategoryDirective);

    /** @ngInject */
    function unitCategoryDirective() {

        var directive = {
            restrict:'E',
            templateUrl:'app/pages/annotation/directives/unitCategory/unitCategory.html',
            scope:{
                color:'=',
                abbreviation:'=',
                name:'=',
                categoryId:'=',
                fromParentLayer:'='
            },
            link: unitCategoryDirectiveLink,
            replace:false

        };

        return directive;

        function unitCategoryDirectiveLink($scope, elem, attrs) {
        }




    }

})();