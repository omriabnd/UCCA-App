(function() {
    'use strict';

    angular.module('zAdmin.annotation.data')
        .factory('DataService',DataService);

    function DataService($q,$http,apiService,$rootScope,restrictionsValidatorService,ENV_CONST,Core, AssertionService, $uibModal) {
        trace("DataService is here");

        var lastInsertedUnitIndex = 0;
        var unitType = 'REGULAR';
        var annotation_units = [];
        var changedIdsObject = [];
        var hashTables = {
            tokensHashTable: {},
            categoriesHashTable: {}
        };

        var DataService = {
            /**
             * A data structure that contains rows of selectable words.
             */
            tree: {
                tree_id : '0',
                text : '',
                numOfAnnotationUnits: 0,
                unitType:'REGULAR',
                containsAllParentUnits: false,
                AnnotationUnits : [],
                gui_status: 'OPEN',
                tokens: []
            },
            changedIdsObject: changedIdsObject,
            lastInsertedUnitIndex: lastInsertedUnitIndex,
            unitType:unitType,
            serverData:null,
            tokensWithComments: new Set(),
            baseTokenData: ['id', 'start_index', 'end_index', 'index_in_task', 'require_annotation', 'text', 'tokenization_task_id', 'splitByTokenization'],
            hashTables: hashTables,
            categories: [],
            addRemoteUnit: addRemoteUnit,
            deleteRemoteUnit: deleteRemoteUnit,
            updateClonedIds: updateClonedIds,
            // changeRemoteUnitTreeId: changeRemoteUnitTreeId,
            getData: getData,
            insertToTree: insertToTree,
            toggleCategoryForUnit:toggleCategoryForUnit,
            printTree: printTree,
            getNextUnit: getNextUnit,
            getPrevUnit: getPrevUnit,
            getNextSibling:getNextSibling,
            getPrevSibling:getPrevSibling,
            getUnitById:getUnitById,
            getParentUnitId:getParentUnitId,
            getParentUnit:getParentUnit,
            saveTask: saveTask,
            submitTask: submitTask,
            initTree:initTree,
            deleteUnit:deleteUnit,
            getSibling:getSibling,
            createHashTables:createHashTables,
            isTokenInUnit:isTokenInUnit,
            resetTree:resetTree,
            sortAndUpdate:sortAndUpdate,
            positionInUnit: positionInUnit,
            REMOTE_TEMPS_OBJ_FOR_UPDATE_AFTER_DELETE_UNIT_FOR_UPDATE_AFTER_DELETE_UNIT:{},
            USED_AS_REMOTE_TEMPS_OBJ_FOR_UPDATE_AFTER_DELETE_UNIT_FOR_UPDATE_AFTER_DELETE_UNIT:{},
            createTokensHashByTokensArrayForPassage:createTokensHashByTokensArrayForPassage
        };

        return DataService;

        // We're adding cloned_to_tree_ids to each unit - a list of units that are all cloned from this unit.
        // Adding code that sets cloned_from_tree_id and cloned_to_tree_ids to the units.

        /**
         * Adds the tree_id of the new remote unit to the cloned from unit cloned_from_tree_id list.
         * @param remoteUnit - the new remote unit to add
         */
        function addRemoteUnit(remoteUnit) {
            trace("DataService - addRemoteUnit");

            var clonedFromUnit = getUnitById(remoteUnit.cloned_from_tree_id);
            if (!clonedFromUnit.cloned_to_tree_ids) {
                clonedFromUnit.cloned_to_tree_ids = [remoteUnit.tree_id];
            } else {
                clonedFromUnit.cloned_to_tree_ids.push(remoteUnit.tree_id);
            }
        }

        /**
         * Removes the tree_id of the deleted remote unit from the cloned from unit cloned_from_tree_id list.
         * @param remoteUnit - the unit to delete
         */
        function deleteRemoteUnit(remoteUnit) {
            trace("DataService - deleteRemoteUnit");
            var clonedFromUnit = getUnitById(remoteUnit.cloned_from_tree_id);

            if (!clonedFromUnit) {
                throw "In deleteRemoteUnit function, there is no clonedFromUnit with id " + remoteUnit.cloned_from_tree_id;
            }

            var index = clonedFromUnit.cloned_to_tree_ids.indexOf(remoteUnit.tree_id);
            if (index > -1) {
                clonedFromUnit.cloned_to_tree_ids.splice(index, 1);
            } else {
                throw "Cloned from unit " + clonedFromUnit.tree_id + " doesn't have cloned to tree id " + remoteUnit.tree_id;
            }
        }


        function updateClonedIds(unit) {
            if(unit.AnnotationUnits && unit.AnnotationUnits.length > 0) {
                for (var i = 0; i < unit.AnnotationUnits.length; i++) {
                    if (unit.AnnotationUnits[i] == undefined) {
                        continue
                    }

                    // Check if there is a cloned_from or a cloned_to id from the old ids list, changed it to the new id from the list.
                    if (unit.AnnotationUnits[i].cloned_from_tree_id) {
                        for (var p = 0; p < DataService.changedIdsObject.length; p++) {
                            if (unit.AnnotationUnits[i].cloned_from_tree_id === DataService.changedIdsObject[p].oldTreeId) {
                                unit.AnnotationUnits[i].cloned_from_tree_id = DataService.changedIdsObject[p].newTreeId;
                                break;
                            }
                        }
                    } else if (unit.AnnotationUnits[i].cloned_to_tree_ids) {
                        for (var j = 0; j < unit.AnnotationUnits[i].cloned_to_tree_ids.length; j++) {
                            for (var p = 0; p < DataService.changedIdsObject.length; p++) {
                                if (unit.AnnotationUnits[i].cloned_to_tree_ids[j] === DataService.changedIdsObject[p].oldTreeId) {
                                    unit.AnnotationUnits[i].cloned_to_tree_ids[j] = DataService.changedIdsObject[p].newTreeId;
                                    break;
                                }
                            }
                        }
                    }
                    updateClonedIds(unit.AnnotationUnits[i]);
                }
            }
        }

        /**
         * Checks if unit contains cloned_from_tree_id, so the unit is remote, and then updates in the clonedFromUnit.
         * Else, if unit contains cloned_to_tree_ids, so the unit is regular cloned unit, and then updates in her remotes units.
         * @param unit - unit to upadte (remote or regular-cloned)
         * @param oldTreeId - the old id to (of the unit)
         */
        // function changeRemoteUnitTreeId(unit, oldTreeId) {
        //     // debugger
        //     trace("DataService - changeRemoteUnitTreeId");
        //     var newTreeId = unit.tree_id;
        //
        //     console.log("####changeRemoteUnitTreeId, unit=, newTreeId=", unit, newTreeId);
        //     if (unit.cloned_from_tree_id) { // the unit is remote, so we have to update in the cloned from unit
        //         var clonedFromUnit = getUnitById(unit.cloned_from_tree_id);
        //         if (clonedFromUnit) {
        //             var index = clonedFromUnit.cloned_to_tree_ids.indexOf(oldTreeId);
        //             if (index > -1) {
        //                 clonedFromUnit.cloned_to_tree_ids[index] = newTreeId;
        //             }
        //         } else {
        //             debugger;
        //             console.log("changeRemoteUnitTreeId-----------------------clonedFromUnit is null");
        //         }
        //     } else if (unit.cloned_to_tree_ids) { // the unit is cloned unit, update in the remotes
        //         var remoteUnit = undefined;
        //         for (var i = 0; i < unit.cloned_to_tree_ids.length; i++) {
        //             remoteUnit = getUnitById(unit.cloned_to_tree_ids[i]);
        //             if (remoteUnit) {
        //                 remoteUnit.cloned_from_tree_id = newTreeId;
        //             } else {
        //                 debugger;
        //                 console.log("changeRemoteUnitTreeId----------------------------remoteUnit is null");
        //             }
        //         }
        //     }
        // }

        function initTree(){
            trace("DataService - initTree");
            DataService.serverData.annotation_units.forEach(function(unit,index){
                var tokenStack = [];
                unit.children_tokens.forEach(function(token){
                    tokenStack.push(hashTables.tokensHashTable[token.id]);
                })

            });
            DataService.unitType = 'REGULAR';
        }

        /**
         * Build tokens hash object
         * @param annotationTokensArray
         * @returns hash tokens object{{}}
         */
        function tokensArrayToHash(annotationTokensArray){
            trace("DataService - tokensArrayToHash");
            var hash = {};
            annotationTokensArray.forEach(function(token){
                hash[token.id] = DataService.hashTables.tokensHashTable[token.id]
            });
            return hash;
        }

        /**
         * Save the hash tokens object in DataService.tree.tokenMap
         * @param annotationTokensArray
         */
        function createTokensHashByTokensArrayForPassage(annotationTokensArray){
            trace("DataService - createTokensHashByTokensArrayForPassage");
            DataService.tree.tokenMap = tokensArrayToHash(annotationTokensArray);
            // TODO: Need send children_tokens instead of tokens ?
            //debugger
            //AssertionService.checkTokenMap(DataService.tree.tokenMap, annotationTokensArray);
        }

        /**
         * Create hash tables, and save them in DataService.hashTables:
         * tokensHashTable- hash object of serverData.tokens.
         * categoriesHashTable- hash object of categories.
         */
        function createHashTables(){
            trace("DataService - createHashTables");
            DataService.serverData.tokens.forEach(function(token){
                DataService.hashTables.tokensHashTable[token.id] = token;
            });

            DataService.categories.forEach(function(category){
                DataService.hashTables.categoriesHashTable[category.id] = category;
            });
        }

        /**
         * Prints the data structure tree.
         */
        function printTree(){
            trace("DataService - printTree");
            console.log(DataService.tree);
            console.log(JSON.stringify(DataService.tree));
        }
        /**
         * Get data by given url.
         * @param url - the url to fetch data from.
         * @returns {*} - The response from the WS in the given url.
         */
        function getData(url) {
            trace("DataService - getData");
            return $http.get(url).then(successFunction, errorFunction);
        }

        /**
         * Return parent unit by given son unitId
         * @param unitId - the unitId to get his parent
         * @returns {*}- the parent unit
         */
        function getParentUnit(unitId){
            trace("DataService - getParentUnit");
            return getUnitById(getParentUnitId(unitId));
        }

        /**
         * Reset tree, put reset about serverData
         */
        function resetTree(){
            trace("DataService - resetTree");
            return apiService.annotation.putTaskData('reset',DataService.serverData).then(function(res){
                return res;
            });

            /*
            return $q(function(resolve, reject) {
                try{
                    $rootScope.$broadcast("DeleteSuccess",{reset:true});
                    $rootScope.$broadcast("resetCursor_" + 0);
                    DataService.tree.AnnotationUnits = [];

                    DataService.tree.tokens.forEach(function(token){
                        token["inParent"] = null;
                    });

                    $rootScope.$broadcast("ResetSuccess");

                    return resolve('Success');
                }catch(e){
                    return resolve('Failed');
                }
            });
            */
        }

        /***
         * Add Category to unit
         * @param unitId - which unit to add the category
         * @param category - the category to add to the unit
         * @returns {*}
         */
        function toggleCategoryForUnit(unitId, category,inInitStage){
            console.log("tree=", DataService.tree);
            trace("DataService - toggleCategoryForUnit");
            return $q(function(resolve, reject) {

                if(category.id == undefined){
                    return reject();
                }

                var unit = getUnitById(unitId);

                if(unit === null){
                    return reject('ToggleSuccess');
                }
                var elementPos = category ? unit.categories.map(function(x) {return x.id; }).indexOf(category.id) : -1;

                //if the category isn't assigned to that unit yet - add it
                if(elementPos === -1) {
                    if (!inInitStage && !restrictionsValidatorService.checkRestrictionsBeforeAddingCategory(unit,category)){
                        return reject("Failed") ;
                    }
                    unit.children_tokens = unit.tokens;

                    if($rootScope.isSlottedLayerProject){

                        var firstSlotIndex = 0;
                        for(var i=0; i<unit.categories.length; i++){
                            var currentCategory = unit.categories[i];
                            if(currentCategory.fromParentLayer){
                                firstSlotIndex++;
                            }
                        }

                        if(!unit.slotOne){
                            unit.categories[firstSlotIndex] = category;
                        }else if(!unit.slotTwo){
                            unit.categories[firstSlotIndex+1] = category;
                        }
                        unit = updateUnitSlots(unit);
                    }else{
                        unit.categories.push(category);
                    }
                    // unit = updateUnitSlots(unit);
                }
                //if the category is already assigned to a unit, remove it
                else{
                    if(unit.categories.length > 1){

                        if($rootScope.isSlottedLayerProject){
                            var firstSlotIndex = 0;
                            for(var i=0; i<unit.categories.length; i++){
                                var currentCategoy = unit.categories[i];
                                if(currentCategoy.fromParentLayer){
                                    firstSlotIndex++;
                                }
                            }
                            unit.categories[elementPos] = {};

                            switch(elementPos-firstSlotIndex){
                                case 0:
                                    unit.slotOne = false;
                                    break;
                                case 1:
                                    unit.slotTwo = false;
                                    break;

                            }
                        }else{
                            unit.categories.splice(elementPos,1);
                        }

                    }else{
                        unit.categories = [];
                    }
                }
                // DataService.getParentUnit(unit.tree_id).gui_status = "OPEN";
                // DataService.getUnitById(unit.tree_id).gui_status = "OPEN";

                // Comment -  because the tree has not yet been built in its entirety, and token.inChildUnit field is missing during the building.
                // AssertionService.checkTree(DataService.tree, DataService.serverData);

                $rootScope.$broadcast("ToggleSuccess",{categories: unit.categories, id: unit.tree_id});
                resolve('ToggleSuccess');
            })

        }

        /**
         * Check if specific token exist in specific unit-
         * return true if the token exist in sons units (like inChildUnitTreeId field)
         * @param selectedUnit
         * @param token
         * @returns {boolean} - Id token exist in selectedUnit
         */
        function isTokenInUnit(selectedUnit, token){
            trace("DataService - isTokenInUnit");
            var tokenInUnit = false;
            if(selectedUnit.AnnotationUnits === undefined){
                selectedUnit.AnnotationUnits = [];
            }
            for(var i=0; i<selectedUnit.AnnotationUnits.length; i++){
                if(selectedUnit.AnnotationUnits[i] == undefined){
                    continue
                }
                var tokenPosition = selectedUnit.AnnotationUnits[i].tokens.map(function(x) {return x.static.id; }).indexOf(token.static.id);
                if(tokenPosition > -1){
                    tokenInUnit = selectedUnit.AnnotationUnits[i].tree_id;
                    break;
                }
            }
            return tokenInUnit;
        }

        /**
         * Insert to tree- insert new unit to tree
         * @param newObject - object to insert to the tree
         * @param level - the parent unit id
         * @param inInitStage - boolean value, if the tree is initializing now
         * @returns {*} - resolve insert success
         */
        function insertToTree(newObject, level, inInitStage){
            // level is actually the parentTreeId

            trace("DataService - insertToTree");
            // console.log("In insertToTree, newObject=", newObject);

            return $q(function(resolve, reject) {
                if (!inInitStage && DataService.serverData.project.layer.type === ENV_CONST.LAYER_TYPE.REFINEMENT) {
                    Core.showAlert("Cant create annotation units in refinement layer")
                    console.log('ALERT - insertToTree -  prevent insert to tree when refinement layer');
                    reject(selectedUnitId);
                }

                var parentUnit = getUnitById(level);

                if (!parentUnit.AnnotationUnits) {
                    parentUnit.AnnotationUnits = [];
                }
                newObject.parent_tree_id = parentUnit.tree_id;

                if (!newObject.tree_id) {
                    // Set the initial treeId, which will be the last child of the parent.
                    if (level.toString() === "0") {
                        //Passage unit or it children units.
                        newObject.tree_id = parseInt(parentUnit.AnnotationUnits.length + 1).toString();
                    } else {
                        newObject.tree_id = level + '-' + parseInt(parentUnit.AnnotationUnits.length + 1);
                    }
                }


                newObject.comment = newObject.comment || "";
                newObject.cluster = newObject.cluster || "";


                var units = []; // All sibling units that should become child units

                if (newObject.unitType != "REMOTE") {
                    // Fill the inChildUnitTreeId of the tokens in the parent
                    newObject.tokens.forEach(function (token) {
                        if (token.
                            inChildUnitTreeId !== null && token.inChildUnitTreeId !== undefined) {
                            var unitPos = units.map(function (x) {
                                return x.id;
                            }).indexOf(token.inChildUnitTreeId);
                            if (unitPos === -1) {
                                units.push({
                                    id: token.inChildUnitTreeId
                                });
                            };
                            //Find token in parent
                            if (token.unitTreeId === undefined) {
                                token.unitTreeId = "0";
                            }

                            var parentUnit = DataService.getUnitById(token.unitTreeId);
                            var elementPos = parentUnit.tokens.map(function (x) {
                                return x.static.id;
                            }).indexOf(token.static.id);

                            if (elementPos > -1) {
                                parentUnit.tokens[elementPos].inChildUnitTreeId = newObject.tree_id;
                            }
                        }
                    });
                }

                newObject.unitType = newObject.unitType ? newObject.unitType : "REGULAR";


                //Convert siblings into children to new unit
                if (units.length > 1) {

                    units.forEach(function (unit) {
                        var parentUnitId = getParentUnitId(unit.id);
                        var parentUnit = getUnitById(parentUnitId);
                        var elementPos = parentUnit.AnnotationUnits.map(function (x) {
                            return x.tree_id;
                        }).indexOf(unit.id);
                        if (newObject.AnnotationUnits === undefined) {
                            newObject.AnnotationUnits = [];
                        }
                        if (elementPos > -1) {
                            newObject.AnnotationUnits.push(angular.copy(parentUnit.AnnotationUnits[elementPos]));
                        }
                    })
                }

                newObject.children_tokens = newObject.tokens;

                //Removing children units from parent unit
                if (units.length > 1) {
                    units.forEach(function (unit) {
                        var parentUnitId = getParentUnitId(unit.id);
                        var parentUnit = getUnitById(parentUnitId);
                        var elementPos = parentUnit.AnnotationUnits.map(function (x) {
                            return x.tree_id;
                        }).indexOf(unit.id);
                        if (elementPos > -1) {
//                            newObject.AnnotationUnits.push(angular.copy(parentUnit.AnnotationUnits[elementPos]));
                            parentUnit.AnnotationUnits.splice(elementPos, 1);
                        }
                    })
                }

                // // Update indexInUnit attribute to tokens in the new unit.
                newObject.tokens.forEach(function (token, index, inInit) {
                    token.indexInUnit = index;
                });

                /**
                 * This part computes index_int, which is the index where the unit will be inserted into the list
                 * of children for the current parent unit.
                 */
                var indexToInsert = newObject.tree_id.split("-");  // "5-4-3" becomes 3
                var index_int = parseInt(indexToInsert[indexToInsert.length - 1]);


                /**
                 * If the unit to be inserted (newObject) is a remote unit, find the first slot in AnnotationUnits
                 * that is empty, and set that as the index where newObject will be inserted. If there is none,
                 * set the index for insertion to be at the end.
                 */
                /**
                 * TODO: after modifying the backend to return tree_ids of remote units as their actual display
                 *       tree_ids, remove this part of the code and check if the tree is built correctly.
                 */
                if (newObject.is_remote_copy) {
                    index_int = (parentUnit.AnnotationUnits.length + 1).toString();
                    for (var i = 0; i < parentUnit.AnnotationUnits.length; i++) {
                        if (parentUnit.AnnotationUnits[i].tree_id.split("-").pop() !== (i + 1).toString()) {
                            parentUnit.AnnotationUnits.splice(i, 0, newObject); // add item newObject to the list in place i, delete 0 items
                            index_int = i + 1;
                            break;
                        }
                    }

                    /**
                     * For remote units, the annotation_unit_tree_id is that of the unit it was cloned from. Therefore,
                     * we need to update it and this is done in the following line.
                     */
                    newObject.tree_id = newObject.parent_tree_id + "-" + index_int.toString(); // Set the tree ID based on the actual location

                    addRemoteUnit(newObject);
                }

                /**
                 * Sort the tokens.
                 */
                newObject.tokens.sort(function (a, b) {
                    if (a.static.start_index > b.static.start_index) {
                        return 1
                    } else if (a.static.start_index < b.static.start_index) {
                        return -1
                    } else return 0
                })

                if (index_int > parentUnit.AnnotationUnits.length + 1) {
                    index_int = parentUnit.AnnotationUnits.length + 1;
                }

                // Update slots information
                if ($rootScope.isSlottedLayerProject) {
                    newObject = updateUnitSlots(newObject);
                }

                if(!inInitStage) {
                    Core.openAllUnits(newObject);
                }

                parentUnit.AnnotationUnits[index_int - 1] = newObject;

                var parentUnitTokens = parentUnit.tokens;

                parentUnitTokens.forEach(function (token, index) {
                    var elementPos = newObject.tokens.map(function (x) {
                        return x.static.id;
                    }).indexOf(token.static.id);
                    if (elementPos === -1) {
                        token['inChildUnitTreeId'] = null;
                    }
                });


//                parentUnit.gui_status = "OPEN";

                if (!inInitStage) { // After add unit- send to sortAndUpdate. (add unit, no in tree initializing)
                    // Removed code - The is sorUndUpdate in selectionHandler service in the end of initTree.
                    sortAndUpdate(true); // This is needed when adding a unit whose location is before existing units
                }

                updateInUnitIdsForTokens(DataService.tree);

                // update indexInUnit in unit 0 (to tree.tokens) -- maybe in another place  ???
                // DataService.tree.tokens.forEach(function (token, index) {
                //     token.indexInUnit = index;
                // });

                newObject.unitType !== "REMOTE" ? $rootScope.$broadcast("InsertSuccess", {
                    dataBlock: {
                        id: level,
                        AnnotationUnits: getUnitById(level).AnnotationUnits
                    }, newUnitId: newObject.tree_id
                }) : '';

                if (newObject.comment) {
                    newObject.tokens.forEach(function (token) {
                        DataService.tokensWithComments.add(token.static.id);
                    });
                    console.log(DataService.tokensWithComments);
                }

                // Check tree in AssertionService after add unit
                if (!inInitStage) {
                    // Add indexInUnit attribute to tree.tokens, its needed in the assertion
                    if (DataService.tree.tokens.length) {
                        if (DataService.tree.tokens[0].indexInUnit === null || DataService.tree.tokens[0].indexInUnit === undefined) {
                            DataService.tree.tokens.forEach(function (token, index) {
                                token.indexInUnit = index;
                            });
                        }
                    }
                    AssertionService.checkTree(DataService.tree, DataService.serverData);
                }
                return resolve({status: 'InsertSuccess',id: newObject.tree_id});
            });
        }

        function updateUnitSlots(newObject){
            trace("DataService - updateUnitSlots");
            var firstSlotIndex = 0; //the first slot not occupied by the parent layer's categories
            for(var i=0; i<newObject.categories.length; i++){
                var currentCategory = newObject.categories[i];
                if(currentCategory !== undefined && currentCategory.fromParentLayer){
                    firstSlotIndex++;
                }
            }
            if(newObject.categories[firstSlotIndex] !== undefined && newObject.categories[firstSlotIndex].id && !newObject.categories[firstSlotIndex].fromParentLayer){
                newObject.slotOne = true;
            }else{
                newObject.slotOne = false;
            }

            if(newObject.categories[firstSlotIndex+1] !== undefined && newObject.categories[firstSlotIndex+1].id && !newObject.categories[firstSlotIndex+1].fromParentLayer){
                newObject.slotTwo = true;
            }else{
                newObject.slotTwo = false;
            }

            return newObject;
        }

        /**
         * Calls to updateTreeIdsAndClonedIds function, and to sortTree function if the parameter doSort = true
         * Buggy function, as now, we commented her calls.
         * But it needed for special annotations, for example- annotate two units together
         * @param doSort
         */
        function sortAndUpdate(doSort){
            trace("DataService - sortAndUpdate");

            if(DataService.tree.AnnotationUnits.length > 0){
                updateTreeIdsAndClonedIds();

                doSort ? sortTree(DataService.tree.AnnotationUnits) : '';

                updateTreeIdsAndClonedIds();
            }
        }

        /**
         * Delete unit from tree
         * and update the tree without this unit
         * @param unitId
         * @returns {*}
         */
        function deleteUnit(unitId){
            trace("DataService - deleteUnit");
            return $q(function(resolve, reject) {
                var unit = getUnitById(unitId);
                var parentUnit = getUnitById(getParentUnitId(unitId));
                var splitUnitId = unit.tree_id.split('-');
                var unitPositionInParentAnnotationUnits = parseInt(splitUnitId[splitUnitId.length-1])-1;

                 if (unit.comment) {
                    open('app/pages/annotation/templates/deleteUnitWithComment.html','md', unit);
                } else {
                     $rootScope.$broadcast("RemoveBorder", {id: unit.tree_id});
                     if (!unit.AnnotationUnits || unit.AnnotationUnits.length === 0) {
                         // Remove unit from parent and that's it - there are no child units to handle
                         parentUnit.AnnotationUnits.splice(unitPositionInParentAnnotationUnits, 1);
                     } else {
                         // When deleting a unit, first delete her remote and implicit sons, and then move the regular sons to be children of her parent.
                         for (var i = 0; i < unit.AnnotationUnits.length; i++) {
                             if (unit.AnnotationUnits[i].unitType !== 'REGULAR') {
                                 if (unit.AnnotationUnits[i].unitType === 'REMOTE') {
                                     deleteRemoteUnit(unit.AnnotationUnits[i]);
                                 }
                                 unit.AnnotationUnits.splice(i, 1);
                                 i = i - 1;
                             }
                         }

                         // Move child to parent, so if X->Y->Z and Y is deleted, we get X->Z
                         var preArray = parentUnit.AnnotationUnits.slice(0, unitPositionInParentAnnotationUnits); // Parent units up to us
                         var afterArray = parentUnit.AnnotationUnits.slice(unitPositionInParentAnnotationUnits + 1, parentUnit.AnnotationUnits.length); // Parent units from us
                         parentUnit.AnnotationUnits = preArray.concat(unit.AnnotationUnits).concat(afterArray); // Move child units instead of us

                         // Old code
                         // for(i=0; i<parentUnit.AnnotationUnits.length; i++){
                         //     if(parentUnit.AnnotationUnits[i].unitType !== "REGULAR"){
                         //         if(DataService.unitsUsedAsRemote[parentUnit.AnnotationUnits[i].cloned_from_tree_id]){
                         //             if(DataService.unitsUsedAsRemote[parentUnit.AnnotationUnits[i].cloned_from_tree_id][parentUnit.AnnotationUnits[i].tree_id]){
                         //                 delete DataService.unitsUsedAsRemote[parentUnit.AnnotationUnits[i].cloned_from_tree_id][parentUnit.AnnotationUnits[i].tree_id];
                         //                 parentUnit.AnnotationUnits.splice(i,1);
                         //                 i--;
                         //             }
                         //         }
                         //         /* This code used to delete implicit units and remote units to other parts of the tree
                         //         else{
                         //             parentUnit.AnnotationUnits.splice(i,1);
                         //             i--;
                         //         } */
                         //
                         //     }
                         // }
                     }

                     sortAndUpdate(true);
                     // updateTreeIdsAndClonedIds();
                     //
                     // sortTree(DataService.tree.AnnotationUnits);
                     //
                     // updateTreeIdsAndClonedIds();

                     updateInUnitIdsForTokens(DataService.getParentUnit(unit.tree_id));

                     // $rootScope.$broadcast("resetCursor_" + parentUnit.tree_id, {
                     //     categories: unit.categories,
                     //     id: parentUnit.tree_id
                     // });

                     $rootScope.$broadcast("DeleteSuccess", {categories: unit.categories, id: unit.tree_id});

                     DataService.getParentUnit(unit.tree_id).gui_status = "OPEN";

                     // Check tree in AssertionService after delete unit
                     AssertionService.checkTree(DataService.tree, DataService.serverData);

                     return resolve('DeleteSuccess');
                 }
            });
        }

        function open(page, size, unit) {
            trace("DataService - open");
            $uibModal.open({
                animation: true,
                templateUrl: page,
                size: size,
                controller: function($scope){
                    $scope.forceDeleteUnit = function(){
                        unit.comment = undefined;
                        DataService.deleteUnit(unit.tree_id);
                    }
                }
            });
        };

        function updateInUnitIdsForTokens(unit){
            trace("DataService - updateInUnitIdsForTokens");
            unit.tokens.forEach(function(token){
                token.unitTreeId = unit.tree_id;

                var isTokenInUnit = DataService.isTokenInUnit(unit,token);

                if(isTokenInUnit){
                    token.inChildUnitTreeId = isTokenInUnit;
                }else{
                    token.inChildUnitTreeId = null;
                }
            })

            if (unit.AnnotationUnits) {
                unit.AnnotationUnits.forEach(function (child_unit) {
                    updateInUnitIdsForTokens(child_unit);
                })
            }

        }

        /**
         * Sort tree, by sort annotationsUnits
         * @param annotationUnits
         */
        function sortTree(annotationUnits) {
            trace("DataService - sortTree");
            if (annotationUnits.length > 1) {
                annotationUnits.sort(unitComparator);

            }
            for (var i = 0; i < annotationUnits.length; i++) {
                if(annotationUnits[i] == undefined){
                    continue
                }
                sortTree(annotationUnits[i].AnnotationUnits || []);
            }
        }

        /**
         * This function resets changedIdsObject object, updates treeIds, and then updates clonedIds according to changedIdsObject object.
         */
        function updateTreeIdsAndClonedIds() {
            trace("DataService - updateTreeIdsAndClonedIds");
            DataService.changedIdsObject = []; // Reset the object before calling to updateTreeIds
            updateTreeIds(DataService.tree);

            // Send to updateClonedIds function
            updateClonedIds(DataService.tree);
        }

        /**
         * This function updates the tree IDs so that the index of the unit in the AnnotationUnits
         * array of its parent is consistent with the tree_id data member.
         * TODO: BUGGY. CHECK AGAIN AFTER MODIFYING THE BACKEND.
         */
        function updateTreeIds(unit, treeId){
            trace("DataService - updateTreeIds");
            if(unit.AnnotationUnits && unit.AnnotationUnits.length > 0){

                //     // remove all empty elements in the array
                //     //for (var i = 0; i < unit.AnnotationUnits.length; i++) {
                //     //    if (unit.AnnotationUnits[i] == undefined) {
                //     //        unit.AnnotationUnits.splice(i,1);
                //     //        i--;
                //     //    }
                //     //}


                for (var i = 0; i < unit.AnnotationUnits.length; i++) {
                    if(unit.AnnotationUnits[i] == undefined){
                        continue
                    }

                    // the old tree id of the unit
                    var oldId = angular.copy(unit.AnnotationUnits[i].tree_id);

                    // updating the id of the unit according to its place in the array
                    // change to getChildTreeId
                    unit.AnnotationUnits[i].tree_id = (unit.tree_id === "0" ? (i+1).toString() : treeId+"-"+(i+1).toString());
                    // Check if cloned_to or cloned_from id changed
                    if (unit.AnnotationUnits[i].tree_id !== oldId) {
                        var obj = {oldTreeId: oldId, newTreeId: unit.AnnotationUnits[i].tree_id};
                        DataService.changedIdsObject.push(obj);
                    }

                    // update parent treeId
                    unit.AnnotationUnits[i].parent_tree_id = DataService.getParentUnitId(unit.AnnotationUnits[i].tree_id);

                    // if the Id has changed, change the remote units references
                    if(oldId !== unit.AnnotationUnits[i].tree_id){

                        // New Remote
                        // Update here, and then send to changeRemoteUnitTreeId function( to update the another unit- cloned or remote)
                        // DataService.changeRemoteUnitTreeId(unit.AnnotationUnits[i], oldId);

                        // if(DataService.unitsUsedAsRemote[oldId]){
                        //     DataService.unitsUsedAsRemote[unit.AnnotationUnits[i].tree_id] = angular.copy(DataService.unitsUsedAsRemote[oldId]);
                        //     delete DataService.unitsUsedAsRemote[oldId];
                        // }else{
                        //     for(var key in DataService.unitsUsedAsRemote){
                        //         if(DataService.unitsUsedAsRemote[key][oldId]){
                        //             DataService.unitsUsedAsRemote[key][unit.AnnotationUnits[i].tree_id] = true;
                        //             delete DataService.unitsUsedAsRemote[key][oldId];
                        //         }
                        //     }
                        // }
                    }
                    updateTreeIds(unit.AnnotationUnits[i],unit.AnnotationUnits[i].tree_id);
                }
            }else{
                unit.tokens.forEach(function(token){
                    token.unitTreeId = treeId;
                    token.inChildUnitTreeId = null;
                });
            }
        }

        /**
         * Sort units - get two units, sort them according to indexInUnit value
         * @param a - first unit
         * @param b - second unit
         * @returns {number} - according the priority of a
         */
        function unitComparator(a, b) {
            // Both implicit, the order doesn't matter much but we need to use something to make the sort stable
            if(a.unitType === 'IMPLICIT' && b.unitType === 'IMPLICIT') {
                return (a.tree_id < b.tree_id ? -1 : 1);  // a and b are never the same unit
            }

            // One is implicit, the other isn't - the implicit is first
            if(a.unitType === 'IMPLICIT') {
                return -1;
            }
            if(b.unitType === 'IMPLICIT') {  // B is implicit, A isin't.
                return 1;
            }

            // None implicit, order based on the order of tokens in the task
            return a.tokens[0].static.index_in_task < b.tokens[0].static.index_in_task ? -1 : 1;
        }

        function tokenStartIndexInParent(token){
            trace("DataService - tokenStartIndexInParent");
            var parentUnit = DataService.getUnitById(token.unitTreeId);
            if(parentUnit !== null){
                var elementPos = parentUnit.tokens.map(function(x) {return x.static.id; }).indexOf(token.static.id);
                if(elementPos > -1){
                    return parseInt(parentUnit.tokens[elementPos].static.start_index);
                }
            }
        }

        function submitTask(){
            trace("DataService - submitTask");
            return saveTask(true/* submit the task */)
        }

        /**
         * Travers in tree
         * saveTask calls to this function
         * It updates annotation_units fields (tree_id, parent_tree_id, cloned_from_tree_id etc.)
         * @param treeNode - node in the tree, which travers in
         * @returns {boolean}
         */
        function traversInTree(treeNode){
            trace("DataService - traversInTree");
            var unit = {
                tree_id : treeNode.tree_id.toString(),
                task_id: DataService.serverData.id.toString(),
                comment: treeNode.comment || '',
                cluster: treeNode.cluster || '',
                categories: filterCategoriesAtt(angular.copy(treeNode.categories)) || [],
                parent_tree_id: treeNode.unitType === 'REMOTE' ? DataService.getParentUnitId(treeNode.tree_id) : DataService.getParentUnitId(treeNode.tree_id),
                gui_status : treeNode.gui_status || "OPEN",
                type: angular.copy(treeNode.unitType.toUpperCase()),
                is_finished: treeNode.is_finished ? treeNode.is_finished : false,
                is_remote_copy: treeNode.unitType.toUpperCase() === 'REMOTE',
                children_tokens: treeNode.tree_id === "0" ? filterStaticTokens(filterTokensAtt(angular.copy(treeNode.tokens))) : filterStaticTokens(filterTokensAttForUnit(angular.copy(treeNode.tokens))),
                cloned_from_tree_id: treeNode.unitType.toUpperCase() === 'REMOTE' ? treeNode.cloned_from_tree_id : null
            };
            if($rootScope.isSlottedLayerProject){

                var firstSlotIndex = 0;
                for(var i=0; i<unit.categories.length; i++){
                    var currentCategoy = unit.categories[i];
                    if(currentCategoy.fromParentLayer){
                        currentCategoy['slot'] = i+3;
                        firstSlotIndex++;
                    }
                }
//                if (treeNode.tree_id=="11"||treeNode.tree_id=="14"){
//                    // debugger
//                }
                if(treeNode.slotOne) {
                    console.log("In unit " , unit.tree_id, " , slot one is true");
                    unit.categories[firstSlotIndex]['slot'] = 1;
                }
                if(treeNode.slotTwo) {
                    console.log("In unit " , unit.tree_id, " , slot two is true");
                    unit.categories[firstSlotIndex+1]['slot'] = 2;
                }

                for(var i=0; i<unit.categories.length; i++){
                    var currentCategory = unit.categories[i];
                    if(currentCategory.id == undefined){
                        unit.categories.splice(i,1);
                        i--;
                    }
                }

                if(!treeNode.slotOne && treeNode.slotTwo){
                    return false;
                }
            }


            // if(unit.tree_id === "0"){
            //     delete unit.children_tokens;
            // }
            if(unit.categories.length === 1 && unit.categories[0].id === -1){
                unit.categories = [];
            }

            if(unit.type === "IMPLICIT"){
                delete unit.children_tokens;
            }

            if(unit.type === "REMOTE") {
                // The server doesn't have a REMOTE type, it judges the remoteness based on other fields
                unit.type = "REGULAR";
            }

            annotation_units.push(unit);
            for(var i=0; i<treeNode.AnnotationUnits.length; i++){
                var output_val = traversInTree(treeNode.AnnotationUnits[i]);
                if (!output_val) {
                    return false;
                }
            }

            return true;
        }

        /*
        * Omri: I think this is never called
         */
        // function arrangeUnitTokens(unitId){
        //     trace("DataService - arrangeUnitTokens");
        //     var currentUnit = getUnitById(unitId);
        //     currentUnit.AnnotationUnits = angular.copy(currentUnit.AnnotationUnits);
        //     arrangeUnitTokensObj(currentUnit);
        //     currentUnit.AnnotationUnits.forEach(function(unit){
        //         unit.tokens.forEach(function(token){
        //             var elementPos = currentUnit.tokens.map(function(x) {return x.id; }).indexOf(token.id);
        //             if(elementPos > -1){
        //                 currentUnit.tokens.splice(elementPos,1);
        //             }
        //         });
        //     })
        //
        // }

        /*
        * Omri: I think this is never called
         */
        // function arrangeUnitTokensObj(currentUnit){
        //     trace("DataService - arrangeUnitTokensObj");
        //     var returnArray = [];
        //     currentUnit.AnnotationUnits = angular.copy(currentUnit.AnnotationUnits);
        //     currentUnit.AnnotationUnits.forEach(function(unit){
        //         unit.tokens.forEach(function(token){
        //             returnArray.push({id:token.id})
        //         });
        //         unit.tokensCopy = returnArray;
        //
        //     })
        //
        // }


        // Remove static from tokens, because the server need get the fields without static member
        function filterStaticTokens(tokens) {
            var newTokens = [];
            if(tokens !== undefined){
                tokens.forEach(function(token){
                    newTokens.push(token.static);
                });
            }
            return newTokens;
        }


        /**
         * Delete some attributes from tokens for the tree root
         * @param tokens
         * @returns {*} filtered tokens
         */
        function filterTokensAtt(tokens){
            trace("DataService - filterTokensAtt");
            if(tokens !== undefined){
                tokens.forEach(function(token){
                    delete token.inChildUnitTreeId;
                    delete token.unitTreeId;
                    delete token.indexInUnit;
                    delete token.borderStyle;
                    // delete token.lastTokenNotAdjacent;
                    // delete token.nextTokenNotAdjacent;
                    // delete token.positionInChildUnit;
                    delete token.backgroundColor;
                })
            }
            return tokens;

        }

        /**
         * Delete some attributes from tokens for unit
         * @param tokens
         * @returns {*} filtered tokens
         */
        function filterTokensAttForUnit(tokens){
            trace("DataService - filterTokensAttForUnit");
            if(tokens !== undefined){
                tokens.forEach(function(token){
                    delete token.inChildUnitTreeId;
                    delete token.unitTreeId;
                    delete token.indexInUnit;
                    delete token.borderStyle;
                    // delete token.lastTokenNotAdjacent;
                    // delete token.nextTokenNotAdjacent;
                    // delete token.positionInChildUnit;
                    delete token.backgroundColor;

                    delete token.static.start_index;
                    delete token.static.end_index;
                    delete token.static.require_annotation;
                    delete token.static.tokenization_task_id;
                    delete token.static.text;
                })
            }
            return tokens;

        }

        /**
         * Delete some attributes from categories
         * @param categories
         * @returns {*}- filtered categories
         */
        function filterCategoriesAtt(categories){
            trace("DataService - filterCategoriesAtt");
            if(categories !== undefined){
                categories.forEach(function(category){
                    delete category.shortcut_key;
                    delete category.was_default;
                    delete category.description;
                    delete category.tooltip;
                    delete category.callbackFunction;
                    delete category.abbreviation;
                    delete category.backgroundColor;
                    delete category.color;
                    delete category.fromParentLayer;
                    delete category.is_metacategory;
                    delete category.name;
                    delete category.index;
                });
            }
            return categories;

        }

        /**
         * Save task when save button clicked
         * @param shouldSubmit - shouldSubmit(submit or draft)
         */
        function saveTask(shouldSubmit){
            trace("DataService - saveTask");
            annotation_units = [];
            var tokensCopy = angular.copy(DataService.tree.tokens);
            tokensCopy = filterTokensAtt(tokensCopy);
            tokensCopy = filterStaticTokens(tokensCopy);// TODO-- remove static from tokens list

            // arrangeUnitTokens("0");
            // Update annotation_units
            var traversResult = traversInTree(DataService.tree);
            if (!traversResult) {
                Core.showNotification('error','Cannot save if a unit has category in slot two but not in slot one.');
                return $q.reject();
            }
            var mode = shouldSubmit ? 'submit' : 'draft';
            DataService.serverData['annotation_units'] = annotation_units;
            DataService.serverData.tokens= tokensCopy;

            return apiService.annotation.putTaskData(mode,DataService.serverData).then(function(res){
                // Check tree in AssertionService when saving the task
                AssertionService.checkTree(DataService.tree, DataService.serverData);
                $rootScope.$broadcast("ResetSuccess");
                return res;
            });
        }

        /**
         * Get unit by id
         * @param unitID - id of the unit we want to get
         * @returns {*} - unit according to unit id
         */
        function getUnitById(unitID){
            trace("DataService - getUnitById");
            if(unitID == -1){
                return null
            }else if(!unitID || unitID == 0){
                return DataService.tree;
            }else{
                var splittedUnitId = splitStringByDelimiter(unitID,"-");
                var tempUnit = DataService.tree;

                for(var i=0; i<splittedUnitId.length; i++){
                    var unitIdToFind = splittedUnitId.slice(0,i+1).join("-");

                    var unitIndex = tempUnit.AnnotationUnits.findIndex(function(unit){
                        if(unit == undefined){
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
         * Get next sibling unit when hotkey moves down
         * @param lastFocusedUnitId -  the current focused unit
         * @returns {*} - the next sibling
         */
        function getNextSibling(lastFocusedUnitId){
            trace("DataService - getNextSibling");
            if(lastFocusedUnitId == 0){
                if(DataService.tree.AnnotationUnits.length > 0){
                    return DataService.tree.AnnotationUnits[0].tree_id;
                }
            }else{
                var parentAnnotationUnits = DataService.getUnitById(DataService.getParentUnitId(lastFocusedUnitId)).AnnotationUnits;
                var currentIndex = getMyIndexInParentTree(parentAnnotationUnits,lastFocusedUnitId);
                return parentAnnotationUnits[currentIndex+1] ? parentAnnotationUnits[currentIndex+1] : null;

            }
        }

        /**
         * Get prev sibling unit when hotkey moves up
         * @param lastFocusedUnitId - the current focused unit
         * @returns {null} - the prev sibling
         */
        function getPrevSibling(lastFocusedUnitId){
            trace("DataService - getPrevSibling");
            var parentAnnotationUnits = DataService.getUnitById(DataService.getParentUnitId(lastFocusedUnitId)).AnnotationUnits;
            var currentIndex = getMyIndexInParentTree(parentAnnotationUnits,lastFocusedUnitId);
            return parentAnnotationUnits[currentIndex-1] ? parentAnnotationUnits[currentIndex-1] : null;
        }

        /**
         * Get index in parent tree
         * @param parentTree
         * @param myUnitId
         * @returns {number}
         */
        function getMyIndexInParentTree(parentTree, myUnitId){
            trace("DataService - getMyIndexInParentTree");
            var currentIndex = 0;
            parentTree.forEach(function(unit,index){
                if(unit.tree_id==myUnitId){
                    currentIndex = index;
                }
            });
            return currentIndex;
        }

        /**
         * Get the first sibling of unit
         * @param unitId
         * @returns {*}- the first sibling
         */
        function getSibling(unitId){
            trace("DataService - getSibling");
            var currentUnit = DataService.getUnitById(unitId);
            return currentUnit.AnnotationUnits[0];
        }

        /**
         * // Get next unit when hotkey moves down and there is no more siblings
         * @param lastFocusedUnitId
         * @param index - lastFocusedUnitId splitted by ‘-’
         * @returns {*}
         */
        function getNextUnit(lastFocusedUnitId, index){
            trace("DataService - getNextUnit");
            if(lastFocusedUnitId == 0){
                if(DataService.tree.AnnotationUnits.length > 0){
                    return DataService.tree.AnnotationUnits[0].tree_id;
                }
            }else{
                var currentUnit = DataService.getUnitById(lastFocusedUnitId);
                if(currentUnit.AnnotationUnits === undefined){
                    currentUnit.AnnotationUnits = [];
                }

                if(currentUnit.AnnotationUnits.length > index){
                    return currentUnit.AnnotationUnits[index].tree_id;
                }else{
                    if(lastFocusedUnitId == DataService.tree.AnnotationUnits.length){
                        return -1;
                    }
                    var splittedUnitID = splitStringByDelimiter(lastFocusedUnitId,'-');
                    var parentID="";
                    if(currentUnit.tree_id.length >= 3){
                        parentID = splittedUnitID.slice(0,splittedUnitID.length-1).join("-");
                    }
                    else{
                        parentID = 0;
                    }
                    if (parentID != 0){
                        return getNextUnit(parentID,splittedUnitID[splittedUnitID.length-1])
                    }else{
                        return DataService.tree.AnnotationUnits[parseInt(lastFocusedUnitId)].tree_id;
                    }

                }
            }

        }

        /**
         * Get prev unit when hotkey moves up and there is no more siblings
         * @param lastFocusedUnitId
         * @param index - no useful
         * @returns {*}
         */
        function getPrevUnit(lastFocusedUnitId, index){
            trace("DataService - getPrevUnit");
            if(lastFocusedUnitId !== "0"){
                var prevNode = DataService.getUnitById(DataService.getParentUnitId(lastFocusedUnitId)).AnnotationUnits[parseInt(lastFocusedUnitId) - 2];
                if(prevNode){
                    while(prevNode.AnnotationUnits.length > 0){
                        prevNode = prevNode.AnnotationUnits[prevNode.AnnotationUnits.length-1];
                    }
                    return prevNode;
                }
                return DataService.tree;
            }
            return DataService.tree;
        }

        /**
         * Success callback.
         * @param response - successful response.
         * @returns {*} - the response data.
         */
        function successFunction(response){
            trace("DataService - successFunction");
            return response.data;
        }

        /**
         * Unsuccessful callback.
         * @param err - the error.
         */
        function errorFunction(err){
            trace("DataService - errorFunction");
            console.error(err);
        }

        /**
         * Split a string by give delimiter.
         * @param stringToSplit - the string to split.
         * @param del - split delimiter.
         */
        function splitStringByDelimiter(stringToSplit,del){
            trace("DataService - splitStringByDelimiter");
            return stringToSplit.toString().split(del);
        }

        /**
         * OLD FUNCTION
         * Get parent unit id
         * @param unitId - unit id, which we search his parent
         * @returns {*} - parent unit id
         */
        // function getParentUnitId(unitId){
        //     trace("DataService - getParentUnitId");
        //     if(unitId === null){
        //         return null;
        //     }
        //     unitId = unitId.toString();
        //     if(unitId.length == 1){
        //         if(unitId =="0"){
        //             return null;
        //         }
        //         return "0";
        //     }
        //     var parentUnitId = unitId.split('-');
        //     parentUnitId = parentUnitId.slice(0,length-1).join('-');
        //     return parentUnitId.toString()
        // }

        /**
         * Get parent unit id
         * @param unitId - unit id, which we search his parent
         * @returns {*} - parent unit id
         */
        function getParentUnitId(unitId) {
            // TODO: Remove this function altogether, getting the parent tree id is now as simple as looking at a property
            trace("DataService - getParentUnitId");
            if(unitId === null){
                return null;
            }
            var isNum = /^\d+$/.test(unitId);
            if (isNum) {
                if(unitId === "0"){
                    return null;
                }
                // If unitId is first sub unit of the tree root, parentTreeId should be '0', like '1', '2', their parent is '0'
                return "0";
            }
            var index = unitId.lastIndexOf("-");
            var parent = unitId.slice(0, index);
            return parent;
        }

        function positionInUnit(unit, token) {
            var position = undefined;
            if (unit.tokens[0].static.id === token.static.id) {
                position = 'First';
                if (unit.tokens.length === 1) {
                    position = 'FirstAndLast';
                }
            } else if (unit.tokens[unit.tokens.length - 1].static.id === token.static.id) {
                position = 'Last'; // We already know it's not the first one
            } else {
                position = 'Middle';
            }

            // Sanity check - make sure the token is really in the unit
            if (position === 'Middle') { // If it's First, Last or FirstAndLast we've already made sure of this
                var found = false;
                for (var i = 1; i < unit.tokens.length - 1; i++) {
                    if (unit.tokens[i].static.id === token.static.id) {
                        found = true;
                        break;
                    }
                }
                if (!found) {
                    throw "The token " + token.static.text + " isn't exist in unit.tokens";
                }
            }

            return position;
        }

        /*                    if (position === "First" && token['nextTokenNotAdjacent']) {
                                position = 'FirstAndLast';
                            }
                            if (position === "Last" && token['lastTokenNotAdjacent']) {
                                position = 'FirstAndLast';
                            }
                            if (position === "Middle" && token['lastTokenNotAdjacent'] && token['nextTokenNotAdjacent']) {
                                position = 'FirstAndLast';
                            }
                            if (position === "Middle" && token['lastTokenNotAdjacent']) {
                                position = 'First';
                            }
                            if (position === "Middle" && token['nextTokenNotAdjacent']) {
                                position = 'Last';
                            }
                            return position;
                        }
                    }
                } */


        /*function positionInUnit(unit, token) {
            for (var i = 0; i < unit.tokens.length; i++) {
                if (unit.tokens[i].static.id === token.static.id) {
                    if (unit.tokens.length === 1) {
                        return 'FirstAndLast';
                    }
                    if (unit.tokens[i].indexInUnit === 0) {
                        return 'First';
                    }
                    if (unit.tokens[i].indexInUnit === unit.tokens.length-1) {
                        return 'Last';
                    }
                    return 'Middle';
                }
            }
            throw "The token " + token.static.text + " isn't exist in unit.tokens";
        }*/
    }

})();
