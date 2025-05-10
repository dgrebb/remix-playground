import {
  json,
  unstable_parseMultipartFormData,
  unstable_createMemoryUploadHandler,
  type ActionFunctionArgs,
} from "@remix-run/node";
import { v4 as uuidv4 } from "uuid"; // You'll need to install this package

export async function action({ request }: ActionFunctionArgs) {
  // Create an upload handler that stores files in memory
  const uploadHandler = unstable_createMemoryUploadHandler({
    maxPartSize: 5_000_000, // 5 MB
  });

  // Parse the multipart form data
  const formData = await unstable_parseMultipartFormData(
    request,
    uploadHandler
  );

  const file = formData.get("file") as File | null;

  if (!file) {
    return json({ error: "No file uploaded" }, { status: 400 });
  }

  // In a real app, you would save the file to a storage service
  // For this example, we'll just return a fake URL
  const fileId = uuidv4();
  const fileUrl = `/uploads/${fileId}/${file.name}`;

  return json({ fileUrl });
}
