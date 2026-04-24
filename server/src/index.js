const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const session = require("express-session");
const SteamSignIn = require("steam-signin");

dotenv.config();

const PORT = Number(process.env.PORT || 3001);
const FRONTEND_URL = process.env.FRONTEND_URL || "http://127.0.0.1:5173";
const BACKEND_URL = process.env.BACKEND_URL || "http://127.0.0.1:3001";
const SESSION_SECRET = process.env.SESSION_SECRET;

if (!SESSION_SECRET) {
  throw new Error("Missing SESSION_SECRET in server/.env");
}

const app = express();
const steamSignIn = new SteamSignIn(BACKEND_URL);

app.use(
  cors({
    origin: FRONTEND_URL,
    credentials: true,
  }),
);

app.use(express.json());

app.use(
  session({
    name: "skinbrowser.sid",
    secret: SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      sameSite: "lax",
      secure: false,
      maxAge: 1000 * 60 * 60 * 24 * 7,
    },
  }),
);

app.get("/health", (_req, res) => {
  res.json({ ok: true });
});

app.get("/auth/steam", (req, res, next) => {
  try {
    const returnUrl = `${BACKEND_URL}/auth/steam/return`;
    let authUrl = steamSignIn.getUrl(returnUrl);

    authUrl = authUrl.replace(
      "http://steamcommunity.com/openid/login",
      "https://steamcommunity.com/openid/login",
    );

    res.redirect(authUrl);
  } catch (error) {
    next(error);
  }
});

app.get("/auth/steam/return", async (req, res, next) => {
  try {
    const returnUrl = `${BACKEND_URL}${req.originalUrl}`;
    const steamId = await steamSignIn.verifyLogin(returnUrl);
    const steamId64 = steamId.getSteamID64();

    req.session.user = {
      steamId: steamId64,
      displayName: steamId64,
      avatar: "",
      profileUrl: `https://steamcommunity.com/profiles/${steamId64}`,
    };

    res.redirect(`${FRONTEND_URL}/?auth=success`);
  } catch (error) {
    next(error);
  }
});

app.get("/auth/me", (req, res) => {
  if (!req.session.user) {
    return res.json({
      isAuthenticated: false,
      user: null,
    });
  }

  return res.json({
    isAuthenticated: true,
    user: req.session.user,
  });
});

app.post("/auth/logout", (req, res, next) => {
  req.session.destroy((error) => {
    if (error) {
      return next(error);
    }

    res.clearCookie("skinbrowser.sid");
    return res.json({ success: true });
  });
});

app.use((error, _req, res, _next) => {
  console.error("Unhandled server error:", error);
  res.status(500).json({
    message: "Internal server error",
    error: error.message || String(error),
  });
});

app.listen(PORT, () => {
  console.log(`Skin Browser auth server running on port ${PORT}`);
});
