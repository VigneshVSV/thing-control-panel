// Internal & 3rd party functional libraries
// Custom functional libraries
// Internal & 3rd party component libraries
import "@fontsource/roboto/300.css";
import "@fontsource/roboto/400.css";
import "@fontsource/roboto/500.css";
import "@fontsource/roboto/700.css";
import { Box, ThemeProvider } from "@mui/material";
// Custom component libraries
import { theme } from "./overall-theme";
import { DirectClient } from './builtins/client/view';



const App = () => {
    
    return (
        <Box id='main-layout' sx={{ display : 'flex', flexGrow : 1, alignItems : 'center'}}>
            <ThemeProvider theme={theme}>      
                <DirectClient />
            </ThemeProvider>
        </Box>
    )
}


export default App
