(function() {
    'use strict';

    angular.module('zAdmin.annotation.directives')
        .directive('annotationToken',annotationTokenDirective);

    /** @ngInject */
    function annotationTokenDirective($rootScope,selectionHandlerService,HotKeysManager,DataService) {

        var directive = {
            restrict:'E',
            templateUrl:'app/pages/annotation/directives/token/token.html',
            scope:{
                token:"=",
                parentId:"@"
            },
            link: annotationTokenDirectiveLink,
            controller: AnnotationTokenController,
            controllerAs: 'dirCtrl',
            bindToController: true,
            replace:true,
            tokenClicked: false

        };

        return directive;

        function annotationTokenDirectiveLink($scope, elem, attrs) {
            $scope.vm = $scope.dirCtrl;
            $scope.vm.token['indexInParent'] = !$scope.vm.token['indexInParent'] ? $scope.$parent.$index : $scope.vm.token['indexInParent'];
            $scope.vm.tokenInSelectionList = tokenInSelectionList;

            $scope.$on('tokenIsClicked', function(event, args) {
                var ctrlPressed = HotKeysManager.checkIfHotKeyIsPressed('ctrl');
                var shiftPressed = HotKeysManager.checkIfHotKeyIsPressed('shift');

                if(args.token.id !== $scope.vm.token.id ){
                    !ctrlPressed ? $scope.vm.tokenIsClicked = false : '';
                }else if(args.parentId !== undefined && (args.parentId.toString() ===  $scope.vm.parentId )){
                    !ctrlPressed && !shiftPressed && !args.selectAllTokenInUnit ? selectionHandlerService.clearTokenList() : '';
                    if(selectionHandlerService.isTokenInList($scope.vm.token) && !args.doNotRemoveExistingToken){
                        selectionHandlerService.removeTokenFromList($scope.vm.token.id);
                    }else{
                        selectionHandlerService.addTokenToList($scope.vm.token,$scope.vm.parentId,args.selectAllTokenInUnit);
                    }
                    // $scope.vm.tokenIsClicked = true;
                }
            });

        }




        function AnnotationTokenController() {
            var vm = this;
            vm.token['inUnit'] === undefined ? vm.token['inUnit'] = null : '';
            vm.tokenIsClicked = directive.tokenClicked;
            vm.tokenClicked = tokenClicked;
            vm.isUnitClicked = isUnitClicked;
            vm.addOnHover = addOnHover;
            vm.tokenDbClick = tokenDbClick;
            vm.tokenUnitIsSelected = tokenUnitIsSelected;
            vm.initToken = initToken;
            vm.mouseUpFromToken = mouseUpFromToken;
            vm.currntToken = null;
        }

        function tokenDbClick(vm){
            selectionHandlerService.clearTokenList();
            if(vm.token.inUnit !== null && vm.token.inUnit !== undefined){
                DataService.getUnitById(vm.token.inUnit).gui_status = "OPEN";
                DataService.getUnitById(DataService.getParentUnitId(vm.token.inUnit)).gui_status = "OPEN";
                selectionHandlerService.updateSelectedUnit(vm.token.inUnit);

                var container = $('html, body'),
                    scrollTo = $('#unit-'+vm.token.inUnit);

                // Or you can animate the scrolling:
                container.animate({
                    scrollTop: scrollTo.offset().top - container.offset().top + container.scrollTop() - 300
                },0, "linear");
            }

        }

        function isUnitClicked(vm,index){
            vm.token.parentId === undefined ?  vm.token.parentId = "0": '';
            return selectionHandlerService.getSelectedUnitId() === vm.token.parentId && getUnitCursorLocation(vm.token) === index.toString();
        }

        function getUnitCursorLocation(token){
            var parentUnit = DataService.getUnitById(token.parentId);
            return parentUnit.cursorLocation.toString();
        }

        function getAllTokensBetweenStartTokenToCurrentToken(startTokenIndex,endTokenIndex){
            var selectedUnitId = selectionHandlerService.getSelectedUnitId();
            var selectedUnit = DataService.getUnitById(selectedUnitId);

            var copyTokenArray = angular.copy(selectedUnit.tokens);

            return copyTokenArray.slice(startTokenIndex,endTokenIndex+1);
        }

        function addOnHover(vm){
            //selectionHandlerService.getMouseMode()
            if(HotKeysManager.checkIfHotKeyIsPressed('shift')){

                var startToken = selectionHandlerService.getSelectedToken();

                if(startToken){
                    var tokenArray = [];
                    if(startToken.indexInParent <= vm.token.indexInParent){
                        selectionHandlerService.clearTokenList();

                        var selectedUnitId = selectionHandlerService.getSelectedUnitId();
                        var selectedUnit = DataService.getUnitById(selectedUnitId);

                        for(var i=startToken.indexInParent; i<=vm.token.indexInParent; i++){
                            if(selectedUnit.tokens[i] === undefined){
                                break;
                            }
                            $rootScope.$broadcast('tokenIsClicked', {
                                token: selectedUnit.tokens[i],
                                parentId: selectedUnit.tokens[i].parentId || "0",
                                selectAllTokenInUnit: false
                            });
                        }
                    }else{
                        selectionHandlerService.clearTokenList();

                        var selectedUnitId = selectionHandlerService.getSelectedUnitId();
                        var selectedUnit = DataService.getUnitById(selectedUnitId);

                        for(var i=vm.token.indexInParent; i<=startToken.indexInParent; i++){
                            if(selectedUnit.tokens[i] === undefined){
                                break;
                            }
                            $rootScope.$broadcast('tokenIsClicked', {
                                token: selectedUnit.tokens[i],
                                parentId: selectedUnit.tokens[i].parentId || "0",
                                selectAllTokenInUnit: false
                            });
                        }
                    }

                }else{
                    selectionHandlerService.setSelectedToken(vm.token);
                }
            }
        }

        function initToken(vm,index){
            console.log(index)
        }

        function tokenClicked(vm,doNotUpdateSelectedToken){

            directive.tokenClicked = !directive.tokenClicked;
            vm.tokenIsClicked = !vm.tokenIsClicked;
            selectionHandlerService.setTokenClicked();

            selectionHandlerService.setLastInsertedToken(vm.token);

            !doNotUpdateSelectedToken ? selectionHandlerService.setSelectedToken(vm.token) : '';

            var tokenInUnit = DataService.getUnitById(vm.token.inUnit);
            if(vm.token.inUnit !== null && tokenInUnit){
                var ctrlPressed = HotKeysManager.checkIfHotKeyIsPressed('ctrl');
                !ctrlPressed ? selectionHandlerService.clearTokenList() : '';
                var parentUnit = DataService.getUnitById(vm.token.parentId);
                var tokenGroup = parentUnit.tokens.filter(function(x) {return x.inUnit === vm.token.inUnit; });

                tokenGroup.forEach(function(token){
                    $rootScope.$broadcast('tokenIsClicked',{token: token, parentId: token.parentId,selectAllTokenInUnit: true});
                })
            }else{
                $rootScope.$broadcast('tokenIsClicked',{token: vm.token, parentId: vm.parentId, selectAllTokenInUnit: false});
            }
        }

        function tokenUnitIsSelected(vm){
            if(!vm.token.parentId){
                vm.token.parentId = "0";
            }
            return selectionHandlerService.getSelectedUnitId() === vm.token.parentId;
        }

        function tokenInSelectionList(vm){
            var selectionList = selectionHandlerService.selectedTokenList;
            var elementPos = selectionList.map(function(x) {return x.id; }).indexOf(vm.token.id);
            return elementPos > -1;
        }

        function mouseUpFromToken(vm){
            var selectedTokenArray = selectionHandlerService.getSelectedTokenList();
            var direction = "UP"
            if(selectionHandlerService.getLastInsertedToken() !== null && selectionHandlerService.getLastInsertedToken().start_index > vm.token.start_index){
                direction = "DOWN"
            }
            var tokenListLength = angular.copy(selectedTokenArray.length);

            selectedTokenArray.forEach(function(token,index){
                if(token.inUnit){
                    var tokenUnit = DataService.getUnitById(token.inUnit);
                    if(tokenUnit && tokenUnit.annotation_unit_tree_id !== '0'){
                        var parentID = DataService.getParentUnitId(tokenUnit.annotation_unit_tree_id);
                        for(var i=0; i<tokenUnit.tokens.length; i++){
                            $rootScope.$broadcast('tokenIsClicked', {
                                token: tokenUnit.tokens[i],
                                parentId: parentID || "0",
                                selectAllTokenInUnit: true,
                                doNotRemoveExistingToken: true
                            });
                        }
                        var parentUnit = DataService.getParentUnit(tokenUnit.tokens[0].parentId);
                        var elementPos = parentUnit.tokens.map(function(x) {return x.id; }).indexOf(tokenUnit.tokens[0].id);
                        if(parentUnit.tokens[elementPos].start_index < vm.token.start_index && direction === "DOWN"){
                            $rootScope.$broadcast('moveCursor', {
                                token: parentUnit.tokens[elementPos],
                                parentId: DataService.getParentUnitId(tokenUnit.tokens[0].parentId) || "0"
                            });
                        }
                    }
                }
                if(index === tokenListLength - 1){
                    var parentUnit = DataService.getParentUnit(selectedTokenArray[selectedTokenArray.length - 1].parentId);
                    var elementPos = parentUnit.tokens.map(function(x) {return x.id; }).indexOf(selectedTokenArray[selectedTokenArray.length - 1].id);
                    $rootScope.$broadcast('moveCursor', {
                        token: parentUnit.tokens[elementPos + 1],
                        parentId: DataService.getParentUnitId(selectedTokenArray[selectedTokenArray.length - 1].parentId) || "0"
                    });
                }
                // $rootScope.$broadcast('moveCursor', {
                //     token: vm.token,
                //     parentId: vm.token.parentId || "0"
                // });
            })

        }


    }

})();
