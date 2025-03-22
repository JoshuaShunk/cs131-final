import React, { useState } from 'react';
import styled from 'styled-components';
import { parseAndGenerateSeats } from '../utils/seatCoordinateParser';

const CoordinateImporter = ({ onSeatsGenerated }) => {
  const [coordinates, setCoordinates] = useState('');
  const [isImporting, setIsImporting] = useState(false);
  
  const handleImport = () => {
    if (!coordinates.trim()) return;
    
    setIsImporting(true);
    
    try {
      const seats = parseAndGenerateSeats(coordinates);
      if (seats && seats.length > 0) {
        onSeatsGenerated(seats);
      }
    } catch (error) {
      console.error('Error parsing coordinates:', error);
    } finally {
      setIsImporting(false);
    }
  };
  
  return (
    <ImporterContainer>
      <ImportTitle>Import Seat Coordinates</ImportTitle>
      <ImportDescription>
        Paste coordinates in the format <code>&lt;Vector (x, y, z)&gt;</code>, one per line.
      </ImportDescription>
      
      <TextArea 
        value={coordinates}
        onChange={e => setCoordinates(e.target.value)}
        placeholder="<Vector (-0.3964, -0.5037, -0.3409)>
<Vector (-0.2732, 0.0220, -0.2992)>
<Vector (-0.3094, -0.0638, -0.2972)>
<Vector (-0.4727, -0.3657, -0.3967)>"
        rows={10}
      />
      
      <ButtonRow>
        <ImportButton 
          onClick={handleImport}
          disabled={isImporting || !coordinates.trim()}
        >
          {isImporting ? 'Importing...' : 'Import Coordinates'}
        </ImportButton>
        
        <ClearButton
          onClick={() => setCoordinates('')}
          disabled={isImporting || !coordinates.trim()}
        >
          Clear
        </ClearButton>
      </ButtonRow>
    </ImporterContainer>
  );
};

const ImporterContainer = styled.div`
  background-color: white;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  margin-bottom: 20px;
`;

const ImportTitle = styled.h2`
  font-size: 18px;
  margin: 0 0 10px 0;
  color: #333;
`;

const ImportDescription = styled.p`
  font-size: 14px;
  margin: 0 0 15px 0;
  color: #666;
  
  code {
    background-color: #f5f5f5;
    padding: 2px 4px;
    border-radius: 3px;
    font-family: monospace;
  }
`;

const TextArea = styled.textarea`
  width: 100%;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-family: monospace;
  font-size: 14px;
  resize: vertical;
  margin-bottom: 15px;
  
  &:focus {
    outline: none;
    border-color: #1976d2;
    box-shadow: 0 0 0 2px rgba(25, 118, 210, 0.1);
  }
`;

const ButtonRow = styled.div`
  display: flex;
  gap: 10px;
`;

const Button = styled.button`
  padding: 10px 16px;
  border-radius: 4px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

const ImportButton = styled(Button)`
  background-color: #1976d2;
  color: white;
  border: none;
  
  &:hover:not(:disabled) {
    background-color: #1565c0;
  }
`;

const ClearButton = styled(Button)`
  background-color: white;
  color: #666;
  border: 1px solid #ddd;
  
  &:hover:not(:disabled) {
    background-color: #f5f5f5;
  }
`;

export default CoordinateImporter; 