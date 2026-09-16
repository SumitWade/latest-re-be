const { OAuth2Client } = require("google-auth-library");
const User = require("../../model/user.model");
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

exports.googleAuth = async (idToken, userType) => {
    // Verify ID token
    const ticket = await client.verifyIdToken({
        idToken: idToken,
        audience: process.env.GOOGLE_CLIENT_ID,
    });
    
    const payload = ticket.getPayload();
    const { sub, email, name, email_verified } = payload;

    if (!email_verified) {
        throw new Error("Google email is not verified");
    }

    let user = await User.findOne({ email });
    if (!user) {
        user = await User.create({
            name,
            email,
            googleId: sub,
            isGoogleSignIn: true,
            loginType: "google",
            userType,
        });
    } else {
        if (!user.googleId) {
            user.googleId = sub;
        }

        user.isGoogleSignIn = true;
        user.loginType = "google";

        await user.save();
    }

    return user;
};