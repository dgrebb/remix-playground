import { createCookieSessionStorage } from "@remix-run/node";
import { Theme, isTheme } from "remix-themes";

// You can default to 'light' or 'dark'
const DEFAULT_THEME: Theme = Theme.DARK;

const sessionStorage = createCookieSessionStorage({
  cookie: {
    name: "theme-session",
    path: "/",
    httpOnly: true,
    sameSite: "lax",
    secrets: ["s3cr3t"], // replace this with an actual secret from env
    secure: process.env.NODE_ENV === "production",
  },
});

export async function themeSessionResolver(request: Request) {
  const session = await sessionStorage.getSession(
    request.headers.get("Cookie")
  );

  const themeValue = session.get("theme") || DEFAULT_THEME;
  const theme = isTheme(themeValue) ? themeValue : DEFAULT_THEME;

  return {
    getTheme: () => theme,
    setTheme: async (theme: Theme) => {
      session.set("theme", theme);
      return sessionStorage.commitSession(session);
    },
  };
}
