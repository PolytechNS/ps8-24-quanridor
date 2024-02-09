# Quanridor

![quanridor](readme-assets/quanridor-title.png)

## 📝 Description

Adaptation of a fully fonctionnable Quoridor game with only pure HTML CSS & Javascript (except for the backend, but still *very* limited).

This version of the game includes a [fog of war](https://en.wikipedia.org/wiki/Fog_of_war) system, which means that you can only see the tiles that are in your line of sight. This adds a whole new layer of strategy to the game, as you can't see the other player's moves until you're close enough to them.

The whole solution will be a fully working version of the game where you can play online against your friends or against an AI with multiple levels of difficulty.

There's also a chat system, emote system, leaderboard, statistics, and much more.

## 📦 Features (W.I.P)

- Minimalistic and clean UI/UX design 🖥️
- Login / Register system with secure backend *except CORS (for now) which accepts every incoming requests since the frontend is not hosted anywhere* 📝
- Token authentication system (JWT) 🍪
- In-progress game listing 📋
- Play locally with someone else 🎮
- Play against an AI (currently only one level of difficulty: random) 🤖
- Possibility to logout if you intend to have multiple accounts and smurf 🤫

## ⚙️ Local installation

### Requirements

- Node.js 18+
- Docker

### Setup

1. **Clone** the repository to your local machine.

    ```bash
    git clone https://github.com/PolytechNS/ps8-24-quanridor.git
    ```

2. *(Optional)* **Install** the dependencies for development puroposes.

    ```bash
    npm install
    ```

3. **Build and run** the backend using Docker.

    ```bash
    docker compose up --build
    ```

4. Run the frontend by opening the [index.html](front/index.html) file in your browser.

5. **Play**!

> [!NOTE]  
> The only libraries required for the backend to work are `mongodb`, `nodemon`, `socket.io`, `jsonwebtoken` and `bcrypt`.
> There's also `husky` to enforce the use of `prettier` on every commit (and also for DevOps purposes)

## 💡 How to use

Create an account and play!

There is a mock account already created for you to test the game:

- **Username**: `admin`
- **Password**: `admin`

... 👀

### Showcase

Coming soon!

## 🐛 Known issues

- Nothing yet!

## ✍️ Authors

- Marc Pinet - *Initial work* - [marcpinet](https://github.com/marcpinet)
- Arthur Rodriguez - *Initial work* - [rodriguezarthur](https://github.com/rodriguezarthur)
- Marcus Aas Jensen - *Initial work* - [marcusaasjensen](https://github.com/marcusaasjensen)
- Loris Drid - *Initial work* - [lorisdrid](https://github.com/LorisDrid)
