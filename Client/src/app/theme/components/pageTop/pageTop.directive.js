
/* Copyright (C) 2017 Omri Abend, The Rachel and Selim Benin School of Computer Science and Engineering, The Hebrew University. */
(function () {
  'use strict';

  angular.module('zAdmin.theme.components')
      .directive('pageTop', pageTop);

  /** @ngInject */
  function pageTop() {
    return {
      restrict: 'E',
      templateUrl: 'app/theme/components/pageTop/pageTop.html',
      controllerAs:"vm",
      controller:pageTopCtrl
    };
  }

  /** A modal dialog that will let users turn the tracing and validations on and off*/
  function DiagnosticsController($uibModalInstance) {
      this.trace = getTrace();
      this.validate = getValidate();

      this.save = function () {
          setTrace(this.trace);
          setValidate(this.validate);

          this.close();
      };

      this.close = function () {
          $uibModalInstance.dismiss('cancel');
      }
  }
  
  /** @ngInject */
  function pageTopCtrl(authService,$state, $uibModal) {
      var vm = this;
      this.logout = function () {
          authService.logout().then(function (data) {
              $state.go('auth');
          }, function (data) {
              $state.go('auth');
          })
      };

      this.diagnostics = function () {
          $uibModal.open({
            templateUrl: 'app/theme/components/pageTop/diagnostics_modal.html',
            controller: DiagnosticsController,
            controllerAs: 'vm'
        });
      };
  }
})();
