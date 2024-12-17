// Internal & 3rd party functional libraries
// Custom functional libraries
// Internal & 3rd party component libraries
import "@fontsource/roboto/300.css";
import "@fontsource/roboto/400.css";
import "@fontsource/roboto/500.css";
import "@fontsource/roboto/700.css";
import { Box, Slide, Snackbar, ThemeProvider, Alert } from "@mui/material";
// Custom component libraries
import { theme } from "./overall-theme";
import { ThingClient } from './builtins/client/view';
import React from "react";



const App = () => {

    return (
        <Box id='main-layout' sx={{ display : 'flex', flexGrow : 1, alignItems : 'center'}}>
            <ThemeProvider theme={theme}>      
                <ThingClient />
                <OnLoadMessage />
            </ThemeProvider>
            
        </Box>
    )
}


const OnLoadMessage = () => {

    const [open, setOpen] = React.useState(true);

    const handleClose = (event?: React.SyntheticEvent, reason?: string) => {
        if (reason === 'clickaway') {
            return;
        }
        setOpen(false);
    };

    return (
        <Snackbar
            open={open}
            onClose={handleClose}
            TransitionComponent={(props) => <Slide {...props} direction="up" />}
            anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        >
            <Alert onClose={handleClose} severity="warning" sx={{ width: '100%' }}>
                This website makes cross domain requests, therefore:
                <ul>
                    <li>credentials are not supported</li>
                    <li>check your server configuration for CORS headers and allow CORS on the browser</li>
                    <li>please do report security issues at the GitHub Repository</li>
                </ul>
                Please use it at your own risk. This website also does not use cookies. 
            </Alert>
        </Snackbar>
    )
}


export default App



