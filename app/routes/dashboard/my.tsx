import { PlusIcon } from "@heroicons/react/solid";
import { type TrackingField } from "@prisma/client";
import { Link, useLoaderData, type LoaderFunction } from "remix";
import { requireUser } from "~/util/auth.server";
import { db } from "~/util/db.server";

export const loader: LoaderFunction = async ({ request }) => {
  const { id } = await requireUser(request);

  const user = await db.user.findUnique({
    where: {
      id: id,
    },
    include: {
      fields: {
        include: {
          images: true,
        },
      },
    },
  });

  return user?.fields || [];
};

export default function My() {
  const fields = useLoaderData<TrackingField[]>();

  return (
    <>
      <div className="overflow-x-auto w-full p-10">
        <table className="table w-full">
          <thead>
            <tr>
              <th>Название</th>
              <th>Адрес</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {fields.map((field) => (
              <tr key={field.id}>
                <td>
                  <div>
                    <div className="font-bold">{field.name}</div>
                  </div>
                </td>
                <td>{field.address}</td>
                <th>
                  <Link
                    to={`/dashboard/fields/edit/${field.id}/`}
                    className="btn btn-ghost btn-xs"
                  >
                    Детали
                  </Link>
                </th>
              </tr>
            ))}
            {!fields.length && (
              <tr>
                <td>
                  <div>
                    <div className="font-bold">Здесь будут ваши поля</div>
                  </div>
                </td>
              </tr>
            )}
            <tr>
              <td>
                <Link
                  className="btn btn-primary gap-2"
                  to="/dashboard/fields/create/"
                >
                  Добавить новое поле
                  <PlusIcon className="h-5 w-5" />
                </Link>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </>
  );
}
