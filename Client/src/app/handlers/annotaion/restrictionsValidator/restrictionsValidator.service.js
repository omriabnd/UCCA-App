

/* Copyright (C) 2017 Omri Abend, The Rachel and Selim Benin School of Computer Science and Engineering, The Hebrew University. */
(function () {
    'use strict';

    angular.module('zAdmin.restrictionsValidator',[
        'zAdmin.const'
    ])
        .service('restrictionsValidatorService', restrictionsValidatorService);

    /** @ngInject */
    function restrictionsValidatorService($timeout,$rootScope,$location,ENV_CONST,$uibModal,Core, $document) {
        /*
            %NAME%, %NAME_1%, %NAME_2%
            will change to the category name in the alert modal
        */
        var errorMessages ={
            FORBID_ANY_CHILD : 'Category %NAME% cannot have any child.',
            FORBID_CHILD : 'Category %NAME_1% cannot have child with category %NAME_2%.',
            FORBID_SIBLING: 'Category %NAME_1% cannot have sibling with category %NAME_2%.',
            REQUIRE_SIBLING: 'Category %NAME_1% requires one of the following categories : %NAME_2% as a sibling.',
            REQUIRE_CHILD: 'Category %NAME_1% requires one of the following categories : %NAME_2% as a child.',
            UNIT_CONTAIN_ONLY_PUNCTUATIONS : 'You cannot create annotation unit from only punctuation tokens',
            NOT_COMPLETE : "All non-punctuation tokens must either be in a unit of their own or in an unanalyzable unit.",
            UNIT_FORBID_SLOTTED_LAYER_RULE: "Both slots are already occupied.",
            NONRELEVANT_UNIT: "None of the categories of the unit are being refined in this layer.",
            NONRELEVANT_PARENT_CATEGORY: "Category %NAME_1% is not a valid refinement of category %NAME_2%.",
            NO_VALID_CATEGORY: "All units must have at least one non-default category",
            SLOT_ONE_RESTRICTION_VIOLATION: "All units in a slotted layer must have a category in their slot #1",
            FORBID_ANY_CHILD_ADD_CATEGORY: "Unanalyzable units cannot have any sub-units"
        };
        var selectionHandlerServiceProvider;
        var restrictionsTablesIds;
        var handler = {
          initRestrictionsTables: initRestrictionsTables,
          checkRestrictionsBeforeInsert: checkRestrictionsBeforeInsert,
          checkRestrictionsOnFinish: checkRestrictionsOnFinish,
          evaluateFinishAll: evaluateFinishAll,
          evaluateSubmissionRestrictions: evaluateSubmissionRestrictions,
          getTables: getTables
        };
        return handler;
        
        function getTables(){
            return restrictionsTablesIds;
        }

        function initRestrictionsTableObject(){
            restrictionsTablesIds = {
                FORBID_ANY_CHILD: [],
                FORBID_CHILD:[],
                FORBID_SIBLING:[],
                REQUIRE_CHILD: [],
                REQUIRE_SIBLING:[]
            };
        }
        

        function initRestrictionsTables(layer_restrictions,selectionHandlerService){
            initRestrictionsTableObject();
            layer_restrictions.forEach(function(restriction){
                addRestrictionToTable(restriction);
            });
            selectionHandlerServiceProvider = selectionHandlerService;
        }

        function addRestrictionToTable(restriction){
            var categories_1 = restriction.categories_1[0].id ? restriction.categories_1 : JSON.parse(restriction.categories_1.replace(/'/g,'"'));
            var categories_2 = restriction.categories_2[0] ? restriction.categories_2[0].id ? restriction.categories_2 : JSON.parse(restriction.categories_2.replace(/'/g,'"')) : [];
            switch(restriction.type){
                case 'FORBID_ANY_CHILD':
                    categories_1.forEach(function(category_1){
                        restrictionsTablesIds.FORBID_ANY_CHILD.push(category_1.id);

                    });
                    break;
                default:
                    categories_1.forEach(function(category_1){
                        restrictionsTablesIds[restriction.type][category_1.id] = [];
                        categories_2.forEach(function(category_2){
                            restrictionsTablesIds[restriction.type][category_1.id].push(category_2.id);
                        });
                    });
                    break;
            }
        }


        /**
         * Returns true iff none of the restrictions for annotationUnit's sub-tree
         * has been violated.
         * @param annotationUnit
         * @param parentUnit
         * @param hashTables
         * @returns {boolean}
         */
        function checkRestrictionsOnFinish(annotationUnit) {
            for (var i = 0; i < annotationUnit.AnnotationUnits.length; i++) {
                if (!checkRestrictionsOnFinish(annotationUnit.AnnotationUnits[i])) {
                    return false;
                }
            }
            return checkRestrictionsOnFinishLocal(annotationUnit);
        }

        /**
         * Runs the finish tests on the annotationUnit, w/o recursive call.
         * Returns null if successful, otherwise returns the violation.
         */
        function checkRestrictionsOnFinishLocal(annotationUnit) {
            var violation;

            if (annotationUnit.tree_id !== '0') {
                violation = unitViolatesSlotOneRestriction(annotationUnit);
                if (violation) {
                    showErrorModal(errorMessages[violation.rcode] + ' (failed in unit ' + annotationUnit.tree_id + ')');
                    return false;
                }

                violation = unitHasNonDefaultCategory(annotationUnit);
                if (violation) {
                    showErrorModal(errorMessages[violation.rcode] + ' (failed in unit ' + annotationUnit.tree_id + ')');
                    return false;
                }

                violation = checkIfVoilateEachTokenInUnit(annotationUnit);
                if (violation) {
                    showErrorModal(errorMessages[violation.rcode]+' (failed in unit '+annotationUnit.tree_id+')');
                    return false;
                }
            }


            violation = unitViolatesSiblingAndChildrenRestrictions(annotationUnit);
            if (violation) {
                showErrorModal(errorMessages[violation.rcode]+' (failed in unit '+annotationUnit.tree_id+')');
                return false;
            }

            return true;
        }


        /**
         * Validates that the children of annotationUnit obey the
         * REQUIRE_SIBLING and FORBID_SIBLING restrictions among themselves.
         * Also checks that it obeys the REQUIRE_CHILD and FORBID_CHILD restrictions between
         * annotationUnit and its children.
         * Returns a violation object in case of violation or null if valid.
         * @param annotationUnit
         * @returns violation
         */
        function unitViolatesSiblingAndChildrenRestrictions(annotationUnit) {

            var violation = null;

            // extract all the categories of the siblings
            var children_category_ids = getChildrenCategories(annotationUnit);

            for (var i=0; i< children_category_ids.length; i++) {
                var cur_category_id = children_category_ids[i];

                //check FORBID_SIBLING restrictions
                if (cur_category_id in restrictionsTablesIds['FORBID_SIBLING']) {
                    var conflicting_category_ids = Core.intersectArrays(restrictionsTablesIds['FORBID_SIBLING'][cur_category_id], children_category_ids);
                    if (conflicting_category_ids.length > 0) {
                        violation = new Object();
                        violation.category1 = cur_category_id;
                        violation.category2 = conflicting_category_ids[0];
                        violation.rcode = 'FORBID_SIBLING';
                        return violation;
                    }
                }

                //check REQUIRE_SIBLING restrictions
                if (cur_category_id in restrictionsTablesIds['REQUIRE_SIBLING']) {
                    var required_category_ids = restrictionsTablesIds['REQUIRE_SIBLING'][cur_category_id];
                    if (Core.intersectArrays(required_category_ids, children_category_ids).length == 0) {
                        violation = new Object();
                        violation.category1 = cur_category_id;
                        violation.category2 = required_category_ids;
                        violation.rcode = 'REQUIRE_SIBLING';
                        return violation;
                    }
                }
            }

            if (annotationUnit.tree_id !== '0') {
                for (var i = 0; i < annotationUnit.categories.length; i++) {
                    var cur_parent_category_id = annotationUnit.categories[i].id;

                    if (cur_parent_category_id in restrictionsTablesIds['FORBID_CHILD']) {
                        var conflicting_category_ids = Core.intersectArrays(restrictionsTablesIds['FORBID_CHILD'][cur_parent_category_id], children_category_ids);
                        if (conflicting_category_ids.length > 0) {
                            violation = new Object();
                            violation.category1 = cur_parent_category_id;
                            violation.category2 = conflicting_category_ids[0];
                            violation.rcode = 'FORBID_CHILD';
                            return violation;
                        }
                    }

                    if (cur_parent_category_id in restrictionsTablesIds['REQUIRE_CHILD']) {
                        var required_category_ids = restrictionsTablesIds['REQUIRE_CHILD'][cur_parent_category_id];
                        if (Core.intersectArrays(children_category_ids, required_category_ids).length == 0) {
                            violation = new Object();
                            violation.category1 = cur_parent_category_id;
                            violation.category2 = required_category_ids;
                            violation.rcode = 'REQUIRE_CHILD';
                            return violation;
                        }
                    }
                }
            }
            return violation;
        }


        /**
         * Returns an array of the indices of all categories its children have (regular, remote or implicit)
         * @param parentAnnotationUnit
         */
        function getChildrenCategories(parentAnnotationUnit) {
            var children_categories = new Array();

            for(var i=0; i< parentAnnotationUnit.AnnotationUnits.length; i++) {
                var cur_unit = parentAnnotationUnit.AnnotationUnits[i];
                for (var j=0; j < cur_unit.categories.length; j++) {
                    var cur_cat = cur_unit.categories[j].id;
                    if (!children_categories.includes(cur_cat)) {
                        children_categories.push(cur_cat);
                    }
                }
            }
            return children_categories;
        }


        /**
         * Checks the restrictions that are applicable before creating a unit:
         * 1. If the unit is unanalyzable, you cannot create a sub-unit for it
         * 2. If the unit is unanalyzable, you cannot create it by grouping units
         * 3. If the unit has one token, you can only create a sub-unit out of it once
         * 4. If grouped tokens are only punctuation, you cannot create a unit just from them.
         */
        function checkRestrictionsBeforeInsert(parentAnnotationUnit, newAnnotationUnit, newCategory){

            // check if both slots are full in a slotted  unit
            if(checkSlottedLayerProjectRestriction(newAnnotationUnit)){
                 showErrorModal(errorMessages['UNIT_FORBID_SLOTTED_LAYER_RULE']);
                 return false;
            }
            if (newAnnotationUnit.unitType !== "IMPLICIT" && doesUnitContainsOnlyPunctuation(newAnnotationUnit)) {
               showErrorModal(errorMessages['UNIT_CONTAIN_ONLY_PUNCTUATIONS']);
               return false;
            }

            //check if parent is unanalyzable
            if (isUnanalyzableUnit(parentAnnotationUnit)) {
                showErrorModal(errorMessages['FORBID_ANY_CHILD']);
                return false;
            }

            //check if child is unanalyzable but has children
            if (newAnnotationUnit.AnnotationUnits && newAnnotationUnit.AnnotationUnits.length > 0 &&
                (isUnanalyzableUnit(newAnnotationUnit) || (newCategory && restrictionsTablesIds['FORBID_ANY_CHILD'].includes(newCategory.id)))) {
                showErrorModal(errorMessages['FORBID_ANY_CHILD_ADD_CATEGORY']);
                return false;
             }


             if (checkIfUnitIsRefinableInRefinementLayer(newAnnotationUnit, newCategory)) {
                showErrorModal(errorMessages['NONRELEVANT_UNIT']);
                return false;
             }

             if (checkIfRefinementCategoryIsChildOfParentCategory(newAnnotationUnit, newCategory)) {
                showErrorModal(errorMessages['NONRELEVANT_PARENT_CATEGORY']);
                return false;
             }



             return true;
        }


        function checkIfUnitIsRefinableInRefinementLayer(unit, newCategory){
        	//TODO: bug. it should be that one of the categories of the parent obeys the restriction, not necessarirly the first one
            var parentCategory = unit.categories[0];
        	if($rootScope.isRefinementLayerProject && !!newCategory && !newCategory.fromParentLayer && !parentCategory.refinedCategory){
        		return {"unit": unit.tree_id, "category": parentCategory.name};
        	}else{
        		return null;
        	}
        }
        
        function checkIfRefinementCategoryIsChildOfParentCategory(unit, newCategory){
        	//TODO: bug. it should be that one of the categories of the parent obeys the restriction, not necessarirly the first one
            var parentCategory = unit.categories[0];
        	if($rootScope.isRefinementLayerProject && !!newCategory && !newCategory.fromParentLayer && parentCategory.id !== newCategory.parent.id){
        		return {"refinement": newCategory.name, "parent": parentCategory.name};
        	}else{
        		return null;
        	}
        }
        
        function checkSlottedLayerProjectRestriction(unit){
            if( $rootScope.isSlottedLayerProject ){
               if(unit.slotOne && unit.slotTwo){
                  return true;
               }
            }
            return false;
        }

        function doesUnitContainsOnlyPunctuation(newAnnotationUnit){
            return newAnnotationUnit.children_tokens.every(function(token){
                return !token.static.require_annotation;
            });
        }


        /**
         * Checks if there is a category in slot 1 OR it's a refinement layer than there are no refined
         * category for a unit. If both don't hold, return null.
         * @param annotationUnit
         * @returns {*}
         */
        function unitViolatesSlotOneRestriction(annotationUnit) {
            if (!$rootScope.isSlottedLayerProject) {
                return null;
            }
            if (annotationUnit.slotOne) {
                return null;
            }


            var hasRefinedCategory = annotationUnit.categories.some(function(category) {
                return category.refinedCategory;
            });
            if ($rootScope.isRefinementLayerProject && hasRefinedCategory) {
                return {rcode: "SLOT_ONE_RESTRICTION_VIOLATION"};
            }
            return null; //formerly "NO_VALID_CATEGORY"
        }


        /*
         * Validates that either of the following holds:
         * 1. annotationUnit is unanalyzable
         * 2. annotationUnit has one non-punctuation token
         * 3. all tokens are in a unit
         */
        function checkIfVoilateEachTokenInUnit(annotationUnit) {

            var numOfNonPuctuationTokens = annotationUnit.tokens.filter(function (token) {
                return token.static.require_annotation === false;
            });

            // if unit has one non-punctuation token
            if (annotationUnit.tokens.length - numOfNonPuctuationTokens.length === 1) {
                return false;
            }

            // if unit is unanalyzable
            if (isUnanalyzableUnit(annotationUnit)) {
                return false;
            }

            if (checkIfAllTokenThatRequireAnnotationIsInUnit(annotationUnit)) {
                return false;
            }

            return {rcode: "NOT_COMPLETE"}
        }


        /**
         * Returns true if annotationUnit has a category with 'FORBID_ANY_CHILD' restriction.
         * @param annotationUnit
         */
        function isUnanalyzableUnit(annotationUnit) {
            if (annotationUnit.tree_id === '0') {
                return false;
            }
            for (var i = 0; i < annotationUnit.categories.length; i++) {
                if (restrictionsTablesIds["FORBID_ANY_CHILD"].includes(annotationUnit.categories[i].id)) {
                    return true;
                }
            }
            return false;
        }

        function evaluateFinishAll(mainPassage) {
            return checkRestrictionsOnFinish(mainPassage);
        }

        function evaluateSubmissionRestrictions(mainPassage) {
            if (!evaluateFinishAll(mainPassage)) {
                return false;
            }
            if (!checkIfAllTokenThatRequireAnnotationIsInUnit(mainPassage)) {
                showErrorModal(errorMessages['NOT_COMPLETE']);
                return false;
            }
            return true;
        }

        /**
         * Returns true if all non-puncutation tokens in annotationUnit are inside a sub-unit.
         * @param annotationUnit
         * @returns {boolean}
         */
        function checkIfAllTokenThatRequireAnnotationIsInUnit(annotationUnit){
            for (var i=0; i < annotationUnit.tokens.length; i++) {
                var token = annotationUnit.tokens[i];
                if (!token.inChildUnitTreeId && token.static.require_annotation) {
                    return false;
                }
            }
            return true;
        }


        /**
         * Checks if unit has at least one category
         * @param parentUnit
         * @param categories_hash
         */
        function unitHasNonDefaultCategory(curUnit,categories_hash){
            var hasNonDefault = false;
            for (var i=0; i < curUnit.categories.length; i++) {
                if (!curUnit.categories[i].was_default) {
                    hasNonDefault = true;
                    break
                }
            }
            if (!hasNonDefault) {
                return {rcode: "NO_VALID_CATEGORY"};
            }
            return null;
        }


        function showErrorModal(message, violationUnit){
            $uibModal.open({
                animation: true,
                templateUrl: 'app/pages/annotation/templates/errorModal.html',
                size: 'md',
                controller: function($scope){
                    $scope.message = message;
                }
            });
            
            violationUnit ? scrollToViolationUnit(selectionHandlerServiceProvider,violationUnit) : '';
        }
        
        function scrollToViolationUnit(selectionHandlerServiceProvider,violationUnit){

            if (!violationUnit.parentId){
               violationUnit.parentId = violationUnit.unitTreeId; // tree_id
            }

            // In the past- scroll had done to violationUnit.parentId
            selectionHandlerServiceProvider.updateSelectedUnit(violationUnit.parentId);

            Core.scrollToUnit(violationUnit.parentId);
        }


    }


})();

