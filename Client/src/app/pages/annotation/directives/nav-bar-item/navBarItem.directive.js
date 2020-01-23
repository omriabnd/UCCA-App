(function () {
    'use strict';

    angular
        .module('zAdmin.annotation.directives')
        .directive('navBarItem', navBarItemDirective);


    function navBarItemDirective() {
        var directive = {
            restrict: 'E',
            templateUrl: 'app/pages/annotation/directives/nav-bar-item/navBarItem.html',
            scope: {
                imagePath: '=',
                toolTip: '=',
                itemObject: '='
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
    function ItemController($scope, DataService, selectionHandlerService) {

        function partsOfRetokenizedToken() {
            var selectedTokenList = selectionHandlerService.getSelectedTokenList();

            if (selectedTokenList[0] != undefined) {

                if (selectedTokenList[0].static.splitByTokenization == true) {
                    var arr = [];
                    var rightTokens = checkRight(selectedTokenList[0], arr);
                    var rightAndLeftTokens = checkLeft(selectedTokenList[0], rightTokens);
                    return rightAndLeftTokens;
                }
                else {
                    var arr = []
                    var onlyRightTokens = checkRight(selectedTokenList[0], arr);
                    return onlyRightTokens
                }
            }
        };

        function checkRight(selectedTokenList, arr) {

            if (selectedTokenList != undefined) {

                var index = selectedTokenList.indexInUnit;

                if (DataService.tree.tokens[index].static.splitByTokenization == true) {
                    arr.push(DataService.tree.tokens[index])
                    checkRight(DataService.tree.tokens[index + 1], arr)
                }
                else {

                    if (arr.length == 0) {
                        arr.push(DataService.tree.tokens[index])
                        checkRight(DataService.tree.tokens[index + 1], arr)
                    }

                }
                return arr
            }
        };
        function checkLeft(selectedTokenList, arr) {

            if (selectedTokenList != undefined) {
                var index = selectedTokenList.indexInUnit;
                if (arr.length == 0) {
                    arr.push(DataService.tree.tokens[index])
                }
                if (DataService.tree.tokens[index - 1].static.splitByTokenization == true) {
                    arr.push(DataService.tree.tokens[index - 1])
                    checkLeft(DataService.tree.tokens[index - 1], arr)
                }
                else {
                    arr.push(DataService.tree.tokens[index - 1])

                }
                return arr
            }
        }

        function enableRetokenizeButton() {
            var notAParent = true
            var listOfTokens = partsOfRetokenizedToken();
            if (listOfTokens != undefined) {
                for (var i = 0; i < listOfTokens.length; i++) {
                    if (listOfTokens[i].inChildUnitTreeId != null) {
                        notAParent = false;
                    }
                    if (notAParent == false) {
                        return false;
                    }
                }
            }
            var selectedTokenList = selectionHandlerService.getSelectedTokenList();
            console.log(DataService.tree)

            if (selectedTokenList.length == 0) {
                return false;
            }
            if (selectedTokenList[0].unitTreeId != 0) {
                return false
            }
            else if (selectedTokenList.length > 1) {
                return false;
            }
            else {
                var selectionList = selectionHandlerService.getSelectedTokenList();
                var tokenIntUnit = selectionList[0].inChildUnitTreeId;
                if (tokenIntUnit == null) {
                    return true;
                }
                else { return false }
            }
        }
        // Injecting $scope just for comparison
        var vm = this;
        var annotationPageVM = $scope.$parent.vm;
        vm.itemClicked = itemClicked;
        vm.checkRetokenizeButton = checkRetokenizeButton
        vm.enableRetokenizeButton = enableRetokenizeButton

        function checkRetokenizeButton(data) {
            if (data.name == 'Retokenize') {
                return enableRetokenizeButton();
            }
            return true
        }

        if (vm.itemObject.showWhenFull) {
            vm.checkIfTaskHasComment = checkIfTaskHasComment;
        }

        function checkIfTaskHasComment() {
            return DataService.serverData && DataService.serverData.user_comment !== "";
        }
        function itemClicked(functionName) {
            if (annotationPageVM[functionName]) {
                annotationPageVM[functionName]()
            } else {
                console.log("function not exist", functionName);
            }
        }
    }



})();