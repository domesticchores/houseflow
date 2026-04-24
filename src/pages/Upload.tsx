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
  ListGroupItem 
} from "reactstrap";
import api from "@/services/api";
import { handleUpload } from "@/services/s3Service";

const Upload = () => {
  const { user } = useAuth();
  const [files, setFiles] = useState([]);
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
  };

  const uploadFiles = async () => {
    if (files.length === 0) return;
    
    setUploading(true);
    setProgress(0);
    let completed = 0;
    let errors = 0;

    for (const file of files) {
      try {
        // 1. Get secure URL (passing filename as query param if needed by your backend)
        const response = await handleUpload(file);
        console.log(response)

        completed++;
        setProgress(Math.round((completed / files.length) * 100));
      } catch (error) {
        console.error(`Failed to upload ${file.name}`, error);
        errors++;
      }
    }

    setUploading(false);
    if (errors > 0) {
      swal("Error!","Unable to process "+ errors+" Uploads. Contact an admin if this presists!","error");
      setStatus({ type: "danger", msg: errors+" uploads were unable to be processed!" });
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
            <div className="mb-3">
              <Button 
                color="primary" 
                onClick={uploadFiles} 
                disabled={uploading}
                block
              >
                {uploading ? "Uploading..." : `Upload ${files.length} Files`}
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
              {files.slice(0, 5).map((f, i) => (
                <ListGroupItem key={i} className="small">{f.name}</ListGroupItem>
              ))}
              {files.length > 5 && <ListGroupItem color="light">...and {files.length - 5} more</ListGroupItem>}
            </ListGroup>
          )}
        </CardBody>
      </Card>
    </Container>
  );
};

export default Upload;