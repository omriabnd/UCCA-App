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
                DefaultHotKeys: getDefaultHotKeys,
                Categories: getCategories
            }
          });

      function getAnnotationTask(AnnotationTextService,$stateParams,DataService) {
          return AnnotationTextService.getAnnotationTask($stateParams.taskId).then(function(taskResponse){
              var layer_id = taskResponse.project.layer.id;
              return AnnotationTextService.getProjectLayer(layer_id).then(function(layerResponse){
                  layerResponse.categories.forEach(function(category){
                      category['callbackFunction'] = 'toggleCategory'
                  });

                  DataService.currentTask = taskResponse;

                  setCategoriesColor(AnnotationTextService,layerResponse.categories);
                  if(!!DataService.currentTask.annotation_units){
                      DataService.categories = layerResponse.categories;
                      DataService.createHashTables();
                      DataService.initTree();
                  }

                  return{
                      Task:taskResponse,
                      Layer: layerResponse
                  }
              });
          });
      }

      function getDefinitions(DefinitionsService) {
          return DefinitionsService.getDefinitions();
      }

      function getDefaultHotKeys(DataService) {
          return DataService.getData('app/resources/annotation/defaultHotKeys.json');
      }

      function getCategories(AnnotationTextService){
          return AnnotationTextService.getCategories();
      }

      function setCategoriesColor(AnnotationTextService,categories){
          AnnotationTextService.assignColorsToCategories(categories);
      }
    }

})();