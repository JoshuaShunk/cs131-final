# Integrating Your NeRF Stadium Model

This guide provides detailed instructions on how to integrate your NeRF (Neural Radiance Fields) stadium model into the Seat View application.

## Overview

The application is designed to work with a single comprehensive 3D model of the entire stadium exported from NeRF Studio or Blender. The application positions the camera at different seat locations within this model to provide an immersive preview of what a customer would see from each specific seat.

## Supported Model Formats

The application supports the following 3D model formats:

- **glTF/GLB** (Recommended): The most efficient format for web-based 3D applications
- **OBJ**: Widely supported but less efficient than glTF
- **FBX**: Supported but may require additional processing

## Directory Structure and File Naming

Place your stadium model file in the following directory with the specified name:

```
public/models/stadium.glb
```

## Creating Your NeRF Stadium Model

### Option 1: Using NeRF Studio

If you're using NeRF Studio to create your model, follow these steps:

1. **Capture Data**: 
   - Collect images or video of the stadium from various angles
   - Ensure good coverage of all areas that will be visible from different seats

2. **Train the NeRF Model**: 
   - Use NeRF Studio to train a model on your captured data
   - Adjust training parameters for optimal quality

3. **Export the Model**:
   - Go to the "Export" tab in NeRF Studio
   - Choose "Mesh Export" or "glTF Export"
   - Configure the export settings (resolution, quality, etc.)
   - Export the model

4. **Place in Application**:
   - Move the exported file to the `public/models/` directory
   - Rename it to `stadium.glb`

### Option 2: Using Blender

If you're using Blender to create or modify your stadium model, follow these steps:

1. **Create or Import the Stadium Model**:
   - Create a 3D model of the stadium in Blender, or
   - Import a NeRF model from NeRF Studio, or
   - Import an existing 3D model of the stadium
   
2. **Set Up Camera Positions**:
   - Create cameras at the positions of each seat
   - Note the coordinates of these cameras for later use
   
3. **Export the Model**:
   - Go to File > Export > glTF 2.0 (.glb/.gltf)
   - Configure the export settings:
     - Format: GLB (Binary) is recommended
     - Include: Check "Selected Objects" if you only want to export specific parts
     - Transform: Apply transforms
     - Geometry: Include all geometry data
     - Animation: Include if you have animations
   - Export the model
   
4. **Place in Application**:
   - Move the exported .glb file to the `public/models/` directory
   - Rename it to `stadium.glb`

## Configuring Seat Coordinates

After adding your stadium model, you need to update the seat coordinates in the application to match the actual seat positions in your model:

1. **Open `src/App.js`**

2. **Update the `AVAILABLE_SEATS` array**:
   ```javascript
   const AVAILABLE_SEATS = [
     { 
       id: 'A1', 
       section: 'A', 
       row: 1, 
       number: 1, 
       price: 150, 
       coordinates: { x: -5, y: 2, z: 10 }
     },
     // Add more seats with their corresponding coordinates
   ];
   ```

3. **If using Blender coordinates**, use the conversion utility:
   ```javascript
   coordinates: convertBlenderToThreeCoordinates({ x: -5, y: -10, z: 2 })
   ```

## Coordinate System Conversion

Blender uses a Z-up coordinate system, while Three.js (used in this application) uses a Y-up system. The application includes a utility function to convert between these systems:

```javascript
// In src/utils/modelLoader.js
export const convertBlenderToThreeCoordinates = (blenderCoords) => {
  return {
    x: blenderCoords.x,
    y: blenderCoords.z, // Blender Z becomes Three.js Y
    z: -blenderCoords.y // Blender Y becomes negative Three.js Z
  };
};
```

## Testing Your Integration

After adding your stadium model and updating the seat coordinates:

1. Start the application: `npm start`
2. Select a seat from the stadium map
3. Click "Preview Seat View"
4. Verify that the model loads and the view is as expected from that seat position

If there are issues:
- Check the browser console for error messages
- Verify that the model file is in the correct location and named correctly
- Check that the seat coordinates are correct
- Try adjusting the model scale or position in the `StadiumModel` component

## Advanced Customization

### Model Transformations

If your stadium model needs specific transformations, you can modify the `StadiumModel` component in `src/components/SeatView.js`:

```javascript
useEffect(() => {
  if (scene) {
    // Scale the model
    scene.scale.set(0.5, 0.5, 0.5);
    
    // Position the model
    scene.position.set(0, -10, 0);
    
    // Rotate the model
    scene.rotation.set(0, Math.PI, 0);
  }
}, [scene]);
```

### Camera Controls

You can customize the camera controls in the `SeatView` component:

```javascript
<OrbitControls 
  enablePan={true}
  enableZoom={true}
  enableRotate={true}
  minDistance={1}
  maxDistance={20}
  // Add more control options here
/>
```

### Camera Positioning

You can customize how the camera is positioned at each seat by modifying the `positionCameraAtSeat` function in `src/utils/modelLoader.js`:

```javascript
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

## Troubleshooting

### Model Not Loading

- Check that the file path is correct (`public/models/stadium.glb`)
- Verify that the model format is supported
- Try a simpler model to test the loading mechanism

### Incorrect View

- Check the seat coordinates
- Verify the coordinate system conversion if using Blender coordinates
- Adjust the camera position and lookAt target in the `positionCameraAtSeat` function

### Performance Issues

- Reduce the complexity of your model (lower polygon count)
- Use compressed textures
- Optimize the model for web viewing (reduce file size)

## Conclusion

By following this guide, you should be able to successfully integrate your NeRF stadium model into the Seat View application. The application will position the camera at different seat locations within your model to provide customers with an accurate preview of what they'll see from each seat. 