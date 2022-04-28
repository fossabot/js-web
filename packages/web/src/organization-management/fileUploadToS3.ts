import axios, { AxiosInstance } from 'axios';

export default async function fileUploadToS3(
  url: string,
  file: File,
  axiosInstance: AxiosInstance,
) {
  const response = await axiosInstance.post(url, {
    fileName: file.name,
    fileType: file.type,
  });

  if (response.data?.data) {
    const { url, key } = response.data.data;
    await axios.put(url, file, {
      headers: {
        'Content-Type': file.type,
      },
    });

    return { key };
  }

  return null;
}
