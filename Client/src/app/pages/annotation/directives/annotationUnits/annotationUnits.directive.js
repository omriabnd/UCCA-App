(function() {
    'use strict';

    angular.module('zAdmin.annotation.directives')
        .directive('annotationUnits',annotationUnitDirective);

    /** @ngInject */
    function annotationUnitDirective($rootScope,DataService,selectionHandlerService,HotKeysManager,hotkeys,DefinitionsService, $timeout, $compile, $uibModal,restrictionsValidatorService, ENV_CONST, Core) {

        var directive = {
            restrict:'E',
            templateUrl:'app/pages/annotation/directives/annotationUnits/annotationUnits.html',
            scope:{
                unit:'=',
                previewLine: '=',
                annotationUnitTreeId: '=',
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
            vm.isUnitClicked = isUnitClicked;
            vm.deleteUnit = deleteUnit;
            vm.toggleMouseUpDown = toggleMouseUpDown;
            vm.checkRestrictionForCurrentUnit = checkRestrictionForCurrentUnit;
            vm.addCommentToUnit = addCommentToUnit;
            vm.unitIsSelected =unitIsSelected;
            vm.switchToRemoteMode = switchToRemoteMode;
            vm.toggleAnnotationUnitView = toggleAnnotationUnitView;
            vm.isUnitCollaped = isUnitCollaped;
            vm.isUnitHidden = isUnitHidden;
            vm.dataBlock = DataService.getUnitById(vm.unit.annotation_unit_tree_id);

            vm.dataBlock['cursorLocation'] = 0;
            vm.dataBlock.parentUnitId = DataService.getParentUnitId(vm.dataBlock.annotation_unit_tree_id);
            vm.dataBlock.annotation_unit_tree_id !== "0" ? updateStartEndIndexForTokens(vm.dataBlock.tokens) : '';

        }

        function annotationUnitDirectiveLink($scope, elem, attrs) {
            $scope.vm = $scope.dirCtrl;
            $scope.vm.dataBlock.tokens = $scope.vm.tokens;
            $scope.vm.dataBlock.tokenCopy = angular.copy($scope.vm.dataBlock.tokens)

            if($scope.vm.dataBlock.children_tokens_hash === undefined){
                $scope.vm.dataBlock.children_tokens_hash = {};
                $scope.vm.dataBlock.tokens.forEach(function(token){
                    $scope.vm.dataBlock.children_tokens_hash[token.id] = token;
                })
            }

            if($scope.vm.dataBlock.gui_status === undefined){
                $scope.vm.dataBlock.gui_status = "OPEN";
            }

            $scope.$on('ToggleSuccess', function(event, args) {
                if(args.id.toString() === $scope.vm.dataBlock.annotation_unit_tree_id ){
                    var parentUnit = DataService.getUnitById(DataService.getParentUnitId($scope.vm.dataBlock.annotation_unit_tree_id ));
                    paintTokens(parentUnit.tokens,parentUnit);
                }else{
                }
            });

            $scope.$on('InsertSuccess', function(event, args) {
                if(args.dataBlock.id.toString() === $scope.vm.dataBlock.annotation_unit_tree_id ){
                    if($scope.vm.dataBlock.AnnotationUnits.AnnotationUnits){
                        delete $scope.vm.dataBlock.AnnotationUnits.AnnotationUnits;
                    }
                    selectionHandlerService.updateSelectedUnit($scope.vm.dataBlock.annotation_unit_tree_id,true);
                    paintTokens($scope.vm.tokens,$scope.vm.dataBlock);
                }else{
                }
            });

            $scope.$on('DeleteSuccess', function(event, args) {
                if(args.reset){
                    var parentUnit = DataService.getUnitById(DataService.getParentUnitId($scope.vm.dataBlock.annotation_unit_tree_id ));
                    RemoveBorder(parentUnit.tokens,parentUnit);
                }else{
                    paintTokens($scope.vm.tokens,$scope.vm.dataBlock);
                }
            });

            $scope.$on('RemoveBorder', function(event, args) {
                if(args.id.toString() === $scope.vm.dataBlock.annotation_unit_tree_id ){
                    var parentUnit = DataService.getUnitById(DataService.getParentUnitId($scope.vm.dataBlock.annotation_unit_tree_id ));
                    RemoveBorder(parentUnit.tokens,parentUnit);
                }
            });


            $scope.vm.dataBlock.AnnotationUnits.length > 0 ? paintTokens($scope.vm.tokens,$scope.vm.dataBlock) : '';
        }

        function isUnitHidden(vm){
            return vm.gui_status === "HIDDEN";
        }

        function toggleAnnotationUnitView(vm){
            if(vm.dataBlock.gui_status === "OPEN"){
                vm.dataBlock.gui_status = "COLLAPSE"
            }else{
                vm.dataBlock.gui_status = "OPEN";
            }
        }

        function isUnitCollaped(vm){
            return vm.dataBlock.gui_status === "COLLAPSE";
        }

        function unitIsSelected(vm){
            return selectionHandlerService.getSelectedUnitId() === vm.dataBlock.annotation_unit_tree_id;
        }
        function addCommentToUnit(unitId,vm){
            selectionHandlerService.updateSelectedUnit(unitId);
            open('app/pages/annotation/templates/commentOnUnitModal.html','sm','',vm)
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
                    }

                    $scope.message = message;

                    $scope.saveComment = function(){
                        $scope.vm.dataBlock.comment = $scope.comment;
                    }

                    var remoteOriginalTreeId = remoteOriginalId;
                    $scope.deleteAllRemoteInstanceOfThisUnit = function(){

                        for(var key in DataService.unitsUsedAsRemote[$scope.vm.dataBlock.annotation_unit_tree_id]){
                            DataService.deleteUnit(key);
                            delete DataService.unitsUsedAsRemote[$scope.vm.dataBlock.annotation_unit_tree_id][key];
                        }
                        DataService.deleteUnit($scope.vm.dataBlock.annotation_unit_tree_id);
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
                    if(elementPos !== -1){
                        tokens[elementPosInThisUnit].borderStyle = "border : none;";
                    }
                })
            });
        }

        function paintTokens(tokens, dataBlock){
            dataBlock.AnnotationUnits.forEach(function(unit,index){
                if(unit.unitType !== "REMOTE"){
                    unit.tokens.forEach(function(token){
                        var childUnitTokens = dataBlock.AnnotationUnits[index].tokens;
                        var elementPos = childUnitTokens.map(function(x) {return x.id; }).indexOf(token.id);
                        var elementPosInThisUnit = tokens.map(function(x) {return x.id; }).indexOf(token.id);
                        if(elementPos !== -1 && elementPosInThisUnit !== -1){
                            if(unit.categories.length === 1 && unit.categories[0] === undefined || unit.categories.length === 0){
                                unit.categories[0] = {
                                    id:9999,
                                    backgroundColor: 'gray'
                                }
                            }
                            childUnitTokens[elementPos].backgroundColor = unit.categories[0] ? unit.categories[0].backgroundColor : "transparent";

                            if(unit.categories.length === 1 && unit.categories[0].id === 9999){
                                tokens[elementPosInThisUnit].borderStyle = "transparent";
                            }

                            if(unit.categories.length > 1){
                                var elementPos = unit.categories.map(function(x) {return x.id; }).indexOf(9999);
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
            switch(categories.length){
                case 1:{
                    return "border : 3px solid "+categories[0].backgroundColor+";";
                }
                case 2:{
                    return "border : 3px solid "+categories[0].backgroundColor+"; border-bottom : 3px solid "+categories[1].backgroundColor+";";
                }
                case 3:{
                    return "border : 3px solid "+categories[0].backgroundColor+"; border-bottom : 3px solid "+categories[1].backgroundColor+"; border-left : 3px solid "+categories[2].backgroundColor+";";
                }
                default:{
                    return "border : 3px solid "+categories[0].backgroundColor+"; border-bottom : 3px solid "+categories[1].backgroundColor+"; border-left : 3px solid "+categories[2].backgroundColor+";border-right : 3px solid "+categories[3].backgroundColor+";";
                }
            }
        }

        function borderForFirstToken(token,categories){
            switch(categories.length){
                case 1:{
                    return "border-top : 3px solid "+categories[0].backgroundColor+"; border-bottom : 3px solid "+categories[0].backgroundColor+"; border-left : 3px solid "+categories[0].backgroundColor+";";
                }
                case 2:{
                    return "border-top : 3px solid "+categories[0].backgroundColor+"; border-bottom : 3px solid "+categories[1].backgroundColor+"; border-left : 3px solid "+categories[0].backgroundColor+";";
                }
                default:{
                    return "border-top : 3px solid "+categories[0].backgroundColor+"; border-bottom : 3px solid "+categories[1].backgroundColor+"; border-left : 3px solid "+categories[2].backgroundColor+";";
                }
            }


        }
        function borderForMiddleToken(token,categories){
            switch(categories.length){
                case 1:{
                    return "border-top : 3px solid "+categories[0].backgroundColor+"; border-bottom : 3px solid "+categories[0].backgroundColor+";";
                }
                default:{
                    return "border-top : 3px solid "+categories[0].backgroundColor+"; border-bottom : 3px solid "+categories[1].backgroundColor+";";
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
            switch(categories.length){
                case 1:{
                    return "border-top : 3px solid "+categories[0].backgroundColor+"; border-bottom : 3px solid "+categories[0].backgroundColor+"; border-right : 3px solid "+categories[0].backgroundColor+";";
                }
                case 2:{
                    return "border-top : 3px solid "+categories[0].backgroundColor+"; border-bottom : 3px solid "+categories[1].backgroundColor+"; border-right : 3px solid "+categories[0].backgroundColor+";";
                }
                case 3:{
                    return "border-top : 3px solid "+categories[0].backgroundColor+"; border-bottom : 3px solid "+categories[1].backgroundColor+"; border-right : 3px solid "+categories[2].backgroundColor+";";
                }
                default:{
                    return "border-top : 3px solid "+categories[0].backgroundColor+"; border-bottom : 3px solid "+categories[1].backgroundColor+"; border-right : 3px solid "+categories[3].backgroundColor+";";
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
            var parentUnit = DataService.getUnitById(DataService.getParentUnitId(unitToValidate.annotation_unit_tree_id))
            var hashTables = DataService.hashTables;
            var isUnitValidated = restrictionsValidatorService.checkRestrictionsOnFinish(unitToValidate,parentUnit,hashTables);
            if(isUnitValidated){
                if(parentUnit.annotation_unit_tree_id === "0"){
                    unitToValidate.gui_status = 'HIDDEN';
                }else{
                    unitToValidate.gui_status = 'COLLAPSE';
                }
                Core.showNotification('success','Annotation unit ' + unitToValidate.annotation_unit_tree_id + ' has finished successfully' )
            }
        }

        function toggleMouseUpDown(){
            var shiftPressed = HotKeysManager.checkIfHotKeyIsPressed("shift");
            var ctrlPressed = HotKeysManager.checkIfHotKeyIsPressed("ctrl");
            !shiftPressed && !ctrlPressed ? selectionHandlerService.clearTokenList() : '';
            HotKeysManager.updatePressedHotKeys({combo:'shift'},!shiftPressed);

            shiftPressed = HotKeysManager.checkIfHotKeyIsPressed("shift");
            shiftPressed && !ctrlPressed ? selectionHandlerService.clearTokenList() : '';
        }

        function isUnitClicked(vm){
            return selectionHandlerService.getSelectedUnitId() === vm.dataBlock.annotation_unit_tree_id;
        }

        function deleteUnit(unitId,vm){
            if(DataService.currentTask.project.layer.type === ENV_CONST.LAYER_TYPE.REFINEMENT){
                Core.showAlert("Cant delete annotation units from refinement layer")
                console.log('ALERT - deleteFromTree -  prevent delete from tree when refinement layer');
                return unitId;
            }

            var currentUnit = DataService.getUnitById(unitId);


            if(DataService.unitsUsedAsRemote[unitId] !==  undefined){
                open('app/pages/annotation/templates/deleteAllRemoteModal.html','md',Object.keys(DataService.unitsUsedAsRemote[unitId]).length,vm);
            }else{
                if(currentUnit.unitType === "REMOTE"){
                    //UpdateUsedAsRemote
                    var remoteUnit = DataService.getUnitById(currentUnit.remote_original_id);
                    var elementPos = remoteUnit.usedAsRemote.map(function(x) {return x; }).indexOf(currentUnit.annotation_unit_tree_id);
                    if(elementPos > -1){
                        remoteUnit.usedAsRemote.splice(elementPos,1);
                    }

                    delete DataService.unitsUsedAsRemote[currentUnit.remote_original_id][currentUnit.annotation_unit_tree_id];
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
            if(DataService.getUnitById(clickedUnit).unitType === "REMOTE"){
                // cant add remote unit to remote unit
                return;
            }
            if(category === undefined){
                category = {
                    id : null,
                    color : 'gray',
                    abbreviation : null
                };

            }
            //If a unit (not i the main passage) is selected switch to addRemoteUnit Mode
            if(clickedUnit !== '0'){
                $('.annotation-page-container').toggleClass('crosshair-cursor');
                selectionHandlerService.setUnitToAddRemotes(clickedUnit);
            }
        }

        function unitClicked(vm,index){
            if(selectionHandlerService.getUnitToAddRemotes() !== "0" && selectionHandlerService.getUnitToAddRemotes() !== index){
                // selectionHandlerService.disableTokenClicked();
                DataService.unitType = 'REMOTE';
                // var clickedUnit  = selectionHandlerService.getUnitToAddRemotes();
                var objToPush = {
                    rowId : '',
                    numOfAnnotationUnits: 0,
                    categories:[], // {color:defCtrl.definitionDetails.backgroundColor}
                    comment:"",
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

                objToPush["remote_original_id"] = vm.dataBlock.annotation_unit_tree_id;

                var newRowId = DataService.insertToTree(objToPush,selectionHandlerService.getUnitToAddRemotes()).then(function(res){
                    DataService.unitType = 'REGULAR';

                    if(DataService.unitsUsedAsRemote[vm.dataBlock.annotation_unit_tree_id] === undefined){
                        DataService.unitsUsedAsRemote[vm.dataBlock.annotation_unit_tree_id] = {};
                    }
                    DataService.unitsUsedAsRemote[vm.dataBlock.annotation_unit_tree_id][res.id] = true;


                    selectionHandlerService.setUnitToAddRemotes("0");
                    $('.annotation-page-container').toggleClass('crosshair-cursor');
                });


            }
            selectionHandlerService.updateSelectedUnit(index);
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