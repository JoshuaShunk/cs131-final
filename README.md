# Stadium Seat View Preview

A demo application that showcases how NeRF (Neural Radiance Fields) models can be used to provide interactive 3D previews of stadium seat views before purchasing tickets.

## Overview

This application demonstrates a ticket purchasing flow where users can:

1. Select from available seats in a top-down stadium map
2. Preview a 3D view from their selected seat using NeRF technology
3. Expand the preview to a full-screen immersive view
4. Complete a purchase form to buy the ticket

## Features

- Interactive top-down stadium map for seat selection
- Mini 3D preview in the ticket information panel
- Expandable full-screen immersive view
- Ticket purchasing form with validation
- Responsive design for desktop and mobile

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn

### Installation

1. Clone the repository:
   ```
   git clone https://github.com/yourusername/stadium-seat-view.git
   cd stadium-seat-view
   ```

2. Install dependencies:
   ```
   npm install --legacy-peer-deps
   ```
   Note: We use `--legacy-peer-deps` to handle some dependency conflicts with React 19.

3. Start the development server:
   ```
   npm start
   ```
   The application will start on port 3000 by default. If that port is already in use, you can specify a different port:
   ```
   PORT=3003 npm start
   ```

4. Open your browser and navigate to `http://localhost:3000` (or the port you specified)

5. If you encounter any issues:
   - Make sure all dependencies are installed correctly
   - Check that no other application is using the specified port
   - Look at the console output for specific error messages

## Application Structure

The application is organized as follows:

- `src/App.jsx`: Main application component and state management
- `src/components/StadiumMap.js`: Top-down stadium map with interactive seats
- `src/components/TicketForm.js`: Ticket information and purchase form
- `src/components/MiniSeatView.js`: Compact 3D preview in the ticket form
- `src/components/SeatView.js`: Full-screen immersive 3D view
- `src/utils/modelLoader.js`: Utilities for loading and managing 3D models
- `public/models/`: Directory for storing NeRF models

## Integrating Your NeRF Model

This application is designed to work with a single comprehensive NeRF model of the entire stadium. Here's how to integrate your model:

### Model Format

The application expects a 3D model in a format compatible with Three.js:
- **glTF/GLB** (Recommended): The most efficient format for web-based 3D applications
- **OBJ**: Widely supported but less efficient than glTF
- **FBX**: Supported but may require additional processing

### Integration Steps

1. **Export your NeRF model**:
   - From NeRF Studio: Export as mesh or glTF/GLB
   - From Blender: Export as GLB (File > Export > glTF 2.0)

2. **Place your model in the application**:
   - Create a `models` directory in the `public` folder if it doesn't exist:
     ```
     mkdir -p public/models
     ```
   - Place your exported model file in `public/models/`
   - Rename it to `stadium.glb`

3. **Update seat coordinates**:
   - Open `src/App.jsx`
   - Update the `AVAILABLE_SEATS` array with coordinates that match your stadium model:

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
     // Add more seats with their corresponding coordinates
   ];
   ```

4. **If using Blender coordinates**, use the conversion utility:
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
     // More seats...
   ];
   ```

## User Flow

1. **Select a Seat**: 
   - Users start by viewing a top-down map of the stadium
   - Available seats are shown as blue circles
   - Users click on a seat to select it (turns red)

2. **Preview the View**:
   - When a seat is selected, the ticket information panel shows seat details
   - A mini 3D preview shows the view from that seat
   - Users can click the expand button (⤢) to see a full-screen view

3. **Explore in Full-Screen**:
   - The full-screen view replaces the stadium map
   - Users can look around and zoom to explore the view
   - A close button (×) returns to the stadium map

4. **Complete Purchase**:
   - Users fill out the ticket form with their information
   - Form validation ensures all required fields are completed
   - After purchase, a confirmation screen is shown

## Customization

### Stadium Layout

You can customize the top-down stadium map by modifying the `Stadium` component in `src/components/StadiumMap.js`.

### Seat Positions

Update the `AVAILABLE_SEATS` array in `src/App.jsx` with your seat data and coordinates.

### Model Transformations

If your stadium model needs specific transformations, you can modify the `StadiumModel` component in `src/components/SeatView.js`:

```jsx
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

### Camera Positioning

You can customize how the camera is positioned at each seat by modifying the `positionCameraAtSeat` function in `src/utils/modelLoader.js`.

## Troubleshooting

### Model Not Loading

- Check that your model file is correctly named `stadium.glb` and placed in `public/models/`
- Verify that the model format is supported by Three.js
- Check the browser console for specific error messages

### Incorrect View

- Verify that the seat coordinates match the positions in your stadium model
- If using Blender coordinates, make sure you're using the conversion utility
- Adjust the camera position and rotation in the `positionCameraAtSeat` function

### Dependency Issues

If you encounter dependency issues during installation:
```
npm install --legacy-peer-deps
```

### Port Already in Use

If port 3000 is already in use, specify a different port:
```
PORT=3003 npm start
```

### Application Not Starting

If the application fails to start:
1. Check that all dependencies are installed correctly:
   ```
   npm install --legacy-peer-deps
   ```
2. Make sure no other application is using the specified port
3. Try clearing the npm cache:
   ```
   npm cache clean --force
   ```
4. Check for errors in the console output

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- This demo was created to showcase the potential of NeRF technology in enhancing the ticket buying experience
- Built with React, Three.js, and React Three Fiber 