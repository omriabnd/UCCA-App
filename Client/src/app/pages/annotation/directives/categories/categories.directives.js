(function() {
    'use strict';

    angular
        .module('zAdmin.annotation.directives')
        .directive('categoriesDirective',categoriesDirective);




    function categoriesDirective() {
        var directive = {
            restrict:'E',
            templateUrl:'app/pages/annotation/directives/categories/categories.html',
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

        function linkDefinitions($scope, elem, attrs) {
            $($(elem).children().children()[0]).css('background-color',$scope.defCtrl.definitionDetails.backgroundColor);
        }


    }

    /** @ngInject */
    function DefinitionsController($scope,$rootScope,DataService, $timeout, $uibModal, restrictionsValidatorService,Core) {
        // Injecting $scope just for comparison
        var defCtrl = this;

        defCtrl.highLightSelectedWords = highLightSelectedWords;
        defCtrl.showCategoryInfo = showCategoryInfo;
        
        function highLightSelectedWords(color) {

            // $('.clickedToken').css('border','3px solid '+ defCtrl.definitionDetails.color);
            // $('.clickedToken').removeClass('clickedToken');

            var parentUnitId = $rootScope.clckedLine;
            // parentUnitId = parentUnitId.length == 1 ? parentUnitId[0] : parentUnitId.slice(1,parentUnitId.length).join('-');
            var parenUnit = DataService.getUnitById(parentUnitId);
            parentUnitId = '#row-'+parentUnitId;
            var parentUnitDomElement = $(parentUnitId);

            var unitContainsAllParentUnitTokens = parentUnitDomElement.children().length-1 == $rootScope.selectedTokensArray.length;

            if(!(parenUnit.containsAllParentUnits && unitContainsAllParentUnitTokens)){
                $rootScope.currentCategoryID = defCtrl.definitionDetails.id;
                $rootScope.currentCategoryColor = defCtrl.definitionDetails.color || 'rgb(0,0,0)';
                $rootScope.currentCategoryBGColor = defCtrl.definitionDetails.backgroundColor || 'rgb(0,0,0)';
                $rootScope.currentCategoryIsRefined = defCtrl.definitionDetails.refinedCategory;
                $rootScope.currentCategoryAbbreviation = defCtrl.definitionDetails.abbreviation;
                $rootScope.currentCategoryName = defCtrl.definitionDetails.name;
                $rootScope.selectedTokensArray.sort(sortSelectedWordsArrayByWordIndex);

                var selectedUnits =  ($rootScope.clickedUnit != undefined && $rootScope.clickedUnit.includes('unit-wrapper') && $rootScope.selectedTokensArray.length === 1 );

                if(!selectedUnits && $rootScope.selectedTokensArray.length > 0){
                    $rootScope.clckedLine = $rootScope.callToSelectedTokensToUnit($rootScope.clckedLine,unitContainsAllParentUnitTokens);
                    DataService.updateDomWhenInsertFinishes();
                }else{
                    if(selectedUnits){
                        //The user has selected 1 unit box need to toggle category.
                        $rootScope.clckedLine = $rootScope.clickedUnit.split('unit-wrapper-'+$rootScope.clckedLine+'-')[1];

                    }
                    if(checkIfRowWasClicked($rootScope)){
                        $rootScope.addCategoryToExistingRow();
                    }
                }
                $rootScope.lastSelectedWordWithShiftPressed = undefined;
            }
        }

        function preventIfPanctuation() {
            var isPunc = false;
            if($rootScope.selectedTokensArray.length == 1 && $rootScope.selectedTokensArray[0]){
                // check if the selected token is pangtuation
                var currentTokenId = $($rootScope.selectedTokensArray[0]).attr('token-id');
                var currentToken = DataService.hashTables.tokensHashTable[currentTokenId]
                if(currentToken.require_annotation==false){
                    console.log("Punctuation",currentToken);
                    Core.showAlert("The token is not for annotate");
                    isPunc = true;
                }
            }
            return isPunc;
        }

        function showCategoryInfo(categoryINdex) {
            $uibModal.open({
                animation: true,
                templateUrl: 'app/pages/annotation/templates/categoryInfo.html',
                size: 'lg',
                controller: function($scope,$sce){
                    $scope.name = defCtrl.definitionDetails.name;
                    if(defCtrl.definitionDetails.description){
                        $scope.description = $sce.trustAsHtml(defCtrl.definitionDetails.description);
                    }
                }
            });
        };
        
        /**
         * Use the object's 'data-wordid' attribute in order to sorts the array in ascending order.
         * @param a,b - array elements.
         * @returns {number}
         */
        function sortSelectedWordsArrayByWordIndex(a,b){
            // var aIndex = parseInt($(a).attr('data-wordid').split('-')[1]);
            // var bIndex = parseInt($(b).attr('data-wordid').split('-')[1]);
            var aIndex = $rootScope.getTokenIdFromDomElem(a);
            var bIndex = $rootScope.getTokenIdFromDomElem(b);
            if(aIndex < bIndex){
                return -1;
            }
            if(aIndex > bIndex){
                return 1;
            }
            return 0;
        }
    }



    function checkIfRowWasClicked(rootScope){
        return rootScope.clckedLine != undefined && rootScope.clckedLine != '0';
    }

    


})();