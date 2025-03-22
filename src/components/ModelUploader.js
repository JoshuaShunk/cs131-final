import React, { useState, useRef } from 'react';
import styled from 'styled-components';
import { validateGlbFile, SUPPORTED_FORMATS } from '../utils/modelLoader';

/**
 * Component for uploading 3D models to use in the stadium view
 */
const ModelUploader = ({ onModelUploaded }) => {
  const [dragActive, setDragActive] = useState(false);
  const [uploadStatus, setUploadStatus] = useState(null);
  const [uploadError, setUploadError] = useState(null);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);
  
  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };
  
  const saveModelFile = async (file) => {
    // Create a FormData object to send the file
    const formData = new FormData();
    formData.append('model', file);
    
    try {
      setUploading(true);
      setUploadStatus('Uploading model...');
      
      // Check if file is valid
      const validation = await validateGlbFile(file);
      if (!validation.valid) {
        setUploadError(validation.message);
        setUploading(false);
        return;
      }
      
      // Normally we'd upload to a server here
      // In this demo, we'll just simulate success and use FileReader to load it locally
      
      const reader = new FileReader();
      reader.onload = () => {
        // Create a blob URL for the file
        const blobUrl = URL.createObjectURL(file);
        
        setTimeout(() => {
          setUploadStatus('Model uploaded successfully! Refreshing view...');
          
          // Notify parent component about the new model
          if (onModelUploaded) {
            onModelUploaded(blobUrl, file.name);
          }
          
          // Reset state
          setUploading(false);
          
          // Reset the message after a delay
          setTimeout(() => {
            setUploadStatus(null);
          }, 3000);
        }, 1000);
      };
      
      reader.readAsArrayBuffer(file);
    } catch (error) {
      console.error('Error uploading model:', error);
      setUploadError(`Error uploading model: ${error.message}`);
      setUploading(false);
    }
  };
  
  const handleDrop = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    setUploadError(null);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      await saveModelFile(file);
    }
  };
  
  const handleInputChange = async (e) => {
    e.preventDefault();
    setUploadError(null);
    
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      await saveModelFile(file);
    }
  };
  
  const handleButtonClick = () => {
    fileInputRef.current.click();
  };
  
  return (
    <UploaderContainer>
      <UploaderTitle>Upload 3D Model</UploaderTitle>
      <UploaderDescription>
        Upload a 3D model to use in the stadium view. Supported formats: 
        {SUPPORTED_FORMATS.join(', ')}
      </UploaderDescription>
      
      <DropzoneContainer 
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        active={dragActive}
      >
        <UploadIcon>📁</UploadIcon>
        <p>Drag and drop your 3D model here, or click to browse</p>
        <FileInput 
          ref={fileInputRef}
          type="file"
          accept=".glb,.gltf,.fbx,.obj,.stl,.dae"
          onChange={handleInputChange}
        />
        <BrowseButton onClick={handleButtonClick} disabled={uploading}>
          Browse Files
        </BrowseButton>
      </DropzoneContainer>
      
      {uploadStatus && (
        <StatusMessage success>{uploadStatus}</StatusMessage>
      )}
      
      {uploadError && (
        <StatusMessage error>{uploadError}</StatusMessage>
      )}
      
      <Note>
        <strong>Note:</strong> For best results, use a GLB model with a simple stadium structure.
        The model will be centered at (0,0,0) in the 3D view.
      </Note>
    </UploaderContainer>
  );
};

const UploaderContainer = styled.div`
  background-color: white;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  margin-bottom: 20px;
`;

const UploaderTitle = styled.h2`
  font-size: 18px;
  margin: 0 0 10px 0;
  color: #333;
`;

const UploaderDescription = styled.p`
  font-size: 14px;
  margin: 0 0 15px 0;
  color: #666;
`;

const DropzoneContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 30px;
  border: 2px dashed ${props => props.active ? '#1976d2' : '#ddd'};
  border-radius: 8px;
  background-color: ${props => props.active ? 'rgba(25, 118, 210, 0.05)' : '#f9f9f9'};
  transition: all 0.2s ease;
  cursor: pointer;
  
  p {
    margin: 10px 0;
    color: #666;
    text-align: center;
  }
  
  &:hover {
    border-color: #1976d2;
    background-color: rgba(25, 118, 210, 0.05);
  }
`;

const UploadIcon = styled.div`
  font-size: 36px;
  margin-bottom: 10px;
`;

const FileInput = styled.input`
  display: none;
`;

const BrowseButton = styled.button`
  background-color: #1976d2;
  color: white;
  border: none;
  border-radius: 4px;
  padding: 8px 16px;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s;
  margin-top: 10px;
  
  &:hover {
    background-color: #1565c0;
  }
  
  &:disabled {
    background-color: #ccc;
    cursor: not-allowed;
  }
`;

const StatusMessage = styled.div`
  margin-top: 15px;
  padding: 10px;
  border-radius: 4px;
  font-size: 14px;
  background-color: ${props => props.error ? '#ffebee' : '#e8f5e9'};
  color: ${props => props.error ? '#d32f2f' : '#2e7d32'};
  border: 1px solid ${props => props.error ? '#ffcdd2' : '#c8e6c9'};
`;

const Note = styled.p`
  font-size: 13px;
  color: #666;
  margin-top: 15px;
  background-color: #fff9c4;
  padding: 10px;
  border-radius: 4px;
  border-left: 3px solid #fbc02d;
`;

export default ModelUploader; 