import { useState, useEffect } from "react";
import { Login } from "./pages/Login";
import { Home } from "./pages/Home";
import { Profile } from "./pages/Profile";
import { NotFound } from "./pages/NotFound";
import { UserProvider } from "./lib/context/user";
import { IdeasProvider } from "./lib/context/ideas";
import { motion, AnimatePresence } from "framer-motion";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import { Toaster } from "sonner";

const validRoutes = ["/", "/login", "/profile"];

function App() {
  const [currentPage, setCurrentPage] = useState("home");

  useEffect(() => {
    const path = window.location.pathname;

    if (!validRoutes.includes(path)) {
      setCurrentPage("404");
      return;
    }

    if (path === "/login") setCurrentPage("login");
    else if (path === "/profile") setCurrentPage("profile");
    else setCurrentPage("home");

    const handlePopState = () => {
      const path = window.location.pathname;

      if (!validRoutes.includes(path)) {
        setCurrentPage("404");
        return;
      }

      if (path === "/login") setCurrentPage("login");
      else if (path === "/profile") setCurrentPage("profile");
      else setCurrentPage("home");
    };

    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []); 

  const navigate = (page) => {
    if (page === "404") {
      setCurrentPage("404");
      return;
    }

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
          {currentPage !== "404" && (
            <Navbar navigate={navigate} currentPage={currentPage} />
          )}

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
                {currentPage === "404" && <NotFound navigate={navigate} />}
              </motion.div>
            </AnimatePresence>
          </main>

          {currentPage !== "404" && <Footer />}

          {/* Sonner Toast Container */}
          <Toaster
            theme="dark"
            visibleToasts={3}
            position="top-right"
            style={{ fontFamily: '"Poppins", sans-serif' }}
          />
        </IdeasProvider>
      </UserProvider>
    </div>
  );
}

export default App;
