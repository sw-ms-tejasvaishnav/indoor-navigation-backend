/*global URI:true displayRetinaImg: true*/

// Handler for .ready() called.
$(document).ready(function() {
  'use strict';

  var numLoaders = 0;

  // AJAX loading status indicator
  $.ajaxSetup({
    beforeSend: function() {
      numLoaders++;
      $('#ajaxstatus').css('display', 'block');
    },
    complete: function() {
      numLoaders--;
      if (numLoaders === 0) $('#ajaxstatus').css('display', 'none');
    },
    success: function() {
    }
  });

  // Check for local storage and look for application selection dropdown on the page to
  // set the selected app as a default
  var uri = new URI();

  if ( isLocalStorage() && (uri.segment(0) === 'alerts' || uri.segment(0) === 'analytics') ) {

    var selectedApp = JSON.parse(localStorage.getItem('selectedApp'));
    var pageRefreshed = JSON.parse(localStorage.getItem('pageRefreshed') || false);
    var pageAlert = localStorage.getItem('pageAlert');

    if (pageAlert !== null) {
      $('#notice-container').append( pageAlert );
      localStorage.removeItem('pageAlert');
    }

    if ( $('#app-select').length > 0 ) {
      if ( $('#app-select option').length === 2 ) {
        selectedApp = refactorAppSelector($('#app-select'));
      }
      $('#app-select').val(selectedApp);
    }

    if ( $('#new-feed-app').length > 0 ) {
      if ( $('#new-feed-app').val() !== selectedApp ) {
        if ( $('#new-feed-app option').length === 2 ) {
          selectedApp = refactorAppSelector($('#new-feed-app'));
        }
        $('#new-feed-app').val(selectedApp);
        //init the app selector that populatest the groups list
        initAppSelector('#new-feed-app', '#new-feeds-groups', '.new-feed-taggings-container');
      }
    }

    if ( selectedApp !== JSON.parse(localStorage.getItem('selectedApp')) ) {
      localStorage.setItem('selectedApp', JSON.stringify( selectedApp ));
    }

    if ( !pageRefreshed && !uri.hasQuery('client_id') ) {
      if ( selectedApp !== null ) {
        setClientIdUriQuery(selectedApp);
      }
    } else {
      localStorage.setItem('pageRefreshed', JSON.stringify(false));
    }

  }

  // Listen to application selection change, and update local storage accordingly
  $('#app-select').change(function() {
    var selApp = $(this).val();
    localStorage.setItem('selectedApp', JSON.stringify(selApp));
    setClientIdUriQuery(selApp);
  });

  // Listen to application selection change, and update local storage accordingly
  $('#new-feed-app').change(function() {
    var selApp = $(this).val();
    localStorage.setItem('selectedApp', JSON.stringify(selApp));
    setClientIdUriQuery(selApp);
  });

  // If retina display, replace all images with .retina class with their 2x counterparts
  $('img.retina').retina();

  // For application List, if retina display, replace OS icons with their 2x counterparts
  if (window.isRetina()) {
    displayRetinaImg('ul#app-list > li .app .app-icon img', 'core');
  }

  // custom select and radio styling using iCheck library
//    $('input').not('#login-remember-container input').iCheck({
//        handle: 'checkbox',
//        checkboxClass: 'icheckbox_square-blue',
////        radioClass: 'iradio_square-blue',
//        increaseArea: '20%' // optional
//    });

  // $('input[type=checkbox]').each(function(){
  //     var self = $(this),
  //         label = self.next(),
  //         label_text = label.text();

  //     label.remove();
  //     self.iCheck({
  //         checkboxClass: 'icheckbox_line',
  //         radioClass: 'iradio_line',
  //         insert: '<div class="icheck_line-icon"></div>' + label_text
  //     });
  // });

  /* =============================================================================
  Forgot password
  ========================================================================== */

  // Input script for login screens functionality for focusing field correctly and aligning text to the left
  $('#email, #password').focus(function(){
    var l = $(this).val().length;
    var placeholder = $(this).attr('placeholder');
    if(l === 0){
      $(this).attr('placeholderText', placeholder);
      $(this).attr('placeholder', ' ');
    }
  });

  // This will reset the login screen input placeholder copy if you unfocus and it's empty
  $('#email, #password').blur(function(){
    var l = $(this).val().length;
    var placeholder = $(this).attr('placeholderText');
    if(l === 0){
      $(this).attr('placeholder', placeholder);
    }
  });

  // Forgot password blur validation
  $('#forgot-password-change1, #forgot-password-change2').blur(function(){
    var l = $(this).val().length;
    var id = '#' + $(this).attr('id');
    if(l>0){
      $(id+'-field-icon').css('display', 'block');
    }
  });

  // Forgot password change field 1
  $('#forgot-password-change1').bind('textInput input change keypress paste focus', function () {
    var password1 = $(this).val();
    var password2 = $('#forgot-password-change2').val();
    if(password1.length>0){
      $('#forgot-password-change1-field-icon').css('display', 'block');
      if(password1 === password2){
        displayOkayIcon('.icon-password-change1');
        displayOkayIcon('.icon-password-change2');
      } else {
        displayRemoveIcon('.icon-password-change1');
      }
    } else{
      $('#forgot-password-change1-field-icon').css('display', 'none');
      displayOkayIcon('.icon-password-change1');
    }
  });

  // Forgot password change field 2
  $('#forgot-password-change2').bind('textInput input change keypress paste focus', function () {
    var password1 = $('#forgot-password-change1').val();
    var password2 = $(this).val();
    if(password2.length>0){
      $('#forgot-password-change2-field-icon').css('display', 'block');
      if(password1 === password2){
        displayOkayIcon('.icon-password-change1');
        displayOkayIcon('.icon-password-change2');
      } else {
        displayRemoveIcon('.icon-password-change2');
      }
    } else{
      $('#forgot-password-change2-field-icon').css('display', 'none');
      displayOkayIcon('.icon-password-chang2');
    }
  });

  // Display remove/x icon
  function displayRemoveIcon(field){
    $(field).css('color', '#e63131');
    $(field).removeClass('icon-ok');
    $(field).addClass('icon-remove');
  }

  // Display ok/check icon
  function displayOkayIcon(field){
    $(field).css('color', '#5caa3d');
    $(field).removeClass('icon-remove');
    $(field).addClass('icon-ok');
  }

  /* =============================================================================
   Main Nav - Sub nav mouse fx
   ========================================================================== */

  // Sub nav item mouse over, resets selected item when you mouse over any item
  $('.sub-nav-menu-item').mouseover(function(){
    clearSubNav();
  });

  $('#dashboard-sub-nav-container').mouseout(function(){
    resetSubnavToSelected($(this));
  });

  // Reset nav to show selected item
  function resetSubnavToSelected(nav){
    nav.find('ul').children().each(function(){
      var isSelected = $(this).attr('data-selected');
      if(isSelected === 'true'){
        $(this).addClass('sub-nav-menu-item-selected');
      }
    });
  }

  // Clear all subnav items
  function clearSubNav(){
    var selectedItem = $('nav.sub-nav ul').find('li.sub-nav-menu-item-selected');
    selectedItem.removeClass('sub-nav-menu-item-selected');
    selectedItem.attr('data-selected', 'true');
  }

  // Fade in alert
  $(document).on('DOMNodeInserted', '.alert', function() {
    initAlertEvents($(this));
  });

  // Initializes fade in events for alerts
  function initAlertEvents($target) {
    $target.delay(500).fadeIn('slow', function(){

      // Fade out alert if it has the .data-dismiss class
      if ($(this).attr('data-dismiss') === 'alert') {

        $(this).delay(5000).fadeOut('slow', function() {
          $(this).remove();
        });

      }

    });
  }

  // Init alert on load
  initAlertEvents($('.alert'));

  // Tooltips function
  $("[rel='popover']").popover();

});

/**
 * Check if the browser supports local storage
 */
function isLocalStorage() {
  'use strict';

  try {
    return 'localStorage' in window && window.localStorage !== null;
  }
  catch (e) {
    return false;
  }
}

/**
 * Set ?clientId=<app id> in the URI in order to retrieve the correct app data.
 * We need to refactor this, as this code currently avoids main overview page.
 */
function setClientIdUriQuery(appId) {
  'use strict';

  var uri = new URI();

  // Check if we are on overview pages, and only set the search
  // Parameter on the internal pages and if app Id is present.
  if ( (uri.segment(1) !== 'events' && uri.segment(1) !== '' && uri.segment(3) !== 'save') && uri.segment().length > 1 && !isNaN(appId) ) {

    // Save the alerts for redisplay
    if ( $('#site-container div.alert').length > 0 ) {
      localStorage.setItem('pageAlert', $('#notice-container div.alert')[0].outerHTML );
    }

    if ( uri.hasQuery('client_id') ) {
      uri.setSearch('client_id', appId);

      localStorage.setItem('pageRefreshed', JSON.stringify(true));
      window.location = uri;

    } else {

      if ( uri.segment(1) !== 'configure' && uri.segment(1) !== 'downloads' && uri.segment(2) !== 'add' ) {
        uri.addSearch('client_id', appId);

        localStorage.setItem('pageRefreshed', JSON.stringify(true));
        window.location = uri;
      }

    }
  }
}

/**
 * Initializes the datepicker to specified elements. This function
 * should be used to initialize the datepicker to dyanmically loaded
 * elements.
 */
function initDatePicker() {
  'use strict';

  // Get current date
  // var nowTemp = new Date();
  // var now = new Date(nowTemp.getFullYear(), nowTemp.getMonth(), nowTemp.getDate(), 0, 0, 0, 0);
  // Normal datepickers

  if ( $('.datepicker').length > 0 ) {

    var normalDateContainer = $('.datepicker');
    var normalDate = normalDateContainer.find('input').val();
    normalDateContainer.datepicker({
      autoclose: true,
      startDate: 'today'
    });

    normalDateContainer.datepicker('update', (normalDate) ? normalDate : 'today');
  }

  // Range datepickers

  if ( $('#startDateDatepicker').length > 0 && $('#endDateDatepicker').length > 0) {

    var startDateContainer = $('#startDateDatepicker');
    var endDateContainer = $('#endDateDatepicker');
    var startDate = startDateContainer.find('input').val();
    var endDate = endDateContainer.find('input').val();

    startDateContainer.datepicker(
      {
        autoclose: true,
        startDate: (startDate) ? startDate : 'today'
      }
    );

    endDateContainer.datepicker(
      {
        autoclose: true,
        startDate: (startDate) ? startDate : 'today'
      }
    );

    endDateContainer.datepicker('update', (endDate) ? endDate : 'today');

    startDateContainer.datepicker('update', (startDate) ? startDate : 'today').on('changeDate', function(e){
      var dateTemp = new Date(e.date);

      endDateContainer.datepicker('setDate', dateTemp);

      // get previous date so that today's date is still available for selection
      dateTemp.setDate(dateTemp.getDate()-1);

      endDateContainer.datepicker('setStartDate', dateTemp);
    });
  }
}

function commaSeparateNumber(val){
  'use strict';

  if(val>0){
    while (/(\d+)(\d{3})/.test(val.toString())){
      val = val.toString().replace(/(\d+)(\d{3})/, '$1'+','+'$2');
    }
  }
  return val;
}

/**
 * Remove "Select an app" if we only have one app, and set that app to be the persistent app.
 */

function refactorAppSelector(selector) {
  'use strict';

  $(selector).find('option')[0].remove();
  $(selector).find('option').attr('selected', 'selected');

  return $(selector).val();
}

/**
 * Initializes feed segments using the selected app
 * Originally from feed.js. Moved here in order to work better with app persitence.
 */

function initAppSelector(selector, groupSelector, taggings) {
  'use strict';

  var $groupsSelect = $(groupSelector);
  var tagItem = taggings+' .myTag';

  // Clear existing list of groups
  $groupsSelect.find(':not(:first)').remove();

  // Remove selected groups
  $(tagItem).remove();

  // Get the request data
  var clientId = $(selector).val();

  if ( clientId !== 0 ) {
    // Set the app name in the notification
    var appName = $(selector).find('option:selected').text();
    $('.notifyTitle').html(appName);

    // Get the list of groups based on the app ID
    $.ajax('/alerts/groups.json', {
      type: 'post',
      data: {
        client_id: clientId
      },
      error: function() {
        alert('Could not get the list of feeds for the selected application.');
      },
      success: function(response) {

        // Clear existing list of groups
        $groupsSelect.find(':not(:first)').remove();

        // Populate the list of groups
        for (var i in response) {
          var group = response[i];

          if (group.description !== 'Broadcast All') {

            var option = $('<option/>');
            option.val(group.subscription);
            option.text(group.description);
            option.addClass('opt-group');
            $groupsSelect.append(option);

            if (typeof group.subgroups !== 'undefined') {

              for (var j in group.subgroups) {

                var subgroup = group.subgroups[j];
                var subOption = $('<option/>');
                subOption.val(subgroup.subscription);
                subOption.html('&nbsp;&nbsp;&nbsp;&nbsp;' + subgroup.description);
                subOption.data('parent', subgroup.parentName);
                subOption.addClass('opt-child');
                $groupsSelect.append(subOption);

              }

            }

          }
        }

      }
    });
  }

  String.prototype.trunc = String.prototype.trunc ||
    function(n){
      return this.length>n ? this.substr(0,n-1)+'&hellip;' : this;
    };

}
