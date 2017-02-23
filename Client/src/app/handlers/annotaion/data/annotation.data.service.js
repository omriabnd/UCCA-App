(function() {
    'use strict';

    angular.module('zAdmin.annotation.data')
        .factory('DataService',DataService);

    /**
     * A data hendler service
     * @param $http
     * @returns {
     *  {
     *      tree: {
     *          numOfAnnotationUnits: number,
     *          AnnotationUnits: Array
     *     },
     *    getData: getData,
     *    insertToTree: insertToTree,
     *    selectedTokensToUnit: selectedTokensToUnit
     *  }
     * } - An object containing the service variables and methods.
     */

    /** @ngInject */
    function DataService($http,apiService,$rootScope,restrictionsValidatorService,ENV_CONST,Core) {
        var lastInsertedUnitIndex = 0;
        var unitType = 'REGULAR';
        var annotation_units = [];
        var hashTables = {
            tokensHashTable: {},
            categoriesHashTable: {}
        };
        var DataService = {
            /**
             * A data structure that contains rows of selectable words.
             */
            tree: {
                annotation_unit_tree_id : '0',
                text : '',
                numOfAnnotationUnits: 0,
                unitType:'REGULAR',
                containsAllParentUnits: false,
                AnnotationUnits : [],
                gui_status: 'OPEN'
            },
            lastInsertedUnitIndex: lastInsertedUnitIndex,
            unitType:unitType,
            currentTask:null,
            hashTables: hashTables,
            categories: [],
            getData: getData,
            insertToTree: insertToTree,
            deleteFromTree: deleteFromTree,
            printTree: printTree,
            selectedTokensToUnit:selectedTokensToUnit,
            addCategoryToExistingRow: addCategoryToExistingRow,
            getNextUnit: getNextUnit,
            getPrevUnit: getPrevUnit,
            getUnitById:getUnitById,
            getParentUnitId:getParentUnitId,
            saveTask: saveTask,
            submitTask: submitTask,
            wrapWords:wrapWords,
            initTree:initTree,
            createHashTables:createHashTables,
            REMOTE_TEMPS_OBJ_FOR_UPDATE_AFTER_DELETE_UNIT_FOR_UPDATE_AFTER_DELETE_UNIT:{},
            USED_AS_REMOTE_TEMPS_OBJ_FOR_UPDATE_AFTER_DELETE_UNIT_FOR_UPDATE_AFTER_DELETE_UNIT:{},
            createTokensHashByTokensArrayForPassage:createTokensHashByTokensArrayForPassage
        };

        return DataService;

        
        function initTree(){
            DataService.currentTask.annotation_units.forEach(function(unit,index){
                //for each unit go through it tokens and find them in the tokens array,
                // create a token array and wrap it with spans, then insert it to the tree at the right order
                $rootScope.selectedTokensArray = [];
                if(index > 0){
                    for(var i=0; i<unit.children_tokens.length; i++){
                        var fullTokenObject = DataService.hashTables.tokensHashTable[unit.children_tokens[i].id];
                        var tokenToWrap = [{
                            id: fullTokenObject.id,
                            text: fullTokenObject.text,
                            parent_id: unit.parent_id
                        }];
                        $rootScope.selectedTokensArray.push(DataService.wrapWords(tokenToWrap,true));
                    }

                    var unitCategoriesArray = [];
                    for(var i=0; i<unit.categories.length; i++){
                        var category = {
                            id: DataService.hashTables.categoriesHashTable[unit.categories[i].id].id,
                            color: DataService.hashTables.categoriesHashTable[unit.categories[i].id].color,
                            backgroundColor: DataService.hashTables.categoriesHashTable[unit.categories[i].id].backgroundColor,
                            abbreviation: DataService.hashTables.categoriesHashTable[unit.categories[i].id].abbreviation,
                            name: DataService.hashTables.categoriesHashTable[unit.categories[i].id].name,
                            shouldRefine: DataService.hashTables.categoriesHashTable[unit.categories[i].id].shouldRefine,
                            refinedCategory: DataService.hashTables.categoriesHashTable[unit.categories[i].id].refinedCategory,
                        };
                        unitCategoriesArray.push(category);
                    }
                    if(unit.is_remote_copy){
                        DataService.unitType = 'REMOTE';
                    }else{
                        DataService.unitType = 'REGULAR';
                    }
                    if($rootScope.selectedTokensArray.length > 0){
                        $rootScope.selectedTokensArray.sort(sortSelectedWordsArrayByWordIndex);
                        var tokenToUnitData = {
                            selectedTokensArray : $rootScope.selectedTokensArray,
                            id : DataService.tree.AnnotationUnits+1,
                            level : unit.parent_id,
                            rowCategoryID : $rootScope.currentCategoryID,
                            rowCategoryColor : $rootScope.currentCategoryColor,
                            rowCategoryBGColor : $rootScope.currentCategoryBGColor,
                            rowRefinedCategory : $rootScope.currentCategoryIsRefined,
                            rowCategoryAbbreviation : $rootScope.currentCategoryAbbreviation,
                            rowCategoryName : $rootScope.currentCategoryName,
                            containsAllParentUnits : false,
                            categoriesArray : unitCategoriesArray,
                            isFirstInitTree : true,
                            unitGuiStatus : unit.gui_status
                        }
                        $rootScope.clckedLine = DataService.selectedTokensToUnit(tokenToUnitData);

                        DataService.getUnitById($rootScope.clckedLine).comment = unit.comment;
                    }

                    if(unit.type == 'IMPLICIT'){
                        DataService.unitType = 'REMOTE';

                        var objToPush = {
                            rowId : '',
                            text : '<span>IMPLICIT UNIT</span>',
                            numOfAnnotationUnits: 0,
                            categories:unitCategoriesArray,
                            comment:"",
                            rowShape:'',
                            unitType:'IMPLICIT',
                            gui_status:'OPEN',
                            usedAsRemote:[],
                            children_tokens:[],
                            containsAllParentUnits: false,
                            AnnotationUnits : [

                            ]
                        };

                        DataService.insertToTree(objToPush,$rootScope.clckedLine);
                    }
                }
            })
            DataService.unitType = 'REGULAR';
        }

        function createTokensHashByTokensArrayForPassage(annotationTokensArray){
            var hash = {}
            annotationTokensArray.forEach(function(token){
                hash[token.id] = token
            })
            DataService.tree.children_tokens_hash = hash;
        }

        function createHashTables(){
            DataService.currentTask.tokens.forEach(function(token){
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
            console.log(DataService.tree);
            console.log(JSON.stringify(DataService.tree));
        }
        /**
         * Get data by given url.
         * @param url - the url to fetch data from.
         * @returns {*} - The response from the WS in the given url.
         */
        function getData(url){
            return $http.get(url).then(successFunction,errorFunction);
        }

        /**
         * Updates the data structure. if level == 0 the new object will inserted in the top level of the data structure
         * else the function will traverse in the data structure and will the suitable place to insert newObject.
         * @param newObject - the new object to insert to the data structure.
         * @param level - defines which level in the data structure to insert the newObject.
         * @return newObject.annotation_unit_tree_id - the new row id.
         */
        function insertToTree(newObject,level){
            if(level == 0){ // insert into the main passage new unit as a child
                DataService.tree.numOfAnnotationUnits++;
                newObject.annotation_unit_tree_id = DataService.tree.numOfAnnotationUnits;
                DataService.tree.AnnotationUnits.push(newObject);

                // update the dataseervice hash to be without the tokens
                removeTokensFromPassage(newObject);

            }else{
                var splittedIndex = level.toString().split('-');
                var tempObject = null;

                tempObject = DataService.tree.AnnotationUnits[parseInt(splittedIndex[0]) - 1];
                if(tempObject){
                    for (var i=1; i<splittedIndex.length; i++){
                        tempObject = tempObject.AnnotationUnits[parseInt(splittedIndex[i]) - 1];
                    }
                    tempObject.numOfAnnotationUnits++;
                    newObject.annotation_unit_tree_id = level+'-'+(tempObject.AnnotationUnits.length+1)
                    
                    if(newObject.unitType == 'REMOTE'){
                        newObject.remote_located_parent_id = level;                 
                        newObject.remote_original_id = DataService.remoteFromUnit   
                    }
                    tempObject.AnnotationUnits.push(newObject);
                }
            }
            DataService.lastInsertedUnitIndex = newObject.annotation_unit_tree_id;
            return newObject.annotation_unit_tree_id;
        }
        
        function removeTokensFromPassage(newObject){
            // update the dataseervice hash to be without the tokens
            newObject.children_tokens.forEach(function(token){
                delete DataService.tree.children_tokens_hash[token.id]
            })
            console.log("Passage tokens number after removing : ", Object.keys(DataService.tree.children_tokens_hash).length)
        }
        function insertTokensBackToPassage(unitIndex){
            DataService.tree.AnnotationUnits[unitIndex].children_tokens.forEach(function(token){
                DataService.tree.children_tokens_hash[token.id] = DataService.hashTables.tokensHashTable[token.id];
            })
            console.log("Passage tokens number after putting back : ", Object.keys(DataService.tree.children_tokens_hash).length)
            if( DataService.tree.AnnotationUnits[unitIndex].AnnotationUnits.length > 0){
                DataService.tree.AnnotationUnits[unitIndex].AnnotationUnits.forEach(function(unit){
                    removeTokensFromPassage(unit);
                })  
            }
            
        }

        /**
         * Delete row from the data tree.
         * If the node is in the data tree top level all it's child is transferred 1 level up. deletes the node and updated tree.
         * If the node is not at the tree's top level the function will traverse to it and then all it's child is transferred 1 level up. deletes the node and updated tree.
         * @param row_id - node id.
         */
        function deleteFromTree(row_id){
            // console.log('row_id',row_id);
            var splittedId = row_id.toString().split('-');
            var tempObject;
            var treeNodeAnnotationUnitsLength;
            var indexToInsertChild;
            var unitToDelete = DataService.getUnitById(row_id);
            if(splittedId.length == 1){
                /**
                 * Node in tree's top level - the main passage.
                 */

                var unitToDeleteChildren = DataService.tree.AnnotationUnits[parseInt(splittedId[0]) - 1].AnnotationUnits;

                for(var i=0; i<unitToDeleteChildren.length; i++){
                    if(unitToDeleteChildren[i].unitType == 'REMOTE'){
                        DataService.tree.AnnotationUnits[parseInt(splittedId[0]) - 1].AnnotationUnits.splice(i,1);
                        DataService.tree.AnnotationUnits[parseInt(splittedId[0]) - 1].numOfAnnotationUnits = DataService.tree.AnnotationUnits[parseInt(splittedId[0]) - 1].AnnotationUnits.length;
                        i--;
                    }
                }

                treeNodeAnnotationUnitsLength = DataService.tree.AnnotationUnits[parseInt(splittedId[0]) - 1].AnnotationUnits.length;
                indexToInsertChild = parseInt(splittedId[0]);
                for(var i=0; i<treeNodeAnnotationUnitsLength; i++){
                    DataService.tree.AnnotationUnits.splice(indexToInsertChild, 0, DataService.tree.AnnotationUnits[parseInt(splittedId[0]) - 1].AnnotationUnits[i]);
                    indexToInsertChild++
                }

                var unitIndex = parseInt(splittedId[0]) - 1;
                // update the main passage tokens hash table
                insertTokensBackToPassage(unitIndex);

                // remove the unit from its parent
                DataService.tree.AnnotationUnits.splice(unitIndex,1);
                DataService.tree.numOfAnnotationUnits = DataService.tree.AnnotationUnits.length;
                

                //Remove border from parent + update tree node ids
                updateTreeNodesIds(DataService.tree,"");

            }else{
                /**
                 * Traverse to the node.
                 */
                tempObject = DataService.tree.AnnotationUnits[parseInt(splittedId[0]) - 1];
                for (i=1; i<splittedId.length-1; i++){
                    tempObject = tempObject.AnnotationUnits[parseInt(splittedId[i]) - 1];
                }

                var deletedRow = tempObject.AnnotationUnits[parseInt(splittedId[splittedId.length-1])-1];

                var unitToDeleteChildren = deletedRow.AnnotationUnits;

                for(var i=0; i<unitToDeleteChildren.length; i++){
                    if(unitToDeleteChildren[i].unitType == 'REMOTE'){
                        deletedRow.AnnotationUnits.splice(i,1);
                        deletedRow.numOfAnnotationUnits = deletedRow.AnnotationUnits.length;
                        i--;
                    }
                }

                deletedRow != undefined ? treeNodeAnnotationUnitsLength = deletedRow.AnnotationUnits.length : treeNodeAnnotationUnitsLength = 0;
                indexToInsertChild = parseInt(splittedId[splittedId.length-1]);
                for(i=0; i<treeNodeAnnotationUnitsLength; i++){
                    tempObject.AnnotationUnits.splice(indexToInsertChild, 0, deletedRow.AnnotationUnits[i]);
                    indexToInsertChild++
                }

                tempObject.AnnotationUnits.splice(parseInt(splittedId[splittedId.length-1])-1,1);

                updateTreeNodesIds(tempObject,tempObject.annotation_unit_tree_id);
            }
            if(unitToDelete.unitType == "REMOTE"){
                updateOriginalRemoteUnitUsedAsRemoteArray(unitToDelete)
            }
            updateRemoteUnitsAndUsedAsRemote()
            return updatedFocusedUnitId(row_id);
        }

        function updateRemoteUnitsAndUsedAsRemote(){
            var USED_AS_REMOTE_UNITS = DataService.USED_AS_REMOTE_TEMPS_OBJ_FOR_UPDATE_AFTER_DELETE_UNIT_FOR_UPDATE_AFTER_DELETE_UNIT;
            var REMOTE_TEMPS_OBJ = DataService.REMOTE_TEMPS_OBJ_FOR_UPDATE_AFTER_DELETE_UNIT_FOR_UPDATE_AFTER_DELETE_UNIT;
            // console.log("USED_AS_REMOTE_UNITS",USED_AS_REMOTE_UNITS);
            // console.log("REMOTE_TEMPS_OBJ",REMOTE_TEMPS_OBJ);
            
            Object.keys(USED_AS_REMOTE_UNITS) && Object.keys(USED_AS_REMOTE_UNITS).forEach(function(key,index){
                // console.log(index,USED_AS_REMOTE_UNITS[key]);
                var originilUnitToUpdate = DataService.getUnitById(USED_AS_REMOTE_UNITS[key].newUnitId)
                originilUnitToUpdate.usedAsRemote.forEach(function(unitId,index){
                    // update it to be the new remotId
                    if(REMOTE_TEMPS_OBJ[unitId]){
                        // console.log("UPADTE "+unitId+"TO "+REMOTE_TEMPS_OBJ[unitId].newRemoteTreeId);
                        originilUnitToUpdate.usedAsRemote[index] = REMOTE_TEMPS_OBJ[unitId].newRemoteTreeId
                    }
                })
            })
            // DataService.printTree()
            resetRemoteTempArrays();                
        }

        function isInArray(obj,arrayOfObj){
            return arrayOfObj && arrayOfObj.indexOf(obj) > -1
        }


        function resetRemoteTempArrays(){
            DataService.REMOTE_TEMPS_OBJ_FOR_UPDATE_AFTER_DELETE_UNIT_FOR_UPDATE_AFTER_DELETE_UNIT = {};
            DataService.USED_AS_REMOTE_TEMPS_OBJ_FOR_UPDATE_AFTER_DELETE_UNIT_FOR_UPDATE_AFTER_DELETE_UNIT = {};
        }
        /*
            function that get the remote_row_id  data we want to delete, and update its original 
            unit 'usedAsRemote' array by remove itself from it
        */
        function updateOriginalRemoteUnitUsedAsRemoteArray(deletedRemoteRowId){
            var originalUnit = DataService.getUnitById(deletedRemoteRowId.remote_original_id)
            originalUnit.usedAsRemote = originalUnit.usedAsRemote.filter(function(remoteId){
                return remoteId != deletedRemoteRowId.annotation_unit_tree_id
            })
        }


        function updatedFocusedUnitId(row_id){
            var splittedRowId = row_id.toString().split('-');
            if(splittedRowId.length == 1){
                if(parseInt(splittedRowId[0]) > 0){
                    return (parseInt(splittedRowId[0])-1).toString();
                }
            }else{
                var rowParentIndex = '';
                if(splittedRowId[splittedRowId.length-1] == '1'){
                    for (var i=0; i<splittedRowId.length-2; i++){
                        rowParentIndex += splittedRowId[i] + '.';
                    }
                    rowParentIndex += splittedRowId[splittedRowId.length -2];
                    return rowParentIndex;
                }else{
                    for (var i=0; i<splittedRowId.length-1; i++){
                        rowParentIndex += splittedRowId[i] + '.';
                    }
                    rowParentIndex += parseInt(splittedRowId[splittedRowId.length -1])-1;
                    return rowParentIndex;
                }
            }
        }

        /**
         * Update the tree nodes. get a sub-tree parent node and updates all the sub tree.
         * This is a recursive function : if subTreeParentNode has children the function will be
         * called again for each child where the current child will be the new subTreeParentNode.
         * @param subTreeParentNode - the sub-tree parent node.
         * @param nodeNewId - the node new id
         */
        function updateTreeNodesIds(subTreeParentNode,nodeNewId){
            // console.log(subTreeParentNode.annotation_unit_tree_id+" -> "+nodeNewId);

            for(var i=0; i<subTreeParentNode.AnnotationUnits.length; i++){
                var old_tree_id = subTreeParentNode.AnnotationUnits[i].annotation_unit_tree_id
                if(nodeNewId == ""){
                    subTreeParentNode.AnnotationUnits[i].annotation_unit_tree_id = String(i+1) 
                }else{
                    subTreeParentNode.AnnotationUnits[i].annotation_unit_tree_id = nodeNewId+'-'+(i+1);
                }

                if(subTreeParentNode.AnnotationUnits[i].unitType=='REMOTE'){
                    // update remote_located_parent_id
                    subTreeParentNode.AnnotationUnits[i].remote_located_parent_id = DataService.getParentUnitId(subTreeParentNode.AnnotationUnits[i].annotation_unit_tree_id)
                    // update remote_original_id
                    var remmeberToUpdateLater = {
                        newRemoteTreeId : subTreeParentNode.AnnotationUnits[i].annotation_unit_tree_id,
                        oldRemoteTreeId: old_tree_id,
                        oldRemoteOriginalId : subTreeParentNode.AnnotationUnits[i].remote_original_id
                    }
                    DataService.REMOTE_TEMPS_OBJ_FOR_UPDATE_AFTER_DELETE_UNIT_FOR_UPDATE_AFTER_DELETE_UNIT[remmeberToUpdateLater.oldRemoteTreeId]=remmeberToUpdateLater
                }

                // need to update the usedAsRemote array after - after the recursion ends
                if(subTreeParentNode.AnnotationUnits[i].usedAsRemote && subTreeParentNode.AnnotationUnits[i].usedAsRemote.length){
                    var remmeberToUpdateLater = {
                        newUnitId : subTreeParentNode.AnnotationUnits[i].annotation_unit_tree_id,
                        oldUnitId : old_tree_id
                    }
                    DataService.USED_AS_REMOTE_TEMPS_OBJ_FOR_UPDATE_AFTER_DELETE_UNIT_FOR_UPDATE_AFTER_DELETE_UNIT[remmeberToUpdateLater.newUnitId] = remmeberToUpdateLater
                }

                updateTreeNodesIds(
                        subTreeParentNode.AnnotationUnits[i],
                        subTreeParentNode.AnnotationUnits[i].annotation_unit_tree_id
                    )
            }


        }

        /**
         * Gets the selected words array turns the into 1 line and insert then into the data structure.
         * @param selectedTokensArray - the selected words.
         * @param id
         * @param level - defines the level to insert the words. if undefined insertion will go the top level.
         * @param rowColor - defines the row color.
         */
        function selectedTokensToUnit(tokenToUnitData){
            var selectedTokensArray = tokenToUnitData.selectedTokensArray;
            var id = tokenToUnitData.id;
            var level = tokenToUnitData.level;
            var rowCategoryID = tokenToUnitData.rowCategoryID;
            var rowCategoryColor = tokenToUnitData.rowCategoryColor;
            var rowCategoryBGColor = tokenToUnitData.rowCategoryBGColor;
            var rowRefinedCategory = tokenToUnitData.rowRefinedCategory;
            var rowCategoryAbbreviation = tokenToUnitData.rowCategoryAbbreviation;
            var rowCategoryName = tokenToUnitData.rowCategoryName;
            var containsAllParentUnits = tokenToUnitData.containsAllParentUnits;
            var categoriesArray = tokenToUnitData.categoriesArray;
            var isFirstInitTree = tokenToUnitData.isFirstInitTree;
            var unitGuiStatus = tokenToUnitData.unitGuiStatus;
            if(selectedTokensArray.length > 0){
                var attachedWords = '';
                // $scope.currentColor = color;
                var lastTokenId = parseInt(splitStringByDelimiter($(selectedTokensArray[0]).attr('data-wordid'),"-")[1]);
                var children_tokens = [];
                selectedTokensArray.forEach(function(word,index){
                    children_tokens[index] = {
                        id: $(word).attr('token-id')
                       
                    }
                    var currentTokenId = parseInt(splitStringByDelimiter($(word).attr('data-wordid'),"-")[1]);
                    if(index > 0){
                        if(currentTokenId > lastTokenId + 1){
                            attachedWords += '<span class="dot-sep">...</span>';
                            attachedWords += ' ';
                        }
                    }
                    attachedWords += word;
                    attachedWords += ' ';
                    lastTokenId = currentTokenId;
                });
                var objToPush = { // TODO: take out from here with constaructor ANNOTATION_UNIT
                    annotation_unit_tree_id : '',
                    text : attachedWords,
                    numOfAnnotationUnits: 0,
                    categories:[],
                    comment:"",
                    rowShape:'',
                    usedAsRemote:[],
                    children_tokens: children_tokens,
                    gui_status: unitGuiStatus ? unitGuiStatus : 'OPEN',
                    unitType:DataService.unitType,
                    containsAllParentUnits: containsAllParentUnits || false,
                    AnnotationUnits : [

                    ]
                };
                if(categoriesArray != undefined && categoriesArray.length > 0){
                    objToPush.categories = categoriesArray;
                }else if(rowCategoryBGColor != undefined){
                    var categoryToPush = {
                        id: rowCategoryID, 
                        color: rowCategoryColor, 
                        backgroundColor: rowCategoryBGColor, 
                        refinedCategory: rowRefinedCategory, 
                        abbreviation: rowCategoryAbbreviation, 
                        name: rowCategoryName
                    }
                    objToPush.categories.push(categoryToPush);
                }
                var newRowId = '';

                // prevent insert to tree when refinement layer
                if(!isFirstInitTree && DataService.currentTask.project.layer.type == ENV_CONST.LAYER_TYPE.REFINEMENT){
                    Core.showAlert("Cant create new annotation units in refinement layer")
                    console.log('ALERT - selectedTokensToUnit - prevent insert to tree when refinement layer');
                    return level;
                }

                if(level != undefined){
                    // if the parent unit is not the root passage - need to check the restrictions of the layer
                    var parentUnit = getUnitById(level);
                    if(!restrictionsValidatorService.checkRestrictionsBeforeInsert(parentUnit,objToPush,DataService.hashTables.tokensHashTable)){
                        // if no unit has been added, ewtuern the parent unitRowId
                        return level;
                    }
                    newRowId = DataService.insertToTree(objToPush,level); // level is the parent unit

                    $rootScope.selectedTokensArray = [];
                }else{
                    // should insert the unit to the root passage as a child
                    newRowId = DataService.insertToTree(objToPush,0);

                    $rootScope.selectedTokensArray = [];
                }
                DataService.lastInsertedUnitIndex = newRowId;

                return newRowId.toString();
            }
        }
        
        function submitTask(){
            return saveTask(true/* submit the task */)
        }
        
        function saveTask(shouldSubmit){
            annotation_units = [];
            traversInTree(DataService.tree);
            var mode = shouldSubmit ? 'submit' : 'draft';
            DataService.currentTask['annotation_units'] = annotation_units;
            return apiService.annotation.putTaskData(mode,DataService.currentTask).then(function(res){
                return res;
            });
        }

        /**
         * Wrapping function - splits wordsToWrap if setId == true by ' ' and wrap them with span element with class selectable-word and attribute data-wordId=word-{{index in the main article}}.
         * @param wordsToWrap - The line of words to wrap.
         * @param setId - a boolean variable defining if it is the first wrapping
         * @returns {string} - the wrapped words.
         */
        function wrapWords(wordsToWrap,setId){
            if(setId == true){
                var result ='';
                wordsToWrap.forEach(function(token,index){
                    if(token.parent_id){
                        result += '<span parent-index='+token.parent_id+'  token-id='+token.id+' class="selectable-word word-'+(token.id)+'" data-wordId="word-'+ (token.id) +'">'+token.text+'</span>';
                    }else{
                        result += '<span parent-index="0"  token-id='+token.id+' class="selectable-word word-'+(token.id)+'" data-wordId="word-'+ (token.id) +'">'+token.text+'</span>';
                    }
                    result += ' ';
                });
            }else{
                result = wordsToWrap;
            }
            return result;
        }

        function traversInTree(treeNode){
            console.log(treeNode.annotation_unit_tree_id)
            var unit = {
                annotation_unit_tree_id : treeNode.unitType == 'REMOTE' ? DataService.getParentUnitId(treeNode.annotation_unit_tree_id) : treeNode.annotation_unit_tree_id.toString(),
                task_id: DataService.currentTask.id.toString(),
                comment: treeNode.comment || '',
                categories: treeNode.categories || [],
                parent_id: treeNode.unitType == 'REMOTE' ? treeNode.remote_located_parent_id : DataService.getParentUnitId(treeNode.annotation_unit_tree_id),
                gui_status : treeNode.gui_status,
                type: treeNode.unitType.toUpperCase(),
                is_remote_copy: treeNode.unitType.toUpperCase() == 'REMOTE',
                children_tokens: treeNode.children_tokens
            };
            unit.type == 'REMOTE' ? unit.type = 'REGULAR' : '';
            // unit.categories.forEach(function(category){
            //     delete category.$$hashKey;
            //     delete category.color;
            //     delete category.abbreviation;
            // });
            if(unit.categories.length == 1 && unit.categories[0].id == null){
                unit.categories = [];
            }
            annotation_units.push(unit);
            for(var i=0; i<treeNode.AnnotationUnits.length; i++){
                traversInTree(treeNode.AnnotationUnits[i]);
            }
        }

        function getChildrenTokenForUnit(treeNode){
            var html = document.createElement('div');
            html.innerHTML = treeNode.text;
            var tokens = html.children;
            var children_tokens = [];

            var regexp = /token-id/g;
            // var foo = "abc1, abc2, abc3, zxy, abc4";
            var match, matches = [];

            while ((match = regexp.exec(treeNode.text)) != null) {
              matches.push(match.index);
            }

            for(var i=0; i<tokens.length; i++){
                if(tokenIdNotInArray(parseInt($(tokens[i]).attr('token-id')),children_tokens)){
                        var token ={
                            id: parseInt($(tokens[i]).attr('token-id'))
                        };
                        children_tokens.push(token);
                    }
                }
                

            return children_tokens;
        }

        function tokenIdNotInArray(tokenId,array){
            var result = true;
            for(var i=0; i<array.length; i++){
                if(array[i].id == tokenId){
                    result = false;
                }
            }
            return result;
        }

        function addCategoryToExistingRow(rowID,newCategory,scope){
            var splittedRowId = rowID.toString().split('-');
            var tempRowObject = DataService.tree.AnnotationUnits[parseInt(splittedRowId[0] - 1)];

            for(var i=1; i<splittedRowId.length; i++){
                tempRowObject = tempRowObject.AnnotationUnits[parseInt(splittedRowId[i] - 1)];
            }
            tempRowObject = categoryExitsRemoveIt(tempRowObject,newCategory.id);
            if(!tempRowObject.categories.changed){
                tempRowObject.categories.push(newCategory);
            }

            tempRowObject.categories.changed = true;
        }

        function categoryExitsRemoveIt(rowObject,newCategory){
            for(var i=0; i<rowObject.categories.length; i++){
                if(rowObject.categories[i].id == newCategory){
                    rowObject.categories.splice(i,1);
                    rowObject.categories.changed = true;
                    return rowObject;
                }
                // console.log(DataService.tree);
            }
            rowObject.categories.changed = false;
            return rowObject;
        }

        function getUnitById(unitID){
            if(unitID == -1){
                return null
            }else if(!unitID || unitID == 0){
                var tempUnit = DataService.tree;
            }else{
                var splittedUnitId = splitStringByDelimiter(unitID,"-");
                var tempUnit = DataService.tree;

                for(var i=0; i<splittedUnitId.length; i++){
                    tempUnit.AnnotationUnits.length > 0 ? tempUnit = tempUnit.AnnotationUnits[parseInt(splittedUnitId[i])-1] : '';
                }
            }
            return tempUnit;
        }

        function getNextUnit(lastFocusedUnitId,index){
            if(lastFocusedUnitId == 0){
                if(DataService.tree.AnnotationUnits.length > 0){
                    return DataService.tree.AnnotationUnits[0].annotation_unit_tree_id;
                }
            }else{
                var currentUnit = DataService.getUnitById(lastFocusedUnitId);


                if(currentUnit.AnnotationUnits.length > index){
                    return currentUnit.AnnotationUnits[index].annotation_unit_tree_id;
                }else{
                    if(lastFocusedUnitId == DataService.tree.AnnotationUnits.length){
                        return -1;
                    }
                    var splittedUnitID = splitStringByDelimiter(lastFocusedUnitId,'-');
                    var parentID="";
                    if(currentUnit.annotation_unit_tree_id.length >= 3){
                        parentID = splittedUnitID.slice(0,splittedUnitID.length-1).join("-");
                    }
                    else{
                        parentID = 0;
                    }
                    if (parentID != 0){
                        return getNextUnit(parentID,splittedUnitID[splittedUnitID.length-1])
                    }else{
                        return DataService.tree.AnnotationUnits[parseInt(lastFocusedUnitId)].annotation_unit_tree_id;
                    }

                }
            }

        }

        function getPrevUnit(lastFocusedUnitId,index){
            var prevUnitId, parentUnit;
            if(index != -1){
                prevUnitId = lastFocusedUnitId+"-"+index;
                parentUnit = getUnitById(prevUnitId);
            }else{
                prevUnitId = lastFocusedUnitId;
                parentUnit = getUnitById(prevUnitId);
            }

            if(parentUnit){
                //go down to the last node of the last node
                while(parentUnit.AnnotationUnits.length > 0){
                    parentUnit = parentUnit.AnnotationUnits[parentUnit.AnnotationUnits.length-1]
                }
                return parentUnit.annotation_unit_tree_id;

            }else{
                return lastFocusedUnitId;
            }
            
            // if(lastFocusedUnitId == 1){
            //     return "0"
            // }else{

            //     var currentUnit = DataService.getUnitById(lastFocusedUnitId);
            //     if(currentUnit.AnnotationUnits[parseInt(index)-2]){
            //         return currentUnit.AnnotationUnits[parseInt(index)-2].annotation_unit_tree_id;
            //     }else{
            //         var splittedUnitID = splitStringByDelimiter(lastFocusedUnitId,'-');
            //         var parentID="";
            //         if(currentUnit.annotation_unit_tree_id.length >= 3){
            //             parentID = splittedUnitID.slice(0,splittedUnitID.length-1).join("-");
            //         }
            //         else{
            //             parentID = 0;
            //         }
            //         if(splitStringByDelimiter(parentID,'-').length == 1){

            //             // var splittedUnitId = splitStringByDelimiter(lastFocusedUnitId,'-');
            //             // var parenUnit = DataService.getUnitById(parseInt(splittedUnitId[splittedUnitId.length-2]));
            //             // while(parenUnit.AnnotationUnits.length > 0){
            //             //     parenUnit = parenUnit.AnnotationUnits[parseInt(splittedUnitId[splittedUnitId.length-1]-2)]
            //             // }
            //             // parentID = parenUnit.annotation_unit_tree_id;
            //         }
            //         return parentID;

            //     }
            // }
        }

        function findUnitParentThatHAsBrothers(unitID){
            var splittedUnitId = splitStringByDelimiter(unitID,"-");
            var newParentID = splittedUnitId.slice(0,splittedUnitId.length-2).join("-");
            var parentUnit = getUnitById(newParentID)

            if(parentUnit && parentUnit.AnnotationUnits.length > 0){
                return parentUnit.AnnotationUnits[0].annotation_unit_tree_id;
            }
            findUnitParentThatHAsBrothers(newParentID)
        }

        /**
         * Success callback.
         * @param response - successful response.
         * @returns {*} - the response data.
         */
        function successFunction(response){
            return response.data;
        }

        /**
         * Unsuccessful callback.
         * @param err - the error.
         */
        function errorFunction(err){
            console.log(err);
        }

        /**
         * Split a string by give delimiter.
         * @param stringToSplit - the string to split.
         * @param del - split delimiter.
         */
        function splitStringByDelimiter(stringToSplit,del){
            return stringToSplit.toString().split(del);
        }

        function getParentUnitId(unitId){
            unitId = unitId.toString();
            if(unitId.length == 1){
                if(unitId =="0"){
                    return null;
                }
                return "0";
            }
            var parentUnitId = unitId.split('-');
            parentUnitId = parentUnitId.slice(0,length-1).join('-')
            return parentUnitId.toString()
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
    }

})();