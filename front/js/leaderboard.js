document.addEventListener("DOMContentLoaded", function () {
  const leaderboardElement = document.querySelector(".leaderboard");
  if (!leaderboardElement) {
    console.warn("No leaderboard class element found");
    return;
  }

  async function retrieveLeaderboard() {
    try {
      const baseUrl = window.location.origin;
      const response = await fetch(`${baseUrl}/api/leaderboard`, {
        method: "GET",
        headers: {
          Authorization: "Bearer " + localStorage.getItem("token"),
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error("Failed to retrieve leaderboard");
      }

      const leaderboard = await response.json();

      // Clear existing leaderboard
      leaderboardElement.innerHTML = "";

      if (!leaderboard.length || leaderboard.length === 0) {
        // Display No users found
        const noUsersElement = document.createElement("div");
        noUsersElement.className = "no-users";
        noUsersElement.textContent = "No users found 💨";
        leaderboardElement.appendChild(noUsersElement);
        return;
      }

      leaderboard.forEach((user, index) => {
        const userItemElement = document.createElement("div");
        userItemElement.className = "user-item";

        const rankElement = document.createElement("span");
        rankElement.className = "rank";
        rankElement.textContent = `${index + 1}.`;
        userItemElement.appendChild(rankElement);

        const usernameElement = document.createElement("span");
        usernameElement.className = "username";
        usernameElement.textContent = user.username;
        userItemElement.appendChild(usernameElement);

        const eloElement = document.createElement("span");
        eloElement.className = "elo";
        eloElement.textContent = ` ELO: ${user.elo}`;
        userItemElement.appendChild(eloElement);

        leaderboardElement.appendChild(userItemElement);
      });
    } catch (error) {
      console.error("Error retrieving leaderboard:", error);
    }
  }

  retrieveLeaderboard();
});
