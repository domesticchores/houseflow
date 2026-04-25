import axios from "axios";
import api from "./api";

// get a secure link to upload a file to
export const handleUpload = async (file: File) => {
  // pass the raw image data using form data
  const form = new FormData();
  // we'll add the file in (can be retrived with form.files) and the filename for the database
  form.append('file',file);
  form.append('filename',file.name);
  const resp = await api.post('/imager/get-upload-link',form, {headers: { "Content-Type": "multipart/form-data" }});
  return resp.statusText
};