// @ts-nocheck
import React, { createContext, useState, useContext, useEffect } from 'react';
import { useGLTF } from '@react-three/drei';
import { getStadiumModelPath } from './modelLoader';
import { ColladaLoader } from 'three/examples/jsm/loaders/ColladaLoader';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { useLoader } from '@react-three/fiber';
import * as THREE from 'three';

// Register the ColladaLoader with useLoader
useLoader.preload(ColladaLoader, '/models/stadium.dae');

// Create a context for sharing model loading state
const ModelContext = createContext({
  model: null,
  isLoading: true,
  error: null,
});

// Provider component that will wrap the application
export const ModelProvider = ({ children, customModelUrl = null }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [model, setModel] = useState(null);
  
  // Helper function to check if a model is valid and has usable geometry
  const isValidModel = (loadedModel) => {
    // For Collada models with no scene property
    if (loadedModel && !loadedModel.scene && isColladaModel(loadedModel)) {
      console.log('[ModelContext] Model appears to be a valid Collada model without scene property');
      
      // For DAE models, check if it has kinematics or dae properties
      if (loadedModel.kinematics || loadedModel.dae) {
        console.log('[ModelContext] DAE model has kinematics or dae property', 
          loadedModel.kinematics ? 'Has kinematics' : 'No kinematics',
          loadedModel.dae ? 'Has dae' : 'No dae'
        );
        
        // Check for geometries or scene
        if (loadedModel.geometries || loadedModel.scene) {
          console.log('[ModelContext] DAE model has geometries or scene', 
            loadedModel.geometries ? `Has ${loadedModel.geometries.length} geometries` : 'No geometries',
            loadedModel.scene ? 'Has scene' : 'No scene'
          );
          return true;
        }
      }
      
      // If this is a Collada model but doesn't have required properties, still
      // return true as we'll try to render it anyway
      return true;
    }
    
    if (!loadedModel || !loadedModel.scene) {
      console.log('[ModelContext] Model is invalid: No scene found');
      return false;
    }
    
    // Check if scene has any meaningful children
    const hasChildren = loadedModel.scene.children && loadedModel.scene.children.length > 0;
    if (!hasChildren) {
      console.log('[ModelContext] Model is invalid: Scene has no children');
      return false;
    }
    
    // Log information about each child in the scene
    if (loadedModel.scene.children) {
      loadedModel.scene.children.forEach((child, index) => {
        console.log(`[ModelContext] Scene child ${index}:`, child.type, child.name,
          child.geometry ? 'Has geometry' : 'No geometry',
          child.children ? `Has ${child.children.length} children` : 'No children'
        );
      });
    }
    
    // Check if any child has geometry (mesh or nested children)
    const hasMeaningfulContent = loadedModel.scene.children.some(child => {
      // Check if it's a mesh with geometry
      if (child.type === 'Mesh' && child.geometry) {
        return true;
      }
      
      // Check if it's a group with children
      if ((child.type === 'Group' || child.type === 'Object3D') && 
          child.children && child.children.length > 0) {
        return true;
      }
      
      return false;
    });
    
    if (!hasMeaningfulContent) {
      console.log('[ModelContext] Model is invalid: No meaningful geometry found');
      return false;
    }
    
    console.log('[ModelContext] Model is valid and has usable geometry');
    return true;
  };
  
  // Helper function to detect if a model is a Collada model
  const isColladaModel = (model) => {
    // Check for null model
    if (!model) {
      return false;
    }
    
    // Log model structure to help with debugging
    if (typeof model === 'object') {
      const keys = Object.keys(model);
      console.log('[ModelContext] Checking if model is Collada:', 
        'Keys:', keys.join(', '),
        'Has dae:', !!model.dae,
        'Has kinematics:', !!model.kinematics,
        'Has geometries:', !!model.geometries
      );
    }
    
    // Collada loader sometimes doesn't use a scene property
    // Instead it directly returns the model structure
    return (
      (model.dae && model.kinematics) || // Check for Collada-specific properties
      (model.geometries && model.materials && model.kinematics) ||
      (model.scene && model.scene.type === 'Scene') ||
      (typeof model.type === 'string' && model.type.includes('Scene'))
    );
  };
  
  // Load the model once when the provider mounts or when customModelUrl changes
  useEffect(() => {
    let isMounted = true;
    setIsLoading(true);
    setError(null);
    
    // Determine which model to load
    const modelPath = customModelUrl || getStadiumModelPath();
    console.log('[ModelContext] Loading model from path:', modelPath);
    
    const loadModel = async () => {
      try {
        // Check if it's a DAE file
        const isDAE = modelPath.toLowerCase().endsWith('.dae');
        let loadedModel = null;
        
        if (isDAE) {
          console.log('[ModelContext] Loading Collada (.dae) model:', modelPath);
          try {
            // First check if the model exists
            const response = await fetch(modelPath);
            if (!response.ok) {
              console.error(`[ModelContext] DAE model file not found: ${modelPath}. Status: ${response.status}`);
              throw new Error(`Failed to fetch DAE model: ${response.status} ${response.statusText}`);
            }
            
            console.log('[ModelContext] DAE model file exists, proceeding with loading');
            console.log('[ModelContext] Content-Type:', response.headers.get('content-type'));
            console.log('[ModelContext] Content-Length:', response.headers.get('content-length'), 'bytes');
            
            // Directly use ColladaLoader for better control
            const loader = new ColladaLoader();
            
            // Load the model with explicit promise handling
            loadedModel = await new Promise((resolve, reject) => {
              loader.load(
                modelPath,
                (result) => {
                  if (result && typeof result === 'object') {
                    console.log('[ModelContext] Collada model loaded successfully, structure:', Object.keys(result).join(', '));
                  } else {
                    console.log('[ModelContext] Collada model loaded but has unexpected structure');
                  }
                  resolve(result);
                },
                (progress) => {
                  if (progress.lengthComputable) {
                    const percent = Math.round((progress.loaded / progress.total) * 100);
                    console.log(`[ModelContext] Loading progress: ${percent}%`);
                  }
                },
                (error) => {
                  console.error('[ModelContext] Error loading Collada model:', error);
                  reject(error);
                }
              );
            });
            
            console.log('[ModelContext] ColladaLoader finished loading');
            
            // For DAE models, adapt the structure to match what's expected
            if (loadedModel) {
              // Check if this is actually a valid Collada model
              if (loadedModel.scene) {
                console.log('[ModelContext] DAE model has a scene property:', loadedModel.scene);
              } else if (loadedModel.dae) {
                console.log('[ModelContext] DAE model has a dae property but no scene - processing');
                // Create a compatible structure
                const scene = new THREE.Scene();
                
                // If we have any meshes or objects, add them to the scene
                if (loadedModel.dae && loadedModel.dae.nodes) {
                  scene.add(loadedModel.dae.nodes);
                }
                
                loadedModel.scene = scene;
              } else {
                console.log('[ModelContext] Unusual DAE model structure -', 
                  'trying to adapt with available properties:', Object.keys(loadedModel).join(', '));
                
                // Try to adapt with whatever we have
                loadedModel.scene = loadedModel.scene || loadedModel;
              }
            }
          } catch (daeError) {
            console.error('[ModelContext] Error loading DAE model:', daeError);
            throw daeError;
          }
        } else {
          // For .glb or .gltf files, use a more robust approach
          console.log('[ModelContext] Loading GLB/GLTF model');
          
          try {
            // Check if the model file exists before loading
            const response = await fetch(modelPath);
            console.log('[ModelContext] Fetch response status:', response.status);
            if (!response.ok) {
              throw new Error(`Failed to fetch model: ${response.status} ${response.statusText}`);
            }
            
            console.log('[ModelContext] Model file exists, proceeding with loading');
            
            // Log the content type and size
            console.log('[ModelContext] Content-Type:', response.headers.get('content-type'));
            console.log('[ModelContext] Content-Length:', response.headers.get('content-length'));
            
            // Get the blob to check size
            const blob = await response.blob();
            console.log('[ModelContext] Model blob size:', blob.size, 'bytes');
            
            // For large files, we might need special handling
            if (blob.size > 10 * 1024 * 1024) { // 10MB
              console.log('[ModelContext] Large model detected (>10MB), using special handling');
            }
            
            // Create a URL for the blob (needed for useGLTF to work with the blob)
            const modelUrl = URL.createObjectURL(blob);
            
            // Load the model using a promise-wrapped useGLTF to handle errors
            loadedModel = await new Promise((resolve, reject) => {
              try {
                // Use GLTFLoader directly for better control
                const gltfLoader = new GLTFLoader();
                gltfLoader.load(
                  modelUrl,
                  (gltf) => {
                    console.log('[ModelContext] GLB model loaded successfully:', gltf);
                    resolve(gltf);
                  },
                  (progress) => {
                    if (progress.lengthComputable) {
                      const percent = Math.round((progress.loaded / progress.total) * 100);
                      console.log(`[ModelContext] Loading progress: ${percent}%`);
                    }
                  },
                  (error) => {
                    console.error('[ModelContext] Error loading GLB model:', error);
                    reject(error);
                  }
                );
              } catch (error) {
                console.error('[ModelContext] Error during GLB model loading:', error);
                reject(error);
              }
            });
            
            // Clean up the blob URL
            URL.revokeObjectURL(modelUrl);
          } catch (error) {
            console.error('[ModelContext] Error during GLB loading process:', error);
            throw error;
          }
        }
        
        // If we get here, we have a loaded model - validate it
        if (loadedModel) {
          console.log('[ModelContext] Model loaded, validating...');
          
          // Check if the model is valid for rendering
          const isValid = isValidModel(loadedModel);
          
          if (isValid) {
            console.log('[ModelContext] Model validation passed');
            if (isMounted) {
              setModel(loadedModel);
              setIsLoading(false);
              setError(null);
            }
          } else {
            console.error('[ModelContext] Model validation failed - using fallback');
            if (isMounted) {
              setError(new Error('Model validation failed - invalid structure'));
              setIsLoading(false);
            }
          }
        } else {
          console.error('[ModelContext] No model was loaded');
          if (isMounted) {
            setError(new Error('No model was loaded'));
            setIsLoading(false);
          }
        }
      } catch (error) {
        console.error('[ModelContext] Error during model loading process:', error);
        if (isMounted) {
          setError(error);
          setIsLoading(false);
        }
      }
    };
    
    loadModel();
    
    // Clean up function
    return () => {
      isMounted = false;
      // Note: We don't call useGLTF.dispose() here because it's not a function
      // Instead, we rely on React Three Fiber's built-in cleanup
      if (model && model.scene) {
        // Clean up textures and materials
        if (model.scene.traverse) {
          model.scene.traverse((obj) => {
            if (obj.isMesh) {
              if (obj.geometry) {
                obj.geometry.dispose();
              }
              if (obj.material) {
                if (obj.material.map) obj.material.map.dispose();
                if (obj.material.lightMap) obj.material.lightMap.dispose();
                if (obj.material.bumpMap) obj.material.bumpMap.dispose();
                if (obj.material.normalMap) obj.material.normalMap.dispose();
                if (obj.material.specularMap) obj.material.specularMap.dispose();
                if (obj.material.envMap) obj.material.envMap.dispose();
                obj.material.dispose();
              }
            }
          });
        }
      }
    };
  }, [customModelUrl]);
  
  // Debug output when model or error changes
  useEffect(() => {
    if (model) {
      console.log('[ModelContext] Model is available in context:', model);
    }
    if (error) {
      console.error('[ModelContext] Error in model context:', error);
    }
  }, [model, error]);
  
  // Value to be provided to consumers
  const value = {
    model,
    isLoading,
    error,
    isCustomModel: !!customModelUrl
  };
  
  return (
    <ModelContext.Provider value={value}>
      {children}
    </ModelContext.Provider>
  );
};

// Custom hook for consuming the context
export const useModel = () => {
  const context = useContext(ModelContext);
  if (!context) {
    throw new Error('useModel must be used within a ModelProvider');
  }
  return context;
};

export default ModelContext; 