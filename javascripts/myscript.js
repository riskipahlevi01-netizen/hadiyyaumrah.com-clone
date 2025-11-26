$(function() {
	'use strict';

  $("#alert").fadeTo(5000, 500).slideUp(1000, function(){
    $("#alert").slideUp(500);
  });

  $("#notice").fadeTo(5000, 500).slideUp(1000, function(){
    $("#notice").slideUp(500);
  });

});