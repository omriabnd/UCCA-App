
/* Copyright (C) 2017 Omri Abend, The Rachel and Selim Benin School of Computer Science and Engineering, The Hebrew University. */
(function () {
    'use strict';

    angular.module('zAdmin.annotation.selectionHandler')
        .service('selectionHandlerService', selectionHandlerService);

    /** @ngInject */
    function selectionHandlerService(DataService) {
        var selectedTokenList = [];
        var selectedUnit = "0";
        var tokenClicked = false;
        var selectionDirection = "DOWN";
        var unitToAddRemotes = "0";
        var categoryForRemote = [];


        var _handler = {
            selectedTokenList: selectedTokenList,
            selectedUnit:selectedUnit,
            selectionDirection:selectionDirection,
            unitToAddRemotes:unitToAddRemotes,
            categoryForRemote:categoryForRemote,
            getSelectedTokenList: function(){
                return this.selectedTokenList;
            },
            isTokenClicked: function(){
              return this.tokenClicked;
            },
            setTokenClicked: function(){
                this.tokenClicked = true;
            },
            disableTokenClicked: function(){
                this.tokenClicked = false;
            },
            setUnitToAddRemotes: function(id){
                this.unitToAddRemotes = id;
            },
            getUnitToAddRemotes: function(id){
                return this.unitToAddRemotes;
            },
            addTokenToList: function(token,selectedUnit,groupUnit){
                var elementPos = this.selectedTokenList.map(function(x) {return x.id; }).indexOf(token.id);
                if(elementPos === -1){
                    !groupUnit ? _handler.removeTokenFromUnitTokens(token) : '';
                    var copiedToken = angular.copy(token);
                    this.selectedTokenList.push(copiedToken);
                    sortSelectedTokenList(this.selectedTokenList);
                    updateIndexInParentAttribute(this.selectedTokenList);
                    updatePositionInUnitAttribute(this.selectedTokenList);
                    updateNextTokenNotAdjacent(this.selectedTokenList);
                    updateLastTokenNotAdjacent(this.selectedTokenList);
                }
                this.selectedUnit = selectedUnit;
            },
            setCategoryForRemote: function(category){
                this.categoryForRemote = [];
                this.categoryForRemote.push(category);
            },
            getCategoryForRemote: function(){
                return this.categoryForRemote;
            },
            clearCategoryForRemote: function(category){
                this.categoryForRemote = [];
            },
            setSelectionDirection: function(mode){
              this.selectionDirection = mode;
            },
            getSelectionDirection: function(mode){
                return this.selectionDirection;
            },
            removeTokenFromList: function(tokenId){
                var elementPos = this.selectedTokenList.map(function(x) {return x.id; }).indexOf(tokenId);
                var objectFound = this.selectedTokenList[elementPos];
                // _handler.addTokenFromUnitTokens();
                this.selectedTokenList.splice(elementPos,1);
            },
            removeTokenFromUnitTokens: function(token){
                var unit = DataService.getUnitById(_handler.getSelectedUnitId());
                if(unit){
                    if(unit.tokenCopy === undefined){
                        unit.tokenCopy = [];
                        for(var key in unit.children_tokens_hash){
                            unit.tokenCopy.push(unit.children_tokens_hash[key]);
                        }
                    }
                    var elementPos = unit.tokenCopy.map(function(x) {return x.id; }).indexOf(token.id);
                    if(elementPos > -1){
                        var selectedUnitId = _handler.getSelectedUnitId();
                        var selectedUnit = DataService.getUnitById(selectedUnitId);
                        if(selectedUnit.AnnotationUnits === undefined){
                            selectedUnit.AnnotationUnits = [];
                        }
                        var tokenInUnit = _handler.isTokenInUnit(selectedUnit,token);

                        !tokenInUnit ? token['inUnit'] = selectedUnitId.toString() === "0" ? (selectedUnit.AnnotationUnits.length + 1).toString() : selectedUnit.annotation_unit_tree_id !== "0" ? selectedUnit.annotation_unit_tree_id + "-" +(selectedUnit.AnnotationUnits.length + 1).toString() : (selectedUnit.AnnotationUnits.length + 1).toString() : '';
                        token['inUnit']
                    }
                }

            },
            isTokenInUnit: function(selectedUnit,token){
                var tokenInUnit = false;
                for(var i=0; i<selectedUnit.AnnotationUnits.length; i++){
                    var tokenPosition = selectedUnit.AnnotationUnits[i].tokens.map(function(x) {return x.id; }).indexOf(token.id);
                    if(tokenPosition > -1){
                        tokenInUnit = true;
                        break;
                    }
                }
                return tokenInUnit;
            },
            clearTokenList: function(afterInsert){
                if(!afterInsert){
                    _handler.getSelectedTokenList().forEach(function(token){
                        if(token.parentId === undefined){
                            token.parentId = "0";
                        }
                        var parentUnit = DataService.getUnitById(DataService.getParentUnitId(token.parentId));
                        var elementPos = parentUnit.tokens.map(function(x) {return x.id; }).indexOf(token.id);
                        var tokenInUnit = false;
                        for(var i=0; i<parentUnit.AnnotationUnits.length; i++){
                            var tokenPosition = parentUnit.AnnotationUnits[i].tokens.map(function(x) {return x.id; }).indexOf(token.id);
                            if(tokenPosition > -1){
                                tokenInUnit = true;
                                break;
                            }
                        }
                        !tokenInUnit ? parentUnit.tokens[elementPos]['inUnit'] = null : '';
                    });
                    //
                    // this.selectedTokenList.forEach(function(token){
                    //
                    //     var unitTokens = DataService.getUnitById(token.parentId).tokens;
                    //     var tokenPosition = unitTokens.map(function(x) {return x.id; }).indexOf(token.id);
                    //     if(tokenPosition > -1 && ){
                    //         unitTokens[tokenPosition].inUnit = null;
                    //     }
                    //     token.inUnit = null;
                    // });
                }



                this.selectedTokenList = [];
            },
            addTokenFromUnitTokens: function(token){
                var unit = DataService.getUnitById(_handler.getSelectedUnitId());
                var elementPos = this.selectedTokenList.map(function(x) {return x.id; }).indexOf(token.id);
                if(elementPos === -1){
                    unit.tokenCopy.push(token);
                }
            },
            updateSelectedUnit: function(index,afterInsert){
                this.selectedUnit = index.toString();
                if(!_handler.isTokenClicked()){
                    _handler.clearTokenList(afterInsert);
                }
                _handler.disableTokenClicked();
            },
            getSelectedUnitId: function(){
                return this.selectedUnit;
            },
            initTree: function(data){

                DataService.currentTask.annotation_units.forEach(function(unit,index){
                    var tokenStack = [];
                    if(unit.type === "IMPLICIT"){
                        var objToPush = {
                            rowId : '',
                            text : '<span>IMPLICIT UNIT</span>',
                            numOfAnnotationUnits: 0,
                            categories:[],
                            comment:"",
                            rowShape:'',
                            unitType:'IMPLICIT',
                            orderNumber: '-1',
                            gui_status:'OPEN',
                            usedAsRemote:[],
                            children_tokens:[],
                            containsAllParentUnits: false,
                            tokens:[{
                                "text":"IMPLICIT UNIT",
                                "parentId":unit.parent_id,
                                "inUnit":null
                            }],
                            AnnotationUnits : [

                            ]
                        };
                        var newRowId = DataService.insertToTree(objToPush,unit.parent_id);

                        unit.categories.forEach(function(category,index){
                            _handler.toggleCategory(DataService.hashTables.categoriesHashTable[category.id],unit.annotation_unit_tree_id);
                            _handler.clearTokenList();
                        });

                    }else if(unit.is_remote_copy){

                        DataService.unitType = 'REMOTE';

                        unit["tokens"] = [];

                        unit.unitType = "REMOTE";

                        unit.children_tokens.forEach(function(token){
                            unit["tokens"].push(DataService.hashTables.tokensHashTable[token.id]);
                        });
                        unit["children_tokens"] = unit["tokens"];

                        unit["remote_original_id"] = angular.copy(unit.annotation_unit_tree_id);

                        _handler.toggleCategory(DataService.hashTables.categoriesHashTable[ unit.categories[0].id],null,unit).then(function(res){
                            unit.categories.forEach(function(category,index){
                                if(index === 0){

                                }else{
                                    console.log(res)
                                    _handler.toggleCategory(DataService.hashTables.categoriesHashTable[category.id],res);
                                }
                                _handler.clearTokenList();
                            });
                        });


                        if(unit.categories.length === 0){
                            _handler.toggleCategory(null,null,unit);
                        }

                        DataService.unitType = 'REGULAR';

                        var unitToAddTo = DataService.getUnitById(unit.annotation_unit_tree_id);

                        if(unitToAddTo){
                            if(unitToAddTo.usedAsRemote === undefined){
                                unitToAddTo["usedAsRemote"] = [];
                            }

                            var remotePosition = DataService.getUnitById(unit.remote_original_id).AnnotationUnits.map(function(x) {return x.id; }).indexOf(unit.id);
                            if(remotePosition > -1){
                                unitToAddTo["usedAsRemote"].push(DataService.getUnitById(unit.parent_id).AnnotationUnits[remotePosition].annotation_unit_tree_id);
                            }else{
                                unitToAddTo["usedAsRemote"].push(unit.parent_id + "-" + unit.annotation_unit_tree_id);
                            }
                        }

                        if(DataService.unitsUsedAsRemote[unit.annotation_unit_tree_id] === undefined){
                            DataService.unitsUsedAsRemote[unit.annotation_unit_tree_id] = {};
                        }
                        DataService.unitsUsedAsRemote[unit.annotation_unit_tree_id][unit.parent_id + "-" + unit.annotation_unit_tree_id] = true;



                        // selectionHandlerService.setUnitToAddRemotes("0");
                        $('.annotation-page-container').toggleClass('crosshair-cursor');

                    }else if(unit.annotation_unit_tree_id !== "0"){
                        unit.children_tokens.forEach(function(token){
                            var parentId = unit.annotation_unit_tree_id.length === 1 ? "0" : unit.annotation_unit_tree_id.split("-").slice(0,unit.annotation_unit_tree_id.split("-").length-1).join("-");
                            _handler.addTokenToList(DataService.hashTables.tokensHashTable[token.id],parentId)
                        });
                        if(unit.categories.length === 0){
                            _handler.toggleCategory();
                        }else{
                            _handler.toggleCategory(DataService.hashTables.categoriesHashTable[unit.categories[0].id],false,false,unit.gui_status,true)
                                .then(function(){
                                    unit.categories.forEach(function(category,index){
                                        if(index === 0){
                                            // _handler.toggleCategory(DataService.hashTables.categoriesHashTable[category.id],false,false,unit.gui_status);
                                        }else{
                                            _handler.toggleCategory(DataService.hashTables.categoriesHashTable[category.id],unit.annotation_unit_tree_id,false);
                                        }
                                        _handler.clearTokenList();
                                    });
                                });


                        }
                        _handler.clearTokenList();
                    }


                });
                DataService.unitType = 'REGULAR';
            },
            toggleCategory: function(category,justToggle,remote,gui_status,inInitStage){

                if(this.selectedTokenList.length > 0 && newUnitContainAllParentTokensTwice(this.selectedTokenList)){
                    return
                }

                if(!aUnitIsSelected(this.selectedTokenList,inInitStage) && (this.selectedTokenList.length && !justToggle) || remote || inInitStage){
                    //This mean we selected token and now we need to create new unit.
                    var newUnit = {
                        tokens : angular.copy(this.selectedTokenList),
                        categories:[],
                        gui_status:gui_status
                    };
                    if(remote){
                        newUnit = angular.copy(remote);
                        var tempCat = angular.copy(newUnit.categories[0]);
                        newUnit.categories = [];
                        tempCat !== undefined ? newUnit.categories.push(DataService.hashTables.categoriesHashTable[tempCat.id]) : '';

                        this.selectedUnit = newUnit.parent_id;

                    }

                    category !== null && !remote ? newUnit.categories.push(angular.copy(category)) : '';
                    return DataService.insertToTree(newUnit,this.selectedUnit).then(function(res){
                        if(res.status === "InsertSuccess"){
                            _handler.updateSelectedUnit(res.id,true);
                            // _handler.clearTokenList();

                            return res.id;
                        }
                    });
                }else{
                    if(justToggle){
                        _handler.updateSelectedUnit(justToggle);
                    }
                    //Toggle the category for existing unit
                    if(this.selectedUnit.toString() !== "0"){
                        return DataService.toggleCategoryForUnit(this.selectedUnit,category).then(function(res){
                            if(res.status === "ToggleSuccess"){
                                _handler.updateSelectedUnit(res.id);
                                _handler.clearTokenList();
                                return res.id;
                            }
                        })
                    }
                }

                $rootScope.$broadcast("ResetSuccess");
            }

        };

        function newUnitContainAllParentTokensTwice(selectedTokenList){
            var currentUnit = DataService.getUnitById(selectedTokenList[0].parentId);

            if(currentUnit.annotation_unit_tree_id !== "0"){
                var parentUnit = DataService.getUnitById(DataService.getParentUnitId(currentUnit.annotation_unit_tree_id));

                return compareUnitsTokens(selectedTokenList,currentUnit.tokens) && compareUnitsTokens(currentUnit.tokens,parentUnit.tokens);
            }

        }

        function compareUnitsTokens(unitATokens,unitBTokens){
            var result = true;
            if(unitATokens.length === unitBTokens.length){
                unitATokens.forEach(function(token){
                    var elementPos = unitBTokens.map(function(x) {return x.id; }).indexOf(token.id);
                    if(elementPos === -1){
                        result = false;
                    }
                })
            }else{
                result = false;
            }
            return result;
        }

        function aUnitIsSelected(selectedTokenList,inInitStage){
            var result = true;
            var unitId = null;

            if(selectedTokenList.length === 0){
                return false;
            }
            unitId = selectedTokenList[0].inUnit;

            if(unitId === null){
                return false;
            }
            selectedTokenList.forEach(function(token){
                if(unitId !== token.inUnit){
                    result = false;
                }
            });

            if(!result ){
                return false
            }

            var tokenInUnit = selectedTokenList[0].inUnit;
            tokenInUnit && DataService.getUnitById(tokenInUnit) && !inInitStage ? _handler.updateSelectedUnit(tokenInUnit) : '';
            return DataService.getUnitById(tokenInUnit);
        }

        function updateIndexInParentAttribute(selectedTokenList){
            selectedTokenList.forEach(function(token,index){
                var parentUnitTokens;
                if(token.parentId){
                    parentUnitTokens = DataService.getUnitById(token.parentId).tokens;
                }else{
                    parentUnitTokens = DataService.getUnitById("0").tokenCopy;
                }
                var elementPos = parentUnitTokens.map(function(x) {return x.id; }).indexOf(token.id);
                if(elementPos > -1){
                    token['indexInParent'] = elementPos;
                }
            })
        }

        function updatePositionInUnitAttribute(selectedTokenList){
            selectedTokenList.forEach(function(token,index){
                if(selectedTokenList.length === 1){
                    token['positionInUnit'] = 'FirstAndLast';
                }else if(index === 0){
                    token['positionInUnit'] = 'First';
                }else if(index === selectedTokenList.length-1){
                    token['positionInUnit'] = 'Last';
                }else{
                    token['positionInUnit'] = 'Middle';
                }
            })
        }

        function updateNextTokenNotAdjacent(selectedTokenList){
            selectedTokenList.forEach(function(token,index){
                if(index === selectedTokenList.length-1 || token.indexInParent + 1 === selectedTokenList[index+1].indexInParent){
                    token['nextTokenNotAdjacent'] = false;
                }else if(token.indexInParent + 1 !== selectedTokenList[index+1].indexInParent){
                    token['nextTokenNotAdjacent'] = true;
                }

            })

        }
        function updateLastTokenNotAdjacent(selectedTokenList){
            selectedTokenList.forEach(function(token,index){
                if(index === 0 || token.indexInParent - 1 === selectedTokenList[index-1].indexInParent){
                    token['lastTokenNotAdjacent'] = false;
                }else if(token.indexInParent - 1 !== selectedTokenList[index-1].indexInParent){
                    token['lastTokenNotAdjacent'] = true;
                }

                if(token["positionInUnit"] === "First" && token['nextTokenNotAdjacent']){
                    token['positionInUnit'] = 'FirstAndLast';
                }
                if(token["positionInUnit"] === "Last" && token['lastTokenNotAdjacent']){
                    token['positionInUnit'] = 'FirstAndLast';
                }
                if(token["positionInUnit"] === "Middle" && token['lastTokenNotAdjacent'] && token['nextTokenNotAdjacent']){
                    token['positionInUnit'] = 'FirstAndLast';
                }
                if(token["positionInUnit"] === "Middle" && token['lastTokenNotAdjacent']){
                    token['positionInUnit'] = 'First';
                }
                if(token["positionInUnit"] === "Middle" && token['nextTokenNotAdjacent']){
                    token['positionInUnit'] = 'Last';
                }

            })

        }

        function sortSelectedTokenList(selectedTokenList){
            selectedTokenList.sort(function(a,b){
                if(a.start_index > b.start_index){
                    return 1;
                }else if(a.start_index < b.start_index){
                    return -1;
                }else{
                    return 0;
                }
            })
        }

        return _handler;
    }

})();
