(function() {
    'use strict';

    angular
        .module('zAdmin.annotation.directives')
        .directive('navBarItem',navBarItemDirective);
        

    function navBarItemDirective() {
        var directive = {
            restrict:'E',
            templateUrl:'app/pages/annotation/directives/nav-bar-item/navBarItem.html',
            scope:{
                imagePath:'=',
                toolTip:'='
            },
            link: linkFunction,
            controller: ItemController,
            controllerAs: 'vm',
            bindToController: true

        };

        return directive;

        function linkFunction($scope, elem, attrs, modelCtrl) {
            // $($(elem).children().children()[0]).css('background-color',$scope.defCtrl.definitionDetails.color);
        }


    }

    /** @ngInject */
    function ItemController($scope) {
        // Injecting $scope just for comparison
        var vm = this;
        var annotationPageVM = $scope.$parent.vm;
        vm.itemClicked = itemClicked;

        function itemClicked(functionName){
            console.log(functionName);
            if(annotationPageVM[functionName]){
                annotationPageVM[functionName]()
            }else{
                console.log("function not exist",functionName);
            }
        }
    }



})();