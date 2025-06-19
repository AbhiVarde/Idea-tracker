import { motion } from "framer-motion";
import { Home, ArrowLeft } from "lucide-react";

export function NotFound({ navigate }) {
  const fadeUpVariants = {
    initial: { opacity: 0, y: 20 },
    animate: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: "easeOut" },
    },
  };

  const staggerContainer = {
    animate: {
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  return (
    <div className="min-h-screen bg-[#000000] flex items-center justify-center px-4">
      <motion.div
        variants={staggerContainer}
        initial="initial"
        animate="animate"
        className="text-center max-w-2xl"
      >
        <motion.div
          variants={fadeUpVariants}
          animate={{
            y: [0, -8, 0],
          }}
          transition={{
            y: {
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut",
            },
          }}
          className="mb-4"
        >
          <h1 className="text-8xl md:text-9xl font-semibold text-[#FD366E] mb-2">
            404
          </h1>
        </motion.div>

        <motion.div variants={fadeUpVariants} className="mb-8">
          <h2 className="text-2xl font-medium text-white mb-3">
            Page Not Found
          </h2>
          <p className="text-gray-400 leading-relaxed">
            The page you're looking for doesn't exist.
          </p>
        </motion.div>

        <motion.div
          variants={fadeUpVariants}
          className="flex flex-col sm:flex-row gap-4 justify-center"
        >
          <motion.button
            onClick={() => navigate?.("home") || (window.location.href = "/")}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="bg-[#FD366E] hover:bg-[#e02d5e] text-white px-6 py-2 rounded-xl font-medium flex items-center justify-center space-x-2 transition-colors duration-200"
          >
            <Home size={18} />
            <span>Home</span>
          </motion.button>

          <motion.button
            onClick={() => window.history.back()}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="border border-gray-600 hover:border-gray-500 text-gray-300 hover:text-white px-6 py-2 rounded-xl font-medium flex items-center justify-center space-x-2 transition-all duration-200"
          >
            <ArrowLeft size={18} />
            <span>Back</span>
          </motion.button>
        </motion.div>
      </motion.div>
    </div>
  );
}
