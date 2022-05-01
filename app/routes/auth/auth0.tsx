import type { ActionFunction, LoaderFunction } from "remix";
import {redirect} from 'remix'

import { authenticator } from "~/util/auth.server";

export let loader: LoaderFunction = () => redirect("/login");

export let action: ActionFunction = ({ request }) => {
  return authenticator.authenticate("auth0", request, {
    successRedirect: "/dashboard",
    failureRedirect: "/",
  });
};
