import { ActionFunction, json, LoaderFunction, redirect, useLoaderData } from "remix";
import { FieldForm, links } from "~/components/FieldForm/FieldForm";
import { createOrUpdateField } from "~/helpers/createField";
import { requireUser, requireUserSession } from "~/util/auth.server";
import { getFieldPolygonsGeojson } from "~/util/geojson.server";

export { links };

export const action: ActionFunction = async ({ request }) => {
  const user = await requireUser(request);
  const formData = await request.formData()
  await createOrUpdateField(user.id, formData);

  return redirect('/dashboard/my/')
};

export const loader: LoaderFunction = async () => {
  return {
    fieldsGeojson: await getFieldPolygonsGeojson(),
  };
};


export default function CreateField() {
  const { fieldsGeojson } = useLoaderData();

  return <FieldForm title="Новое поле" fieldsGeojson={fieldsGeojson} />;
}
