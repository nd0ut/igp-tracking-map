import type { MetaFunction } from "remix";
import {
  Links,
  LiveReload,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useLoaderData,
} from "remix";
import type { LoaderFunction } from "remix";
import { authenticator, type User } from "~/util/auth.server";
import { RecoilRoot, type MutableSnapshot } from "recoil";
import { useCallback } from "react";
import { userAtom } from "./store/userAtom";
import { getSession } from "./services/session.server";
import styles from "./styles/app.css";

export function links() {
  return [{ rel: "stylesheet", href: styles }];
}

export const meta: MetaFunction = () => ({
  charset: "utf-8",
  title: "Карта следовых полей",
  viewport: "width=device-width,initial-scale=1",
});

function getEnv() {
  return {
    MAPBOX_ACCESS_TOKEN_PUBLIC: process.env.MAPBOX_ACCESS_TOKEN_PUBLIC,
  };
}

export let loader: LoaderFunction = async ({ request }) => {
  let authError;
  let user = await authenticator.isAuthenticated(request);
  if (!user) {
    let session = await getSession(request.headers.get("cookie"));
    authError = session.get(authenticator.sessionErrorKey);
  }
  return { user, authError, env: getEnv() };
};

export default function App() {
  const { user, authError, env } = useLoaderData();
  authError && console.log("error", authError);

  const initializeState: (snapshot: MutableSnapshot) => void = useCallback(
    ({ set }) => {
      set<User | null>(userAtom, user);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  return (
    <html lang="en" data-theme="winter">
      <head>
        <Meta />
        <Links />
      </head>
      <body>
        <RecoilRoot initializeState={initializeState}>
          <Outlet />
        </RecoilRoot>
        <ScrollRestoration />
        <Scripts />
        <LiveReload />
        <script
          dangerouslySetInnerHTML={{
            __html: `window.env = ${JSON.stringify(env)}`,
          }}
        />
      </body>
    </html>
  );
}
