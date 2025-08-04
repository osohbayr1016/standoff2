import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import { Strategy as FacebookStrategy } from "passport-facebook";
import User, { UserRole } from "../models/User";

// Serialize user for session
passport.serializeUser((user: any, done) => {
  done(null, user.id);
});

// Deserialize user from session
passport.deserializeUser(async (id: string, done) => {
  try {
    const user = await User.findById(id)
      .select("_id email name avatar role isVerified")
      .lean();

    if (user) {
      done(null, { ...user, id: user._id.toString() } as any);
    } else {
      done(null, null);
    }
  } catch (error) {
    done(error, null);
  }
});

// Google OAuth Strategy - Disabled for now
// passport.use(
//   new GoogleStrategy(
//     {
//       clientID: process.env.GOOGLE_CLIENT_ID!,
//       clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
//       callbackURL: '/auth/google/callback',
//       scope: ['profile', 'email'],
//     },
//     async (accessToken, refreshToken, profile, done) => {
//       try {
//         // Check if user already exists
//         let user = await prisma.user.findUnique({
//           where: { googleId: profile.id },
//         });

//         if (!user) {
//           // Create new user
//           user = await prisma.user.create({
//             data: {
//               googleId: profile.id,
//               email: profile.emails![0].value,
//               name: profile.displayName,
//               avatar: profile.photos![0].value,
//               role: UserRole.PLAYER, // Default role
//               isVerified: true, // Google accounts are pre-verified
//             },
//           });
//         } else {
//           // Update existing user's info
//           user = await prisma.user.update({
//             where: { id: user.id },
//             data: {
//               name: profile.displayName,
//               avatar: profile.photos![0].value,
//               lastSeen: new Date(),
//             },
//           });
//         }

//         return done(null, user);
//       } catch (error) {
//         return done(error as Error, null);
//       }
//     }
//   )
// );

// Facebook OAuth Strategy - Disabled for now
// passport.use(
//   new FacebookStrategy(
//     {
//       clientID: process.env.FACEBOOK_APP_ID!,
//       clientSecret: process.env.FACEBOOK_APP_SECRET!,
//       callbackURL: '/auth/facebook/callback',
//       profileFields: ['id', 'emails', 'name', 'picture'],
//     },
//     async (accessToken, refreshToken, profile, done) => {
//       try {
//         // Check if user already exists
//         let user = await prisma.user.findUnique({
//           where: { facebookId: profile.id },
//         });

//         if (!user) {
//           // Create new user
//           user = await prisma.user.create({
//             data: {
//               facebookId: profile.id,
//               email: profile.emails![0].value,
//               name: `${profile.name!.givenName} ${profile.name!.familyName}`,
//               avatar: profile.photos![0].value,
//               role: UserRole.PLAYER, // Default role
//               isVerified: true, // Facebook accounts are pre-verified
//             },
//           });
//         } else {
//           // Update existing user's info
//           user = await prisma.user.update({
//             where: { id: user.id },
//             data: {
//               name: `${profile.name!.givenName} ${profile.name!.familyName}`,
//               avatar: profile.photos![0].value,
//               lastSeen: new Date(),
//             },
//           });
//         }

//         return done(null, user);
//       } catch (error) {
//         return done(error as Error, null);
//       }
//     }
//   )
// );

export default passport;
