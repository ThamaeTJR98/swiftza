import React from 'react';
import { useApp } from '../context/AppContext';
import { UserRole } from '../types';
import { CreatorProfile } from './CreatorProfile';
import { DriverProfile } from './DriverProfile';

export const Profile: React.FC = () => {
  const { user } = useApp();

  if (!user) return null;

  return user.role === UserRole.DRIVER 
    ? <DriverProfile /> 
    : <CreatorProfile />;
};