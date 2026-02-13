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
  assignRandomImage,
  submitImage,
  trashImage,
  seedPool,
  getPoolStats,
  type ImagePoolEntry,
} from "@/services/imageService";
import { getUserTotalCount } from "@/services/statsService";

// Demo seed images — replace these URLs with your actual image folder/API
const DEMO_IMAGES = [
  { url: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=800", filename: "landscape_01.jpg" },
  { url: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=800", filename: "portrait_01.jpg" },
  { url: "https://images.unsplash.com/photo-1517849845537-4d257902454a?w=800", filename: "dog_01.jpg" },
  { url: "https://images.unsplash.com/photo-1518791841217-8f162f1e1131?w=800", filename: "cat_01.jpg" },
  { url: "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=800", filename: "city_01.jpg" },
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

  // Assign an image to the user
  const loadNextImage = useCallback(() => {
    if (!user) return;
    const img = assignRandomImage(user.uuid);
    if (img) {
      setCurrentImage(img);
      setBoxes([]);
      setSelectedBoxId(null);
      setNoImages(false);
    } else {
      setCurrentImage(null);
      setNoImages(true);
    }
    setTotalCount(getUserTotalCount(user.uuid));
  }, [user]);

  useEffect(() => {
    loadNextImage();
  }, [loadNextImage]);

  // Submit annotations
  const handleSubmit = useCallback(() => {
    if (!user || !currentImage) return;
    setSubmitting(true);
    submitImage(currentImage.id, user.uuid, boxes);
    setTimeout(() => {
      setSubmitting(false);
      loadNextImage();
    }, 300);
  }, [user, currentImage, boxes, loadNextImage]);

  // Trash image
  const handleTrash = useCallback(() => {
    if (!user || !currentImage) return;
    trashImage(currentImage.id, user.uuid);
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
    <Container fluid className="py-3">
      <Row>
        {/* Sidebar */}
        <Col md={3} lg={2}>
          <div className="mb-3">
            <small className="text-muted">Your total: </small>
            <Badge color="info">{totalCount}</Badge>
          </div>
          <div className="mb-3">
            <small className="text-muted d-block">Pool: {stats.available} available</small>
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
                Trash (Blurry)
              </Button>
            </div>
          )}
        </Col>

        {/* Canvas */}
        <Col md={9} lg={10}>
          {noImages ? (
            <Alert color="info">
              No images available in the pool. All images have been annotated or trashed.
            </Alert>
          ) : currentImage ? (
            <div style={{ height: "calc(100vh - 120px)" }}>
              <div className="mb-1">
                <small className="text-muted font-monospace">{currentImage.filename}</small>
              </div>
              <AnnotationCanvas
                imageSrc={currentImage.url}
                boxes={boxes}
                activeClassId={activeClassId}
                classes={DEFAULT_CLASSES}
                selectedBoxId={selectedBoxId}
                onBoxesChange={setBoxes}
                onSelectBox={setSelectedBoxId}
              />
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
