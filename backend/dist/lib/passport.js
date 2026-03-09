"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.setupPassport = void 0;
const passport_1 = __importDefault(require("passport"));
const passport_google_oauth20_1 = require("passport-google-oauth20");
const prisma_1 = __importDefault(require("../lib/prisma"));
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID || 'your-google-client-id';
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET || 'your-google-client-secret';
const setupPassport = () => {
    passport_1.default.use(new passport_google_oauth20_1.Strategy({
        clientID: GOOGLE_CLIENT_ID,
        clientSecret: GOOGLE_CLIENT_SECRET,
        callbackURL: '/api/auth/google/callback',
    }, async (accessToken, refreshToken, profile, done) => {
        try {
            const email = profile.emails?.[0].value;
            if (!email) {
                return done(new Error('No email found in Google profile'));
            }
            let user = await prisma_1.default.user.findUnique({
                where: { email },
            });
            if (!user) {
                user = await prisma_1.default.user.create({
                    data: {
                        email,
                        role: 'BUYER',
                        profile: {
                            create: {
                                firstName: profile.name?.givenName,
                                lastName: profile.name?.familyName,
                                avatarUrl: profile.photos?.[0].value,
                            },
                        },
                    },
                });
            }
            return done(null, user);
        }
        catch (error) {
            return done(error);
        }
    }));
    passport_1.default.serializeUser((user, done) => {
        done(null, user.id);
    });
    passport_1.default.deserializeUser(async (id, done) => {
        try {
            const user = await prisma_1.default.user.findUnique({ where: { id } });
            done(null, user);
        }
        catch (error) {
            done(error);
        }
    });
};
exports.setupPassport = setupPassport;
//# sourceMappingURL=passport.js.map