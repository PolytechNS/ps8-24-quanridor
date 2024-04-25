const bellIcon = document.getElementById("bell");
const popup = document.getElementById("popup");
const unreadCount = document.getElementById("unread-count");
const sideNotification = document.getElementById("side-notification");
const closeArrowSide = document.getElementById("close-arrow");
const friendContainerList = document.getElementsByClassName("friend-container");
const friendProfile = document.getElementById("friend-profile");
const chatButton = document.getElementById("chat");
const friendList = document.getElementById("friend-list");
const friendChat = document.getElementById("friend-chat");
const closeChatButton = document.getElementById("close-chat");
const searchHeader = document.getElementById("friend-search");
const friendButtons = document.getElementById("friend-buttons");
const searchButton = document.getElementById("search");
const friendSearchBar = document.getElementById("search-input");
const closeSearchButton = document.getElementById("close-search");
const messageCountList = document.getElementsByClassName(
  "unread-message-count"
);
const unfriendIcon = document.getElementById("unfriend");
const removeFriendContainer = document.getElementById("remove-friend");
const keepFriendButton = document.getElementById("normal-button");
const removeFriendButton = document.getElementById("careful-button");
const addFriendPopupCross = document.getElementById("cross");
const addFriendPopup = document.getElementById("add-friend-container");
const addFriendButton = document.getElementById("add-friend");
const userMobile = document.getElementById("user-mobile");
let profileBox = document.getElementsByClassName("profile-box")[0];

profileBox = profileBox === undefined ? document.getElementsByClassName("profile-box-mobile")[0] : profileBox;

const friendsMobile = document.getElementById("friends");
const friendSideBar = document.getElementById("friend-side-bar");
const closeFriends = document.getElementById("close-friends");

let notificationCount = 0;

socket2.on("connect", async () => {
  console.log("Connected to server.");
  const token = localStorage.getItem("token");
  socket2.emit("setSocket", { token: token, socketId: socket2.id });
  console.log(socket2.id);
});

socket2.on("redirectToGame", (roomId) => {
  window.location.href = `online-game.html?roomId=${roomId}`;
});

function incrementNotificationCount() {
  notificationCount++;
  updateNotificationDisplay();
}

function updateNotificationDisplay() {
  unreadCount.textContent = notificationCount;
  unreadCount.style.display = notificationCount > 0 ? "block" : "none";
}

// Example: Call incrementNotificationCount when a new notification is received
// For demonstration purposes, I'm simulating a new notification every 3 seconds
/*setInterval(function() {
  incrementNotificationCount();
  displaySideNotification('New Notification', 'You have a new notification');
}, 3000);
*/

function incrementMessageCount(friendId) {
  notificationCount++;
  updateNotificationDisplay();
}

function displaySideNotification(notification) {
  sideNotification.innerHTML = ""; // Clear existing notification

  const notificationTitle = document.createElement("div");
  notificationTitle.classList.add("notification");
  notificationTitle.textContent = notification.title;
  sideNotification.appendChild(notificationTitle);

  const closeArrow = document.createElement("svg");
  closeArrow.id = "close-arrow";
  closeArrow.setAttribute("style", "filter: none;");
  closeArrow.innerHTML = `<svg width="113" height="111" viewBox="0 0 113 111" fill="none" xmlns="http://www.w3.org/2000/svg">
  <path d="M64.9551 103.565L59.3562 109.208C56.9855 111.597 53.152 111.597 50.8065 109.208L1.77804 59.821C-0.592679 57.4318 -0.592679 53.5682 1.77804 51.2044L50.8065 1.79196C53.1772 -0.597321 57.0107 -0.597321 59.3562 1.79196L64.9551 7.43474C67.3511 9.84944 67.3006 13.7892 64.8543 16.1531L34.4637 45.3328H106.947C110.301 45.3328 113 48.0526 113 51.4331V59.5669C113 62.9475 110.301 65.6672 106.947 65.6672H34.4637L64.8543 94.8469C67.3259 97.2108 67.3763 101.151 64.9551 103.565Z" fill="white"/>
  </svg>`;
  closeArrow.addEventListener("click", () => {
    sideNotification.style.display = "none";
  });
  sideNotification.appendChild(closeArrow);

  if (notification.type === "friendRequest") {
    const verticalContainer = document.createElement("div");
    verticalContainer.classList.add("vertical-small-container");
    sideNotification.appendChild(verticalContainer);

    const friendName = document.createElement("span");
    friendName.classList.add("text");
    friendName.id = "friend-name";
    friendName.textContent = notification.message.split(" ")[0];
    verticalContainer.appendChild(friendName);

    const buttonContainer = document.createElement("div");
    buttonContainer.classList.add("horizontal-small-container");
    verticalContainer.appendChild(buttonContainer);

    const acceptButton = document.createElement("button");
    acceptButton.classList.add("choice-button");
    acceptButton.id = "accept-button";
    acceptButton.textContent = "Accept";
    acceptButton.addEventListener("click", () => {
      acceptFriendRequest(notification._id);
    });
    buttonContainer.appendChild(acceptButton);

    const declineButton = document.createElement("button");
    declineButton.classList.add("choice-button");
    declineButton.id = "decline-button";
    declineButton.textContent = "Decline";
    declineButton.addEventListener("click", () => {
      declineFriendRequest(notification._id);
    });
    buttonContainer.appendChild(declineButton);
  } else if (notification.type === "battleRequest") {
    const verticalContainer = document.createElement("div");
    verticalContainer.classList.add("vertical-small-container");
    sideNotification.appendChild(verticalContainer);

    const friendName = document.createElement("span");
    friendName.classList.add("text");
    friendName.id = "friend-name";
    friendName.textContent = notification.message.split(" ")[0];
    verticalContainer.appendChild(friendName);

    const buttonContainer = document.createElement("div");
    buttonContainer.classList.add("horizontal-small-container");
    verticalContainer.appendChild(buttonContainer);

    const acceptButton = document.createElement("button");
    acceptButton.classList.add("choice-button");
    acceptButton.id = "accept-button";
    acceptButton.textContent = "Play";
    acceptButton.addEventListener("click", () => {
      acceptBattleRequest(notification._id);
    });
    buttonContainer.appendChild(acceptButton);

    const declineButton = document.createElement("button");
    declineButton.classList.add("choice-button");
    declineButton.id = "decline-button";
    declineButton.textContent = "Decline";
    declineButton.addEventListener("click", () => {
      declineBattleRequest(notification._id);
    });
    buttonContainer.appendChild(declineButton);
  } else {
    const notificationContent = document.createElement("div");
    notificationContent.classList.add("notification-content");
    notificationContent.textContent = notification.message;
    sideNotification.appendChild(notificationContent);
  }

  console.log("Side Notification shown");
  sideNotification.style.display = "block";

  if (
    /Mobi|Android/i.test(navigator.userAgent) &&
    (notification.type === "friendRequest" ||
      notification.type === "battleRequest")
  ) {
    cordova.plugins.notification.local.schedule(
      {
        title: notification.title,
        text: notification.message,
        foreground: true,
        actions: [
          { id: "accept", title: "Accept" },
          { id: "decline", title: "Decline" },
        ],
      },
      (notification) => {
        if (notification.action === "accept") {
          if (notification.type === "friendRequest") {
            acceptFriendRequest(notification._id);
          } else if (notification.type === "battleRequest") {
            acceptBattleRequest(notification._id);
          }
        } else if (notification.action === "decline") {
          if (notification.type === "friendRequest") {
            declineFriendRequest(notification._id);
          } else if (notification.type === "battleRequest") {
            declineBattleRequest(notification._id);
          }
        }
      }
    );
  } else if (/Mobi|Android/i.test(navigator.userAgent)) {
    console.log("Scheduling chat notification");
    cordova.plugins.notification.local.schedule({
      title: notification.title,
      text: notification.message,
      foreground: true,
    });
  }
}

closeSearchButton.addEventListener("click", function () {
  searchHeader.style.display = "none";
  friendButtons.style.display = "flex";
  if (closeFriends != null) closeFriends.style.display = "flex";
});

searchButton.addEventListener("click", function () {
  friendButtons.style.display = "none";
  if (closeFriends != null) closeFriends.style.display = "none";
  searchHeader.style.display = "flex";
  friendSearchBar.focus();
});

bellIcon.addEventListener("click", () => {
  togglePopup();
});

window.addEventListener("click", (event) => {
  if (
    !event.target.matches("#bell") &&
    !event.target.matches(".popup") &&
    !event.target.matches("#side-notification") &&
    !popup.contains(event.target) &&
    !sideNotification.contains(event.target)
  ) {
    popup.style.display = "none";
  }

  if (
    !event.target.matches(".profile-box-mobile") &&
    !profileBox.contains(event.target) &&
    userMobile != null &&
    !event.target.matches("#user-mobile")
  ) {
    profileBox.style.display = "none";
  }

  if (
    !event.target.matches(".friend-container") &&
    !event.target.matches("#friend-profile") &&
    !friendProfile.contains(event.target) &&
    !friendsContainer.contains(event.target)
  ) {
    if (currentSelectedFriendContainer !== null) {
      currentSelectedFriendContainer.style.backgroundColor =
        "rgba(1, 5, 37, 1)";
    }
    currentSelectedFriendContainer = null;
    friendProfile.style.display = "none";
  }

  if (
    (!event.target.matches("#friend-side-bar") &&
      !event.target.matches("#friends") &&
      friendSideBar !== null &&
      !friendSideBar.contains(event.target) &&
      !event.target.matches(".friend-container") &&
      !event.target.matches("#friend-profile") &&
      !friendProfile.contains(event.target) &&
      !friendsContainer.contains(event.target)) ||
    event.target.matches("#add-friend")
  ) {
    friendSideBar.style.display = "none";
  }

  if (
    !event.target.matches("#add-friend-container") &&
    !addFriendPopup.contains(event.target) &&
    !event.target.matches("#add-friend")
  ) {
    addFriendPopup.style.display = "none";
  }
});

const friendsContainer = document.querySelector(".friends");
let currentSelectedFriendContainer = null;

friendsContainer.addEventListener("click", (event) => {
  const clickedElement = event.target.closest(".friend-container");

  if (!clickedElement || !friendsContainer.contains(clickedElement)) return;

  toggleRemoveFriend(true);

  if (currentSelectedFriendContainer !== null) {
    currentSelectedFriendContainer.onmouseover = function () {
      this.style.backgroundColor = "rgb(28, 32, 67)";
    };
    currentSelectedFriendContainer.onmouseout = function () {
      this.style.backgroundColor = "rgba(1, 5, 37, 1)"; // Restore original color when not hovering
    };
    currentSelectedFriendContainer.style.backgroundColor = "rgba(1, 5, 37, 1)";
  }

  if (clickedElement === currentSelectedFriendContainer) {
    currentSelectedFriendContainer = null;
    friendProfile.style.display = "none";
    return;
  }

  currentSelectedFriendContainer = clickedElement;
  currentSelectedFriendContainer.style.backgroundColor = "#4650A8";

  currentSelectedFriendContainer.onmouseover = null;
  currentSelectedFriendContainer.onmouseout = null;

  friendProfile.style.display =
    currentSelectedFriendContainer == null ? "none" : "flex";
  friendProfile.querySelector(".text").textContent =
    clickedElement.querySelector(".text").textContent;
});

sideNotification.addEventListener("click", (event) => {
  if (event.target.matches("#close-arrow")) return;
  sideNotification.style.display = "none";
});

const acceptRequestButton = document.getElementById("accept-button");
const declineRequestButton = document.getElementById("decline-button");

function togglePopup(toggle = true) {
  console.log("Toggling popup");
  if (toggle) {
    popup.style.display = popup.style.display === "block" ? "none" : "block";
  } else {
    popup.style.display = "block";
  }

  unreadCount.style.display = "none";
  unreadCount.textContent = "0";
  notificationCount = 0;
}

chatButton.addEventListener("click", function () {
  friendProfile.style.display = "none";
  friendList.style.display = "none";
  friendChat.style.display = "block";
  var scrollableDiv = document.getElementById("message-list");
  scrollableDiv.scrollTop = scrollableDiv.scrollHeight;
  friendChat.querySelector(".text").textContent =
    currentSelectedFriendContainer.querySelector(".text").textContent;
});

closeChatButton.addEventListener("click", function () {
  friendChat.style.display = "none";
  friendList.style.display = "block";
  currentSelectedFriendContainer.style.backgroundColor = "rgba(1, 5, 37, 1)";

  if (currentSelectedFriendContainer !== null) {
    currentSelectedFriendContainer.querySelector(
      ".unread-message-count"
    ).style.display = "none";
    currentSelectedFriendContainer.querySelector(
      ".unread-message-count"
    ).textContent = "0";
  }

  currentSelectedFriendContainer = null;
});

unfriendIcon.addEventListener("click", function () {
  toggleRemoveFriend();
});

function toggleRemoveFriend(hide = false) {
  unfriendIcon.style.filter =
    unfriendIcon.style.filter === "invert(1)" ? "invert(0)" : "invert(1)";
  removeFriendContainer.style.display =
    removeFriendContainer.style.display === "flex" ? "none" : "flex";

  if (hide) {
    removeFriendContainer.style.display = "none";
    unfriendIcon.style.filter = "invert(0)";
  }
}

keepFriendButton.addEventListener("click", function () {
  toggleRemoveFriend(true);
});

addFriendPopupCross.addEventListener("click", function () {
  addFriendPopup.style.display = "none";
});

addFriendButton.addEventListener("click", function () {
  addFriendPopup.style.display = "flex";
});

const addFriendInput = document.getElementById("add-friend-input");
const sendFriendRequestButton = document.getElementById("add-friend-button");

addFriendInput.addEventListener("input", function () {
  if (addFriendInput.value.trim() !== "") {
    sendFriendRequestButton.removeAttribute("disabled");
  } else {
    sendFriendRequestButton.setAttribute("disabled", "disabled");
  }
});

// Make so that when we click on enter when focused on #add-friend-input, it will trigger the click event on #add-friend-button
addFriendInput.addEventListener("keydown", function (event) {
  if (event.key === "Enter") {
    sendFriendRequestButton.click();
  }
});

if (userMobile != null) {
  userMobile.addEventListener("click", function () {
    toggleUserMobile();
  });
}

function toggleUserMobile() {
  profileBox.style.display =
    profileBox.style.display === "block" ? "none" : "block";
}

if (friendsMobile != null && closeFriends != null) {
  friendsMobile.addEventListener("click", function () {
    toggleFriendSideBar();
  });

  closeFriends.addEventListener("click", function () {
    toggleFriendSideBar();
  });
}

function toggleFriendSideBar() {
  if(friendSideBar === null) return;
  friendSideBar.style.display =
    friendSideBar.style.display === "block" ? "none" : "block";
}
