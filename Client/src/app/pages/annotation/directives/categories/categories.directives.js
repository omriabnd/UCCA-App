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
            $($(elem).children().children()[0]).css('background-color',$scope.defCtrl.definitionDetails.color);
        }


    }

    /** @ngInject */
    function DefinitionsController($scope,$rootScope,DataService, $timeout, $uibModal) {
        // Injecting $scope just for comparison
        var defCtrl = this;

        defCtrl.highLightSelectedWords = highLightSelectedWords;

        function highLightSelectedWords(color) {

            // $('.clickedWord').css('border','3px solid '+ defCtrl.definitionDetails.color);
            // $('.clickedWord').removeClass('clickedWord');

            var parentUnitId = $rootScope.clckedLine;
            // parentUnitId = parentUnitId.length == 1 ? parentUnitId[0] : parentUnitId.slice(1,parentUnitId.length).join('-');
            var parenUnit = DataService.getUnitById(parentUnitId);
            parentUnitId = '#row-'+parentUnitId;
            var parentUnitDomElement = $(parentUnitId);

            var unitContainsAllParentUnitTokens = parentUnitDomElement.children().length-1 == $rootScope.selectedTokensArray.length;

            if(!(parenUnit.containsAllParentUnits && unitContainsAllParentUnitTokens)){
                $rootScope.currentCategoryID = defCtrl.definitionDetails.id;
                $rootScope.currentCategoryColor = defCtrl.definitionDetails.color || 'rgb(0,0,0)';
                $rootScope.currentCategoryAbbreviation = defCtrl.definitionDetails.abbreviation;
                $rootScope.currentCategoryName = defCtrl.definitionDetails.name;
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
                $rootScope.lastSelectedWordWithShiftPressed = undefined;
            }
        }

        defCtrl.showCategoryInfo = function (categoryINdex) {
            $uibModal.open({
                animation: true,
                templateUrl: 'app/pages/annotation/templates/categoryInfo.html',
                size: 'lg',
                controller: function($scope){
                    $scope.name = defCtrl.definitionDetails.name;
                    $scope.description = defCtrl.definitionDetails.description;
                }
            });
        };
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