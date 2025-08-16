import React from 'react';
import { handleGoogleSignIn } from '../../firebase/authService';
import { Box, Button, Heading, Text, VStack } from '@chakra-ui/react';

const Login = () => {
    return (
        <Box display="flex" alignItems="center" justifyContent="center" height="100vh">
            <VStack spacing={4} p={8} boxShadow="lg" borderRadius="md" bg="white">
                <Heading as="h1" size="xl">Split App</Heading>
                <Text>Inicia sesión para dividir gastos con tu pareja o amigos.</Text>
                <Button onClick={handleGoogleSignIn} colorScheme="blue">
                    Iniciar Sesión con Google
                </Button>
            </VStack>
        </Box>
    );
};

export default Login;