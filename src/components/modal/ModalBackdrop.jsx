import { memo } from "react";
import { createPortal } from "react-dom";

/**
 * MODAL BACKDROP WRAPPER
 * Purpose: Dims the background, adds a blur effect, and centers the child modal.
 * Uses: createPortal to render at document.body level for global centering.
 */
const ModalBackdrop = ({ children }) => {
  const content = (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 md:p-8 overflow-hidden pointer-events-none">
      {/* 1. The Dimmer & Blur Layer */}
      <div
        className="absolute inset-0 bg-[#001e2f]/80 backdrop-blur-md animate-in fade-in duration-500 pointer-events-auto"
        aria-hidden="true"
      />

      {/* 2. The Content Layer */}
      <div className="relative z-10 flex items-center justify-center w-full h-full pointer-events-none">
        <div className="pointer-events-auto flex justify-center w-full max-w-full">{children}</div>
      </div>
    </div>
  );

  return createPortal(content, document.body);
};
const MemoizedModalBackdrop = memo(ModalBackdrop);
export default MemoizedModalBackdrop;
