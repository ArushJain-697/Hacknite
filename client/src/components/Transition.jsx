// Transition.jsx
import { motion } from 'framer-motion';

const Transition = () => {
  return (
    <motion.div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'black',
        zIndex: 999, 
        pointerEvents: 'none',
      }}
      initial={{ opacity: 0 }}
      // Simplified: Just Fade In -> Fade Out
      animate={{ opacity: [0, 1, 0] }} 
      transition={{
        duration: 1.5, // Shorter total time
        times: [0, 0.5, 1], 
        ease: "easeInOut",
      }}
    />
  );
};

export default Transition;