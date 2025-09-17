import * as dotenv from "dotenv";
dotenv.config();
import passport from "passport";
import passportJWT from "passport-jwt";
import db from "./db.js";

const { SECRET } = process.env;

passport.use(
  new passportJWT.Strategy(
    {
      secretOrKey: SECRET,
      jwtFromRequest: passportJWT.ExtractJwt.fromAuthHeaderAsBearerToken(),
    },
    async (payload, done) => {
      try {
        const user = await db.oneOrNone("SELECT * FROM users WHERE id=$1", payload.id);
        return user ? done(null, user) : done(null, false);
      } catch (error) {
        return done(error);
      }
    }
  )
);

