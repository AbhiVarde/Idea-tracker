import { motion } from "framer-motion";
import {
  SiAppwrite,
  SiReact,
  SiTailwindcss,
  SiFramer,
  SiGithub,
} from "react-icons/si";
import { ExternalLink } from "lucide-react";

function Footer() {
  const techStack = [
    {
      name: "Appwrite",
      icon: <SiAppwrite className="w-5 h-5" style={{ color: "#FD366E" }} />,
      url: "https://appwrite.io",
    },
    {
      name: "React",
      icon: <SiReact className="w-5 h-5 text-cyan-400" />,
      url: "https://reactjs.org",
    },
    {
      name: "Tailwind CSS",
      icon: <SiTailwindcss className="w-5 h-5 text-sky-400" />,
      url: "https://tailwindcss.com",
    },
    {
      name: "Framer Motion",
      icon: <SiFramer className="w-5 h-5 text-white" />,
      url: "https://www.framer.com/motion",
    },
  ];

  return (
    <motion.footer
      className="bg-[#000000]/50 backdrop-blur-sm sticky bottom-0 w-full"
      initial={{ y: 100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: "easeOut", delay: 0.2 }}
    >
      <div className="max-w-2xl mx-auto px-4 py-4 sm:py-6">
        {/* Product Hunt Badge Section */}
        <motion.div
          className="flex justify-center mb-4"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <motion.a
            href="https://www.producthunt.com/products/sync-ui-2?utm_source=badge-top-post-badge&utm_medium=badge&utm_souce=badge-sync&#0045;ui&#0045;2"
            target="_blank"
            rel="noopener noreferrer"
            className="group"
            whileHover={{
              scale: 1.05,
              transition: { type: "spring", stiffness: 300, damping: 20 },
            }}
            whileTap={{ scale: 0.95 }}
          >
            <div className="bg-gradient-to-r from-orange-500 to-red-500 rounded-lg p-3 shadow-lg hover:shadow-xl transition-all duration-300">
              <div className="flex items-center space-x-3 text-white">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-white rounded-md flex items-center justify-center">
                    <span className="text-orange-500 font-bold text-lg">
                      🚀
                    </span>
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold truncate">Sync UI</p>
                  <p className="text-xs opacity-90 truncate">
                    Animated UI kit for React devs
                  </p>
                </div>
                <div className="flex-shrink-0">
                  <div className="text-right">
                    <p className="text-xs font-medium">Vote on</p>
                    <p className="text-sm font-bold">Product Hunt</p>
                  </div>
                </div>
              </div>
            </div>
          </motion.a>
        </motion.div>

        {/* Main Footer Content */}
        <div className="flex flex-col lg:flex-row items-center justify-between text-sm text-gray-400 gap-4">
          <motion.div
            className="flex items-center flex-wrap gap-3 justify-center lg:justify-start"
            initial={{ x: -50, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <span>Built with</span>
            {techStack.map((tech) => (
              <motion.a
                key={tech.name}
                href={tech.url}
                target="_blank"
                rel="noopener noreferrer"
                className="group relative"
                whileHover={{
                  scale: 1.15,
                  y: -2,
                  transition: { type: "spring", stiffness: 300, damping: 20 },
                }}
                whileTap={{ scale: 0.95 }}
              >
                <div>{tech.icon}</div>
                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap pointer-events-none z-10">
                  {tech.name}
                </div>
              </motion.a>
            ))}
            <span>by</span>
            <motion.a
              href="https://abhivarde.in"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center space-x-1 text-[#FD366E] transition-colors duration-300 font-medium group"
              whileHover={{
                scale: 1.05,
                transition: { type: "spring", stiffness: 300, damping: 20 },
              }}
              whileTap={{ scale: 0.95 }}
            >
              <span>abhivarde.in</span>
              <ExternalLink className="w-3 h-3 opacity-70 group-hover:opacity-100 transition-opacity duration-300" />
            </motion.a>
          </motion.div>

          <motion.a
            href="https://github.com/AbhiVarde/Idea-tracker"
            target="_blank"
            rel="noopener noreferrer"
            className="group relative hidden sm:block"
            initial={{ x: 50, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.5 }}
            whileHover={{
              scale: 1.15,
              y: -2,
              transition: { type: "spring", stiffness: 300, damping: 20 },
            }}
            whileTap={{ scale: 0.95 }}
          >
            <SiGithub className="w-5 h-5 text-white transition-all duration-300" />
            <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap pointer-events-none z-10">
              View Code
            </div>
          </motion.a>
        </div>
      </div>
    </motion.footer>
  );
}

export default Footer;
