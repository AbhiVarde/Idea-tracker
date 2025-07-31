import { motion } from "framer-motion";
import {
  SiAppwrite,
  SiReact,
  SiTailwindcss,
  SiFramer,
  SiGithub,
} from "react-icons/si";
import { ExternalLink, Github } from "lucide-react";

function Footer() {
  const techStack = [
    {
      name: "Appwrite",
      icon: <SiAppwrite className="w-5 h-5" style={{ color: "#FD366E" }} />,
      url: "https://appwrite.io",
    },
    {
      name: "Vite",
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="w-5 h-5"
          viewBox="0 0 410 404"
          fill="none"
        >
          <path
            d="M399.641 59.5246L215.643 388.545C211.844 395.338 202.084 395.378 198.228 388.618L10.5817 59.5563C6.38087 52.1896 12.6802 43.2665 21.0281 44.7586L205.223 77.6824C206.398 77.8924 207.601 77.8904 208.776 77.6763L389.119 44.8058C397.439 43.2894 403.768 52.1434 399.641 59.5246Z"
            fill="url(#viteGradient0)"
          />
          <path
            d="M292.965 1.5744L156.801 28.2552C154.563 28.6937 152.906 30.5903 152.771 32.8664L144.395 174.33C144.198 177.662 147.258 180.248 150.51 179.498L188.42 170.749C191.967 169.931 195.172 173.055 194.443 176.622L183.18 231.775C182.422 235.487 185.907 238.661 189.532 237.56L212.947 230.446C216.577 229.344 220.065 232.527 219.297 236.242L201.398 322.875C200.278 328.294 207.486 331.249 210.492 326.603L212.5 323.5L323.454 102.072C325.312 98.3645 322.108 94.137 318.036 94.9228L279.014 102.454C275.347 103.161 272.227 99.746 273.262 96.1583L298.731 7.86689C299.767 4.27314 296.636 0.855181 292.965 1.5744Z"
            fill="url(#viteGradient1)"
          />
          <defs>
            <linearGradient
              id="viteGradient0"
              x1="6.00017"
              y1="32.9999"
              x2="235"
              y2="344"
              gradientUnits="userSpaceOnUse"
            >
              <stop stopColor="#41D1FF" />
              <stop offset="1" stopColor="#BD34FE" />
            </linearGradient>
            <linearGradient
              id="viteGradient1"
              x1="194.651"
              y1="8.81818"
              x2="236.076"
              y2="292.989"
              gradientUnits="userSpaceOnUse"
            >
              <stop stopColor="#FFEA83" />
              <stop offset="0.0833333" stopColor="#FFDD35" />
              <stop offset="1" stopColor="#FFA800" />
            </linearGradient>
          </defs>
        </svg>
      ),
      url: "https://vitejs.dev",
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
      icon: <SiFramer className="w-5 h-5 text-gray-900 dark:text-white" />,
      url: "https://www.framer.com/motion",
    },
    {
      name: "Lingo.dev",
      icon: (
        <img src="/lingo.ico" alt="Lingo" className="w-5 h-5 object-contain" />
      ),
      url: "https://lingo.dev",
    },
  ];

  return (
    <motion.footer
      className="bg-[#FFFFFF]/50 dark:bg-[#000000]/50 backdrop-blur-sm sticky bottom-0 w-full border-t border-gray-200/30 dark:border-gray-800/30"
      initial={{ y: 100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: "easeOut", delay: 0.2 }}
    >
      <div className="max-w-2xl mx-auto px-4 py-4 sm:py-6">
        <motion.div
          className="flex justify-center mb-4"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <motion.a
            href="https://syncui.design"
            target="_blank"
            rel="noopener noreferrer"
            className="group"
            whileHover={{
              scale: 1.03,
              transition: { type: "spring", stiffness: 300, damping: 20 },
            }}
            whileTap={{ scale: 0.97 }}
          >
            <div className="bg-gradient-to-r from-[#FD366E] via-[#FD366E] to-[#FD366E] dark:from-[#FD366E] dark:via-[#FD366E] dark:to-[#FD366E] rounded-xl p-3 shadow-sm hover:shadow-md transition-all duration-300 max-w-sm w-full">
              <div className="flex items-center gap-4 text-white">
                <div className="flex items-center gap-2">
                  <img
                    src="/images/syncui.png"
                    alt="Sync UI"
                    className="w-8 h-8 rounded-md object-contain"
                  />
                  <div className="flex flex-col text-sm flex-1 truncate">
                    <span className="font-semibold truncate">Sync UI</span>
                    <span className="opacity-90 truncate">
                      Animated UI kit for React devs
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-1 text-md text-white">
                  <Github className="w-5 h-5" />
                  <span className="leading-none">60+</span>
                </div>
              </div>
            </div>
          </motion.a>
        </motion.div>

        {/* Main Footer Content */}
        <div className="flex flex-col lg:flex-row items-center justify-between text-sm text-gray-600 dark:text-gray-400 gap-4">
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
                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-900 dark:bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap pointer-events-none z-10">
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
            <SiGithub className="w-5 h-5 text-gray-700 dark:text-white transition-all duration-300" />
            <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-900 dark:bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap pointer-events-none z-10">
              View Code
            </div>
          </motion.a>
        </div>
      </div>
    </motion.footer>
  );
}

export default Footer;
