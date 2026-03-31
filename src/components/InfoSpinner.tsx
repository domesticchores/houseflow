import "./InfoSpinner.tsx.scss";

import React from "react";
import {Spinner} from "reactstrap";

interface InfoSpinnerProps {
  isCentered?: boolean;
  children?: React.ReactNode;
}

const InfoSpinner: React.FC<InfoSpinnerProps> = ({
  children = null,
  isCentered = false,
}) => {
  return (
    <div className={`spinner-container ${isCentered ? "centered" : ""}`}>
      <span className="sr-only">Loading...</span>
      <Spinner size={"sm"} color="primary">
      </Spinner>
      <span className="spinner-text">{children ?? ""}</span>
    </div>
  );
};

export default InfoSpinner;
