(function() {
    'use strict';

    angular.module('zAdmin.annotation.directives')
        .directive('annotationToken',annotationTokenDirective);

    /** @ngInject */
    function annotationTokenDirective($rootScope,selectionHandlerService,HotKeysManager,DataService,Core) {

        var directive = {
            restrict:'E',
            templateUrl:'app/pages/annotation/directives/token/token.html',
            scope:{
                token:"=",
                unitTreeId:"@"
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
            $scope.vm.token['indexInUnit'] = !$scope.vm.token['indexInUnit'] ? $scope.$parent.$index : $scope.vm.token['indexInUnit'];
            $scope.vm.tokenInSelectionList = tokenInSelectionList;

            $scope.$on('tokenIsClicked', function(event, args) {
                var ctrlPressed = HotKeysManager.checkIfCtrlOrCmdPressed();
                // var ctrlPressed = HotKeysManager.checkIfHotKeyIsPressed('ctrl');
                var shiftPressed = HotKeysManager.checkIfHotKeyIsPressed('shift');

                if(args.token && args.token.static.id !== $scope.vm.token.static.id ){
                    !ctrlPressed ? $scope.vm.tokenIsClicked = false : '';
                }else if(args.unitTreeId !== undefined && (args.unitTreeId.toString() ===  $scope.vm.unitTreeId )){
                    !ctrlPressed && !shiftPressed && !args.selectAllTokenInUnit ? selectionHandlerService.clearTokenList() : '';
                    if(selectionHandlerService.isTokenInList($scope.vm.token) && !args.doNotRemoveExistingToken){
                        selectionHandlerService.removeTokenFromList($scope.vm.token.static.id);
                    }else{
                        selectionHandlerService.addTokenToList($scope.vm.token, $scope.vm.unitTreeId, args.selectAllTokenInUnit);
                    }
                    // $scope.vm.tokenIsClicked = true;
                }
            });

            /*
            // TODO: Only catch this event if this token is in unit 0
            // TODO: Highlight using a CSS class and not a style
            $scope.$on('highlightTokens', function(event, args) {
                $scope.vm.token.highlightStyle = ''; // reset pre highlight
                for (var i=0; i<args.tokens.length;i++)
                {
                    if ($scope.vm.token.id === args.tokens[i].id) {
                        $scope.vm.token.highlightStyle = "font-weight: bold;";
                    }
                }
            })
            */
        }


        function AnnotationTokenController() {
            var vm = this;
            vm.token['inChildUnitTreeId'] === undefined ? vm.token['inChildUnitTreeId'] = null : '';
            vm.tokenIsClicked = directive.tokenClicked;
            vm.tokenClicked = tokenClicked;
            vm.isUnitClicked = isUnitClicked;
            vm.addOnHover = addOnHover;
            vm.tokenDbClick = tokenDbClick;
            vm.tokenUnitIsSelected = tokenUnitIsSelected;
            vm.initToken = initToken;
            vm.mouseUpFromToken = mouseUpFromToken;
            vm.showEllipsis = showEllipsis;
            vm.currntToken = null;
        }

        function openUnits(annotationUnits) {
            for (var u = 0 ; u < annotationUnits.length; u++) {
                annotationUnits[u].gui_status = "OPEN";
                if (annotationUnits[u].AnnotationUnits) {
                    openUnits(annotationUnits[u].AnnotationUnits);
                }
            }
        }

        function tokenDbClick(vm){
            selectionHandlerService.clearTokenList();
            if(vm.token.inChildUnitTreeId !== null && vm.token.inChildUnitTreeId !== undefined){
                var unit = DataService.getUnitById(vm.token.inChildUnitTreeId);
                if(!unit){
                  return;
                }
                unit.gui_status = "OPEN";
                // Open all children (annotation units)
                openUnits(unit.AnnotationUnits);
                // DataService.getUnitById(DataService.getParentUnitId(vm.token.inChildUnitTreeId)).gui_status = "OPEN";
                selectionHandlerService.updateSelectedUnit(vm.token.inChildUnitTreeId);

                Core.scrollToUnit(vm.token.inChildUnitTreeId);
            }

        }

        function isUnitClicked(vm,index){
            vm.token.unitTreeId === undefined ?  vm.token.unitTreeId = "0": '';
            return selectionHandlerService.getSelectedUnitId() === vm.token.unitTreeId && getUnitCursorLocation(vm.token) === index.toString();
        }

        function getUnitCursorLocation(token){
            var parentUnit = DataService.getUnitById(token.unitTreeId);
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
                    if(startToken.indexInUnit <= vm.token.indexInUnit){
                        selectionHandlerService.clearTokenList();

                        var selectedUnitId = selectionHandlerService.getSelectedUnitId();
                        var selectedUnit = DataService.getUnitById(selectedUnitId);

                        for(var i=startToken.indexInUnit; i<=vm.token.indexInUnit; i++){
                            if(selectedUnit.tokens[i] === undefined){
                                break;
                            }
                            $rootScope.$broadcast('tokenIsClicked', {
                                token: selectedUnit.tokens[i],
                                unitTreeId: selectedUnit.tokens[i].unitTreeId  || "0",
                                selectAllTokenInUnit: false
                            });
                        }
                    }else{
                        selectionHandlerService.clearTokenList();

                        var selectedUnitId = selectionHandlerService.getSelectedUnitId();
                        var selectedUnit = DataService.getUnitById(selectedUnitId);

                        for(var i=vm.token.indexInUnit; i<=startToken.indexInUnit; i++){
                            if(selectedUnit.tokens[i] === undefined){
                                break;
                            }
                            $rootScope.$broadcast('tokenIsClicked', {
                                token: selectedUnit.tokens[i],
                                unitTreeId: selectedUnit.tokens[i].unitTreeId || "0",
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
            console.log(index);
        }

        function tokenClicked(vm,doNotUpdateSelectedToken){
            if( vm.token.text === '<br>' ){
               return;
            }
            if(selectionHandlerService.getUnitToAddRemotes() !== "0"){
              return;
            }

            directive.tokenClicked = !directive.tokenClicked;
            vm.tokenIsClicked = !vm.tokenIsClicked;
            selectionHandlerService.setTokenClicked();

            selectionHandlerService.setLastInsertedToken(vm.token);

            !doNotUpdateSelectedToken ? selectionHandlerService.setSelectedToken(vm.token) : '';

            var tokenInUnit = DataService.getUnitById(vm.token.inChildUnitTreeId);
            if(vm.token.inChildUnitTreeId !== null && tokenInUnit){
                var ctrlPressed = HotKeysManager.checkIfCtrlOrCmdPressed();
                // var ctrlPressed = HotKeysManager.checkIfHotKeyIsPressed('ctrl');
                !ctrlPressed ? selectionHandlerService.clearTokenList() : '';
                var parentUnit = DataService.getUnitById(vm.token.unitTreeId);
                var tokenGroup = parentUnit.tokens.filter(function(x) {return x.inChildUnitTreeId === vm.token.inChildUnitTreeId; });

                tokenGroup.forEach(function(token){
                    $rootScope.$broadcast('tokenIsClicked',{token: token, unitTreeId: token.unitTreeId,selectAllTokenInUnit: true});
                })
            }else{
                $rootScope.$broadcast('tokenIsClicked',{token: vm.token, unitTreeId: vm.unitTreeId, selectAllTokenInUnit: false});
            }
        }

        function tokenUnitIsSelected(vm){
            if(!vm.token.unitTreeId){
                vm.token.unitTreeId = "0";
            }
            return selectionHandlerService.getSelectedUnitId() === vm.token.unitTreeId;
        }

        function tokenInSelectionList(vm){
            var selectionList = selectionHandlerService.selectedTokenList;
            var elementPos = selectionList.map(function(x) {return x.static.id; }).indexOf(vm.token.static.id);
            return elementPos > -1;
        }

        function mouseUpFromToken(vm){
            var selectedTokenArray = selectionHandlerService.getSelectedTokenList();
            var direction = "UP"
            if(selectionHandlerService.getLastInsertedToken() !== null && selectionHandlerService.getLastInsertedToken().static.start_index > vm.token.static.start_index){
                direction = "DOWN"
            }
            var tokenListLength = angular.copy(selectedTokenArray.length);

            selectedTokenArray.forEach(function(token,index){
                if(token.inChildUnitTreeId){
                    var tokenUnit = DataService.getUnitById(token.inChildUnitTreeId);
                    if(tokenUnit && tokenUnit.tree_id !== '0'){
                        var parentID = DataService.getParentUnitId(tokenUnit.tree_id);
                        for(var i=0; i<tokenUnit.tokens.length; i++){
                            $rootScope.$broadcast('tokenIsClicked', {
                                token: tokenUnit.tokens[i],
                                unitTreeId: parentID || "0",
                                selectAllTokenInUnit: true,
                                doNotRemoveExistingToken: true
                            });
                        }
                        var parentUnit = DataService.getParentUnit(tokenUnit.tokens[0].unitTreeId);
                        var elementPos = parentUnit.tokens.map(function(x) {return x.static.id; }).indexOf(tokenUnit.tokens[0].static.id);
                        if(parentUnit.tokens[elementPos].static.start_index < vm.token.static.start_index && direction === "DOWN"){
                            $rootScope.$broadcast('moveCursor', {
                                token: parentUnit.tokens[elementPos],
                                unitTreeId: DataService.getParentUnitId(tokenUnit.tokens[0].unitTreeId) || "0"
                            });
                        }
                    }
                }
                if(index === tokenListLength - 1){
                    var parentUnit = selectedTokenArray[selectedTokenArray.length - 1].unitTreeId ? DataService.getUnitById(selectedTokenArray[selectedTokenArray.length - 1].unitTreeId) :  DataService.getParentUnit("0");
                    var elementPos = parentUnit.tokens.map(function(x) {return x.static.id; }).indexOf(selectedTokenArray[selectedTokenArray.length - 1].static.id);
                    $rootScope.$broadcast('moveCursor', {
                        token: elementPos <= parentUnit.tokens.length - 2 ? parentUnit.tokens[elementPos + 1] : null,
                        // token: elementPos <= parentUnit.tokens.length - 2 ? parentUnit.tokens[elementPos + 1] : parentUnit.tokens[elementPos] //old code
                        unitTreeId: selectionHandlerService.getSelectedUnitId() || "0"
                    });
                }
                // $rootScope.$broadcast('moveCursor', {
                //     token: vm.token,
                //     unitTreeId: vm.token.unitTreeId || "0"
                // });
            })

        }

        function showEllipsis(token) {
            if (!token.unit) { // In unit 0, tokens haven't unit field
                return false;
            }

            var index = undefined;
            for (var i = 0; i < token.unit.tokens.length; i++) {
                if (token.static.id === token.unit.tokens[i].static.id) {
                    index = i;
                    break;
                }
            }

            if (!token.unit || index === undefined || !token.unit.tokens[index + 1]) {
                return false;
            }
            return token.static.index_in_task + 1 !== token.unit.tokens[index + 1].static.index_in_task;
        }
    }

})();
