/* Copyright (C) 2017 Omri Abend, The Rachel and Selim Benin School of Computer Science and Engineering, The Hebrew University. */
(function () {
  'use strict';

  angular.module('zAdmin.pages.edit', [
    'zAdmin.pages.edit.users',
    'zAdmin.pages.edit.sources',
    'zAdmin.pages.edit.passages',
    'zAdmin.pages.edit.categories',
    'zAdmin.pages.edit.layers',
    'zAdmin.pages.edit.tasks',
    'zAdmin.pages.edit.projects'

  ])
      .config(routeConfig);

  /** @ngInject */
    function routeConfig($stateProvider) {
      $stateProvider
          .state('edit', {
            url: '/edit',
            template : '<ui-view></ui-view>',
            abstract: true,
            title: 'Edit',
            controller:'EditCtrl',
            controllerAs:'vmEditCtrl',
            sidebarMeta: false
          });
    }

})();