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

        function setCursorPosition($scope, location) {
            $scope.vm.cursorLocation = location;
        }

        function getUnitTokens($scope) {
            var unit = $('#unit-'+$scope.vm.unitId.toString());
            return unit.find('.token-wrapper');
        }

        function unitCursorDirectiveLink($scope, elem, attrs) {
            $scope.vm = $scope.cursorCtrl;
            setCursorPosition($scope, 0);
            $scope.vm.cursorUpdated = false;

            $scope.$on('moveCursor', function(event, args) {
                if(args.unitTreeId.toString() === $scope.vm.unitId.toString() ){

                    var unitTokens = getUnitTokens($scope);
                    // var location = args.token.positionInChildUnit !== "Last" ? args.token.indexInUnit : args.token.indexInUnit+1; //old code
                    // setCursorPosition($scope, location);
                    if (args.token) {
                        setCursorPosition($scope, args.token.indexInUnit);
                    }

                    $(elem).insertBefore( unitTokens[$scope.vm.cursorLocation] );


                }
            });

            $scope.$on('resetCursor_'+$scope.vm.unitId, function(event, args) {
                console.log("hey, reset cursor", $scope.vm.unitId);

                var unitTokens = getUnitTokens($scope);
                setCursorPosition($scope, 0);
                $(elem).insertBefore( unitTokens[$scope.vm.cursorLocation] );
            });

            $scope.$on('tokenIsClicked', function(event, args) {
                // var ctrlPressed = HotKeysManager.checkIfHotKeyIsPressed('ctrl');
                // var shiftPressed = HotKeysManager.checkIfHotKeyIsPressed('shift');
                // debugger

                if(args.token && args.unitTreeId.toString() === $scope.vm.unitId.toString() ){
                    var unitTokens = getUnitTokens($scope);

                    var unitNode = DataService.getUnitById(args.unitTreeId);
                    var elementPos = unitNode.tokens.map(function(x) {return x.static.id; }).indexOf(args.token.static.id);
                    if(elementPos > -1){
                        !args.moveLeft ? $(elem).insertAfter( unitTokens[elementPos] ) : $(elem).insertBefore( unitTokens[elementPos] );
                        !args.moveLeft ? setCursorPosition($scope, elementPos + 1) : setCursorPosition($scope, elementPos);
                    }

                }
            });

            $scope.$on('moveRight', function(event, args) {
                var ctrlPressed = HotKeysManager.checkIfHotKeyIsPressed('ctrl');
                var shiftPressed = HotKeysManager.checkIfHotKeyIsPressed('shift');
                if(args.unitId === $scope.vm.unitId.toString()  && !$scope.vm.cursorUpdated){
                    var unitTokens = getUnitTokens($scope);
                    if($scope.vm.cursorLocation <= unitTokens.length){
                        var tokenUnit = DataService.getUnitById(args.unitId);
                        if($scope.vm.cursorLocation < 0 || $scope.vm.cursorLocation > tokenUnit.tokens.length){
                            return;
                        }
                        var token = $scope.vm.cursorLocation == tokenUnit.tokens.length ? tokenUnit.tokens[$scope.vm.cursorLocation - 1] : tokenUnit.tokens[$scope.vm.cursorLocation];
                        if(shiftPressed){
                            $rootScope.$broadcast('tokenIsClicked',{token: token, unitTreeId: $scope.vm.unitId, moveLeft: false});
                        }else{
                            $(elem).insertAfter( unitTokens[$scope.vm.cursorLocation] );
                            setCursorPosition($scope, $scope.vm.cursorLocation + 1);
                            !ctrlPressed ? selectionHandlerService.clearTokenList() : $scope.vm.cursorUpdated = true;
                        }
                        var unitToCheckIn = DataService.getUnitById(args.unitId);

                        //console.log(DataService.getUnitById(token.inChildUnitTreeId))


                        var sameParentTokens = unitToCheckIn.tokens.filter(function(element,index,array){
                            return element.inChildUnitTreeId == token.inChildUnitTreeId;
                        });

                        var nextToken = undefined;

                        if(sameParentTokens.length > 1){
                            for(var i=0; i< sameParentTokens.length; i++){
                                var currentToken = sameParentTokens[i];
                                if(currentToken.indexInUnit != token.indexInUnit){
                                    nextToken = currentToken;
                                }
                            }
                        }                        

                        //This is the last token
                        if(nextToken === undefined) return;

                        var unit = DataService.getUnitById(nextToken.inChildUnitTreeId);
                        // unitTokens = DataService.getUnitById(token.inChildUnitTreeId).tokens;
                        // if(unitTokens.length > 1){
                        //     var tokenPosition = unitTokens.map(function(x) {return x.id; }).indexOf(token.id);
                        //     if(tokenPosition !== unitTokens.length - 1){
                        //         nextToken = unitTokens[tokenPosition];
                        //     }

                        // }
                        if(token.inChildUnitTreeId === nextToken.inChildUnitTreeId && unit !== null && unit.tree_id !== "0"){
                            if(shiftPressed){
                                unit.tokens.forEach(function(curr_token){
                                    $rootScope.$broadcast('tokenIsClicked',{token: curr_token, unitTreeId: $scope.vm.unitId, moveLeft: false,doNotRemoveExistingToken: true});
                                })
                            }
                            var tokenPosition = unit.tokens.map(function(x) {return x.static.id; }).indexOf(token.static.id);
                            var sliceTokenArray = angular.copy(unit.tokens);
                            sliceTokenArray = sliceTokenArray.splice(tokenPosition,sliceTokenArray.length);
                            var elementPos = sliceTokenArray.map(function(x) {return x.positionInChildUnit; }).indexOf("Last");

                            if(elementPos === -1){
                                var firstAndLastPosition = 0;
                                for(var i=0; i<sliceTokenArray.length; i++){
                                    var current_token = sliceTokenArray[i];
                                    if(current_token.positionInChildUnit == "FirstAndLast"){
                                        firstAndLastPosition = i;
                                    }
                                }
                                elementPos = firstAndLastPosition;
                            }

                            var parentUnit = DataService.getParentUnit(unit.tree_id);
                            elementPos = parentUnit.tokens.map(function(x) {return x.static.id; }).indexOf(sliceTokenArray[elementPos].static.id);

                            setCursorPosition($scope, elementPos+1);
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
                    var unitTokens = getUnitTokens($scope);

                    var doNotRemoveExistingToken = false;
                    if($scope.vm.cursorLocation > 0){
                        setCursorPosition($scope, $scope.vm.cursorLocation - 1);
                        var tokenUnit = DataService.getUnitById(args.unitId);
                        if($scope.vm.cursorLocation < 0 || $scope.vm.cursorLocation > tokenUnit.tokens.length){
                            return;
                        }
                        var token = $scope.vm.cursorLocation == tokenUnit.tokens.length ? tokenUnit.tokens[$scope.vm.cursorLocation -1] : tokenUnit.tokens[$scope.vm.cursorLocation];
                        if(shiftPressed){
                            $rootScope.$broadcast('tokenIsClicked',{token: token, unitTreeId: $scope.vm.unitId, moveLeft: true});
                        }else{
                            $(elem).insertBefore( unitTokens[$scope.vm.cursorLocation] );
                            !ctrlPressed ? selectionHandlerService.clearTokenList() : $scope.vm.cursorUpdated = true;
                        }
                        // var prevToken = DataService.getUnitById(args.unitId).tokens[token.indexInUnit-1];

                        var unitToCheckIn = DataService.getUnitById(args.unitId);

                        var sameParentTokens = unitToCheckIn.tokens.filter(function(element,index,array){
                            return element.inChildUnitTreeId == token.inChildUnitTreeId;
                        })

                        var prevToken = undefined;

                        if(sameParentTokens.length > 1){
                            for(var i=0; i< sameParentTokens.length; i++){
                                var currentToken = sameParentTokens[i];
                                if(currentToken.indexInUnit != token.indexInUnit){
                                    prevToken = currentToken;
                                }
                            }
                        }

                        //This is the last token
                        if(prevToken === undefined) return;

                        var unit = DataService.getUnitById(prevToken.inChildUnitTreeId);
                        if(token.inChildUnitTreeId === prevToken.inChildUnitTreeId && unit !== null && unit.tree_id !== "0"){
                            if(shiftPressed){
                                unit.tokens.forEach(function(curr_token,index){
                                    $rootScope.$broadcast('tokenIsClicked',{token: curr_token, unitTreeId: $scope.vm.unitId, moveLeft: false,doNotRemoveExistingToken: false});
                                })
                                $rootScope.$broadcast('tokenIsClicked',{token: token, unitTreeId: $scope.vm.unitId, moveLeft: false,doNotRemoveExistingToken: false});
                            }

                            var tokenPosition = unit.tokens.map(function(x) {return x.static.id; }).indexOf(token.static.id);
                            var sliceTokenArray = angular.copy(unit.tokens);
                            sliceTokenArray = sliceTokenArray.splice(0,tokenPosition);
                            sliceTokenArray = sliceTokenArray.reverse();

                            var elementPos = sliceTokenArray.map(function(x) {return x.positionInChildUnit; }).indexOf("First");

                            if(elementPos === -1){
                                var firstAndLastPosition = 0;
                                for(var i=sliceTokenArray.length-1; i>=0; i--){
                                    var current_token = sliceTokenArray[i];
                                    if(current_token.positionInChildUnit == "FirstAndLast"){
                                        firstAndLastPosition = i;
                                    }
                                }
                                elementPos = firstAndLastPosition;
                            }

                            var parentUnit = DataService.getParentUnit(unit.tree_id);
                            elementPos = parentUnit.tokens.map(function(x) {return x.static.id; }).indexOf(sliceTokenArray[elementPos].static.id);

                            setCursorPosition($scope, elementPos);
                            $(elem).insertBefore( unitTokens[$scope.vm.cursorLocation] );
                        }
                    }
                }else if($scope.vm.cursorUpdated){
                    $scope.vm.cursorUpdated = false;
                }
            });
            
            $scope.$on('moveToNextRelevant', function(event, args) {
                var shiftPressed = HotKeysManager.checkIfHotKeyIsPressed('shift');
            	
                if(args.unitId === $scope.vm.unitId.toString()  && !$scope.vm.cursorUpdated){
                    var unit = $('#unit-'+$scope.vm.unitId.toString());
                    var unitTokens = unit.find('.token-wrapper');
                    
                    if($scope.vm.cursorLocation <= unitTokens.length){
                    	var tokenUnit = DataService.getUnitById(args.unitId);
                        if($scope.vm.cursorLocation < 0 || $scope.vm.cursorLocation > tokenUnit.tokens.length){
                            return;
                        }
                        var token = tokenUnit.tokens[$scope.vm.cursorLocation - 1];
                        
                        var oldUnit = token != undefined ? DataService.getUnitById(token.inChildUnitTreeId) : undefined;
                        var unitToCheckIn = tokenUnit;

                        var nextUnit = undefined;
                        var annotationUnits = unitToCheckIn.AnnotationUnits;
                        var tokens = unitToCheckIn.tokens;
                        if(shiftPressed){
                        	annotationUnits = annotationUnits.slice().reverse();
                        	tokens = tokens.slice().reverse();
                        }
                        var oldUnitIndex = oldUnit != undefined ? annotationUnits.map(function(x) {return x.tree_id; }).indexOf(oldUnit.tree_id) : undefined;
                        if(annotationUnits.length > 0 && oldUnitIndex != undefined){
                            for(var i=oldUnitIndex+1; i<annotationUnits.length; i++){
                                var currentUnit = annotationUnits[i];
                                if(!!currentUnit && !!currentUnit.categories && (!$rootScope.isRefinementLayerProject || currentUnit.categories[0].refinedCategory)){
                                	nextUnit = currentUnit;
                                	break;
                                }
                            }
                        }
                        
                        if(nextUnit === undefined) {
                        	var nextToken = undefined;
                        	if(tokens.length > 0){
                                for(var i=0; i< tokens.length; i++){
                                	var currentToken = tokens[i];
                                    var currentUnit = DataService.getUnitById(currentToken.inChildUnitTreeId);
                                    if(!!currentUnit && !!currentUnit.categories && (!$rootScope.isRefinementLayerProject || currentUnit.categories[0].refinedCategory)){
                                    	nextToken = currentToken;
                                    	nextUnit = currentUnit;
                                    	break;
                                    }
                                }
                            }
                        }
                        
                        //This is the last token
                        if(nextUnit === undefined) return;

                        var unit = nextUnit;
                        
                        
                        console.log(unit);
                        
                        if(unit !== null && unit.tree_id !== "0"){
	                        if(!!oldUnit && (!oldUnit.parentUnitId || oldUnit.parentUnitId === "0")){
	                        	oldUnit.gui_status = "HIDDEN";
	                        }
	                        unit.gui_status = "OPEN";
	                        
	                        selectionHandlerService.clearTokenList();
	                        unit.tokens.forEach(function(curr_token){
	                            $rootScope.$broadcast('tokenIsClicked',{token: curr_token, unitTreeId: $scope.vm.unitId, moveLeft: false, selectAllTokenInUnit: true});
	                        });
	
	                        $scope.vm.cursorLocation = unitToCheckIn.tokens.map(function(x) {return x.static.id; }).indexOf(unit.tokens[unit.tokens.length-1].static.id) + 1;
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
