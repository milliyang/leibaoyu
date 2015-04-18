function cleanup() {
    $("#open_old_password").val('');
    $("#open_new_password").val('');
    $("#open_new_password2").val('');
}
cleanup();

$("#update_password_form").submit(function(event) {
    p = $("#open_old_password").val();
    p1 = $("#open_new_password").val();
    p2 = $("#open_new_password2").val();
    cleanup();
    if (p1 != p2) {
        $("#open_new_password2").placeholder = "not match!"
        return false
    }
    var hash_old = CryptoJS.SHA256(p);
    var hash_new = CryptoJS.SHA256(p1);
    $("#old_password").val(hash_old.toString(CryptoJS.enc.Hex))
    $("#new_password").val(hash_new.toString(CryptoJS.enc.Hex))
    return true;
});
