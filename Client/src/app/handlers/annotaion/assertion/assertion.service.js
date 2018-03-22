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
            checkTree: checkTree,
            correctFormat: correctFormat,
            checkTreeId: checkTreeId,
            checkAnnotationUnits: checkAnnotationUnits,
            checkParentTreeId: checkParentTreeId,
            validPrefix: validPrefix,
            check_children_tokens_hash: check_children_tokens_hash,
            buildUnitsIdList: buildUnitsIdList,
            checkUnitsIdsList:checkUnitsIdsList,
            checkUniqueInTree:checkUniqueInTree,
            checkClonedId: checkClonedId,
            checkChildrenTokens:checkChildrenTokens,
            checkChildrenTokensSubSet: checkChildrenTokensSubSet,
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
            this.correctFormat(treeId, 'Tree id');
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
            // null if tree_id=0:
            // The tree has not parent_tree_id, right now it has not checked
            if (treeId == "0") {
                debugger
            }
            if (treeId && !parentTreeId) {
                throw "Parent tree id " + parentTreeId + " is not existing";
            }

            // correct format
            this.correctFormat(parentTreeId, 'Parent tree id');

            if (!this.validPrefix(parentTreeId, treeId)) {
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
                this.correctFormat(unit.cloned_from_tree_id, 'Cloned from tree id');
            }

            // Points at an existing unit in the tree
            if (unit.cloned_from_tree_id && !this.unitsIdsList.includes(unit.cloned_from_tree_id)) {
                throw "Cloned from tree id " + unit.cloned_from_tree_id + " is not points at an existing unit in the tree";
            }
        }

        /**
         * Check annotationUnits: recursive function, it sends to check tree_id and parent_tree_id
         * @param annotationUnits
         */
        function checkAnnotationUnits(annotationUnits) {
            console.log("------zannotationUnits=", annotationUnits);
            for (var i = 0; i < annotationUnits.length; i++) {
                console.log("i=", annotationUnits[i]);
                //Check fields: tree_id, parent_tree_id, cloned_from_tree_id
                this.checkTreeId(annotationUnits[i].tree_id);
                this.checkParentTreeId(annotationUnits[i].parent_tree_id, annotationUnits[i].tree_id);
                this.checkClonedId(annotationUnits[i]);

                if (annotationUnits[i].AnnotationUnits) {
                    this.checkAnnotationUnits(annotationUnits[i].AnnotationUnits);
                }
            }
        }


        /**
         * Build units id list, iterate all tree units, push their tree ids to unitsIdList list
         */
        function buildUnitsIdList(treeId, annotationUnits) {
            for (let i = 0; i < annotationUnits.length; i++) {
                if (annotationUnits[i].AnnotationUnits) {
                    buildUnitsIdList(annotationUnits[i].tree_id, annotationUnits[i].AnnotationUnits);
                }
            }
            AssertionService.unitsIdsList.push(treeId);
        }

        /**
         * Check for each unit (id = i-j-k) if its parent unit is also in the tree (id = i-j-(k-1) )
         */
        function checkUnitsIdsList() {
            this.checkUniqueInTree();
            for (let i = 0; i < AssertionService.unitsIdsList.length; i++) {
                if (/^\d+$/.test(AssertionService.unitsIdsList[i])) {
                    // If treeId is first sub unit of the tree root, parentTreeId should be '0', like '1', '2', their parent is '0'
                    continue;
                }

                const index = AssertionService.unitsIdsList[i].lastIndexOf("-");
                const lastDigit = AssertionService.unitsIdsList[i].slice(index+1);
                let res = '';

                if (lastDigit - 1) { // If lastDigit > 2, sub the last digit (i-j-k -> i-j-(k-1) )
                    const prefix = AssertionService.unitsIdsList[i].slice(0, index+1)
                    const digit = parseInt(lastDigit)
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
         * Check if children_tokens_hash contain same tokens like children_tokens
         * @param children_tokens_hash
         * @param children_tokens
         */
        function check_children_tokens_hash(children_tokens_hash, children_tokens) {
            // Check only if localStorage.validate is true
            if (!getValidate()) {
                return
            }
            try {
                // children_tokens_hash - tokens object: {id: token, id: token, ...}
                // children_tokens - tokens array
                const children_tokens_hash_ids = Object.keys(children_tokens_hash);
                if (children_tokens_hash_ids.length !== children_tokens.length) {
                    throw "The lengths of children_tokens and children_tokens_hash are not equals";
                }
                for (var i = 0; i < children_tokens_hash_ids.length; i++) {
                    if (parseInt(children_tokens_hash_ids[i]) !== children_tokens[i].id) {
                        throw "The ids at place " + i + " are different between children_tokens_hash and children_tokens";
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
         * @param currentTask
         */
        function checkChildrenTokensSubSet(currentTask) {
            // TODO- after saveTask current task doesn't contain children_tokens attribute.  Remove check after save task? Add children_tokens in dataService.saveTask?
            for (let i = 0; i < currentTask.annotation_units.length; i++) {
                for (let j = 0; j < currentTask.annotation_units[i].children_tokens.length; j++) {
                    // Check if the token id exist in children_tokens of their parent
                    if (!checkTokenInParentUnit(currentTask.annotation_units, currentTask.annotation_units[i].children_tokens[j].id, currentTask.annotation_units[i].parent_tree_id)) {
                        throw "token " + currentTask.annotation_units[i].children_tokens[j].id + " is not exist in children tokens of the parent unit";
                    }
                }
            }
        }

        /**
         * Check children_tokens:
         * exists and in the tokens of the task (this is the “tokens” member of the task),
         * no duplicates (with same start_index) within each unit
         * a sub-set of the children_tokens of the parent
         * @param currentTask
         */
        function checkChildrenTokens(currentTask) {
            // Build list of all tree tokens ids
            const treeTokensIdsList = [];
            for (var i = 0; i < currentTask.tokens.length; i++) {
                treeTokensIdsList.push(currentTask.tokens[i].id);
            }
            console.log("currentTask=", currentTask);
            for (let i = 1; i < currentTask.annotation_units.length; i++) { // Beginning from 1, because unit 0 doesn't have children_tokens
                // Check if children_tokens exist
                if (!currentTask.annotation_units[i].children_tokens.length) {
                    throw "Annotation unit "+ i + " doesn't have children tokens";
                }
                // Check if children token in the tokens of tha task
                for (let j = 0; j < currentTask.annotation_units[i].children_tokens.length; j++) {
                    if (!treeTokensIdsList.includes(currentTask.annotation_units[i].children_tokens[j].id)) {
                        throw "Token " +  currentTask.annotation_units[i].children_tokens[j].id + " doesn't exist in the tokens of the task";
                    }
                }
            }
            // TODO-- No duplicates (with same start_index) within each unit
            // TODO But start_index exist only in currentTask.tokens

            // A sub-set of the children_tokens of the parent
            this.checkChildrenTokensSubSet(currentTask);
        }


        /**
         * Main function, checkTree- sends to check tree ids, annotations units and children tokens
         * @param tree (DataService.tree)- to check the ids and annotations units
         * @param currentTask (DataService.currentTask) - to check children tokens
         */
        function checkTree(tree, currentTask) {
            // Check only if localStorage.validate is true
            if (!getValidate()) {
                return
            }
            console.log("_______________check tree=", tree);
            try {
                // Check tree ids
                this.checkTreeId(tree.tree_id);
                this.unitsIdsList = [];
                this.buildUnitsIdList(tree.tree_id, tree.AnnotationUnits);
                this.checkUnitsIdsList();

                // Check annotations units
                this.checkAnnotationUnits(tree.AnnotationUnits);

                // Check children tokens
                this.checkChildrenTokens(currentTask);
            } catch(e) {
                console.error(e);
            }
        }

    }

})();
