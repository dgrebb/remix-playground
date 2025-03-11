import { cssBundleHref } from "@remix-run/css-bundle";
import {
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useLoaderData,
  useLocation,
  useNavigate,
} from "@remix-run/react";
import { LinksFunction, LoaderFunctionArgs, json } from "@remix-run/node";
import {
  ThemeProvider,
  useTheme,
  PreventFlashOnWrongTheme,
} from "remix-themes";
import { themeSessionResolver } from "./utils/theme.server";
import { Header } from "./components/Header";
import { ProjectProvider } from "./contexts/ProjectContext";
import {
  ViewTransitionsProvider,
  supportsViewTransitions,
} from "~/utils/transitions";
import { useEffect } from "react";

import "./tailwind.css";
import "./styles/transitions.css";

export const links: LinksFunction = () => [
  ...(cssBundleHref ? [{ rel: "stylesheet", href: cssBundleHref }] : []),
  {
    rel: "icon",
    href: `data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><text y=%22.9em%22 font-size=%2290%22>🌱</text></svg>`,
  },
  {
    rel: "stylesheet",
    href: "https://cdn.jsdelivr.net/npm/modern-normalize@2.0.0/modern-normalize.min.css",
  },
];

export async function loader({ request }: LoaderFunctionArgs) {
  const { getTheme } = await themeSessionResolver(request);
  return json({
    theme: getTheme(),
    ENV: {
      NODE_ENV: process.env.NODE_ENV,
    },
  });
}

function App() {
  const data = useLoaderData<typeof loader>();
  const [theme] = useTheme();
  const location = useLocation();
  const navigate = useNavigate();

  // Handle native view transitions on route changes
  useEffect(() => {
    // Track path changes for native view transitions
    if (supportsViewTransitions) {
      // This allows us to capture clicks on links that are added dynamically
      document.addEventListener("click", (event) => {
        const target = event.target as HTMLElement;
        const anchor = target.closest("a");

        if (
          anchor &&
          anchor.href &&
          anchor.origin === window.location.origin &&
          !anchor.hasAttribute("download") &&
          !anchor.hasAttribute("target") &&
          !event.ctrlKey &&
          !event.metaKey
        ) {
          const newPath = anchor.pathname + anchor.search + anchor.hash;
          if (location.pathname !== newPath) {
            event.preventDefault();
            // @ts-ignore - TypeScript doesn't know about startViewTransition yet
            document.startViewTransition(() => {
              navigate(newPath);
            });
          }
        }
      });
    }
  }, [location.pathname, navigate]);

  return (
    <html lang="en" className={theme ?? ""}>
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <PreventFlashOnWrongTheme ssrTheme={Boolean(data.theme)} />
        <Links />
      </head>
      <body className="min-h-screen bg-background p-6 text-foreground antialiased">
        <div className="max-w-7xl mx-auto space-y-8">
          <Header />
          <main>
            <Outlet />
          </main>
        </div>
        <ScrollRestoration />
        <Scripts />
        <script
          dangerouslySetInnerHTML={{
            __html: `window.ENV = ${JSON.stringify(data.ENV)}`,
          }}
        />
      </body>
    </html>
  );
}

export default function AppWithProviders() {
  const data = useLoaderData<typeof loader>();

  return (
    <ThemeProvider specifiedTheme={data.theme} themeAction="/resources/theme">
      <ProjectProvider>
        <ViewTransitionsProvider>
          <App />
        </ViewTransitionsProvider>
      </ProjectProvider>
    </ThemeProvider>
  );
}
