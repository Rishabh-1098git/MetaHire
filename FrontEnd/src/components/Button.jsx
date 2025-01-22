import { motion } from "framer-motion";

const Button = ({ text, onClick }) => (
  <motion.button
    whileHover={{ scale: 1.1 }}
    whileTap={{ scale: 0.9 }}
    className="px-6 py-3 bg-primary text-white rounded-lg shadow-custom-glow hover:bg-secondary transition-all"
    onClick={onClick}
  >
    {text}
  </motion.button>
);
