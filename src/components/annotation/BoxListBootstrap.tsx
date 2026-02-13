import { ListGroup, ListGroupItem, Button } from "reactstrap";
import type { BoundingBox, AnnotationClass } from "@/types/annotation";

interface BoxListProps {
  boxes: BoundingBox[];
  classes: AnnotationClass[];
  selectedBoxId: string | null;
  onSelectBox: (id: string | null) => void;
  onDeleteBox: (id: string) => void;
}

const BoxListBootstrap = ({ boxes, classes, selectedBoxId, onSelectBox, onDeleteBox }: BoxListProps) => {
  if (boxes.length === 0) {
    return <p className="text-muted small mt-2">Draw bounding boxes on the image</p>;
  }

  return (
    <div className="mt-2">
      <small className="text-muted">Annotations ({boxes.length})</small>
      <ListGroup flush className="mt-1" style={{ maxHeight: 200, overflowY: "auto" }}>
        {boxes.map((box, i) => {
          const cls = classes.find((c) => c.id === box.classId);
          return (
            <ListGroupItem
              key={box.id}
              active={box.id === selectedBoxId}
              action
              onClick={() => onSelectBox(box.id)}
              className="d-flex align-items-center py-1 px-2"
              style={{ fontSize: "0.75rem", cursor: "pointer" }}
            >
              <span
                className="d-inline-block rounded-circle me-2 flex-shrink-0"
                style={{ width: 8, height: 8, backgroundColor: cls?.hsl || "#666" }}
              />
              <span className="font-monospace flex-grow-1 text-truncate">
                {cls?.name || "?"} #{i + 1}
              </span>
              <Button
                size="sm"
                color="link"
                className="text-danger p-0 ms-1"
                onClick={(e) => { e.stopPropagation(); onDeleteBox(box.id); }}
              >
                ×
              </Button>
            </ListGroupItem>
          );
        })}
      </ListGroup>
    </div>
  );
};

export default BoxListBootstrap;
