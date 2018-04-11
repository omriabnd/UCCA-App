(function() {
    'use strict';

    angular.module('zAdmin.annotation.assertion')
        .factory('AssertionService', AssertionService);


    /** @ngInject */
    /***
     * Assertion service, check DataService.tree
     * @constructor
     */
    function AssertionService() {
        var AssertionService = {
            unitsIdsList: [],
            firstTokenInPreUnit: 0,
            checkTree: checkTree,
            check_children_tokens_map: check_children_tokens_map,
        };

        return AssertionService;

        /**
         * check if id is in the correct format ('i-j-k')
         * @param id
         * @param idType
         */
        function correctFormat(id, idType) {
            const splitId = id.split('-');
            for (let i = 0; i < splitId.length; i++) {
                if (!parseInt(splitId[i]) && splitId[i] !== "0") {
                    throw idType + " is not in the correct format";
                }
            }
        }

        /**
         * Check tree_id: existing and correct format
         * @param treeId
         */
        function checkTreeId(treeId) {
            // existing
            if (!treeId) {
                throw "Tree id " + treeId + " is not existing";
            }

            // correct format
            correctFormat(treeId, 'Tree id');
        }

        /**
         * Check if parent_tree_id is prefix of tree_id
         * Valid: a prefix of the tree_id
         * @param parentTreeId
         * @param treeId
         * @returns {boolean}
         */
        function validPrefix(parentTreeId, treeId) {
            const isNum = /^\d+$/.test(treeId);
            if (isNum) {
                // If treeId is first sub unit of the tree root, parentTreeId should be '0', like '1', '2', their parent is '0'
                return parentTreeId === "0"
            }
            const index = treeId.lastIndexOf("-");
            const prefix = treeId.slice(0, index);
            return prefix === parentTreeId;
        }

        /***
         * Check parent_tree_id: exist, correct format and tree_id prefix
         * @param parentTreeId
         * @param treeId
         */
        function checkParentTreeId(parentTreeId, treeId) {
            // Exists or null if tree_id=0
            // parent_tree_id should be null if tree_id=0: the tree has not parent_tree_id, right now it has not checked
            if (treeId && !parentTreeId) {
                throw "Parent tree id " + parentTreeId + " is not existing";
            }

            // correct format
            correctFormat(parentTreeId, 'Parent tree id');

            if (!validPrefix(parentTreeId, treeId)) {
                throw "Parent tree id is not a prefix of tree id";
            }

        }

        /**
         * Check cloned_from_tree_id:
         * exist only if is_remote_copy is true, correct format and points at an existing unit in the tree
         * @param unit
         */
        function checkClonedId(unit) {
            if (unit.is_remote_copy && !unit.cloned_from_tree_id) {
                throw "Annotation unit " + unit.tree_id + " is remote copy, it doesn't have cloned_from_tree_id";
            }
            if (!unit.is_remote_copy && unit.cloned_from_tree_id) {
                throw "Annotation unit " + unit.tree_id + " isn't remote copy, but it has cloned_from_tree_id";
            }

            //correct format
            if (unit.cloned_from_tree_id) {
                correctFormat(unit.cloned_from_tree_id, 'Cloned from tree id');
            }

            // Points at an existing unit in the tree
            if (unit.cloned_from_tree_id && !AssertionService.unitsIdsList.includes(unit.cloned_from_tree_id)) {
                throw "Cloned from tree id " + unit.cloned_from_tree_id + " is not points at an existing unit in the tree";
            }
        }

        /**
         * Check if children_tokens_map, tokens and tokenCopy are contain the same tokens
         * @param unit- annotationUnit (contain children_tokens_map, tokens and tokenCopy)
         */
        function checkTokens(unit) {
            // debugger
            // // TODO- unit.tokens exist, unit.tokenCopy and unit.children_tokens_map are undefined
            // for (let i = 0; i < unit.tokens.length; i++) {
            //     if (unit.tokens[i].id !== unit.tokenCopy[i].id) {
            //         throw "tokens and tokenCopy are not contain the same tokens (" + unit.tokens[i] + " and " + unit.tokenCopy[i];
            //     }
            // }
        }

        /**
         * Check annotationUnits: recursive function, it sends to check tree_id and parent_tree_id
         * @param annotationUnits
         */
        function checkAnnotationUnits(annotationUnits) {
            for (var i = 0; i < annotationUnits.length; i++) {
                //Check fields: tree_id, parent_tree_id, cloned_from_tree_id
                checkTreeId(annotationUnits[i].tree_id);
                checkParentTreeId(annotationUnits[i].parent_tree_id, annotationUnits[i].tree_id);
                checkClonedId(annotationUnits[i]);

                // Check children_tokens_map, tokenCopy and tokens
                checkTokens(annotationUnits[i]);

                if (annotationUnits[i].AnnotationUnits) {
                    checkAnnotationUnits(annotationUnits[i].AnnotationUnits);
                }
            }
        }


        /**
         * Build units id list, iterate all tree units, push their tree ids to unitsIdList list
         */
        function buildUnitsIdList(treeId, annotationUnits) {
            AssertionService.unitsIdsList.push(treeId);
            for (let i = 0; i < annotationUnits.length; i++) {
                if (annotationUnits[i].AnnotationUnits) {
                    buildUnitsIdList(annotationUnits[i].tree_id, annotationUnits[i].AnnotationUnits);
                }
            }
        }

        /**
         * Check for each unit (id = i-j-k) if its parent unit is also in the tree (id = i-j-(k-1) )
         */
        function checkUnitsIdsList() {
            checkUniqueInTree();
            for (let i = 0; i < AssertionService.unitsIdsList.length; i++) {
                if (/^\d+$/.test(AssertionService.unitsIdsList[i])) {
                    // If treeId is first sub unit of the tree root, parentTreeId should be '0', like '1', '2', their parent is '0'
                    continue;
                }

                const index = AssertionService.unitsIdsList[i].lastIndexOf("-");
                const lastDigit = AssertionService.unitsIdsList[i].slice(index+1);
                let res = '';

                if (lastDigit - 1) { // If lastDigit > 2, sub the last digit (i-j-k -> i-j-(k-1) )
                    const prefix = AssertionService.unitsIdsList[i].slice(0, index+1);
                    const digit = parseInt(lastDigit);
                    res = prefix.concat(digit-1);
                } else { // If lastDigit is '1', slice the last digit (i-j-1 -> i-j )
                    res = AssertionService.unitsIdsList[i].slice(0, index);
                }

                if (!AssertionService.unitsIdsList.filter(item => item == res).length) {
                    throw "There is a gap, unit " + res + " is not exist in the tree";
                }
            }
        }

        /**
         * Check if every tree_id is unique in the tree
         */
        function checkUniqueInTree() {
            for (let i = 0; i < AssertionService.unitsIdsList.length; i++) {
                if (AssertionService.unitsIdsList.filter(item => item == AssertionService.unitsIdsList[i]).length !== 1) {
                    throw "tree_id " + AssertionService.unitsIdsList[i] + " is not unique in the tree";
                }
            }
        }

        /**
         * Check if children_tokens_map contain same tokens like children_tokens
         * @param children_tokens_map
         * @param children_tokens
         */
        function check_children_tokens_map(children_tokens_map, children_tokens, tokensType) {
            // Check only if localStorage.validate is true
            if (!getValidate()) {
                return
            }
            try {
                // children_tokens_map - tokens object: {id: token, id: token, ...}
                // children_tokens - tokens array
                const children_tokens_map_ids = Object.keys(children_tokens_map);
                if (children_tokens_map_ids.length !== children_tokens.length) {
                    throw "The lengths of " + tokensType + " and children_tokens_map are not equals";
                }
                for (let i = 0; i < children_tokens_map_ids.length; i++) {
                    if (parseInt(children_tokens_map_ids[i]) !== children_tokens[i].id) {
                        throw "The ids at place " + i + " are different between children_tokens_map and " + tokensType;
                    }
                }
            } catch(e) {
                console.error(e);
            }
        }

        /**
         *
         * @param annotationUnits - list
         * @param tokenId - the token to check if it exists in parent children_tokens
         * @param parentId - the parent id, to check if the token exist in his children_tokens
         * @returns {boolean} - If the token exist in children_tokens of the parent
         */
        function checkTokenInParentUnit(annotationUnits, tokenId, parentId) {
            for (let i = 0; i < annotationUnits.length; i++) {
                if (annotationUnits[i].parent_tree_id === parentId) {
                    for (let j = 0; j < annotationUnits[i].children_tokens.length; j++) {
                       if (annotationUnits[i].children_tokens[j].id === tokenId) {
                           return true;
                       }
                    }
                }
            }
            return false;
        }

        /**
         * Check if children tokens are sub set the children_tokens of the parent
         * @param serverData
         */
        function checkChildrenTokensSubSet(serverData) {
            // TODO- after saveTask current task doesn't contain children_tokens attribute.  Remove check after save task? Add children_tokens in dataService.saveTask?
            for (let i = 0; i < serverData.annotation_units.length; i++) {
                for (let j = 0; j < serverData.annotation_units[i].children_tokens.length; j++) {
                    // Check if the token id exist in children_tokens of their parent
                    if (!checkTokenInParentUnit(serverData.annotation_units, serverData.annotation_units[i].children_tokens[j].id, serverData.annotation_units[i].parent_tree_id)) {
                        throw "token " + serverData.annotation_units[i].children_tokens[j].id + " is not exist in children tokens of the parent unit";
                    }
                }
            }
        }

        /**
         * Check serverData.tokens- start_index sorted
         * @param tokens
         */
        function checkCurrentTaskTokens(tokens) {
            let index = -1;
            for (let i = 0; i < tokens.length; i++) {
                if (tokens[i].start_index <= index) {
                    throw "The indexes of the tokens " + tokens[i].id + " and " + tokens[i].id + " are not sorted";
                }
                index = tokens[i].start_index;
            }
        }

        /**
         * Check children_tokens:
         * exists and in the tokens of the task (this is the “tokens” member of the task),
         * no duplicates (with same start_index) within each unit
         * a sub-set of the children_tokens of the parent
         * @param serverData
         */
        function checkChildrenTokens(serverData) {
            // Build list of all tree tokens ids
            const treeTokensIdsList = [];
            for (var i = 0; i < serverData.tokens.length; i++) {
                treeTokensIdsList.push(serverData.tokens[i].id);
            }
            for (let i = 1; i < serverData.annotation_units.length; i++) { // Beginning from 1, because unit 0 doesn't have children_tokens
                // If it's a implicit unit don't check it because implicit unit doesn't have children_tokens
                if (serverData.annotation_units[i].type === 'IMPLICIT') {
                    return;
                }
                // Check if children_tokens exist
                if (!serverData.annotation_units[i].children_tokens.length) {
                    throw "Annotation unit "+ i + " doesn't have children tokens";
                }
                let childrenTokensIdsList = [];
                // Check if children token in the tokens of tha task
                for (let j = 0; j < serverData.annotation_units[i].children_tokens.length; j++) {
                    if (!treeTokensIdsList.includes(serverData.annotation_units[i].children_tokens[j].id)) {
                        throw "Token " +  serverData.annotation_units[i].children_tokens[j].id + " doesn't exist in the tokens of the task";
                    }

                    // build children_tokens ids list
                    childrenTokensIdsList.push(serverData.annotation_units[i].children_tokens[j].id);
                }
                // Check no duplicates in childrenTokensIdsList
                for (let  k = childrenTokensIdsList.length-1; k <= 0; k--) {
                    if (k && childrenTokensIdsList[k] >= childrenTokensIdsList[k-1]) {
                        throw "Tokens " + childrenTokensIdsList[k] + ", " + childrenTokensIdsList[k-1] + " are duplicated or not sorted";
                    }
                }
            }
            // Check start_index in serverData.tokens
            checkCurrentTaskTokens(serverData.tokens);

            // A sub-set of the children_tokens of the parent
            checkChildrenTokensSubSet(serverData);
        }


        /***
         * recursive function, send to check correctly ordered function
         * set the first token in unit
         * @param unit
         */
        function checkTokensOrder(unit) {
            if (!unit.tokens.length) { // if id==='0'
                unit.tokens = unit.tokenCopy
            }
            // Check implicit unit in the beginning
            if (unit.unitType === 'IMPLICIT') {
                if (!(unit.tree_id.endsWith('-1') || unit.tree_id === '1')) {
                    throw "Implicit unit is no in the beginning, " + unit.tree_id;
                }
            }
            if (unit.tree_id !== "0") {
                checkCorrectlyOrdered(AssertionService.firstTokenInPreUnit, unit.tokens[0].id, unit.tree_id.endsWith('-1') || unit.tree_id === '1');// if id ='...-1' or '1', this is the first child of the unit
            }
            AssertionService.firstTokenInPreUnit = unit.tokens[0].id;

            for (let i = 0; i < unit.AnnotationUnits.length; i++) {
                if (unit.AnnotationUnits[i].AnnotationUnits) {
                    checkTokensOrder(unit.AnnotationUnits[i]);
                }
            }

        }

        /**
         * Check correctly ordered, if th4e first tokens in the unit are not ordered, throe exception
         * @param preToken - the first token of the pre unit
         * @param currToken - the first token of the current unit
         * @param firstChild - boolean value, if the current unit is the first child of the pre unit
         */
        function checkCorrectlyOrdered(preToken, currToken, firstChild) {
            if (firstChild) {
                if (preToken > currToken) {
                    throw "Tokens are not ordered " + preToken + ", " + currToken;
                }
            } else {
                if (preToken >= currToken) {
                    throw "Tokens are not ordered " + preToken + ", " + currToken;
                }
            }
        }

        /**
         * Main function, checkTree- sends to check tree ids, annotations units and children tokens
         * @param tree (DataService.tree)- to check the ids and annotations units
         * @param serverData (DataService.serverData) - to check children tokens
         */
        function checkTree(tree, serverData) {
            // Check only if localStorage.validate is true
            if (!getValidate()) {
                return
            }
            // debugger
            console.log("-------------------------check tree-------------------------", tree);
            try {
                // Check tree ids
                checkTreeId(tree.tree_id);
                AssertionService.unitsIdsList = [];
                buildUnitsIdList(tree.tree_id, tree.AnnotationUnits);
                checkUnitsIdsList();

                // Check if children_tokens_map and tokenCopy contain the same tokens
                check_children_tokens_map(tree.children_tokens_map, tree.tokenCopy, 'tokenCopy');

                // Check annotations units
                checkAnnotationUnits(tree.AnnotationUnits);

                // TODO- delete DataService.serverData, change tokens in DataService.tree to children_tokens, and then check tree.children_tokens (email, March 27)
                // Check children tokens
                // checkChildrenTokens(serverData);

                // Correctly ordered (by first token, implicit units come first)
                AssertionService.firstTokenInPreUnit = tree.tokenCopy[0].id;
                checkTokensOrder(tree);
            } catch(e) {
                console.error(e);
            }
        }

    }

})();
