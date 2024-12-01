import React from 'react';
import { Box, Text, Flex, Card } from '@radix-ui/themes';

const AdminPage: React.FC = () => {
  return (
    <Box
      className="min-h-screen w-full flex flex-col items-center justify-center"
      style={{ backgroundColor: '#f0f4f8' }}
    >
      <Card className="w-11/12 max-w-6xl p-6 bg-white shadow-lg rounded-lg">
        <Flex direction="column" align="center" gap="6">
          <Text size="8" weight="bold" className="text-gray-800">
            Admin Dashboard
          </Text>
          <Flex direction="column" gap="4" className="w-full">
          </Flex>
          <Text size="2" color="gray" className="text-center">
            © 2024 QDP Web. All rights reserved.
          </Text>
        </Flex>
      </Card>
    </Box >
  );
};

export default AdminPage;
