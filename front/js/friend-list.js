document.addEventListener("DOMContentLoaded", function () {
  const token = localStorage.getItem("token");

  if (!token) {
    console.log("No token found in local storage.");
    return;
  }

  const baseUrl = window.location.origin;
  fetch(`${baseUrl}/api/users`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  })
    .then((response) => {
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return response.json();
    })
    .then((data) => {
      const friendIds = data.friends;
      if (friendIds && friendIds.length > 0) {
        const friendList = document.querySelector(".friends");
        friendList.innerHTML = ""; // Clear existing friend list

        const fetchFriendDetails = (friendId) => {
          return fetch(`${baseUrl}/api/users/${friendId}`, {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          })
            .then((response) => {
              if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
              }
              return response.json();
            })
            .then((friendData) => {
              const friendContainer = document.createElement("div");
              friendContainer.classList.add("friend-container");

              const smallUser = document.createElement("svg");
              smallUser.id = "small-user";
              friendContainer.appendChild(smallUser);

              const friendName = document.createElement("div");
              friendName.classList.add("text");
              friendName.textContent = friendData.username;
              friendContainer.appendChild(friendName);

              friendList.appendChild(friendContainer);
            })
            .catch((error) => {
              console.error(
                `Error fetching friend details for ${friendId}:`,
                error,
              );
            });
        };

        Promise.all(friendIds.map(fetchFriendDetails))
          .then(() => {
            console.log("All friend details fetched successfully.");
          })
          .catch((error) => {
            console.error("Error fetching friend details:", error);
          });
      } else {
        console.log("No friends found for the user.");
      }
    })
    .catch((error) => {
      console.error("Error fetching user data:", error);
    });
});
