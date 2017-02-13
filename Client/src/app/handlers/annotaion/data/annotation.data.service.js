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
     *          numOfRows: number,
     *          Rows: Array
     *     },
     *    getData: getData,
     *    insertToTree: insertToTree,
     *    parseSelectedWords: parseSelectedWords
     *  }
     * } - An object containing the service variables and methods.
     */

    /** @ngInject */
    function DataService($http,apiService,$rootScope) {
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
                numOfRows: 0,
                unitType:'REGULAR',
                containsAllParentUnits: false,
                Rows : [],
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
            parseSelectedWords:parseSelectedWords,
            addCategoryToExistingRow: addCategoryToExistingRow,
            getNextUnit: getNextUnit,
            getPrevUnit: getPrevUnit,
            getUnitById:getUnitById,
            getParentUnitId:getParentUnitId,
            saveTask: saveTask,
            wrapWords:wrapWords,
            initTree:initTree,
            createHashTables:createHashTables
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
                            abbreviation: DataService.hashTables.categoriesHashTable[unit.categories[i].id].abbreviation,
                            name: DataService.hashTables.categoriesHashTable[unit.categories[i].id].name

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
                        $rootScope.clckedLine = DataService.parseSelectedWords($rootScope.selectedTokensArray,DataService.tree.Rows+1,unit.parent_id,$rootScope.currentCategoryID,$rootScope.currentCategoryColor,$rootScope.currentCategoryAbbreviation,$rootScope.currentCategoryName,false,unitCategoriesArray);

                        DataService.getUnitById($rootScope.clckedLine).comment = unit.comment;
                    }

                    if(unit.type == 'IMPLICIT'){
                        DataService.unitType = 'REMOTE';

                        var objToPush = {
                            rowId : '',
                            text : '<span>IMPLICIT UNIT</span>',
                            numOfRows: 0,
                            categories:unitCategoriesArray,
                            comment:"",
                            rowShape:'',
                            unitType:'IMPLICIT',
                            usedAsRemote:[],
                            children_tokens:[],
                            containsAllParentUnits: false,
                            Rows : [

                            ]
                        };

                        DataService.insertToTree(objToPush,$rootScope.clckedLine);
                    }
                }
            })
            DataService.unitType = 'REGULAR';
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
            if(level == 0){
                DataService.tree.numOfRows++;
                newObject.annotation_unit_tree_id = DataService.tree.numOfRows;
                DataService.tree.Rows.push(newObject);
            }else{
                var splittedIndex = level.toString().split('-');
                var tempObject = null;

                tempObject = DataService.tree.Rows[parseInt(splittedIndex[0]) - 1];
                for (var i=1; i<splittedIndex.length; i++){
                    tempObject = tempObject.Rows[parseInt(splittedIndex[i]) - 1];
                }
                tempObject.numOfRows++;
                newObject.annotation_unit_tree_id = level+'-'+tempObject.numOfRows;
                tempObject.Rows.push(newObject);
            }
            DataService.lastInsertedUnitIndex = newObject.annotation_unit_tree_id;
            return newObject.annotation_unit_tree_id;
        }

        /**
         * Delete row from the data tree.
         * If the node is in the data tree top level all it's child is transferred 1 level up. deletes the node and updated tree.
         * If the node is not at the tree's top level the function will traverse to it and then all it's child is transferred 1 level up. deletes the node and updated tree.
         * @param row_id - node id.
         */
        function deleteFromTree(row_id){
            var splittedId = row_id.toString().split('-');
            var tempObject;
            var treeNodeRowsLength;
            var indexToInsertChild;

            if(splittedId.length == 1){
                /**
                 * Node in tree's top level.
                 */

                var unitToDeleteChildren = DataService.tree.Rows[parseInt(splittedId[0]) - 1].Rows;

                for(var i=0; i<unitToDeleteChildren.length; i++){
                    if(unitToDeleteChildren[i].unitType == 'REMOTE'){
                        DataService.tree.Rows[parseInt(splittedId[0]) - 1].Rows.splice(i,1);
                        DataService.tree.Rows[parseInt(splittedId[0]) - 1].numOfRows = DataService.tree.Rows[parseInt(splittedId[0]) - 1].Rows.length;
                        i--;
                    }
                }

                treeNodeRowsLength = DataService.tree.Rows[parseInt(splittedId[0]) - 1].Rows.length;
                indexToInsertChild = parseInt(splittedId[0]);
                for(var i=0; i<treeNodeRowsLength; i++){
                    DataService.tree.Rows.splice(indexToInsertChild, 0, DataService.tree.Rows[parseInt(splittedId[0]) - 1].Rows[i]);
                    indexToInsertChild++
                }


                DataService.tree.Rows.splice(parseInt(splittedId[0]) - 1,1);
                DataService.tree.numOfRows = DataService.tree.Rows.length;

                //Remove border from parent


                updateTreeNodesIds(DataService.tree,"");
            }else{
                /**
                 * Traverse to the node.
                 */
                tempObject = DataService.tree.Rows[parseInt(splittedId[0]) - 1];
                for (i=1; i<splittedId.length-1; i++){
                    tempObject = tempObject.Rows[parseInt(splittedId[i]) - 1];
                }

                var deletedRow = tempObject.Rows[parseInt(splittedId[splittedId.length-1])-1];

                var unitToDeleteChildren = deletedRow.Rows;

                for(var i=0; i<unitToDeleteChildren.length; i++){
                    if(unitToDeleteChildren[i].unitType == 'REMOTE'){
                        deletedRow.Rows.splice(i,1);
                        deletedRow.numOfRows = deletedRow.Rows.length;
                        i--;
                    }
                }

                deletedRow != undefined ? treeNodeRowsLength = deletedRow.Rows.length : treeNodeRowsLength = 0;
                indexToInsertChild = parseInt(splittedId[splittedId.length-1]);
                for(i=0; i<treeNodeRowsLength; i++){
                    tempObject.Rows.splice(indexToInsertChild, 0, deletedRow.Rows[i]);
                    indexToInsertChild++
                }

                tempObject.Rows.splice(parseInt(splittedId[splittedId.length-1])-1,1);

                updateTreeNodesIds(tempObject,tempObject.annotation_unit_tree_id);
            }

            return updatedFocusedUnitId(row_id);
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
            console.log(subTreeParentNode.annotation_unit_tree_id);
            for(var i=0; i<subTreeParentNode.Rows.length; i++){
                nodeNewId == "" ? subTreeParentNode.Rows[i].annotation_unit_tree_id = String(i+1) : subTreeParentNode.Rows[i].annotation_unit_tree_id = nodeNewId+'-'+(i+1);
                updateTreeNodesIds(subTreeParentNode.Rows[i],subTreeParentNode.Rows[i].annotation_unit_tree_id)
            }


        }

        /**
         * Gets the selected words array turns the into 1 line and insert then into the data structure.
         * @param selectedTokensArray - the selected words.
         * @param id
         * @param level - defines the level to insert the words. if undefined insertion will go the top level.
         * @param rowColor - defines the row color.
         */
        function parseSelectedWords(selectedTokensArray,id,level, rowCategoryID, rowCategoryColor, rowCategoryAbbreviation, rowCategoryName, containsAllParentUnits, categoriesArray){
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
                var objToPush = {
                    annotation_unit_tree_id : '',
                    text : attachedWords,
                    numOfRows: 0,
                    categories:[],
                    comment:"",
                    rowShape:'',
                    usedAsRemote:[],
                    children_tokens: children_tokens,
                    gui_status: 'OPEN',
                    unitType:DataService.unitType,
                    containsAllParentUnits: containsAllParentUnits || false,
                    Rows : [

                    ]
                };
                if(categoriesArray != undefined && categoriesArray.length > 0){
                    objToPush.categories = categoriesArray;
                }else if(rowCategoryColor != undefined){
                    objToPush.categories.push({id: rowCategoryID, color:rowCategoryColor , abbreviation: rowCategoryAbbreviation, name :rowCategoryName});
                }
                var newRowId = '';
                if(level != undefined){
                    newRowId = DataService.insertToTree(objToPush,level);
                }else{
                    newRowId = DataService.insertToTree(objToPush,0);
                }
                DataService.lastInsertedUnitIndex = newRowId;

                return newRowId.toString();
            }
        }

        function saveTask(){
            annotation_units = [];
            traversInTree(DataService.tree);
            var mode = 'draft';
            DataService.currentTask['annotation_units'] = annotation_units;
            return apiService.annotation.putTaskData(mode,DataService.currentTask).then(function(res){
                return res;
            });
            // console.log(JSON.stringify(annotation_units));
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
                annotation_unit_tree_id :treeNode.annotation_unit_tree_id.toString(),
                task_id: DataService.currentTask.id.toString(),
                comment: treeNode.comment || '',
                categories: treeNode.categories || [],
                parent_id: DataService.getParentUnitId(treeNode.annotation_unit_tree_id),
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
            for(var i=0; i<treeNode.Rows.length; i++){
                traversInTree(treeNode.Rows[i]);
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
            var tempRowObject = DataService.tree.Rows[parseInt(splittedRowId[0] - 1)];

            for(var i=1; i<splittedRowId.length; i++){
                tempRowObject = tempRowObject.Rows[parseInt(splittedRowId[i] - 1)];
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
                console.log(DataService.tree);
            }
            rowObject.categories.changed = false;
            return rowObject;
        }

        function getUnitById(unitID){
            if(unitID == -1){
                return null
            }else if(unitID == 0){
                var tempUnit = DataService.tree;
            }else{
                var splittedUnitId = splitStringByDelimiter(unitID,"-");
                var tempUnit = DataService.tree;

                for(var i=0; i<splittedUnitId.length; i++){
                    tempUnit.Rows.length > 0 ? tempUnit = tempUnit.Rows[parseInt(splittedUnitId[i])-1] : '';
                }
            }
            return tempUnit;
        }

        function getNextUnit(lastFocusedUnitId,index){
            if(lastFocusedUnitId == 0){
                if(DataService.tree.Rows.length > 0){
                    return DataService.tree.Rows[0].annotation_unit_tree_id;
                }
            }else{
                var currentUnit = DataService.getUnitById(lastFocusedUnitId);


                if(currentUnit.Rows.length > index){
                    return currentUnit.Rows[index].annotation_unit_tree_id;
                }else{
                    if(lastFocusedUnitId == DataService.tree.Rows.length){
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
                        return DataService.tree.Rows[parseInt(lastFocusedUnitId)].annotation_unit_tree_id;
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
                while(parentUnit.Rows.length > 0){
                    parentUnit = parentUnit.Rows[parentUnit.Rows.length-1]
                }
                return parentUnit.annotation_unit_tree_id;

            }else{
                return lastFocusedUnitId;
            }
            
            // if(lastFocusedUnitId == 1){
            //     return "0"
            // }else{

            //     var currentUnit = DataService.getUnitById(lastFocusedUnitId);
            //     if(currentUnit.Rows[parseInt(index)-2]){
            //         return currentUnit.Rows[parseInt(index)-2].annotation_unit_tree_id;
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
            //             // while(parenUnit.Rows.length > 0){
            //             //     parenUnit = parenUnit.Rows[parseInt(splittedUnitId[splittedUnitId.length-1]-2)]
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

            if(parentUnit && parentUnit.Rows.length > 0){
                return parentUnit.Rows[0].annotation_unit_tree_id;
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