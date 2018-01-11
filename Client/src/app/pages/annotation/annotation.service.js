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
    function AnnotationTextService(apiService, ENV_CONST,$rootScope,DataService) {
        var textService = {
            getAnnotationTask: getAnnotationTask,
            getProjectLayer:getProjectLayer,
            assignColorsToCategories: assignColorsToCategories,
            assignAbbreviationToCategories: assignAbbreviationToCategories,
            assignNameToCategories: assignNameToCategories,
            toggleAnnotationUnitView: toggleAnnotationUnitView,
            isRTL: isRTL
        };

        return textService;

        /**
         * Retrieves an article.
         * @returns {*}
         */
        function getAnnotationTask(task_id){
            return apiService.annotation.getTaskData(task_id).then(function(response){return response.data});
        }
        
        function getProjectLayer(layer_id){
            return apiService.annotation.getProjectLayer(layer_id).then(function(response){return response.data});
        }
        
        function assignAbbreviationToCategories(categories){
            var categoriesHash = {}
            categories.forEach(function(category){
                if(category.abbreviation == undefined) {
                    category.abbreviation = '';
                }
                else if(categoriesHash[category.abbreviation]){
                    categoriesHash[category.abbreviation].category.abbreviation += (categoriesHash[category.abbreviation].times)
                    categoriesHash[category.abbreviation].times += 1;
                    category.abbreviation += (categoriesHash[category.abbreviation].times)
                }else{
                    categoriesHash[category.abbreviation] = {
                        "category" : category,
                        "times" : 1
                    }
                }
            })
        }
        
        function assignNameToCategories(categories){
            var categoriesHash = {}
            categories.forEach(function(category){
                if(categoriesHash[category.name]){
                    categoriesHash[category.name].category.name += (categoriesHash[category.name].times)
                    categoriesHash[category.name].times += 1;
                    category.name += (categoriesHash[category.name].times)
                }else{
                    categoriesHash[category.name] = {
                        "category" : category,
                        "times" : 1
                    }
                }
            })
        }
        
        function assignColorsToCategories(categories){
            categories.forEach(function(category, index){
                category.color = ENV_CONST.CATEGORIES_COLORS[index % ENV_CONST.CATEGORIES_COLORS.length].color
                category.backgroundColor = ENV_CONST.CATEGORIES_COLORS[index % ENV_CONST.CATEGORIES_COLORS.length].backgroundColor
                if (index < 9) {
                    category.index = index
                }
            })
        }

        function toggleAnnotationGuiStatus(plusMinusElem){
            if ($(plusMinusElem).hasClass('minus-round')) {
                return ENV_CONST.ANNOTATION_GUI_STATUS.COLLAPSE
            }else{
                return ENV_CONST.ANNOTATION_GUI_STATUS.OPEN
            }
        }

        function toggleAnnotationUnitView(element){

            var elem = element.toElement ? element.toElement : element;

            $rootScope.focusUnit($(elem).closest('.categorized-word').find('.directive-info-data-container').first())
            
            
            var currentTarget =element.currentTarget;
            var annotationUnitContainer = $(currentTarget).next().find('.categorized-word');

            DataService.getUnitById($rootScope.clckedLine).gui_status = toggleAnnotationGuiStatus($($(currentTarget).find('i')))
            
        }

        function isRTL(s){           
            var ltrChars    = 'A-Za-z\u00C0-\u00D6\u00D8-\u00F6\u00F8-\u02B8\u0300-\u0590\u0800-\u1FFF'+'\u2C00-\uFB1C\uFDFE-\uFE6F\uFEFD-\uFFFF',
                rtlChars    = '\u0591-\u07FF\uFB1D-\uFDFD\uFE70-\uFEFC',
                rtlDirCheck = new RegExp('^[^'+ltrChars+']*['+rtlChars+']');
            return rtlDirCheck.test(s);
        }

    }

})();
