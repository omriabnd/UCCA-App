/* Copyright (C) 2017 Omri Abend, The Rachel and Selim Benin School of Computer Science and Engineering, The Hebrew University. */
(function () {
  'use strict';

  angular.module('zAdmin.theme')
      .directive('focusMe', focusMe);

  /** @ngInject */
  function focusMe($timeout, $parse) {
    // using to focus elelmnts in modal when its open
    return {
      link: function(scope, element, attrs) {
        var body = $('body');
        scope.$watch(body, function(value) {
          // console.log('focusMe');
          if( $('body').hasClass('modal-open') ) { 
            $timeout(function() {
              element[0].focus(); 
              element[0].select(); 
            });
          }
        });
        
      }
    };
  }

})();
