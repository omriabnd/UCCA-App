(function() {
    'use strict';

    angular.module('zAdmin.annotation.directives')
        .directive('unitCursor',unitCursorDirective);

    /** @ngInject */
    function unitCursorDirective($rootScope,selectionHandlerService,HotKeysManager,DataService) {

        var directive = {
            restrict:'E',
            template:'<span class="unit-cursor" ng-if="vm.isCursorUnitClicked(vm,$parent.$index)">|</span>',
            scope:{
                unitId:"="
            },
            link: unitCursorDirectiveLink,
            controller: unitCursorController,
            controllerAs: 'cursorCtrl',
            bindToController: true,
            replace:false,
            tokenClicked: false

        };

        return directive;

        function unitCursorDirectiveLink($scope, elem, attrs) {
            $scope.vm = $scope.cursorCtrl;
            $scope.vm.cursorLocation = 0;
            $scope.vm.cursorUpdated = false;

            $scope.$on('tokenIsClicked', function(event, args) {
                // var ctrlPressed = HotKeysManager.checkIfHotKeyIsPressed('ctrl');
                // var shiftPressed = HotKeysManager.checkIfHotKeyIsPressed('shift');

                if(args.parentId.toString() === $scope.vm.unitId.toString() ){
                    var unit = $('#unit-'+$scope.vm.unitId.toString());
                    var unitTokens = unit.find('.token-wrapper');
                    var unitNode = DataService.getUnitById(args.parentId);
                    var elementPos = unitNode.tokens.map(function(x) {return x.id; }).indexOf(args.token.id);
                    if(elementPos > -1){
                        !args.moveLeft ? $(elem).insertAfter( unitTokens[elementPos] ) : $(elem).insertBefore( unitTokens[elementPos] );
                        !args.fromCursor ? $scope.vm.cursorLocation = elementPos + 1 : '';
                    }
                }
            });

            $scope.$on('moveRight', function(event, args) {
                var ctrlPressed = HotKeysManager.checkIfHotKeyIsPressed('ctrl');
                var shiftPressed = HotKeysManager.checkIfHotKeyIsPressed('shift');
                if(args.unitId === $scope.vm.unitId.toString()  && !$scope.vm.cursorUpdated){
                    var unit = $('#unit-'+$scope.vm.unitId.toString());
                    var unitTokens = unit.find('.token-wrapper');
                    if($scope.vm.cursorLocation < unitTokens.length){
                        if(shiftPressed){
                            var token = DataService.getUnitById($scope.vm.unitId.toString()).tokens[$scope.vm.cursorLocation];
                            token.tokenIsClicked = true;
                            selectionHandlerService.setTokenClicked();

                            $rootScope.$broadcast('tokenIsClicked',{token: token, parentId: $scope.vm.unitId, fromCursor: true});
                        }else if(ctrlPressed){
                            $scope.vm.cursorUpdated = true;
                        }else{
                            selectionHandlerService.clearTokenList();
                        }
                        $(elem).insertAfter( unitTokens[$scope.vm.cursorLocation] );
                        var token = DataService.getUnitById($scope.vm.unitId.toString()).tokens[$scope.vm.cursorLocation];
                        $scope.vm.cursorLocation++;
                        var nextToken = DataService.getUnitById($scope.vm.unitId.toString()).tokens[$scope.vm.cursorLocation];

                        var parentUnit = DataService.getUnitById(args.unitId);
                        var tokenGroup = parentUnit.tokens.filter(function(x) {return x.inUnit === token.inUnit; });

                        if(token.inUnit){
                            // $scope.vm.cursorLocation--;
                            tokenGroup.forEach(function(token,index){
                                if(ctrlPressed || ( !ctrlPressed && !shiftPressed ) ){

                                    var elementPos = parentUnit.tokens.map(function(x) {return x.id; }).indexOf(token.id);
                                    $(elem).insertAfter( unitTokens[token.indexInParent] );
                                    $scope.vm.cursorLocation = elementPos + 1;

                                    // if(index !== 0 && token.indexInParent !== tokenGroup[index+1].indexInParent-1){
                                    //     tokenGroup = tokenGroup.splice(index+1,tokenGroup.length - index - 1);
                                    // }

                                }else if (shiftPressed){
                                     $rootScope.$broadcast('tokenIsClicked',{token: token, parentId: $scope.vm.unitId,selectAllTokenInUnit: true});
                                }
                                // $scope.vm.cursorLocation++;
                            })
                        }

                    }

                }else if($scope.vm.cursorUpdated){
                    $scope.vm.cursorUpdated = false;
                }
            });

            $scope.$on('moveLeft', function(event, args) {
                var ctrlPressed = HotKeysManager.checkIfHotKeyIsPressed('ctrl');
                var shiftPressed = HotKeysManager.checkIfHotKeyIsPressed('shift');
                if(args.unitId === $scope.vm.unitId.toString() &&  !$scope.vm.cursorUpdated){
                    var unit = $('#unit-'+$scope.vm.unitId.toString());
                    var unitTokens = unit.find('.token-wrapper');
                    if($scope.vm.cursorLocation > 0){
                        if(shiftPressed){
                            var token = DataService.getUnitById($scope.vm.unitId.toString()).tokens[$scope.vm.cursorLocation-1];
                            token.tokenIsClicked = true;
                            selectionHandlerService.setTokenClicked();

                            $rootScope.$broadcast('tokenIsClicked',{token: token, parentId: $scope.vm.unitId});
                        }else if(ctrlPressed){
                            $scope.vm.cursorUpdated = true;
                        }else{
                            selectionHandlerService.clearTokenList();
                        }
                        $scope.vm.cursorLocation < 2 ? $(elem).insertBefore( unitTokens[0] ) : $(elem).insertAfter( unitTokens[$scope.vm.cursorLocation-2] );
                        $scope.vm.cursorLocation--;
                        var token = DataService.getUnitById($scope.vm.unitId.toString()).tokens[$scope.vm.cursorLocation];
                        var prevToken = DataService.getUnitById($scope.vm.unitId.toString()).tokens[$scope.vm.cursorLocation-1];

                        var parentUnit = DataService.getUnitById(args.unitId);
                        var tokenGroup = parentUnit.tokens.filter(function(x) {return x.inUnit === token.inUnit; });

                        if(token.inUnit){
                            for(var i=tokenGroup.length-1; i>=0; i--){
                                var token = tokenGroup[i];
                                if(ctrlPressed || ( !ctrlPressed && !shiftPressed ) ){
                                    if(tokenGroup[i-1]){
                                        $scope.vm.cursorLocation === 1 ? $(elem).insertBefore( unitTokens[tokenGroup[i-1].indexInParent] ) : $(elem).insertAfter( unitTokens[tokenGroup[i-1].indexInParent-1] );
                                        $scope.vm.cursorLocation = tokenGroup[i-1].indexInParent;
                                    }
                                }else{
                                    $rootScope.$broadcast('tokenIsClicked',{token: token, parentId: $scope.vm.unitId,selectAllTokenInUnit: true, moveLeft: true});
                                }
                            }
                        }


                    }
                }else if($scope.vm.cursorUpdated){
                    $scope.vm.cursorUpdated = false;
                }
            });
        }

        function unitCursorController() {
            var vm = this;
            vm.isCursorUnitClicked = isCursorUnitClicked;
        }

        function isCursorUnitClicked(vm){
            return selectionHandlerService.getSelectedUnitId() === vm.unitId.toString();
        }

    }

})();/**
 * Created by Nissan PC on 05/06/2017.
 */
