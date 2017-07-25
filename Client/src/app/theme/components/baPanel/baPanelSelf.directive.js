
/* Copyright (C) 2017 Omri Abend, The Rachel and Selim Benin School of Computer Science and Engineering, The Hebrew University. */
(function () {
  'use strict';

  /**
   * Represents current element as panel, adding all necessary classes.
   */
  angular.module('zAdmin.theme')
      .directive('baPanelSelf', baPanelSelf);

  /** @ngInject */
  function baPanelSelf(baPanel) {
    return angular.extend({}, baPanel, {
      link: function(scope, el, attrs) {
        el.addClass('panel panel-white');
        if (attrs.baPanelClass) {
          el.addClass(attrs.baPanelClass);
        }
      }
    });
  }

})();
