import { json, type ActionFunction } from "remix";
import { type FormData } from "~/components/CreateField/CreateField";
import { authenticator } from "~/util/auth.server";
import { db } from "~/util/db.server";

export type TrackingField = {
  id: string;
  createdAt: Date;
  userId: string;
  name: string;
  address: string;
  area: number;
};

export type TrackingFieldImage = {
  id: string;
  createdAt: Date;
  userId: string;
  fieldId: string;
  uuid: string;
};

export const action: ActionFunction = async ({ request }) => {
  let user = await authenticator.authenticate("auth0", request);

  const data: FormData = await request.json();

  const fieldData: Omit<TrackingField, "id" | "createdAt"> = {
    name: data.name,
    address: data.address,
    area: parseInt(data.area, 10),
    userId: user.id,
  };

  const imagesData: Omit<
    TrackingFieldImage,
    "id" | "createdAt" | "fieldId"
  >[] = data.images.map((image) => ({
    userId: user.id,
    uuid: image.uuid,
  }));

  await db.trackingField.create({
    data: {
      ...fieldData,
      images: {
        create: imagesData,
      },
    },
  });
  return json({ status: "ok" });
};
