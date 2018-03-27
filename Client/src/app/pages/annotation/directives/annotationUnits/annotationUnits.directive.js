(function() {
    'use strict';

    angular.module('zAdmin.annotation.directives')
        .directive('annotationUnits',annotationUnitDirective);

    /** @ngInject */
    function annotationUnitDirective($rootScope,DataService,selectionHandlerService,HotKeysManager,hotkeys,DefinitionsService, $timeout, $compile, $uibModal,restrictionsValidatorService, ENV_CONST, Core,$document) {

        var directive = {
            restrict:'E',
            templateUrl:'app/pages/annotation/directives/annotationUnits/annotationUnits.html',
            scope:{
                unit:'=',
                previewLine: '=',
                treeId: '=',
                childDirective: '@',
                categories: '=',
                control: '=',
                tokens:'='
            },
            link: annotationUnitDirectiveLink,
            controller: AnnotationUnitController,
            controllerAs: 'dirCtrl',
            bindToController: true,
            replace:false

        };

        return directive;

        function AnnotationUnitController(DataService) {
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
            vm.isUnitCollaped = isUnitCollaped;
            vm.isUnitHidden = isUnitHidden;
            vm.toggleMouseUp = toggleMouseUp;
            vm.highlightTokensInUnit0 = highlightTokensInUnit0;
            vm.dataBlock = DataService.getUnitById(vm.unit.tree_id);

            vm.dataBlock['cursorLocation'] = 0;
            vm.dataBlock.parentUnitId = DataService.getParentUnitId(vm.dataBlock.tree_id);
            vm.dataBlock.tree_id !== "0" ? updateStartEndIndexForTokens(vm.dataBlock.tokens) : '';

            vm.dataBlock.categoriesTooltip = categoriesTooltip(vm);
        }

        function annotationUnitDirectiveLink($scope, elem, attrs,$rootScope) {
            $scope.vm = $scope.dirCtrl;
            $scope.vm.dataBlock.tokens = $scope.vm.tokens;
            console.log("tokenCopy - --set-- put dataBlock.tokens in dataBlock.tokenCopy");
            $scope.vm.dataBlock.tokenCopy = angular.copy($scope.vm.dataBlock.tokens);

            $scope.vm.dataBlock.tokens.forEach(function(token){
                token.parentId = $scope.vm.dataBlock.tree_id;
            })

            /**
             * if dataBlock.children_token_map not exist, create this dictionary {tokenId: token, tokenId: token, ...}
             */
            if($scope.vm.dataBlock.children_tokens_map === undefined){
                $scope.vm.dataBlock.children_tokens_map = {};
                $scope.vm.dataBlock.tokens.forEach(function(token){
                    $scope.vm.dataBlock.children_tokens_map[token.id] = token;
                })
            }

            if($scope.vm.dataBlock.gui_status === undefined){
                $scope.vm.dataBlock.gui_status = "HIDDEN";
            }
            
            $scope.$on('ToggleParents', function(event, args) {
                $scope.showParents = !$scope.showParents;
            });

            $scope.$on('CreateRemoteUnit', function(event, args) {
                if(args.unitId.toString() === $scope.vm.dataBlock.tree_id ){
                    selectionHandlerService.setCategoryForRemote(args.category);
                    switchToRemoteMode($scope.vm)
                }
            });

            $scope.$on('ToggleSuccess', function(event, args) {
                if(args.id.toString() === $scope.vm.dataBlock.tree_id ){
                    var parentUnit = DataService.getUnitById(DataService.getParentUnitId($scope.vm.dataBlock.tree_id ));
                    paintTokens(parentUnit.tokens,parentUnit);
                }
                $scope.vm.dataBlock.categoriesTooltip = categoriesTooltip($scope.vm);
            });

            $scope.$on('checkRestrictionForCurrentUnit', function(event, args) {
                if(args.unitId.toString() === $scope.vm.dataBlock.tree_id ){
                    checkRestrictionForCurrentUnit(args.unitId);
                }
                if(event){
                    event.preventDefault();
                }
            });

            // OBSOLETE
            //$scope.$on('ResetFromBarSuccess', function(event, args) {
            //    $scope.vm.dataBlock.cursorLocation = 0;
            //});

            $scope.$on('InsertSuccess', function(event, args) {
                if(args.dataBlock.id.toString() === $scope.vm.dataBlock.tree_id ){
                    if($scope.vm.dataBlock.AnnotationUnits.AnnotationUnits){
                        delete $scope.vm.dataBlock.AnnotationUnits.AnnotationUnits;
                    }
                    selectionHandlerService.updateSelectedUnit($scope.vm.dataBlock.tree_id,true);
                    paintTokens($scope.vm.tokens,$scope.vm.dataBlock);
                    
                }
            });

            $scope.$on('DeleteSuccess', function(event, args) {
                if(args.reset){
                    var parentUnit = DataService.getUnitById(DataService.getParentUnitId($scope.vm.dataBlock.tree_id ));
                    RemoveBorder(parentUnit.tokens,parentUnit);
                }else{
                   $scope.vm.tokens.forEach(function(token,index,inInit){
                       token.indexInParent = index;
                   });
                    paintTokens($scope.vm.tokens,$scope.vm.dataBlock,true);
                }

                $scope.vm.dataBlock.tokens.forEach(function(token){
                        token.parentId = $scope.vm.dataBlock.tree_id;
                })
            });

            $scope.$on('RemoveBorder', function(event, args) {
                if(args.id.toString() === $scope.vm.dataBlock.tree_id ){
                    var parentUnit = DataService.getUnitById(DataService.getParentUnitId($scope.vm.dataBlock.tree_id ));
                    RemoveBorder(parentUnit.tokens,parentUnit);
                }
            });


            if($scope.vm.dataBlock.AnnotationUnits && $scope.vm.dataBlock.AnnotationUnits.length > 0){
            	paintTokens($scope.vm.tokens,$scope.vm.dataBlock);
            }else{
            	""; //$scope.vm.dataBlock.gui_status = "HIDDEN";
            }
            
        }
        

        function isUnitHidden(vm){
            return vm.gui_status === "HIDDEN";
        }

        function categoriesTooltip(vm){
            var output = '';
            for (var index in vm.dataBlock.categories) {
                output = output + ' ' + vm.dataBlock.categories[index].name;
            }
            return output;
        }

        function toggleAnnotationUnitView(vm){
            if(vm.dataBlock.gui_status === "OPEN"){
                vm.dataBlock.gui_status = "COLLAPSE";

                subTreeToCollapse(vm.dataBlock);
            }else{
                vm.dataBlock.gui_status = "OPEN";
            }
        }

        function isUnitCollaped(vm){
            return vm.dataBlock.gui_status === "COLLAPSE";
        }

        function unitIsSelected(vm){
            if(selectionHandlerService.getSelectedUnitId() === vm.dataBlock.tree_id){
                $rootScope.currentVm = vm;
            }
            var unitIsSelect = selectionHandlerService.getSelectedUnitId() === vm.dataBlock.tree_id;
            if (selectionHandlerService.getSelectedUnitId() == 0) {
                highlightTokensInUnit0([]);
            }
            if (unitIsSelect) {
                highlightTokensInUnit0(vm.tokens);
            }
            return unitIsSelect;
        }

        function highlightTokensInUnit0(tokens) {
            $rootScope.$broadcast('highlightTokens',{tokens: tokens});
        }

        function addCommentToUnit(unitId,vm){
            selectionHandlerService.updateSelectedUnit(unitId);
            open('app/pages/annotation/templates/commentOnUnitModal.html','sm','',vm)
        }
        function addClusterToUnit(unitId,vm){
            selectionHandlerService.updateSelectedUnit(unitId);
            open('app/pages/annotation/templates/clusterOnUnitModal.html','sm','',vm)
        }
        function open(page, size,message,vm) {
            var remoteOriginalId = $rootScope.clckedLine;
            var viewModal = vm;
            $uibModal.open({
                animation: true,
                templateUrl: page,
                size: size,
                controller: function($scope){
                    $scope.vm = viewModal;
                    if(vm.dataBlock){
                        $scope.comment = $scope.vm.dataBlock.comment;
                        $scope.cluster = $scope.vm.dataBlock.cluster;
                    }

                    $scope.message = message;

                    $scope.saveComment = function(){
                        $scope.vm.dataBlock.comment = $scope.comment;
                    }
                    
                    $scope.saveCluster = function(){
                        $scope.vm.dataBlock.cluster = $scope.cluster;
                        console.log('now');
                    }


                    var remoteOriginalTreeId = remoteOriginalId;
                    $scope.deleteAllRemoteInstanceOfThisUnit = function(){

                        for(var key in DataService.unitsUsedAsRemote[$scope.vm.dataBlock.tree_id]){
                            DataService.deleteUnit(key);
                            delete DataService.unitsUsedAsRemote[$scope.vm.dataBlock.tree_id][key];
                        }
                        DataService.deleteUnit($scope.vm.dataBlock.tree_id);
                        // selCtrl.updateUI(DataService.getUnitById($("[unit-wrapper-id="+$rootScope.clickedUnit+"]").attr('child-unit-id')));
                    };
                }
            }).result.then(function(okRes){

            },function(abortRes){

            });
        };



        function andBorderColor(tokens){
            tokens.forEach(function(token){
                if(token.categories.length === 2){
                    token.borderStyle = "border-top : 3px solid "+token.categories[1].backgroundColor+"; border-bottom : 3px solid "+token.categories[0].backgroundColor+"; border-left : 3px solid "+token.categories[0].backgroundColor+";"
                }
            })
        }

        function RemoveBorder(tokens, dataBlock){
            dataBlock.AnnotationUnits.forEach(function(unit,index){
                unit.tokens.forEach(function(token){
                    var childUnitTokens = dataBlock.AnnotationUnits[index].tokens;
                    var elementPos = childUnitTokens.map(function(x) {return x.id; }).indexOf(token.id);
                    var elementPosInThisUnit = tokens.map(function(x) {return x.id; }).indexOf(token.id);
                    if(elementPos !== -1 && elementPosInThisUnit !== -1){
                        tokens[elementPosInThisUnit].borderStyle = "border : none;";
                    }
                })
            });
        }


        function paintTokens(tokens, dataBlock,afterDelete){
            dataBlock.AnnotationUnits.forEach(function(unit,index){
                if(unit.unitType !== "REMOTE"){
                    if(afterDelete){
                        unit.tokens.forEach(function(token){
                          var childUnitTokens = dataBlock.AnnotationUnits[index].tokens;
                          var elementPos = childUnitTokens.map(function(x) {return x.id; }).indexOf(token.id);
                          var elementPosInThisUnit = tokens.map(function(x) {return x.id; }).indexOf(token.id);
                          token.indexInParent = elementPosInThisUnit;
                          if(DataService.getParentUnit(token.parentId)){
                            token.parentId = DataService.getParentUnit(token.parentId).tree_id;
                          }
                        })

                        // selectionHandlerService.updateIndexInParentAttribute(unit.tokens); // Is it needed?
                        selectionHandlerService.updatePositionInUnitAttribute(unit.tokens);
                        selectionHandlerService.updateNextTokenNotAdjacent(unit.tokens);
                        selectionHandlerService.updateLastTokenNotAdjacent(unit.tokens);
                    }
                    

                    unit.tokens.forEach(function(token){
                      	var childUnitTokens = dataBlock.AnnotationUnits[index].tokens;
                        var elementPos = childUnitTokens.map(function(x) {return x.id; }).indexOf(token.id);
                        var elementPosInThisUnit = tokens.map(function(x) {return x.id; }).indexOf(token.id);


                        // token.indexInParent = elementPosInThisUnit;

                        if(elementPos !== -1 && elementPosInThisUnit !== -1){
                            if(unit.categories.length === 1 && unit.categories[0] === undefined || unit.categories.length === 0){
                                unit.categories[0] = {
                                    id:-1,
                                    backgroundColor: 'gray'
                                }
                            }
                            childUnitTokens[elementPos].backgroundColor = unit.categories[0] ? unit.categories[0].backgroundColor : "transparent";
                            
                            if(unit.categories[0].fromParentLayer && !unit.categories[0].refinedCategory){

                            	var relevant = false;
                            	unit.AnnotationUnits.forEach(function(childUnit){
                            		paintTokens(childUnit.tokens, childUnit);
                            		if(!childUnit.categories[0].fromParentLayer || childUnit.categories[0].refinedCategory){
                            			relevant = true;
                            		}
                            	})
                            	if(!relevant){
                            		unit.categories[0].backgroundColor = "gray";
                                	unit.gui_status = "HIDDEN";
                            	}else{
//                            		unit.gui_status = "OPEN";
                            	}
//                            }else if(unit.categories.some(function(category){return category.refinementCategory})){
//                             	unit.gui_status = "HIDDEN";
                        	}else{
//                        		unit.gui_status = "OPEN";
                        	}
                            
                            if(unit.categories.length === 1 && unit.categories[0].id === -1){
                                tokens[elementPosInThisUnit].borderStyle = "transparent";
                            }

                            if(unit.categories.length > 1){
                                var elementPos = unit.categories.map(function(x) {return x.id; }).indexOf(-1);
                                if(elementPos > -1){
                                    unit.categories.splice(unit.categories,1);
                                }
                            }
                            

                            switch(token.positionInUnit){
                                case 'First': {
                                    tokens[elementPosInThisUnit].borderStyle = borderForFirstToken(childUnitTokens[elementPos],unit.categories);
                                    break;
                                }
                                case 'FirstAndLast':{
                                    tokens[elementPosInThisUnit].borderStyle = borderForFirstAndLastToken(unit.categories);
                                    break;
                                }
                                case 'Last': {
                                    tokens[elementPosInThisUnit].borderStyle = borderForLastToken(childUnitTokens[elementPos],unit.categories);
                                    break;
                                }
                                case 'Middle': {
                                    tokens[elementPosInThisUnit].borderStyle = borderForMiddleToken(childUnitTokens[elementPos],unit.categories);
                                    break;
                                }
                            }

                        }
                    })
                }

            });
        }

        function borderForFirstAndLastToken(categories){
            var actualCategories = categories.filter(function(category){
                return category.id !== undefined;
            })
            switch(actualCategories.length){
                case 0:{
                    return "border: none;"
                }    
                case 1:{
                    return "border : 3px solid "+actualCategories[0].backgroundColor+"; margin-left: 3px;";
                }
                case 2:{
                    return "border : 3px solid "+actualCategories[0].backgroundColor+"; border-bottom : 3px solid "+actualCategories[1].backgroundColor+"; margin-left: 3px;";
                }
                case 3:{
                    return "border : 3px solid "+actualCategories[0].backgroundColor+"; border-bottom : 3px solid "+actualCategories[1].backgroundColor+"; border-left : 3px solid "+categories[2].backgroundColor+"; margin-left: 3px;";
                }
                default:{
                    return "border : 3px solid "+actualCategories[0].backgroundColor+"; border-bottom : 3px solid "+actualCategories[1].backgroundColor+"; border-left : 3px solid "+categories[2].backgroundColor+";border-right : 3px solid "+categories[3].backgroundColor+"; margin-left: 3px;";
                }
            }
        }

        function borderForFirstToken(token,categories){
            var actualCategories = categories.filter(function(category){
                return category.id !== undefined;
            })
            switch(actualCategories.length){
                case 0:{
                    return "border: none;"
                }
                case 1:{
                    return "border-top : 3px solid "+actualCategories[0].backgroundColor+"; border-bottom : 3px solid "+actualCategories[0].backgroundColor+"; border-left : 3px solid "+actualCategories[0].backgroundColor+"; margin-left: 3px;";
                }
                case 2:{
                    return "border-top : 3px solid "+categories[0].backgroundColor+"; border-bottom : 3px solid "+actualCategories[1].backgroundColor+"; border-left : 3px solid "+actualCategories[0].backgroundColor+"; margin-left: 3px;";
                }
                default:{
                    return "border-top : 3px solid "+categories[0].backgroundColor+"; border-bottom : 3px solid "+actualCategories[1].backgroundColor+"; border-left : 3px solid "+actualCategories[2].backgroundColor+"; margin-left: 3px;";
                }
            }


        }
        function borderForMiddleToken(token,categories){
            var actualCategories = categories.filter(function(category){
                return category.id !== undefined;
            })
            switch(actualCategories.length){
                case 0:{
                    return "border: none;"
                }
                case 1:{
                    return "border-top : 3px solid "+actualCategories[0].backgroundColor+"; border-bottom : 3px solid "+actualCategories[0].backgroundColor+";";
                }
                default:{
                    return "border-top : 3px solid "+actualCategories[0].backgroundColor+"; border-bottom : 3px solid "+actualCategories[1].backgroundColor+";";
                }
            }

            if(token.lastTokenNotAdjacent && token.nextTokenNotAdjacent){
                return "border : 3px solid "+token.backgroundColor+";";
            }else if(token.lastTokenNotAdjacent){
                return "border-top : 3px solid "+token.backgroundColor+"; border-bottom : 3px solid "+token.backgroundColor+"; border-left : 3px solid "+token.backgroundColor+";"
            }else if(token.nextTokenNotAdjacent){
                return "border-top : 3px solid "+token.backgroundColor+";  border-bottom : 3px solid "+token.backgroundColor+"; border-right : 3px solid "+token.backgroundColor+";"
            }
            return "border-top : 3px solid "+token.backgroundColor+"; border-bottom : 3px solid "+token.backgroundColor+";";

        }

        function borderForLastToken(token,categories){
            var actualCategories = categories.filter(function(category){
                return category.id !== undefined;
            })
            switch(actualCategories.length){
                case 0:{
                    return "border: none;"
                }
                case 1:{
                    return "border-top : 3px solid "+actualCategories[0].backgroundColor+"; border-bottom : 3px solid "+actualCategories[0].backgroundColor+"; border-right : 3px solid "+actualCategories[0].backgroundColor+"; margin-right: 3px;";
                }
                case 2:{
                    return "border-top : 3px solid "+actualCategories[0].backgroundColor+"; border-bottom : 3px solid "+actualCategories[1].backgroundColor+"; border-right : 3px solid "+actualCategories[0].backgroundColor+"; margin-right: 3px;";
                }
                case 3:{
                    return "border-top : 3px solid "+actualCategories[0].backgroundColor+"; border-bottom : 3px solid "+actualCategories[1].backgroundColor+"; border-right : 3px solid "+actualCategories[2].backgroundColor+"; margin-right: 3px;";
                }
                default:{
                    return "border-top : 3px solid "+actualCategories[0].backgroundColor+"; border-bottom : 3px solid "+actualCategories[1].backgroundColor+"; border-right : 3px solid "+actualCategories[3].backgroundColor+"; margin-right: 3px;";
                }
            }

        }

        function checkRestrictionForCurrentUnit(unit_id,event){
            if(!unit_id){
                // in case of coe here from hot key
                unit_id = $rootScope.clckedLine
                var rowElem = $('#directive-info-data-container-'+unit_id)
            }
            if(event){
                //  in case come here from click on 'f' in unit gui row
                var rowElem = $(event.toElement).parents(".directive-info-data-container").first()
            }
            var unitToValidate = DataService.getUnitById(unit_id);
            var parentUnit = DataService.getUnitById(DataService.getParentUnitId(unitToValidate.tree_id))
            var hashTables = DataService.hashTables;
            var isUnitValidated = restrictionsValidatorService.checkRestrictionsOnFinish(unitToValidate,parentUnit,hashTables);
            if(isUnitValidated){
                selectionHandlerService.updateSelectedUnit(parentUnit.tree_id);
                if(parentUnit.tree_id === "0"){
                    unitToValidate.gui_status = 'HIDDEN';
                }else{
                    unitToValidate.gui_status = 'COLLAPSE';
                }

                subTreeToCollapse(unitToValidate);

                Core.scrollToUnit(parentUnit.tree_id);
//                Core.showNotification('success','Annotation unit ' + unitToValidate.tree_id + ' has finished successfully' )
            }

            event ? event.stopPropagation() : '';
            
            
        }

        function subTreeToCollapse(subtree_root_unit){
            return ;
            subtree_root_unit.AnnotationUnits.forEach(function(unit){
               DataService.getUnitById(unit.tree_id).gui_status = "COLLAPSE";

               subTreeToCollapse(unit);
            })
        }

        function toggleMouseUpDown(event){
            HotKeysManager.updatePressedHotKeys({combo:'shift'},!shiftPressed);
            var shiftPressed = HotKeysManager.checkIfHotKeyIsPressed("shift");
            var ctrlPressed = HotKeysManager.checkIfHotKeyIsPressed("ctrl");
            !shiftPressed && !ctrlPressed ? selectionHandlerService.clearTokenList() : '';

            shiftPressed = HotKeysManager.checkIfHotKeyIsPressed("shift");
            // shiftPressed && !ctrlPressed ? selectionHandlerService.clearTokenList() : '';
            selectionHandlerService.toggleMouseUpDown();
        }

        function toggleMouseUp(event) {
            HotKeysManager.updatePressedHotKeys({combo: 'shift'}, false);
            HotKeysManager.updatePressedHotKeys({combo: 'ctrl'}, false);

            var selectedTokensList = selectionHandlerService.getSelectedTokenList();

            selectedTokensList.forEach(function(token){
                if(token.inUnit && DataService.getUnitById(token.inUnit)){

                    var parentUnit = DataService.getUnitById(token.parentId);
                    var tokenGroup = parentUnit.tokens.filter(function(x) {return x.inUnit === token.inUnit; });

                    tokenGroup.forEach(function(tokenInGroup){
                        var elementPos = selectedTokensList.map(function(x) {return x.id; }).indexOf(tokenInGroup.id);
                        if(elementPos === -1){
                            $rootScope.$broadcast('tokenIsClicked',{token: tokenInGroup, parentId: tokenInGroup.parentId,selectAllTokenInUnit: true});
                        }
                    })
                }
            })
        }

        function isUnitClicked(vm){
            return selectionHandlerService.getSelectedUnitId() === vm.dataBlock.tree_id;
        }

        function deleteUnit(unitId,vm){
            if(DataService.serverData.project.layer.type === ENV_CONST.LAYER_TYPE.REFINEMENT){
                Core.showAlert("Cant delete annotation units from refinement layer")
                console.log('ALERT - deleteFromTree -  prevent delete from tree when refinement layer');
                return unitId;
            }

            var currentUnit = DataService.getUnitById(unitId);


            if(DataService.unitsUsedAsRemote[unitId] !==  undefined && !Core.isEmptyObject(DataService.unitsUsedAsRemote[unitId])){
                open('app/pages/annotation/templates/deleteAllRemoteModal.html','md',Object.keys(DataService.unitsUsedAsRemote[unitId]).length,vm);
            }else{
                if(currentUnit.unitType === "REMOTE"){
                    //UpdateUsedAsRemote
                    var remoteUnit = DataService.getUnitById(currentUnit.remote_original_id);
                    var elementPos = DataService.unitsUsedAsRemote[currentUnit.remote_original_id][currentUnit.tree_id]
                    if(elementPos){
                        delete DataService.unitsUsedAsRemote[currentUnit.remote_original_id][currentUnit.tree_id];
                    }

                    delete DataService.unitsUsedAsRemote[currentUnit.remote_original_id][currentUnit.tree_id];
                }
                var parentUnit = DataService.getParentUnitId(unitId);
                DataService.deleteUnit(unitId).then(function(res){
                    selectionHandlerService.updateSelectedUnit(parentUnit);
                })
            }

        }

        function switchToRemoteMode(vm,event){
            addAsRemoteUnit(vm);
        }

        function addAsRemoteUnit(vm,category,event){
            var clickedUnit = selectionHandlerService.getSelectedUnitId();
            if(DataService.getUnitById(clickedUnit).unitType === "REMOTE" || DataService.getUnitById(clickedUnit).unitType === "IMPLICIT"){
                // cant add remote unit to remote unit
                return;
            }
            if(category === undefined){
                category = {
                    id : null,
                    color : 'gray',
                    abbreviation : null,
                    name : null
                };

            }
            //If a unit (not i the main passage) is selected switch to addRemoteUnit Mode
            if(clickedUnit !== '0'){
                $('.annotation-page-container').toggleClass('crosshair-cursor');
                selectionHandlerService.setUnitToAddRemotes(clickedUnit);
            }
        }

        function unitClicked(vm,index, event){
            if(selectionHandlerService.getUnitToAddRemotes() !== "0" && selectionHandlerService.getUnitToAddRemotes() !== index){
                var unitUsed = DataService.getUnitById(selectionHandlerService.getUnitToAddRemotes()).AnnotationUnits.map(function(x) {return x.remote_original_id; }).indexOf(vm.unit.tree_id);

                if(index == 0){
                  selectionHandlerService.setUnitToAddRemotes("0");
                  $('.annotation-page-container').removeClass('crosshair-cursor');
                  open('app/pages/annotation/templates/errorModal.html','sm','Cannot add this unit as remote',vm);
                  return;
                }
                if(unitUsed > -1 || index == 0){
                    selectionHandlerService.setUnitToAddRemotes("0");
                    $('.annotation-page-container').removeClass('crosshair-cursor');
                    open('app/pages/annotation/templates/errorModal.html','sm','Unit already exists as remote.',vm);
                    return;
                }
                if(DataService.getUnitById(index).unitType === "REMOTE" || selectionHandlerService.getUnitToAddRemotes().startsWith(index) || index.startsWith(selectionHandlerService.getUnitToAddRemotes())){
                    selectionHandlerService.setUnitToAddRemotes("0");
                    $('.annotation-page-container').removeClass('crosshair-cursor');
                    open('app/pages/annotation/templates/errorModal.html','sm','Cannot add remote unit as remote.',vm);
                    return;
                }
                // selectionHandlerService.disableTokenClicked();
                DataService.unitType = 'REMOTE';
                // var clickedUnit  = selectionHandlerService.getUnitToAddRemotes();
                var objToPush = {
                    rowId : '',
                    numOfAnnotationUnits: 0,
                    categories: selectionHandlerService.getCategoryForRemote() || [], // {color:defCtrl.definitionDetails.backgroundColor}
                    comment:"",
                    cluster:"",
                    rowShape:'',
                    unitType:'REMOTE',
                    orderNumber: '-1',
                    gui_status:'OPEN',
                    usedAsRemote:[],
                    children_tokens:[],
                    containsAllParentUnits: false,
                    tokens:angular.copy(DataService.getUnitById(index).tokens),
                    AnnotationUnits : [

                    ]
                };

                selectionHandlerService.clearCategoryForRemote();

                objToPush["remote_original_id"] = vm.dataBlock.tree_id;

                var newRowId = DataService.insertToTree(objToPush,selectionHandlerService.getUnitToAddRemotes()).then(function(res){
                    DataService.unitType = 'REGULAR';

                    if(DataService.unitsUsedAsRemote[vm.dataBlock.tree_id] === undefined){
                        DataService.unitsUsedAsRemote[vm.dataBlock.tree_id] = {};
                    }
                    DataService.unitsUsedAsRemote[vm.dataBlock.tree_id][res.id] = true;


                    selectionHandlerService.setUnitToAddRemotes("0");
                    $('.annotation-page-container').toggleClass('crosshair-cursor');
                });


            }
            event ? event.stopPropagation() : '';
            objToPush ? selectionHandlerService.updateSelectedUnit(objToPush.tree_id) : selectionHandlerService.updateSelectedUnit(index);
        }

        function updateStartEndIndexForTokens(tokens){
            var currentIndex = 0;
            tokens.forEach(function(token){
                token.start_index = currentIndex;
                token.end_index = token.start_index;
                token.end_index += token.text.length;
                currentIndex = token.end_index + 2;
            })

        }




    }

})();
