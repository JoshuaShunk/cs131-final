import React, { useState } from 'react';
import styled from 'styled-components';
import CoordinateImporter from './CoordinateImporter';
import ModelUploader from './ModelUploader';

/**
 * A settings panel component that contains admin tools
 */
const SettingsPanel = ({
  showImporter,
  toggleImporter,
  showModelUploader,
  toggleModelUploader,
  handleSeatsImported,
  handleModelUploaded,
  resetToFileSeats,
  resetToDefaultSeats,
  resetToDefaultModel,
  fileSeatsLoaded,
  customModelUrl
}) => {
  const [isOpen, setIsOpen] = useState(false);
  
  const togglePanel = () => {
    setIsOpen(!isOpen);
  };
  
  return (
    <SettingsContainer>
      <SettingsButton onClick={togglePanel}>
        <SettingsIcon>⚙️</SettingsIcon>
        <SettingsLabel>Settings</SettingsLabel>
      </SettingsButton>
      
      {isOpen && (
        <SettingsContent>
          <SettingsHeader>
            <SettingsTitle>Settings</SettingsTitle>
            <CloseButton onClick={togglePanel}>×</CloseButton>
          </SettingsHeader>
          
          <SettingsSection>
            <SectionTitle>Seat Coordinates</SectionTitle>
            <SettingsButtonGroup>
              <SettingsActionButton onClick={toggleImporter}>
                {showImporter ? 'Hide Coordinate Importer' : 'Import Seat Coordinates'}
              </SettingsActionButton>
              
              {fileSeatsLoaded && (
                <SettingsActionButton onClick={resetToFileSeats}>
                  Reset to File Seats
                </SettingsActionButton>
              )}
              
              <SettingsActionButton onClick={resetToDefaultSeats}>
                Reset to Default Seats
              </SettingsActionButton>
            </SettingsButtonGroup>
            
            {showImporter && (
              <ImporterWrapper>
                <CoordinateImporter onSeatsGenerated={handleSeatsImported} />
              </ImporterWrapper>
            )}
          </SettingsSection>
          
          <SettingsSection>
            <SectionTitle>3D Model</SectionTitle>
            <SettingsButtonGroup>
              <SettingsActionButton onClick={toggleModelUploader}>
                {showModelUploader ? 'Hide Model Uploader' : 'Upload 3D Model'}
              </SettingsActionButton>
              
              {customModelUrl && (
                <SettingsActionButton onClick={resetToDefaultModel}>
                  Reset to Default Model
                </SettingsActionButton>
              )}
            </SettingsButtonGroup>
            
            {showModelUploader && (
              <ImporterWrapper>
                <ModelUploader onModelUploaded={handleModelUploaded} />
              </ImporterWrapper>
            )}
          </SettingsSection>
        </SettingsContent>
      )}
    </SettingsContainer>
  );
};

const SettingsContainer = styled.div`
  position: relative;
  z-index: 100;
`;

const SettingsButton = styled.button`
  display: flex;
  align-items: center;
  background-color: #1976d2;
  color: white;
  border: none;
  border-radius: 4px;
  padding: 8px 16px;
  cursor: pointer;
  transition: background-color 0.2s;
  
  &:hover {
    background-color: #1565c0;
  }
`;

const SettingsIcon = styled.span`
  margin-right: 8px;
  font-size: 16px;
`;

const SettingsLabel = styled.span`
  font-weight: 500;
`;

const SettingsContent = styled.div`
  position: absolute;
  top: 100%;
  right: 0;
  width: 400px;
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
  margin-top: 10px;
  overflow: hidden;
  z-index: 10;
`;

const SettingsHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px 20px;
  background-color: #f5f5f5;
  border-bottom: 1px solid #e0e0e0;
`;

const SettingsTitle = styled.h2`
  margin: 0;
  font-size: 18px;
  font-weight: 500;
  color: #333;
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  color: #666;
  font-size: 24px;
  cursor: pointer;
  width: 30px;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  
  &:hover {
    background-color: rgba(0, 0, 0, 0.05);
  }
`;

const SettingsSection = styled.div`
  padding: 15px 20px;
  border-bottom: 1px solid #e0e0e0;
  
  &:last-child {
    border-bottom: none;
  }
`;

const SectionTitle = styled.h3`
  margin: 0 0 15px 0;
  font-size: 16px;
  font-weight: 500;
  color: #333;
`;

const SettingsButtonGroup = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-bottom: 15px;
`;

const SettingsActionButton = styled.button`
  background-color: #f5f5f5;
  border: 1px solid #ddd;
  border-radius: 4px;
  padding: 8px 12px;
  font-size: 13px;
  color: #333;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    background-color: #e0e0e0;
  }
`;

const ImporterWrapper = styled.div`
  margin-top: 15px;
  border-top: 1px solid #eee;
  padding-top: 15px;
`;

export default SettingsPanel; 