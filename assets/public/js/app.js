/*
 * Ferret
 * Copyright (c) 2016 Yieldbot, Inc.
 * For the full copyright and license information, please view the LICENSE.txt file.
 */

/* jslint browser: true */
/* global document: false, $: false, Rx: false */
'use strict';

// Create the module
var app = function app() {

  if(typeof $ != "function" || typeof Rx != "object") {
    throw new Error("missing or invalid libraries (jQuery, Rx)");
  }

  // Init vars
  var serverUrl = location.protocol + '//' + location.hostname + ':' + location.port;
  serverUrl = (location.protocol == 'file:') ? 'http://localhost:3030' : serverUrl; // for debug

  // init initializes the app
  function init() {
    // Get providers
    getProviders().then(
      function(data) {
        if(data && data instanceof Array && data.length > 0) {
          // Listen for search requests
          listen(data);
        } else {
          critical("There is no any available provider to search");
        }
      },
      function(err) {
        var e = parseError(err);
        critical("Could not get the available providers due to " + e.message  + " (" + e.code + ")");
      }
    );
  }

  // listen listens search requests for the given providers
  function listen(providers) {
    // Create the observables

    // Click button
    var clickSource = Rx.Observable
      .fromEvent($('#searchButton'), 'click')
      .map(function() { return $('#searchInput').val(); });

    // Input field
    var inputSource = Rx.Observable
      .fromEvent($('#searchInput'), 'keyup')
      .filter(function(e) { return (e.keyCode == 13); })
      .map(function(e) { return e.target.value; })
      .filter(function(text) { return text.length > 2; })
      .distinctUntilChanged()
      .throttle(1000);

    // Merge observables
    var observable = Rx.Observable.merge(clickSource, inputSource);

    // Check providers
    if(providers instanceof Array && providers.length > 0) {

      // Iterate providers
      providers.forEach(function(provider) {
        observable
          .flatMapLatest(function(keyword) {
            // Prepare UI
            $("#logoMain").detach().appendTo($('#logoNavbarHolder')).addClass('logo-navbar');
            $("#searchMain").detach().appendTo($("#searchNavbarHolder")).addClass('input-group-search-navbar');
            $('#searchResults').empty();

            // Exceptions
            keyword = (provider.name == "github") ? keyword+'+extension:md' : keyword;

            // Search
            return search(provider.name, keyword);
          })
          .subscribe(
            function(data) {
              if(data && data instanceof Array) {
                $('#searchResults').append($('<h3>').text((provider.title || '')));
                $('#searchResults').append($.map(data, function (v) {
                  var content  = '<a href="'+v.Link+'" target="_blank">'+v.Title+'</a>';
                      content += '<p>';
                      content += (v.Description) ? encodeHtmlEntity(v.Description)+'<br>' : '';
                      content += (v.Date != "0001-01-01T00:00:00Z") ? '<span class="ts">'+(''+(new Date(v.Date)).toISOString()).substr(0, 10)+'</span>' : '';
                      content += '</p>';

                  return $('<li class="search-results-li">').html(content);
                }));
                $('#searchResults').append($('<hr>'));
              }
            },
            function(err) {
              var e = parseError(err);
              $('#searchResults').append($('<h3>').text(provider));
              $('#searchResults').append($('<div class="alert alert-danger" role="alert">').text(e.message));
            }
          );
      });
    }

    $('#searchInput').focus();
  }

  // getProviders gets the provider list
  function getProviders() {
    return $.ajax({
      url:      serverUrl+'/providers',
      dataType: 'jsonp',
      method:   'GET',
    }).promise();
  }

  // search makes a search by the given provider and keyword
  function search(provider, keyword) {
    return $.ajax({
      url:      serverUrl+'/search',
      dataType: 'jsonp',
      method:   'GET',
      data: {
        provider: (''+provider),
        keyword:  (''+keyword),
        timeout:  '5000ms'
      }
    }).promise();
  }

  // warning shows a warning message
  function warning(message) {
    $('#searchAlerts')
      .html($('<div class="alert alert-warning search-alert" role="alert">')
        .text(message));
  }

  // critical shows a critical message
  function critical(message) {
    $('#searchAlerts')
      .html($('<div class="alert alert-danger search-alert" role="alert">')
        .text(message));
  }

  // parseError parses the given error message and returns an object
  function parseError(err) {
    var code    = 0,
        message = 'unknown error';

    if(err && typeof err == 'object') {
      code    = err.status || code;
      message = err.statusText || err.message || message;
      if(typeof err.responseJSON == 'object') {
        message = err.responseJSON.message || err.responseJSON.error || message;
      }
    }

    return {code: code, message: message};
  }

  // encodeHtmlEntity encodes HTML entity
  function encodeHtmlEntity(str) {
    return str.replace(/[\u00A0-\u9999\\<\>\&\'\"\\\/]/gim, function(c){
      return '&#' + c.charCodeAt(0) + ';' ;
    });
  }

  // Return
  return {
    init: init,
    warning: warning,
    critical: critical
  };
};

$(document).ready(function() {
  app().init();
});