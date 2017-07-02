(function() {
    'use strict';

    angular.module('zAdmin.annotation.directives')
        .directive('unitCursor',unitCursorDirective);

    /** @ngInject */
    function unitCursorDirective($rootScope,selectionHandlerService,HotKeysManager,DataService) {

        var directive = {
            restrict:'E',
            template:'<span class="unit-cursor" ng-class="{no_cursor:!vm.isCursorUnitClicked(vm,$parent.$index)}">|</span>',
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

            $scope.$on('moveCursor', function(event, args) {

                if(args.parentId.toString() === $scope.vm.unitId.toString() ){

                    var unit = $('#unit-'+$scope.vm.unitId.toString());
                    var unitTokens = unit.find('.token-wrapper');

                    $(elem).insertBefore( unitTokens[args.token.indexInParent] );
                    $scope.vm.cursorLocation = args.token.indexInParent;

                }
            });

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
                        !args.moveLeft ? $scope.vm.cursorLocation = elementPos + 1 : $scope.vm.cursorLocation = elementPos;
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
                        var token = DataService.getUnitById(args.unitId).tokens[$scope.vm.cursorLocation];
                        if(shiftPressed){
                            $rootScope.$broadcast('tokenIsClicked',{token: token, parentId: $scope.vm.unitId, moveLeft: false});
                        }else{
                            $(elem).insertAfter( unitTokens[$scope.vm.cursorLocation] );
                            $scope.vm.cursorLocation++;
                            !ctrlPressed ? selectionHandlerService.clearTokenList() : $scope.vm.cursorUpdated = true;
                        }
                        var nextToken = DataService.getUnitById(args.unitId).tokens[token.indexInParent+1];

                        //This is the last token
                        if(nextToken === undefined) return;

                        var unit = DataService.getUnitById(nextToken.inUnit);
                        // unitTokens = DataService.getUnitById(token.inUnit).tokens;
                        // if(unitTokens.length > 1){
                        //     var tokenPosition = unitTokens.map(function(x) {return x.id; }).indexOf(token.id);
                        //     if(tokenPosition !== unitTokens.length - 1){
                        //         nextToken = unitTokens[tokenPosition];
                        //     }

                        // }
                        if(token.inUnit === nextToken.inUnit && unit !== null && unit.annotation_unit_tree_id !== "0"){
                            if(unit.tokens === undefined){
                                unit.tokens = unit.tokenCopy;
                            }
                            if(shiftPressed){
                                unit.tokens.forEach(function(curr_token){
                                    $rootScope.$broadcast('tokenIsClicked',{token: curr_token, parentId: $scope.vm.unitId, moveLeft: false,doNotRemoveExistingToken: true});
                                })
                            }
                            var tokenPosition = unit.tokens.map(function(x) {return x.id; }).indexOf(token.id);
                            var sliceTokenArray = angular.copy(unit.tokens);
                            sliceTokenArray = sliceTokenArray.splice(tokenPosition,sliceTokenArray.length);
                            var elementPos = sliceTokenArray.map(function(x) {return x.positionInUnit; }).indexOf("Last");
                            var parentUnit = DataService.getParentUnit(unit.annotation_unit_tree_id);
                            elementPos = parentUnit.tokens.map(function(x) {return x.id; }).indexOf(sliceTokenArray[elementPos].id);

                            $scope.vm.cursorLocation = elementPos+1;
                            $scope.vm.cursorLocation === unitTokens.length ? $(elem).insertAfter( unitTokens[unitTokens.length - 1] ) : $(elem).insertBefore( unitTokens[$scope.vm.cursorLocation] );
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
                    var doNotRemoveExistingToken = false;
                    if($scope.vm.cursorLocation > 0){
                        $scope.vm.cursorLocation--;
                        var token = DataService.getUnitById(args.unitId).tokens[$scope.vm.cursorLocation];
                        if(shiftPressed){
                            $rootScope.$broadcast('tokenIsClicked',{token: token, parentId: $scope.vm.unitId, moveLeft: true});
                        }else{
                            $(elem).insertBefore( unitTokens[$scope.vm.cursorLocation] );
                            !ctrlPressed ? selectionHandlerService.clearTokenList() : $scope.vm.cursorUpdated = true;
                        }
                        var prevToken = DataService.getUnitById(args.unitId).tokens[token.indexInParent-1];

                        //This is the last token
                        if(prevToken === undefined) return;

                        var unit = DataService.getUnitById(prevToken.inUnit);
                        if(token.inUnit === prevToken.inUnit && unit !== null && unit.annotation_unit_tree_id !== "0"){
                            if(unit.tokens === undefined){
                                unit.tokens = unit.tokenCopy;
                            }

                            if(shiftPressed){
                                unit.tokens.forEach(function(curr_token,index){
                                    $rootScope.$broadcast('tokenIsClicked',{token: curr_token, parentId: $scope.vm.unitId, moveLeft: false,doNotRemoveExistingToken: false});
                                })
                                $rootScope.$broadcast('tokenIsClicked',{token: token, parentId: $scope.vm.unitId, moveLeft: false,doNotRemoveExistingToken: false});
                            }

                            var tokenPosition = unit.tokens.map(function(x) {return x.id; }).indexOf(token.id);
                            var sliceTokenArray = angular.copy(unit.tokens);
                            sliceTokenArray = sliceTokenArray.splice(0,tokenPosition);
                            sliceTokenArray = sliceTokenArray.reverse();

                            var elementPos = sliceTokenArray.map(function(x) {return x.positionInUnit; }).indexOf("First");
                            var parentUnit = DataService.getParentUnit(unit.annotation_unit_tree_id);
                            elementPos = parentUnit.tokens.map(function(x) {return x.id; }).indexOf(sliceTokenArray[elementPos].id);

                            $scope.vm.cursorLocation = elementPos;
                            $(elem).insertBefore( unitTokens[$scope.vm.cursorLocation] );
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
