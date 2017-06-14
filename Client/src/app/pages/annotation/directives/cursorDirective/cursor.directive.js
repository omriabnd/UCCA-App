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

                if(args.parentId === $scope.vm.unitId.toString() ){
                    var unit = $('#unit-'+$scope.vm.unitId.toString());
                    var unitTokens = unit.find('.token-wrapper');
                    var unitNode = DataService.getUnitById(args.parentId);
                    var elementPos = unitNode.tokens.map(function(x) {return x.id; }).indexOf(args.token.id);
                    if(elementPos > -1){
                        $(elem).insertAfter( unitTokens[elementPos] );
                        $scope.vm.cursorLocation = elementPos + 1;
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

                            $rootScope.$broadcast('tokenIsClicked',{token: token, parentId: $scope.vm.unitId});
                        }else if(ctrlPressed){
                            $scope.vm.cursorUpdated = true;
                        }else{
                            selectionHandlerService.clearTokenList();
                        }
                        !shiftPressed ? $(elem).insertAfter( unitTokens[$scope.vm.cursorLocation] ) : '';
                        var token = DataService.getUnitById($scope.vm.unitId.toString()).tokens[$scope.vm.cursorLocation];
                        $scope.vm.cursorLocation++;
                        var nextToken = DataService.getUnitById($scope.vm.unitId.toString()).tokens[$scope.vm.cursorLocation];

                        if(nextToken !== undefined && token.inUnit && nextToken.inUnit){
                            if(token.inUnit === nextToken.inUnit){
                                DataService.getUnitById(args.unitId).cursorLocation++;
                                $scope.vm.cursorUpdated = false;
                                $rootScope.$broadcast("moveRight",{unitId: args.unitId,unitCursorPosition: DataService.getUnitById(args.unitId).cursorLocation});
                            }
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

                        }else if(ctrlPressed){
                            $scope.vm.cursorUpdated = true;
                        }else{
                            selectionHandlerService.clearTokenList();
                        }
                        $scope.vm.cursorLocation--;
                        var token = DataService.getUnitById($scope.vm.unitId.toString()).tokens[$scope.vm.cursorLocation];
                        var prevToken = DataService.getUnitById($scope.vm.unitId.toString()).tokens[$scope.vm.cursorLocation-1];

                        $(elem).insertBefore( unitTokens[$scope.vm.cursorLocation] );

                        if(prevToken !== undefined && token.inUnit && prevToken.inUnit){
                            if(token.inUnit === prevToken.inUnit){
                                DataService.getUnitById(args.unitId).cursorLocation--;
                                $scope.vm.cursorUpdated = false;
                                $rootScope.$broadcast("moveLeft",{unitId: args.unitId,unitCursorPosition: DataService.getUnitById(args.unitId).cursorLocation});
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
