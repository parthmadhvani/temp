import * as Form from "@radix-ui/react-form";
import "./styles.css"
import React, { useState } from 'react';
import {
  Button,
  Dialog,
  Flex,
  Text,
  Avatar,
  Box,
} from '@radix-ui/themes';

const FormDemo: React.FC = () => {
    
  
    return (
      <Box className="min-h-screen bg-gray-100 flex flex-col items-center justify-center p-4">
        <Text size="1" className="text-gray-500 mt-8">
          © 2024 QDP Web. All rights reserved.
        </Text>
      </Box>
    );
  };

export default FormDemo;
