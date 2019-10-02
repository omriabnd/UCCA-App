(function () {
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
            tree: undefined,
            unitsIdsList: [],
            firstTokenInPreUnit: 0,
            flagToInChildUnitTreeId: false,
            implicitFinished: {},
            checkTree: checkTree,
            checkTokenMap: checkTokenMap,
        };

        return AssertionService;

        /***
         * This function has been copied from the DataService because of the opposite dependency.
         * DataService has been dependent on AssertionService.
         */
        function getUnitById(unitID) {
            if (unitID == -1) {
                return null
            } else if (!unitID || unitID == 0) {
                return AssertionService.tree;
            } else {
                var splittedUnitId = unitID.toString().split("-");
                var tempUnit = AssertionService.tree;

                for (var i = 0; i < splittedUnitId.length; i++) {
                    var unitIdToFind = splittedUnitId.slice(0, i + 1).join("-");

                    var unitIndex = tempUnit.AnnotationUnits.findIndex(function (unit) {
                        if (unit == undefined) {
                            return false;
                        }
                        return unit.tree_id == unitIdToFind
                    });
                    tempUnit.AnnotationUnits.length > 0 && unitIndex > -1 ? tempUnit = tempUnit.AnnotationUnits[unitIndex] : '';
                }
                return !!tempUnit && tempUnit.tree_id == unitID ? tempUnit : null;
            }
        }

        /**
         * check if id is in the correct format ('i-j-k')
         * @param id
         * @param idType
         */
        function correctFormat(id, idType) {
            var splitId = id.split('-');
            for (var i = 0; i < splitId.length; i++) {
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
            var isNum = /^\d+$/.test(treeId);
            if (isNum) {
                // If treeId is first sub unit of the tree root, parentTreeId should be '0', like '1', '2', their parent is '0'
                return parentTreeId === "0"
            }
            var index = treeId.lastIndexOf("-");
            var prefix = treeId.slice(0, index);
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
                throw "Parent tree id (" + parentTreeId + ") is not a prefix of tree id (" + treeId + ")";
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
        /***
         * Check duplicate_indexes:
         * status should be HIDDEN only if the unit is immediately below unit 0,
         * and in remote and implicit unit, status should be OPEN
         * @param tokens
         */

        function checkDuplicateIndex(unit) {
            var startIndexArray = unit.tokens.map(function (item) {
                return item.static.start_index;
            });
            var endIndexArray = unit.tokens.map(function (item) {
                return item.static.end_index;
            });
                var counts = [];
                for(var i = 0; i <= unit.tokens.length; i++) {
                    if(counts[startIndexArray[i]] === undefined) {
                        counts[startIndexArray[i]] = 1;
                    } else {
                        throw "Duplicate start indexes in unit " + unit.id;
                    }
                    if(counts[endIndexArray[i]] === undefined) {
                        counts[endIndexArray[i]] = 1;
                    } else {
                        throw "Duplicate start indexes in unit " + unit.id;
                    }
                }
                return false;
            }
           
        
        /***
         * Check gui_status:
         * status should be HIDDEN only if the unit is immediately below unit 0,
         * and in remote and implicit unit, status should be OPEN
         * @param unit
         */

        function checkGuiStatus(unit) {
            if (unit.gui_status === 'HIDDEN') {
                if (unit.tree_id.indexOf('-') > -1) {
                    throw "Unit " + unit.tree_id + " cannot be HIDDEN status, since it is not immediately below unit 0";
                }
            }

            if (unit.unitType === 'IMPLICIT' || unit.unitType === 'REMOTE') {
                if (unit.gui_status !== 'OPEN') {
                    throw "Unit " + unit.tree_id + " is " + unit.unitType + " unit, status should be OPEN";
                }
            }
        }

        /**
         * Check if tokens exist
         * need to check here if tokenMap and tokens are contain the same tokens?
         * @param unit- annotationUnit
         */
        function checkIfTokensExist(unit) {
            if (!unit.tokens.length) {
                throw "Annotation unit " + unit.tree_id + " has not tokens list";
            }
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
                checkGuiStatus(annotationUnits[i]);
                checkDuplicateIndex(annotationUnits[i])

                // Check tokenMap and tokens
                checkIfTokensExist(annotationUnits[i]);

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
            for (var i = 0; i < annotationUnits.length; i++) {
                if (annotationUnits[i].AnnotationUnits) {
                    buildUnitsIdList(annotationUnits[i].tree_id, annotationUnits[i].AnnotationUnits);
                }
            }
        }

        /**
         * Finding out how many times an array element appears
         * @private
         */
        function _countInArray(array, what) {
            var count = 0;
            for (var i = 0; i < array.length; i++) {
                if (array[i] === what) {
                    count++;
                }
            }
            return count;
        }

        /**
         * Check for each unit (id = i-j-k) if its parent unit is also in the tree (id = i-j-(k-1) )
         */
        function checkUnitsIdsList() {
            checkUniqueInTree();
            for (var i = 0; i < AssertionService.unitsIdsList.length; i++) {
                if (/^\d+$/.test(AssertionService.unitsIdsList[i])) {
                    // If treeId is first sub unit of the tree root, parentTreeId should be '0', like '1', '2', their parent is '0'
                    continue;
                }

                var index = AssertionService.unitsIdsList[i].lastIndexOf("-");
                var lastDigit = AssertionService.unitsIdsList[i].slice(index + 1);
                var res = '';

                if (lastDigit - 1) { // If lastDigit > 2, sub the last digit (i-j-k -> i-j-(k-1) )
                    var prefix = AssertionService.unitsIdsList[i].slice(0, index + 1);
                    var digit = parseInt(lastDigit);
                    res = prefix.concat(digit - 1);
                } else { // If lastDigit is '1', slice the last digit (i-j-1 -> i-j )
                    res = AssertionService.unitsIdsList[i].slice(0, index);
                }

                if (_countInArray(AssertionService.unitsIdsList, res) < 1) {
                    throw "There is a gap, unit " + res + " is not exist in the tree";
                }

            }
        }



        /**
         * Check if every tree_id is unique in the tree
         */
        function checkUniqueInTree() {
            for (var i = 0; i < AssertionService.unitsIdsList.length; i++) {
                var count = _countInArray(AssertionService.unitsIdsList, AssertionService.unitsIdsList[i]);
                if (count !== 1) {
                    throw "Tree id " + AssertionService.unitsIdsList[i] + " is not unique in the tree, it appears " + count + " times";
                }
            }
        }

        /**
         * Check if tokenMap contain same tokens like children_tokens
         * @param tokenMap
         * @param children_tokens
         */
        function checkTokenMap(tokenMap, children_tokens) {
            // Check that all the IDs on the children's list also exist on the tokens list
            // Check that the MAP of a specific ID points to the token with that specific ID in map list

            // Check only if localStorage.validate is true
            if (!getValidate()) {
                return
            }
            try {
                // tokenMap - tokens object: {id: token, id: token, ...}
                // children_tokens - tokens array
                var tokenMap_ids = Object.keys(tokenMap);
                if (tokenMap_ids.length !== children_tokens.length) {
                    throw "The lengths of tokens and tokenMap are not equals";
                }
                for (var i = 0; i < tokenMap_ids.length; i++) {
                    if (parseInt(tokenMap_ids[i]) !== children_tokens[i].id) {
                        throw "The ids at place " + i + " are different between token map and tokens";
                    }
                    if (children_tokens[i].id !== tokenMap[children_tokens[i].id].id) {
                        throw "The map of id = " + children_tokens[i].id + " does not point to the token with this id";
                    }
                }
            } catch (e) {
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
            for (var i = 0; i < annotationUnits.length; i++) {
                if (annotationUnits[i].parent_tree_id === parentId) {
                    for (var j = 0; j < annotationUnits[i].children_tokens.length; j++) {
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
            for (var i = 1; i < serverData.annotation_units.length; i++) {// i beginning from 1, because unit 0 sometimes not contain children_tokens
                for (var j = 0; j < serverData.annotation_units[i].children_tokens.length; j++) {
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
            var index = -1;
            for (var i = 0; i < tokens.length; i++) {
                if (tokens[i].start_index <= index) {
                    throw "The indexes of the tokens " + tokens[i].id + " and " + tokens[i].id + " are not sorted";
                }
                index = tokens[i].start_index;
            }
        }

        // check if there is a unit that contains this token
        function _checkIfThereIsUnitWithThisToken(unit, token, inChildUnitTreeId) {// flag- inChildUnitTreeId value
            for (var index = 0; index < unit.AnnotationUnits.length; index++) {
                for (var tokenIndex = 0; tokenIndex < unit.AnnotationUnits[index].tokens.length; tokenIndex++) {
                    if (unit.AnnotationUnits[index].tokens[tokenIndex].static.id === token.static.id) {
                        if (!inChildUnitTreeId) { // If inChildUnitTreeId is null
                            throw "inChildUnitTreeId is null, it cannot be a token of any of the children of the unit unitTreeId";
                        }
                        // else- if inChildUnitTreeId exists
                        else if (inChildUnitTreeId === unit.AnnotationUnits[index].tree_id) { // check if inChildUnitTreeId equals to unit tree_id
                            AssertionService.flagToInChildUnitTreeId = true;
                            return
                        }
                    }
                }
            }
            for (var i = 0; i < unit.AnnotationUnits.length; i++) { // recursive call -If null: cannot be a token of any of the children of the unit unitTreeId
                if (unit.AnnotationUnits[i].AnnotationUnits) {
                    _checkIfThereIsUnitWithThisToken(unit.AnnotationUnits[i], token, inChildUnitTreeId);
                }
            }
        }

        // Old function
        // function checkInChildUnitTreeId(unit, token) {
        //     var inChildUnitTreeId = token.inChildUnitTreeId;
        //
        //     // If not null: should be a tree_id of a child of unitTreeId and should be a token of that child.
        //     if (inChildUnitTreeId) {
        //         // Check that child unit is child of current unit (by prefix)
        //         if (!validPrefix(unit.tree_id, inChildUnitTreeId)) {
        //             throw "The child unit (" + inChildUnitTreeId + ") is not a child of the current unit (" + unit.tree_id + ").";
        //         }
        //
        //         // check if there is a unit that contains this token
        //         _checkIfThereIsUnitWithThisToken(unit, token, inChildUnitTreeId);
        //
        //         if (!AssertionService.flagToInChildUnitTreeId) {
        //             throw "inChildUnitTreeId is not null: should be a tree_id of a child of unitTreeId and should be a token of that child.";
        //         }
        //     }
        //
        //     // If null: cannot be a token of any of the children of the unit unitTreeId
        //     // if (!inChildUnitTreeId) {
        //     //     _checkIfThereIsUnitWithThisToken(unit, token, inChildUnitTreeId);
        //     // }
        // }

        // Make sure that the child unit is really a child of the current unit, and that this token is really in it.
        function checkInChildUnitTreeId(unit, token) {
            if (!token.inChildUnitTreeId) {
                return;
            }
            // Check inChildUnitTreeId is a child of unit
            var childUnit = undefined;
            for (var i = 0; i < unit.AnnotationUnits.length; i++) {
                if (token.inChildUnitTreeId === unit.AnnotationUnits[i].tree_id) {
                    childUnit = unit.AnnotationUnits[i];
                    break;
                }
            }
            if (!childUnit) {
                throw "There is no child unit with id " + token.inChildUnitTreeId;
            }
        }

        // Checking the tokens against the tokenMap
        function checkTokensAndTokenMap(unit) {
            // tokenMap - tokens object: {id: token, id: token, ...}
            if (!unit.tokens.length) {
                throw "There is no token list in unit " + unit.tree_id;
            }
            var tokenMap_ids = Object.keys(unit.tokenMap);
            if (tokenMap_ids.length !== unit.tokens.length) {
                throw "The lengths of tokens and tokenMap are not equals";
            }
            for (var i = 0; i < tokenMap_ids.length; i++) {
                if (parseInt(tokenMap_ids[i]) !== unit.tokens[i].static.id) {
                    throw "The ids at place " + i + " are different between token map and tokens";
                }
                if (unit.tokens[i].static.id !== unit.tokenMap[unit.tokens[i].static.id].id) {
                    throw "The map of id = " + unit.tokens[i].static.id + " does not point to the token with this id";
                }
            }
        }


        // find token in tree.tokens according to token id
        function _findToken(treeTokens, id) {
            for (var i = 0; i < treeTokens.length; i++) {
                if (treeTokens[i].static.id === id) {
                    return treeTokens[i];
                }
            }
        }

        // verify that positionInChildUnit exist and the value is correct.
        // function checkPositionInChildUnit(positionInChildUnit, index, tokensLength, unit, token) {
        //     console.log("check position---positionInChildUnit, index, tokensLength, unit, token=", positionInChildUnit, index, tokensLength, unit, token)
        //     switch(positionInChildUnit) {
        //         case 'First': {
        //             if (index !== 0) {
        //                 throw "positionInChildUnit is 'First', but the token is not the first in tokens list, token is " + token.static.text + ", unit is " + unit.tree_id;
        //             }
        //             break;
        //         }
        //         case 'Middle': {
        //             if (index === 0) {
        //                 throw "positionInChildUnit is 'Middle', but the token is the first in tokens list, token is " + token.static.text  + ", unit is " + unit.tree_id;
        //             } else if (index === tokensLength-1) {
        //                 throw "positionInChildUnit is 'Middle', but the token is the last in tokens list, token is " + token.static.text  + ", unit is " + unit.tree_id;
        //             }
        //             break;
        //         }
        //         case 'Last': {
        //             if (index !== tokensLength-1) {
        //                 throw "positionInChildUnit is 'Last', but the token is not the last in tokens list, token is " + token.static.text  + ", unit is " + unit.tree_id;
        //             }
        //             break;
        //         }
        //         case 'FirstAndLast': {
        //             if (tokensLength !== 1) {
        //                 throw "positionInChildUnit is 'FirstAndLast', but the tokens list length is " + tokens.length; + ", , token is " + token.static.text + ", unit is " + unit.tree_id;
        //             }
        //             break;
        //         }
        //         default: {
        //             throw "positionInChildUnit value is not correct (" + positionInChildUnit + ").";
        //         }
        //     }
        // }

        // function checkPositionAndInChildUnit(token, unit) {
        //     if (token.inChildUnitTreeId && !token.positionInChildUnit) {
        //         throw "inChildUnitTreeId exist, but positionInChildUnit not, token="+ token.static.text;
        //     }
        //     if (!token.inChildUnitTreeId && token.positionInChildUnit) {
        //         throw "positionInChildUnit exist, but inChildUnitTreeId not, token="+  token.static.text;
        //     }
        //     if (!token.inChildUnitTreeId && !token.positionInChildUnit) {
        //         return
        //     }
        //
        //     // Check inChildUnitTreeId is a child of unit
        //     var childUnit = undefined;
        //     for (var i = 0; i < unit.AnnotationUnits.length; i++) {
        //         if (token.inChildUnitTreeId === unit.AnnotationUnits[i].tree_id) {
        //             childUnit = unit.AnnotationUnits[i];
        //             break;
        //         }
        //     }
        //     if (!childUnit) {
        //         throw "There is no child unit with id inChildUnitTreeId=" + token.inChildUnitTreeId;
        //     }
        //
        //     console.log("**********childUnit=", childUnit)
        //     for (var i = 0 ; i < childUnit.tokens.length; i++) {
        //         if (childUnit.tokens[i].static.id === token.static.id) {
        //             checkPositionInChildUnit(token.positionInChildUnit, i, childUnit.tokens.length, unit, token);
        //             break;
        //         }
        //     }
        // }

        function checkTokens(unit, treeTokens) {
            // Check tokens against tokenMap
            if (unit.tree_id === "0") {
                checkTokensAndTokenMap(unit);
            }

            var tokens = unit.tokens;
            for (var t = 0; t < tokens.length; t++) {

                /*** Check inChildUnitTreeId ***/
                checkInChildUnitTreeId(unit, tokens[t]);

                /*** Check positionInChildUnit ***/
                // if (unit.tree_id!=="0") {
                //     checkPositionAndInChildUnit(tokens[t], unit);
                //     checkPositionInChildUnit(tokens[t].positionInChildUnit, t, tokens.length);
                // }

                /*** Check indexInUnit ***/
                // should be the same as the index of the token inside the unit.tokens
                if (tokens[t].static.text !== 'IMPLICIT UNIT' && t !== tokens[t].indexInUnit) {
                    if (!tokens[t].indexInUnit) {
                        throw "indexInUnit isn't exists in token " + tokens[t].static.text + " t = " + t + " in unit " + unit.tree_id;
                    }
                    throw "indexInUnit should be the same as the index of the token inside the unit.tokens, unit = " + unit.tree_id + ", token = " + tokens[t].static.text + ", t = " + t + ", indexInUnit = " + tokens[t].indexInUnit;
                }

                /*** Check unitTreeId ***/
                // unitTreeId: the same as the tree_id of the unit the token is in
                var unitTreeId = tokens[t].unitTreeId;
                if (unitTreeId !== unit.tree_id) {
                    throw "unitTreeId should be the same as the tree_id of the unit the token is in";
                }

            }

            for (var i = 0; i < unit.AnnotationUnits.length; i++) {
                if (unit.AnnotationUnits[i].AnnotationUnits) {
                    checkTokens(unit.AnnotationUnits[i], treeTokens);
                }
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
            var treeTokensIdsList = [];
            for (var i = 0; i < serverData.tokens.length; i++) {
                treeTokensIdsList.push(serverData.tokens[i].id);
            }
            for (i = 1; i < serverData.annotation_units.length; i++) { // Beginning from 1, because unit 0 doesn't have children_tokens
                // If it's an implicit unit don't check it because implicit unit doesn't have children_tokens
                if (serverData.annotation_units[i].type === 'IMPLICIT') {
                    if (serverData.annotation_units[i].children_tokens && serverData.annotation_units[i].children_tokens.length) {
                        throw "Annotation unit " + i + " is an implicit unit, it should not have children tokens";
                    }
                    return;
                }
                // Check if children_tokens exist
                if (!serverData.annotation_units[i].children_tokens.length) {
                    throw "Annotation unit " + i + " doesn't have children tokens";
                }
                var childrenTokensIdsList = [];
                // Check if children token in the tokens of the task
                for (var j = 0; j < serverData.annotation_units[i].children_tokens.length; j++) {
                    if (!treeTokensIdsList.includes(serverData.annotation_units[i].children_tokens[j].id)) {
                        throw "Token " + serverData.annotation_units[i].children_tokens[j].id + " doesn't exist in the tokens of the task";
                    }

                    // build children_tokens ids list
                    childrenTokensIdsList.push(serverData.annotation_units[i].children_tokens[j].id);
                }
                // Check no duplicates in childrenTokensIdsList
                for (var k = childrenTokensIdsList.length - 1; k < 0; k--) {
                    if (k && childrenTokensIdsList[k] <= childrenTokensIdsList[k - 1]) {
                        throw "Tokens " + childrenTokensIdsList[k] + ", " + childrenTokensIdsList[k - 1] + " are duplicated or not sorted";
                    }
                }
            }
            // Check start_index in serverData.tokens
            checkCurrentTaskTokens(serverData.tokens);

            // A sub-set of the children_tokens of the parent
            checkChildrenTokensSubSet(serverData);
        }

        function _firstPrefix(id) {
            var isNum = /^\d+$/.test(id);
            if (isNum) { // without '-'
                return null;
            }
            var index = id.lastIndexOf("-");
            return id.slice(0, index);
        }

        /***
         * recursive function, send to check correctly ordered function
         * set the first token in unit
         * @param unit
         */
        function checkTokensOrder(unit) {
            // Check implicit unit in the beginning
            var firstPrefix = _firstPrefix(unit.tree_id);
            if (firstPrefix) {
                if (unit.unitType === 'IMPLICIT') {
                    if (AssertionService.implicitFinished[firstPrefix]) { // implicit unit appears after another unit
                        throw "Implicit unit is no in the beginning, " + unit.tree_id;
                    }
                } else {
                    AssertionService.implicitFinished[firstPrefix] = true;
                }
            }
            if (unit.tree_id !== "0") {
                checkCorrectlyOrdered(AssertionService.firstTokenInPreUnit, unit.tokens[0].id, unit.tree_id.endsWith('-1') || unit.tree_id === '1');// if id ='...-1' or '1', this is the first child of the unit
            }
            AssertionService.firstTokenInPreUnit = unit.tokens[0].id;

            for (var i = 0; i < unit.AnnotationUnits.length; i++) {
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
         * Check if cloned_from_tree_id matches to cloned_to_tree_ids and the opposite
         * @param unit
         */
        function checkRemoteUnits(unit) {
            if (unit.cloned_from_tree_id) {// This is remote unit
                var clonedFromUnit = getUnitById(unit.cloned_from_tree_id);
                // Check if clonedFromUnit.cloned_to_tree_ids contain unit.tree_id
                var index = clonedFromUnit.cloned_to_tree_ids.indexOf(unit.tree_id);
                if (index < 0) {
                    throw "Cloned from unit " + clonedFromUnit.tree_id + " doesn't contain tree id " + unit.tree_id + " in his cloned_to_tree_ids list";
                }
            } else if (unit.cloned_to_tree_ids) { // This is cloned unit
                var remoteUnit = undefined;
                for (var j = 0; j < unit.cloned_to_tree_ids.length; j++) {
                    remoteUnit = getUnitById(unit.cloned_to_tree_ids[j]);
                    if (!remoteUnit) {
                        throw "There is no remote unit with id " + unit.cloned_to_tree_ids[j];
                    }
                    if (remoteUnit.cloned_from_tree_id !== unit.tree_id) {
                        throw " Remote unit " + remoteUnit.tree_id + " has cloned_from_tree_id " + remoteUnit.cloned_from_tree_id + " !== " + unit.cloned_to_tree_ids[j];
                    }
                }
            }

            if (unit.unitType !== 'REMOTE') {
                if (unit.cloned_from_tree_id) {
                    throw "Unit " + unit.tree_id + " is " + unit.unitType + " unit, but it has a cloned from tree id = " + unit.cloned_from_tree_id;
                }
            }

            for (var i = 0; i < unit.AnnotationUnits.length; i++) {
                checkRemoteUnits(unit.AnnotationUnits[i]);
            }
        }

        function checkSlotLayer(tree) {
            for (var i = 0; i < tree.AnnotationUnits.length; i++) {
                for (var c = 0; c < tree.AnnotationUnits[i].categories.length; c++) {
                    var slotFlag1 = false;
                    var slotFlag2 = false;

                    // Check if there is a category with slot one or two => slotOne or slotTwo is true
                    if (tree.AnnotationUnits[i].categories[c].slot === 1) {
                        if (slotFlag1) {
                            throw "There are few categories with slot 1 in unit " + tree.AnnotationUnits[i].tree_id;
                        } else {
                            var slotFlag1 = true;
                            if (!tree.AnnotationUnits[i].slotOne) {
                                // debugger
                                throw "Unit " + tree.AnnotationUnits[i].tree_id + " has no 'slotOne=true'";
                            }
                        }
                    }
                    if (tree.AnnotationUnits[i].categories[c].slot === 2) {
                        if (slotFlag2) {
                            throw "There are few categories with slot 2 in unit " + tree.AnnotationUnits[i].tree_id;
                        } else {
                            var slotFlag2 = true;
                            if (!tree.AnnotationUnits[i].slotTwo) {
                                throw "Unit " + tree.AnnotationUnits[i].tree_id + " has no 'slotTwo=true'";
                            }
                        }
                    }
                }

                // Check if slotOne or slotTwo is true => there is a category with slot one or two
                var slot1Exist = false;
                var slot2Exist = false;
                if (tree.AnnotationUnits[i].slotOne || tree.AnnotationUnits[i].slotTwo) {
                    for (c = 0; c < tree.AnnotationUnits[i].categories.length; c++) {
                        if (tree.AnnotationUnits[i].categories[c].slot === 1) {
                            slot1Exist = true;
                        }
                        if (tree.AnnotationUnits[i].categories[c].slot === 2) {
                            slot2Exist = true;
                        }
                    }
                    if (tree.AnnotationUnits[i].slotOne && !slot1Exist) {
                        throw "slotOne is true in unit " + tree.AnnotationUnits[i].tree_id + ", but there is no a category with this slot.";
                    }
                    if (tree.AnnotationUnits[i].slotTwo && !slot2Exist) {
                        // debugger
                        throw "slotTwo is true in unit " + tree.AnnotationUnits[i].tree_id + ", but there is no a category with this slot.";
                    }
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
            console.log("-------------------------check tree-------------------------", tree);
            try {
                AssertionService.tree = tree; // Save DataService.tree into AssertionService.tree (to getUnitByI function).

                // Check tree ids
                checkTreeId(tree.tree_id);
                AssertionService.unitsIdsList = [];
                AssertionService.implicitFinished = {};

                buildUnitsIdList(tree.tree_id, tree.AnnotationUnits);
                checkUnitsIdsList();

                // Check annotations units
                checkAnnotationUnits(tree.AnnotationUnits);

                // Check tokens fields (with static)
                checkTokens(tree, tree.tokens);

                // TODO- delete DataService.serverData, change tokens in DataService.tree to children_tokens, and then check tree.children_tokens (email, March 27)
                // Check children tokens
                checkChildrenTokens(serverData);

                // Correctly ordered (by first token, implicit units come first)
                AssertionService.firstTokenInPreUnit = tree.tokens[0].static.id;
                checkTokensOrder(tree);

                checkRemoteUnits(tree);

                // Checking only if the tree is slot layer
                if (serverData.project.layer.slotted) {
                    checkSlotLayer(tree)
                }
            } catch (e) {
                console.error(e);
            }
        }

    }

})();
