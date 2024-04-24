// If the user has an auth token, redirect to home

if (localStorage.getItem("token")) {
  window.location.href = "home.html";
}

document.addEventListener("deviceready", function() {
  let successPermissionNotification = function(status) {
    console.log("Notification permission granted");
  }
  let errorPermissionNotification = function(status) {
    console.log("Notification permission denied");
  }
  permissions.requestPermission(permissions.POST_NOTIFICATIONS, successPermissionNotification, errorPermissionNotification);
  cordova.plugins.notification.local.setDummyNotifications();
}, false);