import React, { forwardRef, useRef, Suspense } from 'react';
import { motion, useTransform, useSpring, useMotionValueEvent } from 'framer-motion';
import { Canvas } from '@react-three/fiber';
import { useGLTF, Environment } from '@react-three/drei';
import * as THREE from 'three';

const PinModelGLB = ({ modelPath }) => {
    const { scene } = useGLTF(modelPath);
    const cloned = React.useMemo(() => scene.clone(), [scene]);
    return <primitive object={cloned} scale={[1, 1, 1]} />;
};

const AnimatedPin3D = ({ rotateX, rotateZ, rotateY, modelPath }) => {
    const group = useRef();
    
    useMotionValueEvent(rotateX, "change", (latest) => {
        if (group.current) group.current.rotation.x = THREE.MathUtils.degToRad(latest);
    });
    useMotionValueEvent(rotateY, "change", (latest) => {
        if (group.current) group.current.rotation.y = THREE.MathUtils.degToRad(latest);
    });
    useMotionValueEvent(rotateZ, "change", (latest) => {
        if (group.current) group.current.rotation.z = THREE.MathUtils.degToRad(latest);
    });

    return (
        <group>
  {/* Pin head */}
  <mesh position={[0, 0.3, 0]}>
    <sphereGeometry args={[0.25, 32, 32]} />
    <meshStandardMaterial color="red" metalness={0.3} roughness={0.2} />
  </mesh>

  {/* Needle */}
  <mesh rotation={[0, 0, Math.PI / 6]}>
    <cylinderGeometry args={[0.03, 0.03, 1.2, 16]} />
    <meshStandardMaterial color="silver" metalness={1} roughness={0.2} />
  </mesh>
</group>
    );
};

const PinCard = forwardRef(({ item, scrollY, index, scrollRef, onCenterInView }, ref) => {
  const smoothScroll = useSpring(scrollY, { damping: 20, stiffness: 100 });
  
  const pinRotateZ = useTransform(smoothScroll, v => Math.sin((v + item.position.y) / 200) * 20); 
  const pinRotateY = useTransform(smoothScroll, v => Math.cos((v + item.position.y) / 150) * 20);
  const pinRotateX = useTransform(smoothScroll, v => 15 + Math.cos((v + item.position.y) / 150) * 15);

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, scale: 0.8, y: 50, rotate: item.rotation }}
      animate={{ opacity: 1, scale: 1, y: 0, rotate: item.rotation }}
      transition={{ duration: 0.6, type: 'spring' }}
      // Trigger the thread drawing only when this card approaches the center of the scroll container
      onViewportEnter={() => onCenterInView(index)}
      viewport={{ root: scrollRef, margin: "-40% 0px -40% 0px", once: true }}
      className="absolute bg-[#e6d5b8] p-4 shadow-2xl border-8 border-white group hover:scale-[1.02] transition-transform cursor-pointer z-10"
      style={{
        left: item.position.x,
        top: item.position.y,
        width: '320px',
      }}
    >
      <div className="absolute -top-10 left-1/2 -translate-x-1/2 w-20 h-20 z-[60] pointer-events-none drop-shadow-2xl">
          <Canvas camera={{ position: [0, 0, 2.2], fov: 60 }}>
              {/* Ensure standard lighting is adequate alongside the Environment map */}
              <ambientLight intensity={0.4} />
<directionalLight position={[5, 5, 5]} intensity={2.5} />
<directionalLight position={[-5, -3, 2]} intensity={1.5} />
              <AnimatedPin3D 
                  rotateX={pinRotateX} 
                  rotateZ={pinRotateZ} 
                  rotateY={pinRotateY} 
                  modelPath="/assets/model.glb" 
              />
          </Canvas>
      </div>
      
      {item.image_url && (
        <div className="relative w-full h-44 mb-3 overflow-hidden border border-gray-300">
           <img src={item.image_url} alt={item.title} className="w-full h-full object-cover grayscale-[40%] group-hover:grayscale-0 transition-all duration-500" />
           <div className="absolute inset-0 bg-red-900/10 mix-blend-overlay"></div>
        </div>
      )}
      <h3 className="font-bold text-xl text-black mb-1 font-serif uppercase tracking-wider">{item.title}</h3>
      <div className="w-full h-[1px] bg-red-800/30 mb-2"></div>
      <p className="text-gray-800 text-sm font-mono leading-relaxed line-clamp-4">{item.content}</p>
      
      <div className="mt-4 flex items-center justify-between text-xs font-mono text-gray-500">
         <span className="bg-red-100 text-red-800 px-2 py-0.5 rounded">{item.author}</span>
         <span>{new Date(item.created_at).toLocaleDateString('en-US', { year: '2-digit', month: '2-digit', day: '2-digit' })}</span>
      </div>
    </motion.div>
  );
});

export default PinCard;
