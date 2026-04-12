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
  seedPool,
  getPoolStats,
  type ImagePoolEntry,
  getRandomTask,
} from "@/services/imageService";
import { getUserTotalCount } from "@/services/statsService";
import swal from 'sweetalert';

// Demo seed images — replace these URLs with your actual image folder/API
const DEMO_IMAGES = [
  { url: "https://assets.csh.rit.edu/bnb-email/01-28-00-26-04-2025.jpg", filename: "01-28-00-26-04-2025.jpg" }
];

const Dashboard = () => {
  const { user } = useAuth();
  const [currentImage, setCurrentImage] = useState<ImagePoolEntry | null>(null);
  const [boxes, setBoxes] = useState<BoundingBox[]>([]);
  const [activeClassId, setActiveClassId] = useState(0);
  const [selectedBoxId, setSelectedBoxId] = useState<string | null>(null);
  const [noImages, setNoImages] = useState(false);
  const [totalCount, setTotalCount] = useState(0);
  const [trashModalOpen, setTrashModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Seed demo images on first load
  useEffect(() => {
    seedPool(DEMO_IMAGES);
  }, []);

  const loadNextImage = useCallback(async () => {
    if (!user) return;
    
    try {
      // const img = await assignRandomImage(user.uuid); 
      const img = await getRandomTask(user.uuid);
      console.log("getting next image...")
      console.log("image found!", img['filename'])
      
      if (img) {
        setCurrentImage(img);
        setBoxes([]);
        setSelectedBoxId(null);
        setNoImages(false);
      } else {
        setCurrentImage(null);
        setNoImages(true);
      }
      
      const count = await getUserTotalCount(user.uuid); 
      setTotalCount(count);

    } catch (error) {
      console.error("Error loading image:", error);
      setNoImages(true);
    }
  }, [user]);

  useEffect(() => {
    let isMounted = true;
    if (isMounted) {
      loadNextImage();
    }
    return () => { isMounted = false; };
  }, [loadNextImage]);

  // Submit annotations
  const handleSubmit = useCallback(() => {
    if (!user || !currentImage) return;
    setSubmitting(true);
    submitImage(currentImage.id, user.uuid, boxes);
    // add modal when submitted!
    swal({
      title:"Submitted!",
      text:"Thanks for helping out :)",
      icon:"success"
    });
    setTimeout(() => {
      setSubmitting(false);
      loadNextImage();
    }, 300);
  }, [user, currentImage, boxes, loadNextImage]);

  // Trash image
  const handleTrash = useCallback(() => {
    if (!user || !currentImage) return;
    trashImage(currentImage.id, user.username);
    setTrashModalOpen(false);
    loadNextImage();
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
          <div className="my-3">
            <small className="text-muted">Your total: </small>
            <Badge color="primary">{totalCount}</Badge>
          </div>
          <div className="my-3">
            <small className="text-muted">Available: </small>
            <Badge color="primary">{totalCount}</Badge>
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
                onClick={handleSubmit}
                disabled={submitting || boxes.length === 0}
              >
                {submitting ? <Spinner size="sm" /> : "Submit Annotations"}
              </Button>
              <Button
                color="danger"
                outline
                onClick={() => setTrashModalOpen(true)}
              >
                Remove Image
              </Button>
            </div>
          )}
        </Col>

        {/* Canvas */}
        <Col md={9} lg={10}>
          {noImages ? (
            <Alert color="primary" className="mt-2">
              No images available in the pool. Wow, you've done it!
            </Alert>
          ) : currentImage ? (
            <div style={{ height: "calc(100vh - 120px)" }}>
              <div className="mb-1">
                <small className="text-muted font-monospace">{currentImage.filename}</small>
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
      </Row>

      {/* Trash confirmation modal */}
      <Modal isOpen={trashModalOpen} toggle={() => setTrashModalOpen(false)}>
        <ModalHeader toggle={() => setTrashModalOpen(false)}>
          Trash Image
        </ModalHeader>
        <ModalBody>
          <Alert color="warning" className="mb-0">
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

export default Dashboard;
