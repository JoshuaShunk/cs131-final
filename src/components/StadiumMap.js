// @ts-nocheck
import React, { useState, useEffect, Suspense, useRef } from 'react';
import styled from 'styled-components';
import { Canvas, useThree, useFrame } from '@react-three/fiber';
import { OrbitControls, Html, Text } from '@react-three/drei';
import { useModel } from '../utils/ModelContext';

// Background image component - replaces 3D model with a 2D image
const ArenaBackground = () => {
  // Get access to the Three.js renderer size
  const { viewport } = useThree();
  
  return (
    <group>
      {/* The background image is now a standalone div in the HTML overlay */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        backgroundImage: `url(${process.env.PUBLIC_URL}/arena_outline.png)`,
        backgroundSize: 'contain',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        zIndex: -1,
        pointerEvents: 'none'
      }} />
    </group>
  );
};

// Find the coordinate bounds to calculate scaling factors
const calcScalingFactors = (coordinates) => {
  if (!coordinates || coordinates.length === 0) {
    return { xScale: 1, zScale: 1, xOffset: 0, zOffset: 0 };
  }
  
  // Find the min/max of all coordinates
  let minX = Infinity;
  let maxX = -Infinity;
  let minZ = Infinity;
  let maxZ = -Infinity;
  
  coordinates.forEach(coord => {
    minX = Math.min(minX, coord.x);
    maxX = Math.max(maxX, coord.x);
    minZ = Math.min(minZ, coord.z);
    maxZ = Math.max(maxZ, coord.z);
  });
  
  // Calculate width and height of the data
  const width = maxX - minX;
  const height = maxZ - minZ;
  
  // Calculate scaling factors to fit within -10 to 10 range (20 units total)
  const xScale = width > 0 ? 20 / width : 1;
  const zScale = height > 0 ? 20 / height : 1;
  
  // Use the smaller scale to maintain aspect ratio
  const scale = Math.min(xScale, zScale) * 0.95; // 95% to add some margin
  
  // Calculate the center point of the data
  const centerX = (minX + maxX) / 2;
  const centerZ = (minZ + maxZ) / 2;
  
  return { 
    scale, 
    xOffset: -centerX, 
    zOffset: -centerZ 
  };
};

// Enhanced Camera Controls for smoother transitions
const CameraController = ({ target }) => {
  const { camera, controls } = useThree();
  const controlsRef = useRef(null);
  
  // Store reference to the OrbitControls
  useEffect(() => {
    const orbitControls = document.querySelector('.three-orbit-controls');
    if (orbitControls) {
      controlsRef.current = orbitControls.__r3f.instance;
    }
  }, []);
  
  // Handle camera repositioning when target changes
  useEffect(() => {
    if (!target || !Array.isArray(target) || target.length !== 3) return;
    
    // If we have a valid target and controls, update the camera more safely
    const updateCamera = () => {
      if (controlsRef.current) {
        // Update orbit controls target (this is more reliable than changing camera directly)
        controlsRef.current.target.set(target[0], 0, target[2]);
        controlsRef.current.update();
      }
    };
    
    // Defer the camera update to ensure it happens after any other rendering
    setTimeout(updateCamera, 50);
  }, [target]);
  
  return null;
};

// Seat component - positioned relative to transformations
const Seat = ({ position, isSelected, onClick, seatId, uniqueKey, section, row, number, price, transformations }) => {
  const [hovered, setHovered] = useState(false);
  const meshRef = useRef();
  const clickTimeoutRef = useRef(null);
  
  // Apply all transformations (initial scaling + user adjustments)
  const angle = transformations.rotation * (Math.PI / 180); // Convert degrees to radians
  
  // First apply the base scaling and centering
  const basePosition = [
    (position[0] + transformations.baseOffset.x) * transformations.baseScale,
    1, // Fixed height above the model
    (position[2] + transformations.baseOffset.z) * transformations.baseScale
  ];
  
  // Apply the modified flip - keep Z flipped but now preserve X direction
  // This creates a mirror effect along the Z axis (horizontal flip)
  const flippedX = basePosition[0]; // Keep X direction (no flip)
  const flippedZ = -basePosition[2]; // Flip Z (up/down)
  
  // Then apply user transformations (rotation and scale)
  const rotatedX = flippedX * Math.cos(angle) - flippedZ * Math.sin(angle);
  const rotatedZ = flippedX * Math.sin(angle) + flippedZ * Math.cos(angle);
  
  const transformedPosition = [
    rotatedX * transformations.scale + transformations.translateX,
    basePosition[1],
    rotatedZ * transformations.scale + transformations.translateY
  ];
  
  // Larger size for better visibility - increased from 0.2 to 0.35
  const size = 0.35 * transformations.scale;
  
  // Dark blue color for all seats
  const baseColor = "#0d47a1"; // Dark blue
  const seatHeight = isSelected ? 0.3 : hovered ? 0.2 : 0.1;
  
  // More robust click handler with debounce to prevent multiple selections
  const handlePointerDown = (e) => {
    e.stopPropagation();
    
    // Clear any pending click timeout
    if (clickTimeoutRef.current) {
      clearTimeout(clickTimeoutRef.current);
    }
    
    // Set a small timeout to debounce clicks (prevents double clicks)
    clickTimeoutRef.current = setTimeout(() => {
      console.log('Seat clicked:', seatId, 'with unique key:', uniqueKey);
      onClick(uniqueKey);
      clickTimeoutRef.current = null;
    }, 50);
  };
  
  // Hover handlers with debug
  const handlePointerOver = (e) => {
    e.stopPropagation();
    setHovered(true);
    document.body.style.cursor = 'pointer';
  };
  
  const handlePointerOut = (e) => {
    e.stopPropagation();
    setHovered(false);
    document.body.style.cursor = 'auto';
  };
  
  // Clean up timeout on unmount
  useEffect(() => {
    return () => {
      if (clickTimeoutRef.current) {
        clearTimeout(clickTimeoutRef.current);
      }
    };
  }, []);
  
  return (
    <group 
      position={transformedPosition}
      renderOrder={10} // Higher render order to ensure it's drawn after background
    >
      {/* Seat cylinder */}
      <mesh 
        ref={meshRef}
        onPointerDown={handlePointerDown}
        onPointerOver={handlePointerOver}
        onPointerOut={handlePointerOut}
      >
        <cylinderGeometry args={[size, size, seatHeight, 12]} />
        <meshStandardMaterial 
          color={isSelected ? '#f44336' : hovered ? '#2196f3' : baseColor} 
          emissive={isSelected ? '#ff9e80' : hovered ? '#64b5f6' : baseColor}
          emissiveIntensity={isSelected ? 0.5 : hovered ? 0.3 : 0.1}
          metalness={0.3}
          roughness={0.7}
        />
      </mesh>
      
      {/* Only show labels when hovered or selected to avoid clutter */}
      {(isSelected || hovered) && (
        <Text
          position={[0, seatHeight + 0.2, 0]}
          fontSize={0.15 * transformations.scale}
          color="#ffffff"
          anchorX="center"
          anchorY="middle"
          font={undefined}
          outlineWidth={0.03}
          outlineColor={isSelected ? '#d32f2f' : '#0288d1'}
        >
          {seatId}
        </Text>
      )}
      
      {/* Improved seat popup with better positioning and transitions */}
      {(hovered || isSelected) && (
        <Html
          center
          position={[0, seatHeight + 0.4, 0]}
          style={{
            transition: 'all 0.2s ease-in-out',
            opacity: isSelected ? 1 : hovered ? 0.9 : 0,
            transform: `scale(${isSelected ? 1.05 : 1})`,
          }}
          zIndexRange={[100, 101]}
          distanceFactor={4}
        >
          <SeatPopup expanded={isSelected}>
            <div><strong>ID:</strong> {seatId}</div>
            <div><strong>Section:</strong> {section}</div>
            <div><strong>Row:</strong> {row}</div>
            <div><strong>Seat:</strong> {number}</div>
            <div><strong>Price:</strong> ${price}</div>
            {isSelected && (
              <>
                <div><strong>Pos:</strong> ({position[0].toFixed(1)}, {position[2].toFixed(1)})</div>
                <div><strong>Trans:</strong> ({transformedPosition[0].toFixed(1)}, {transformedPosition[2].toFixed(1)})</div>
              </>
            )}
          </SeatPopup>
        </Html>
      )}
    </group>
  );
};

// Storage keys for saved transformations
const STORAGE_KEYS = {
  EDIT_MODE: 'stadium_edit_mode',
  SCALE: 'stadium_scale',
  ROTATION: 'stadium_rotation',
  TRANSLATE_X: 'stadium_translate_x',
  TRANSLATE_Y: 'stadium_translate_y',
};

const StadiumMap = ({ seats, selectedSeat, onSeatSelect }) => {
  // Load saved values from localStorage
  const loadSavedValue = (key, defaultValue) => {
    try {
      const saved = localStorage.getItem(key);
      return saved !== null ? JSON.parse(saved) : defaultValue;
    } catch (e) {
      console.error('Error loading from localStorage:', e);
      return defaultValue;
    }
  };
  
  // State for transformation controls
  const [editMode, setEditMode] = useState(() => 
    loadSavedValue(STORAGE_KEYS.EDIT_MODE, true)
  );
  
  const [transformations, setTransformations] = useState({
    scale: loadSavedValue(STORAGE_KEYS.SCALE, 1.0),
    rotation: loadSavedValue(STORAGE_KEYS.ROTATION, 0),
    translateX: loadSavedValue(STORAGE_KEYS.TRANSLATE_X, 0),
    translateY: loadSavedValue(STORAGE_KEYS.TRANSLATE_Y, 0),
    // Initial base transformations
    baseScale: 1,
    baseOffset: { x: 0, z: 0 }
  });
  
  // Keep track of selected seat by index to avoid ID conflicts
  const [selectedSeatIndex, setSelectedSeatIndex] = useState(null);
  
  // Track whether we're currently transitioning between seats
  const [isTransitioning, setIsTransitioning] = useState(false);
  
  // Target camera position for smooth transitions
  const [cameraTarget, setCameraTarget] = useState(null);
  
  // Refs for tracking timeouts
  const transitionTimeoutRef = useRef(null);
  const selectTimeoutRef = useRef(null);
  
  // Calculate base scaling factors based on all seat coordinates
  useEffect(() => {
    const coordinates = seats.map(seat => ({ 
      x: seat.coordinates.x, 
      z: seat.coordinates.z 
    }));
    
    const factors = calcScalingFactors(coordinates);
    
    setTransformations(prev => ({
      ...prev,
      baseScale: factors.scale,
      baseOffset: { x: factors.xOffset, z: factors.zOffset }
    }));
  }, [seats]);
  
  // Find the seat index from ID for highlighting
  const findSeatIndexById = (seatId) => {
    if (!seatId) return null;
    return seats.findIndex(seat => String(seat.id) === String(seatId));
  };
  
  // Initialize selected seat index from props if needed
  useEffect(() => {
    if (selectedSeat && selectedSeat.id) {
      const index = findSeatIndexById(selectedSeat.id);
      if (index !== -1) {
        setSelectedSeatIndex(index);
      }
    }
  }, [selectedSeat]);
  
  // Clean up all timeouts when component unmounts
  useEffect(() => {
    return () => {
      if (transitionTimeoutRef.current) {
        clearTimeout(transitionTimeoutRef.current);
      }
      if (selectTimeoutRef.current) {
        clearTimeout(selectTimeoutRef.current);
      }
    };
  }, []);
  
  // More robust seat selection with transition handling
  const handleSeatSelect = (index) => {
    // Prevent selection during transitions
    if (isTransitioning) {
      console.log('Ignoring click during transition');
      return;
    }
    
    // Clear any existing timeouts to prevent state conflicts
    if (transitionTimeoutRef.current) {
      clearTimeout(transitionTimeoutRef.current);
    }
    if (selectTimeoutRef.current) {
      clearTimeout(selectTimeoutRef.current);
    }
    
    // Start transition
    setIsTransitioning(true);
    
    // Get the selected seat
    const seat = seats[index];
    console.log("Seat selected:", seat.id, "at index:", index);
    
    // Apply transformations to get the seat's position in world space
    const basePosition = [
      (seat.coordinates.x + transformations.baseOffset.x) * transformations.baseScale,
      1,
      (seat.coordinates.z + transformations.baseOffset.z) * transformations.baseScale
    ];
    
    const flippedX = basePosition[0];
    const flippedZ = -basePosition[2];
    
    const angle = transformations.rotation * (Math.PI / 180);
    const rotatedX = flippedX * Math.cos(angle) - flippedZ * Math.sin(angle);
    const rotatedZ = flippedX * Math.sin(angle) + flippedZ * Math.cos(angle);
    
    const transformedPosition = [
      rotatedX * transformations.scale + transformations.translateX,
      basePosition[1],
      rotatedZ * transformations.scale + transformations.translateY
    ];
    
    // First reset the camera target to null to ensure it will update
    setCameraTarget(null);
    
    // Unselect current seat
    setSelectedSeatIndex(null);
    
    // Small delay to ensure clean unselect before selecting new seat and moving camera
    selectTimeoutRef.current = setTimeout(() => {
      // Update camera target first (this needs to happen before seat selection for smooth transition)
      setCameraTarget([transformedPosition[0], 0, transformedPosition[2]]);
      
      // After another small delay, select the new seat
      setTimeout(() => {
        setSelectedSeatIndex(index);
        onSeatSelect(seat);
        
        // End transition after a longer delay to ensure everything has time to render
        transitionTimeoutRef.current = setTimeout(() => {
          setIsTransitioning(false);
          console.log('Transition complete');
        }, 500);
      }, 100);
    }, 200);
  };
  
  // Save transformations and exit edit mode
  const saveTransformations = () => {
    // Save to localStorage
    localStorage.setItem(STORAGE_KEYS.EDIT_MODE, JSON.stringify(false));
    localStorage.setItem(STORAGE_KEYS.SCALE, JSON.stringify(transformations.scale));
    localStorage.setItem(STORAGE_KEYS.ROTATION, JSON.stringify(transformations.rotation));
    localStorage.setItem(STORAGE_KEYS.TRANSLATE_X, JSON.stringify(transformations.translateX));
    localStorage.setItem(STORAGE_KEYS.TRANSLATE_Y, JSON.stringify(transformations.translateY));
    
    // Update state
    setEditMode(false);
  };
  
  // Reset to default transformations
  const resetTransformations = () => {
    // Reset the transformations to default values
    setTransformations(prev => ({
      ...prev,
      scale: 1.0,
      rotation: 0,
      translateX: 0,
      translateY: 0
    }));
  };
  
  // Re-enable edit mode
  const enableEditMode = () => {
    localStorage.setItem(STORAGE_KEYS.EDIT_MODE, JSON.stringify(true));
    setEditMode(true);
  };
  
  // Handle transformation changes
  const handleScaleChange = (e) => {
    setTransformations(prev => ({ ...prev, scale: parseFloat(e.target.value) }));
  };
  
  const handleRotationChange = (e) => {
    setTransformations(prev => ({ ...prev, rotation: parseInt(e.target.value) }));
  };
  
  const handleTranslateXChange = (e) => {
    setTransformations(prev => ({ ...prev, translateX: parseFloat(e.target.value) }));
  };
  
  const handleTranslateYChange = (e) => {
    setTransformations(prev => ({ ...prev, translateY: parseFloat(e.target.value) }));
  };
  
  // Count seats by section for the summary
  const [sectionCounts, setSectionCounts] = useState({});
  
  useEffect(() => {
    // Group seats by section
    const counts = {};
    seats.forEach(seat => {
      counts[seat.section] = (counts[seat.section] || 0) + 1;
    });
    setSectionCounts(counts);
  }, [seats]);
  
  return (
    <MapContainer>
      <Title>Select Your Seat</Title>
      <Description>
        Click on a seat to view more details. {seats.length} seats available in {Object.keys(sectionCounts).length} sections.
      </Description>
      
      {editMode && (
        <TransformControls>
          <ControlGroup>
            <ControlLabel>Scale:</ControlLabel>
            <RangeInput 
              type="range" 
              min="0.5" 
              max="2" 
              step="0.1" 
              value={transformations.scale}
              onChange={handleScaleChange}
            />
            <ValueDisplay>{transformations.scale.toFixed(1)}x</ValueDisplay>
          </ControlGroup>
          
          <ControlGroup>
            <ControlLabel>Rotation:</ControlLabel>
            <RangeInput 
              type="range" 
              min="0" 
              max="359" 
              step="1" 
              value={transformations.rotation}
              onChange={handleRotationChange}
            />
            <ValueDisplay>{transformations.rotation}°</ValueDisplay>
          </ControlGroup>
          
          <ControlGroup>
            <ControlLabel>X Position:</ControlLabel>
            <RangeInput 
              type="range" 
              min="-10" 
              max="10" 
              step="0.5" 
              value={transformations.translateX}
              onChange={handleTranslateXChange}
            />
            <ValueDisplay>{transformations.translateX}</ValueDisplay>
          </ControlGroup>
          
          <ControlGroup>
            <ControlLabel>Y Position:</ControlLabel>
            <RangeInput 
              type="range" 
              min="-10" 
              max="10" 
              step="0.5" 
              value={transformations.translateY}
              onChange={handleTranslateYChange}
            />
            <ValueDisplay>{transformations.translateY}</ValueDisplay>
          </ControlGroup>
          
          <ButtonGroup>
            <ResetButton onClick={resetTransformations}>
              Reset
            </ResetButton>
            <SaveButton onClick={saveTransformations}>
              Save Position
            </SaveButton>
          </ButtonGroup>
        </TransformControls>
      )}
      
      <CanvasContainer>
        {/* Background image displayed beneath the canvas for better clicking */}
        <BackgroundImageContainer>
          <img 
            src={`${process.env.PUBLIC_URL}/arena_outline.png`}
            alt="Arena Layout"
            style={{ 
              width: '100%', 
              height: '100%', 
              objectFit: 'contain',
              opacity: 0.5,
              pointerEvents: 'none'
            }}
          />
        </BackgroundImageContainer>
        
        <Canvas 
          camera={{ 
            position: [0, 25, 0], 
            fov: 40, 
            up: [0, 0, -1],
            near: 1,
            far: 1000
          }}
          shadows
          style={{ background: 'transparent' }}
        >
          <ambientLight intensity={0.8} />
          <directionalLight position={[10, 50, 10]} intensity={1} castShadow />
          
          {/* Custom camera controller for smooth transitions */}
          <CameraController target={cameraTarget} />
          
          {/* Render seats as circles from a top-down view */}
          {seats.map((seat, index) => (
            <Seat
              key={`seat-${index}-${seat.id}`}
              uniqueKey={index}
              seatId={seat.id}
              section={seat.section}
              row={seat.row}
              number={seat.number}
              price={seat.price}
              position={[seat.coordinates.x, seat.coordinates.y, seat.coordinates.z]}
              isSelected={selectedSeatIndex === index}
              onClick={handleSeatSelect}
              transformations={transformations}
            />
          ))}
          
          {/* Fixed camera with only zoom, no rotation */}
          <OrbitControls 
            className="three-orbit-controls"
            enablePan={true}
            enableZoom={true}
            enableRotate={false}
            minDistance={5}
            maxDistance={100}
            target={[0, 0, 0]}
          />
        </Canvas>
        
        {/* Visual feedback when transitioning between seats */}
        {isTransitioning && (
          <LoadingOverlay>
            <LoadingSpinner />
          </LoadingOverlay>
        )}
      </CanvasContainer>
      
      <Legend>
        <LegendTitle>Viewing Guide</LegendTitle>
        <LegendItem>
          <LegendColor color="#0d47a1" />
          <LegendText>Available Seat</LegendText>
        </LegendItem>
        <LegendItem>
          <LegendColor color="#2196f3" />
          <LegendText>Hovered Seat</LegendText>
        </LegendItem>
        <LegendItem>
          <LegendColor color="#f44336" />
          <LegendText>Selected Seat</LegendText>
        </LegendItem>
      </Legend>
      
      <ControlsHelp>
        <HelpTitle>Controls:</HelpTitle>
        <HelpText>
          <HelpItemIcon>⚙️</HelpItemIcon> Scroll wheel to zoom in/out
        </HelpText>
        <HelpText>
          <HelpItemIcon>👆</HelpItemIcon> Right Click + Drag to pan
        </HelpText>
      </ControlsHelp>
    </MapContainer>
  );
};

// Styled Components
const ButtonGroup = styled.div`
  display: flex;
  margin-left: auto;
  gap: 10px;
`;

// Loading overlay and spinner for transitions
const LoadingOverlay = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: rgba(255, 255, 255, 0.2);
  pointer-events: none;
  z-index: 100;
`;

const LoadingSpinner = styled.div`
  width: 40px;
  height: 40px;
  border: 4px solid rgba(0, 0, 0, 0.1);
  border-radius: 50%;
  border-top-color: #2196f3;
  animation: spin 1s linear infinite;
  
  @keyframes spin {
    to {
      transform: rotate(360deg);
    }
  }
`;

const ResetButton = styled.button`
  background-color: #f5f5f5;
  color: #333;
  border: 1px solid #ddd;
  padding: 8px 16px;
  border-radius: 4px;
  font-weight: 500;
  cursor: pointer;
  
  &:hover {
    background-color: #e0e0e0;
  }
`;

const BackgroundImageContainer = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: -1;
`;

const TransformControls = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 15px;
  margin-bottom: 15px;
  padding: 15px;
  background-color: #f3f3f3;
  border: 1px solid #ddd;
  border-radius: 8px;
`;

const ControlGroup = styled.div`
  display: flex;
  align-items: center;
  margin-right: 20px;
`;

const ControlLabel = styled.span`
  font-weight: 500;
  margin-right: 10px;
  min-width: 80px;
`;

const RangeInput = styled.input`
  width: 150px;
`;

const ValueDisplay = styled.span`
  margin-left: 10px;
  min-width: 40px;
  text-align: right;
`;

const SaveButton = styled.button`
  background-color: #2196f3;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 4px;
  font-weight: 500;
  cursor: pointer;
  
  &:hover {
    background-color: #1976d2;
  }
`;

const EditModeButton = styled.button`
  background-color: #f5f5f5;
  color: #333;
  border: 1px solid #ddd;
  padding: 8px 16px;
  border-radius: 4px;
  font-weight: 500;
  cursor: pointer;
  margin-bottom: 15px;
  
  &:hover {
    background-color: #e0e0e0;
  }
`;

const SeatPopup = styled.div`
  background-color: rgba(0, 0, 0, 0.7);
  color: white;
  padding: ${props => props.expanded ? '10px 12px' : '6px 8px'};
  border-radius: 4px;
  font-size: ${props => props.expanded ? '12px' : '11px'};
  min-width: ${props => props.expanded ? '180px' : '150px'};
  white-space: nowrap;
  pointer-events: none;
  transform: translateY(-100%);
  margin-bottom: 5px;
  box-shadow: ${props => props.expanded ? '0 4px 8px rgba(0,0,0,0.2)' : 'none'};
  transition: all 0.3s ease-in-out;
  
  div {
    margin-bottom: 3px;
  }
  
  strong {
    margin-right: 4px;
  }
`;

const MapContainer = styled.div`
  height: 100%;
  display: flex;
  flex-direction: column;
  padding: 20px;
`;

const Title = styled.h2`
  margin-bottom: 10px;
  color: #333;
  font-size: 24px;
  font-weight: 600;
  position: relative;
  padding-bottom: 8px;
  
  &:after {
    content: '';
    position: absolute;
    bottom: 0;
    left: 0;
    width: 50px;
    height: 3px;
    background-color: #1976d2;
    border-radius: 3px;
  }
`;

const Description = styled.p`
  margin-bottom: 12px;
  color: #666;
  font-size: 15px;
  line-height: 1.5;
  max-width: 600px;
`;

const CanvasContainer = styled.div`
  flex: 1;
  border-radius: 8px;
  overflow: hidden;
  background-color: #f5f5f5;
  position: relative;
`;

const Legend = styled.div`
  margin-top: 15px;
  padding: 12px;
  background-color: #f5f5f5;
  border-radius: 8px;
  display: flex;
  flex-wrap: wrap;
  gap: 15px;
  align-items: center;
`;

const LegendTitle = styled.div`
  font-weight: 600;
  margin-right: 10px;
  color: #333;
`;

const LegendItem = styled.div`
  display: flex;
  align-items: center;
  margin-right: 15px;
`;

const LegendColor = styled.div`
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background-color: ${props => props.color};
  margin-right: 8px;
  border: 1px solid rgba(0, 0, 0, 0.1);
`;

const LegendText = styled.span`
  font-size: 14px;
  color: #555;
`;

const ControlsHelp = styled.div`
  margin-top: 10px;
  padding: 12px;
  background-color: #fff;
  border: 1px solid #eee;
  border-radius: 8px;
`;

const HelpTitle = styled.h3`
  font-size: 14px;
  margin: 0 0 8px 0;
  color: #333;
  font-weight: 600;
`;

const HelpText = styled.div`
  display: flex;
  align-items: center;
  font-size: 13px;
  color: #666;
  margin-bottom: 4px;
`;

const HelpItemIcon = styled.span`
  margin-right: 8px;
  font-size: 14px;
`;

export default StadiumMap; 