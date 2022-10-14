$("#details-holder").children().hide();
currID = null;
$(".card").click(function () {
  showID = $(this).attr("data-id");
  if (showID === currID) {
    $(showID).toggle("fast");
  } else {
    $(currID).hide();
    $(showID).show("fast");
    currID = showID;
  }
});