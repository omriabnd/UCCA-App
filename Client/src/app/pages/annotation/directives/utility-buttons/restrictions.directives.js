(function() {
    'use strict';

    angular
        .module('zAdmin.annotation.directives')
        .directive('utilityButtonsDirective',utilityButtonsDirective);




    function utilityButtonsDirective() {
        var directive = {
            restrict:'E',
            templateUrl:'app/pages/annotation/directives/utility-buttons/restrictions.html',
            scope:{
                definitionDetails: '=',
                definitionId: '='
            },
            link: linkDefinitions,
            controller: DefinitionsController,
            controllerAs: 'defCtrl',
            bindToController: true

        };

        return directive;

        function linkDefinitions($scope, elem, attrs,selectedWords) {
            // $($(elem).children().children()[0]).css('background-color',$scope.defCtrl.definitionDetails.color);
        }


    }

    /** @ngInject */
    function DefinitionsController($scope,$rootScope, DataService, $timeout, $compile,selectionHandlerService) {
        // Injecting $scope just for comparison
        var defCtrl = this;

        defCtrl.highLightSelectedWords = highLightSelectedWords;
        defCtrl.addImplicitUnit = addImplicitUnit;
        defCtrl.unGroupUnit = unGroupUnit;
        
        $rootScope.addImplicitUnit = addImplicitUnit;

        function unGroupUnit(){
            selectionHandlerService.spacePressed();
        }


        function addImplicitUnit(){
            var selectedUnitId = selectionHandlerService.getSelectedUnitId();
            var selectedUnit = DataService.getUnitById(selectedUnitId);

            if(DataService.unitType === 'REGULAR' && selectedUnit.unitType !== "REMOTE" && selectedUnit.unitType !== "IMPLICIT"){
                var objToPush = {
                    rowId : '',
                    text : '<span>IMPLICIT UNIT</span>',
                    numOfAnnotationUnits: 0,
                    categories:[], // {color:defCtrl.definitionDetails.backgroundColor}
                    comment:"",
                    cluster:"",
                    rowShape:'',
                    unitType:'IMPLICIT',
                    orderNumber: '-1',
                    gui_status:'OPEN',
                    usedAsRemote:[],
                    children_tokens:[],
                    containsAllParentUnits: false,
                    tokens:[{
                        "text":"IMPLICIT UNIT",
                        "parentId":selectionHandlerService.getSelectedUnitId(),
                        "inChildUnit":null
                    }],
                    AnnotationUnits : [

                    ]
                };

                var newRowId = DataService.insertToTree(objToPush,selectionHandlerService.getSelectedUnitId());
                // DataService.getUnitById($rootScope.clckedLine).usedAsRemote.push(newRowId);

                // $timeout(function(){
                //     $scope.$apply();
                //     DataService.unitType = 'REGULAR';
                //     // $('#'+$rootScope.clickedUnit).toggleClass('highlight-unit');
                //     $("[unit-wrapper-id="+$rootScope.clickedUnit+"]").toggleClass('highlight-unit');
                //     $('.annotation-page-container').toggleClass('crosshair-cursor');
                //     $( ".unit-wrapper" ).attr('mousedown','').unbind('mousedown');
                //     $( ".selectable-word" ).attr('mousedown','').unbind('mousedown');
                //     $( ".selectable-word" ).on('mousedown',$rootScope.tokenClicked);
                //     $( ".directive-info-data-container" ).attr('mousedown','').unbind('mousedown');
                //     $( ".directive-info-data-container" ).on('mousedown',$rootScope.focusUnit);
                // },0);
                //
                // console.log(newRowId);
                // $compile($('.text-wrapper'))($rootScope);
            }
        }

        function highLightSelectedWords(color) {

            // $('.clickedToken').css('border','3px solid '+ defCtrl.definitionDetails.color);
            // $('.clickedToken').removeClass('clickedToken');

            $rootScope.currentCategoryID = defCtrl.definitionDetails.id;
            $rootScope.selectedTokensArray.sort(sortSelectedWordsArrayByWordIndex);
            if($rootScope.selectedTokensArray.length > 0){
                $rootScope.clckedLine = $rootScope.callToSelectedTokensToUnit($rootScope.clckedLine);
                DataService.updateDomWhenInsertFinishes();
                console.log($rootScope.clckedLine);
            }else{
                if(checkIfRowWasClicked($rootScope)){
                    $rootScope.addCategoryToExistingRow();
                }
            }

            $rootScope.lastSelectedWordWithShiftPressed = undefined;
            // $rootScope.clckedLine = '';
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


})();
