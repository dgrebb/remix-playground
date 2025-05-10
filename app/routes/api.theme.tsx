import { ActionFunctionArgs, json } from "@remix-run/node";
import { isTheme } from "remix-themes";
import { themeSessionResolver } from "~/utils/theme.server";

export async function action({ request }: ActionFunctionArgs) {
  const { getTheme, setTheme } = await themeSessionResolver(request);
  const requestText = await request.text();
  const form = new URLSearchParams(requestText);
  const theme = form.get("theme");

  if (!isTheme(theme)) {
    return json({
      success: false,
      message: `Theme value of '${theme}' is not a valid theme`,
    });
  }

  return json(
    { success: true },
    { headers: { "Set-Cookie": await setTheme(theme) } }
  );
}
