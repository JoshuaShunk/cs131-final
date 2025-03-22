// @ts-nocheck
import React, { Suspense, useState, useEffect, useRef } from 'react';
import styled from 'styled-components';
import { Canvas, useFrame, useThree, useLoader } from '@react-three/fiber';
import { Environment, useAnimations } from '@react-three/drei';
import { positionCameraAtSeat } from '../utils/modelLoader';
import { useModel } from '../utils/ModelContext';
import * as THREE from 'three';
import { ColladaLoader } from 'three/examples/jsm/loaders/ColladaLoader';
import { getStadiumModelPath } from '../utils/modelLoader';

// Custom first-person camera controls
const FirstPersonControls = ({ seatCoordinates, mini = true }) => {
  const { camera, gl } = useThree();
  const isDragging = useRef(false);
  const lastMouseX = useRef(0);
  const lastMouseY = useRef(0);
  const rotationX = useRef(0);
  const rotationY = useRef(0);
  
  // Set initial camera position
  useEffect(() => {
    if (camera && seatCoordinates) {
      // Position the camera exactly at the seat coordinates
      camera.position.set(
        seatCoordinates.x || 0,
        seatCoordinates.y || 2,
        seatCoordinates.z || 10
      );
      
      // Look at the center of the stadium initially
      camera.lookAt(0, 0, 0);
    }
  }, [camera, seatCoordinates]);
  
  // Lock camera position on each frame
  useFrame(() => {
    if (camera && seatCoordinates) {
      // Keep the camera position fixed at the exact seat coordinates
      camera.position.set(
        seatCoordinates.x || 0,
        seatCoordinates.y || 2,
        seatCoordinates.z || 10
      );
    }
  });
  
  // Set up mouse event listeners for camera rotation
  useEffect(() => {
    if (!mini) return; // Only add listeners for mini view if needed
    
    const canvas = gl.domElement;
    
    const handleMouseDown = (e) => {
      isDragging.current = true;
      lastMouseX.current = e.clientX;
      lastMouseY.current = e.clientY;
    };
    
    const handleMouseUp = () => {
      isDragging.current = false;
    };
    
    const handleMouseMove = (e) => {
      if (!isDragging.current) return;
      
      // Calculate mouse movement
      const deltaX = e.clientX - lastMouseX.current;
      const deltaY = e.clientY - lastMouseY.current;
      lastMouseX.current = e.clientX;
      lastMouseY.current = e.clientY;
      
      // Update rotation (with sensitivity adjustment)
      const sensitivity = 0.003;
      rotationY.current -= deltaX * sensitivity;
      rotationX.current -= deltaY * sensitivity;
      
      // Limit vertical rotation to avoid flipping
      rotationX.current = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, rotationX.current));
      
      // Apply rotation as quaternion
      camera.quaternion.setFromEuler(
        new THREE.Euler(rotationX.current, rotationY.current, 0, 'YXZ')
      );
    };
    
    // Add event listeners
    canvas.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mouseup', handleMouseUp);
    window.addEventListener('mousemove', handleMouseMove);
    
    // Clean up
    return () => {
      canvas.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, [gl, mini]);
  
  return null;
};

// Stadium NeRF model component - using shared model context
const StadiumModel = ({ seatCoordinates }) => {
  const { model, error, isLoading } = useModel();
  const group = useRef();
  
  console.log('[MiniSeatView] Model status:', { isLoading, hasModel: !!model, hasError: !!error });
  
  // Try to load the DAE model directly if useModel is not working
  const modelPath = getStadiumModelPath();
  const isDAEFile = modelPath.toLowerCase().endsWith('.dae');
  
  console.log('[MiniSeatView] Attempting to load model directly. Path:', modelPath, 'Is DAE:', isDAEFile);
  
  // Use direct loader for DAE files as a fallback - don't try to destructure the result
  const daeModel = isDAEFile ? useLoader(ColladaLoader, modelPath, undefined, (error) => {
    console.error('[MiniSeatView] Error loading DAE model directly:', error);
    return null;
  }) : null;
  
  // Log detailed information about the DAE model if loaded
  useEffect(() => {
    if (daeModel) {
      console.log('[MiniSeatView] DAE model loaded directly:', daeModel);
      console.log('[MiniSeatView] DAE model structure:', 
        Object.keys(daeModel).join(', '), 
        daeModel.scene ? 'Has scene' : 'No scene'
      );
    }
  }, [daeModel]);
  
  // If we have a direct DAE model, use it
  if (isDAEFile && daeModel && (!model || error)) {
    console.log('[MiniSeatView] Using directly loaded DAE model:', daeModel);
    
    // Apply transformations to the DAE model
    useEffect(() => {
      const modelObject = daeModel.scene || daeModel;
      if (modelObject) {
        console.log('[MiniSeatView] Setting up DAE model');
        
        // Scale the model appropriately for DAE files
        // Using a larger scale since we're no longer scaling the camera position
        modelObject.scale.set(10, 10, 10);
        
        // Position the model centered at the origin
        modelObject.position.set(0, -3, 0);
        
        // Add materials to meshes if they appear black or have no material
        modelObject.traverse((child) => {
          if (child.isMesh) {
            console.log('[MiniSeatView] Found mesh in DAE model:', child.name);
            
            // Check if the mesh has a material
            if (!child.material || 
                (child.material.color && child.material.color.r === 0 && 
                 child.material.color.g === 0 && child.material.color.b === 0)) {
              console.log('[MiniSeatView] Applying default material to mesh:', child.name);
              
              // Apply a default material based on the object name or position
              // Create a varied set of colors for different parts
              let color;
              
              if (child.name.toLowerCase().includes('field') || 
                  child.name.toLowerCase().includes('ground') ||
                  child.name.toLowerCase().includes('floor')) {
                // Green for field/ground
                color = new THREE.Color(0x4caf50);
              } else if (child.name.toLowerCase().includes('seat') || 
                         child.name.toLowerCase().includes('chair')) {
                // Blue for seats
                color = new THREE.Color(0x2196f3);
              } else if (child.name.toLowerCase().includes('wall') || 
                         child.name.toLowerCase().includes('structure')) {
                // Light gray for walls/structure
                color = new THREE.Color(0xeceff1);
              } else if (child.position.y > 5) {
                // Light fixtures or overhead elements
                color = new THREE.Color(0xffffff);
              } else {
                // Default color varies by position to add visual interest
                const positionHash = Math.abs(child.position.x + child.position.z) % 5;
                const colors = [
                  0x4caf50, // Green
                  0x2196f3, // Blue
                  0xff9800, // Orange
                  0x9c27b0, // Purple
                  0xf44336  // Red
                ];
                color = new THREE.Color(colors[positionHash]);
              }
              
              // Create a new standard material with the determined color
              child.material = new THREE.MeshStandardMaterial({
                color: color,
                roughness: 0.7,
                metalness: 0.2,
                side: THREE.DoubleSide
              });
            }
            
            // Enable shadows on all meshes
            child.castShadow = true;
            child.receiveShadow = true;
          }
        });
      }
    }, [daeModel]);
    
    return (
      <group ref={group}>
        {/* Render the loaded DAE model */}
        <primitive object={daeModel.scene || daeModel} />
        
        {/* Add additional elements for better visualization */}
        <ambientLight intensity={0.7} />
        <directionalLight position={[10, 10, 5]} intensity={1} castShadow />
        <directionalLight position={[-10, 10, 5]} intensity={0.5} />
        <directionalLight position={[0, 15, 0]} intensity={0.8} castShadow />
        
        {/* Add a circular platform to represent the stadium floor */}
        <mesh position={[0, -3, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
          <circleGeometry args={[150, 64]} />
          <meshStandardMaterial color="#4caf50" />
        </mesh>
      </group>
    );
  }
  
  // If model is still loading, we'll let the parent component show a loading indicator
  if (isLoading) {
    return null;
  }
  
  // If model is null or there's an error, return the fallback model
  if (!model || error) {
    console.log('[MiniSeatView] Using fallback model due to:', error || 'No model available');
    return <FallbackModel />;
  }
  
  // Check if the model is a Collada model (DAE)
  const isColladaModel = !!model.scene && !(model.scene.isObject3D);
  
  // Get animations if available
  const animations = model.scene?.animations || model?.animations || [];
  const { actions } = useAnimations(animations, group);
  
  // Check if the model has actual geometry - if not, use the fallback
  const hasGeometry = isColladaModel ? 
    true : // Collada models are handled differently
    model?.scene?.children?.some(child => 
      child.type === 'Mesh' || 
      child.type === 'Group' || 
      (child.children && child.children.length > 0)
    );
  
  if (!hasGeometry) {
    console.log('[MiniSeatView] Model has no geometry, using fallback model');
    return <FallbackModel />;
  }
  
  // Apply transformations to the model
  useEffect(() => {
    if (model?.scene) {
      console.log('[MiniSeatView] Setting up model scene');
      
      // Scale the model appropriately - use larger scale for better visibility
      model.scene.scale.set(10, 10, 10);
      
      // Position the model centered at the origin
      model.scene.position.set(0, -3, 0);
      
      // Play any animations if they exist
      if (actions && Object.keys(actions).length > 0) {
        const actionName = Object.keys(actions)[0];
        console.log('[MiniSeatView] Playing animation:', actionName);
        actions[actionName]?.play();
      }
    }
  }, [model, actions]);
  
  // Return the loaded model
  return (
    <group ref={group}>
      {/* Render the loaded model */}
      {isColladaModel ? (
        // For Collada models, we need to handle the structure differently
        <primitive object={model.scene} />
      ) : (
        // For GLB/GLTF models, we can clone the scene
        <primitive object={model.scene.clone()} />
      )}
      
      {/* Add additional elements for better visualization */}
      <ambientLight intensity={0.7} />
      <directionalLight position={[10, 10, 5]} intensity={1} castShadow />
      <directionalLight position={[-10, 10, 5]} intensity={0.5} />
      
      {/* Add a circular platform to represent the stadium floor */}
      <mesh position={[0, -3, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <circleGeometry args={[150, 64]} />
        <meshStandardMaterial color="#4caf50" />
      </mesh>
    </group>
  );
};

// Fallback model to use if the stadium model fails to load
const FallbackModel = () => {
  return (
    <group>
      {/* Stadium floor */}
      <mesh position={[0, -3, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <circleGeometry args={[150, 64]} />
        <meshStandardMaterial color="#4caf50" />
      </mesh>
      
      {/* Center court/field */}
      <mesh position={[0, -2.95, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[50, 64]} />
        <meshStandardMaterial color="#8bc34a" />
      </mesh>
      
      {/* Center court lines */}
      <mesh position={[0, -2.9, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[49, 50, 64]} />
        <meshStandardMaterial color="#ffffff" />
      </mesh>
      
      {/* Center marker */}
      <mesh position={[0, -2.85, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[5, 32]} />
        <meshStandardMaterial color="#cddc39" />
      </mesh>
      
      {/* Stadium seating - circular arrangement (simplified for mini view) */}
      {Array.from({ length: 12 }).map((_, i) => {
        const angle = (i * Math.PI) / 6;
        const radius = 100;
        const x = Math.cos(angle) * radius;
        const z = Math.sin(angle) * radius;
        const height = 30;
        const width = 30;
        
        return (
          <group key={`stand-${i}`} position={[x, 10, z]} rotation={[0, -angle + Math.PI / 2, 0]}>
            <mesh castShadow receiveShadow>
              <boxGeometry args={[width, height, 12]} />
              <meshStandardMaterial color="#bbdefb" />
            </mesh>
          </group>
        );
      })}
      
      {/* Stadium lights */}
      {Array.from({ length: 4 }).map((_, i) => {
        const angle = (i * Math.PI) / 2;
        const radius = 120;
        const x = Math.cos(angle) * radius;
        const z = Math.sin(angle) * radius;
        
        return (
          <group key={`light-${i}`} position={[x, 40, z]}>
            <mesh castShadow>
              <boxGeometry args={[8, 8, 8]} />
              <meshStandardMaterial color="#f5f5f5" />
            </mesh>
            <pointLight position={[0, 0, 0]} intensity={1} distance={300} decay={2} castShadow />
          </group>
        );
      })}
      
      {/* Players/objects on the field - for scale reference */}
      <mesh position={[0, 0, 0]} castShadow>
        <sphereGeometry args={[2, 16, 16]} />
        <meshStandardMaterial color="#f44336" />
      </mesh>
      
      {/* Environment ambience */}
      <ambientLight intensity={0.5} />
      <directionalLight position={[10, 20, 10]} intensity={0.8} castShadow />
      <fog attach="fog" args={['#e0f7fa', 100, 350]} />
    </group>
  );
};

const MiniSeatView = ({ seatCoordinates, seat, mini = true }) => {
  const { isLoading, error } = useModel();
  
  return (
    <ViewContainer $mini={mini}>
      {isLoading ? (
        <LoadingOverlay>
          <LoadingSpinner />
        </LoadingOverlay>
      ) : (
        <Canvas 
          key={`mini-view-${seatCoordinates?.x}-${seatCoordinates?.y}-${seatCoordinates?.z}`} 
          camera={{ 
            position: [
              seatCoordinates?.x || 0, 
              seatCoordinates?.y || 2, 
              seatCoordinates?.z || 10
            ], 
            fov: 75 
          }}
          onCreated={({ gl }) => {
            gl.domElement.style.touchAction = 'none';
          }}
        >
          <ambientLight intensity={0.5} />
          <pointLight position={[10, 10, 10]} intensity={1} />
          <Suspense fallback={null}>
            <StadiumModel seatCoordinates={seatCoordinates} />
            <Environment preset="sunset" />
          </Suspense>
          <FirstPersonControls seatCoordinates={seatCoordinates} mini={mini} />
        </Canvas>
      )}
      
      {error && (
        <ErrorOverlay>
          <ErrorMessage>
            Could not load view
          </ErrorMessage>
        </ErrorOverlay>
      )}
    </ViewContainer>
  );
};

const ViewContainer = styled.div`
  height: ${props => props.$mini ? '100%' : '100%'};
  width: 100%;
  position: relative;
  background-color: #f5f5f5;
`;

const LoadingOverlay = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background-color: rgba(255, 255, 255, 0.9);
  z-index: 10;
`;

const LoadingSpinner = styled.div`
  width: 30px;
  height: 30px;
  border: 3px solid #f3f3f3;
  border-top: 3px solid #1976d2;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;

const ErrorOverlay = styled.div`
  position: absolute;
  bottom: 10px;
  left: 0;
  right: 0;
  display: flex;
  justify-content: center;
  pointer-events: none;
`;

const ErrorMessage = styled.div`
  background-color: rgba(244, 67, 54, 0.8);
  color: white;
  padding: 5px 10px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 500;
`;

export default MiniSeatView; 