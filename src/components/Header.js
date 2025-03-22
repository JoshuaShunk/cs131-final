import React from 'react';
import styled from 'styled-components';

const Header = ({ settingsPanel }) => {
  return (
    <HeaderContainer>
      <HeaderContent>
        <LogoSection>
          <Logo>Stadium View</Logo>
          <Tagline>Preview your seat view before you buy</Tagline>
        </LogoSection>
        <NavLinks>
          <NavLink href="#">Home</NavLink>
          <NavLink href="#">Events</NavLink>
          <NavLink href="#">About</NavLink>
          {settingsPanel && <SettingsPanelWrapper>{settingsPanel}</SettingsPanelWrapper>}
          <NavButton>Sign In</NavButton>
        </NavLinks>
      </HeaderContent>
    </HeaderContainer>
  );
};

const HeaderContainer = styled.header`
  background: linear-gradient(135deg, #1976d2 0%, #0d47a1 100%);
  color: white;
  padding: 15px 15px 15px 10px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  position: relative;
  z-index: 100;
`;

const HeaderContent = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  max-width: 1200px;
  margin: 0 auto;
  padding: 0;
  width: 100%;
`;

const LogoSection = styled.div`
  display: flex;
  flex-direction: column;
  margin-left: 0;
  padding-left: 0;
`;

const Logo = styled.h1`
  font-size: 28px;
  font-weight: 700;
  margin: 0;
  letter-spacing: 0.5px;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
`;

const Tagline = styled.p`
  font-size: 16px;
  margin-top: 5px;
  opacity: 0.9;
  font-weight: 300;
`;

const NavLinks = styled.div`
  display: flex;
  align-items: center;
  gap: 25px;
`;

const NavLink = styled.a`
  color: white;
  text-decoration: none;
  font-size: 16px;
  font-weight: 500;
  opacity: 0.9;
  transition: opacity 0.2s ease;
  
  &:hover {
    opacity: 1;
    text-decoration: underline;
  }
`;

const NavButton = styled.button`
  background-color: rgba(255, 255, 255, 0.15);
  color: white;
  border: 1px solid rgba(255, 255, 255, 0.3);
  border-radius: 4px;
  padding: 8px 16px;
  font-size: 15px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    background-color: rgba(255, 255, 255, 0.25);
    transform: translateY(-2px);
  }
`;

const SettingsPanelWrapper = styled.div`
  margin-left: 10px;
`;

export default Header; 