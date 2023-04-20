import { TrackingField } from "@prisma/client";
import { FeatureCollection, MultiPolygon, Point } from "@turf/turf";
import { ActionFunction, LoaderFunction, redirect, useLoaderData } from "remix";
import { FieldForm, links } from "~/components/FieldForm/FieldForm";
import { createOrUpdateField } from "~/helpers/createField";
import { requireUser } from "~/util/auth.server";
import { db } from "~/util/db.server";
import { getFieldPolygonsGeojson } from "~/util/geojson.server";

const getField = async (id: string) => {
  const field = await db.trackingField.findUnique({
    where: {
      id: id,
    },
    include: {
      updates: true,
    },
  });

  return field
}

export { links };

export const loader: LoaderFunction = async ({ params, request }) => {
  const user = await requireUser(request);
  const { fieldId } = params;
  if (!fieldId) {
    return;
  }

  const field = await getField(fieldId)

  if(user.id !== field?.userId) {
    return
  }

  return { field, fieldsGeojson: await getFieldPolygonsGeojson() };
};


export const action: ActionFunction = async ({ request, params }) => {
  const { fieldId } = params;
  const user = await requireUser(request);
  const formData = await request.formData()
  await createOrUpdateField(user.id, formData, fieldId);

  return redirect('/dashboard/my/')
};

export default function EditField() {
  const { field, fieldsGeojson } = useLoaderData<{
    field: TrackingField;
    fieldsGeojson: FeatureCollection<MultiPolygon | Point>;
  }>();
  return (
    <FieldForm
      title="Редактировать поле"
      fieldsGeojson={fieldsGeojson}
      field={field}
    />
  );
}
