// @ts-nocheck
import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import Header from './components/Header';
import StadiumMap from './components/StadiumMap';
import SeatView from './components/SeatView';
import MiniSeatView from './components/MiniSeatView';
import TicketForm from './components/TicketForm';
import CoordinateImporter from './components/CoordinateImporter';
import ModelUploader from './components/ModelUploader';
import SettingsPanel from './components/SettingsPanel';
import { preloadModels } from './utils/modelLoader';
import { ModelProvider } from './utils/ModelContext';
import { loadSeatsFromFile } from './utils/coordinateLoader';

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
const DEFAULT_SEATS = [
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
  { 
    id: 'B1', 
    section: 'B', 
    row: 1, 
    number: 1, 
    price: 180, 
    coordinates: { x: 5, y: 2, z: 10 } 
  },
  { 
    id: 'B2', 
    section: 'B', 
    row: 1, 
    number: 2, 
    price: 180, 
    coordinates: { x: 3, y: 2, z: 10 } 
  },
  { 
    id: 'C1', 
    section: 'C', 
    row: 5, 
    number: 1, 
    price: 100, 
    coordinates: { x: -7, y: 5, z: 15 } 
  },
  { 
    id: 'C2', 
    section: 'C', 
    row: 5, 
    number: 2, 
    price: 100, 
    coordinates: { x: 7, y: 5, z: 15 } 
  },
];

const App = () => {
  const [availableSeats, setAvailableSeats] = useState(DEFAULT_SEATS);
  const [selectedSeat, setSelectedSeat] = useState(null);
  const [viewingMode, setViewingMode] = useState(false);
  const [purchaseComplete, setPurchaseComplete] = useState(false);
  const [viewKey, setViewKey] = useState(0); // Add a key to force re-render
  const [showImporter, setShowImporter] = useState(false);
  const [showModelUploader, setShowModelUploader] = useState(false);
  const [isLoadingSeats, setIsLoadingSeats] = useState(false);
  const [fileSeatsLoaded, setFileSeatsLoaded] = useState(false);
  const [customModelUrl, setCustomModelUrl] = useState(null);

  // We don't need to preload models here anymore as it's handled by the ModelProvider
  // But we'll keep the modelLoaded state for compatibility
  const [modelLoaded, setModelLoaded] = useState(true);

  // Load seats from coordinates.txt file when the app mounts
  useEffect(() => {
    const loadSeats = async () => {
      setIsLoadingSeats(true);
      try {
        const seats = await loadSeatsFromFile();
        if (seats && seats.length > 0) {
          setAvailableSeats(seats);
          setFileSeatsLoaded(true);
          console.log(`Loaded ${seats.length} seats from coordinates.txt file`);
        }
      } catch (error) {
        console.error('Failed to load seats from file:', error);
      } finally {
        setIsLoadingSeats(false);
      }
    };
    
    loadSeats();
  }, []);

  /**
   * Handle seat selection
   * @param {Seat} seat - The selected seat
   */
  const handleSeatSelect = (seat) => {
    setSelectedSeat(seat);
    // Reset view key when selecting a new seat
    setViewKey(prevKey => prevKey + 1);
  };

  /**
   * Toggle viewing mode between map and expanded 3D view
   */
  const handleViewToggle = () => {
    setViewingMode(!viewingMode);
    // Reset view key when toggling view
    setViewKey(prevKey => prevKey + 1);
  };

  /**
   * Handle ticket purchase
   */
  const handlePurchase = () => {
    if (selectedSeat) {
      setPurchaseComplete(true);
    }
  };

  /**
   * Reset the application state
   */
  const handleReset = () => {
    setSelectedSeat(null);
    setViewingMode(false);
    setPurchaseComplete(false);
    setViewKey(prevKey => prevKey + 1);
  };

  /**
   * Handle imported seat coordinates
   * @param {Array} seats - Array of seat objects generated from coordinates
   */
  const handleSeatsImported = (seats) => {
    if (seats && seats.length > 0) {
      setAvailableSeats(seats);
      setSelectedSeat(null);
      setShowImporter(false);
    }
  };

  /**
   * Toggle the coordinate importer visibility
   */
  const toggleImporter = () => {
    setShowImporter(!showImporter);
  };

  /**
   * Toggle the model uploader visibility
   */
  const toggleModelUploader = () => {
    setShowModelUploader(!showModelUploader);
  };

  /**
   * Handle model upload completion
   * @param {string} blobUrl - The URL to the uploaded model
   * @param {string} fileName - The name of the uploaded file
   */
  const handleModelUploaded = (blobUrl, fileName) => {
    console.log(`Model uploaded: ${fileName}`);
    setCustomModelUrl(blobUrl);
    
    // Force refresh of 3D view components
    setViewKey(prevKey => prevKey + 1);
  };

  /**
   * Reset to file seats
   */
  const resetToFileSeats = async () => {
    setIsLoadingSeats(true);
    try {
      const seats = await loadSeatsFromFile();
      if (seats && seats.length > 0) {
        setAvailableSeats(seats);
        setSelectedSeat(null);
      }
    } catch (error) {
      console.error('Failed to reload seats from file:', error);
    } finally {
      setIsLoadingSeats(false);
    }
  };

  // Create a settings panel with all the admin functions
  const settingsPanelElement = (
    <SettingsPanel
      showImporter={showImporter}
      toggleImporter={toggleImporter}
      showModelUploader={showModelUploader}
      toggleModelUploader={toggleModelUploader}
      handleSeatsImported={handleSeatsImported}
      handleModelUploaded={handleModelUploaded}
      resetToFileSeats={resetToFileSeats}
      resetToDefaultSeats={() => setAvailableSeats(DEFAULT_SEATS)}
      resetToDefaultModel={() => {
        setCustomModelUrl(null);
        setViewKey(prevKey => prevKey + 1);
      }}
      fileSeatsLoaded={fileSeatsLoaded}
      customModelUrl={customModelUrl}
    />
  );

  return (
    <ModelProvider customModelUrl={customModelUrl}>
      <AppContainer>
        <Header settingsPanel={settingsPanelElement} />
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
                {isLoadingSeats ? (
                  <LoadingContainer>
                    <LoadingMessage>Loading seats from coordinates.txt file...</LoadingMessage>
                  </LoadingContainer>
                ) : viewingMode ? (
                  <ExpandedViewContainer key={`expanded-view-${viewKey}`}>
                    <ExpandedViewHeader>
                      <ExpandedViewTitle>View from Seat {selectedSeat?.id}</ExpandedViewTitle>
                      <CloseButton onClick={handleViewToggle}>×</CloseButton>
                    </ExpandedViewHeader>
                    <SeatView 
                      seatCoordinates={selectedSeat?.coordinates} 
                      seat={selectedSeat}
                      onBack={handleViewToggle} 
                    />
                  </ExpandedViewContainer>
                ) : (
                  <StadiumMap 
                    key={`stadium-map-${viewKey}`}
                    seats={availableSeats} 
                    selectedSeat={selectedSeat} 
                    onSeatSelect={handleSeatSelect} 
                  />
                )}
              </LeftPanel>
              <RightPanel>
                <TicketForm 
                  key={`ticket-form-${viewKey}`}
                  selectedSeat={selectedSeat} 
                  onPurchase={handlePurchase} 
                  viewingMode={viewingMode}
                  onViewToggle={handleViewToggle}
                  modelLoaded={true}
                />
              </RightPanel>
            </>
          )}
        </MainContent>
      </AppContainer>
    </ModelProvider>
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

const LoadingContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  padding: 20px;
`;

const LoadingMessage = styled.div`
  font-size: 18px;
  color: #1976d2;
  text-align: center;
`;

const ExpandedViewContainer = styled.div`
  height: 100%;
  display: flex;
  flex-direction: column;
`;

const ExpandedViewHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px 20px;
  background-color: #1976d2;
  color: white;
`;

const ExpandedViewTitle = styled.h2`
  margin: 0;
  font-size: 18px;
  font-weight: 500;
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  color: white;
  font-size: 24px;
  cursor: pointer;
  width: 30px;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
  
  &:hover {
    background-color: rgba(255, 255, 255, 0.1);
    border-radius: 50%;
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