(function() {
    'use strict';

    angular.module('zAdmin.pages.annotation')
        .factory('AnnotationTextService',AnnotationTextService);

    var annotationTextUrl = "app/resources/annotation/annotationText.json";

    /**
     * A service that retrievs the text to be annotated.
     * @param $http
     * @returns {{getAnnotationText: getAnnotationText}} - an object containing the service variables and methods.
     */

    /** @ngInject */
    function AnnotationTextService(apiService, ENV_CONST) {
        var textService = {
            getAnnotationTask: getAnnotationTask,
            getCategories: getCategories,
            getProjectLayer:getProjectLayer,
            assignColorsToCategories: assignColorsToCategories
        };

        return textService;

        /**
         * Retrieves an article.
         * @returns {*}
         */
        function getAnnotationTask(task_id){
            return apiService.annotation.getTaskData(task_id).then(function(response){return response.data});
        }

        function getCategories(){
            return apiService.annotation.getCategories().then(function(response){return response.data});
        }
        function getProjectLayer(layer_id){
            return apiService.annotation.getProjectLayer(layer_id).then(function(response){return response.data});
        }
        function assignColorsToCategories(categories){
            categories.forEach(function(category, index){
                category.color = ENV_CONST.CATEGORIES_COLORS[index % ENV_CONST.CATEGORIES_COLORS.length]
            })
        }

    }

})();