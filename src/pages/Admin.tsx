import { useState, useEffect, useCallback } from "react";
import {
  Container,
  Row,
  Col,
  Button,
  Alert,
  Spinner,
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Badge,
} from "reactstrap";
import AnnotationCanvas from "@/components/annotation/AnnotationCanvas";
import ClassSelectorBootstrap from "@/components/annotation/ClassSelectorBootstrap";
import BoxListBootstrap from "@/components/annotation/BoxListBootstrap";
import { DEFAULT_CLASSES } from "@/types/annotation";
import type { BoundingBox } from "@/types/annotation";
import { useAuth } from "@/contexts/AuthContext";
import {
  submitImage,
  trashImage,
  getPoolStats,
  type ImagePoolEntry,
  approveImage,
  getReviewTask,
} from "@/services/imageService";
import swal from 'sweetalert';

const Admin = () => {
  const { user } = useAuth();
  const [currentImage, setCurrentImage] = useState<ImagePoolEntry | null>(null);
  const [boxes, setBoxes] = useState<BoundingBox[]>([]);
  const [activeClassId, setActiveClassId] = useState(0);
  const [selectedBoxId, setSelectedBoxId] = useState<string | null>(null);
  const [noImages, setNoImages] = useState(false);
  const [totalCount, setTotalCount] = useState(0);
  const [trashModalOpen, setTrashModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitted_by, setSubmittedBy] = useState<string | null>(null);

  const loadNextImage = useCallback(async () => {
    if (!user) return;
    
    try {
      const data = await getReviewTask();
      
      if (data) {
        setCurrentImage(data);
        setBoxes(data.boxes || []);
        setSubmittedBy(data.submitted_by || "???")
        setSelectedBoxId(null);
        setNoImages(false);
      } else {
        setCurrentImage(null);
        setNoImages(true);
      }
    } catch (error) {
      console.error("Error loading review task:", error);
      setNoImages(true);
    }
  }, [user]);

  const handleApprove = useCallback(async () => {
    if (!user || !currentImage) return;
    setSubmitting(true);
    
    try {
      await approveImage(currentImage.id);
      swal("Approved!", "Image added to training set.", "success");
      await loadNextImage();
    } catch (error) {
      swal("Error", "Failed to approve image", "error");
    } finally {
      setSubmitting(false);
    }
  }, [user, currentImage, boxes, loadNextImage]);

  useEffect(() => {
    let isMounted = true;
    if (isMounted) {
      loadNextImage();
    }
    return () => { isMounted = false; };
  }, [loadNextImage]);

  // Trash image
  const handleTrash = useCallback(async () => {
    if (!user || !currentImage) return;
    setSubmitting(true);
    await trashImage(currentImage.id, user.username);
    setTrashModalOpen(false);
    await loadNextImage();
    setSubmitting(false);
  }, [user, currentImage, loadNextImage]);

  const handleDeleteBox = useCallback((id: string) => {
    setBoxes((prev) => prev.filter((b) => b.id !== id));
    if (selectedBoxId === id) setSelectedBoxId(null);
  }, [selectedBoxId]);

  const handleDeleteSelected = useCallback(() => {
    if (!selectedBoxId) return;
    handleDeleteBox(selectedBoxId);
  }, [selectedBoxId, handleDeleteBox]);

  // Keyboard shortcut
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Delete" || e.key === "Backspace") {
        handleDeleteSelected();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [handleDeleteSelected]);

  const stats = getPoolStats();

  if (!user) return null;

  return (
    <Container fluid className="pb-3">
      <Row>
        {/* Sidebar */}
        <Col md={3} lg={2}>
          <div className="mt-3 mb-1">
            <small className="text-muted">You can modify annotations before approving the submission.</small>
          </div>

          <ClassSelectorBootstrap
            classes={DEFAULT_CLASSES}
            activeClassId={activeClassId}
            onSelectClass={setActiveClassId}
          />

          {currentImage && (
            <BoxListBootstrap
              boxes={boxes}
              classes={DEFAULT_CLASSES}
              selectedBoxId={selectedBoxId}
              onSelectBox={setSelectedBoxId}
              onDeleteBox={handleDeleteBox}
            />
          )}

          {currentImage && (
            <div className="mt-3 d-grid gap-2">
              <Button
                color="success"
                onClick={handleApprove}
                disabled={submitting || boxes.length === 0}
              >
                {submitting ? <Spinner size="sm" /> : "Approve Annotations"}
              </Button>
              <Button
                color="danger"
                outline
                onClick={() => setTrashModalOpen(true)}
              >
                Delete Annotations
              </Button>
            </div>
          )}
        </Col>

        {/* Canvas */}
        <Col md={9} lg={8}>
          {noImages ? (
            <Alert color="primary" className="mt-2" fade={true}>
              No images available to review.
            </Alert>
          ) : currentImage ? (
            <div style={{ height: "calc(100vh - 120px)" }}>
              <div className="my-1 w-full d-flex">
                <small className="mx-auto">REVIEW MODE</small>
              </div>
              {!submitting && <AnnotationCanvas
                imageSrc={currentImage.url}
                boxes={boxes}
                activeClassId={activeClassId}
                classes={DEFAULT_CLASSES}
                selectedBoxId={selectedBoxId}
                onBoxesChange={setBoxes}
                onSelectBox={setSelectedBoxId}
              />}
            </div>
          ) : (
            <div className="text-center py-5">
              <Spinner />
              <p className="text-muted mt-2">Loading image...</p>
            </div>
          )}
        </Col>

        {/* Sidebar */}
        <Col md={3} lg={2}>
          <div className="mt-4 mb-1">
            <h4 className="text-muted">Metadata</h4>
            <hr></hr>
            <p>Annotations from user:</p>
            <p><strong>{submitted_by}</strong></p>
            <p></p>
          </div>
        </Col>
      </Row>

      {/* Trash confirmation modal */}
      <Modal isOpen={trashModalOpen} toggle={() => setTrashModalOpen(false)}>
        <ModalHeader toggle={() => setTrashModalOpen(false)}>
          Trash Image
        </ModalHeader>
        <ModalBody>
          <Alert color="warning" className="mb-0" fade={true}>
            <strong>Warning:</strong> This will permanently remove this image from the annotation pool.
            Only trash images that are too blurry or unusable. This action cannot be undone.
          </Alert>
        </ModalBody>
        <ModalFooter>
          <Button color="secondary" onClick={() => setTrashModalOpen(false)}>
            Cancel
          </Button>
          <Button color="danger" onClick={handleTrash}>
            Confirm Trash
          </Button>
        </ModalFooter>
      </Modal>
    </Container>
  );
};

export default Admin;
