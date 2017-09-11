/**
 * Constructor
 */

function FlashBang(msg, template){
  'use strict';

  this.msg = msg;
  this.template = template;
}

$(function(){
  'use strict';

  FlashBang.prototype.createError = function(container, isStatic){
    container = (typeof container === 'undefined') ? '#notice-container' : container;
    this.template = '<div class=\"alert alert-error\"';
    if (!isStatic) {
      this.template += ' data-dismiss=\"alert\"';
    }
    this.template += '>';
    if (!isStatic) {
      this.template += '<button type=\"button\" class=\"close\" data-dismiss=\"alert\">×</button>';
    }
    this.template += this.msg+'</div>';
    $(container).prepend(this.template);
  };

  FlashBang.prototype.createSuccess = function(container, isStatic){
    container = (typeof container === 'undefined') ? '#notice-container' : container;
    this.template = '<div class=\"alert alert-success\"';
    if (!isStatic) {
      this.template += ' data-dismiss=\"alert\"';
    }
    this.template += '>';
    if (!isStatic) {
      this.template += '<button type=\"button\" class=\"close\" data-dismiss=\"alert\">×</button>';
    }
    this.template += this.msg+'</div>';
    $(container).prepend(this.template);
  };

  FlashBang.prototype.createNotice = function(container, isStatic){
    container = (typeof container === 'undefined') ? '#notice-container' : container;
    this.template = '<div class=\"alert alert-notice\"';
    if (!isStatic) {
      this.template += ' data-dismiss=\"alert\"';
    }
    this.template += '>';
    if (!isStatic) {
      this.template += '<button type=\"button\" class=\"close\" data-dismiss=\"alert\">×</button>';
    }
    this.template += this.msg+'</div>';
    $(container).prepend(this.template);
  };

  FlashBang.prototype.createInfo = function(container, isStatic){
    container = (typeof container === 'undefined') ? '#notice-container' : container;
    this.template = '<div class=\"alert alert-info\"';
    if (!isStatic) {
      this.template += ' data-dismiss=\"alert\"';
    }
    this.template += '>';
    if (!isStatic) {
      this.template += '<button type=\"button\" class=\"close\" data-dismiss=\"alert\">×</button>';
    }
    this.template += this.msg+'</div>';
    $(container).prepend(this.template);
  };

});
