
/* Copyright (C) 2017 Omri Abend, The Rachel and Selim Benin School of Computer Science and Engineering, The Hebrew University. */
(function () {
  'use strict';

  angular.module('zAdmin.pages.ui.modals')
      .controller('NotificationsCtrl', NotificationsCtrl);

  /** @ngInject */
  function NotificationsCtrl($scope, toastr) {
    $scope.showSuccessMsg = function() {
      toastr.success('Your information has been saved successfully!');
    };

    $scope.showInfoMsg = function() {
      toastr.info("You've got a new email!", 'Information');
    };

    $scope.showErrorMsg = function() {
      toastr.error("Your information hasn't been saved!", 'Error');
    };

    $scope.showWarningMsg = function() {
      toastr.warning('Your computer is about to explode!', 'Warning');
    };
  }

})();
