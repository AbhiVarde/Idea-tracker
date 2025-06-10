import { useState, useEffect } from "react";
import { Login } from "./pages/Login";
import { Home } from "./pages/Home";
import { Profile } from "./pages/Profile";
import { UserProvider } from "./lib/context/user";
import { IdeasProvider } from "./lib/context/ideas";
import { motion, AnimatePresence } from "framer-motion";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Analytics } from "@vercel/analytics/react";

function App() {
  const [currentPage, setCurrentPage] = useState("home");

  useEffect(() => {
    const path = window.location.pathname;
    if (path === "/login") setCurrentPage("login");
    else if (path === "/profile") setCurrentPage("profile");
    else setCurrentPage("home");

    const handlePopState = () => {
      const path = window.location.pathname;
      if (path === "/login") setCurrentPage("login");
      else if (path === "/profile") setCurrentPage("profile");
      else setCurrentPage("home");
    };

    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  const navigate = (page) => {
    setCurrentPage(page);
    const path = page === "home" ? "/" : `/${page}`;
    window.history.pushState(null, "", path);
  };

  const pageVariants = {
    initial: { opacity: 0, y: 20, scale: 0.98 },
    in: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: { duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] },
    },
    out: {
      opacity: 0,
      y: -20,
      scale: 1.02,
      transition: { duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] },
    },
  };

  return (
    <div className="min-h-screen bg-[#1D1D1D] text-white">
      <UserProvider>
        <IdeasProvider>
          <Analytics />
          <Navbar navigate={navigate} currentPage={currentPage} />
          <main className="container mx-auto px-4 py-8">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentPage}
                initial="initial"
                animate="in"
                exit="out"
                variants={pageVariants}
                className="min-h-[calc(100vh-140px)]"
              >
                {currentPage === "login" && <Login navigate={navigate} />}
                {currentPage === "profile" && <Profile navigate={navigate} />}
                {currentPage === "home" && <Home navigate={navigate} />}
              </motion.div>
            </AnimatePresence>
          </main>
          <Footer />

          {/* Slim Toast Container without custom colors */}
          <ToastContainer
            position="top-right"
            autoClose={4000}
            hideProgressBar={false}
            newestOnTop={false}
            closeOnClick
            rtl={false}
            pauseOnFocusLoss
            draggable
            pauseOnHover
            theme="dark"
            limit={3}
            toastClassName="font-sans !bg-[#2A2A2A] !border !border-gray-700 !rounded-lg !shadow-lg !min-h-[48px] !py-2"
            bodyClassName="font-sans text-white !text-sm !py-1 !px-3"
            progressClassName="!bg-[#FD366E] !h-[2px]"
          />

          {/* Slim Toast Global Styles */}
          <style jsx global>{`
            .Toastify__toast {
              background: #2a2a2a !important;
              border: 1px solid #374151 !important;
              border-radius: 8px !important;
              box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1),
                0 2px 4px -1px rgba(0, 0, 0, 0.06) !important;
              color: white !important;
              min-height: 48px !important;
              padding: 8px 12px !important;
              font-size: 14px !important;
            }

            .Toastify__toast--success {
              border-left: 3px solid #10b981 !important;
            }

            .Toastify__toast--error {
              border-left: 3px solid #ef4444 !important;
            }

            .Toastify__toast--warning {
              border-left: 3px solid #f59e0b !important;
            }

            .Toastify__toast--info {
              border-left: 3px solid #3b82f6 !important;
            }

            .Toastify__toast-body {
              padding: 4px 8px !important;
              margin: 0 !important;
              line-height: 1.4 !important;
            }

            .Toastify__toast-icon {
              width: 16px !important;
              height: 16px !important;
              margin-right: 8px !important;
            }

            .Toastify__progress-bar {
              background: #fd366e !important;
              height: 2px !important;
              border-radius: 0 0 8px 8px !important;
            }

            .Toastify__close-button {
              color: white !important;
              opacity: 0.7 !important;
              width: 16px !important;
              height: 16px !important;
              font-size: 12px !important;
            }

            .Toastify__close-button:hover {
              opacity: 1 !important;
            }

            .Toastify__toast-container {
              width: 320px !important;
            }

            @media screen and (max-width: 480px) {
              .Toastify__toast-container {
                width: 100vw !important;
                padding: 0 1rem !important;
                left: 0 !important;
                margin: 0 !important;
              }

              .Toastify__toast {
                margin-bottom: 8px !important;
                border-radius: 8px !important;
                min-height: 44px !important;
                font-size: 13px !important;
              }
            }
          `}</style>
        </IdeasProvider>
      </UserProvider>
    </div>
  );
}

export default App;
