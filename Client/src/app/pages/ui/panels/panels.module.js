
/* Copyright (C) 2017 Omri Abend, The Rachel and Selim Benin School of Computer Science and Engineering, The Hebrew University. */
(function () {
  'use strict';

  angular.module('zAdmin.pages.ui.panels', [])
      .config(routeConfig);

  /** @ngInject */
  function routeConfig($stateProvider) {
    $stateProvider
        .state('ui.panels', {
          url: '/panels',
          templateUrl: 'app/pages/ui/panels/panels.html',
          controller: 'NotificationsPageCtrl',
          title: 'Panels',
          sidebarMeta: {
            order: 1100,
          },
        });
  }

})();
