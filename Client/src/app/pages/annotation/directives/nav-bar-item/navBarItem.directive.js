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
    function ItemController($scope, DataService,selectionHandlerService) {
        //test debo


        function enableRetokenizeButton(){
            var selectedTokenList = selectionHandlerService.getSelectedTokenList();
            
            if(selectedTokenList.length == 0){
                return false;
            }
            if (selectedTokenList[0].unitTreeId!=0){
                return false
            }
            else if(selectedTokenList.length >1){
                    return false;
                }
                else{
                var selectionList = selectionHandlerService.getSelectedTokenList();
                var tokenIntUnit = selectionList[0].inChildUnitTreeId ;
                if(tokenIntUnit==null){
                    return true;
                }
                else {return false}
            }
        }
        // Injecting $scope just for comparison
        var vm = this;
        var annotationPageVM = $scope.$parent.vm;
        vm.itemClicked = itemClicked;
        vm.checkRetokenizeButton = checkRetokenizeButton
        vm.enableRetokenizeButton=enableRetokenizeButton

        function checkRetokenizeButton(data){
            if(data.name == 'Retokenize'){
               return  enableRetokenizeButton();
            }
            return true
        }
        
        if(vm.itemObject.showWhenFull){
            vm.checkIfTaskHasComment = checkIfTaskHasComment;
        }

        function checkIfTaskHasComment(){
            return DataService.serverData && DataService.serverData.user_comment !== "";
        }
        function itemClicked(functionName){
            if(annotationPageVM[functionName]){
                annotationPageVM[functionName]()
            }else{
                console.log("function not exist",functionName);
            }
        }
    }



})();