import { createTheme } from '@mui/material/styles';


export const theme = createTheme({
    palette :{
        primary : {            
            main: '#153547',            
            contrastText: '#ffffff',
        },
        secondary: {           
            main: '#4a9ac6',            
            contrastText: '#ffffff',
        },
        background : {
            default : "#f9f9f9"
        },  
        error     : {
            main : '#ff4365',
            contrastText : '#ffffff'
        },
    },
    breakpoints: {
        values: {
            xs: 0,     // Extra small devices (portrait phones)
            sm: 600,   // Small devices (landscape phones)
            md: 960,   // Medium devices (tablets)
            lg: 1280,  // Large devices (desktops)
            xl: 1920,  // Extra large devices (large desktops)
        },
    }
})


