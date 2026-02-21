import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import Navbar from "../components/Navbar";
import ParticleBackground from "../components/ParticleBackground";

export default function AppLayout({ children }) {
  const location = useLocation();
  const isLoginPage = location.pathname === "/login";

  // Load Botpress chatbot globally for all logged-in pages (except login)
  useEffect(() => {
    // Don't load chatbot on login page
    if (isLoginPage) {
      return;
    }

    // Check if scripts are already loaded
    if (document.querySelector('script[data-botpress="inject"]')) {
      return;
    }

    // Inject Botpress scripts
    const script1 = document.createElement('script');
    script1.src = "https://cdn.botpress.cloud/webchat/v3.6/inject.js";
    script1.setAttribute('data-botpress', 'inject');
    script1.async = true;
    document.body.appendChild(script1);

    const script2 = document.createElement('script');
    script2.src = "https://files.bpcontent.cloud/2026/02/19/19/20260219191248-SYZNBTI4.js";
    script2.setAttribute('data-botpress', 'config');
    script2.defer = true;
    document.body.appendChild(script2);

    // Add custom styles for the chatbot
    const style = document.createElement('style');
    style.setAttribute('data-botpress', 'styles');
    style.textContent = `
      /* Botpress chatbot always visible styling */
      .bp-webchat-container {
        position: fixed !important;
        bottom: 20px !important;
        right: 20px !important;
        width: 380px !important;
        height: 500px !important;
        border-radius: 16px !important;
        box-shadow: 0 20px 60px -10px rgba(0,0,0,0.3) !important;
        z-index: 1000 !important;
      }
      .bp-webchat-btn {
        display: none !important;
      }
      /* Change bot name to MedLedger */
      .bp-header-title {
        font-size: 0 !important;
      }
      .bp-header-title::after {
        content: 'MedLedger' !important;
        font-size: 16px !important;
        font-weight: 600 !important;
        color: inherit !important;
      }
      .bp-header-subtitle {
        font-size: 0 !important;
      }
      .bp-header-subtitle::after {
        content: 'AI Health Assistant' !important;
        font-size: 12px !important;
        color: inherit !important;
      }
    `;
    document.head.appendChild(style);

    return () => {
      // Cleanup on unmount (logout) - but keep if navigating to login
      if (isLoginPage) {
        const scripts = document.querySelectorAll('script[data-botpress]');
        scripts.forEach(script => {
          if (document.body.contains(script)) {
            document.body.removeChild(script);
          }
        });
        const styles = document.querySelector('style[data-botpress]');
        if (styles && document.head.contains(styles)) {
          document.head.removeChild(styles);
        }
      }
    };
  }, [isLoginPage]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-slate-50 to-indigo-50/30">
      {/* Interactive Particle Background */}
      <ParticleBackground />
      
      {/* Background Pattern */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-radial from-indigo-100/40 via-transparent to-transparent"></div>
        <div className="absolute bottom-0 right-0 w-full h-full bg-gradient-radial from-teal-100/30 via-transparent to-transparent"></div>
      </div>
      
      <Navbar />
      <main className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">{children}</main>
    </div>
  );
}
