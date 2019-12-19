(function () {
    'use strict';

    angular.module('zAdmin.annotation.directives')
        .directive('annotationUnit', annotationUnitDirective);

    /** @ngInject */
    function annotationUnitDirective($rootScope, DataService, selectionHandlerService, HotKeysManager, hotkeys, DefinitionsService, $timeout, $compile, $uibModal, restrictionsValidatorService, ENV_CONST, Core, $window) {
        trace("annotationUnitDirective is here");

        var directive = {
            restrict: 'E',
            templateUrl: 'app/pages/annotation/directives/annotationUnit/annotationUnit.html',
            scope: {
                unit: '=',
                previewLine: '=',
                treeId: '=',
                childDirective: '@',
                categories: '=',
                control: '=',
                tokens: '='
            },
            link: annotationUnitDirectiveLink,
            controller: AnnotationUnitController,
            controllerAs: 'dirCtrl',
            bindToController: true,
            replace: false

        };

        return directive;

        function AnnotationUnitController(DataService, $scope) {
            trace("annotationUnitDirective - AnnotationUnitController");
            var vm = this;
            vm.unitClicked = unitClicked;
            $rootScope.unitClicked = vm.unitClicked;
            vm.isUnitClicked = isUnitClicked;
            vm.deleteUnit = deleteUnit;
            vm.toggleMouseUpDown = toggleMouseUpDown;
            vm.checkRestrictionForCurrentUnit = checkRestrictionForCurrentUnit;
            vm.addCommentToUnit = addCommentToUnit;
            vm.addClusterToUnit = addClusterToUnit;
            vm.unitIsSelected = unitIsSelected;
            vm.switchToRemoteMode = switchToRemoteMode;
            vm.toggleAnnotationUnitView = toggleAnnotationUnitView;
            vm.isUnitCollapsed = isUnitCollapsed;
            vm.isUnitHidden = isUnitHidden;
            vm.toggleMouseUp = toggleMouseUp;
            vm.dataBlock = DataService.getUnitById(vm.unit.tree_id);

            vm.dataBlock['cursorLocation'] = 0;
            vm.dataBlock.tree_id !== "0" ? updateStartEndIndexForTokens(vm.dataBlock.tokens) : '';
            vm.dataBlock.categoriesTooltip = categoriesTooltip(vm);
            vm.showClusterButton = $rootScope.isSlottedLayerProject;
            vm.direction = $rootScope.direction;
            vm.disableRemotes = $rootScope.disableRemotes;
            $scope.$on('retokenization', function (events, args) {
                debugger
                console.log("vm.token", vm.tokens)
                console.log('args',args.oldToken,args.newToken)
                // if not in the passage we have to make some changes
                if (vm.tokens[0].unitTreeId != 0) {
                    //case we are splitting 
                    if (args.oldToken.length == undefined) {
                        // change only on relevant token
                        if (vm.tokens[0].static.id == args.oldToken.static.id) {
                            //update all field of relevant token
                            for (var i = 0; i < args.newToken.length; i++) {
                                vm.tokens[i] = angular.copy(args.oldToken);
                                vm.tokens[i].static.text = args.newToken[i].static.text;
                                vm.tokens[i].static.index_in_task = args.newToken[i].static.index_in_task;
                                vm.tokens[i].indexInUnit = i;
                                vm.tokens[i].static.id = args.newToken[i].static.id;
                                vm.tokens[i].static.splitByTokenization = args.newToken[i].static.splitByTokenization;
                                //update strat and end index according to THIS unit
                                if (i == 0) {
                                    var indexCounter = 0;
                                    vm.tokens[0].static.start_index = indexCounter;
                                    indexCounter += vm.tokens[0].static.text.length - 1;
                                    vm.tokens[0].static.end_index = indexCounter;
                                    indexCounter += 1;
                                }
                                else {
                                    vm.tokens[i].static.start_index = indexCounter;
                                    indexCounter += vm.tokens[i].static.text.length - 1;
                                    vm.tokens[i].static.end_index = indexCounter;
                                    indexCounter += 1;
                                }
                            }
                        }
                        else{
                            // update some fields like indexintask maybe other
                            // vm.token => token from annotation unit which was not retokenized 
                            //old and new token => only the retokenized token 
                            // we have to update the vm.token according to passage 
                            // go in the passage look for the id of vm.token get it's index in task and give it to vm.token

                            console.log(DataService.tree,'check if it is already updated ')
                            for( var i=0; i<DataService.tree.tokens.length;i++){
                                if (vm.tokens[0].static.id==DataService.tree.tokens[i].static.id){
                                    //maybe here we need angular copy 
                                    vm.tokens[0].static.index_in_task=DataService.tree.tokens[i].static.index_in_task
                                }
                            }
                        }
                    }
                    //case we are joining
                    else { 
                        for (var i = 0; i < vm.tokens.length; i++) {
                            for (var j = 0; j < args.oldToken.length; j++) {
                                if (vm.tokens[i].static.id == args.oldToken[j].static.id) {
                                    vm.tokens = angular.copy(args.newToken)
                                    vm.tokens[0].indexInUnit = i
                                }
                            }
                        }
                    }
                console.log('vm.tokens',vm.tokens,'tree', DataService.tree)
                }

                // For some reason, Angular does not detect changes in 
                // the token array properly. $scope.$apply does not work,
                // because it doesn't recalculate the bound properties.
                // This is a severe measure to convince it that it needs to reapply the changes.
                var oldTokens = vm.tokens;
                vm.tokens = []
                setTimeout(function () {
                    vm.tokens = oldTokens;
                }, 0);
            })
            $scope.$on('retokenizationPassage', function (events, args) {

                if (vm.tokens[0].unitTreeId != 0) {//update in the children the indexintask same as passage
                    debugger
                    for (var i=0;i<vm.tokens.length;i++){
                        for (var j=0; j<args.passageTokens.length; j++){
                            if (vm.tokens[i].static.id==args.passageTokens[j].static.id){
                                vm.tokens[i].static.index_in_task=args.passageTokens[j].static.index_in_task;
                            }   
                        }
                    }
                }

                // For some reason, Angular does not detect changes in 
                // the token array properly. $scope.$apply does not work,
                // because it doesn't recalculate the bound properties.
                // This is a severe measure to convince it that it needs to reapply the changes.
                
                var oldTokens = vm.tokens;
                vm.tokens = []
                setTimeout(function () {
                    vm.tokens = oldTokens;
                }, 0);
            })
        }

        function annotationUnitDirectiveLink($scope, elem, attrs, $rootScope) {
            trace("annotationUnitDirective - annotationUnitDirectiveLink");
            $scope.vm = $scope.dirCtrl;
            $scope.vm.dataBlock.tokens = $scope.vm.tokens;

            $scope.vm.dataBlock.tokens.forEach(function (token) {
                token.unitTreeId = $scope.vm.dataBlock.tree_id;
            });

            /**
             * if dataBlock.children_token_map not exist, create this dictionary {tokenId: token, tokenId: token, ...}
             */
            if ($scope.vm.dataBlock.tokenMap === undefined) {
                $scope.vm.dataBlock.tokenMap = {};
                $scope.vm.dataBlock.tokens.forEach(function (token) {
                    $scope.vm.dataBlock.tokenMap[token.static.id] = token;
                })
            }

            if ($scope.vm.dataBlock.gui_status === undefined) {
                $scope.vm.dataBlock.gui_status = "HIDDEN";
            }

            $scope.$on('ToggleParents', function (event, args) {
                $scope.showParents = !$scope.showParents;
            });

            $scope.$on('CreateRemoteUnit', function (event, args) {
                if (args.unitId.toString() === $scope.vm.dataBlock.tree_id) {
                    selectionHandlerService.setCategoryForRemote(args.category);
                    switchToRemoteMode($scope.vm)
                }
            });

            $scope.$on('ToggleSuccess', function (event, args) {
                if (args.id.toString() === $scope.vm.dataBlock.tree_id) {
                    var parentUnit = DataService.getUnitById(DataService.getParentUnitId($scope.vm.dataBlock.tree_id));
                    // paintTokens(parentUnit.tokens,parentUnit);
                    colorUnit(parentUnit);
                }
                $scope.vm.dataBlock.categoriesTooltip = categoriesTooltip($scope.vm);
            });

            $scope.$on('checkRestrictionForCurrentUnit', function (event, args) {
                if (args.unitId.toString() === $scope.vm.dataBlock.tree_id) {
                    checkRestrictionForCurrentUnit(args.unitId);
                }
                if (event) {
                    event.preventDefault();
                }
            });

            // OBSOLETE
            //$scope.$on('ResetFromBarSuccess', function(event, args) {
            //    $scope.vm.dataBlock.cursorLocation = 0;
            //});

            $scope.$on('InsertSuccess', function (event, args) {
                if (args.dataBlock.id.toString() === $scope.vm.dataBlock.tree_id) {
                    if ($scope.vm.dataBlock.AnnotationUnits.AnnotationUnits) {
                        delete $scope.vm.dataBlock.AnnotationUnits.AnnotationUnits;
                    }
                    // Remove it because it causes selectedTokenList to reset, and the chosen tokens are unselected.
                    // When adding a category to an existing unit, focus should not change.
                    // selectionHandlerService.updateSelectedUnit($scope.vm.dataBlock.tree_id,true);
                    // paintTokens($scope.vm.tokens,$scope.vm.dataBlock);
                    colorUnit($scope.vm.dataBlock);

                }
            });

            $scope.$on('DeleteSuccess', function (event, args) {
                if (args.reset) {
                    var parentUnit = DataService.getUnitById(DataService.getParentUnitId($scope.vm.dataBlock.tree_id));
                    RemoveBorder(parentUnit.tokens, parentUnit);
                } else {
                    $scope.vm.tokens.forEach(function (token, index, inInit) {
                        token.indexInUnit = index;
                    });
                    // paintTokens($scope.vm.tokens,$scope.vm.dataBlock,true);
                    colorUnit($scope.vm.dataBlock);
                }

                $scope.vm.dataBlock.tokens.forEach(function (token) {
                    token.unitTreeId = $scope.vm.dataBlock.tree_id;
                })
            });

            $scope.$on('RemoveBorder', function (event, args) {
                if (args.id.toString() === $scope.vm.dataBlock.tree_id) {
                    var parentUnit = DataService.getUnitById(DataService.getParentUnitId($scope.vm.dataBlock.tree_id));
                    RemoveBorder(parentUnit.tokens, parentUnit);
                }
            });

            // paintTokens($scope.vm.tokens, $scope.vm.dataBlock);
            colorUnit($scope.vm.dataBlock);
        }


        function isUnitHidden(vm) {
            trace("annotationUnitDirective - isUnitHidden");
            return vm.gui_status === "HIDDEN";
        }

        function categoriesTooltip(vm) {
            trace("annotationUnitDirective - categoriesTooltip");
            var output = '';
            for (var index in vm.dataBlock.categories) {
                output = output + ' ' + vm.dataBlock.categories[index].name;
            }
            return output;
        }

        function toggleAnnotationUnitView(vm) {
            trace("annotationUnitDirective - toggleAnnotationUnitView");
            if (vm.dataBlock.gui_status === "OPEN") {
                vm.dataBlock.gui_status = "COLLAPSE";

                subTreeToCollapse(vm.dataBlock);
            } else {
                vm.dataBlock.gui_status = "OPEN";
            }
        }

        function isUnitCollapsed(vm) {
            trace("annotationUnitDirective - isUnitCollapsed");
            return vm.dataBlock.gui_status === "COLLAPSE";
        }

        function unitIsSelected(vm) {
            trace("annotationUnitDirective - unitIsSelected");
            if (selectionHandlerService.getSelectedUnitId() === vm.dataBlock.tree_id) {
                $rootScope.currentVm = vm;
            }
            return selectionHandlerService.getSelectedUnitId() === vm.dataBlock.tree_id;
        }

        function addCommentToUnit(unitId, vm) {
            trace("annotationUnitDirective - addCommentToUnit");
            selectionHandlerService.updateSelectedUnit(unitId);
            open('app/pages/annotation/templates/commentOnUnitModal.html', 'sm', '', vm);

            $timeout(function () {
                var comm = $window.document.getElementById('comment');
                if (comm)
                    comm.focus();
            }, 100);
        }

        function addClusterToUnit(unitId, vm) {
            trace("annotationUnitDirective - addClusterToUnit");
            selectionHandlerService.updateSelectedUnit(unitId);
            open('app/pages/annotation/templates/clusterOnUnitModal.html', 'sm', '', vm)
        }

        function open(page, size, message, vm) {
            trace("annotationUnitDirective - open");
            var remoteOriginalId = $rootScope.clckedLine;
            var viewModal = vm;
            $uibModal.open({
                animation: true,
                templateUrl: page,
                size: size,
                controller: function ($scope) {
                    $scope.vm = viewModal;

                    if (vm.dataBlock) {
                        $scope.comment = $scope.vm.dataBlock.comment;
                        $scope.cluster = $scope.vm.dataBlock.cluster;
                    }

                    $scope.message = message;

                    $scope.saveComment = function () {
                        $scope.vm.dataBlock.comment = $scope.comment;
                        if ($scope.comment != '') {
                            $scope.vm.dataBlock.tokens.forEach(function (token) {
                                DataService.tokensWithComments.add(token.static.id);
                            });
                        }
                    }

                    $scope.saveCluster = function () {
                        $scope.vm.dataBlock.cluster = $scope.cluster;
                        console.log('now');
                    }

                    $scope.forceDeleteUnit = function () {
                        $scope.vm.dataBlock.comment = undefined;
                        DataService.deleteUnit($scope.vm.dataBlock.tree_id);
                    }

                    var remoteOriginalTreeId = remoteOriginalId;
                    $scope.deleteAllRemoteInstanceOfThisUnit = function () {

                        // New Remote
                        var clonedList = angular.copy($scope.vm.dataBlock.cloned_to_tree_ids);
                        for (var i = 0; i < clonedList.length; i++) {
                            DataService.deleteRemoteUnit(DataService.getUnitById(clonedList[i]));
                            DataService.deleteUnit(clonedList[i]);
                        }
                        DataService.deleteUnit($scope.vm.dataBlock.tree_id);
                        // selCtrl.updateUI(DataService.getUnitById($("[unit-wrapper-id="+$rootScope.clickedUnit+"]").attr('child-unit-id')));
                    };

                    $timeout(function () {
                        var btn = $window.document.getElementById('inputElement');
                        if (btn) {
                            btn.focus();
                        }
                    }, 100);

                    $scope.keyUpChanged = function (e) {
                        var key = e.which;
                        if (key === 13)
                            $scope.$dismiss();
                    };
                }
            }).result.then(function (okRes) {

            }, function (abortRes) {

            });
        };

        function andBorderColor(tokens) {
            trace("annotationUnitDirective - andBorderColor");
            tokens.forEach(function (token) {
                if (token.categories.length === 2) {
                    token.borderStyle = "border-top : 3px solid " + token.categories[1].backgroundColor + "; border-bottom : 3px solid " + token.categories[0].backgroundColor + "; border-left : 3px solid " + token.categories[0].backgroundColor + ";"
                }
            })
        }

        function RemoveBorder(tokens, dataBlock) {
            trace("annotationUnitDirective - RemoveBorder");
            dataBlock.AnnotationUnits.forEach(function (unit, index) {
                unit.tokens.forEach(function (token) {
                    var childUnitTokens = dataBlock.AnnotationUnits[index].tokens;
                    var elementPos = childUnitTokens.map(function (x) { return x.static.id; }).indexOf(token.static.id);
                    var elementPosInThisUnit = tokens.map(function (x) { return x.static.id; }).indexOf(token.static.id);
                    if (elementPos !== -1 && elementPosInThisUnit !== -1) {
                        tokens[elementPosInThisUnit].borderStyle = "border : none;";
                    }
                })
            });
        }

        function getUnitBorderColors(categories) {
            trace("annotationUnitDirective - getUnitBorderColors");
            // Return dict according categories list
            var actualCategories = categories.filter(function (category) {
                return category.id !== undefined;
            });
            var unitBorderColors = {};

            switch (actualCategories.length) {
                case 0: {
                    unitBorderColors = {
                        top: 'none',
                        bottom: 'none',
                        left: 'none',
                        right: 'none'
                    };
                    return unitBorderColors;
                }
                case 1: {
                    unitBorderColors = {
                        top: actualCategories[0].backgroundColor,
                        bottom: actualCategories[0].backgroundColor,
                        left: actualCategories[0].backgroundColor,
                        right: actualCategories[0].backgroundColor
                    };
                    return unitBorderColors;
                }
                case 2: {
                    unitBorderColors = {
                        top: actualCategories[0].backgroundColor,
                        bottom: actualCategories[0].backgroundColor,
                        left: actualCategories[1].backgroundColor,
                        right: actualCategories[1].backgroundColor
                    };
                    return unitBorderColors;
                }
                case 3: {
                    unitBorderColors = {
                        top: actualCategories[0].backgroundColor,
                        bottom: actualCategories[1].backgroundColor,
                        left: actualCategories[2].backgroundColor,
                        right: actualCategories[2].backgroundColor
                    };
                    return unitBorderColors;
                }
                default: {
                    unitBorderColors = {
                        top: actualCategories[0].backgroundColor,
                        bottom: actualCategories[1].backgroundColor,
                        left: actualCategories[2].backgroundColor,
                        right: actualCategories[3].backgroundColor
                    };
                    return unitBorderColors;
                }
            }
        }

        function removeLeftRightBorders(borderColors, rightBorder, leftBorder) {
            trace("annotationUnitDirective - removeLeftRightBorders");
            if (!rightBorder) {
                delete borderColors.right;
            }
            if (!leftBorder) {
                delete borderColors.left;
            }
            return borderColors;
        }

        function borderTokens(borderColors) {
            trace("annotationUnitDirective - borderTokens");
            if ($rootScope.direction === 'rtl') {
                // chane left and right borders;
                if (borderColors.left && !borderColors.right) {
                    borderColors.right = borderColors.left;
                    delete borderColors.left;
                } else if (borderColors.right && !borderColors.left) {
                    borderColors.left = borderColors.right;
                    delete borderColors.right;
                }
            }

            if (borderColors.left && borderColors.right) {
                return "border-top : 3px solid " + borderColors.top + "; border-bottom : 3px solid " + borderColors.bottom + "; border-left : 3px solid " +
                    borderColors.left + ";border-right : 3px solid " + borderColors.right + "; margin-left: 3px;";
            }
            if (!borderColors.left && !borderColors.right) {
                return "border-top : 3px solid " + borderColors.top + "; border-bottom : 3px solid " + borderColors.bottom;
            }
            if (!borderColors.left) {
                return "border-top : 3px solid " + borderColors.top + "; border-bottom : 3px solid " + borderColors.bottom + "; border-right : 3px solid " + borderColors.right;
            }
            if (!borderColors.right) {
                return "border-top : 3px solid " + borderColors.top + "; border-bottom : 3px solid " + borderColors.bottom + "; border-left : 3px solid " + borderColors.left + "; margin-left: 3px;";
            }
            return "border: none"
        }

        function findCategoriesChildUnit(unit, childId) {
            trace("annotationUnitDirective - findCategoriesChildUnit");
            for (var i = 0; i < unit.AnnotationUnits.length; i++) {
                if (unit.AnnotationUnits[i].tree_id === childId) {
                    return unit.AnnotationUnits[i].categories;
                }
            }
        }

        function colorUnitTokens(unit) {
            trace("annotationUnitDirective - colorUnitTokens");
            var lastChildUnitColors = null;
            var lastChildUnit = null;
            var leftBorder = false;
            var rightBorder = false;

            unit.tokens.forEach(function (token, index) {
                var leftBorder = false;
                var rightBorder = false;
                if (!token.inChildUnitTreeId) {
                    // if token has no child unit then– set border to none
                    token.borderStyle = "border: none;";
                    lastChildUnit = null;
                    lastChildUnitColors = null;
                } else { // if token.inChildUnitTreeId
                    var categoriesChildUnit = [];
                    if (token.inChildUnitTreeId !== lastChildUnit) {// left border
                        leftBorder = true;
                    }
                    // right border
                    if (index === unit.tokens.length - 1 || (index < unit.tokens.length - 1 && token.inChildUnitTreeId !== unit.tokens[index + 1].inChildUnitTreeId)) {
                        rightBorder = true;
                    }

                    lastChildUnit = token.inChildUnitTreeId;
                    categoriesChildUnit = findCategoriesChildUnit(unit, lastChildUnit);
                    if (!categoriesChildUnit || !categoriesChildUnit.length) {
                        categoriesChildUnit = [{
                            id: -1,
                            backgroundColor: 'gray'
                        }];
                    }
                    if (categoriesChildUnit) { // If not deleting unit
                        lastChildUnitColors = getUnitBorderColors(categoriesChildUnit);
                        lastChildUnitColors = removeLeftRightBorders(lastChildUnitColors, rightBorder, leftBorder);

                        token.borderStyle = borderTokens(lastChildUnitColors);
                    }
                }
            });
        }

        function colorUnit(unit) {
            trace("annotationUnitDirective - colorUnit");
            colorUnitTokens(unit);

            unit.AnnotationUnits.forEach(function (u) {
                colorUnit(u);
            });
        }

        /*
        function paintTokens_old(tokens, dataBlock, afterDelete){
            trace("annotationUnitDirective - paintTokens");

            // First paint all the tokens we have received
            console.log("Painting tokens from unit ", tokens[0].unitTreeId, ": ", dataBlock);
            dataBlock.AnnotationUnits.forEach(function(unit,index){
                if(unit.unitType !== "REMOTE"){
                    if(afterDelete){
                        unit.tokens.forEach(function(token){
                          var childUnitTokens = dataBlock.AnnotationUnits[index].tokens;
                          var elementPos = childUnitTokens.map(function(x) {return x.static.id; }).indexOf(token.static.id);
                          var elementPosInThisUnit = tokens.map(function(x) {return x.static.id; }).indexOf(token.static.id);

                          // TODO: Do not update tokens here at all, just use what we already have
                          token.indexInUnit = elementPosInThisUnit;
                          if(DataService.getParentUnit(token.unitTreeId)){
                            token.unitTreeId = DataService.getParentUnit(token.unitTreeId).tree_id;
                          }
                        })

                        // selectionHandlerService.updateIndexInUnitAttribute(unit.tokens); // Is it needed?

                        // selectionHandlerService.updatePositionInChildUnitAttribute(unit.tokens);
                        // selectionHandlerService.updateNextTokenNotAdjacent(unit.tokens);
                        // selectionHandlerService.updateLastTokenNotAdjacent(unit.tokens);

                        selectionHandlerService.updateTokenBorders(unit.tokens);
                    }

                    // selectionHandlerService.updateTokenBorders(unit.tokens);

                    unit.tokens.forEach(function(token){
                      	var childUnitTokens = dataBlock.AnnotationUnits[index].tokens;
                        var elementPos = childUnitTokens.map(function(x) {return x.static.id; }).indexOf(token.static.id);
                        var elementPosInThisUnit = tokens.map(function(x) {return x.static.id; }).indexOf(token.static.id);


                        // token.indexInUnit = elementPosInThisUnit;

                        if(elementPos !== -1 && elementPosInThisUnit !== -1) {
                            if (unit.categories.length === 1 && unit.categories[0] === undefined || unit.categories.length === 0) {
                                unit.categories[0] = {
                                    id: -1,
                                    backgroundColor: 'gray'
                                }
                            }
                            childUnitTokens[elementPos].backgroundColor = unit.categories[0] ? unit.categories[0].backgroundColor : "transparent";

                            if (unit.categories[0].fromParentLayer && !unit.categories[0].refinedCategory) {

                                var relevant = false;
                                unit.AnnotationUnits.forEach(function (childUnit) {
                                    paintTokens(childUnit.tokens, childUnit);
                                    if (!childUnit.categories[0].fromParentLayer || childUnit.categories[0].refinedCategory) {
                                        relevant = true;
                                    }
                                })
                                if (!relevant) {
                                    unit.categories[0].backgroundColor = "gray";
                                    unit.gui_status = "HIDDEN";
                                } else {
//                            		unit.gui_status = "OPEN";
                                }
//                            }else if(unit.categories.some(function(category){return category.refinementCategory})){
//                             	unit.gui_status = "HIDDEN";
                            } else {
//                        		unit.gui_status = "OPEN";
                            }

                            if (unit.categories.length === 1 && unit.categories[0].id === -1) {
                                tokens[elementPosInThisUnit].borderStyle = "transparent";
                            }

                            if (unit.categories.length > 1) {
                                var elementPos = unit.categories.map(function (x) {
                                    return x.id;
                                }).indexOf(-1);
                                if (elementPos > -1) {
                                    unit.categories.splice(unit.categories, 1);
                                }
                            }


                            // TODO: Check if token is in a child-unit and only apply borders then.
                            // Apply borders based on borderLeft and borderRight
                            // var position = DataService.positionInUnit(unit, token);
                            // switch(position){
                            //     case 'First': {  // if borderLeft 2
                            //         console.log("Setting style of ", token);
                            //         console.log("Which is the child of ", tokens[elementPosInThisUnit]);
                            //         tokens[elementPosInThisUnit].borderStyle = borderForFirstToken(childUnitTokens[elementPos],unit.categories);
                            //         console.log(tokens[elementPosInThisUnit])
                            //         break;
                            //     }
                            //     case 'FirstAndLast':{ // if borderLEft && borderRight 1
                            //         tokens[elementPosInThisUnit].borderStyle = borderForFirstAndLastToken(unit.categories);
                            //         break;
                            //     }
                            //     case 'Last': {  // if borderRight 3
                            //         tokens[elementPosInThisUnit].borderStyle = borderForLastToken(childUnitTokens[elementPos],unit.categories);
                            //         break;
                            //     }
                            //     case 'Middle': { // else 4
                            //         tokens[elementPosInThisUnit].borderStyle = borderForMiddleToken(childUnitTokens[elementPos],unit.categories);
                            //         break;
                            //     }
                            // }


                            // debugger
                            var parentToken = tokens[elementPosInThisUnit];
                            if (parentToken.inChildUnitTreeId) {
                                if (parentToken.leftBorder && parentToken.rightBorder) {
                                    parentToken.borderStyle = borderForFirstAndLastToken(unit.categories);
                                }
                                else if (parentToken.leftBorder) {
                                    parentToken.borderStyle = borderForFirstToken(childUnitTokens[elementPos], unit.categories);
                                }
                                else if (parentToken.rightBorder) {
                                   parentToken.borderStyle = borderForLastToken(childUnitTokens[elementPos], unit.categories);
                                }
                                else {
                                    parentToken.borderStyle = borderForMiddleToken(childUnitTokens[elementPos], unit.categories);
                                }
                            }
                        }
                    });
                }

            });
        }*/

        function borderForFirstAndLastToken(categories) {
            trace("annotationUnitDirective - borderForFirstAndLastToken");
            var actualCategories = categories.filter(function (category) {
                return category.id !== undefined;
            })
            switch (actualCategories.length) {
                case 0: {
                    return "border: none;"
                }
                case 1: {
                    return "border : 3px solid " + actualCategories[0].backgroundColor + "; margin-left: 3px;";
                }
                case 2: {
                    return "border : 3px solid " + actualCategories[0].backgroundColor + "; border-bottom : 3px solid " + actualCategories[1].backgroundColor + "; margin-left: 3px;";
                }
                case 3: {
                    return "border : 3px solid " + actualCategories[0].backgroundColor + "; border-bottom : 3px solid " + actualCategories[1].backgroundColor + "; border-left : 3px solid " + categories[2].backgroundColor + "; margin-left: 3px;";
                }
                default: {
                    return "border : 3px solid " + actualCategories[0].backgroundColor + "; border-bottom : 3px solid " + actualCategories[1].backgroundColor + "; border-left : 3px solid " + categories[2].backgroundColor + ";border-right : 3px solid " + categories[3].backgroundColor + "; margin-left: 3px;";
                }
            }
        }

        function borderForFirstToken(token, categories) {
            trace("annotationUnitDirective - borderForFirstToken");
            var actualCategories = categories.filter(function (category) {
                return category.id !== undefined;
            })
            switch (actualCategories.length) {
                case 0: {
                    return "border: none;"
                }
                case 1: {
                    return "border-top : 3px solid " + actualCategories[0].backgroundColor + "; border-bottom : 3px solid " + actualCategories[0].backgroundColor + "; border-left : 3px solid " + actualCategories[0].backgroundColor + "; margin-left: 3px;";
                }
                case 2: {
                    return "border-top : 3px solid " + categories[0].backgroundColor + "; border-bottom : 3px solid " + actualCategories[1].backgroundColor + "; border-left : 3px solid " + actualCategories[0].backgroundColor + "; margin-left: 3px;";
                }
                default: {
                    return "border-top : 3px solid " + categories[0].backgroundColor + "; border-bottom : 3px solid " + actualCategories[1].backgroundColor + "; border-left : 3px solid " + actualCategories[2].backgroundColor + "; margin-left: 3px;";
                }
            }


        }

        function borderForMiddleToken(token, categories) {
            trace("annotationUnitDirective - borderForMiddleToken");
            var actualCategories = categories.filter(function (category) {
                return category.id !== undefined;
            })
            switch (actualCategories.length) {
                case 0: {
                    return "border: none;"
                }
                case 1: {
                    return "border-top : 3px solid " + actualCategories[0].backgroundColor + "; border-bottom : 3px solid " + actualCategories[0].backgroundColor + ";";
                }
                default: {
                    return "border-top : 3px solid " + actualCategories[0].backgroundColor + "; border-bottom : 3px solid " + actualCategories[1].backgroundColor + ";";
                }
            }

            if (token.rightBorder && token.leftBorder) {
                return "border : 3px solid " + token.backgroundColor + ";";
            } else if (token.rightBorder) {
                return "border-top : 3px solid " + token.backgroundColor + "; border-bottom : 3px solid " + token.backgroundColor + "; border-left : 3px solid " + token.backgroundColor + ";"
            } else if (token.leftBorder) {
                return "border-top : 3px solid " + token.backgroundColor + ";  border-bottom : 3px solid " + token.backgroundColor + "; border-right : 3px solid " + token.backgroundColor + ";"
            }
            return "border-top : 3px solid " + token.backgroundColor + "; border-bottom : 3px solid " + token.backgroundColor + ";";

        }

        function borderForLastToken(token, categories) {
            trace("annotationUnitDirective - borderForLastToken");
            var actualCategories = categories.filter(function (category) {
                return category.id !== undefined;
            })
            switch (actualCategories.length) {
                case 0: {
                    return "border: none;"
                }
                case 1: {
                    return "border-top : 3px solid " + actualCategories[0].backgroundColor + "; border-bottom : 3px solid " + actualCategories[0].backgroundColor + "; border-right : 3px solid " + actualCategories[0].backgroundColor + "; margin-right: 3px;";
                }
                case 2: {
                    return "border-top : 3px solid " + actualCategories[0].backgroundColor + "; border-bottom : 3px solid " + actualCategories[1].backgroundColor + "; border-right : 3px solid " + actualCategories[0].backgroundColor + "; margin-right: 3px;";
                }
                case 3: {
                    return "border-top : 3px solid " + actualCategories[0].backgroundColor + "; border-bottom : 3px solid " + actualCategories[1].backgroundColor + "; border-right : 3px solid " + actualCategories[2].backgroundColor + "; margin-right: 3px;";
                }
                default: {
                    return "border-top : 3px solid " + actualCategories[0].backgroundColor + "; border-bottom : 3px solid " + actualCategories[1].backgroundColor + "; border-right : 3px solid " + actualCategories[3].backgroundColor + "; margin-right: 3px;";
                }
            }

        }

        /**
         * This function should really be called finishCurrentUnit if restrictions not violated.
         * @param unit_id
         * @param event
         */
        function checkRestrictionForCurrentUnit(unit_id, event) {
            trace("annotationUnitDirective - checkRestrictionForCurrentUnit");
            if (!unit_id) {
                // in case of coe here from hot key
                unit_id = $rootScope.clckedLine
                var rowElem = $('#directive-info-data-container-' + unit_id)
            }
            if (event) {
                //  in case come here from click on 'f' in unit gui row
                var rowElem = $(event.toElement).parents(".directive-info-data-container").first()
            }
            var unitToValidate = DataService.getUnitById(unit_id);
            var parentUnit = DataService.getUnitById(DataService.getParentUnitId(unitToValidate.tree_id))
            var hashTables = DataService.hashTables;
            var isUnitValidated = restrictionsValidatorService.checkRestrictionsOnFinish(unitToValidate, parentUnit, hashTables);
            if (isUnitValidated) {
                if (parentUnit.tree_id === "0") {
                    unitToValidate.gui_status = 'HIDDEN';
                    var nextSibling = getNextOpenSibling(unit_id);

                    selectionHandlerService.updateSelectedUnit(nextSibling.tree_id);
                } else {
                    unitToValidate.gui_status = 'COLLAPSE';
                    selectionHandlerService.updateSelectedUnit(parentUnit.tree_id);
                    Core.scrollToUnit(parentUnit.tree_id);
                }

                subTreeToCollapse(unitToValidate);
            }
            //TODO: add here to reset the selection handler if not validated;

            event ? event.stopPropagation() : '';

        }

        function getNextOpenSibling(unit_id) {
            var nextSibling = DataService.getNextSibling(unit_id);
            if (!nextSibling) {
                // nextSibling = DataService.getPrevUnit(unit_id); // If the unit is the last, get the prev unit
                nextSibling = DataService.tree;
            }
            while (nextSibling.gui_status !== 'OPEN') {
                nextSibling = getNextOpenSibling(nextSibling.tree_id);
            }
            return nextSibling;
        }

        function subTreeToCollapse(subtree_root_unit) {
            trace("annotationUnitDirective - subTreeToCollapse");
            return;
            subtree_root_unit.AnnotationUnits.forEach(function (unit) {
                DataService.getUnitById(unit.tree_id).gui_status = "COLLAPSE";

                subTreeToCollapse(unit);
            })
        }

        function toggleMouseUpDown(event) {
            trace("annotationUnitDirective - toggleMouseUpDown");
            HotKeysManager.updatePressedHotKeys({ combo: 'shift' }, !shiftPressed); // Mark shift as pressed anyway
            var shiftPressed = HotKeysManager.checkIfHotKeyIsPressed("shift");
            var ctrlPressed = HotKeysManager.checkIfCtrlOrCmdPressed();
            !shiftPressed && !ctrlPressed ? selectionHandlerService.clearTokenList() : '';

            shiftPressed = HotKeysManager.checkIfHotKeyIsPressed("shift");
            // shiftPressed && !ctrlPressed ? selectionHandlerService.clearTokenList() : '';
            selectionHandlerService.toggleMouseUpDown();
        }

        function toggleMouseUp(event) {
            trace("annotationUnitDirective - toggleMouseUp");
            HotKeysManager.updatePressedHotKeys({ combo: 'shift' }, false);
            HotKeysManager.updatePressedHotKeys({ combo: 'ctrl' }, false);

            var selectedTokensList = selectionHandlerService.getSelectedTokenList();

            selectedTokensList.forEach(function (token) {
                if (token.inChildUnitTreeId && DataService.getUnitById(token.inChildUnitTreeId)) {

                    var parentUnit = DataService.getUnitById(token.unitTreeId);
                    var tokenGroup = parentUnit.tokens.filter(function (x) { return x.inChildUnitTreeId === token.inChildUnitTreeId; });

                    tokenGroup.forEach(function (tokenInGroup) {
                        var elementPos = selectedTokensList.map(function (x) { return x.static.id; }).indexOf(tokenInGroup.static.id);
                        if (elementPos === -1) {
                            $rootScope.$broadcast('tokenIsClicked', { token: tokenInGroup, unitTreeId: tokenInGroup.unitTreeId, selectAllTokenInUnit: true });
                        }
                    })
                }
            })
        }

        function isUnitClicked(vm) {
            trace("annotationUnitDirective - isUnitClicked");
            return selectionHandlerService.getSelectedUnitId() === vm.dataBlock.tree_id;
        }

        function deleteUnit(unitId, vm) {
            trace("annotationUnitDirective - `");
            if (DataService.serverData.project.layer.type === ENV_CONST.LAYER_TYPE.REFINEMENT) {
                Core.showAlert("Cant delete annotation units from refinement layer")
                console.log('ALERT - deleteFromTree -  prevent delete from tree when refinement layer');
                return unitId;
            }

            var currentUnit = DataService.getUnitById(unitId);

            if (vm.dataBlock.comment) {
                open('app/pages/annotation/templates/deleteUnitWithComment.html', 'md', '', vm);
            }
            else if (currentUnit.cloned_to_tree_ids && currentUnit.cloned_to_tree_ids.length) {
                open('app/pages/annotation/templates/deleteAllRemoteModal.html', 'md', currentUnit.cloned_to_tree_ids.length, vm);
            } else {
                if (currentUnit.unitType === "REMOTE") {
                    //UpdateUsedAsRemote
                    var remoteUnit = DataService.getUnitById(currentUnit.cloned_from_tree_id);
                    // New Remote
                    DataService.deleteRemoteUnit(currentUnit);

                    // delete DataService.unitsUsedAsRemote[currentUnit.cloned_from_tree_id][currentUnit.tree_id];
                }
                var parentUnit = DataService.getParentUnitId(unitId);
                DataService.deleteUnit(unitId).then(function (res) {
                    selectionHandlerService.updateSelectedUnit(parentUnit);
                })
            }

        }

        function switchToRemoteMode(vm, event) {
            trace("annotationUnitDirective - switchToRemoteMode");
            // Change focus to the unit where '+' was clicked.
            selectionHandlerService.setSelectedUnitId(vm.treeId);
            addAsRemoteUnit(vm);
        }

        function addAsRemoteUnit(vm, category, event) {
            trace("annotationUnitDirective - addAsRemoteUnit");
            var clickedUnit = selectionHandlerService.getSelectedUnitId();
            if (DataService.getUnitById(clickedUnit).unitType === "REMOTE" || DataService.getUnitById(clickedUnit).unitType === "IMPLICIT") {
                // cant add remote unit to remote unit
                return;
            }
            if (category === undefined) {
                category = {
                    id: null,
                    color: 'gray',
                    abbreviation: null,
                    name: null
                };

            }
            //If a unit (not i the main passage) is selected switch to addRemoteUnit Mode
            if (selectionHandlerService.getUnitToAddRemotes() === clickedUnit) {
                selectionHandlerService.setUnitToAddRemotes("0");
                $('.annotation-page-container').removeClass('crosshair-cursor');
            }
            else if (clickedUnit !== '0') {
                $('.annotation-page-container').addClass('crosshair-cursor');
                selectionHandlerService.setUnitToAddRemotes(clickedUnit);
            }
        }

        function unitClicked(vm, index, event) {
            console.log("unitClicked")
            //DEBO
            HotKeysManager.setMouseMode(!HotKeysManager.getMouseMode())
            console.log("mousemode1", HotKeysManager.getMouseMode())
            trace("annotationUnitDirective - unitClicked");
            if (selectionHandlerService.getUnitToAddRemotes() !== "0" && selectionHandlerService.getUnitToAddRemotes() !== index) {
                var unitUsed = DataService.getUnitById(selectionHandlerService.getUnitToAddRemotes()).AnnotationUnits.map(function (x) { return x.cloned_from_tree_id; }).indexOf(vm.unit.tree_id);

                if (index == 0) {
                    selectionHandlerService.setUnitToAddRemotes("0");
                    $('.annotation-page-container').removeClass('crosshair-cursor');
                    open('app/pages/annotation/templates/errorModal.html', 'sm', 'Cannot add this unit as remote', vm);
                    return;
                }
                if (unitUsed > -1 || index == 0) {
                    selectionHandlerService.setUnitToAddRemotes("0");
                    $('.annotation-page-container').removeClass('crosshair-cursor');
                    open('app/pages/annotation/templates/errorModal.html', 'sm', 'Unit already exists as remote.', vm);
                    return;
                }
                if (selectionHandlerService.getUnitToAddRemotes().startsWith(index) || index.startsWith(selectionHandlerService.getUnitToAddRemotes())) {
                    selectionHandlerService.setUnitToAddRemotes("0");
                    $('.annotation-page-container').removeClass('crosshair-cursor');
                    open('app/pages/annotation/templates/errorModal.html', 'sm', 'Cannot add a descendant or ancestor as a remote unit.', vm);
                    return;
                }
                if (DataService.getUnitById(index).unitType === "REMOTE") {
                    selectionHandlerService.setUnitToAddRemotes("0");
                    $('.annotation-page-container').removeClass('crosshair-cursor');
                    open('app/pages/annotation/templates/errorModal.html', 'sm', 'Cannot add remote unit as remote.', vm);
                    return;
                }
                if (DataService.getUnitById(index).unitType === "IMPLICIT") {
                    selectionHandlerService.setUnitToAddRemotes("0");
                    $('.annotation-page-container').removeClass('crosshair-cursor');
                    open('app/pages/annotation/templates/errorModal.html', 'sm', 'Cannot add implicit unit as remote.', vm);
                    return;
                }

                // selectionHandlerService.disableTokenClicked();
                DataService.unitType = 'REMOTE';
                // var clickedUnit  = selectionHandlerService.getUnitToAddRemotes();
                var objToPush = {
                    rowId: '',
                    numOfAnnotationUnits: 0,
                    categories: selectionHandlerService.getCategoryForRemote() || [], // {color:defCtrl.definitionDetails.backgroundColor}
                    comment: "",
                    cluster: "",
                    rowShape: '',
                    unitType: 'REMOTE',
                    orderNumber: '-1',
                    gui_status: 'OPEN',
                    usedAsRemote: [],
                    children_tokens: [],
                    containsAllParentUnits: false,
                    tokens: angular.copy(DataService.getUnitById(index).tokens),
                    cloned_from_tree_id: vm.dataBlock.tree_id,
                    is_remote_copy: true,
                    AnnotationUnits: [
                    ]
                };

                selectionHandlerService.clearCategoryForRemote();

                objToPush["cloned_from_tree_id"] = vm.dataBlock.tree_id;

                var parentUnit = DataService.getUnitById(selectionHandlerService.getUnitToAddRemotes());

                if (selectionHandlerService.checkRestrictionsForRemote(parentUnit)) {
                    var newRowId = DataService.insertToTree(objToPush, selectionHandlerService.getUnitToAddRemotes()).then(function (res) {
                        DataService.unitType = 'REGULAR';
                        Core.scrollToUnit(selectionHandlerService.getUnitToAddRemotes());
                        selectionHandlerService.setUnitToAddRemotes("0");
                        $('.annotation-page-container').toggleClass('crosshair-cursor');
                    });
                }
                else {
                    return;
                }

            }
            event ? event.stopPropagation() : '';
            objToPush ? selectionHandlerService.updateSelectedUnit(objToPush.tree_id) : selectionHandlerService.updateSelectedUnit(index);
        }

        function updateStartEndIndexForTokens(tokens) {
            trace("annotationUnitDirective - updateStartEndIndexForTokens");
            var currentIndex = 0;
            tokens.forEach(function (token) {
                token.static.start_index = currentIndex;
                token.static.end_index = token.static.start_index;
                token.static.end_index += token.static.text.length;
                currentIndex = token.static.end_index + 2;
            })
        }

    }
})();
