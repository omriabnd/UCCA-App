/* Copyright (C) 2017 Omri Abend, The Rachel and Selim Benin School of Computer Science and Engineering, The Hebrew University. */
(function () {
    'use strict';

    angular.module('zAdmin.pages.annotation', [
        "zAdmin.annotation",
        "zAdmin.annotation.directives"
    ])
        .config(routeConfig);

    /** @ngInject */
    function routeConfig($stateProvider) {
        $stateProvider
            .state('annotationPage', {
                url: '/annotationPage/:taskId',
                templateUrl: 'app/pages/annotation/annotation-page.html',
                title: 'Annotation',
                controller: 'AnnotationPageCtrl',
                controllerAs: 'vm',
                sidebarMeta: null,
                state_id:9,
                resolve: {
                    TaskMetaData: getAnnotationTask,
                    Definitions : getDefinitions,
                    DefaultHotKeys: getDefaultHotKeys
                }
            });

        Array.prototype.move = function (old_index, new_index) {
            while (old_index < 0) {
                old_index += this.length;
            }
            while (new_index < 0) {
                new_index += this.length;
            }
            if (new_index >= this.length) {
                var k = new_index - this.length;
                while ((k--) + 1) {
                    this.push(undefined);
                }
            }
            this.splice(new_index, 0, this.splice(old_index, 1)[0]);
            return this; // for testing purposes
        };

        function getAnnotationTask(AnnotationTextService,$stateParams,DataService,restrictionsValidatorService,selectionHandlerService,$rootScope,$timeout, AssertionService) {
          
            return AnnotationTextService.getAnnotationTask($stateParams.taskId).then(function(taskResponse){
          
                // TODO: Move this into its own function

                // --- Process Categorties and Layers ---
                // TODO: Understand what all this does
                var layer_id = taskResponse.project.layer.id;

                var currentLayer = taskResponse.project.layer;
                var allCategories = currentLayer.categories;

                // Omri: I commented out the below block which sorts the categories alphabetically.
                // This is a bug, since we want the categories to be ordered the same way as in the layer
                // admin screen.
                /*
                allCategories.sort(function(a, b) {
                	  var nameA = a.name.toUpperCase(); // ignore upper and lowercase
                	  var nameB = b.name.toUpperCase(); // ignore upper and lowercase
                	  if (nameA < nameB) {
                	    return 1;
                	  }
                	  if (nameA > nameB) {
                	    return -1;
                	  }

                	  // names must be equal
                	  return 0;
                	});*/

                if(!!currentLayer.parent){
                    // this is how we will know to style this category in derived layer
                    allCategories.forEach(function(cat){
                    	cat.refinedCategory = true;
                    	// cat.refinementCategory = true;
                    	})
                }
                var refinedCategories = [];
                var refinementCategories = allCategories;

                
                currentLayer.categories.forEach(function(category){
	                category.fromParentLayer = false;
                });
                while( !!currentLayer.parent ){
                    currentLayer.parent.categories.forEach(function(category){
	                        category.fromParentLayer = true;
	                        category.refinedCategory = false;
	                        if (refinementCategories.find(function(refinementCat){
	                        	return refinementCat.parent.id === category.id
	                        	})) {
	                        		category.refinedCategory = true;
	                        		refinedCategories.push(category);
	                        }
                        });
                    allCategories = allCategories.concat(currentLayer.parent.categories);
                    currentLayer = currentLayer.parent;
                }
//                allCategories = allCategories.concat(refinedCategories);
                // sort and move the parent category to locat upper then the children categories
                if(!!taskResponse.project.layer.parent){
                    allCategories.forEach(function(cat,index){
                        if(!cat.parent){
                            // move the parent categories to be before the children categories
                            allCategories.move(index,0)
                        }
                    })
                }                
                
                allCategories.forEach(function(category,index){
                    category['callbackFunction'] = 'toggleCategory';
                    if(category.parent && category.parent.id){
                        // move the child category to be after its parent
                        // allCategories.move(index,allCategories.findIndex(cat => cat.id==category.parent.id)+1);
                        allCategories.move(index,allCategories.findIndex(
                            function(cat){ return cat.id==category.parent.id }
                        ) + 1);
                    }
                });

                var relevantParentsCategories = allCategories.filter(function(cat){
                    return !cat.fromParentLayer && !!cat.parent && !!cat.parent.id
                });

                
                refinedCategories.forEach(function(category){
                  // var parentIndex = allCategories.findIndex(cat => cat.id == category.parent.id);
                  var index = allCategories.findIndex(
                      function(cat){ return cat.id==category.id }
                  );
                  // this is how we will know to add style to this category
                  allCategories[index]['shouldRefine'] = true;
//                  allCategories[index]["backgroundColor"] = "#ff0000";
                });
                
//                relevantParentsCategories.forEach(function(category){
//                    // var parentIndex = allCategories.findIndex(cat => cat.id == category.parent.id);
//                    var parentIndex = allCategories.findIndex(
//                        function(cat){ return cat.id==category.parent.id }
//                    );
//                    // this is how we will know to add style to this category
//                    allCategories[parentIndex]['shouldRefine'] = true
//                });
                
                // --- Process Tokens ---
                taskResponse.tokens = replaceEnterWithBr(taskResponse.tokens);

                // TODO --  stop using currentTask, anything we need from it (e.g., tokens);
                /** we should copy to the DataService other fields we need for either sending
                // it back to the Server or for working in the client.**/
                DataService.serverData = taskResponse;

                restrictionsValidatorService.initRestrictionsTables(taskResponse.project.layer.restrictions,selectionHandlerService, DataService, allCategories);

                setCategoriesColor(AnnotationTextService,allCategories);
                setCategoriesAbbreviation(AnnotationTextService,allCategories);
                setCategoriesName(AnnotationTextService,allCategories);
                
                $rootScope.isSlottedLayerProject = DataService.serverData.project.layer.slotted;
                $rootScope.isRefinementLayerProject = DataService.serverData.project.layer.type === "REFINEMENT";

                // we here add the createdByTokenization field for each token
                // first, sort tokens by start_index
                DataService.serverData.tokens.sort(function(t1,t2){return t1.start_index - t2.start_index;});
                // this definition of splitByTokenization is working only for tokens retokenized from tokenization task ...
                // second, define createdByTokenization
                // TODO: Find what createdByTokenization is used for.
                for (var index=1; index < DataService.serverData.tokens.length; index++) {
                    //createdByTokenization is True for tokens which don't start at the beginning of an original word
                    //in the passage text. For example, if "don't" is split to "do" and "n't" then "n't" has createdByTokenization=true
                    DataService.serverData.tokens[index].splitByTokenization =
                        DataService.serverData.tokens[index].require_annotation &&
                        (DataService.serverData.tokens[index].start_index == DataService.serverData.tokens[index-1].end_index+1 )&&
                        DataService.serverData.tokens[index-1].text !== '\n';
                }
                if(!!DataService.serverData.annotation_units){
                    DataService.categories = allCategories;
                    DataService.createHashTables();
                    DataService.createTokensHashByTokensArrayForPassage(taskResponse.tokens);

                    //debugger
                    //AssertionService.checkTokenMap(DataService.tree.tokenMap, taskResponse.tokens);
                    if($rootScope.isSlottedLayerProject){
                       for(var i =0; i < DataService.serverData.annotation_units.length; i++){
                           var currentUnit = DataService.serverData.annotation_units[i];
                           
//                           currentUnit.gui_status = "OPEN";
//                           restrictionsValidatorService.checkRestrictionsOnFinish(currentUnit,DataService.getUnitById(currentUnit.parent),DataService.hashTables);

                           currentUnit.categories.sort(function(a,b){
                               if(a.slot > 2 || b.slot > 2){
                                   return 1;
                               }
                               else if(a.slot > b.slot){
                                  return 1;
                               }else if(a.slot < b.slot){
                                   return -1;
                               }else{
                                   return 0;
                               }
                               
                           })
                           for(var j=0; j<currentUnit.categories.length; j++){
                               var currentcategory = currentUnit.categories[j];

                               //Update slotOne attribute
                               if(currentcategory.slot && currentcategory.slot === 1){
                                   currentUnit.slotOne = true;
                                   //console.log(currentUnit.id+" "+currentUnit.slotOne);
                               }else{
                                   currentUnit.slotOne = false;
                               }

                               //Update slotTwo attribute
                               if(currentcategory.slot && currentcategory.slot === 2){
                                  currentUnit.slotTwo = true;                                   
                                   
                               }else{
                                   currentUnit.slotTwo = false;
                               }
                           }
                           
                           
//                           if(!currentUnit.slotOne && currentUnit.slotTwo){
//                              currentUnit.categories.splice(0,0,{id:-1});
//                           }
                       }
                    }
                    $rootScope.$pageFinishedLoading = false;
                    return selectionHandlerService.initTree().then(function(){
                        selectionHandlerService.updateSelectedUnit("0",false);
                        
                        // var lastUnitId = selectionHandlerService.getTreeLastId(DataService.tree);
                        // var lastUnitText = $('#unit-'+lastUnitId);
                        
                        return{
                            Task:taskResponse,
                            Layer: taskResponse.project.layer,
                            Categories: allCategories
                        }
                    });
                }else{
                    return{
                        Task:taskResponse,
                        Layer: taskResponse.project.layer,
                        Categories: allCategories
                    }
                }              
                                
                
                
            });
            function tokensInStaticFormat(tokens) {
                var staticTokens = [];
                for (var i = 0; i < tokens.length; i++) {
                      // Build token array includes static fields
                    staticTokens.push(selectionHandlerService.copyTokenToStaticFormat(tokens[i]));
                }
               
                return staticTokens;
            }
            
        }

        function replaceEnterWithBr(tokensArray){
            tokensArray.forEach(function(token){
              token.text = token.text.replace(/\n/g,'<br>').replace(/\u21b5/g,'<br>');
              // token.static.text = token.static.text.replace(/\n/g,'<br>').replace(/\u21b5/g,'<br>');
          });
          return tokensArray;
        }
        function getDefinitions(DefinitionsService) {
            return DefinitionsService.getDefinitions();
        }

        function getDefaultHotKeys(DataService) {
            return DataService.getData('app/resources/annotation/defaultHotKeys.json');
        }

        function setCategoriesColor(AnnotationTextService,categories){
            AnnotationTextService.assignColorsToCategories(categories);
        }
        function setCategoriesAbbreviation(AnnotationTextService,categories){
            AnnotationTextService.assignAbbreviationToCategories(categories);
        }
        function setCategoriesName(AnnotationTextService,categories){
            AnnotationTextService.assignNameToCategories(categories);
        }
        
    }
    

})();
