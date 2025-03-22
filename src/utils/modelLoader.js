import { useGLTF } from '@react-three/drei';

// Stadium model path
const STADIUM_MODEL_PATH = '/models/stadium.glb';

// Supported 3D model formats
export const SUPPORTED_FORMATS = [
  '.glb',  // Binary glTF
  '.gltf', // JSON glTF
  '.fbx',  // Filmbox
  '.obj',  // Wavefront OBJ
  '.stl',  // Stereolithography
  '.dae'   // Collada
];

// Preload the stadium model to improve performance
export const preloadModels = () => {
  console.log('Preloading model from path:', STADIUM_MODEL_PATH);
  
  // Check if the model file exists before preloading
  fetch(STADIUM_MODEL_PATH)
    .then(response => {
      if (!response.ok) {
        console.error(`Model file not found at ${STADIUM_MODEL_PATH}. Status: ${response.status}`);
        return;
      }
      
      console.log('Model file exists, checking file size...');
      return response.blob().then(blob => {
        console.log(`Model file size: ${blob.size} bytes`);
        
        if (blob.size < 1000) {
          console.warn('Warning: Model file is very small, might be empty or invalid');
        }
        
        // Check if it's a DAE file
        const isDAEFile = STADIUM_MODEL_PATH.toLowerCase().endsWith('.dae');
        
        if (isDAEFile) {
          console.log('DAE model detected - will be loaded with ColladaLoader when needed');
          // We don't preload DAE files as they use a different loader
          return;
        } else {
          // Only preload GLB/GLTF files with useGLTF
          console.log('Model file exists, preloading with useGLTF...');
          useGLTF.preload(STADIUM_MODEL_PATH);
          console.log('Model preloaded successfully');
        }
      });
    })
    .catch(error => {
      console.error('Error checking model file:', error);
    });
};

// Helper function to validate GLB files
export const validateGlbFile = async (file) => {
  try {
    // Check file extension
    const fileExtension = file.name.split('.').pop().toLowerCase();
    const isSupported = SUPPORTED_FORMATS.some(ext => ext.includes(fileExtension));
    if (!isSupported) {
      return {
        valid: false,
        message: `File format .${fileExtension} is not supported. Supported formats: ${SUPPORTED_FORMATS.join(', ')}`
      };
    }
    
    // For GLB files, check the magic bytes
    if (fileExtension === 'glb') {
      const arrayBuffer = await file.arrayBuffer();
      const view = new DataView(arrayBuffer);
      
      // GLB files start with magic "glTF"
      const magic = view.getUint32(0, false);
      if (magic !== 0x676C5446) { // "glTF" in ASCII
        return {
          valid: false,
          message: 'Invalid GLB file: Missing "glTF" magic bytes'
        };
      }
      
      // Check version
      const version = view.getUint32(4, true);
      if (version !== 2) {
        return {
          valid: false,
          message: `Unsupported GLB version: ${version}. Only version 2 is supported.`
        };
      }
      
      // Check file length
      const fileLength = view.getUint32(8, true);
      if (fileLength > arrayBuffer.byteLength) {
        return {
          valid: false,
          message: `Invalid GLB file: Expected length ${fileLength} exceeds actual size ${arrayBuffer.byteLength}`
        };
      }
      
      // Check for JSON chunk
      const chunkType = view.getUint32(16, true);
      if (chunkType !== 0x4E4F534A) { // "JSON" in ASCII
        return {
          valid: false,
          message: 'Invalid GLB file: Missing JSON chunk'
        };
      }
      
      return {
        valid: true,
        message: 'GLB file appears to be valid'
      };
    }
    
    // For other formats, just return true (we can't validate them easily)
    return {
      valid: true,
      message: `${fileExtension.toUpperCase()} file format detected`
    };
  } catch (error) {
    return {
      valid: false,
      message: `Error validating file: ${error.message}`
    };
  }
};

// Helper function to position the camera at a specific seat
export const positionCameraAtSeat = (camera, seatCoordinates) => {
  if (!camera || !seatCoordinates) return;
  
  // Set camera position to the seat coordinates
  camera.position.set(
    seatCoordinates.x || 0,
    seatCoordinates.y || 2,
    seatCoordinates.z || 10
  );
  
  // You can also set the camera's lookAt target
  // For example, to look at the center of the stadium
  camera.lookAt(0, 0, 0);
};

// Helper function to convert Blender coordinates to Three.js coordinates
// Blender uses Z-up, while Three.js uses Y-up
export const convertBlenderToThreeCoordinates = (blenderCoords) => {
  return {
    x: blenderCoords.x,
    y: blenderCoords.z, // Blender Z becomes Three.js Y
    z: -blenderCoords.y // Blender Y becomes negative Three.js Z
  };
};

// Helper function to handle model loading errors
export const handleModelError = (error) => {
  console.error('Error loading model:', error);
  return {
    error: true,
    message: 'Failed to load the 3D model. Please try again later.'
  };
};

// Get the stadium model path - now we only use one model for all seats
export const getStadiumModelPath = () => {
  return STADIUM_MODEL_PATH;
};

export default {
  preloadModels,
  positionCameraAtSeat,
  convertBlenderToThreeCoordinates,
  handleModelError,
  getStadiumModelPath
}; 