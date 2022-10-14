$('.collapsible-body').each(function () {
  $(this).css('maxHeight', '0px');
});

$('.collapsible').click(function () {
  $(this).toggleClass('active');
  
  var currHeight = $(this).next().css('maxHeight');
  var newHeight = "0px";
  
  if (currHeight === "0px") {
    newHeight = $(this).next().prop('scrollHeight') + "px";
  }
  $(this).next().css('maxHeight', newHeight);
});

$('.card a, .card div').focusin(function () {
  $(this).parents(".card").addClass('focused');
});
$('.card a, .card div').focusout(function () {
  $(this).parents(".card").removeClass('focused');
});

$('.card a, .card div').hover(function () {
  $(this).parents(".card").addClass('focused');
}, function () {
  $(this).parents(".card").removeClass('focused');
});