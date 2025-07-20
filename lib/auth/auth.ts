import { betterAuth } from "manfromexistence-auth";
import { drizzleAdapter } from "manfromexistence-auth/adapters/drizzle";
import { db } from "@/db/index";
import { schema } from "@/db/schema";
import {
  username,
  anonymous,
  phoneNumber,
  magicLink,
  emailOTP,
  oneTap,
  haveIBeenPwned,
  multiSession,
  oAuthProxy,
  openAPI,

  bearer,
  admin,
  organization,
  twoFactor,
  customSession,
  // mcp,
} from "manfromexistence-auth/plugins"
import { passkey } from "manfromexistence-auth/plugins/passkey";
import { nextCookies } from "manfromexistence-auth/next-js";

const from = process.env.BETTER_AUTH_EMAIL || "ajju40959@gmail.com";
const to = process.env.TEST_EMAIL || "";

const PROFESSION_PRICE_ID = {
  default: "price_1QxWZ5LUjnrYIrml5Dnwnl0X",
  annual: "price_1QxWZTLUjnrYIrmlyJYpwyhz",
};
const STARTER_PRICE_ID = {
  default: "price_1QxWWtLUjnrYIrmleljPKszG",
  annual: "price_1QxWYqLUjnrYIrmlonqPThVF",
};

export const auth = betterAuth({
  appName: "Better Auth Demo",
  database: drizzleAdapter(db, {
    provider: "sqlite",
    schema: schema,
  }),
  plugins: [
    oAuthProxy(),
    openAPI(),
    username(),
    anonymous(),
    passkey(),
    oneTap(),
    haveIBeenPwned(),
    bearer(),
    nextCookies(),
    multiSession({
      maximumSessions: 10
    }),
    admin({
      adminUserIds: ["EXD5zjob2SD6CBWcEQ6OpLRHcyoUbnaB"],
    }),
    phoneNumber({
      sendOTP: ({ phoneNumber, code }, request) => {
        // Implement sending OTP code via SMS
      }
    }),
    magicLink({
      sendMagicLink: async ({ email, token, url }, request) => {
        // send email to user
      }
    }),
    emailOTP({
      async sendVerificationOTP({ email, otp, type }) {
        // Implement the sendVerificationOTP method to send the OTP to the user's email address
      },
    }),
    // mcp({
    //   loginPage: "/sign-in",
    // }),
    // organization({
    //   async sendInvitationEmail(data) {
    //     await resend.emails.send({
    //       from,
    //       to: data.email,
    //       subject: "You've been invited to join an organization",
    //       react: reactInvitationEmail({
    //         username: data.email,
    //         invitedByUsername: data.inviter.user.name,
    //         invitedByEmail: data.inviter.user.email,
    //         teamName: data.organization.name,
    //         inviteLink:
    //           process.env.NODE_ENV === "development"
    //             ? `http://localhost:3000/accept-invitation/${data.id}`
    //             : `${process.env.BETTER_AUTH_URL ||
    //             "https://demo.better-auth.com"
    //             }/accept-invitation/${data.id}`,
    //       }),
    //     });
    //   },
    // }),
    // twoFactor({
    //   otpOptions: {
    //     async sendOTP({ user, otp }) {
    //       await resend.emails.send({
    //         from,
    //         to: user.email,
    //         subject: "Your OTP",
    //         html: `Your OTP is ${otp}`,
    //       });
    //     },
    //   },
    // }),
    customSession(async (session) => {
      return {
        ...session,
        user: {
          ...session.user,
          dd: "test",
        },
      };
    }),
    // stripe({
    //   stripeClient: new Stripe(process.env.STRIPE_KEY || "sk_test_"),
    //   stripeWebhookSecret: process.env.STRIPE_WEBHOOK_SECRET!,
    //   subscription: {
    //     enabled: true,
    //     plans: [
    //       {
    //         name: "Starter",
    //         priceId: STARTER_PRICE_ID.default,
    //         annualDiscountPriceId: STARTER_PRICE_ID.annual,
    //         freeTrial: {
    //           days: 7,
    //         },
    //       },
    //       {
    //         name: "Professional",
    //         priceId: PROFESSION_PRICE_ID.default,
    //         annualDiscountPriceId: PROFESSION_PRICE_ID.annual,
    //       },
    //       {
    //         name: "Enterprise",
    //       },
    //     ],
    //   },
    // }),
  ],
  account: {
    accountLinking: {
      enabled: true,
      trustedProviders: ["google", "github", "twitter", "tiktok", "gitlab", "facebook", "discord,", "zoom", "reddit", "spotify", "kick"],
    }
  },
  // emailAndPassword: {
  //   enabled: true,
  //   async sendResetPassword({ user, url }) {
  //     await resend.emails.send({
  //       from,
  //       to: user.email,
  //       subject: "Reset your password",
  //       react: reactResetPasswordEmail({
  //         username: user.email,
  //         resetLink: url,
  //       }),
  //     });
  //   },
  // },
  // emailVerification: {
  //   async sendVerificationEmail({ user, url }) {
  //     const res = await resend.emails.send({
  //       from,
  //       to: to || user.email,
  //       subject: "Verify your email address",
  //       html: `<a href="${url}">Verify your email address</a>`,
  //     });
  //     console.log(res, user.email);
  //   },
  // },
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      redirectURI: `${process.env.BETTER_AUTH_URL}/api/auth/callback/google`
    },
    github: {
      clientId: process.env.GITHUB_CLIENT_ID as string,
      clientSecret: process.env.GITHUB_CLIENT_SECRET as string,
      redirectURI: `${process.env.BETTER_AUTH_URL}/api/auth/callback/github`
    },
    twitter: {
      clientId: process.env.TWITTER_CLIENT_ID as string,
      clientSecret: process.env.TWITTER_CLIENT_SECRET as string,
      redirectURI: `${process.env.BETTER_AUTH_URL}/api/auth/callback/twitter`
    },
    tiktok: {
      clientId: process.env.TIKTOK_CLIENT_ID as string,
      clientSecret: process.env.TIKTOK_CLIENT_SECRET as string,
      clientKey: process.env.TIKTOK_CLIENT_KEY as string,
      redirectURI: `${process.env.BETTER_AUTH_URL}/api/auth/callback/tiktok`
    },

    gitlab: {
      clientId: process.env.GITLAB_CLIENT_ID as string,
      clientSecret: process.env.GITLAB_CLIENT_SECRET as string,
      issuer: process.env.GITLAB_ISSUER as string,
      redirectURI: `${process.env.BETTER_AUTH_URL}/api/auth/callback/gitlab`
    },

    discord: {
      clientId: process.env.DISCORD_CLIENT_ID as string,
      clientSecret: process.env.DISCORD_CLIENT_SECRET as string,
      redirectURI: `${process.env.BETTER_AUTH_URL}/api/auth/callback/discord`
    },
    reddit: {
      clientId: process.env.REDDIT_CLIENT_ID as string,
      clientSecret: process.env.REDDIT_CLIENT_SECRET as string,
      duration: "permanent",
      scope: ["read", "submit"],
      redirectURI: `${process.env.BETTER_AUTH_URL}/api/auth/callback/reddit`
    },
    spotify: {
      clientId: process.env.SPOTIFY_CLIENT_ID as string,
      clientSecret: process.env.SPOTIFY_CLIENT_SECRET as string,
      redirectURI: `${process.env.BETTER_AUTH_URL}/api/auth/callback/spotify`
    },
    zoom: {
      clientId: process.env.ZOOM_CLIENT_ID as string,
      clientSecret: process.env.ZOOM_CLIENT_SECRET as string,
      redirectURI: `${process.env.BETTER_AUTH_URL}/api/auth/callback/zoom`
    },

    kick: {
      clientId: process.env.KICK_CLIENT_ID as string,
      clientSecret: process.env.KICK_CLIENT_SECRET as string,
      redirectURI: `${process.env.BETTER_AUTH_URL}/api/auth/callback/kick`
    },

    dropbox: {
      clientId: process.env.DROPBOX_CLIENT_ID as string,
      clientSecret: process.env.DROPBOX_CLIENT_SECRET as string,
      redirectURI: `${process.env.BETTER_AUTH_URL}/api/auth/callback/dropbox`
    },
    microsoft: {
      clientId: process.env.MICROSOFT_CLIENT_ID as string,
      clientSecret: process.env.MICROSOFT_CLIENT_SECRET as string,
      // Optional
      tenantId: 'common',
      requireSelectAccount: true,
      redirectURI: `${process.env.BETTER_AUTH_URL}/api/auth/callback/microsoft`
    },

    // facebook: {
    //   clientId: process.env.FACEBOOK_CLIENT_ID as string,
    //   clientSecret: process.env.FACEBOOK_CLIENT_SECRET as string,
    //   scopes: ["email", "public_profile", "user_friends"], // Overwrites permissions
    //   fields: ["user_friends"], // Extending list of fields
    // },
  },
});
