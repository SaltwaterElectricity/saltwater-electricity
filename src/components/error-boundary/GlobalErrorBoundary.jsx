import React from "react";
import { AlertTriangle, Home, RefreshCw } from "lucide-react";

class GlobalErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-8">
          <div className="w-full max-w-md text-center bg-white p-12 rounded-[32px] shadow-xl shadow-slate-200/50 border border-slate-100">
            <div className="w-20 h-20 bg-amber-50 rounded-3xl flex items-center justify-center mx-auto mb-8">
              <AlertTriangle size={40} className="text-amber-500" />
            </div>

            <h1 className="text-2xl font-black text-slate-900 tracking-tighter mb-4">
              System Interruption
            </h1>

            <p className="text-slate-500 text-sm leading-relaxed mb-10">
              The dashboard encountered an unexpected error. Don&apos;t worry, your device data is
              safe.
            </p>

            <div className="flex flex-col gap-3">
              <button
                onClick={() => window.location.reload()}
                className="w-full py-4 bg-blue-600 text-white rounded-2xl font-black text-[11px] tracking-widest uppercase flex items-center justify-center gap-2 hover:bg-blue-700 transition-all active:scale-[0.98]"
              >
                <RefreshCw size={14} />
                Reload Application
              </button>

              <button
                onClick={() => (window.location.href = "/")}
                className="w-full py-4 bg-slate-100 text-slate-600 rounded-2xl font-black text-[11px] tracking-widest uppercase flex items-center justify-center gap-2 hover:bg-slate-200 transition-all"
              >
                <Home size={14} />
                Back to Home
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default GlobalErrorBoundary;
