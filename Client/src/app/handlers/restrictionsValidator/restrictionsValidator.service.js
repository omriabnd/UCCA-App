

(function () {
    'use strict';

    angular.module('zAdmin.restrictionsValidator',[
        'zAdmin.const'
    ])
        .service('restrictionsValidatorService', restrictionsValidatorService);

    /** @ngInject */
    function restrictionsValidatorService($timeout,$rootScope,$location,ENV_CONST,$uibModal) {
        /*
            %NAME%, %NAME_1%, %NAME_2% 
            will change to the category name in the alert modal
        */
        var errorMasseges ={
            FORBID_ANY_CHILD : 'category %NAME% cannot have any child.',
            FORBID_CHILD : 'category %NAME_1% cannot have child with category %NAME_2%.',
            FORBID_SIBLING: 'category %NAME_1% cannot have sibling with category %NAME_2%.',
            REQUIRE_CHILD: 'category %NAME_1% must have a child with category %NAME_2%..',
            UNIT_CONTAIN_ONLY_PUNCTUATIONS : 'You cannot create annotation unit from only punctuation tokens'
        };
        var restrictionsTables;
        var handler = {
          initRestrictionsTables: initRestrictionsTables,
          checkRestrictionsBeforeInsert: checkRestrictionsBeforeInsert,
          checkRestrictionsOnFinish: checkRestrictionsOnFinish,
          evaluateFinishAll: evaluateFinishAll
        };
        return handler;

        function initRestrictionsTableObject(){
            restrictionsTables = {
                FORBID_ANY_CHILD: {},
                FORBID_CHILD:{},
                FORBID_SIBLING:{},
                REQUIRE_CHILD: {},
                REQUIRE_SIBLING:{}
            };
        }

        function initRestrictionsTables(layer_restrictions){
            initRestrictionsTableObject();
            console.log(layer_restrictions);
            layer_restrictions.forEach(function(restriction){
                addRestrictionToTable(restriction);
            });
            console.log(restrictionsTables);

        }

        function addRestrictionToTable(restriction){
            var categories_1 = JSON.parse(restriction.categories_1.replace(/'/g,'"'));
            var categories_2 = JSON.parse(restriction.categories_2.replace(/'/g,'"'));
            switch(restriction.type){
                case 'FORBID_ANY_CHILD':
                    categories_1.forEach(function(category_1){
                        restrictionsTables.FORBID_ANY_CHILD[category_1.id] = 'All'
                    });
                    break;
                default:
                    categories_1.forEach(function(category_1){
                        restrictionsTables[restriction.type][category_1.id] = {};
                        categories_2.forEach(function(category_2){
                            restrictionsTables[restriction.type][category_1.id][category_2.id] = category_2.name;
                        });
                    });
                    break;
            }
        }

        function checkRestrictionsBeforeInsert(parentAnnotationUnit, newAnnotationUnit,tokensHashTable){
            var result = doesUnitContainsOnlyPunctuation(newAnnotationUnit,tokensHashTable);
            if(result){
                var msg = errorMasseges['UNIT_CONTAIN_ONLY_PUNCTUATIONS'];
                showErrorModal(msg);
                return false;
            }
            result = checkIfUnitViolateForbidAnyChildRestriction(parentAnnotationUnit);
            if(result){
                var replacements  = {"%NAME%":result.name};
                var msg = errorMasseges['FORBID_ANY_CHILD'].replace(/%\w+%/g, function(all) {
                    return replacements[all] || all;
                });
                showErrorModal(msg);
                return false;
            }
            result = checkIfUnitViolateForbidChildRestriction(parentAnnotationUnit,newAnnotationUnit);
            if(result){
                var replacements  = {"%NAME_1%":result[0].name, "%NAME_2%":result[1].name};
                var msg = errorMasseges['FORBID_CHILD'].replace(/%\w+%/g, function(all) {
                    return replacements[all] || all;
                });
                showErrorModal(msg);
                return false;
            }
            result = checkIfUnitViolateForbidSiblingRestriction(parentAnnotationUnit,newAnnotationUnit);
            if(result){
                var replacements  = {"%NAME_1%":result[0].name, "%NAME_2%":result[1].name};
                var msg = errorMasseges['FORBID_SIBLING'].replace(/%\w+%/g, function(all) {
                    return replacements[all] || all;
                });
                showErrorModal(msg);
                return false;
            }
            return true;
        }
        
        function doesUnitContainsOnlyPunctuation(newAnnotationUnit,tokensHashTable){
            var isOnlyPunc = true;
            newAnnotationUnit.children_tokens.forEach(function(token){
                var currentToken = tokensHashTable[token.id];
                if(currentToken.require_annotation == true){
                    isOnlyPunc = false;
                }
            })
            return isOnlyPunc;
        }

        function checkIfUnitViolateForbidAnyChildRestriction(parentAnnotationUnit){
            if(parentAnnotationUnit.annotation_unit_tree_id != "0"){
                //Go through all of the parent annotation unit categories and check if they exists in the FORBID_ANY_CHILD restrictions table.
                for(var i=0; i< parentAnnotationUnit.categories.length; i++){
                    var currentCategory = parentAnnotationUnit.categories[i];
                    if(restrictionsTables['FORBID_ANY_CHILD'][currentCategory.id]){
                        return currentCategory;
                    }
                }
                return false;
            }
            return false;
        }

        function checkIfUnitViolateForbidChildRestriction(parentAnnotationUnit,newAnnotationUnit){
            if(parentAnnotationUnit.annotation_unit_tree_id != "0"){
                //Go through all of the parent annotation unit categories and check if they exists in the FORBID_CHILD restrictions table.
                for(var i=0; i< parentAnnotationUnit.categories.length; i++){
                    var currentCategory = parentAnnotationUnit.categories[i];
                    if(restrictionsTables['FORBID_CHILD'][currentCategory.id]){
                        for(var j=0; j< newAnnotationUnit.categories.length; j++){
                            var newAnnotationCurrentCategory = newAnnotationUnit.categories[j];
                            if(restrictionsTables['FORBID_CHILD'][currentCategory.id] && restrictionsTables['FORBID_CHILD'][currentCategory.id][newAnnotationCurrentCategory.id]){
                                return [currentCategory,newAnnotationCurrentCategory];
                            }
                        }
                    }
                }
                return false;
            }
            return false;
        }

        function checkIfUnitViolateForbidSiblingRestriction(parentAnnotationUnit,newAnnotationUnit){
            for(var i=0; i< parentAnnotationUnit.AnnotationUnits.length; i++){
                var currentAnnotationUnitChild = parentAnnotationUnit.AnnotationUnits[i];
                for(var j=0; j< currentAnnotationUnitChild.categories.length; j++){
                    var currentCategory = currentAnnotationUnitChild.categories[j];
                    for(var k=0; k< newAnnotationUnit.categories.length; k++){
                        var newAnnotationUnitCategory = newAnnotationUnit.categories[k];
                        if(restrictionsTables['FORBID_SIBLING'][currentCategory.id] && restrictionsTables['FORBID_SIBLING'][currentCategory.id][newAnnotationUnitCategory.id]){
                            return [currentCategory,newAnnotationUnitCategory];
                        }
                    }

                }
            }
            return false;
        }


        function checkRestrictionsOnFinish(annotationUnit){
            var result = checkIfUnitViolateRequireChildRestriction(annotationUnit);
            for(var i=0; i<annotationUnit.AnnotationUnits.length; i++){
                checkRestrictionsOnFinish(annotationUnit.AnnotationUnits[i]);
            }
            if(result){
                var replacements  = {"%NAME_1%": result.parentCategory.name, "%NAME_2%": result.unFoundCategory.name};
                var msg = errorMasseges['REQUIRE_CHILD'].replace(/%\w+%/g, function(all) {
                    return replacements[all] || all;
                });
                showErrorModal(msg);
                return false;
            }
            else {
                annotationUnit.gui_status = 'HIDDEN';
                return true;
            }
        }

        function checkIfUnitViolateRequireChildRestriction(annotationUnit){
            var result = false;
            for(var i=0; i< annotationUnit.categories.length; i++){
                //First of all go through all the unit categories, and look if there is any category that exists in the restrictionsTables['REQUIRE_CHILD'];
                var currentCategory = annotationUnit.categories[i];
                if(restrictionsTables['REQUIRE_CHILD'][currentCategory.id]){
                    //Prepare hash table that will hold the final result. whether we found all the required categories.
                    var categoriesIdToLookForFoundNotFoundTable = createCategoriesIdToLookForFoundNotFoundTable({
                        parentCategory: currentCategory,
                        childCategory:restrictionsTables['REQUIRE_CHILD'][currentCategory.id]
                    });

                    //Go over all the unit children and look for the required categories.
                    for(var j=0; j<annotationUnit.AnnotationUnits.length; j++){
                        var currentAnnotationUnitChild = annotationUnit.AnnotationUnits[j];

                        //Go over all the current child categories.
                        for(var k=0; k<currentAnnotationUnitChild.categories.length; k++){
                            var currentAnnotationUnitChildCategory = currentAnnotationUnitChild.categories[k];

                            if(categoriesIdToLookForFoundNotFoundTable.hasOwnProperty(currentAnnotationUnitChildCategory.id)){
                                categoriesIdToLookForFoundNotFoundTable[currentAnnotationUnitChildCategory.id].isFound = true;
                            }
                        }
                    }
                }
            }

            result = checkIfAllRequiredCategoriesWasFound(categoriesIdToLookForFoundNotFoundTable);
            if(result != false){
                console.log("annotationUnit " + annotationUnit.annotation_unit_tree_id + " is not valid");
                return result;
            }else{
                console.log("annotationUnit " + annotationUnit.annotation_unit_tree_id + " is valid");
                return result;
            }

        }

        function createCategoriesIdToLookForFoundNotFoundTable(requiredCategoriesObject){
            var table = {};
            for(var key in requiredCategoriesObject.childCategory){
                table[key] = {
                    isFound :false,
                    name: requiredCategoriesObject.childCategory[key],
                    parentCategory : requiredCategoriesObject.parentCategory
                }
            }
            return table;
        }

        function checkIfAllRequiredCategoriesWasFound(requiredCategoriesTable){
            for(var key in requiredCategoriesTable){
                if(!requiredCategoriesTable[key].isFound){
                    return {
                        unFoundCategory :requiredCategoriesTable[key],
                        parentCategory : requiredCategoriesTable[key].parentCategory
                    }
                }
            }
            return false;
        }


        function evaluateFinishAll(mainPassage){
            var evaluationResult;
            evaluationResult = checkIfAllPassageTokenThatRequireAnnotationIsInUnit(mainPassage);
            if(!evaluationResult){
                return false
            }else{
                for(var i=0; i<mainPassage.AnnotationUnits.length; i++){
                    evaluationResult = checkRestrictionsOnFinish(mainPassage.AnnotationUnits[i]);
                    if(!evaluationResult){
                        return false
                    }
                }
                return true;
            }

        }

        function checkIfAllPassageTokenThatRequireAnnotationIsInUnit(mainPassage){
            console.log(mainPassage);
            return true;
        }m
        function showErrorModal(message){
            $uibModal.open({
                animation: true,
                templateUrl: 'app/pages/annotation/templates/errorModal.html',
                size: 'md',
                controller: function($scope){
                    $scope.message = message;
                }
            });
        }
    }

})();
