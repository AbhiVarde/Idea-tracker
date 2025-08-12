import { useState, useEffect } from "react";
import { Login } from "./pages/Login";
import { Home } from "./pages/Home";
import { Discover } from "./pages/Discover";
import { Profile } from "./pages/Profile";
import { NotFound } from "./pages/NotFound";
import { UserProvider } from "./lib/context/user";
import { IdeasProvider } from "./lib/context/ideas";
import { ThemeProvider, useTheme } from "./lib/context/theme";
import { motion, AnimatePresence } from "framer-motion";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import { Toaster } from "sonner";

const validRoutes = ["/", "/login", "/profile", "/discover"];

function AppContent() {
  const [currentPage, setCurrentPage] = useState("home");
  const { theme } = useTheme();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const path = window.location.pathname;

    if (!validRoutes.includes(path)) {
      setCurrentPage("404");
      setLoading(false);
      return;
    }

    if (path === "/login") setCurrentPage("login");
    else if (path === "/profile") setCurrentPage("profile");
    else if (path === "/discover") setCurrentPage("discover");
    else setCurrentPage("home");

    const handlePopState = () => {
      const path = window.location.pathname;
      if (!validRoutes.includes(path)) {
        setCurrentPage("404");
        return;
      }

      if (path === "/login") setCurrentPage("login");
      else if (path === "/profile") setCurrentPage("profile");
      else if (path === "/discover") setCurrentPage("discover");
      else setCurrentPage("home");
    };

    window.addEventListener("popstate", handlePopState);

    setLoading(false);

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

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [currentPage]);

  if (loading) {
    return (
      <div
        className="min-h-screen bg-[#f4f4f7] dark:bg-[#000000] flex flex-col items-center justify-center text-gray-900 dark:text-white"
        data-theme={theme}
      >
        <div className="w-6 h-6 border-2 border-[#FD366E]/30 border-t-[#FD366E] rounded-full animate-spin mb-3"></div>
        <p className="text-sm opacity-80">
          Hang tight… warming up your ideas ✨
        </p>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen bg-[#f4f4f7] dark:bg-[#000000] text-gray-900 dark:text-white transition-colors duration-300 flex flex-col"
      data-theme={theme}
    >
      <UserProvider>
        <IdeasProvider>
          {currentPage !== "404" && (
            <Navbar navigate={navigate} currentPage={currentPage} />
          )}

          <main
            className={`flex-grow ${currentPage !== "404" ? "container mx-auto p-4" : ""}`}
          >
            <AnimatePresence mode="wait">
              <motion.div
                key={currentPage}
                initial="initial"
                animate="in"
                exit="out"
                variants={pageVariants}
                className="h-full"
              >
                {currentPage === "login" && <Login navigate={navigate} />}
                {currentPage === "profile" && <Profile navigate={navigate} />}
                {currentPage === "home" && <Home navigate={navigate} />}
                {currentPage === "discover" && <Discover navigate={navigate} />}
                {currentPage === "404" && (
                  <div className="h-full flex items-center justify-center">
                    <NotFound navigate={navigate} />
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          </main>

          {currentPage !== "404" && <Footer />}

          <Toaster
            theme="system"
            visibleToasts={3}
            position="top-right"
            style={{ fontFamily: '"Poppins", sans-serif' }}
          />
        </IdeasProvider>
      </UserProvider>
    </div>
  );
}

function App() {
  return (
    <ThemeProvider>
      <AppContent />
    </ThemeProvider>
  );
}

export default App;
