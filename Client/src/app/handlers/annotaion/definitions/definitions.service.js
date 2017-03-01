/* Copyright (C) 2017 Omri Abend, The Rachel and Selim Benin School of Computer Science and Engineering, The Hebrew University. */

(function() {
    'use strict';

    angular.module('zAdmin.annotation.data')
        .factory('DefinitionsService',DefinitionsService);

    var definitionsUrl = 'app/resources/annotation/definitions.json';

    /**
     * Get the restrictions list from the json file.
     * @param DataService - Service that handles data.
     * @returns {{getDefinitions: getDefinitions}} - the array of restrictions.
     */

    /** @ngInject */
    function DefinitionsService(DataService) {
        var DefinitionsService = {
            getDefinitions: getDefinitions,
            getDefinitionsById: getDefinitionsById
        };

        return DefinitionsService;

        /**
         * Get the restrictions json.
         * @returns {*} - a json file.
         */
        function getDefinitions(){
            return DataService.getData(definitionsUrl);
        }

        function getDefinitionsById(categoryId){
            DefinitionsService.getDefinitions().then(function(response){
                for(var i = 0; i < categories.length; i++ ){
                    if(categories[i].id == categoryId){
                        return categories[i];
                    }
                }
            });

        }
    }

})();