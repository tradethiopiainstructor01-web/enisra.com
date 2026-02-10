import { Box, Flex, Heading, IconButton, useBreakpointValue, useColorMode, useDisclosure } from '@chakra-ui/react';
import { SunIcon, MoonIcon, HamburgerIcon } from '@chakra-ui/icons';
import { useEffect, useState } from 'react';
import EmployeeInfoForm from './EmployeeInfoForm';
import EmployeeNavDrawer from '../components/employee/EmployeeNavDrawer';
import EmployeeSidebar from '../components/employee/EmployeeSidebar';

const EmployeeInfoPage = () => {
    const { colorMode, toggleColorMode } = useColorMode(); // Hook to get and toggle color mode
    const { isOpen, onOpen, onClose } = useDisclosure();
    const isDesktop = useBreakpointValue({ base: false, lg: true }) || false;
    const [sidebarCollapsed, setSidebarCollapsed] = useState(
        () => localStorage.getItem('employeeSidebarCollapsed') === '1'
    );

    useEffect(() => {
        localStorage.setItem('employeeSidebarCollapsed', sidebarCollapsed ? '1' : '0');
    }, [sidebarCollapsed]);

    return (
<Box
    maxW={{ base: '100%', sm: '95%', md: '100%', lg: '95%', xl: '85%' }} // Increased widths for a more stretched look
    mx="auto"
    p={6}
    position="relative"
    bg={colorMode === 'light' ? 'gray.50' : 'gray.800'}
    boxShadow="xl"
    mt={"10"}
>

            
            {!isDesktop ? (
                <IconButton
                    aria-label="Open menu"
                    icon={<HamburgerIcon />}
                    position="absolute"
                    top="4"
                    left="4"
                    onClick={onOpen}
                    borderRadius="full"
                    boxShadow="lg"
                    size="lg"
                    colorScheme="teal"
                    mb={4}
                />
            ) : null}

            {/* Floating action button for theme toggle */}
            <IconButton
                aria-label="Toggle theme"
                icon={colorMode === 'light' ? <MoonIcon /> : <SunIcon />}
                position="absolute"
                top="4"
                right="4"
                onClick={toggleColorMode}
                borderRadius="full"
                boxShadow="lg"
                size="lg"
                colorScheme={colorMode === 'light' ? 'teal' : 'yellow'}
                mb={4}
            />

{/* Main content and sidebar */}
<Flex
    direction={{ base: 'column', lg: 'row' }}
    gap={6}
    align="flex-start"
    justify={{ base: 'flex-start', lg: 'center' }}  // Centering on larger screens
>
    {isDesktop ? (
        <EmployeeSidebar
            collapsed={sidebarCollapsed}
            onToggleCollapsed={() => setSidebarCollapsed((v) => !v)}
        />
    ) : null}
    {/* Main content area */}
    <Flex
        flex="1"
        direction="column"
        bg={colorMode === 'light' ? 'white' : 'gray.700'}
        p={6}
        borderRadius="lg"
        boxShadow="lg"
    >
        <Heading as="h2" size="lg" textAlign="center" mb={6}>
            Employee Information
        </Heading>
        <EmployeeInfoForm />
    </Flex>

</Flex>

        <EmployeeNavDrawer isOpen={isOpen} onClose={onClose} />
        </Box>
    );
};

export default EmployeeInfoPage;
