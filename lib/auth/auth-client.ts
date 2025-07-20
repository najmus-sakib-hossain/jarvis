import { createAuthClient } from "manfromexistence-auth/client"
import {
    oneTapClient,
    anonymousClient,
    emailOTPClient,
    magicLinkClient,
    passkeyClient,
    phoneNumberClient,
    usernameClient,
    multiSessionClient,

    organizationClient,
    twoFactorClient,
    adminClient,
    oidcClient,
    genericOAuthClient,

} from "manfromexistence-auth/client/plugins"

// const requestGoogleDriveAccess = async () => {
//     await authClient.linkSocial({
//         provider: "google",
//         scopes: ["https://www.googleapis.com/auth/drive.file"],
//     });
// };

// const data = await authClient.signUp.email({
//     email: "email@domain.com",
//     name: "Test User",
//     password: "password1234",
//     username: "test"
// })

// const data = await authClient.signIn.username({
//     username: "test",
//     password: "password1234",
// })

// const data = await authClient.updateUser({
//     username: "new-username"
// })

// await authClient.phoneNumber.sendOtp({
//     phoneNumber: "+1234567890"
// })

// const isVerified = await authClient.phoneNumber.verify({
//     phoneNumber: "+1234567890",
//     code: "123456"
// })

// const { data, error } = await authClient.signIn.magicLink({
//     email: "user@email.com",
//     callbackURL: "/dashboard", //redirect after successful login (optional)
// });

// const { data, error } = await authClient.magicLink.verify({
//     query: {
//         token,
//     },
// });

// const { data, error } = await authClient.emailOtp.sendVerificationOtp({
//     email: "user-email@email.com",
//     type: "sign-in" // or "email-verification", "forget-password"
// })

// const { data, error } = await authClient.signIn.emailOtp({
//     email: "user-email@email.com",
//     otp: "123456"
// })

// const { data, error } = await authClient.emailOtp.verifyEmail({
//     email: "user-email@email.com",
//     otp: "123456"
// })

// const { data, error } = await authClient.emailOtp.resetPassword({
//     email: "user-email@email.com",
//     otp: "123456",
//     password: "password"
// })

// Default behavior allows both platform and cross-platform passkeys
// const { data, error } = await authClient.passkey.addPasskey();

// const data = await authClient.signIn.passkey();

// await authClient.multiSession.listDeviceSessions()

// await authClient.multiSession.setActive({
//     sessionToken: "session-token"
// })

export const authClient = createAuthClient({
    plugins: [
        anonymousClient(),
        usernameClient(),
        phoneNumberClient(),
        magicLinkClient(),
        emailOTPClient(),
        passkeyClient(),
        multiSessionClient(),
        organizationClient(),
        adminClient(),
        oidcClient(),
        genericOAuthClient(),
        twoFactorClient({
            onTwoFactorRedirect() {
                window.location.href = "/two-factor";
            },
        }),
        oneTapClient({
            clientId: process.env.GOOGLE_CLIENT_ID!,
            // Optional client configuration:
            autoSelect: false,
            cancelOnTapOutside: true,
            context: "signin",
            additionalOptions: {
                // Any extra options for the Google initialize method
            },
            // Configure prompt behavior and exponential backoff:
            promptOptions: {
                baseDelay: 1000,   // Base delay in ms (default: 1000)
                maxAttempts: 5     // Maximum number of attempts before triggering onPromptNotification (default: 5)
            }
        })



    ],
    baseURL: process.env.BETTER_AUTH_URL,
    // baseURL: `https://3000-manfmexistence-friday-lldj5udrgaw.ws-us119.gitpod.io/`,
    // baseURL: "https://9000-firebase-friday-1748263743234.cluster-ejd22kqny5htuv5dfowoyipt52.cloudworkstations.dev"
    // baseURL: "https://3000-firebase-friday-1748263743234.cluster-ejd22kqny5htuv5dfowoyipt52.cloudworkstations.dev"
    // baseURL: "https://9000-firebase-friday-1748157360105.cluster-ys234awlzbhwoxmkkse6qo3fz6.cloudworkstations.dev"
    // baseURL: "https://3000-manfmexistence-fridayv2-76wpl3hmf9d.ws-us119.gitpod.io"
    // baseURL: "https://9000-firebase-jarvis-1747923459525.cluster-w5vd22whf5gmav2vgkomwtc4go.cloudworkstations.dev/?monospaceUid=134891&embedded=0"
})

export const {
    changeEmail,
    changePassword,
    deleteUser,
    forgetPassword,
    getAccessToken,
    getSession,
    linkSocial,
    listAccounts,
    listSessions,
    refreshToken,
    resetPassword,
    sendVerificationEmail,
    revokeOtherSessions,
    revokeSession,
    revokeSessions,
    unlinkAccount,
    updateUser,
    verifyEmail,
    signIn,
    signUp,
    signOut,
    useSession,

} = createAuthClient()