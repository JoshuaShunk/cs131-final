# Adding Your NeRF Stadium Model

This directory is where you should place your NeRF stadium model for the seat view application.

## Supported Model Formats

The application supports the following 3D model formats:

- **glTF/GLB** (Recommended): The most efficient format for web-based 3D applications
- **OBJ**: Widely supported but less efficient than glTF
- **FBX**: Supported but may require additional processing

## File Naming

Name your stadium model file as:

- `stadium.glb`: The complete stadium model

## Exporting from NeRF Studio

If you're using NeRF Studio, follow these steps to export your model:

1. In NeRF Studio, go to the "Export" tab
2. Select "Mesh Export" or "glTF Export" option
3. Configure the export settings (resolution, quality, etc.)
4. Export the model
5. Place the exported file in this directory and rename it to `stadium.glb`

## Exporting from Blender

If you're using Blender with your NeRF model, follow these steps:

1. Import your NeRF model into Blender
2. Go to File > Export > glTF 2.0 (.glb/.gltf)
3. Configure the export settings:
   - Format: GLB (Binary) is recommended for web applications
   - Include: Check "Selected Objects" if you only want to export specific parts
   - Transform: Apply transforms
   - Geometry: Include all geometry data
   - Animation: Include if you have animations
4. Export the model
5. Place the exported .glb file in this directory and rename it to `stadium.glb`

## Coordinate System

The application uses the Three.js coordinate system (Y-up), while Blender uses Z-up. The application includes a utility function to convert between these coordinate systems.

If your model appears incorrectly oriented, you may need to adjust the transformation in the `StadiumModel` component in `src/components/SeatView.js`.

## Seat Coordinates

The application positions the camera at different locations within the stadium model to simulate views from different seats. Make sure to update the seat coordinates in `src/App.js` to match the actual seat positions in your stadium model.

## Testing Your Model

After adding your model file to this directory, start the application and select a seat to see if your model loads correctly. If there are issues, check the browser console for error messages. 