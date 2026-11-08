import React from "react";
import ProjectPreviewModal from "./ProjectPreviewModal";

export default function WorkDialog({ item, onClose, onSelectNext }) {
  if (!item) return null;
  return (
    <ProjectPreviewModal
      item={item}
      onClose={onClose}
      onSelectNext={onSelectNext}
    />
  );
}
