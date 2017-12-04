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
    function DefinitionsController($scope,$rootScope,DataService, $timeout, $uibModal, restrictionsValidatorService,Core,selectionHandlerService) {
        // Injecting $scope just for comparison
        var defCtrl = this;

        defCtrl.highLightSelectedWords = highLightSelectedWords;
        defCtrl.showCategoryInfo = showCategoryInfo;
        
        var restictionTables = restrictionsValidatorService.getTables();
        
        if(restictionTables['FORBID_ANY_CHILD'][defCtrl.definitionDetails.id] !== undefined){
           defCtrl.definitionDetails.forbidAnyChild = true;
        }else{
            defCtrl.definitionDetails.forbidAnyChild = false;
        }

        function highLightSelectedWords(color) {
        	
//        	this.preventIfNotRefined();
//        	this.preventIfPunctuation();

            var parentUnitId = $rootScope.clckedLine;
            var parenUnit = DataService.getUnitById(parentUnitId);
            parentUnitId = '#row-'+parentUnitId;
            var parentUnitDomElement = $(parentUnitId);

            selectionHandlerService.toggleCategory(defCtrl.definitionDetails);
        }
        
        function preventIfNotRefined() {
            var isNotRefined = false;
            if($rootScope.selectedTokensArray.length == 1 && $rootScope.selectedTokensArray[0]){
                // check if the selected unit is not refined
//                var currentTokenId = $($rootScope.selectedTokensArray[0]).attr('token-id');
//                var currentToken = DataService.hashTables.tokensHashTable[currentTokenId]
            	var currentUnitId = $rootScope.selectedUnit;
                var currentUnit = DataService.getUnitById(currentUnitId);
                if(currentUnit.categories[0].refinedCategory==false){
                    console.log("not refined",currentUnit.tokenCopy, currentUnit.categories[0].name);
                    Core.showAlert("{{currentUnit.tokenCopy}}: The category {{currentUnit.categories[0].name}} is not being refined in this layer");
                    isNotRefined = true;
                }
            }
            return isNotRefined;
        }

        function preventIfPunctuation() {
            var isPunc = false;
            if($rootScope.selectedTokensArray.length == 1 && $rootScope.selectedTokensArray[0]){
                // check if the selected token is punctuation
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