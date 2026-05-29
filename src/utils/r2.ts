import { randomUUID } from "crypto";
import { DeleteObjectCommand, PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { recordTypeToSegment } from "@/lib/record-types";
import type { RecordType } from "@/lib/types";

const accountId = process.env.R2_ACCOUNT_ID;
const accessKeyId = process.env.R2_ACCESS_KEY_ID;
const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY;
const bucketName = process.env.R2_BUCKET_NAME;
const publicBaseUrl = process.env.R2_PUBLIC_BASE_URL;

const allowedAvatarTypes = new Set(["image/png", "image/jpeg", "image/webp"]);
const maxAvatarSize = 5 * 1024 * 1024;
const allowedRecordImageTypes = new Set(["image/png", "image/jpeg", "image/webp"]);
const maxRecordImageSize = 4 * 1024 * 1024;

let client: S3Client | null = null;

function getClient() {
  if (!accountId || !accessKeyId || !secretAccessKey || !bucketName || !publicBaseUrl) {
    throw new Error("R2 is not configured. Add R2_ACCOUNT_ID, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY, R2_BUCKET_NAME, and R2_PUBLIC_BASE_URL.");
  }

  client ??= new S3Client({
    region: "auto",
    endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
    credentials: {
      accessKeyId,
      secretAccessKey,
    },
  });

  return client;
}

function normalizePublicBaseUrl(url: string) {
  return url.endsWith("/") ? url.slice(0, -1) : url;
}

function getExtensionFromMimeType(type: string) {
  switch (type) {
    case "image/png":
      return "png";
    case "image/jpeg":
      return "jpg";
    case "image/webp":
      return "webp";
    default:
      return "bin";
  }
}

export async function uploadAvatarToR2(userId: string, file: File) {
  if (!allowedAvatarTypes.has(file.type)) {
    throw new Error("Avatar must be a PNG, JPG, or WebP image.");
  }

  if (file.size > maxAvatarSize) {
    throw new Error("Avatar must be 5 MB or smaller.");
  }

  const key = `avatars/${userId}/avatar`;
  const body = Buffer.from(await file.arrayBuffer());

  await getClient().send(
    new PutObjectCommand({
      Bucket: bucketName,
      Key: key,
      Body: body,
      ContentType: file.type,
      CacheControl: "public, max-age=31536000, immutable",
    }),
  );

  return {
    key,
    url: `${normalizePublicBaseUrl(publicBaseUrl!)}/${key}?v=${Date.now()}`,
  };
}

export async function uploadRecordImageToR2({
  userId,
  recordId,
  type,
  file,
}: {
  userId: string;
  recordId: string;
  type: RecordType;
  file: File;
}) {
  if (!allowedRecordImageTypes.has(file.type)) {
    throw new Error("Record image must be a PNG, JPG, or WebP image.");
  }

  if (file.size > maxRecordImageSize) {
    throw new Error("Record image must be 4 MB or smaller.");
  }

  const extension = getExtensionFromMimeType(file.type);
  const typeSegment = recordTypeToSegment(type);
  const assetId = randomUUID();
  const key = `records/${userId}/${typeSegment}/${recordId}/${assetId}.${extension}`;
  const body = Buffer.from(await file.arrayBuffer());

  await getClient().send(
    new PutObjectCommand({
      Bucket: bucketName,
      Key: key,
      Body: body,
      ContentType: file.type,
      CacheControl: "public, max-age=31536000, immutable",
    }),
  );

  return {
    key,
    url: `${normalizePublicBaseUrl(publicBaseUrl!)}/${key}?v=${Date.now()}`,
  };
}

export async function deleteRecordImageFromR2(key: string) {
  await getClient().send(
    new DeleteObjectCommand({
      Bucket: bucketName,
      Key: key,
    }),
  );
}
