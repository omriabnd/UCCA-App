
/* Copyright (C) 2017 Omri Abend, The Rachel and Selim Benin School of Computer Science and Engineering, The Hebrew University. */
(function () {
  'use strict';

  angular.module('zAdmin.pages.ui.notifications', [])
      .config(routeConfig);

  /** @ngInject */
  function routeConfig($stateProvider) {
    $stateProvider
        .state('ui.notifications', {
          url: '/notifications',
          templateUrl: 'app/pages/ui/notifications/notifications.html',
          controller: 'NotificationsPageCtrl',
          title: 'Notifications',
          sidebarMeta: {
            order: 700,
          },
        });
  }

})();
