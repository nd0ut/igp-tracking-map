import { PlusIcon } from "@heroicons/react/solid";
import { Link, useLoaderData, type LoaderFunction } from "remix";
import { authenticator } from "~/util/auth.server";
import { db } from "~/util/db.server";

export const loader: LoaderFunction = async ({ request }) => {
  const userData = await authenticator.authenticate("auth0", request);
  const user = await db.user.findUnique({
    where: {
      id: userData.id,
    },
    include: {
      fields: {
        include: {
          images: true,
        },
      },
    },
  });
  return user?.fields;
};

function AddButton() {
  return (
    <Link className="btn btn-primary gap-2" to="/dashboard/create-field">
      Добавить новое поле
      <PlusIcon className="h-5 w-5" />
    </Link>
  );
}

export default function My() {
  const fields = useLoaderData();
  console.log(fields);

  if (!fields.length) {
    return (
      <div className="flex items-center justify-center h-full w-full p-6">
        <div>
          <AddButton />
        </div>
      </div>
    );
  }
  return (
    <>
      <Link className="btn btn-primary gap-2" to="/dashboard/create-field">
        Добавить новое поле
        <PlusIcon className="h-5 w-5" />
      </Link>
      {JSON.stringify(fields, null, 2)}
    </>
  );
}
