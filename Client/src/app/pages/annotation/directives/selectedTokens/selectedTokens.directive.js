(function() {
    'use strict';

    angular.module('zAdmin.annotation.directives')
        .directive('selectedTokens',selectedTokensDirective);

    /** @ngInject */
    function selectedTokensDirective(WordsWrapperService,$rootScope,DataService,HotKeysManager,hotkeys,DefinitionsService, $timeout, $compile) {

        var directive = {
            restrict:'E',
            templateUrl:'app/pages/annotation/directives/selectedTokens/selectedTokens.html',
            scope:{
                previewLine: '=',
                lineId: '=',
                childDirective: '@',
                categories: '=',
                control: '='
            },
            link: selectedTokensDirectiveLink,
            controller: SelectedWordsController,
            controllerAs: 'selCtrl',
            bindToController: true,
            replace:true

        };

        return directive;

        function selectedTokensDirectiveLink($scope, elem, attrs) {

            var initObject = {
                scope:$scope,
                elem:elem,
                rootScope:$rootScope,
                HotKeysManager: HotKeysManager,
                WordsWrapperService:WordsWrapperService,
                DataService:DataService,
                wordClicked:wordClicked,
                rowClicked:rowClicked,
                moveRight: moveRight,
                moveLeft: moveLeft,
                moveDown:moveDown,
                moveUp:moveUp,
                addAsRemoteUnit:addAsRemoteUnit,
                spacePressed:spacePressed,
                toggleCategory:toggleCategory,
                moveRightWithCtrl: moveRightWithCtrl,
                moveLeftWithCtrl:moveLeftWithCtrl,
                moveRightWithShift: moveRightWithShift,
                moveLeftWithShift: moveLeftWithShift,
                deleteFromTree:deleteFromTree
            };

            $rootScope.wordClicked = wordClicked;
            $rootScope.rowClicked = rowClicked;

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

            $scope.selCtrl.removeRow = removeRow;
            $scope.selCtrl.switchToRemoteMode = switchToRemoteMode;

            function removeRow(unit_id,event){
                var annotaionUnitToDelete = $('#'+unit_id);
                console.log(annotaionUnitToDelete);
                unit_id = unit_id.toString();
                $rootScope.clickedUnit = 'unit-wrapper-'+DataService.getParentUnitId(unit_id)+'-'+unit_id;
                // deleteFromTree(unit_id);

                DataService.deleteFromTree(unit_id);

                $scope.selCtrl.dataBlock.categories.changed = true;

                event.stopPropagation();
            }

            /**
             * Sets the words hover function.
             */
            // $('.selectable-word').hover(hoverFunction);
            // $('.selectable-word').mouseout(hoverOutFunction);
            var IS_MOUSE_DOWN = false;
            $('.directive-info-data-container .text-wrapper').on('mouseup',function(){
                IS_MOUSE_DOWN = false
            });

            $('.selectable-word').on('mouseover',function(){
                console.log('IS_MOUSE_DOWN: '+IS_MOUSE_DOWN);
                if(IS_MOUSE_DOWN){
                    if($(this).hasClass('clickedWord')){
                        $(this).removeClass('clickedWord');
                        var tokenId = splitStringByDelimiter($(this).attr('data-wordid'),"-")[1];
                        removeTokensFromSelectedTokensArray(tokenId,$rootScope.selectedTokensArray);
                    }else{
                        $(this).addClass('clickedWord');
                        $rootScope.selectedTokensArray.push(this.outerHTML);
                    }
                    updateCursorLocation($scope.selCtrl,event.toElement,$rootScope);
                }else {
                    // $(this).css({'background-color':'transparent'})
                    // }
                    /*
                     if a token is already selected
                     AND
                     mouse is down

                     */
                }
            });

            /**
             * Handle Click on tokens.
             * @param event - The click event.
             */
            function wordClicked(event){
                /**
                 * Initialization phase - checks if ctrl/shift is pressed and update clickedLine variable on rootScope.
                 */
                IS_MOUSE_DOWN = true
                var isShiftPressed = HotKeysManager.checkIfHotKeyIsPressed('shift');
                var isCtrlPressed = HotKeysManager.checkIfHotKeyIsPressed('ctrl');
                var tokenRowId = $(event.currentTarget.parentElement).attr('id').split('-');
                tokenRowId = tokenRowId.slice(1,tokenRowId.length).join('-');
                $rootScope.clckedLine = tokenRowId;
                $scope.selCtrl.selectedRow = tokenRowId;

                /**
                 * Checks if the clicked element is indeed a token and not the outer div.
                 */
                if(event.toElement.localName == 'span'){
                    if($(event.toElement).hasClass('clickedWord')){

                        handleClickOnAlreadyClickedToken(event,isShiftPressed,isCtrlPressed,$rootScope);

                    }else{
                        if($rootScope.clckedLine != $scope.selCtrl.lineId){
                            $('.clickedWord').removeClass('clickedWord');
                        }

                        /**If shift is pressed.adds all the token between first token to end token.
                         * else if ctrl is pressed. if true adds the token to the selected token array.
                         * else, clear the selected token array and add the new selected token.
                         */
                        if(isShiftPressed){

                            handleClickOnTokenWhenShiftPressed(event,$scope,$rootScope);

                        }else if(isCtrlPressed){

                            handleClickOnTokenWhenCtrlPressed(event,$scope,$rootScope);

                            // updateCursorLocation($scope.selCtrl,event.toElement);

                        }else{

                            handleClickOnNotClickedToken(event,$scope,$rootScope);

                            // updateCursorLocation($scope.selCtrl,event.toElement);

                        }
                        updateCursorLocation($scope.selCtrl,event.toElement,$rootScope);

                        var parentContainerId = $(event.toElement.parentElement).attr('id').split('-');
                        parentContainerId = parentContainerId.slice(1,parentContainerId.length).join('-');
                        // $('.selected-row').removeClass('selected-row');

                        var parentContainer = $('#directive-info-data-container-'+parentContainerId).addClass('selected-row');

                        event.stopPropagation();

                        rowClicked(parentContainer);
                    }

                    HotKeysManager.checkIfHotKeyIsPressed('shift') == false ? $rootScope.lastSelectedWordWithShiftPressed = undefined : '';
                }
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

            /**
             * Handle click on row - update the current selected row.
             */
            function rowClicked(element){

                var dataWordId = $(element.toElement).attr('data-wordid');
                if(dataWordId == undefined){
                    var clickedRowId = [];
                    if(element.toElement){
                        clickedRowId = $(element.toElement).attr('id').split('-');
                    }
                    else{
                        clickedRowId = $(element).attr('id').split('-');
                    }
                    $rootScope.clckedLine = clickedRowId.slice(4,clickedRowId.length).join('-');
                    /*$rootScope.clckedLine = clickedRowId[clickedRowId.length-1];*/
                }else{
                    var clickedRowId = $(element.toElement).attr('parent-index').split('-');
                    clickedRowId.length == 1 ? $rootScope.clckedLine = clickedRowId[0] : $rootScope.clckedLine = clickedRowId.slice(1,clickedRowId.length).join('-');
                    /*$rootScope.clckedLine = clickedRowId[clickedRowId.length-1];*/
                }
                $('.highlight-unit').removeClass('highlight-unit');
                $('.highlight-unit').toggleClass('highlight-unit');
                $('.selected-row').removeClass('selected-row');
                if(element.toElement){
                    if($(element.toElement).hasClass('selectable-word')){
                        $(element.toElement.parentElement.parentElement.parentElement).addClass('selected-row');
                    }else{
                        $(element.toElement).addClass('selected-row');
                    }
                }else{
                    $(element).addClass('selected-row');
                }

                $scope.selCtrl.selectedRow = $rootScope.clckedLine;

                DataService.lastInsertedUnitIndex = $rootScope.clckedLine;
            }

            function moveRight(){
                var currentRow = $('#row-'+$scope.selCtrl.lineId)[0];
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
                            $('.clickedWord ').removeClass('clickedWord ');
                            $rootScope.selectedTokensArray = [];
                        }

                        if(isCtrlPressed){
                            var tokenToAdd = $(currentRow).find($('.selectable-word').attr('data-wordid'))
                        }

                        var directiveCursor = $('#cursor-'+$scope.selCtrl.lineId)[0];

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
                    rowClicked(currentRow);

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
                    rowClicked(currentRow);

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
                    var currentRow = $('#row-'+$scope.selCtrl.lineId)[0];
                    if($scope.selCtrl.cursorLocation < $(currentRow).children().length){

                        $scope.selCtrl.cursorLocation++;

                        var directiveCursor = $('#cursor-'+$scope.selCtrl.lineId)[0];

                        currentRow.removeChild(directiveCursor);
                        currentRow.insertBefore(directiveCursor, currentRow.children[$scope.selCtrl.cursorLocation]);
                    }
                }
                
            }

            /**
             * This function handle keyboard units selection while shift key is pressed.
             */
            function moveRightWithShift(){
                if(DataService.unitType = 'REGULAR'){
                    var currentRow = $('#row-'+$scope.selCtrl.lineId)[0];
                    if($scope.selCtrl.cursorLocation < $(currentRow).children().length){


                        var tokenToAdd = currentRow.children[$scope.selCtrl.cursorLocation+1];

                        if(!$(tokenToAdd).hasClass('dot-sep')){
                            if($(tokenToAdd).hasClass('clickedWord')){
                                $(tokenToAdd).removeClass('clickedWord');

                                //The token is already selected, need to remove it.
                                var tokenId = splitStringByDelimiter($(tokenToAdd).attr('data-wordid'),"-")[1];
                                removeTokensFromSelectedTokensArray(tokenId,$rootScope.selectedTokensArray);
                            }else{
                                $rootScope.selectedTokensArray.push(tokenToAdd.outerHTML);
                                $(tokenToAdd).addClass('clickedWord');
                            }
                        }

                        $scope.selCtrl.cursorLocation++;

                        var directiveCursor = $('#cursor-'+$scope.selCtrl.lineId)[0];

                        currentRow.removeChild(directiveCursor);
                        currentRow.insertBefore(directiveCursor, currentRow.children[$scope.selCtrl.cursorLocation]);
                    }
                }                
            }

            function moveLeft(){
                var currentRow = $('#row-'+$scope.selCtrl.lineId)[0];
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
                            $('.clickedWord ').removeClass('clickedWord ');
                            $rootScope.selectedTokensArray = [];
                        }

                        $scope.selCtrl.cursorLocation--;
                        var directiveCursor = $('#cursor-' + $scope.selCtrl.lineId);
                        currentRow.insertBefore(directiveCursor.get(0), currentRow.children[$scope.selCtrl.cursorLocation]);
                    }
                }
            }

            function moveLeftWithCtrl(){
                var currentRow = $('#row-'+$scope.selCtrl.lineId)[0];
                if($scope.selCtrl.cursorLocation > 0){

                    $scope.selCtrl.cursorLocation--;

                    var directiveCursor = $('#cursor-'+$scope.selCtrl.lineId)[0];

                    currentRow.removeChild(directiveCursor);
                    currentRow.insertBefore(directiveCursor, currentRow.children[$scope.selCtrl.cursorLocation]);
                }
            }

            function moveLeftWithShift(){
                var currentRow = $('#row-'+$scope.selCtrl.lineId)[0];
                if($scope.selCtrl.cursorLocation > 0){

                    var tokenToAdd = currentRow.children[$scope.selCtrl.cursorLocation-1];

                    if(!$(tokenToAdd).hasClass('dot-sep')){
                        if($(tokenToAdd).hasClass('clickedWord')){
                            $(tokenToAdd).removeClass('clickedWord');

                            //The token is already selected, need to remove it.
                            var tokenId = splitStringByDelimiter($(tokenToAdd).attr('data-wordid'),"-")[1];
                            removeTokensFromSelectedTokensArray(tokenId,$rootScope.selectedTokensArray);
                        }else{
                            $rootScope.selectedTokensArray.push(tokenToAdd.outerHTML);
                            $(tokenToAdd).addClass('clickedWord');
                        }
                    }

                    $scope.selCtrl.cursorLocation--;

                    var directiveCursor = $('#cursor-'+$scope.selCtrl.lineId)[0];

                    currentRow.removeChild(directiveCursor);
                    currentRow.insertBefore(directiveCursor, currentRow.children[$scope.selCtrl.cursorLocation]);
                }
            }

            function deleteFromTree(unitId){
                var unitIdToDelete, splittedUnitIdToDeleteId;

                var unitToDelete;
                if(unitId == undefined){
                    unitIdToDelete = $rootScope.clckedLine;
                    unitId = $rootScope.clckedLine;
                    // unitIdToDelete = $('#'+unitIdToDelete).attr('child-unit-id');
                    // splittedUnitIdToDeleteId = splitStringByDelimiter(unitIdToDelete,'-');
                    $rootScope.clickedUnit = 'unit-wrapper-'+DataService.getParentUnitId($rootScope.clckedLine)+'-'+$rootScope.clckedLine;
                    unitToDelete = DataService.getUnitById(unitIdToDelete);
                }else{
                    splittedUnitIdToDeleteId = splitStringByDelimiter(unitId,'-');
                    unitToDelete = DataService.getUnitById(unitId);
                }

                var unitChildren  = unitToDelete.Rows;

                $scope.selCtrl.updateUI = function(unitToDelete){
                    if(unitToDelete.unitType == 'REGULAR'){
                        if(unitChildren.length == 0){
                            //unit has no children
                            var unitDomElementToDelete = $('#'+$rootScope.clickedUnit);
                            var unitDomElementParent =unitDomElementToDelete[0].parentElement;
                            var unitDomElementChildrenLength = unitDomElementToDelete.children().length;
                            for(var i=0; i<unitDomElementChildrenLength; i++){
                                unitDomElementParent.insertBefore(unitDomElementToDelete.children().get(0),unitDomElementToDelete.get(0))
                            }
                            unitDomElementToDelete.remove();

                        }else{
                            //unit has unit children
                            // var unitToDeleteId;
                            // if(splittedUnitIdToDeleteId.length == 2){
                            //     unitToDeleteId = splittedUnitIdToDeleteId.slice(2,splittedUnitIdToDeleteId.length-1).join("-");
                            // }else{
                            //     unitToDeleteId = splittedUnitIdToDeleteId.slice(3,splittedUnitIdToDeleteId.length).join("-");
                            // }
                            var unitDomElementToDelete = $('#'+$rootScope.clickedUnit);
                            var unitDomElementParent =unitDomElementToDelete[0].parentElement;

                            var unitToDeleteChildrenUnits = $('#row-'+unitId).children();
                            for(var i=0; i<unitToDeleteChildrenUnits.length; i++){
                                if(!$(unitToDeleteChildrenUnits[i]).hasClass('cursor')){
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

                        $(unitDomElementParent).find('.selectable-word').attr('onclick','').unbind('click');
                        $(unitDomElementParent).find('.selectable-word').on('click',wordClicked);
                    })
                };

                if(unitToDelete){
                    if(unitToDelete.usedAsRemote.length > 0){
                        $scope.selCtrl.currentUnitRemoteInstancesIds = unitToDelete.usedAsRemote;
                        $scope.selCtrl.currentUnitRemoteInstancesIds.push(unitToDelete.annotation_unit_tree_id.toString());
                        $scope.selCtrl.open('app/pages/annotation/templates/deleteAllRemoteModal.html','md',unitToDelete.usedAsRemote.length-1);
                    }else{
                        $rootScope.clckedLine = DataService.deleteFromTree(unitToDelete.annotation_unit_tree_id);
                        if(unitToDelete.unitType == 'REGULAR'){
                            $scope.selCtrl.updateUI(unitToDelete)
                        }
                    }
                }
            }

            function updateDomElements(unitToUpdate){
                console.log(unitToUpdate.annotation_unit_tree_id);
                var unitChildren = $('#row-'+unitToUpdate.annotation_unit_tree_id).find($('.unit-wrapper'));
                for(var i=0; i<unitToUpdate.Rows.length; i++){
                    $(unitChildren[i]).attr('child-unit-id',unitToUpdate.Rows[i].annotation_unit_tree_id);
                    $(unitChildren[i]).attr('id','unit-wrapper-'+unitToUpdate.annotation_unit_tree_id+'-'+unitToUpdate.Rows[i].annotation_unit_tree_id);
                    updateDomElements(unitToUpdate.Rows[i]);
                }
            }

            function spacePressed(){
                resetSelectedCategoryInfo();
                var currentRow = $('#row-'+$scope.selCtrl.lineId)[0];                
                if(DataService.unitType == 'REMOTE'){
                        //Select The first
                    var firstUnit = $(currentRow).find('.selected-unit')[0];
                    $rootScope.onClickForRemote(firstUnit);
                }else{
                    if($rootScope.selectedTokensArray.length > 0){
                        $rootScope.selectedTokensArray.sort(sortSelectedWordsArrayByWordIndex);
                        if($rootScope.selectedTokensArray.length > 0){
                            $rootScope.clckedLine = $rootScope.parseSelectedWords($rootScope.clckedLine);
                            $timeout(function(){
                                // give focus to the new unit
                                $('.selected-row').toggleClass('selected-row');
                                $('#directive-info-data-container-'+$rootScope.clckedLine).toggleClass('selected-row');
                            });
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
                $rootScope.selectedTokensArray = [];
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
                        if (e.keyCode == 27) { // escape key maps to keycode `27`
                            $timeout(function(){
                                $scope.$apply();
                                DataService.unitType = 'REGULAR';
                                $('#'+$rootScope.clickedUnit).toggleClass('highlight-unit');
                                $('.annotation-page-container').toggleClass('crosshair-cursor');
                                $( ".unit-wrapper" ).attr('onclick','').unbind('click');
                                $( ".selectable-word" ).attr('onclick','').unbind('click');
                                $( ".selectable-word" ).on('click',wordClicked);
                                $( ".directive-info-data-container" ).attr('onclick','').unbind('click');
                                $( ".directive-info-data-container" ).on('click',rowClicked);
                            },0)
                        }
                    });

                    var lineToAddRemoteUnit = $rootScope.clckedLine;
                    $('.annotation-page-container').toggleClass('crosshair-cursor');
                    $( ".selectable-word" ).attr('onclick','').unbind('click');

                    $( ".selectable-word" ).on('click',function(){
                        $scope.selCtrl.open('app/pages/annotation/templates/errorModal.html','md',"Only Units can be selected as remote units.");
                    });

                    var parentUnit = DataService.getParentUnitId($rootScope.clckedLine);
                    $('.highlight-unit').removeClass('highlight-unit');
                    $('#unit-wrapper-'+(parseInt(parentUnit)+1)+"-"+$rootScope.clckedLine).toggleClass('highlight-unit');
                    $rootScope.clickedUnit = 'unit-wrapper-'+(parseInt(parentUnit))+"-"+$rootScope.clckedLine;

                    $('.directive-info-data-container').attr('onclick','').unbind('click');

                    


                    $rootScope.onClickForRemote =function (e){
                        if($rootScope.clickedUnit == $(e.toElement).attr('id') || $rootScope.clickedUnit == $(e).attr('id')){
                            $scope.selCtrl.open('app/pages/annotation/templates/errorModal.html','md',"Unit cannot be selected as remote.");
                        }else{
                            $rootScope.currentCategoryID = category.id;
                            $rootScope.currentCategoryColor = category.color;
                            $rootScope.currentCategoryAbbreviation = category.abbreviation;
                            $rootScope.selectedTokensArray = [];

                            if($(e.toElement).hasClass('directive-info-data-container')){
                                var selectedUnitTokens = e.toElement.children[2].children[0].children;
                                for(var i=0; i<selectedUnitTokens.length; i++){
                                    if(!$(selectedUnitTokens[i]).hasClass('cursor')){
                                        $rootScope.selectedTokensArray.push(selectedUnitTokens[i].outerHTML);
                                    }
                                }
                            }else{
                                var elementChildren = e.toElement ? e.toElement.children : e.children;
                                for(var i=0; i<elementChildren.length; i++){
                                    $rootScope.selectedTokensArray.push(elementChildren[i].outerHTML);
                                }
                            }


                            $rootScope.selectedTokensArray.sort(sortSelectedWordsArrayByWordIndex);
                            $rootScope.clckedLine = lineToAddRemoteUnit;
                            DataService.unitType = 'REMOTE';
                            $rootScope.clckedLine = $rootScope.parseSelectedWords($rootScope.clckedLine,false);
                            DataService.getUnitById($(e.currentTarget).attr('child-unit-id')).usedAsRemote.push($rootScope.clckedLine);

                            $timeout(function(){
                                // give focus to the new unit
                                $('.selected-row').toggleClass('selected-row');
                                $('directive-info-data-container-'+$rootScope.clckedLine).toggleClass('selected-row');
                            });


                            e.toElement ? $scope.$apply() : '';

                            DataService.unitType = 'REGULAR';
                            $('#'+$rootScope.clickedUnit).toggleClass('highlight-unit');
                            $('.selected-unit').removeClass('selected-unit');
                            $('.annotation-page-container').toggleClass('crosshair-cursor');
                            $( ".unit-wrapper" ).attr('onclick','').unbind('click');
                            $( ".selectable-word" ).attr('onclick','').unbind('click');
                            $( ".selectable-word" ).on('click',wordClicked);
                            $( ".directive-info-data-container" ).attr('onclick','').unbind('click');
                            $( ".directive-info-data-container" ).on('click',rowClicked);


                            $compile($('.text-wrapper'))($rootScope)
                        }
                    };

                    $('.unit-wrapper').on('click',$rootScope.onClickForRemote);
                    $('.directive-info-data-container').on('click',$rootScope.onClickForRemote);

                }
            }

            function switchToRemoteMode(event){
                $rootScope.clckedLine = $(event.toElement.parentElement.parentElement.parentElement).attr('id').split('-')[4];
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
                        $(event.toElement).attr('parent-index',$scope.selCtrl.lineId);
                        var tokenToPush = event.toElement.outerHTML;
                        if(!$(tokenToPush).hasClass('clickedWord')){
                            $(tokenToPush).attr('parent-index',$rootScope.clckedLine);
                            $rootScope.selectedTokensArray.push(tokenToPush);
                        }
                        $(event.toElement).toggleClass('clickedWord');
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
                    $rootScope.currentCategoryAbbreviation = category.abbreviation;
                    $rootScope.currentCategoryName = category.name;
                    $rootScope.selectedTokensArray.sort(sortSelectedWordsArrayByWordIndex);
                    if($rootScope.selectedTokensArray.length > 0){
                        $rootScope.clckedLine = $rootScope.parseSelectedWords($rootScope.clckedLine,unitContainsAllParentUnitTokens);
                        $timeout(function(){
                            // give focus to the new unit
                            $('.selected-row').toggleClass('selected-row');
                            $('#directive-info-data-container-'+$rootScope.clckedLine).toggleClass('selected-row');
                        });
                    }else{
                        if(checkIfRowWasClicked($rootScope)){
                            $rootScope.addCategoryToExistingRow();
                        }
                    }

                    delete $rootScope.currentCategoryID;
                    delete $rootScope.currentCategoryColor;
                    delete $rootScope.currentCategoryAbbreviation;
                    $rootScope.selectedTokensArray = [];

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

        function getCurrentDataBlock(dataService,directiveIndex){
            var tempObject;
            var splittedDirectiveIndex = directiveIndex.toString().split('-');
            tempObject = dataService.tree.Rows[parseInt(splittedDirectiveIndex[0]) - 1];
            for (var i=1; i<splittedDirectiveIndex.length; i++){
                tempObject = tempObject.Rows[parseInt(splittedDirectiveIndex[i]) - 1];
            }

            return tempObject;
        }

        function wrapUnitWithBordersInParentUnit(unitDataBlock,taskCategories,newLine,rootScope){
            var tempDiv = document.createElement('div');
            tempDiv.innerHTML = unitDataBlock.text;

            var unitChildren = tempDiv.children;

            $(unitChildren).removeClass('clickedWord');
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
                startIndex = $(childrenGroup[0]).attr('id');
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

                $(wrappedChildrenSpan).attr('id','unit-wrapper-'+(parseInt(rowID.split('-')[1]))+"-"+DataService.lastInsertedUnitIndex);

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
                        annotationUnitId[0].insertBefore(wrappedChildrenSpan.get(0),annotationUnitId.find('#'+startIndex)[0]);
                    }
                }catch(e){
                    insertSuccsess = false
                }

                if(insertSuccsess){
                    for(i=0; i<childrenGroup.length; i++){
                        // var tokenIndex = parseInt($(childrenGroup[i]).attr('data-wordid').split('-')[1]);
                        try{
                            $(annotationUnitId[0]).find('.clickedWord')[0].remove();
                        }catch(e){
                            if($(annotationUnitId[0]).find("#"+$(childrenGroup[i]).attr('id')).length > 0){
                                $(annotationUnitId[0]).find("#"+$(childrenGroup[i]).attr('id'))[0].remove();
                            }else if($(annotationUnitId[0]).find('.'+childrenGroup[i].classList[1]).length > 0){
                                try{
                                    $(annotationUnitId[0]).find('.'+childrenGroup[i].classList[1])[1].remove();
                                }catch(e){
                                    console.log('Remote Unit');
                                }
                            }
                        }

                    }

                    paintWrapperSpan($(annotationUnitId[0]).find('#'+$(tempElement).attr('id')),categories,taskCategories);

                    

                    $compile(annotationUnitId[0])($rootScope);
                }


            }else{
                var wrappedChildrenSpan = $('#unit-wrapper-'+(parseInt(rowID.split('-')[1]))+'-'+DataService.lastInsertedUnitIndex);
                paintWrapperSpan(wrappedChildrenSpan,categories,DefinitionsService);
            }

            $('.clickedWord').removeClass('clickedWord');


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
                    var categoryColor = categories[i].color;
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

            var rowID = $(wrappedChildrenSpan[0].parentElement).attr('id');
            if(rowID == undefined){
                rowID = $(wrappedChildrenSpan[0]).attr('id');
            }
            rowID = rowID.split('-');
            rowID  = rowID[0] == 'unit' ? rowID.slice(2,rowID.length).join('-') : rowID.slice(1,rowID.length).join('-');
            var currentAnnotationUnit = DataService.getUnitById(rowID);
            currentAnnotationUnit.text = wrappedChildrenSpan[0].parentElement.innerHTML;

        }

        function findCategoryColorByID(categoriesObject,categoryID){
            for(var i=0; i<categoriesObject.length; i++){
                if(categoriesObject[i].id == categoryID){
                    return categoriesObject[i].color;
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
            $('.clickedWord').removeClass('clickedWord');
            rootScope.selectedTokensArray = [];
            $(event.toElement).attr('parent-index',scope.selCtrl.lineId);
            var tokenToPush = event.toElement.outerHTML;
            $(tokenToPush).attr('parent-index',rootScope.clckedLine);

            rootScope.selectedTokensArray.push(tokenToPush);
            $(event.toElement).addClass('clickedWord');
        }

        function handleClickOnAlreadyClickedToken(event,isShiftPressed,isCtrlPressed,rootScope){
            if(!isShiftPressed && !isCtrlPressed){
                rootScope.selectedTokensArray = [];
                $('.clickedWord').removeClass('clickedWord');
            }else{
                $(event.toElement).removeClass('clickedWord')
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
            $(event.toElement).addClass('clickedWord');
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
            $('.clickedWord').removeClass('clickedWord');
            $(event.toElement).attr('parent-index',scope.selCtrl.lineId);
            rootScope.selectedTokensArray = [];
            rootScope.selectedTokensArray.push(event.toElement.outerHTML);
            $(event.toElement).addClass('clickedWord');
        }

        function handleSecondClickOnTokenWhenShiftPressed(event,scope,rootScope){
            // $(event.toElement).attr('parent-index',scope.selCtrl.lineId);
            // rootScope.selectedTokensArray.push(event.toElement.outerHTML);

            var wordIndex = parseInt($(event.toElement).attr('data-wordid').split('-')[1]);
            var allWordsArray = $('#row-'+scope.selCtrl.selectedRow).find('.selectable-word');

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
                if($(rowID).find('.'+$(allWordsArray[i]).attr('data-wordid')).hasClass('clickedWord')){
                    break;
                }else{
                    $(allWordsArray[i]).attr('parent-index',scope.selCtrl.lineId);
                    rootScope.selectedTokensArray.push(allWordsArray[i].outerHTML);
                    // $(rootScope.selectedTokensArray[rootScope.selectedTokensArray.length-1]).attr('parent-index',rootScope.clckedLine);
                    $(allWordsArray[i]).addClass('clickedWord');
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
                if($(rowID).find('.'+$(allWordsArray[i]).attr('data-wordid')).hasClass('clickedWord')){
                    break;
                }else{
                    $(allWordsArray[i]).attr('parent-index',scope.selCtrl.lineId);
                    rootScope.selectedTokensArray.push(allWordsArray[i].outerHTML);
                    $(allWordsArray[i]).addClass('clickedWord');
                }
            }
        }

        // SelectedWordsController.$inject = [];

        function SelectedWordsController($uibModal) {
            // Injecting $scope just for comparison
            var selCtrl = this;
            selCtrl.toggleAnnotationUnitView = toggleAnnotationUnitView;
            selCtrl.unitIsCollapsed = false;

            function toggleAnnotationUnitView(element){
                var currentTarget =element.currentTarget;
                var annotationUnitContainer = $(currentTarget).next().find('.categorized-words');

                $(annotationUnitContainer).toggleClass( "closed-annotation-unit" );
                selCtrl.unitIsCollapsed = !selCtrl.unitIsCollapsed;
            }
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
                            //TODO - sort the array
                            selCtrl.currentUnitRemoteInstancesIds.sort(sortIndexes);
                            for(var i=0; i<selCtrl.currentUnitRemoteInstancesIds.length ; i++){
                                DataService.deleteFromTree(selCtrl.currentUnitRemoteInstancesIds[i])
                            }
                            selCtrl.updateUI();
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
            $(initObject.elem).find('.square-color').css('background-color',initObject.rootScope.currentCategoryColor);

            /**
             * Append the wrapped line into the container
             */
            var previewLine = initObject.WordsWrapperService.wrapWords(initObject.scope.selCtrl.previewLine,false,initObject.scope.selCtrl.lineId);
            $(initObject.elem).find('.text').append(previewLine);

            /**
             * Set the on click function and parent-color attribute
             */
            $(initObject.elem).find('.selectable-word').on('mousedown',initObject.wordClicked);
            $(initObject.elem).on('mousedown',initObject.rowClicked);

            $(initObject.elem).find('.selectable-word').attr('parent-color',initObject.rootScope.currentCategoryColor);

            initObject.rootScope.selectedTokensArray = [];

            if(initObject.scope.selCtrl.control == undefined){
                initObject.scope.selCtrl.control = [];
            }

            // $(initObject.elem).find('.selectable-word').mousedown(initObject.wordClicked);
            // $(initObject.elem).find('.selectable-word').mouseup(function(){
            //     console.log("vsdvsdv");
            //     initObject.HotKeysManager.setMouseMode(false)
            // });

            var controlObject = {
                moveRight: initObject.moveRight,
                moveLeft: initObject.moveLeft,
                moveDown: initObject.moveDown,
                moveUp: initObject.moveUp,
                spacePressed:initObject.spacePressed,
                toggleCategory: initObject.toggleCategory,
                moveRightWithCtrl: initObject.moveRightWithCtrl,
                moveLeftWithCtrl: initObject.moveLeftWithCtrl,
                moveRightWithShift: initObject.moveRightWithShift,
                addAsRemoteUnit:initObject.addAsRemoteUnit,
                moveLeftWithShift: initObject.moveLeftWithShift,
                deleteFromTree: initObject.deleteFromTree,
                index: initObject.scope.selCtrl.lineId
            }

            if(initObject.scope.selCtrl.lineId.toString().split("-").length > 1){
                var parent = initObject.scope.$parent;
                while(parent.selCtrl == undefined || parent.selCtrl.lineId.toString().split("-").length > 1){
                    parent = parent.$parent;
                }
                parent.selCtrl.control.push(controlObject)
            }else{
                initObject.scope.selCtrl.control.push(controlObject);
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

        function splitStringByDelimiter(stringToSplit,del){
            return stringToSplit.toString().split(del);
        }
        function resetSelectedCategoryInfo(){
            delete $rootScope.currentCategoryID;
            delete $rootScope.currentCategoryColor;
            delete $rootScope.currentCategoryAbbreviation;
            delete $rootScope.currentCategoryName;
        }




    }

})();