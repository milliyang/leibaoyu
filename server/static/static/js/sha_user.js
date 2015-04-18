
$("#open_password").val('');

$("#user_form").submit(function(event) {
  p = $("#open_password").val();
  $("#open_password").val('')
  var hash = CryptoJS.SHA256(p);
  $("#password").val(hash.toString(CryptoJS.enc.Hex))
  return true;
});