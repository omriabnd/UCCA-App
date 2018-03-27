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
                toolTip:'=',
                itemObject:'='
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
    function ItemController($scope, DataService) {
        // Injecting $scope just for comparison
        var vm = this;
        var annotationPageVM = $scope.$parent.vm;
        vm.itemClicked = itemClicked;
        
        if(vm.itemObject.showWhenFull){
            vm.checkIfTaskHasComment = checkIfTaskHasComment;
        }

        function checkIfTaskHasComment(){
            return DataService.serverData && DataService.serverData.user_comment !== "";
        }
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