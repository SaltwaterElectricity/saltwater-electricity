/**
 * RegistrationSuccess
 * A clean, high-impact overlay to confirm device pairing.
 */
const RegistrationSuccess = ({ deviceName, onGoToDashboard }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-white/80 backdrop-blur-md animate-in fade-in duration-300">
      <div className="w-full max-w-md p-8 bg-white border border-gray-100 shadow-2xl rounded-3xl text-center animate-in zoom-in-95 duration-500">
        
        {/* Animated Check Icon */}
        <div className="relative mx-auto w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-6">
          <div className="absolute inset-0 rounded-full bg-green-100 animate-ping opacity-20" />
          <svg 
            className="w-10 h-10 text-green-600" 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
          </svg>
        </div>

        <h2 className="text-2xl font-black text-gray-900 mb-2">
          Setup Complete!
        </h2>
        
        <p className="text-gray-500 mb-8 leading-relaxed">
          Your device <span className="font-bold text-blue-600">"{deviceName}"</span> is now linked to your account and transmitting data.
        </p>

        {/* Action Button */}
        <button
          onClick={onGoToDashboard}
          className="w-full py-4 bg-gray-900 text-white rounded-2xl font-bold text-lg hover:bg-black transition-all active:scale-95 shadow-lg shadow-gray-200"
        >
          Open Dashboard
        </button>

        <p className="mt-6 text-xs text-gray-400 font-medium uppercase tracking-widest">
          Hardware Securely Synced
        </p>
      </div>
    </div>
  );
};

export default RegistrationSuccess;