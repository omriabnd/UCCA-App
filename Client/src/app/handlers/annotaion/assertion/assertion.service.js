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
            checkTreeId: checkTreeId,
            checkAnnotationUnits: checkAnnotationUnits,
            checkParentTreeId: checkParentTreeId,
            validPrefix: validPrefix,
            check_children_tokens_hash: check_children_tokens_hash,
            checkNoGaps: checkNoGaps,
            checkUnitsIdsList:checkUnitsIdsList,
            checkUniqueInTree:checkUniqueInTree,
        };

        return AssertionService;

        /**
         * Check tree_id: existing and correct format
         * @param treeId
         */
        function checkTreeId(treeId) {
            // existing
            if (!treeId) {
                throw "Tree id is not existing";
            }

            // correct format
            var splitTreeId = treeId.split('-');
            for (var i = 0; i < splitTreeId.length; i++) {
                if (!parseInt(splitTreeId[i]) && splitTreeId[i] !== "0") {
                    throw "Tree id is not in the correct format";
                }
            }
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
            // debugger
            // Exists or null if tree_id=0
            if (treeId == "0") {
                debugger
            }

            console.log("parentTreeId", parentTreeId, "treeId", treeId)
            if (treeId && !parentTreeId) {
                debugger;
                throw "Parent tree id is not existing";
            }

            // correct format
            if (parentTreeId) {
                var splitTreeId = parentTreeId.split('-');
                for (var i = 0; i < splitTreeId.length; i++) {
                    if (!parseInt(splitTreeId[i]) && splitTreeId[i] !== "0") {
                        throw "Parent tree id is not in the correct format";
                    }
                }
            }

            if (!this.validPrefix(parentTreeId, treeId)) {
                throw "Parent tree id is not a prefix of tree id";
            }

        }

        /**
         * Check annotationUnits: recursive function, it sends to check tree_id and parent_tree_id
         * @param annotationUnits
         */
        function checkAnnotationUnits(annotationUnits) {
            console.log("------zannotationUnits=", annotationUnits);
            for (var i = 0; i < annotationUnits.length; i++) {
                console.log("annotationUnits[i].parentUnitId=", annotationUnits[i].parentUnitId)
                console.log("i=", annotationUnits[i]);
                //tODO- check fields
                this.checkTreeId(annotationUnits[i].tree_id);
                this.checkParentTreeId(annotationUnits[i].parent_tree_id, annotationUnits[i].tree_id);


                if (annotationUnits[i].AnnotationUnits.length) {
                    this.checkAnnotationUnits(annotationUnits[i].AnnotationUnits);
                }
            }
        }


        /**
         * Check no gaps, iterate all tree units, push their tree ids to unitsIdList list
         */
        function checkNoGaps(treeId, annotationUnits) {
            for (let i = 0; i < annotationUnits.length; i++) {
                if (annotationUnits[i].AnnotationUnits) {
                    checkNoGaps(annotationUnits[i].tree_id, annotationUnits[i].AnnotationUnits);
                }
            }
            AssertionService.unitsIdsList.push(treeId);
        }

        /**
         * Check for each unit (id = i-j-k) if its parent unit is also in the tree (id = i-j-(k-1) )
         */
        function checkUnitsIdsList() {
            this.checkUniqueInTree();
            console.log("AssertionService.unitsIdsList", AssertionService.unitsIdsList);
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
         * Main function, check tree- sends to check tree_id and annotationUnits
         * @param tree
         */
        function checkTree(tree) {
            console.log("_______________check tree=", tree);
            // debugger
            console.log("In check tree function", tree);
            // Check tree_id
            try {
                this.checkTreeId(tree.tree_id);
                this.checkAnnotationUnits(tree.AnnotationUnits);
                this.checkNoGaps(tree.tree_id, tree.AnnotationUnits);
                this.checkUnitsIdsList();
            } catch(e) {
                console.error(e);
            }
        }

        /**
         * Check if children_tokens_hash contain same tokens like children_tokens
         * @param children_tokens_hash
         * @param children_tokens
         */
        function check_children_tokens_hash(children_tokens_hash, children_tokens) {
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

    }

})();
