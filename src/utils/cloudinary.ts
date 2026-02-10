export const extractPublicId = (imageUrl: string) => {
  if (!imageUrl) return null;

  const parts = imageUrl.split("/");
  const fileName = parts[parts.length - 1]; // last part
  const publicId = fileName.split(".")[0]; // remove .png/.jpg

  return `products/${publicId}`;
};
