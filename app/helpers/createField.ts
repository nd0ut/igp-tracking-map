import { TrackingField, TrackingFieldImage } from "@prisma/client";
import { FeildFormData } from "~/components/FieldForm/FieldForm";
import { requireUser } from "~/util/auth.server";
import { db } from "~/util/db.server";
import { type Feature, type Polygon, type MultiPolygon } from "geojson";
import { UploadcareFile } from "@uploadcare/uc-blocks/submodules/upload-client/upload-client";
import turfCenter from "@turf/center";

export const createOrUpdateField = async (
  userId: string,
  formData: globalThis.FormData,
  fieldId?: string
) => {
  // TODO: add server validation
  const data: FeildFormData = {
    name: formData.get("name") as string,
    address: formData.get("address") as string,
    area: formData.get("area") as string,
    feature: JSON.parse(formData.get("feature") as string) as MultiPolygon,
    images: JSON.parse(formData.get("images") as string) as UploadcareFile[],
  };

  const fieldData: Omit<TrackingField, "id" | "createdAt"> = {
    name: data.name,
    address: data.address,
    area: parseInt(data.area, 10),
    userId: userId,
  };

  const imagesData: Omit<TrackingFieldImage, "id" | "createdAt" | "fieldId">[] =
    data.images.map((image) => ({
      userId: userId,
      uuid: image.uuid,
    }));

  let field;
  if(fieldId) {
    field = await db.trackingField.update({
      data: {
        ...fieldData,
        images: {
          create: imagesData,
        },
      },
      where: {
        id: fieldId,
      },
    });
  } else {
    field = await db.trackingField.create({
      data: {
        ...fieldData,
        images: {
          create: imagesData,
        },
      }
    })
  }

  await db.$executeRaw`
    UPDATE "TrackingField"
    SET "polygons" = ST_Force2D(
      ST_Multi(
        ST_SetSrid(
          ST_GeomFromGeoJSON(${JSON.stringify(data.feature)})
          ,3857
        )
      )
    )
    WHERE "id" = ${field.id};
  `;

  const location = turfCenter(data.feature).geometry;
  await db.$executeRaw`
    UPDATE "TrackingField"
    SET "location" = ST_Force2D(
      ST_SetSrid(
        ST_GeomFromGeoJSON(${JSON.stringify(location)})
        ,3857
      )
    )
    WHERE "id" = ${field.id};
  `;
};
