

/* Copyright (C) 2017 Omri Abend, The Rachel and Selim Benin School of Computer Science and Engineering, The Hebrew University. */
(function () {
    'use strict';

    angular.module('zAdmin.restrictionsValidator',[
        'zAdmin.const'
    ])
        .service('restrictionsValidatorService', restrictionsValidatorService);

    /** @ngInject */
    function restrictionsValidatorService($timeout,$rootScope,$location,ENV_CONST,$uibModal,Core, $document, $window) {
        /*
            %NAME%, %NAME_1%, %NAME_2%
            will change to the category name in the alert modal
        */
        var errorMessages ={
            FORBID_ANY_CHILD : 'Category %NAME% cannot have any children.',
            // FORBID_ANY_CHILD_ADD_CATEGORY: 'Category %NAME% cannot have any children.',
            FORBID_CHILD : 'Category %NAME_1% cannot have child with category %NAME_2%.',
            FORBID_SIBLING: 'Category %NAME_1% cannot have sibling with category %NAME_2%.',
            REQUIRE_SIBLING: 'Category %NAME_1% requires one of the following categories : [%NAME_2%] as a sibling.',
            REQUIRE_CHILD: 'Category %NAME_1% requires one of the following categories : [%NAME_2%] as a child.',
            NONRELEVANT_PARENT_CATEGORY: "Category %NAME_1% is not a valid refinement of category %NAME_2%.",
            UNIT_CONTAIN_ONLY_PUNCTUATIONS : 'You cannot create annotation unit from only punctuation tokens',
            FORBID_SUB_REMOTE_UNIT: "You cannot create unit from remote unit",
            NOT_COMPLETE : "All non-punctuation tokens must either be in a unit of their own or in an unanalyzable unit.",
            UNIT_FORBID_SLOTTED_LAYER_RULE: "Both slots are already occupied.",
            NONRELEVANT_UNIT: "None of the categories of the unit are being refined in this layer.",
            NO_VALID_CATEGORY: "All units must have at least one non-default category",
            SLOT_ONE_RESTRICTION_VIOLATION: "All units in a slotted layer must have a category in their slot #1"
        };
        var selectionHandlerServiceProvider;
        var dataServiceProvider;
        var restrictionsTablesIds;
        var allCategoriesTable;
        // var noConnection = false;
        var handler = {
            initRestrictionsTables: initRestrictionsTables,
            checkRestrictionsBeforeInsert: checkRestrictionsBeforeInsert,
            checkRestrictionsBeforeAddingCategory: checkRestrictionsBeforeAddingCategory,
            checkRestrictionsOnFinish: checkRestrictionsOnFinish,
            evaluateFinishAll: evaluateFinishAll,
            evaluateSubmissionRestrictions: evaluateSubmissionRestrictions,
            getTables: getTables
            // closeModal: closeModal
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


        function initRestrictionsTables(layer_restrictions,selectionHandlerService, dataService, categoriesArray){

            allCategoriesTable = {};
            for (var i=0; i < categoriesArray.length; i++) {
                allCategoriesTable[categoriesArray[i].id] = categoriesArray[i];
            }

            initRestrictionsTableObject();
            layer_restrictions.forEach(function(restriction){
                addRestrictionToTable(restriction);
            });
            selectionHandlerServiceProvider = selectionHandlerService;
            dataServiceProvider = dataService;
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
                    scrollToViolationUnit(selectionHandlerServiceProvider, dataServiceProvider, annotationUnit);
                    return false;
                }

                violation = unitHasNonDefaultCategory(annotationUnit);
                if (violation) {
                    showErrorModal(errorMessages[violation.rcode] + ' (failed in unit ' + annotationUnit.tree_id + ')');
                    scrollToViolationUnit(selectionHandlerServiceProvider, dataServiceProvider, annotationUnit);
                    return false;
                }

                violation = checkIfVoilateEachTokenInUnit(annotationUnit);
                if (violation) {
                    showErrorModal(errorMessages[violation.rcode]+' (failed in unit '+annotationUnit.tree_id+')');
                    scrollToViolationUnit(selectionHandlerServiceProvider, dataServiceProvider, annotationUnit);
                    return false;
                }
            }


            violation = unitViolatesSiblingAndChildrenRestrictions(annotationUnit);
            if (violation) {
                showErrorModal(getErrorMessage(violation.rcode,{'%NAME_1%': violation.category1, '%NAME_2%': violation.category2},annotationUnit.tree_id));
                scrollToViolationUnit(selectionHandlerServiceProvider, dataServiceProvider, annotationUnit);
                // Scroll to violation unit, and then open the modal.
                // So when there is no connection -> It scrolls to the violation unit and then shows 'no connection message' in the top of task page.
                // Now- first it scrolls to the violation unit, if there is no connection scrolls to unit 0, and then show the message. Its done in showErrorModal function.
                // $timeout(function() {
                //     if (!noConnection) {
                //         scrollToViolationUnit(selectionHandlerServiceProvider, dataServiceProvider, annotationUnit);
                //     }
                // }, 2500);
                return false;
            }

	    annotationUnit.is_finished = true;
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

            allCategoriesTable;
            var violation = null;

            // extract all the categories of the siblings
            var children_category_ids = getChildrenCategories(annotationUnit);

            for (var i=0; i< children_category_ids.length; i++) {
                var cur_category_id = children_category_ids[i];

                //check FORBID_SIBLING restrictions
                if (cur_category_id in restrictionsTablesIds['FORBID_SIBLING']) {
                    var conflicting_category_ids = Core.intersectArrays(restrictionsTablesIds['FORBID_SIBLING'][cur_category_id], children_category_ids);
                    if (conflicting_category_ids.length > 0) {
                        return {rcode: 'FORBID_SIBLING', category1: allCategoriesTable[cur_category_id].name,
                            category2: allCategoriesTable[conflicting_category_ids[0]].name};
                    }
                }

                //check REQUIRE_SIBLING restrictions
                if (cur_category_id in restrictionsTablesIds['REQUIRE_SIBLING']) {

                    var required_category_ids = restrictionsTablesIds['REQUIRE_SIBLING'][cur_category_id];
                    if (Core.intersectArrays(required_category_ids, children_category_ids).length == 0) {
                        var reqiured_category_ids_str = '';
                        for (var k=0; k < required_category_ids.length; k++) {
                            reqiured_category_ids_str += allCategoriesTable[required_category_ids[k]].name;
                            if (k !== required_category_ids.length - 1) {
                                reqiured_category_ids_str += ', ';
                            }
                        }
                        return {rcode: 'REQUIRE_SIBLING', category1: allCategoriesTable[cur_category_id].name, category2: reqiured_category_ids_str};
                    }
                }
            }

            if (annotationUnit.tree_id !== '0') {
                for (var i = 0; i < annotationUnit.categories.length; i++) {
                    var cur_parent_category_id = annotationUnit.categories[i].id;

                    if (cur_parent_category_id in restrictionsTablesIds['FORBID_CHILD']) {
                        var conflicting_category_ids = Core.intersectArrays(restrictionsTablesIds['FORBID_CHILD'][cur_parent_category_id], children_category_ids);
                        if (conflicting_category_ids.length > 0) {
                            return {rcode: 'FORBID_CHILD', category1: allCategoriesTable[cur_parent_category_id].name,
                                category2: allCategoriesTable[conflicting_category_ids[0]].name};
                        }
                    }

                    if (cur_parent_category_id in restrictionsTablesIds['REQUIRE_CHILD']) {
                        var required_category_ids = restrictionsTablesIds['REQUIRE_CHILD'][cur_parent_category_id];
                        if (Core.intersectArrays(children_category_ids, required_category_ids).length == 0) {
                            var reqiured_category_ids_str = '';
                            for (var k=0; k < required_category_ids.length; k++) {
                                reqiured_category_ids_str += allCategoriesTable[required_category_ids[k]].name;
                                if (k !== required_category_ids.length - 1) {
                                    reqiured_category_ids_str += ', ';
                                }
                            }
                            return {rcode: 'REQUIRE_CHILD', category1: allCategoriesTable[cur_parent_category_id].name, category2: reqiured_category_ids_str};
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
         * Receives a violation code and message parameters as a dictionary and returns
         * the error message string
         * @param violation_code
         * @param replacements
         */
        function getErrorMessage(violation_code, msg_parameters, tree_id) {
            var msg = errorMessages[violation_code].replace(/%\w+%/g, function(all) {
                return msg_parameters[all] || all;
            });
            if (tree_id) {
                msg += ' (failed in unit '+tree_id+')';
            }
            return msg;
        }

        /**
         * Checks the restrictions that are applicable before creating a unit.
         *
         * Receives:
         * 1. the parent annotation unit: parentAnnotationUnit
         * 2. unitType: the unitType of the to-be-created unit
         * 3. the tokens about to be grouped in parentAnnotationUnit (taken from parentAnnotationUnit.tokens): grouped_tokens. If unitType is
         *    implicit, should be empty.
         * 4. newCategory, in the case the unit is created  with a category (newCategory should be null otherwise).
         *
         * Returns true upon success, false upon failure.
         *
         * Checks:
         * 1. If the parent is unanalyzable, you cannot create a sub-unit for it
         * 2. If the assigned category unanalyzable, you cannot create it by grouping units only tokens
         * 3. If the unit has one token, you can only create a sub-unit out of it once
         * 4. If grouped tokens are only punctuation, you cannot create a unit just from them.
         */
        function checkRestrictionsBeforeInsert(parentAnnotationUnit, unitType, grouped_tokens, newCategory){
            if (parentAnnotationUnit.is_remote_copy) { // Check if the parent is remote unit
                showErrorModal(errorMessages['FORBID_SUB_REMOTE_UNIT']);
                return false;
            }

            if (unitType === "REGULAR" && isOnlyPunctuation(grouped_tokens)) {
                showErrorModal(errorMessages['UNIT_CONTAIN_ONLY_PUNCTUATIONS']);
                return false;
            }

            //check if parent is unanalyzable
            var unanalyzableCategory = isUnanalyzableUnit(parentAnnotationUnit);
            if (unanalyzableCategory) {
                showErrorModal(getErrorMessage('FORBID_ANY_CHILD',{"%NAME%": unanalyzableCategory.name}));
                return false;
            }

            //check if child is set to be unanalyzable but already has children
            if (newCategory && restrictionsTablesIds['FORBID_ANY_CHILD'].includes(newCategory.id)) {
                var inChild = grouped_tokens.filter(t => t.inChildUnitTreeId);
                if (inChild.length) {
                    var childUnit = dataServiceProvider.getUnitById(inChild[0].inChildUnitTreeId);
                    if (childUnit.tokens.length !== grouped_tokens.length) {
                        showErrorModal(getErrorMessage('FORBID_ANY_CHILD', {"%NAME%": newCategory.name}));
                        return false;
                    }

                    // Check if the two units contain the same tokens, because we want to check the child unit when the *focus unit is the parent*.
                    // It happens in this case: We took an existing unit, which already has a category, and then selected it (that is, the focus unit was the parent unit),
                    // and then pressed 'z'. In this case, even if it doesn't have children, it still gives us a modal saying we can't do that.
                    grouped_tokens.forEach((token, index) => {
                        if (token.static.id !== childUnit.tokens[index].static.id) {
                            showErrorModal(getErrorMessage('FORBID_ANY_CHILD', {"%NAME%": newCategory.name}));
                            return false;
                        }
                    });
                }
            }

            return true;
        }


        /**
         * Checks the restrictions that are applicable before adding a category:
         * 1. if both slots are full in a slotted unit, do not allow adding category
         * 2. if has children, but assigned an unanalyzable category
         * 3. if refined with a category which doesn't refine any of its parent categories
         *
         * Receives:
         * annotationUnit: annotationUnit, before any categories were added
         * newCategory: the category object of the category about to be added
         *
         * Returns true if checks passed, false if failed.
         */
        function checkRestrictionsBeforeAddingCategory(annotationUnit, newCategory){
            // check if both slots are full in a slotted  unit
            if(checkSlottedLayerProjectRestriction(annotationUnit, newCategory)){
                showErrorModal(errorMessages['UNIT_FORBID_SLOTTED_LAYER_RULE']); //check
                return false;
            }

            //check if annotationUnit has children, but an unanalyzable category is assigned to it.
            if (annotationUnit.AnnotationUnits && annotationUnit.AnnotationUnits.length > 0) {
                if (restrictionsTablesIds['FORBID_ANY_CHILD'].includes(newCategory.id)) {
                    showErrorModal(getErrorMessage('FORBID_ANY_CHILD',{"%NAME%": newCategory.name}));
                    return false;
                }
            }


            if (newCategory && !newCategory.fromParentLayer && !isUnitRefinable(annotationUnit)) {

                showErrorModal(getErrorMessage('NONRELEVANT_UNIT',{})); //check
                return false;
            }

            var violation = isUnitRefinableWithCategory(annotationUnit, newCategory);
            if (violation) {
                showErrorModal(getErrorMessage('NONRELEVANT_PARENT_CATEGORY',{"%NAME_1%": violation.category1.name, "%NAME_2%": violation.category2.join(', ')}));
                return false;
            }

            return true;
        }





        /**
         * Returns true iff either it's not a refinement layer OR the unit has a category that can be refined.
         * Otherwise returns false.
         * @param unit
         * @param newCategory
         * @returns {*}
         */
        function isUnitRefinable(unit) {
            if (!$rootScope.isRefinementLayerProject) {
                return true;
            }

            return unit.categories.some(function(category) {
                return category.refinedCategory;
            });
            // for (var i = 0; i < unit.categories.length; i++) {
            //     if (unit.categories[i].refinedCategory) {// || unit.categories[i].refinementCategory) {
            //         return true
            //     }
            // }
            // return false
        }

        /**
         * Returns null if it's not a refinement layer, if newCategory is from the parent layer
         * or if newCategory is a refinement of one of the categories of unit.
         * Otherwise returns a violation object.
         * @param unit
         * @param newCategory
         * @returns {*}
         */
        function isUnitRefinableWithCategory(unit, newCategory){

            if (!$rootScope.isRefinementLayerProject || !newCategory || newCategory.fromParentLayer) {
                return null;
            }
            var unitCategoryIds = unit.categories.map(function getId(cat) {return cat.id;});
            if (!unitCategoryIds.includes(newCategory.parent.id)){
                var unitCategoryNames = unit.categories.map(function getName(cat) {return cat.name;});
                return {"category1": newCategory, "category2": unitCategoryNames};
            }
            return null;
        }

        // return true if slot categories contain two categories, and can't add more categories
        function checkSlottedLayerProjectRestriction(unit, cat){
            if( $rootScope.isSlottedLayerProject ){
                // check if cat exist in unit.categories, and then remove it from unit.categories
                for (var c = 0; c < unit.categories.length; c++) {
                    if (unit.categories[c].id === cat.id) {
                        return false; // Remove this category.
                    }
                }
                if(unit.slotOne && unit.slotTwo){
                    return true;
                }
            }
            return false;
        }

        function isOnlyPunctuation(tokens){
            return tokens.every(function(token){
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
            return null;
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
         * Returns the relevant category if annotationUnit has a category with 'FORBID_ANY_CHILD' restriction.
         * Otherwise returns null
         * @param annotationUnit
         */
        function isUnanalyzableUnit(annotationUnit) {
            if (annotationUnit.tree_id === '0') {
                return false;
            }
            for (var i = 0; i < annotationUnit.categories.length; i++) {
                if (restrictionsTablesIds["FORBID_ANY_CHILD"].includes(annotationUnit.categories[i].id)) {
                    return annotationUnit.categories[i];
                }
            }
            return null;
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
            if (annotationUnit.unitType !== 'REGULAR') {
                return true;
            }
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

        // function closeModal() {
        //     console.log('close modal!');
        //     $timeout( function(){
        //         var btn = $window.document.getElementById('first');
        //         if (btn) {
        //             console.log("focused btn=", btn)
        //             btn.click();
        //         }
        //     }, 100 );
        // }

        function showErrorModal(message){
            $uibModal.open({
                animation: true,
                templateUrl: 'app/pages/annotation/templates/errorModal.html',
                size: 'md',
                controller: function ($scope) {
                    $scope.message = message;

                    $timeout( function(){
                        var btn = $window.document.getElementById('inputElement');
                        if (btn) {
                            btn.focus();
                        }
                    }, 100 );

                    $scope.keyUpChanged = function (e) {
                        var key = e.which;
                        if (key === 13)
                            $scope.$dismiss();
                    };


                    // hotkeys.bindTo($scope)
                    // .add({
                    //   combo: 'w',
                    //   description: 'blah blah',
                    //   callback: function() {
                    //       console.log('wwwwwwwwwwwwwwwwwwwwwwwwwww')
                    //   //     var btn = $window.document.getElementById('first');
                    //   //   if (btn)
                    //   //       console.log("focused btn=", btn)
                    //   //       btn.click();
                    //   }
                    // })
                    // .add ({
                    //   combo: 'q',
                    //   description: 'blah blah',
                    //   callback: function() {
                    //       console.log('qqqqqqqqqqqqqqqqqqqqqqqqqqqqqq')
                    //   }
                    // });
                    //

                    // $timeout( function(){
                    //     debugger
                    //     var btn = $window.document.getElementById('first');
                    //     if (btn)
                    //         console.log("focused btn=", btn)
                    //         btn.focus();
                    // }, 1000 );
                    }
            }).opened.then(function(a) {
                return true;
            }, function(error) {
                if (error.message.includes('Failed to load template')) {
                    // If load failed, scroll to unit0 so the user should see 'no connection error'.
                    // Write scroll unit0 here once and not several times in checkRestriction functions.
                    scrollToViolationUnit(selectionHandlerServiceProvider, dataServiceProvider, dataServiceProvider.tree);
                    $rootScope.$broadcast('FailedToLoadTemplate');
                    // noConnection = true;
                }
                return false;
            });
        }

        function scrollToViolationUnit(selectionHandlerServiceProvider, dataServiceProvider, violationUnit){
            // If Finish All fails, it should open and place focus on the violating unit.
            selectionHandlerServiceProvider.updateSelectedUnit(violationUnit.tree_id);
            var parentUnit = dataServiceProvider.getUnitById(violationUnit.parent_tree_id);
            if (parentUnit.gui_status === 'COLLAPSE') {
                parentUnit.gui_status = 'OPEN';
            }
            Core.scrollToUnit(violationUnit.tree_id);
        }


    }


})();

