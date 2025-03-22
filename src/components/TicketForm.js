// @ts-nocheck
import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import MiniSeatView from './MiniSeatView';

// Function to format phone number as (XXX) XXX-XXXX
const formatPhoneNumber = (value) => {
  if (!value) return value;
  
  // Remove all non-digit characters
  const phoneNumber = value.replace(/[^\d]/g, '');
  
  // Format based on length
  if (phoneNumber.length < 4) {
    return phoneNumber;
  } else if (phoneNumber.length < 7) {
    return `(${phoneNumber.slice(0, 3)}) ${phoneNumber.slice(3)}`;
  } else {
    return `(${phoneNumber.slice(0, 3)}) ${phoneNumber.slice(3, 6)}-${phoneNumber.slice(6, 10)}`;
  }
};

const TicketForm = ({ selectedSeat, onViewToggle, onPurchase, viewingMode, modelLoaded = true }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    paymentMethod: 'credit'
  });
  
  const [errors, setErrors] = useState({});
  const [expandView, setExpandView] = useState(false);
  const [paymentDropdownOpen, setPaymentDropdownOpen] = useState(false);
  
  // Reset expandView state when viewingMode changes
  useEffect(() => {
    if (!viewingMode) {
      setExpandView(false);
    }
  }, [viewingMode]);
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    
    // Apply phone number formatting if the field is phone
    if (name === 'phone') {
      const formattedValue = formatPhoneNumber(value);
      setFormData(prev => ({
        ...prev,
        [name]: formattedValue
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
    
    // Clear error when field is edited
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };
  
  const handlePaymentSelect = (value) => {
    setFormData(prev => ({
      ...prev,
      paymentMethod: value
    }));
    setPaymentDropdownOpen(false);
  };
  
  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }
    
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }
    
    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone number is required';
    } else {
      // Check if phone number has the correct format (10 digits)
      const digitsOnly = formData.phone.replace(/\D/g, '');
      if (digitsOnly.length !== 10) {
        newErrors.phone = 'Phone number must be 10 digits';
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (validateForm()) {
      onPurchase();
    }
  };

  const handleExpandView = () => {
    setExpandView(true);
    onViewToggle();
  };
  
  const getPaymentMethodLabel = () => {
    switch(formData.paymentMethod) {
      case 'credit':
        return 'Credit Card';
      case 'paypal':
        return 'PayPal';
      case 'apple':
        return 'Apple Pay';
      default:
        return 'Select Payment Method';
    }
  };
  
  if (!selectedSeat) {
    return (
      <FormContainer>
        <Title>Ticket Information</Title>
        <EmptyState>
          <EmptyStateText>Please select a seat from the stadium map to continue.</EmptyStateText>
        </EmptyState>
      </FormContainer>
    );
  }
  
  return (
    <FormContainer>
      <Title>Ticket Information</Title>
      
      <SeatInfo>
        <SeatInfoItem>
          <Label>Section</Label>
          <Value>{selectedSeat.section}</Value>
        </SeatInfoItem>
        <SeatInfoItem>
          <Label>Row</Label>
          <Value>{selectedSeat.row}</Value>
        </SeatInfoItem>
        <SeatInfoItem>
          <Label>Seat</Label>
          <Value>{selectedSeat.number}</Value>
        </SeatInfoItem>
        <SeatInfoItem>
          <Label>Price</Label>
          <Value>${selectedSeat.price}</Value>
        </SeatInfoItem>
      </SeatInfo>
      
      {/* Mini 3D View */}
      {selectedSeat && modelLoaded && !viewingMode && (
        <MiniViewContainer>
          <MiniViewHeader>
            <MiniViewTitle>Preview from this seat</MiniViewTitle>
            <ExpandButton onClick={handleExpandView}>
              <ExpandIcon>⤢</ExpandIcon>
            </ExpandButton>
          </MiniViewHeader>
          <MiniSeatView 
            seatCoordinates={selectedSeat.coordinates}
            seat={selectedSeat}
            mini={true}
          />
        </MiniViewContainer>
      )}
      
      {viewingMode && (
        <ViewingModeMessage>
          <p>Viewing expanded 3D preview. Click the X in the top-right corner to return to the map view.</p>
        </ViewingModeMessage>
      )}
      
      {!modelLoaded && (
        <ModelLoadingNote>
          3D model is still loading. Please wait a moment before previewing the seat view.
        </ModelLoadingNote>
      )}
      
      <Form onSubmit={handleSubmit}>
        <FormHeader>Purchase Details</FormHeader>
        
        <FormRow>
          <FormGroup>
            <FormLabel htmlFor="name">Full Name</FormLabel>
            <InputWrapper>
              <FormInput
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                error={errors.name}
                placeholder="John Doe"
              />
            </InputWrapper>
            {errors.name && <ErrorMessage>{errors.name}</ErrorMessage>}
          </FormGroup>
        </FormRow>
        
        <FormRow>
          <FormGroup>
            <FormLabel htmlFor="email">Email Address</FormLabel>
            <InputWrapper>
              <FormInput
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                error={errors.email}
                placeholder="email@example.com"
              />
            </InputWrapper>
            {errors.email && <ErrorMessage>{errors.email}</ErrorMessage>}
          </FormGroup>
        </FormRow>
        
        <FormRow>
          <FormGroup>
            <FormLabel htmlFor="phone">Phone Number</FormLabel>
            <InputWrapper>
              <FormInput
                type="tel"
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                error={errors.phone}
                placeholder="(123) 456-7890"
              />
            </InputWrapper>
            {errors.phone && <ErrorMessage>{errors.phone}</ErrorMessage>}
          </FormGroup>
        </FormRow>
        
        <FormRow>
          <FormGroup>
            <FormLabel>Payment Method</FormLabel>
            <CustomDropdown>
              <DropdownHeader 
                onClick={() => setPaymentDropdownOpen(!paymentDropdownOpen)}
                active={paymentDropdownOpen}
              >
                <span>{getPaymentMethodLabel()}</span>
                <DropdownArrow active={paymentDropdownOpen}>▼</DropdownArrow>
              </DropdownHeader>
              {paymentDropdownOpen && (
                <DropdownMenu>
                  <DropdownItem 
                    onClick={() => handlePaymentSelect('credit')}
                    selected={formData.paymentMethod === 'credit'}
                  >
                    Credit Card
                  </DropdownItem>
                  <DropdownItem 
                    onClick={() => handlePaymentSelect('paypal')}
                    selected={formData.paymentMethod === 'paypal'}
                  >
                    PayPal
                  </DropdownItem>
                  <DropdownItem 
                    onClick={() => handlePaymentSelect('apple')}
                    selected={formData.paymentMethod === 'apple'}
                  >
                    Apple Pay
                  </DropdownItem>
                </DropdownMenu>
              )}
            </CustomDropdown>
          </FormGroup>
        </FormRow>
        
        <SubmitButton type="submit">Purchase Ticket</SubmitButton>
      </Form>
    </FormContainer>
  );
};

const FormContainer = styled.div`
  height: 100%;
  display: flex;
  flex-direction: column;
  padding: 20px;
  background-color: #ffffff;
  overflow-y: auto;
`;

const Title = styled.h2`
  margin-bottom: 15px;
  color: #333;
  font-size: 20px;
  font-weight: 600;
  text-align: left;
  padding-left: 5px;
  position: relative;
  
  &:after {
    content: '';
    position: absolute;
    bottom: -5px;
    left: 5px;
    width: 40px;
    height: 3px;
    background-color: #1976d2;
    border-radius: 3px;
  }
`;

const EmptyState = styled.div`
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #f9f9f9;
  border-radius: 8px;
  padding: 20px;
`;

const EmptyStateText = styled.p`
  text-align: center;
  color: #666;
  font-size: 14px;
`;

const SeatInfo = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
  margin-bottom: 15px;
  padding: 15px;
  background-color: #f5f5f5;
  border-radius: 12px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
`;

const SeatInfoItem = styled.div`
  display: flex;
  flex-direction: column;
`;

const Label = styled.span`
  font-size: 12px;
  color: #666;
  margin-bottom: 4px;
  font-weight: 500;
`;

const Value = styled.span`
  font-size: 15px;
  font-weight: 600;
  color: #333;
`;

const MiniViewContainer = styled.div`
  margin-bottom: 15px;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  height: 180px;
`;

const MiniViewHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 12px;
  background-color: #1976d2;
  color: white;
`;

const MiniViewTitle = styled.h3`
  margin: 0;
  font-size: 13px;
  font-weight: 500;
`;

const ExpandButton = styled.button`
  background: none;
  border: none;
  color: white;
  cursor: pointer;
  font-size: 14px;
  padding: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  
  &:hover {
    background-color: rgba(255, 255, 255, 0.1);
    border-radius: 4px;
  }
`;

const ExpandIcon = styled.span`
  font-size: 14px;
`;

const ModelLoadingNote = styled.p`
  text-align: center;
  color: #666;
  font-size: 13px;
  margin-bottom: 15px;
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 15px;
`;

const FormHeader = styled.h3`
  font-size: 16px;
  font-weight: 500;
  color: #333;
  margin: 0 0 12px 0;
  padding-bottom: 8px;
  padding-left: 5px;
  text-align: left;
  border-bottom: 1px solid #eee;
  position: relative;
  
  &:after {
    content: '';
    position: absolute;
    bottom: -1px;
    left: 5px;
    width: 30px;
    height: 2px;
    background-color: #1976d2;
    border-radius: 2px;
  }
`;

const FormRow = styled.div`
  display: flex;
  gap: 10px;
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  flex: 1;
`;

const FormLabel = styled.label`
  font-size: 12px;
  margin-bottom: 6px;
  color: #555;
  font-weight: 500;
`;

const InputWrapper = styled.div`
  position: relative;
  display: flex;
  align-items: center;
`;

const FormInput = styled.input`
  width: 100%;
  padding: 10px 12px;
  border: 1px solid ${props => props.error ? '#d32f2f' : '#e0e0e0'};
  border-radius: 8px;
  font-size: 14px;
  background-color: #f9f9f9;
  transition: all 0.2s ease;
  
  &:focus {
    outline: none;
    border-color: #1976d2;
    background-color: #fff;
    box-shadow: 0 0 0 3px rgba(25, 118, 210, 0.1);
  }
  
  &::placeholder {
    color: #bbb;
  }
`;

const CustomDropdown = styled.div`
  position: relative;
  width: 100%;
`;

const DropdownHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 12px;
  background-color: ${props => props.active ? '#fff' : '#f9f9f9'};
  border: 1px solid ${props => props.active ? '#1976d2' : '#e0e0e0'};
  border-radius: 8px;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.2s ease;
  
  &:hover {
    border-color: #1976d2;
  }
  
  ${props => props.active && `
    box-shadow: 0 0 0 3px rgba(25, 118, 210, 0.1);
  `}
`;

const DropdownArrow = styled.span`
  font-size: 10px;
  color: #666;
  transition: transform 0.2s ease;
  transform: ${props => props.active ? 'rotate(180deg)' : 'rotate(0)'};
`;

const DropdownMenu = styled.div`
  position: absolute;
  top: calc(100% + 5px);
  left: 0;
  right: 0;
  background-color: white;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  z-index: 10;
  overflow: hidden;
`;

const DropdownItem = styled.div`
  padding: 10px 12px;
  cursor: pointer;
  font-size: 14px;
  background-color: ${props => props.selected ? '#f0f7ff' : 'transparent'};
  color: ${props => props.selected ? '#1976d2' : '#333'};
  
  &:hover {
    background-color: ${props => props.selected ? '#f0f7ff' : '#f5f5f5'};
  }
`;

const ErrorMessage = styled.span`
  color: #d32f2f;
  font-size: 11px;
  margin-top: 4px;
`;

const SubmitButton = styled.button`
  background-color: #1976d2;
  color: white;
  border: none;
  border-radius: 8px;
  padding: 12px;
  font-size: 14px;
  font-weight: 500;
  margin-top: 5px;
  transition: all 0.2s ease;
  cursor: pointer;
  
  &:hover {
    background-color: #1565c0;
    transform: translateY(-1px);
    box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
  }
  
  &:active {
    transform: translateY(0);
  }
`;

const ViewingModeMessage = styled.div`
  margin-bottom: 15px;
  padding: 10px 15px;
  background-color: #e3f2fd;
  border-left: 3px solid #1976d2;
  border-radius: 8px;
  
  p {
    margin: 0;
    font-size: 13px;
    color: #0d47a1;
  }
`;

export default TicketForm; 