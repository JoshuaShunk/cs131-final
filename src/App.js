// @ts-nocheck
import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import Header from './components/Header';
import StadiumMap from './components/StadiumMap';
import SeatView from './components/SeatView';
import TicketForm from './components/TicketForm';
import { preloadModels, convertBlenderToThreeCoordinates } from './utils/modelLoader';

/**
 * @typedef {Object} SeatCoordinates
 * @property {number} x - X coordinate
 * @property {number} y - Y coordinate
 * @property {number} z - Z coordinate
 */

/**
 * @typedef {Object} Seat
 * @property {string} id - Seat identifier
 * @property {string} section - Section identifier
 * @property {number} row - Row number
 * @property {number} number - Seat number
 * @property {number} price - Seat price
 * @property {SeatCoordinates} coordinates - 3D coordinates for the seat view
 */

/** @type {Seat[]} */
const AVAILABLE_SEATS = [
  { 
    id: 'A1', 
    section: 'A', 
    row: 1, 
    number: 1, 
    price: 150, 
    coordinates: { x: -5, y: 2, z: 10 },
    // Optional: If you have coordinates from Blender, you can convert them
    // coordinates: convertBlenderToThreeCoordinates({ x: -5, y: -10, z: 2 })
  },
  { 
    id: 'A2', 
    section: 'A', 
    row: 1, 
    number: 2, 
    price: 150, 
    coordinates: { x: -3, y: 2, z: 10 } 
  },
  { 
    id: 'B1', 
    section: 'B', 
    row: 5, 
    number: 1, 
    price: 100, 
    coordinates: { x: 5, y: 5, z: 15 } 
  },
  { 
    id: 'B2', 
    section: 'B', 
    row: 5, 
    number: 2, 
    price: 100, 
    coordinates: { x: 7, y: 5, z: 15 } 
  },
];

const App = () => {
  /** @type {[Seat | null, React.Dispatch<React.SetStateAction<Seat | null>>]} */
  const [selectedSeat, setSelectedSeat] = useState(null);
  const [viewingMode, setViewingMode] = useState(false);
  const [purchaseComplete, setPurchaseComplete] = useState(false);
  const [modelLoaded, setModelLoaded] = useState(false);

  // Preload the stadium model when the app starts
  useEffect(() => {
    try {
      preloadModels();
      setModelLoaded(true);
    } catch (error) {
      console.error('Error preloading stadium model:', error);
    }
  }, []);

  /**
   * Handle seat selection
   * @param {Seat} seat - The selected seat
   */
  const handleSeatSelect = (seat) => {
    setSelectedSeat(seat);
  };

  // Toggle between map view and seat view
  const handleViewToggle = () => {
    setViewingMode(!viewingMode);
  };

  // Handle ticket purchase
  const handlePurchase = () => {
    if (selectedSeat) {
      setPurchaseComplete(true);
    }
  };

  // Reset the application state
  const handleReset = () => {
    setSelectedSeat(null);
    setViewingMode(false);
    setPurchaseComplete(false);
  };

  return (
    <AppContainer>
      <Header />
      <MainContent>
        {purchaseComplete ? (
          <PurchaseConfirmation>
            <h2>Thank you for your purchase!</h2>
            <p>You have successfully purchased a ticket for seat {selectedSeat?.id}.</p>
            <p>Section: {selectedSeat?.section}, Row: {selectedSeat?.row}, Seat: {selectedSeat?.number}</p>
            <p>Price: ${selectedSeat?.price}</p>
            <Button onClick={handleReset}>Buy Another Ticket</Button>
          </PurchaseConfirmation>
        ) : (
          <>
            <LeftPanel>
              {viewingMode ? (
                <SeatView 
                  seatCoordinates={selectedSeat?.coordinates} 
                  seat={selectedSeat}
                  onBack={handleViewToggle} 
                />
              ) : (
                <StadiumMap 
                  seats={AVAILABLE_SEATS} 
                  selectedSeat={selectedSeat} 
                  onSeatSelect={handleSeatSelect} 
                />
              )}
            </LeftPanel>
            <RightPanel>
              <TicketForm 
                selectedSeat={selectedSeat} 
                onViewToggle={handleViewToggle} 
                onPurchase={handlePurchase} 
                viewingMode={viewingMode}
                modelLoaded={modelLoaded}
              />
            </RightPanel>
          </>
        )}
      </MainContent>
    </AppContainer>
  );
};

const AppContainer = styled.div`
  display: flex;
  flex-direction: column;
  min-height: 100vh;
`;

const MainContent = styled.main`
  display: flex;
  flex: 1;
  padding: 20px;
  
  @media (max-width: 768px) {
    flex-direction: column;
  }
`;

const LeftPanel = styled.div`
  flex: 2;
  margin-right: 20px;
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  
  @media (max-width: 768px) {
    margin-right: 0;
    margin-bottom: 20px;
    height: 400px;
  }
`;

const RightPanel = styled.div`
  flex: 1;
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  padding: 20px;
`;

const PurchaseConfirmation = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  padding: 40px;
  
  h2 {
    color: #2e7d32;
    margin-bottom: 20px;
  }
  
  p {
    margin-bottom: 10px;
    font-size: 18px;
  }
`;

const Button = styled.button`
  background-color: #1976d2;
  color: white;
  border: none;
  border-radius: 4px;
  padding: 12px 24px;
  font-size: 16px;
  font-weight: 500;
  margin-top: 20px;
  transition: background-color 0.3s;
  
  &:hover {
    background-color: #1565c0;
  }
`;

export default App; 