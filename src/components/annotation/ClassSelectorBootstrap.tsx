import { ButtonGroup, Button } from "reactstrap";
import type { AnnotationClass } from "@/types/annotation";

interface ClassSelectorProps {
  classes: AnnotationClass[];
  activeClassId: number;
  onSelectClass: (id: number) => void;
}

const ClassSelectorBootstrap = ({ classes, activeClassId, onSelectClass }: ClassSelectorProps) => {
  return (
    <div className="mb-2">
      <small className="text-muted d-block mb-1">Class</small>
      <ButtonGroup size="sm">
        {classes.map((cls) => (
          <Button
            key={cls.id}
            outline={cls.id !== activeClassId}
            color={cls.id === activeClassId ? "primary" : "secondary"}
            onClick={() => onSelectClass(cls.id)}
            style={{ fontSize: "0.75rem" }}
          >
            <span
              className="d-inline-block rounded-circle me-1"
              style={{
                width: 8,
                height: 8,
                backgroundColor: cls.hsl,
              }}
            />
            {cls.name}
          </Button>
        ))}
      </ButtonGroup>
    </div>
  );
};

export default ClassSelectorBootstrap;
