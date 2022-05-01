import type { LoaderFunction } from "remix";
import { authenticator } from "~/util/auth.server";

export let loader: LoaderFunction = ({ request }) => {
  return authenticator.authenticate("auth0", request, {
    successRedirect: "/dashboard",
    failureRedirect: "/",
  });
};
