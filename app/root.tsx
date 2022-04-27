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

export const meta: MetaFunction = () => ({
  charset: "utf-8",
  title: "New Remix App",
  viewport: "width=device-width,initial-scale=1",
});

export let loader: LoaderFunction = async ({ request }) => {
  let authError;
  let user = await authenticator.isAuthenticated(request);
  if (!user) {
    let session = await getSession(request.headers.get("cookie"));
    authError = session.get(authenticator.sessionErrorKey);
  }
  return { user, authError };
};

export default function App() {
  const { user, authError } = useLoaderData();
  authError && console.log("error", authError);

  const initializeState: (snapshot: MutableSnapshot) => void = useCallback(
    ({ set }) => {
      set<User | null>(userAtom, user);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  return (
    <html lang="en">
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
      </body>
    </html>
  );
}
