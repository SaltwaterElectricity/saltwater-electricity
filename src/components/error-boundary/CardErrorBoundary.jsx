// src/components/common/ErrorBoundary/CardErrorBoundary.jsx
import React from "react";
import { RefreshCcw, AlertCircle } from "lucide-react";
import { logger } from "../../utils/logger";

class CardErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    // Dito mo pwedeng i-log ang error sa isang service gaya ng Sentry/LogRocket
    logger.error("Card Error Logged:", error, errorInfo);
  }

  // RECOVERY LOGIC: Para ma-reset ang error state ng card lang
  handleReset = () => {
    this.setState({ hasError: false });
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center p-8 border-2 border-dashed border-red-100 rounded-[24px] bg-red-50/20 min-h-[300px] transition-all duration-300">
          <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center mb-4">
            <AlertCircle size={20} className="text-red-500" />
          </div>

          <h4 className="text-[10px] font-black text-red-500 uppercase tracking-[0.2em] mb-2">
            Node Sync Error
          </h4>

          <p className="text-[11px] text-slate-400 mb-6 max-w-[180px] leading-relaxed">
            Something went wrong while syncing this device&apos;s data.
          </p>

          <button
            onClick={this.handleReset}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-red-100 rounded-xl text-[9px] font-black text-red-500 hover:bg-red-500 hover:text-white transition-all active:scale-95 shadow-sm"
          >
            <RefreshCcw size={12} />
            RETRY SYNC
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default CardErrorBoundary;
