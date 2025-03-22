# NeRF Model Integration Guide

This guide provides detailed instructions on how to integrate your NeRF (Neural Radiance Fields) stadium model into the Seat View Preview application.

## Overview

The application uses a single comprehensive 3D model of the entire stadium and positions the camera at different seat locations to provide views from each seat. This approach is more efficient than having separate models for each section or seat.

## Step 1: Create Your NeRF Model

### Option A: Using NeRF Studio

1. **Capture Data**:
   - Collect images or video of the stadium from various angles
   - Ensure good coverage of all areas that will be visible from different seats
   - Higher quality and more comprehensive data will result in better models

2. **Train Your NeRF Model**:
   - Import your data into NeRF Studio
   - Configure training parameters (resolution, quality, etc.)
   - Train the model until you achieve satisfactory quality

3. **Export the Model**:
   - In NeRF Studio, go to the "Export" tab
   - Choose "Mesh Export" or "glTF Export" option
   - Configure export settings:
     - Resolution: Higher for better quality, lower for better performance
     - Format: GLB is recommended for web applications
   - Export the model

### Option B: Using Blender

If you already have a 3D model of the stadium or want to create one manually:

1. **Create or Import the Stadium Model**:
   - Create a 3D model of the stadium in Blender, or
   - Import an existing 3D model, or
   - Import a NeRF model from NeRF Studio

2. **Set Up Camera Positions**:
   - Create cameras at the positions of each seat
   - Use Blender's camera tools to position them accurately
   - Note the coordinates of these cameras for later use

3. **Export the Model**:
   - Go to File > Export > glTF 2.0 (.glb/.gltf)
   - Configure export settings:
     - Format: GLB (Binary) is recommended
     - Include: Check "Selected Objects" if you only want to export specific parts
     - Transform: Apply transforms
     - Geometry: Include all geometry data
     - Animation: Include if you have animations
   - Export the model

## Step 2: Add Your Model to the Application

1. **Create the Models Directory**:
   ```bash
   mkdir -p public/models
   ```

2. **Place Your Model File**:
   - Move your exported GLB file to the `public/models/` directory
   - Rename it to `stadium.glb`

## Step 3: Configure Seat Coordinates

The application needs to know where to position the camera for each seat view. You'll need to update the `AVAILABLE_SEATS` array in `src/App.jsx`:

### If Using Three.js Coordinates:

```jsx
const AVAILABLE_SEATS = [
  { 
    id: 'A1', 
    section: 'A', 
    row: 1, 
    number: 1, 
    price: 150, 
    coordinates: { x: -5, y: 2, z: 10 }
  },
  { 
    id: 'A2', 
    section: 'A', 
    row: 1, 
    number: 2, 
    price: 150, 
    coordinates: { x: -3, y: 2, z: 10 } 
  },
  // Add more seats with their corresponding coordinates
];
```

### If Using Blender Coordinates:

Blender uses a Z-up coordinate system, while Three.js (used in this application) uses a Y-up system. The application includes a utility function to convert between these systems:

```jsx
import { convertBlenderToThreeCoordinates } from './utils/modelLoader';

const AVAILABLE_SEATS = [
  { 
    id: 'A1', 
    section: 'A', 
    row: 1, 
    number: 1, 
    price: 150, 
    coordinates: convertBlenderToThreeCoordinates({ x: -5, y: -10, z: 2 })
  },
  // Add more seats with their corresponding coordinates
];
```

## Step 4: Customize Model Rendering (Optional)

If your model needs specific transformations or adjustments, you can modify the `StadiumModel` component in `src/components/SeatView.js`:

### Scaling the Model:

```jsx
useEffect(() => {
  if (scene) {
    // Make the model smaller or larger
    scene.scale.set(0.5, 0.5, 0.5);
  }
}, [scene]);
```

### Positioning the Model:

```jsx
useEffect(() => {
  if (scene) {
    // Adjust the position of the model
    scene.position.set(0, -10, 0);
  }
}, [scene]);
```

### Rotating the Model:

```jsx
useEffect(() => {
  if (scene) {
    // Rotate the model if needed
    scene.rotation.set(0, Math.PI, 0); // 180-degree rotation around Y axis
  }
}, [scene]);
```

## Step 5: Customize Camera Positioning (Optional)

You can customize how the camera is positioned at each seat by modifying the `positionCameraAtSeat` function in `src/utils/modelLoader.js`:

```jsx
export const positionCameraAtSeat = (camera, seatCoordinates) => {
  if (!camera || !seatCoordinates) return;
  
  // Set camera position to the seat coordinates
  camera.position.set(
    seatCoordinates.x || 0,
    seatCoordinates.y || 2,
    seatCoordinates.z || 10
  );
  
  // Set where the camera is looking
  // For example, to look at the center of the field
  camera.lookAt(0, 0, 0);
  
  // Or to look in a specific direction
  // camera.rotation.set(0, Math.PI / 4, 0);
};
```

## Step 6: Test Your Integration

1. Start the application:
   ```bash
   npm start
   ```

2. Select a seat from the stadium map

3. Check the mini 3D preview in the ticket form

4. Click the expand button to see the full-screen view

5. Verify that the view is correct and the model loads properly

## Troubleshooting

### Model Not Loading

- Check that your model file is correctly named `stadium.glb` and placed in `public/models/`
- Verify that the model format is supported by Three.js
- Try a simpler model to test the loading mechanism
- Check the browser console for specific error messages

### Incorrect View

- Verify that the seat coordinates match the positions in your stadium model
- If using Blender coordinates, make sure you're using the conversion utility
- Adjust the camera position and rotation in the `positionCameraAtSeat` function

### Performance Issues

- Reduce the complexity of your model (lower polygon count)
- Use compressed textures
- Consider creating a lower-detail version specifically for the web

## Advanced Customization

### Multiple Models for Different Sections

If you want to use different models for different sections of the stadium, you can modify the `getStadiumModelPath` function in `src/utils/modelLoader.js`:

```jsx
export const getStadiumModelPath = (seat) => {
  if (!seat) return '/models/default.glb';
  
  // Use different models for different sections
  switch (seat.section) {
    case 'A':
      return '/models/section_a.glb';
    case 'B':
      return '/models/section_b.glb';
    default:
      return '/models/default.glb';
  }
};
```

Then update the `StadiumModel` component to pass the seat information:

```jsx
const StadiumModel = ({ seatCoordinates, seat }) => {
  const modelPath = getStadiumModelPath(seat);
  // ... rest of the component
};
```

## Conclusion

By following this guide, you should be able to successfully integrate your NeRF stadium model into the Seat View Preview application. The application will position the camera at different seat locations within your model to provide customers with an accurate preview of what they'll see from each seat. 