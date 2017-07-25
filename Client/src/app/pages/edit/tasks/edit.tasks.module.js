/* Copyright (C) 2017 Omri Abend, The Rachel and Selim Benin School of Computer Science and Engineering, The Hebrew University. */
(function () {
    'use strict';

    angular.module('zAdmin.pages.edit.tasks', [
        'zAdmin.pages.edit.tasks.passages',
        'zAdmin.pages.edit.tasks.tokenization',
        'zAdmin.pages.edit.tasks.annotation',
        'zAdmin.pages.edit.tasks.review'
    ])
        .config(routeConfig);

    /** @ngInject */
    function routeConfig($stateProvider) {
        $stateProvider
            .state('edit.tasks', {
                url: '/tasks',
                template : '<ui-view></ui-view>',
                title: 'Edit Tasks',
                controller: 'EditTasksCtrl',
                controllerAs: 'vmEditTasksCtrl',
                sidebarMeta: false
            });
    }

})();

