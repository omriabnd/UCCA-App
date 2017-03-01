(function() {
    'use strict';

    angular.module('zAdmin.annotation.directives')
        .directive('annotationUnits',annotationUnitDirective);

    /** @ngInject */
    function annotationUnitDirective($rootScope,DataService,HotKeysManager,hotkeys,DefinitionsService, $timeout, $compile, $uibModal,restrictionsValidatorService, ENV_CONST, Core) {

        var directive = {
            restrict:'E',
            templateUrl:'app/pages/annotation/directives/annotationUnits/annotationUnits.html',
            scope:{
                previewLine: '=',
                lineId: '=',
                childDirective: '@',
                categories: '=',
                control: '='
            },
            link: annotationUnitDirectiveLink,
            controller: AnnotationUnitController,
            controllerAs: 'selCtrl',
            bindToController: true,
            replace:true

        };

        return directive;

        function annotationUnitDirectiveLink($scope, elem, attrs) {

            var initObject = {
                scope:$scope,
                elem:elem,
                rootScope:$rootScope,
                HotKeysManager: HotKeysManager,
                DataService:DataService,
                tokenClicked:tokenClicked,
                focusUnit:focusUnit,
                moveRight:moveRight,
                moveLeft:moveLeft,
                moveDown:moveDown,
                moveUp:moveUp,
                addAsRemoteUnit:addAsRemoteUnit,
                spacePressed:spacePressed,
                toggleCategory:toggleCategory,
                moveRightWithCtrl:moveRightWithCtrl,
                moveLeftWithCtrl:moveLeftWithCtrl,
                moveRightWithShift:moveRightWithShift,
                moveLeftWithShift:moveLeftWithShift,
                deleteFromTree:deleteFromTree,
                checkRestrictionForCurrentUnit:checkRestrictionForCurrentUnit
            };

            $scope.selCtrl.removeAnnotationUnit = removeAnnotationUnit;
            $scope.selCtrl.checkRestrictionForCurrentUnit = checkRestrictionForCurrentUnit;
            $scope.selCtrl.switchToRemoteMode = switchToRemoteMode;
            $scope.selCtrl.addCommentToUnit = addCommentToUnit;
            

            $rootScope.tokenClicked = tokenClicked;
            $rootScope.focusUnit = focusUnit;

            var directiveIndex = initDirective(initObject);

            $scope.selCtrl.selectedRow = $rootScope.clckedLine = $scope.selCtrl.lineId;
            $scope.selCtrl.dataBlock = getCurrentDataBlock(DataService,directiveIndex);

            $scope.$watch("selCtrl.dataBlock.categories.changed",function(newValue,oldValue) {
                //This gets called when data changes.
                if(newValue){
                    $scope.selCtrl.dataBlock = getCurrentDataBlock(DataService,$scope.selCtrl.dataBlock.annotation_unit_tree_id);
                    wrapUnitWithBordersInParentUnit($scope.selCtrl.dataBlock,DefinitionsService,false,$rootScope);
                    $scope.selCtrl.dataBlock.categories.changed = false;
                }
            });

            if($scope.selCtrl.dataBlock != undefined && $scope.selCtrl.dataBlock.unitType == 'REGULAR'){
                $timeout(function(){
                    $rootScope.clckedLine = $scope.selCtrl.dataBlock.annotation_unit_tree_id;
                    DataService.lastInsertedUnitIndex = $rootScope.clckedLine;
                    wrapUnitWithBordersInParentUnit($scope.selCtrl.dataBlock,DataService.categories,true);
                });
            }

            

            function removeAnnotationUnit(unit_id,event){
                var annotaionUnitToDelete = $('#row-'+unit_id);
                // console.log(annotaionUnitToDelete);
                unit_id = unit_id.toString();
                $rootScope.clickedUnit = 'unit-wrapper-'+DataService.getParentUnitId(unit_id)+'-'+unit_id;

                var parentContainer = $('#directive-info-data-container-'+unit_id).addClass('selected-row');
                focusUnit(parentContainer);

                deleteFromTree();

                event.stopPropagation();
            }

            /**
             * Sets the words hover function.
             */
            var IS_MOUSE_DOWN = false;
            $('.directive-info-data-container .text-wrapper').on('mouseup',function(){
                IS_MOUSE_DOWN = false
            });


            $('.directive-info-data-container .text-wrapper').on('mouseover', '.selectable-word', function(event) {
                if(IS_MOUSE_DOWN){
                    var tokenId = splitStringByDelimiter($(this).attr('data-wordid'),"-")[1];
                    removeTokensFromSelectedTokensArray(tokenId,$rootScope.selectedTokensArray);
                    // console.log("first_word:"+$rootScope.lastSelectedTokenMouse+",current_word:"+tokenId);
                    selectAllTokensBetween(event,tokenId)
                    updateCursorLocation($scope.selCtrl,event.toElement,$rootScope);
                }
            });

            function selectAllTokensBetween(event,lastTokenId){
                // clear selection
                $('.clickedToken').removeClass('clickedToken')
                $rootScope.selectedTokensArray = [];
                // get all tokens that not inside a unit
                // and filter out the ones that not between the firstToken and latToken
                var allWordsArray = $('#row-'+$scope.selCtrl.selectedRow +' > .selectable-word');
                allWordsArray = allWordsArray.filter(function(index,token,self){
                    if($rootScope.lastSelectedTokenMouse < lastTokenId){
                        return ($(token).attr('token-id') >= $rootScope.lastSelectedTokenMouse) && ($(token).attr('token-id') <= lastTokenId)
                    }else{
                        return ($(token).attr('token-id') <= $rootScope.lastSelectedTokenMouse) && ($(token).attr('token-id') >= lastTokenId)
                    }
                })
                // select all the relevant filtered tokens
                for (var i = 0; i < allWordsArray.length; i++) {
                    $(allWordsArray[i]).addClass('clickedToken')
                    $rootScope.selectedTokensArray.push(allWordsArray[i].outerHTML);
                };

            }

            /**
             * Handle Click on tokens.
             * @param event - The click event.
             */
            function tokenClicked(event){
                /**
                 * Initialization phase - checks if ctrl/shift is pressed and update clickedLine variable on rootScope.
                 */
                IS_MOUSE_DOWN = true
                $('.highlight-unit').removeClass('highlight-unit'); // unit can not be selected while a token being clicked 
                $('.selected-row').removeClass('selected-row'); // reset (prev) other selected rows
                var isShiftPressed = HotKeysManager.checkIfHotKeyIsPressed('shift');
                var isCtrlPressed = HotKeysManager.checkIfHotKeyIsPressed('ctrl');
                var tokenRowId = $(event.currentTarget.parentElement).attr('id').split('-');
                tokenRowId = tokenRowId.slice(1,tokenRowId.length).join('-');
                $rootScope.clckedLine = tokenRowId;
                $scope.selCtrl.selectedRow = tokenRowId;

                $rootScope.lastSelectedTokenMouse = parseInt($(event.toElement).attr('data-wordid').split('-')[1]);
                // console.log("last word",$rootScope.lastSelectedTokenMouse);

                /**
                 * Checks if the clicked element is indeed a token and not the outer div.
                 */
                if(event.toElement.localName == 'span'){
                    if($(event.toElement).hasClass('clickedToken')){

                        handleClickOnAlreadyClickedToken(event,isShiftPressed,isCtrlPressed,$rootScope);

                    }else{
                        /**If shift is pressed.adds all the token between first token to end token.
                         * else if ctrl is pressed. if true adds the token to the selected token array.
                         * else, clear the selected token array and add the new selected token.
                         */
                        if(isShiftPressed){
                            handleClickOnTokenWhenShiftPressed(event,$scope,$rootScope);
                        }else if(isCtrlPressed){
                            // if the new token is from a different unit - unselect the last token
                            preventSelectTokensFromDefferentUnits();
                            handleClickOnTokenWhenCtrlPressed(event,$scope,$rootScope);
                        }else{
                            handleClickOnNotClickedToken(event,$scope,$rootScope);
                        }
                        // updateCursorLocation($scope.selCtrl,event.toElement,$rootScope);

                        var parentContainerId = $(event.toElement.parentElement).attr('id').split('-');
                        parentContainerId = parentContainerId.slice(1,parentContainerId.length).join('-');

                        var parentContainer = $('#directive-info-data-container-'+parentContainerId).addClass('selected-row');

                        event.stopPropagation();

                        focusUnit(parentContainer,true);
                    }

                    if(HotKeysManager.checkIfHotKeyIsPressed('shift') == false){
                        $rootScope.lastSelectedWordWithShiftPressed = undefined 
					}
                }
                updateCursorLocation($scope.selCtrl,event.toElement,$rootScope);
            }
            function preventSelectTokensFromDefferentUnits(){
                var needToPrevent = false
                if($rootScope.selectedTokensArray.length){
                    needToPrevent = $($rootScope.selectedTokensArray[0]).attr('parent-index') != $rootScope.clckedLine;
                    if(needToPrevent){
                        $rootScope.selectedTokensArray = [];
                        $('.clickedToken').removeClass('clickedToken');
                        // $scope.selCtrl.open('app/pages/annotation/templates/errorModal.html','md',"Tokens may be selected from the same unit only.");
                    }
                }
                return needToPrevent
            }
            function updateCursorLocation(selCtrl,element,rootScope){
                var currentRow = $('#row-'+rootScope.clckedLine)[0];
                var directiveCursor = $('#cursor-'+rootScope.clckedLine)[0];

                try{
                    currentRow.removeChild(directiveCursor);
                }catch(e){
                    console.log('no cursor');
                }
                var locationToInsertCursor = 0;
                locationToInsertCursor = $(currentRow.children).index( element )+1;
                selCtrl.cursorLocation = locationToInsertCursor;

                currentRow.insertBefore(directiveCursor, currentRow.children[locationToInsertCursor]);
            }

            function restSelectedTokens(){
                $rootScope.selectedTokensArray = [];
                $('.clickedToken').removeClass('clickedToken')
            }
            /**
             * Handle click on row - update the current selected row.
             */
            function focusUnit(element,withoutResetSelectedTokens){
                if(!withoutResetSelectedTokens){
                    restSelectedTokens()
                }
                var currElem = (event && event.type) == "mousedown" ? element.toElement : (event && event.type) == "keydown" ? element : element;
                var dataWordId = $(currElem).attr('data-wordid');
                if(dataWordId == undefined){
                    if(!!!$(currElem).attr('id')){
                        return;
                    }
                    var clickedRowId = [];
                    if(currElem){
                        clickedRowId = $(currElem).attr('id').split('-');
                    }
                    else{
                        clickedRowId = $(element).attr('id').split('-');
                    }
                    $rootScope.clckedLine = clickedRowId.slice(4,clickedRowId.length).join('-');
                    /*$rootScope.clckedLine = clickedRowId[clickedRowId.length-1];*/
                }else{
                    var clickedRowId = $(currElem).attr('parent-index').split('-');
                    clickedRowId.length == 1 ? $rootScope.clckedLine = clickedRowId[0] : $rootScope.clckedLine = clickedRowId.slice(1,clickedRowId.length).join('-');
                    /*$rootScope.clckedLine = clickedRowId[clickedRowId.length-1];*/
                }
                $('.highlight-unit').removeClass('highlight-unit');
                // $('.highlight-unit').toggleClass('highlight-unit');
                $('.selected-row').removeClass('selected-row');
                if(currElem){
                    if($(currElem).hasClass('selectable-word')){
                        $(currElem.parentElement.parentElement.parentElement).addClass('selected-row');
                    }else{
                        $(currElem).addClass('selected-row');
                    }
                }else{
                    $(element).addClass('selected-row');
                }

                $scope.selCtrl.selectedRow = $rootScope.clckedLine;

                DataService.lastInsertedUnitIndex = $rootScope.clckedLine;
            }

            function moveRight(){
                var currentRow = $('#row-'+$rootScope.clckedLine)[0];
                $scope.selCtrl.cursorLocation = getCurrentCursorIndexPosition(currentRow)
                if(DataService.unitType == 'REMOTE'){
                        //Select The first
                    var firstUnit = $(currentRow).find('.selected-unit')[0];
                    $(firstUnit).next( ".unit-wrapper" ).addClass('selected-unit');
                    var nextUnit = $(firstUnit).nextAll( ".unit-wrapper" )[0];
                    if(nextUnit && nextUnit.length != 0){
                        $('.selected-unit').removeClass('selected-unit');
                        $(nextUnit).addClass('selected-unit');
                    }
                }else{
                    if($scope.selCtrl.cursorLocation < $(currentRow).children().length){

                        var isShiftPressed = HotKeysManager.checkIfHotKeyIsPressed('shift');
                        var isCtrlPressed = HotKeysManager.checkIfHotKeyIsPressed('ctrl');

                        $scope.selCtrl.cursorLocation++;

                        if(!isShiftPressed && !isCtrlPressed){
                            $('.clickedToken ').removeClass('clickedToken ');
                            $rootScope.selectedTokensArray = [];
                        }

                        if(isCtrlPressed){
                            var tokenToAdd = $(currentRow).find($('.selectable-word').attr('data-wordid'))
                        }

                        var directiveCursor = $('#cursor-'+$rootScope.clckedLine)[0];

                        currentRow.removeChild(directiveCursor);
                        currentRow.insertBefore(directiveCursor, currentRow.children[$scope.selCtrl.cursorLocation]);
                    }                    
                }

            }

            /**
             * Moves The Cursor one unit down.
             */
            function moveDown() {
                // var splittedLineId = $scope.selCtrl.selectedRow.split("-");
                var nextUnitId = DataService.getNextUnit($rootScope.clckedLine,0);

                var unitExists = DataService.getUnitById(nextUnitId);

                if(unitExists){
                    $scope.selCtrl.selectedRow = $rootScope.clckedLine = unitExists.annotation_unit_tree_id;
                    var currentRow = $('#directive-info-data-container-' + nextUnitId)[0];
                    focusUnit(currentRow);

                    if(DataService.unitType == 'REMOTE'){
                        //Select The first
                        var firstUnit = $(currentRow).find('.unit-wrapper')[0];
                        $('.selected-unit').removeClass('selected-unit');
                        $(firstUnit).addClass('selected-unit');
                    }
                }
            }

            /**
             * Moves The Cursor one unit down.
             */
            function moveUp() {
                var nextUnitId;
                var splittedLineId =  splitStringByDelimiter($rootScope.clckedLine,"-");
                if(splittedLineId.length == 1 && splittedLineId[0] == 1){
                    nextUnitId = "0";
                }else{
                    var parentUnitId;
                    if(splittedLineId.length == 1){
                        parentUnitId = (parseInt(splittedLineId[0])-1).toString();
                        nextUnitId = DataService.getPrevUnit(parentUnitId,-1);
                    }else{
                        parentUnitId = splittedLineId.slice(0,splittedLineId.length-1).join("-");
                        nextUnitId = DataService.getPrevUnit(parentUnitId,parseInt(splittedLineId[splittedLineId.length-1])-1);
                    }
                }

                var unitExists = DataService.getUnitById(nextUnitId);

                if(unitExists){
                    $scope.selCtrl.selectedRow = $rootScope.clckedLine = unitExists.annotation_unit_tree_id;
                    var currentRow = $('#directive-info-data-container-' + nextUnitId)[0];
                    focusUnit(currentRow);

                    if(DataService.unitType == 'REMOTE'){
                        //Select The first
                        var firstUnit = $(currentRow).find('.unit-wrapper')[0];
                        $('.selected-unit').removeClass('selected-unit');
                        $(firstUnit).addClass('selected-unit');
                    }
                }
            }

            function moveRightWithCtrl(){
                if(DataService.unitType = 'REGULAR'){
                    var currentRow = $('#row-'+$rootScope.clckedLine)[0];
                    $scope.selCtrl.cursorLocation = getCurrentCursorIndexPosition(currentRow)
                    if($scope.selCtrl.cursorLocation < $(currentRow).children().length){

                        $scope.selCtrl.cursorLocation++;

                        var directiveCursor = $('#cursor-'+$rootScope.clckedLine)[0];

                        currentRow.removeChild(directiveCursor);
                        currentRow.insertBefore(directiveCursor, currentRow.children[$scope.selCtrl.cursorLocation]);
                    }
                }
                
            }

            /**
             * This function handle keyboard units selection while shift key is pressed.
             */
            function moveRightWithShift(){
                if(DataService.unitType == 'REGULAR' && DataService.getUnitById($rootScope.clckedLine).unitType == 'REGULAR'){
                    var currentRow = $('#row-'+$rootScope.clckedLine)[0];
                    $scope.selCtrl.cursorLocation = getCurrentCursorIndexPosition(currentRow)
                    if($scope.selCtrl.cursorLocation < $(currentRow).children().length){

                        var tokenToAdd = currentRow.children[$scope.selCtrl.cursorLocation+1];
                        // allow to add only tokens - not units
                        if($(tokenToAdd).hasClass('unit-wrapper') == false){
                            if(!$(tokenToAdd).hasClass('dot-sep') && !$(tokenToAdd).hasClass('cursor')){
                                if($(tokenToAdd).hasClass('clickedToken')){
                                    $(tokenToAdd).removeClass('clickedToken');

                                    //The token is already selected, need to remove it.
                                    var tokenId = splitStringByDelimiter($(tokenToAdd).attr('data-wordid'),"-")[1];
                                    removeTokensFromSelectedTokensArray(tokenId,$rootScope.selectedTokensArray);
                                }else{
                                    if(tokenToAdd){
                                        $rootScope.selectedTokensArray.push(tokenToAdd.outerHTML);
                                        $(tokenToAdd).addClass('clickedToken');
                                    }
                                    
                                }
                            }
                        }
                        updateCursorLocationRight(currentRow)
                    }
                }                
            }

            function moveLeft(){
                var currentRow = $('#row-'+$rootScope.clckedLine)[0];
                $scope.selCtrl.cursorLocation = getCurrentCursorIndexPosition(currentRow)
                if(DataService.unitType == 'REMOTE'){
                        //Select The first
                    var firstUnit = $(currentRow).find('.selected-unit')[0];
                    var prevUnit = $(firstUnit).prevAll( ".unit-wrapper" )[0];
                    if(prevUnit && prevUnit.length != 0){
                        $('.selected-unit').removeClass('selected-unit');
                        $(prevUnit).addClass('selected-unit');
                    }
                }else {
                    if ($scope.selCtrl.cursorLocation > 0) {

                        var isShiftPressed = HotKeysManager.checkIfHotKeyIsPressed('shift');
                        var isCtrlPressed = HotKeysManager.checkIfHotKeyIsPressed('ctrl');

                        if (!isShiftPressed && !isCtrlPressed) {
                            $('.clickedToken ').removeClass('clickedToken ');
                            $rootScope.selectedTokensArray = [];
                        }

                        $scope.selCtrl.cursorLocation--;
                        var directiveCursor = $('#cursor-' + $rootScope.clckedLine);
                        currentRow.insertBefore(directiveCursor.get(0), currentRow.children[$scope.selCtrl.cursorLocation]);
                    }
                }
            }

            function moveLeftWithCtrl(){
                var currentRow = $('#row-'+$rootScope.clckedLine)[0];
                $scope.selCtrl.cursorLocation = getCurrentCursorIndexPosition(currentRow)
                if($scope.selCtrl.cursorLocation > 0){

                    $scope.selCtrl.cursorLocation--;

                    var directiveCursor = $('#cursor-'+$rootScope.clckedLine)[0];

                    currentRow.removeChild(directiveCursor);
                    currentRow.insertBefore(directiveCursor, currentRow.children[$scope.selCtrl.cursorLocation]);
                }
            }

            function getCurrentCursorIndexPosition(currentRow){
                var cursorPosition = $(currentRow.children).toArray().findIndex(function(obj){
                    return $(obj).hasClass('cursor')
                })
                return cursorPosition                
            }

            function moveLeftWithShift(){
                if(DataService.unitType == 'REGULAR' && DataService.getUnitById($rootScope.clckedLine).unitType == 'REGULAR'){
                    var currentRow = $('#row-'+$rootScope.clckedLine)[0];
                    $scope.selCtrl.cursorLocation = getCurrentCursorIndexPosition(currentRow)
                    
                    if($scope.selCtrl.cursorLocation > 0){

                        var tokenToAdd = currentRow.children[$scope.selCtrl.cursorLocation-1];

                        if($(tokenToAdd).hasClass('cursor')){
                            updateCursorLocationLeft(currentRow);
                        }

                        var tokenToAdd = currentRow.children[$scope.selCtrl.cursorLocation-1];

                        // allow to add only tokens - not units
                        if($(tokenToAdd).hasClass('unit-wrapper') == false){
                            if(!$(tokenToAdd).hasClass('dot-sep') && !$(tokenToAdd).hasClass('cursor')){
                                if($(tokenToAdd).hasClass('clickedToken')){
                                    $(tokenToAdd).removeClass('clickedToken');
                                    

                                    //The token is already selected, need to remove it.
                                    var tokenId = splitStringByDelimiter($(tokenToAdd).attr('data-wordid'),"-")[1];
                                    removeTokensFromSelectedTokensArray(tokenId,$rootScope.selectedTokensArray);
                                }else{
                                    if(tokenToAdd){
                                        $rootScope.selectedTokensArray.push(tokenToAdd.outerHTML);
                                        $(tokenToAdd).addClass('clickedToken');
                                    }
                                    
                                }
                            }
                        }
                        updateCursorLocationLeft(currentRow);
                    }
                }
            }
            function updateCursorLocationRight(currentRow){
                $scope.selCtrl.cursorLocation++;
                var directiveCursor = $('#cursor-'+$rootScope.clckedLine)[0];
                currentRow.removeChild(directiveCursor);
                currentRow.insertBefore(directiveCursor, currentRow.children[$scope.selCtrl.cursorLocation]);
            }
            function updateCursorLocationLeft(currentRow){
                $scope.selCtrl.cursorLocation--;
                var directiveCursor = $('#cursor-'+$rootScope.clckedLine)[0];
                currentRow.removeChild(directiveCursor);
                currentRow.insertBefore(directiveCursor, currentRow.children[$scope.selCtrl.cursorLocation]);
            }

            function deleteFromTree(unitId){
                // prevent insert to tree when refinement layer
                if(DataService.currentTask.project.layer.type == ENV_CONST.LAYER_TYPE.REFINEMENT){
                    Core.showAlert("Cant delete annotation units from refinement layer")
                    console.log('ALERT - deleteFromTree -  prevent delete from tree when refinement layer');
                    return unitId;
                }
                var unitIdToDelete, splittedUnitIdToDeleteId;

                var unitToDelete;
                if(unitId == undefined){
                    unitIdToDelete = $rootScope.clckedLine;
                    unitId = $rootScope.clckedLine;
                    $rootScope.clickedUnit = 'unit-wrapper-'+DataService.getParentUnitId($rootScope.clckedLine)+'-'+$rootScope.clckedLine;
                    unitToDelete = DataService.getUnitById(unitIdToDelete);
                }else{
                    splittedUnitIdToDeleteId = splitStringByDelimiter(unitId,'-');
                    unitToDelete = DataService.getUnitById(unitId);
                }

                var unitChildren  = unitToDelete.AnnotationUnits;

                if(unitToDelete){
                    if(unitToDelete.usedAsRemote && unitToDelete.usedAsRemote.length > 0){
                        $scope.selCtrl.currentUnitRemoteInstancesIds = unitToDelete.usedAsRemote;
                        $scope.selCtrl.currentUnitRemoteInstancesIds.push(unitToDelete.annotation_unit_tree_id.toString());
                        $scope.selCtrl.open('app/pages/annotation/templates/deleteAllRemoteModal.html','md',unitToDelete.usedAsRemote.length-1);
                    }else{
                        $rootScope.clckedLine = DataService.deleteFromTree(unitToDelete.annotation_unit_tree_id);
                        if(unitToDelete.unitType == 'REGULAR'){
                            // console.log("$scope.selCtrl.updateUI(unitToDelete)");
                            $scope.selCtrl.updateUI(unitToDelete)
                        }
                    }
                }
            }

            // update father unit borders, after the san was deleted
            $scope.selCtrl.updateUI = function(unitToDelete){
                if (!!unitToDelete) {
                    if (unitToDelete.usedAsRemote && unitToDelete.usedAsRemote.length > 0) {return console.log('remote unit');}
                    if(unitToDelete.unitType == 'REGULAR'){
                        if(unitToDelete.AnnotationUnits.length == 0){
                            //unit has no children
                            var unitDomElementToDelete = $("[unit-wrapper-id="+$rootScope.clickedUnit+"]");
                            var unitDomElementParent =unitDomElementToDelete[0].parentElement;
                            var unitDomElementChildrenLength = unitDomElementToDelete.children().length;
                            for(var i=0; i<unitDomElementChildrenLength; i++){
                                unitDomElementParent.insertBefore(unitDomElementToDelete.children().get(0),unitDomElementToDelete.get(0))
                            }
                            unitDomElementToDelete.remove();

                        }else{
                            //unit has unit children
                            var unitDomElementToDelete = $("[unit-wrapper-id="+$rootScope.clickedUnit+"]");
                            var unitDomElementParent =unitDomElementToDelete[0].parentElement;

                            var unitToDeleteChildrenUnits = $('#row-'+unitToDelete.annotation_unit_tree_id).children();
                            for(var i=0; i<unitToDeleteChildrenUnits.length; i++){
                                if(!$(unitToDeleteChildrenUnits[i]).hasClass('cursor')){
                                    if($(unitToDeleteChildrenUnits[i]).hasClass('selectable-word')){
                                        unitToDeleteChildrenUnits[i].innerHTML += " "
                                    }
                                    unitDomElementParent.insertBefore(unitToDeleteChildrenUnits[i],unitDomElementToDelete.get(0))
                                }
                            }

                            unitDomElementToDelete.remove();
                        }
                        //Update parent unit-wrapper-#-# attribute
                        var parentDomeElementUnitWrappers = $(unitDomElementParent).find('.unit-wrapper');
                        unitToDelete = DataService.getUnitById(DataService.getParentUnitId(unitToDelete.annotation_unit_tree_id));
                    }

                    $timeout(function(){
                        updateDomElements(unitToDelete);
                        $compile($('.text-wrapper'))($rootScope);

                        $(unitDomElementParent).find('.selectable-word').attr('mousedown','').unbind('mousedown');
                        $(unitDomElementParent).find('.selectable-word').on('mousedown',tokenClicked);
                        
                        focusUnit($('#directive-info-data-container-'+splitStringByDelimiter($rootScope.clckedLine,'.').join("-")))
                    })
                }
            };
            function updateDomElements(unitToUpdate){
                // console.log(unitToUpdate.annotation_unit_tree_id);
                var unitChildren = $('#row-'+unitToUpdate.annotation_unit_tree_id).find($('.unit-wrapper'));
                for(var i=0; i<unitToUpdate.AnnotationUnits.length; i++){
                    $(unitChildren[i]).attr('child-unit-id',unitToUpdate.AnnotationUnits[i].annotation_unit_tree_id);
                    $(unitChildren[i]).attr('unit-wrapper-id','unit-wrapper-'+unitToUpdate.annotation_unit_tree_id+'-'+unitToUpdate.AnnotationUnits[i].annotation_unit_tree_id);
                    updateDomElements(unitToUpdate.AnnotationUnits[i]);
                }
            }

            function spacePressed(){
                resetSelectedCategoryInfo();
                var currentRow = $('#row-'+$rootScope.clckedLine)[0];                
                if(DataService.unitType == 'REMOTE'){
                        //Select The first
                    var firstUnit = $(currentRow).find('.selected-unit')[0];
                    var category = {
                        id : null,
                        color : 'gray',
                        abbreviation : null
                    };
                    onClickForRemote.call({category:category,lineToAddRemoteUnit:$rootScope.lineToAddRemoteUnit},currentRow)
                    // onClickForRemote(firstUnit);
                }else{
                    if($rootScope.selectedTokensArray.length > 0){
                        $rootScope.selectedTokensArray.sort(sortSelectedWordsArrayByWordIndex);
                        if($rootScope.selectedTokensArray.length > 0){
                            $rootScope.clckedLine = $rootScope.callToSelectedTokensToUnit($rootScope.clckedLine);
                            DataService.updateDomWhenInsertFinishes();
                        }else{
                            if(checkIfRowWasClicked($rootScope)){
                                $rootScope.addCategoryToExistingRow();
                            }
                        }

                        $rootScope.lastSelectedWordWithShiftPressed = undefined;
                    }else{
                        var selectedUnit = $($(currentRow).find('.highlight-unit')).attr('child-unit-id');
                        if(selectedUnit){
                            selectedUnit != undefined ? deleteFromTree(selectedUnit) : '';
                        }
                    }
                }
            }

            function addAsRemoteUnit(category,event){
                DataService.unitType = 'REMOTE';
                if(category == undefined){
                    category = {
                        id : null,
                        color : 'gray',
                        abbreviation : null
                    };

                }
                //If a unit (not i the main passage) is selected switch to addRemoteUnit Mode
                if($rootScope.clckedLine != 0){


                    $(document).attr('keyup','').unbind('keyup');
                    $(document).keyup(function(e) {
                        if (e.keyCode == 27) { // Escape key maps to keycode `27`
                            $timeout(function(){
                                $scope.$apply();
                                resetBindingRemoteEvents();
                            },0)
                        }
                    });

                    var lineToAddRemoteUnit = $rootScope.clckedLine;
                    $rootScope.lineToAddRemoteUnit = lineToAddRemoteUnit;
                    $('.annotation-page-container').toggleClass('crosshair-cursor');
                    $( ".selectable-word" ).attr('mousedown','').unbind('mousedown');


                    // prevent the user from selecting a token as remote unit
                    bindAlertIfTryingToAddTokenAsRemote();

                    var parentUnit = DataService.getParentUnitId($rootScope.clckedLine);
                    $('.highlight-unit').removeClass('highlight-unit');
                    $('[unit-wrapper-id=unit-wrapper-'+(parseInt(parentUnit)+1)+"-"+$rootScope.clckedLine+"]").toggleClass('highlight-unit');
                    $rootScope.clickedUnit = 'unit-wrapper-'+(parseInt(parentUnit))+"-"+$rootScope.clckedLine;

                    $('.directive-info-data-container').attr('mousedown','').unbind('mousedown');

                    
                    $('.unit-wrapper , .directive-info-data-container').on('mousedown',onClickForRemote.bind({category:category,lineToAddRemoteUnit:lineToAddRemoteUnit},event));

                }
            }

            function bindAlertIfTryingToAddTokenAsRemote(){
                $( ".selectable-word" ).on('mousedown',function(){
                    $rootScope.preventRemoteAsign = true;
                    $scope.selCtrl.open('app/pages/annotation/templates/errorModal.html',
                        'md',"Only Units can be selected as remote units."
                    );
                });    
            }
            
            function onClickForRemote(e){
                if(!!!e){ e = arguments[arguments.length-1]}
                if(!e.toElement){ e.toElement = $(e).parents('.directive-info-data-container').first() } // when clicking os space for add remote unit
                if($rootScope.preventRemoteAsign){
                    $rootScope.preventRemoteAsign = false;
                    return;
                }
                if( $rootScope.clickedUnit == $(e.toElement).attr('unit-wrapper-id') || $rootScope.clickedUnit == $(e).attr('unit-wrapper-id')){
                    $scope.selCtrl.open('app/pages/annotation/templates/errorModal.html',
                        'md',"Unit cannot be selected as remote."
                    );
                    resetBindingRemoteEvents()
                    return;
                }else{
                    var category = this.category;
                    $rootScope.currentCategoryID = category.id;
                    $rootScope.currentCategoryColor = category.color;
                    $rootScope.currentCategoryBGColor = category.backgroundColor;
                    $rootScope.currentCategoryIsRefined = category.refinedCategory;
                    $rootScope.currentCategoryAbbreviation = category.abbreviation;
                    $rootScope.selectedTokensArray = [];

                    // unit row selected
                    if($(e.toElement).hasClass('directive-info-data-container')){
                        var originalId = $(e.toElement).attr('id').split('directive-info-data-container-')[1];
                        var selectedUnitTokens = $('[child-unit-id='+originalId+']').children();
                    }else{ // unit bordered in parent selected
                        var selectedUnitTokens = e.toElement ? e.toElement.children : e.children;
                        var originalId = $(e.toElement).attr('child-unit-id');
                    }
                    
                    // check if unit is 
                    if(canAttachTheRemoteUnit(originalId.toString(),this.lineToAddRemoteUnit.toString()) == false){
                        $scope.selCtrl.open('app/pages/annotation/templates/errorModal.html',
                            'md',"A remote unit cannot be an ancestor of the parent unit, and cannot be a descendent of the parent unit.");
                        resetBindingRemoteEvents()
                        return;
                    }

                    // check if trying to add the same remote to the already has unit
                    if(checkIfPreventAddToRemotesForTheSameUnit(originalId,this.lineToAddRemoteUnit)){
                        $scope.selCtrl.open('app/pages/annotation/templates/errorModal.html',
                            'md',"Cant use the same remote unit to the same unit.");
                        resetBindingRemoteEvents()
                        return;
                    }

                    DataService.remoteFromUnit = originalId;
                    for(var i=0; i<selectedUnitTokens.length; i++){
                        if(!$(selectedUnitTokens[i]).hasClass('cursor')){
                            $rootScope.selectedTokensArray.push(selectedUnitTokens[i].outerHTML);
                        }
                    }


                    $rootScope.selectedTokensArray.sort(sortSelectedWordsArrayByWordIndex);
                    $rootScope.clckedLine = this.lineToAddRemoteUnit;
                    DataService.unitType = 'REMOTE';
                    
                    $rootScope.clckedLine = $rootScope.callToSelectedTokensToUnit($rootScope.clckedLine,false);
                    DataService.getUnitById(originalId).usedAsRemote.push($rootScope.clckedLine);
                    DataService.updateDomWhenInsertFinishes();

                    //e.toElement ? $scope.$apply() : '';

                    resetBindingRemoteEvents()

                    $compile($('.text-wrapper'))($rootScope)
                }
            };

            function resetBindingRemoteEvents(){
                DataService.unitType = 'REGULAR';
                $("[unit-wrapper-id="+$rootScope.clickedUnit+"]").toggleClass('highlight-unit');
                $('.selected-unit').removeClass('selected-unit');
                $('.annotation-page-container').toggleClass('crosshair-cursor');
                $( ".unit-wrapper" ).attr('mousedown','').unbind('mousedown');
                $( ".selectable-word" ).attr('mousedown','').unbind('mousedown');
                $( ".selectable-word" ).on('mousedown',tokenClicked);
                $( ".directive-info-data-container" ).attr('mousedown','').unbind('mousedown');
                $( ".directive-info-data-container" ).on('mousedown',focusUnit);
            }

            function getAllParentsTreeIds(nodeId){
                if(!nodeId) {
                    return [];
                }
                var idsArray = nodeId.split('-');
                var out = [];

                for(var i=0; i<idsArray.length ; i++){
                    var str = out.length ? out[i-1]+'-'+idsArray[i] : idsArray[i];
                    out.push(str)
                }
                return out
            }

            function checkArraysSimilarity(nodeIdA,nodeIdB){
                var arrA = getAllParentsTreeIds(nodeIdA);
                var arrB = getAllParentsTreeIds(nodeIdB);
                var isSimilar = false;
                var arrLength = arrA.length > arrB.length ? arrB.length : arrA.length;
                for (var i = 0; i < arrLength; i++) {
                    if(arrA[0] == arrB[0]){
                        arrA.shift(0);
                        arrB.shift(0);
                    }
                    if( arrA.length == 0 || arrB.length == 0 ){
                        isSimilar = true;
                    }
                };
                return isSimilar;
            }

            function canAttachTheRemoteUnit(nodeIdA,nodeIdB){
                return !checkArraysSimilarity(nodeIdA,nodeIdB)
            }

            function checkIfPreventAddToRemotesForTheSameUnit(originalId,lineToAddRemoteUnit){
                var alreadyUsedAsRemoteInThisUnit = false;
                if(DataService.getUnitById(originalId).usedAsRemote){
                    alreadyUsedAsRemoteInThisUnit = DataService.getUnitById(originalId).usedAsRemote.map(function(unitId){return DataService.getParentUnitId(unitId)}).indexOf(lineToAddRemoteUnit.toString()) > -1;
                }
                return alreadyUsedAsRemoteInThisUnit;
            }
            function addCommentToUnit(event){
                var rowElem = $(event.toElement).parents(".directive-info-data-container").first()
                focusUnit(rowElem)
                // $timeout(function(){
                $scope.selCtrl.open('app/pages/annotation/templates/commentOnUnitModal.html','sm')
                // }, 100)
            }
            function switchToRemoteMode(event){
                // $rootScope.clckedLine = $(event.toElement.parentElement.parentElement.parentElement).attr('id').split('-')[4];
                var rowElem = $(event.toElement).parents(".directive-info-data-container").first()
                focusUnit(rowElem)
                $rootScope.clckedLine = this.lineId;
                addAsRemoteUnit();
                event.stopPropagation();
            }

            /**
             * Words hover function.
             * @param element - the hovered element.
             */
            function hoverFunction(element){
                if($(event.toElement).attr('parent-index') != undefined){
                    // var parentsWordsWithSameWordId = filterWords($(event.toElement).attr('data-wordId'),$(element.toElement).attr('parent-index'));
                    // $(element.toElement).css('color',$(element.toElement).attr('parent-color'));
                    // $(parentsWordsWithSameWordId).css('color',$(element.toElement).attr('parent-color'));
                    if(HotKeysManager.getMouseMode()){
                        $(event.toElement).attr('parent-index',$rootScope.clckedLine);
                        var tokenToPush = event.toElement.outerHTML;
                        if(!$(tokenToPush).hasClass('clickedToken')){
                            $(tokenToPush).attr('parent-index',$rootScope.clckedLine);
                            $rootScope.selectedTokensArray.push(tokenToPush);
                        }
                        $(event.toElement).toggleClass('clickedToken');
                    }
                }
            }            
            
            function toggleCategory(category){

                var parentUnitId = $rootScope.clckedLine;
                // parentUnitId = parentUnitId.length == 1 ? parentUnitId[0] : parentUnitId.slice(1,parentUnitId.length).join('-');
                var parenUnit = DataService.getUnitById(parentUnitId);
                parentUnitId = '#row-'+parentUnitId;
                var parentUnitDomElement = $(parentUnitId);

                var unitContainsAllParentUnitTokens = parentUnitDomElement.children().length-1 == $rootScope.selectedTokensArray.length;

                if(!(parenUnit.containsAllParentUnits && unitContainsAllParentUnitTokens)){
                    $rootScope.currentCategoryID = category.id;
                    $rootScope.currentCategoryColor = category.color;
                    $rootScope.currentCategoryBGColor = category.backgroundColor;
                    $rootScope.currentCategoryIsRefined = category.refinedCategory;
                    $rootScope.currentCategoryAbbreviation = category.abbreviation;
                    $rootScope.currentCategoryName = category.name;
                    $rootScope.selectedTokensArray.sort(sortSelectedWordsArrayByWordIndex);
                    if($rootScope.selectedTokensArray.length > 0 && parenUnit.unitType != 'REMOTE' && parenUnit.unitType != 'IMPLICIT'){
                        $rootScope.clckedLine = $rootScope.callToSelectedTokensToUnit($rootScope.clckedLine,unitContainsAllParentUnitTokens);
                        DataService.updateDomWhenInsertFinishes();
                    }else{
                        if(checkIfRowWasClicked($rootScope)){
                            $rootScope.addCategoryToExistingRow();
                        }
                    }

                    delete $rootScope.currentCategoryID;
                    delete $rootScope.currentCategoryColor;
                    delete $rootScope.currentCategoryBGColor;
                    delete $rootScope.currentCategoryIsRefined;
                    delete $rootScope.currentCategoryAbbreviation;

                    $rootScope.lastSelectedWordWithShiftPressed = undefined;
                }

            }

        }


        function removeTokensFromSelectedTokensArray(tokenIdToRemove,selectedTokensArray){
            var tokenInSelectedTokensArray;
            for(var i=0; i< selectedTokensArray.length; i++){
                tokenInSelectedTokensArray = selectedTokensArray[i];
                var tokenId = splitStringByDelimiter($(tokenInSelectedTokensArray).attr('data-wordid'),"-")[1];

                if(tokenIdToRemove == tokenId){
                    selectedTokensArray.splice(i,1);
                }
            }
        }

        function checkIfRowWasClicked(rootScope){
            return rootScope.clckedLine != undefined && rootScope.clckedLine != '0';
        }

        /**
         * Use the object's 'data-wordid' attribute in order to sorts the array in ascending order.
         * @param a,b - array elements.
         * @returns {number}
         */
        function sortSelectedWordsArrayByWordIndex(a,b){
            var aIndex = parseInt($(a).attr('data-wordid').split('-')[1]);
            var bIndex = parseInt($(b).attr('data-wordid').split('-')[1]);
            if(aIndex < bIndex){
                return -1;
            }
            if(aIndex > bIndex){
                return 1;
            }
            return 0;
        }

        function getCurrentDataBlock(dataService,unitTreeID){
            var tempObject;
            // var splittedunitTreeID = unitTreeID.toString().split('-');
            // tempObject = dataService.tree.AnnotationUnits[parseInt(splittedunitTreeID[0]) - 1];
            // for (var i=1; i<splittedunitTreeID.length; i++){
            //     tempObject = tempObject.AnnotationUnits[parseInt(splittedunitTreeID[i]) - 1];
            // }

            var parentUnit = dataService.getUnitById(dataService.getParentUnitId(unitTreeID));
            

            return parentUnit.AnnotationUnits[getDirectivePostionIndex(unitTreeID,dataService)];
        }

        function wrapUnitWithBordersInParentUnit(unitDataBlock,taskCategories,newLine,rootScope){
            var tempDiv = document.createElement('div');
            tempDiv.innerHTML = unitDataBlock.text;

            var unitChildren = tempDiv.children;

            $(unitChildren).removeClass('clickedToken');
            
            var unitGroupedAdjacentChildrenArray = arrangeUnitAdjacentChildrenInGroups(unitChildren);

            for (var i=0; i<unitGroupedAdjacentChildrenArray.length; i++){
                wrapEveryAdjacentChildrenGroupInItsParentUnitTogether(unitGroupedAdjacentChildrenArray[i],unitDataBlock.categories,taskCategories,newLine,rootScope,i);
            }

        }

        function wrapEveryAdjacentChildrenGroupInItsParentUnitTogether(childrenGroup,categories,taskCategories,newLine,rootScope,tokenOrderInArray){
            var startIndex, hasDataWordId = false;
            if($(childrenGroup[0]).attr('data-wordid')){
                startIndex = parseInt($(childrenGroup[0]).attr('data-wordid').split('-')[1]);
                hasDataWordId = true;
            }else{
                startIndex = $("#row-"+DataService.getParentUnitId($rootScope.clckedLine)).find("[unit-wrapper-id=unit-wrapper-"+DataService.getParentUnitId($rootScope.clckedLine)+"-"+$rootScope.clckedLine+"]")
                // startIndex = $(childrenGroup[0]).attr('id');
            }
            // var endIndex = parseInt($(childrenGroup[childrenGroup.length-1]).attr('data-wordid').split('-')[1]);
            var unitParentIndex = (DataService.getParentUnitId($rootScope.clckedLine)).toString();

            var splittedUnitParentIndex = unitParentIndex.split('-');
            var rowID = '#row-';
            if (splittedUnitParentIndex.length > 1){
                for(var i=0; i<splittedUnitParentIndex.length - 1; i++){
                    rowID += splittedUnitParentIndex[i]+"-";
                }
                rowID += splittedUnitParentIndex[i];
            }else{
                rowID += splittedUnitParentIndex[0];
            }

            if(newLine){
                var wrappedChildrenSpan = $('<span go-to-unit></span>');
                $(wrappedChildrenSpan).addClass('unit-wrapper');

                // $(wrappedChildrenSpan).attr('unit-wrapper-id','unit-wrapper-'+(parseInt(rowID.split('-')[1]))+"-"+DataService.lastInsertedUnitIndex);
                $(wrappedChildrenSpan).attr('unit-wrapper-id','unit-wrapper-'+(rowID.split('row-')[1])+"-"+DataService.lastInsertedUnitIndex);

                $(wrappedChildrenSpan).attr('num-of-tokens',childrenGroup.length);

                $(wrappedChildrenSpan).attr('go-to-unit','');

                $(wrappedChildrenSpan).attr('child-unit-id',DataService.lastInsertedUnitIndex);

                for(var i=0; i<childrenGroup.length; i++){
                    $(childrenGroup[i])[0].innerHTML += ' ';
                    $(wrappedChildrenSpan).append(childrenGroup[i]);
                }

                var unitRowNumber = 0;
                var splittedParentUnitIndex = splitStringByDelimiter(DataService.lastInsertedUnitIndex,'-');
                splittedParentUnitIndex = (splittedParentUnitIndex.length == 1 ? 0 :splittedParentUnitIndex.slice(0,splittedParentUnitIndex.length-1).join('-') );
                var annotationUnitId = $('#row-'+splittedParentUnitIndex);

                var insertSuccsess = true;
                var tempElement = angular.copy(wrappedChildrenSpan);
                try{
                    if(hasDataWordId){
                        annotationUnitId[0].insertBefore(wrappedChildrenSpan.get(0),annotationUnitId.find('.word-'+startIndex)[0]);
                    }else{
                        annotationUnitId[0].insertBefore(wrappedChildrenSpan.get(0),startIndex);
                    }
                }catch(e){
                    insertSuccsess = false
                }

                if(insertSuccsess){
                    for(i=0; i<childrenGroup.length; i++){
                        // var tokenIndex = parseInt($(childrenGroup[i]).attr('data-wordid').split('-')[1]);
                        try{
                            $(annotationUnitId[0]).find('.clickedToken')[0].remove();
                        }catch(e){
                            if($(annotationUnitId[0]).find("#"+$(childrenGroup[i]).attr('id')).length > 0){
                                $(annotationUnitId[0]).find("#"+$(childrenGroup[i]).attr('id'))[0].remove();
                            }else if($(annotationUnitId[0]).find('.'+childrenGroup[i].classList[1]).length > 0){
                                try{
                                    $(annotationUnitId[0]).find('.'+childrenGroup[i].classList[1])[1].remove();
                                }catch(e){
                                    // console.log('Remote Unit');
                                }
                            }
                        }

                    }

                    paintWrapperSpan($(wrappedChildrenSpan),categories,taskCategories); 

                    var parentUnit = DataService.getUnitById(unitParentIndex)

                    DataService.updateDomUnitWrappers(parentUnit)

                    $compile(annotationUnitId[0])($rootScope);
                }


            }else{ // excisiting line
                var wrappedChildrenSpan = $("[unit-wrapper-id = unit-wrapper-"+(rowID.split('row-')[1])+"-"+DataService.lastInsertedUnitIndex+"]");
                paintWrapperSpan($(wrappedChildrenSpan),categories,DefinitionsService);
            }

            $('.clickedToken').removeClass('clickedToken');
            


        }

        function paintWrapperSpan(wrappedChildrenSpan,categories,taskCategories){
            var categoriesObject = taskCategories;

            if(categories.length == 0){
                $(wrappedChildrenSpan).css('border','3px solid gray');
            }

            for(var i=0; i<categories.length; i++){
                if(i > 3){
                    break;
                }else{
                    var categoryColor = categories[i].backgroundColor;
                    switch(i){
                        case 0:
                            $(wrappedChildrenSpan).css('border','none');
                            $(wrappedChildrenSpan).css('border','3px solid ' + categoryColor);
                            break;
                        case 1:
                            $(wrappedChildrenSpan).css('border-top','none');
                            $(wrappedChildrenSpan).css('border-top','3px solid ' + categoryColor);
                            break;
                        case 2:
                            $(wrappedChildrenSpan).css('border-bottom','none');
                            $(wrappedChildrenSpan).css('border-bottom','3px solid ' + categoryColor);
                            break;
                        case 3:
                            $(wrappedChildrenSpan).css('border-left','none');
                            $(wrappedChildrenSpan).css('border-left','3px solid ' + categoryColor);
                            break;
                    }
                }
            }

            if(categories.length == 0){
                $(wrappedChildrenSpan).css('border','3px solid gray');
            }

            if(wrappedChildrenSpan[0]){ // if IMPLICIT will not enter here
                var rowID = $(wrappedChildrenSpan[0].parentElement).attr('id');
                if(rowID == undefined){
                    rowID = $(wrappedChildrenSpan[0]).attr('id');
                }
                rowID = rowID.split('-');
                rowID  = rowID[0] == 'unit' ? rowID.slice(2,rowID.length).join('-') : rowID.slice(1,rowID.length).join('-');
                var currentAnnotationUnit = DataService.getUnitById(rowID);
                currentAnnotationUnit.text = wrappedChildrenSpan[0].parentElement.innerHTML;
            }

        }

        function findCategoryColorByID(categoriesObject,categoryID){
            for(var i=0; i<categoriesObject.length; i++){
                if(categoriesObject[i].id == categoryID){
                    return categoriesObject[i].backgroundColor;
                }
            }
        }

        function arrangeUnitAdjacentChildrenInGroups(unitChildren){
            var groupedChildrenArray = [];
            var group = [];

            var lastPushedChildWordId = '';
            for(var i=0; i<unitChildren.length; i++){
                if(!$(unitChildren[i]).hasClass('dot-sep')){
                    if(group.length == 0){
                        group.push(unitChildren[i]);
                        if($(unitChildren[i]).attr('data-wordid')){
                            lastPushedChildWordId = parseInt($(unitChildren[i]).attr('data-wordid').split('-')[1]);
                        }else{
                            lastPushedChildWordId = -1;
                        }
                    }else{
                        if(lastPushedChildWordId == -1){
                            group.push(unitChildren[i]);
                        }else{
                            var currentChildWordId = parseInt($(unitChildren[i]).attr('data-wordid').split('-')[1]);
                            if(lastPushedChildWordId == currentChildWordId - 1){
                                group.push(unitChildren[i]);
                            }else if(lastPushedChildWordId == currentChildWordId){
                                continue;
                            }else{
                                groupedChildrenArray.push(group);
                                group = [];
                                group.push(unitChildren[i]);
                            }
                            lastPushedChildWordId = parseInt($(unitChildren[i]).attr('data-wordid').split('-')[1]);
                        }

                    }
                }

            }
            if(group.length != 0){
                groupedChildrenArray.push(group);
            }
            return groupedChildrenArray;
        }

        function handleClickOnNotClickedToken(event,scope,rootScope){
            $('.clickedToken').removeClass('clickedToken');
            
            rootScope.selectedTokensArray = [];
            $(event.toElement).attr('parent-index',scope.selCtrl.lineId);
            var tokenToPush = event.toElement.outerHTML;
            $(tokenToPush).attr('parent-index',rootScope.clckedLine);

            rootScope.selectedTokensArray.push(tokenToPush);
            $(event.toElement).addClass('clickedToken');
            
        }

        function handleClickOnAlreadyClickedToken(event,isShiftPressed,isCtrlPressed,rootScope){
            if(!isShiftPressed && !isCtrlPressed){
                rootScope.selectedTokensArray = [];
                $('.clickedToken').removeClass('clickedToken');
                
            }else{
                $(event.toElement).removeClass('clickedToken')
                
                //The token is already selected, need to remove it.
                var tokenId = splitStringByDelimiter($(event.toElement).attr('data-wordid'),"-")[1];
                removeTokensFromSelectedTokensArray(tokenId,rootScope.selectedTokensArray);
            }
        }

        function handleClickOnTokenWhenCtrlPressed(event,scope,rootScope){
            $(event.toElement).attr('parent-index',scope.selCtrl.lineId);
            var tokenToPush = event.toElement.outerHTML;
            $(tokenToPush).attr('parent-index',rootScope.clckedLine);
            rootScope.selectedTokensArray.push(tokenToPush);
            $(event.toElement).addClass('clickedToken');
            
        }

        function handleClickOnTokenWhenShiftPressed(event,scope,rootScope){
            if(rootScope.lastSelectedWordWithShiftPressed == undefined){

                handleFirstClickOnTokenWhenShiftPressed(event,scope,rootScope);

            }else{

                handleSecondClickOnTokenWhenShiftPressed(event,scope,rootScope);

            }
        }

        function handleFirstClickOnTokenWhenShiftPressed(event,scope,rootScope){
            rootScope.lastSelectedWordWithShiftPressed = parseInt($(event.toElement).attr('data-wordid').split('-')[1]);
            $('.clickedToken').removeClass('clickedToken');
            
            $(event.toElement).attr('parent-index',scope.selCtrl.lineId);
            rootScope.selectedTokensArray = [];
            rootScope.selectedTokensArray.push(event.toElement.outerHTML);
            $(event.toElement).addClass('clickedToken');
            
        }

        function handleSecondClickOnTokenWhenShiftPressed(event,scope,rootScope){
            // $(event.toElement).attr('parent-index',scope.selCtrl.lineId);
            // rootScope.selectedTokensArray.push(event.toElement.outerHTML);

            var wordIndex = parseInt($(event.toElement).attr('data-wordid').split('-')[1]);
            var allWordsArray = $('#row-'+scope.selCtrl.selectedRow+' > .selectable-word');

            var splittedLineId = scope.selCtrl.lineId.toString().split('-');
            var rowID = '#row-';
            if (splittedLineId.length > 1){
                for(var i=0; i<splittedLineId.length - 1; i++){
                    rowID += splittedLineId[i]+"-";
                }
                rowID += splittedLineId[i];
            }else{
                rowID += splittedLineId[0];
            }
            if(rootScope.lastSelectedWordWithShiftPressed < wordIndex){

                handelSecondClickedTokenIsHigherThenFirstClickedTokenEvent(scope,rootScope,allWordsArray,wordIndex,rowID);

            }else{

                handelSecondClickedTokenIsLowerThenFirstClickedTokenEvent(scope,rootScope,allWordsArray,wordIndex,rowID);

            }
            rootScope.lastSelectedWordWithShiftPressed = undefined;
        }

        function handelSecondClickedTokenIsHigherThenFirstClickedTokenEvent(scope,rootScope,allWordsArray,wordIndex,rowID){
            var startIndex = 0, endIndex = 0;
            for(var i=0; i <allWordsArray.length; i++){
                if($(allWordsArray[i]).hasClass('word-'+wordIndex)){
                    startIndex = i;
                }
                if($(allWordsArray[i]).hasClass('word-'+rootScope.lastSelectedWordWithShiftPressed)){
                    endIndex = i;
                }
            }

            for(i = startIndex; i >= endIndex; i--){
                if($(rowID).find('.'+$(allWordsArray[i]).attr('data-wordid')).hasClass('clickedToken')){
                    break;
                }else{
                    $(allWordsArray[i]).attr('parent-index',scope.selCtrl.lineId);
                    rootScope.selectedTokensArray.push(allWordsArray[i].outerHTML);
                    // $(rootScope.selectedTokensArray[rootScope.selectedTokensArray.length-1]).attr('parent-index',rootScope.clckedLine);
                    $(allWordsArray[i]).addClass('clickedToken');
                    
                }
            }
        }

        function handelSecondClickedTokenIsLowerThenFirstClickedTokenEvent(scope,rootScope,allWordsArray,wordIndex,rowID){
            var startIndex = 0, endIndex = 0;
            for(var i=0; i <allWordsArray.length; i++){
                if($(allWordsArray[i]).hasClass('word-'+wordIndex)){
                    startIndex = i;
                }
                if($(allWordsArray[i]).hasClass('word-'+rootScope.lastSelectedWordWithShiftPressed)){
                    endIndex = i;
                }
            }
            for(var i = startIndex; i <= endIndex; i++){
                if($(rowID).find('.'+$(allWordsArray[i]).attr('data-wordid')).hasClass('clickedToken')){
                    break;
                }else{
                    $(allWordsArray[i]).attr('parent-index',scope.selCtrl.lineId);
                    rootScope.selectedTokensArray.push(allWordsArray[i].outerHTML);
                    $(allWordsArray[i]).addClass('clickedToken');
                    
                }
            }
        }


        function AnnotationUnitController($uibModal,AnnotationTextService,$rootScope) {

            // Injecting $scope just for comparison
            var selCtrl = this;
            selCtrl.toggleAnnotationUnitView = AnnotationTextService.toggleAnnotationUnitView;
            selCtrl.unitIsCollapsed = false;

            selCtrl.isDirRtl = $rootScope.isDirRtl = AnnotationTextService.isRTL($(this.previewLine).text());
            selCtrl.languageAlign = $rootScope.languageAlign = $rootScope.isDirRtl ? 'rtl' : 'ltr';

            var mouseDown = false;

            selCtrl.open = function (page, size,message) {
                $uibModal.open({
                    animation: true,
                    templateUrl: page,
                    size: size,
                    controller: function($scope){
                        if(selCtrl.dataBlock){
                            $scope.comment = selCtrl.dataBlock.comment;
                        }

                        $scope.message = message;

                        $scope.saveComment = function(){
                            selCtrl.dataBlock.comment = $scope.comment;
                        }

                        $scope.deleteAllRemoteInstanceOfThisUnit = function(){
                            
                            // remove duplicates
                            selCtrl.currentUnitRemoteInstancesIds = selCtrl.currentUnitRemoteInstancesIds.filter(function(unitTreeId,index,self){
                                return self.indexOf(unitTreeId) == index
                            })
                            selCtrl.currentUnitRemoteInstancesIds.sort(sortIndexes);
                            for(var i=0; i<selCtrl.currentUnitRemoteInstancesIds.length ; i++){
                                DataService.deleteFromTree(selCtrl.currentUnitRemoteInstancesIds[i])
                                selCtrl.updateUI(DataService.getUnitById(selCtrl.currentUnitRemoteInstancesIds[i]))
                            }
                            // selCtrl.updateUI(DataService.getUnitById($("[unit-wrapper-id="+$rootScope.clickedUnit+"]").attr('child-unit-id')));
                        };
                    }
                });
            };

            function sortIndexes(a,b){
                if(a.length < b.length){
                    return 1;
                }
                if(a.length > b.length){
                    return -1;
                }
                for(var i=0; i< a.length; i++){
                    if(a[i] < b[i]){
                        return 1;
                    }
                    if(a[i] > b[i]){
                        return -1;
                    }
                }
                return 0;
            }
        }



        /**
         * Reset the color back to the original color (black).
         */
        function hoverOutFunction(){
            $('.selectable-word').css('color','black');
        }

        /**
         * Filter function - Filters the words to be colored on hover - gets the hover elemnt parent index and coloring all the words with the same class name up the data tree.
         * @param className - The class name of the words we want to color.
         * @param filterBy - The hovered word parent index.
         * @returns {*}
         */
        function filterWords(className,filterBy){
            if(filterBy == '0'){
                return $('#row-'+filterBy).find('.'+className)[0];
            }else{
                var tempFilter = angular.copy(filterBy);
                var returnArray = [];
                while(tempFilter.length > 1){
                    var spliteedTempFilter = tempFilter.split('-');
                    var backSlashedFilter = '';
                    for (var i = 0 ; i < spliteedTempFilter.length; i++){
                        backSlashedFilter += spliteedTempFilter[i];
                        if(i + 1 != spliteedTempFilter.length){
                            backSlashedFilter += '-';
                        }
                    };
                    returnArray.push.apply(returnArray,$('#row-'+backSlashedFilter).find('.'+className));
                    tempFilter = tempFilter.substr(0,tempFilter.length-2);
                }
                returnArray.push.apply(returnArray,$('#row-0').find('.'+className));
                returnArray.push.apply(returnArray,$('#row-'+tempFilter).find('.'+className));
                returnArray.push.apply(returnArray,$('annotation-text').find('.'+className));
                return returnArray;
            }
        }

        /**
         * Initialize function -  Sets the directive style, wrap the words in spans, sets click event.
         * @param initObject - directive general details.
         * @returns {string} - the directive's data block index.
         */
        function initDirective(initObject){
            $(initObject.elem).find('.square-color').css('background-color',initObject.rootScope.currentCategoryBGColor);

            /**
             * Append the wrapped line into the container
             */
            var previewLine = initObject.DataService.wrapWords(initObject.scope.selCtrl.previewLine,false,initObject.scope.selCtrl.lineId);
            $(initObject.elem).find('.text').append(previewLine);

            /**
             * Set the on click function and parent-color attribute
             */
            $(initObject.elem).find('.selectable-word').on('mousedown',initObject.tokenClicked);
            $(initObject.elem).on('mousedown',initObject.focusUnit);

            $(initObject.elem).find('.selectable-word').attr('parent-color',initObject.rootScope.currentCategoryBGColor);

            initObject.rootScope.selectedTokensArray = [];

            if(initObject.scope.selCtrl.control == undefined){
                initObject.scope.selCtrl.control = [];
            }

            var controlObject = {
                moveRight: $rootScope.isDirRtl ? initObject.moveLeft : initObject.moveRight,
                moveLeft: $rootScope.isDirRtl ? initObject.moveRight : initObject.moveLeft,
                moveDown: initObject.moveDown,
                moveUp: initObject.moveUp,
                spacePressed:initObject.spacePressed,
                toggleCategory: initObject.toggleCategory,                
                moveRightWithCtrl: $rootScope.isDirRtl ? initObject.moveLeftWithCtrl : initObject.moveRightWithCtrl,
                moveLeftWithCtrl: $rootScope.isDirRtl ? initObject.moveRightWithCtrl : initObject.moveLeftWithCtrl,
                moveRightWithShift: $rootScope.isDirRtl ? initObject.moveLeftWithShift : initObject.moveRightWithShift,
                moveLeftWithShift: $rootScope.isDirRtl ? initObject.moveRightWithShift : initObject.moveLeftWithShift,
                addAsRemoteUnit:initObject.addAsRemoteUnit,
                deleteFromTree: initObject.deleteFromTree,
                checkRestrictionForCurrentUnit: initObject.checkRestrictionForCurrentUnit,
                index: initObject.scope.selCtrl.lineId
            }


            if(initObject.scope.selCtrl.lineId.toString().split("-").length > 1){
                var parent = initObject.scope.$parent;
                while(parent.selCtrl == undefined || parent.selCtrl.lineId.toString().split("-").length > 1){
                    parent = parent.$parent;
                }
                parent.selCtrl.control.push(controlObject)
            }else{
                initObject.scope.selCtrl.control[0] = controlObject;
            }




            initObject.scope.selCtrl.cursorLocation = 0;
            /** setting the directive data block index */
            var directiveIndex = initObject.scope.selCtrl.lineId;

            $timeout(function(){
                $('.selected-row').removeClass('selected-row');
                $('#directive-info-data-container-'+initObject.DataService.lastInsertedUnitIndex).addClass('selected-row');
            });

            return directiveIndex;

        }

        function getDirectivePostionIndex(unitId,dataService){
            var parentUnit = dataService.getUnitById(dataService.getParentUnitId(unitId));
            var index = parentUnit.AnnotationUnits.findIndex(function(unitObj){
                return unitObj.annotation_unit_tree_id == unitId;
            });
            return index;
        }

        function splitStringByDelimiter(stringToSplit,del){
            return stringToSplit ? stringToSplit.toString().split(del) : null;
        }
        function resetSelectedCategoryInfo(){
            delete $rootScope.currentCategoryID;
            delete $rootScope.currentCategoryColor;
            delete $rootScope.currentCategoryBGColor;
            delete $rootScope.currentCategoryAbbreviation;
            delete $rootScope.currentCategoryName;
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
            $rootScope.focusUnit(rowElem)
            var unitToValidate = DataService.getUnitById(unit_id);
            var parentUnit = DataService.getUnitById(DataService.getParentUnitId(unitToValidate.annotation_unit_tree_id))
            var isUnitValidated = restrictionsValidatorService.checkRestrictionsOnFinish(unitToValidate,parentUnit);
            if(isUnitValidated){
                if(parentUnit.annotation_unit_tree_id == "0"){
                    unitToValidate.gui_status = 'HIDDEN';
                }else{
                    unitToValidate.gui_status = 'COLLAPSE';
                }
                Core.showNotification('success','Annotation unit ' + unitToValidate.annotation_unit_tree_id + ' has finished successfully' )
                var parentId = DataService.getParentUnitId(unitToValidate.annotation_unit_tree_id);
                var parentRowElem = $('#directive-info-data-container-'+parentId)
                $rootScope.focusUnit(parentRowElem);
            }
        }




    }

})();