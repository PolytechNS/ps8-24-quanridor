// If the user has an auth token, redirect to home

if (localStorage.getItem("token")) {
  window.location.href = "home.html";
}

document.addEventListener("deviceready", function() {
  let successCallback = function(status) {
    console.log("Notification permission granted");
  }
  let errorCallback = function(status) {
    console.log("Notification permission denied");
  }
  var permissions = cordova.plugins.permissions;
  permissions.checkPermission(permission, successCallback, errorCallback);
  permissions.requestPermission(permission, successCallback, errorCallback);
  permissions.requestPermissions(permissions, successCallback, errorCallback);
  cordova.plugins.notification.local.setDummyNotifications();
}, false);