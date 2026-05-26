import { memo } from "react";
import { createPortal } from "react-dom";

/**
 * MODAL BACKDROP WRAPPER
 * Purpose: Dims the background with a light glass effect, adds a blur, and centers the child modal.
 * Aligned with 'code2.html' glass-overlay design.
 */
const ModalBackdrop = ({ children }) => {
  const content = (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 md:p-8 overflow-hidden pointer-events-none">
      {/* 1. The Glass Overlay Dimmer (Light/Glassy) */}
      <div
        className="absolute inset-0 bg-[#faf8ff]/70 backdrop-blur-[12px] animate-in fade-in duration-500 pointer-events-auto"
        aria-hidden="true"
      />

      {/* 2. Subtle Background Glows (Decorative from code2.html) */}
      <div className="fixed top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-blue-600/5 blur-[120px] pointer-events-none z-0" />
      <div className="fixed bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-orange-600/5 blur-[120px] pointer-events-none z-0" />

      {/* 3. The Content Layer */}
      <div className="relative z-10 flex items-center justify-center w-full h-full pointer-events-none">
        <div className="pointer-events-auto flex justify-center w-full max-w-full">{children}</div>
      </div>
    </div>
  );

  return createPortal(content, document.body);
};

const MemoizedModalBackdrop = memo(ModalBackdrop);
export default MemoizedModalBackdrop;
