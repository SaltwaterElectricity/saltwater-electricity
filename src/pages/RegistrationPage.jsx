import { useState } from 'react';
import { createPortal } from 'react-dom'; // Rule 1: Portals
import { useNavigate } from 'react-router-dom'; // Rule 2: SPA Navigation
import { useAvailableDevices } from '../hooks/useAvailableDevices';
import { useDeviceRegistration } from '../hooks/useDeviceRegistration';
import UserRegistrationForm from '../components/Registration/UserRegistrationForm';
import DiscoveryCard from '../components/UI/DiscoveryCard';

const RegistrationPage = () => {
  const navigate = useNavigate();
  const [selectedDevice, setSelectedDevice] = useState(null);
  const [isSuccess, setIsSuccess] = useState(false);
  
  const { devices, loading: fetchingDevices } = useAvailableDevices();
  const { register, loading: isRegistering, error: regError } = useDeviceRegistration();

  const handleCloseModal = () => {
    if (isRegistering) return;
    setSelectedDevice(null);
    setIsSuccess(false);
  };

  const handleDashboardRedirect = () => {
    navigate('/dashboard'); // Clean SPA navigation
  };

  return (
    <div className="relative min-h-screen bg-gray-50 selection:bg-blue-100">
      
      {/* MAIN CONTENT */}
      <main className={`container mx-auto p-4 md:p-10 transition-all duration-500 ${
        selectedDevice ? 'blur-md scale-95 opacity-50 pointer-events-none' : 'blur-0'
      }`}>
        <header className="mb-8 text-center pt-4">
          <h1 className="text-3xl sm:text-4xl md:text-6xl font-black text-gray-900 tracking-tight mb-2">
            Device Discovery
          </h1>
          <p className="text-gray-500 text-sm md:text-lg font-medium">Select hardware to begin setup.</p>
        </header>

        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-8">
          {devices.map(device => (
            <DiscoveryCard 
              key={device.id} 
              device={device} 
              onSelect={setSelectedDevice} 
            />
          ))}
        </section>
      </main>

      {/* MODAL - Rendered via Portal for CSS safety */}
      {selectedDevice && createPortal(
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-0 sm:p-4 bg-gray-900/60 backdrop-blur-md">
          <div 
            className="bg-white w-full max-w-[600px] h-full sm:h-auto sm:max-h-[90vh] flex flex-col rounded-none sm:rounded-[2.5rem] shadow-2xl overflow-hidden animate-in slide-in-from-bottom-10 duration-500"
            role="dialog"
            aria-modal="true"
          >
            <div className="flex flex-col h-full w-full overflow-hidden rounded-none sm:rounded-[2.5rem]">
              {/* Header */}
              <div className="flex items-center justify-between p-6 md:p-8 border-b border-gray-100 bg-white">
                <div>
                  <h2 className="text-2xl md:text-3xl font-black text-gray-900">Registering Device and User</h2>
                </div>
                
                {!isSuccess && !isRegistering && (
                  <button 
                    onClick={handleCloseModal}
                    aria-label="Close modal"
                    className="p-2 bg-gray-100 text-gray-500 rounded-full hover:bg-red-50 hover:text-red-500 transition-all"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                )}
              </div>

              {/* Body */}
              <div className="flex-1 overflow-y-auto p-6 md:p-8 scroll-smooth custom-scrollbar relative z-0">
                {!isSuccess ? (
                  <>
                    <div className="mb-6 p-4 bg-gray-50 rounded-xl border border-gray-100">
                      <p className="text-gray-400 text-[10px] font-bold uppercase tracking-widest">Target Hardware</p>
                      <p className="text-gray-900 font-black truncate">{selectedDevice.deviceName || 'IoT Node'}</p>
                    </div>

                    <UserRegistrationForm 
                      selectedDevice={selectedDevice}
                      register={register}
                      loading={isRegistering}
                      error={regError}
                      onSuccess={() => setIsSuccess(true)}
                    />
                  </>
                ) : (
                  <div className="text-center py-10 space-y-6">
                    <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto animate-bounce">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <h2 className="text-3xl font-black text-gray-900">Linked Successfully!</h2>
                    <button 
                      onClick={handleDashboardRedirect}
                      className="w-full py-5 bg-blue-600 text-white rounded-2xl font-black text-xl hover:bg-blue-700 transition-all active:scale-95 shadow-xl shadow-blue-100"
                    >
                      ENTER DASHBOARD
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
};

export default RegistrationPage;