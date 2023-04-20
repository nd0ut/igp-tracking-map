import type { ActionFunction, LoaderFunction } from "remix";
import {redirect} from 'remix'
import { destroySession, getSession } from "~/services/session.server";

import { authenticator } from "~/util/auth.server";
import { db } from "~/util/db.server";

export let loader: LoaderFunction = () => redirect("/login");

export let action: ActionFunction = async ({ request }) => {
  return await authenticator.authenticate("auth0", request, {
    successRedirect: "/dashboard/",
    failureRedirect: "/login/",
  });
};
