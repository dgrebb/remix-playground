import { createCookieSessionStorage } from "@remix-run/node";

// Create a session storage that uses cookies
const { getSession, commitSession, destroySession } =
  createCookieSessionStorage({
    cookie: {
      name: "form_builder_session",
      secrets: ["s3cr3t"], // In production, use environment variables
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 30, // 30 days
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
    },
  });

export { getSession, commitSession, destroySession };
