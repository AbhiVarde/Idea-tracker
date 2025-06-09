import { motion } from "framer-motion";
import { SiAppwrite, SiReact, SiTailwindcss, SiFramer } from "react-icons/si";
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
      className="bg-[#1D1D1D]/50 backdrop-blur-sm sticky bottom-0 w-full"
      initial={{ y: 100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: "easeOut", delay: 0.2 }}
    >
      <div className="max-w-2xl mx-auto px-4 pt-4 pb-6">
        <div className="flex flex-col sm:flex-row items-center justify-center text-md text-gray-400">
          <motion.div
            className="flex items-center flex-wrap gap-3"
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
                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap pointer-events-none">
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
        </div>
      </div>
    </motion.footer>
  );
}

export default Footer;
