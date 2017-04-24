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

        function getAnnotationTask(AnnotationTextService,$stateParams,DataService,restrictionsValidatorService) {
            return AnnotationTextService.getAnnotationTask($stateParams.taskId).then(function(taskResponse){
                var layer_id = taskResponse.project.layer.id;

                var curentLayer = taskResponse.project.layer
                var allCategories = curentLayer.categories;

                if(!!curentLayer.parent){
                    // this is how we will know to style this category in derived layer
                    allCategories.forEach(function(cat){return cat.refinedCategory = true})
                }

                while( !!curentLayer.parent ){
                    curentLayer.parent.categories.forEach(function(category){
                        category.fromParentLayer = true
                    })
                    allCategories = allCategories.concat(curentLayer.parent.categories)
                    curentLayer = curentLayer.parent;
                }

                // sort and move the parent category to locat upper then the childrent categories
                if(!!taskResponse.project.layer.parent){
                    allCategories.forEach(function(cat,index){
                        if(!cat.parent){
                            // move the parent categories to be before thr children categories
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

                var relvenatParentsCategories = allCategories.filter(function(cat){
                    return !cat.fromParentLayer && !!cat.parent && !!cat.parent.id
                });

                relvenatParentsCategories.forEach(function(category){
                    // var parentIndex = allCategories.findIndex(cat => cat.id == category.parent.id);
                    var parentIndex = allCategories.findIndex(
                        function(cat){ return cat.id==category.parent.id }
                    );
                    // this is how we will know to add style to this category
                    allCategories[parentIndex]['shouldRefine'] = true
                });
                taskResponse.tokens = replaceEnterWithBr(taskResponse.tokens);
                DataService.currentTask = taskResponse;

                restrictionsValidatorService.initRestrictionsTables(taskResponse.project.layer.restrictions);

                setCategoriesColor(AnnotationTextService,allCategories);
                setCategoriesAbbreviation(AnnotationTextService,allCategories);
                if(!!DataService.currentTask.annotation_units){
                    DataService.categories = allCategories;
                    DataService.createHashTables();
                    DataService.createTokensHashByTokensArrayForPassage(taskResponse.tokens);
                    DataService.initTree();
                }
                
                return{
                    Task:taskResponse,
                    Layer: taskResponse.project.layer,
                    Categories: allCategories
                }
            });
        }
        function replaceEnterWithBr(tokensArray){
          tokensArray.forEach(function(token){
              token.text = token.text.replace(/\n/g,'<br>').replace(/\u21b5/g,'<br>');
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
    }

})();