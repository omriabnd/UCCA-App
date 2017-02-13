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
    function DefinitionsController($scope,$rootScope, DataService, $timeout, $compile) {
        // Injecting $scope just for comparison
        var defCtrl = this;

        defCtrl.highLightSelectedWords = highLightSelectedWords;
        defCtrl.addImplicitUnit = addImplicitUnit;
        
        function addImplicitUnit(){
            if(DataService.unitType == 'REMOTE'){
                var objToPush = {
                    rowId : '',
                    text : '<span>IMPLICIT UNIT</span>',
                    numOfRows: 0,
                    categories:[{color:defCtrl.definitionDetails.color}],
                    comment:"",
                    rowShape:'',
                    unitType:'IMPLICIT',
                    usedAsRemote:[],
                    children_tokens:[],
                    containsAllParentUnits: false,
                    Rows : [

                    ]
                };

                var newRowId = DataService.insertToTree(objToPush,$rootScope.clckedLine);
                // DataService.getUnitById($rootScope.clckedLine).usedAsRemote.push(newRowId);

                $timeout(function(){
                    $scope.$apply();
                    DataService.unitType = 'REGULAR';
                    $('#'+$rootScope.clickedUnit).toggleClass('highlight-unit');
                    $('.annotation-page-container').toggleClass('crosshair-cursor');
                    $( ".unit-wrapper" ).attr('onclick','').unbind('click');
                    $( ".selectable-word" ).attr('onclick','').unbind('click');
                    $( ".selectable-word" ).on('click',$rootScope.wordClicked);
                    $( ".directive-info-data-container" ).attr('onclick','').unbind('click');
                    $( ".directive-info-data-container" ).on('click',$rootScope.rowClicked);
                },0);

                console.log(newRowId);
                $compile($('.text-wrapper'))($rootScope);
            }
        }

        function highLightSelectedWords(color) {

            // $('.clickedWord').css('border','3px solid '+ defCtrl.definitionDetails.color);
            // $('.clickedWord').removeClass('clickedWord');

            $rootScope.currentCategoryID = defCtrl.definitionDetails.id;
            $rootScope.selectedTokensArray.sort(sortSelectedWordsArrayByWordIndex);
            if($rootScope.selectedTokensArray.length > 0){
                $rootScope.clckedLine = $rootScope.parseSelectedWords($rootScope.clckedLine);
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