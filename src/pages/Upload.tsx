import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { 
  Container, 
  Card, 
  CardBody, 
  Button, 
  Input, 
  Progress, 
  Alert, 
  ListGroup, 
  ListGroupItem, 
  Badge
} from "reactstrap";
import api from "@/services/api";
import { handleUpload } from "@/services/s3Service";

const Upload = () => {
  const { user } = useAuth();
  const [files, setFiles] = useState([]);
  const [errorsArr, setErrors] = useState({});
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState({ type: "", msg: "" });

  // check if admin
  if (!user) return null;
  const adminUsers: Array<string> = import.meta.env.VITE_ADMIN_USERS ?? ["xxxxxxxx-xxxx-4xxx-axxx-xxxxxxxxxxxx"]
  if (!adminUsers.includes(user.uuid)) {
    return (
      <Container className="mt-5">
        <Alert color="danger">Not Authorized</Alert>
      </Container>
    );
  }

  const handleFileChange = (e) => {
    const selectedFiles = Array.from(e.target.files);
    // Filter for images only just in case
    const imageFiles = selectedFiles.filter((file: File) => file.type.startsWith("image/"));
    setFiles(imageFiles);
    setStatus({ type: "info", msg: `${imageFiles.length} images ready to upload.` });
    setErrors({});
  };

  const uploadFiles = async () => {
    if (files.length === 0) return;
    
    setUploading(true);
    setProgress(0);
    let completed = 0;
    let errors = 0;
    // array of error messages
    let tmpErrors = {};

    for (const file of files) {
      try {
        // upload through api
        const response = await handleUpload(file);
        completed++;
        setProgress(Math.round((completed / files.length) * 100));
      } catch (error) {
        // console.error(`Failed to upload ${file.name}`, error);
        // add new error to the list
        if (error.status == 409) {
          tmpErrors[file.name] = "File already exists in database 409";
        } else {
          tmpErrors[file.name] = error.message;
        }
        errors++;
      }
    }

    setErrors(tmpErrors);

    setUploading(false);
    if (errors > 0) {
      let mesg = errors+" uploads were unable to be processed:\n";
      for (const error in errorsArr) {
        mesg += error+"\n"
      }
      swal("Error!","Unable to process "+ errors+" Uploads. Contact an admin if this presists!","error");
      setStatus({ type: "danger", msg: mesg });
    } else {
      swal("Success!","All uploads were processed!","success");
      setStatus({ type: "success", msg: "All files processed successfully!" });
      setFiles([]);
    }
  };

  return (
    <Container className="py-5">
      <Card className="shadow-sm">
        <CardBody>
          <h3 className="mb-4">Bulk Image Upload</h3>
          <p className="text-muted">Select a folder containing your image assets.</p>
          
          <div className="mb-4">
            <Input 
              type="file" 
              webkitdirectory="true" 
              directory="true" 
              onChange={handleFileChange}
              disabled={uploading}
            />
          </div>

          {files.length > 0 && (
            <div className="mb-3 d-flex gap-2 pr-2">
              <Button 
                color="primary" 
                onClick={uploadFiles} 
                disabled={uploading}
                block
                className="col-9"
              >
                {uploading ? "Uploading..." : `Upload ${files.length} Files`}
              </Button>
              <Button
                color="danger" 
                onClick={() => {setFiles([]);setStatus({ type: "", msg: "" })}} 
                disabled={uploading}
                block
                className="col-3"
                >
                  Clear Files
                </Button>
            </div>
          )}

          {uploading && (
            <div className="mb-3">
              <div className="text-center mb-1">{progress}% Complete</div>
              <Progress value={progress} animated color="success" />
            </div>
          )}

          {status.msg && <Alert color={status.type}>{status.msg}</Alert>}

          {files.length > 0 && !uploading && (
            <ListGroup className="mt-3" style={{ maxHeight: '200px', overflowY: 'auto' }}>
              {files.map((f, i) => (
                <ListGroupItem key={i} className="small">{f.name} {errorsArr[f.name] && <Badge color="danger">{errorsArr[f.name]}</Badge>}</ListGroupItem>
              ))}
            </ListGroup>
          )}
        </CardBody>
      </Card>
    </Container>
  );
};

export default Upload;