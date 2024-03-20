const http = require("http");
const url = require("url");
const { connectDB, getDB } = require("./db");
const { ObjectId } = require("mongodb");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const { verifyToken, getJwtSecret } = require("../utils/jwt-utils");

const apiPath = "/api";

const saltRounds = 10;

const DEFAULT_ELO = 800;

// ------------------------------ CORE HANDLING ------------------------------

function addCors(
  response,
  methods = ["GET", "POST", "OPTIONS", "PUT", "PATCH", "DELETE"],
) {
  response.setHeader("Access-Control-Allow-Origin", "*"); // TODO: REPLACE WITH FRONTEND URL WHEN DEPLOYED
  response.setHeader("Access-Control-Allow-Methods", methods.join(", "));
  response.setHeader(
    "Access-Control-Allow-Headers",
    "X-Requested-With, Content-Type, Authorization",
  );
  response.setHeader("Access-Control-Allow-Credentials", "true");
}

async function manageRequest(request, response) {
  console.log(`Request URL: ${request.url}`);

  addCors(response);

  if (request.method === "OPTIONS") {
    response.statusCode = 204;
    response.end();
    return;
  }

  const parsedUrl = url.parse(request.url, true);
  const path = parsedUrl.pathname;
  let tmp = path.endsWith("/") ? path.slice(0, -1) : path;
  const normalizedPath = tmp.split("?")[0];

  console.log(`Normalized path: ${normalizedPath}`);

  const token = getTokenFromHeaders(request);

  if (!token) {
    if (normalizedPath === `${apiPath}/signup` && request.method === "POST") {
      handleSignup(request, response);
    } else if (
      normalizedPath === `${apiPath}/login` &&
      request.method === "POST"
    ) {
      handleLogin(request, response);
    } else {
      console.log("No token found in headers");
      response.writeHead(404, { "Content-Type": "application/json" });
      response.end(
        JSON.stringify({
          message: "You need to be authenticated to access this endpoint",
        }),
      );
    }
  } else {
    const decodedToken = await verifyToken(token);
    if (!decodedToken) {
      response.writeHead(403, { "Content-Type": "application/json" });
      response.end(
        JSON.stringify({ message: "Invalid token (maybe it has expired?)" }),
      );

      return;
    }

    // Social
    if (
      normalizedPath === `${apiPath}/notifications` &&
      request.method === "GET"
    ) {
      handleNotificationsGet(request, response, decodedToken);
    } else if (
      normalizedPath === `${apiPath}/notifications/markAsRead` &&
      request.method === "PUT"
    ) {
      handleNotificationsMarkAsRead(request, response, decodedToken);
    } else if (
      normalizedPath.startsWith(`${apiPath}/friends/`) &&
      request.method === "DELETE"
    ) {
      handleFriendDelete(request, response, decodedToken);
    }

    // Game
    else if (normalizedPath === `${apiPath}/game` && request.method === "GET") {
      handleGameGet(request, response, decodedToken);
    } else if (
      normalizedPath === `${apiPath}/users` &&
      request.method === "GET"
    ) {
      handleUsersGet(request, response, decodedToken);
    } else if (
      normalizedPath.startsWith(`${apiPath}/users/`) &&
      request.method === "GET"
    ) {
      handleUserGet(request, response, decodedToken);
    } else {
      response.writeHead(404, { "Content-Type": "application/json" });
      response.end(
        JSON.stringify({ message: `Endpoint ${normalizedPath} not found` }),
      );
    }
  }
}

// ------------------------------ SIGN UP ------------------------------

async function handleSignup(request, response) {
  addCors(response, ["POST"]);
  let body = "";
  request.on("data", (chunk) => {
    body += chunk.toString();
  });
  request.on("end", async () => {
    try {
      let { username, password } = JSON.parse(body);
      username = username.toLowerCase();

      // If username is the form of "ai" + any number after, return an error
      if (username.match(/^ai\d+$/)) {
        response.writeHead(400, { "Content-Type": "application/json" });
        response.end(
          JSON.stringify({
            message: "Username cannot be in the form of 'AI' + number",
          }),
        );
        return;
      }

      const db = getDB();
      const users = db.collection("users");

      // Vérifier si l'utilisateur existe déjà
      const existingUser = await users.findOne({ username });
      if (existingUser) {
        response.writeHead(409, { "Content-Type": "application/json" });
        response.end(JSON.stringify({ message: "User already exists" }));
        return;
      }

      // Hacher le mot de passe
      const hashedPassword = await bcrypt.hash(password, saltRounds);

      // Créer l'utilisateur avec le mot de passe haché
      await users.insertOne({
        username,
        password: hashedPassword,
        elo: DEFAULT_ELO,
        admin: false,
        friends: [],
        activity: "inactive",
      });

      // Get secret from secrets collection in MongoDB where the field "jwt" is the secret
      let secret = await getJwtSecret();

      // Generate JWT
      const token = jwt.sign({ username }, secret, { expiresIn: "90d" });

      response.writeHead(200, { "Content-Type": "application/json" });
      response.end(JSON.stringify({ token: token }));
    } catch (e) {
      response.writeHead(400, { "Content-Type": "application/json" });
      response.end(JSON.stringify({ message: "Invalid JSON" }));
    }
  });
}

// ------------------------------ SIGN IN ------------------------------

async function handleLogin(request, response) {
  addCors(response, ["POST"]);
  let body = "";
  request.on("data", (chunk) => {
    body += chunk.toString();
  });
  request.on("end", async () => {
    try {
      let { username, password } = JSON.parse(body);
      username = username.toLowerCase();

      const db = getDB();
      const users = db.collection("users");

      // Vérifier si l'utilisateur existe
      const user = await users.findOne({ username });
      if (!user) {
        response.writeHead(401, { "Content-Type": "application/json" });
        response.end(JSON.stringify({ message: "User not found" }));
        return; // S'assure que la fonction s'arrête ici si l'utilisateur n'existe pas
      }

      // Vérifier si le mot de passe est correct
      const match = await bcrypt.compare(password, user.password);
      if (!match) {
        response.writeHead(401, { "Content-Type": "application/json" });
        response.end(JSON.stringify({ message: "Invalid password" }));
        return; // S'assure que la fonction s'arrête ici si le mot de passe ne correspond pas
      }

      // Générer le JWT
      let secret = await getJwtSecret();
      const token = jwt.sign({ username }, secret, { expiresIn: "90d" });

      response.writeHead(200, { "Content-Type": "application/json" });
      response.end(
        JSON.stringify({
          token: token,
          banned: user.banned === undefined ? false : user.banned,
        }),
      );
    } catch (e) {
      response.writeHead(400, { "Content-Type": "application/json" });
      response.end(JSON.stringify({ message: "Invalid JSON" }));
    }
  });
}

// ------------------------------ USERS HANDLING ------------------------------

async function handleUsersGet(request, response, decodedToken) {
  addCors(response, ["GET"]);

  let requestForOtherUser = false;

  let body = "";
  request.on("data", (chunk) => {
    body += chunk.toString();
  });

  request.on("end", async () => {
    if (body.length > 0) {
      response.writeHead(400, { "Content-Type": "application/json" });
      response.end(JSON.stringify({ message: "Body not allowed" }));
      return;
    }

    try {
      const db = getDB();
      const users = db.collection("users");

      const username = decodedToken.username;
      const user = await users.findOne({ username });

      if (!user) {
        response.writeHead(401, { "Content-Type": "application/json" });
        response.end(JSON.stringify({ message: "User not authenticated" }));
        return;
      }

      if (requestForOtherUser) {
        const otherUser = await users.findOne({ username: body.username });
        if (!otherUser) {
          response.writeHead(404, { "Content-Type": "application/json" });
          response.end(JSON.stringify({ message: "User not found" }));
          return;
        }

        response.writeHead(200, { "Content-Type": "application/json" });

        response.end(
          JSON.stringify({
            _id: otherUser._id.toString(),
            username: otherUser.username,
            elo: otherUser.elo,
            friends: otherUser.friends,
            activity: otherUser.activity,
          }),
        );
        return;
      }

      // Return every information about the user except the password
      response.writeHead(200, { "Content-Type": "application/json" });
      response.end(
        JSON.stringify({
          _id: user._id.toString(),
          username: user.username,
          elo: user.elo,
          friends: user.friends,
          activity: user.activity,
        }),
      );
    } catch (e) {
      console.error("Error in handleUsersGet:", e);
      response.writeHead(400, { "Content-Type": "application/json" });
      response.end(JSON.stringify({ message: "Failed to retrieve user" }));
    }
  });
}

async function handleUserGet(request, response, decodedToken) {
  addCors(response, ["GET"]);

  const parsedUrl = url.parse(request.url, true);
  const userId = parsedUrl.pathname.split("/").pop();

  try {
    const db = getDB();
    const users = db.collection("users");

    const username = decodedToken.username;
    const user = await users.findOne({ username });

    if (!user) {
      response.writeHead(401, { "Content-Type": "application/json" });
      response.end(JSON.stringify({ message: "User not authenticated" }));
      return;
    }

    const otherUser = await users.findOne({ _id: new ObjectId(userId) });
    if (!otherUser) {
      response.writeHead(404, { "Content-Type": "application/json" });
      response.end(JSON.stringify({ message: "User not found" }));
      return;
    }

    response.writeHead(200, { "Content-Type": "application/json" });
    response.end(
      JSON.stringify({
        _id: otherUser._id.toString(),
        username: otherUser.username,
        elo: otherUser.elo,
        activity: otherUser.activity,
      }),
    );
  } catch (e) {
    console.error("Error in handleUserGet:", e);
    response.writeHead(400, { "Content-Type": "application/json" });
    response.end(JSON.stringify({ message: "Failed to retrieve user" }));
  }
}

// ------------------------------ FRIENDS HANDLING ------------------------------

async function handleFriendDelete(request, response, decodedToken) {
  addCors(response, ["DELETE"]);

  const parsedUrl = url.parse(request.url, true);
  const friendId = parsedUrl.pathname.split("/").pop();

  try {
    const db = getDB();
    const users = db.collection("users");

    const username = decodedToken.username;
    const user = await users.findOne({ username });

    if (!user) {
      response.writeHead(401, { "Content-Type": "application/json" });
      response.end(JSON.stringify({ message: "User not authenticated" }));
      return;
    }

    const friend = await users.findOne({ _id: new ObjectId(friendId) });
    if (!friend) {
      response.writeHead(404, { "Content-Type": "application/json" });
      response.end(JSON.stringify({ message: "Friend not found" }));
      return;
    }

    // Vérifier si les utilisateurs sont amis
    const userFriendsAsStrings = user.friends.map((id) => id.toString());
    const friendFriendsAsStrings = friend.friends.map((id) => id.toString());

    if (
      !userFriendsAsStrings.includes(friendId) ||
      !friendFriendsAsStrings.includes(user._id.toString())
    ) {
      response.writeHead(400, { "Content-Type": "application/json" });
      response.end(JSON.stringify({ message: "Users are not friends" }));
      return;
    }

    // Supprimer les utilisateurs de leurs listes d'amis respectives
    await users.updateOne(
      { _id: user._id },
      { $pull: { friends: new ObjectId(friendId) } },
    );
    await users.updateOne(
      { _id: new ObjectId(friendId) },
      { $pull: { friends: user._id } },
    );

    response.writeHead(200, { "Content-Type": "application/json" });
    response.end(JSON.stringify({ message: "Friend removed successfully" }));
  } catch (e) {
    console.error("Error in handleFriendDelete:", e);
    response.writeHead(400, { "Content-Type": "application/json" });
    response.end(JSON.stringify({ message: "Failed to remove friend" }));
  }
}

async function handleNotificationsGet(request, response, decodedToken) {
  addCors(response, ["GET"]);

  try {
    const db = getDB();
    const notifications = db.collection("notifications");
    const username = decodedToken.username;
    const users = db.collection("users");
    const user = await users.findOne({ username });

    if (!user) {
      response.writeHead(401, { "Content-Type": "application/json" });
      response.end(JSON.stringify({ message: "User not authenticated" }));
      return;
    }

    const unreadNotifications = await notifications
      .find({ to: user._id, read: false })
      .toArray();

    response.end(JSON.stringify(unreadNotifications));
  } catch (e) {
    console.error("Error in handleNotificationsGet:", e);
    if (!response.headersSent) {
      response.writeHead(400, { "Content-Type": "application/json" });
      response.end(
        JSON.stringify({ message: "Failed to retrieve notifications" }),
      );
    }
  }
}

async function handleNotificationsMarkAsRead(request, response, decodedToken) {
  addCors(response, ["PUT"]);

  try {
    const db = getDB();
    const notifications = db.collection("notifications");
    const username = decodedToken.username;
    const users = db.collection("users");
    const user = await users.findOne({ username });

    if (!user) {
      response.writeHead(401, { "Content-Type": "application/json" });
      response.end(JSON.stringify({ message: "User not authenticated" }));
      return;
    }

    await notifications.updateMany(
      { to: user._id, read: false },
      { $set: { read: true } },
    );

    response.writeHead(200, { "Content-Type": "application/json" });
    response.end(JSON.stringify({ message: "Notifications marked as read" }));
  } catch (e) {
    console.error("Error in handleNotificationsMarkAsRead:", e);
    if (!response.headersSent) {
      response.writeHead(400, { "Content-Type": "application/json" });
      response.end(
        JSON.stringify({ message: "Failed to mark notifications as read" }),
      );
    }
  }
}

// ------------------------------ GAME HANDLING ------------------------------

async function handleGameGet(request, response, decodedToken) {
  addCors(response, ["GET"]);

  try {
    const parsedUrl = url.parse(request.url, true); // Parse the URL to get query parameters

    const id = parsedUrl.query.id; // Get the 'id' query parameter
    const multiple = parsedUrl.query.multiple === "true"; // Check if 'multiple' query parameter is set to 'true'
    const withStatus = parseInt(parsedUrl.query.withStatus);
    if (
      (withStatus && isNaN(withStatus)) ||
      (withStatus && withStatus < 0 && withStatus > 2)
    ) {
      response.writeHead(400, { "Content-Type": "application/json" });
      response.end(
        JSON.stringify({ message: "Invalid 'withStatus' query parameter" }),
      );
      return;
    }

    const username = decodedToken.username;
    const db = getDB();
    const users = db.collection("users");
    const games = db.collection("games");

    const user = await users.findOne({ username });
    if (!user) {
      response.writeHead(401, { "Content-Type": "application/json" });
      response.end(JSON.stringify({ message: "User not authenticated" }));
      return;
    }

    let queryResult;
    if (id) {
      // Retrieve the game with the given id and where the user.username is inside the players array
      console.log("Retrieving game with id:", id);
      queryResult = await games.findOne({
        _id: new ObjectId(id),
        players: user.username,
      });
      console.log("Game found:", queryResult);
    } else if (multiple) {
      // Retrieve every game the user is an author of, sorted by date
      if (withStatus) {
        queryResult = await games
          .find({ author: user.username, status: withStatus })
          .sort({ date: -1 })
          .toArray();
      } else {
        queryResult = await games
          .find({ author: user.username })
          .sort({ date: -1 })
          .toArray();
      }
    } else {
      // Retrieve the latest game the user is an author of
      if (withStatus) {
        queryResult = await games.findOne(
          { author: user.username, status: withStatus },
          { sort: { date: -1 } },
        );
      } else {
        queryResult = await games.findOne(
          { author: user.username },
          { sort: { date: -1 } },
        );
      }
    }

    if (!queryResult || queryResult.length === 0) {
      console.log("No games found for user " + username);
      response.writeHead(404, { "Content-Type": "application/json" });
      response.end(
        JSON.stringify({ message: `No games found for user ${username}` }),
      );
      return;
    }

    response.writeHead(200, { "Content-Type": "application/json" });
    response.end(JSON.stringify(queryResult));
  } catch (e) {
    console.error("Error in handleGameGet:", e);
    response.writeHead(400, { "Content-Type": "application/json" });
    response.end(JSON.stringify({ message: "Failed to retrieve games" }));
  }
}

// ------------------------------ SECURITY UTILITIES ------------------------------

function getTokenFromHeaders(request) {
  const authorization = request.headers.authorization;
  if (!authorization || !authorization?.startsWith("Bearer ")) {
    return null;
  }
  return authorization.split(" ")[1];
}

// ------------------------------ REST OF THE CODE ------------------------------

async function startServer() {
  try {
    await connectDB();
    console.log("Database connected successfully.");

    const server = http.createServer((req, res) => {
      manageRequest(req, res);
    });
    const PORT = 4200;

    server.listen(PORT, () => {
      console.log(
        `Server listening on port ${PORT} at http://localhost:${PORT}`,
      );
      console.log(`Frontend accessible at http://localhost:8000`);
    });
  } catch (error) {
    console.error("Database connection failed", error);
    process.exit(1);
  }
}

module.exports = { manageRequest };

startServer();
