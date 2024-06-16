// Internal & 3rd party functional libraries
import { useState, useCallback } from "react";
// Custom functional libraries
// Internal & 3rd party component libraries
import NewWindow from "react-new-window";
import { Backdrop, Box, CircularProgress, IconButton, Stack, Typography } from "@mui/material"
import ArrowBackTwoToneIcon from '@mui/icons-material/ArrowBackTwoTone';
// Custom component libraries 



type TabPanelProps = {
    tree : string
    index: number;
    value: number;
    children?: React.ReactNode;
}

export const TabPanel = (props: TabPanelProps) => {
    const { tree, index, value, children, ...other } = props;
  
    return (
        <div
            id={`${tree}-tabpanel-${index}`}
            key={`${tree}-tabpanel-${index}`}
            role="tabpanel"
            hidden ={value !== index}
            {...other}
            style={{
                "width" : "100%",
                "height" : "100%"
            }}      
        >
            {value === index && (
                <Box sx={{ flexGrow: 1, display: 'flex', height : '100%' }}>
                    {children}
                </Box>
            )}
        </div>
    );
}



type ErrorViewerProps = {
    errorMessage : string | undefined | null
    errorTraceback? : string[] | null | undefined
    fontSize? : number
}

export const ErrorViewer = (props : ErrorViewerProps) => {

    return (
        <>
            {props.errorMessage ? 
                <Stack>
                    <Stack direction="row">
                        <Typography
                            id='error-title'
                            style={{ whiteSpace: 'pre' }} 
                            sx={{ pt : 1 }}
                            variant="caption" 
                            color="error" 
                            fontSize={props.fontSize? props.fontSize : 18}
                        >
                            {"ERROR : "} 
                        </Typography>
                        <Typography 
                            id='error-main-message'                         
                            sx={{ pt : 1 }} 
                            color="error" 
                            fontSize={props.fontSize? props.fontSize : 18} 
                            variant="caption"
                        >
                            {props.errorMessage}
                        </Typography>
                    </Stack>
                    {props.errorTraceback? props.errorTraceback.map((line : string, index : number) => 
                        {
                            if(index === 0) 
                                return <Typography 
                                            id='error-traceback-title'
                                            key='error-traceback-title'
                                            fontSize={props.fontSize? props.fontSize - 2 : 14} 
                                            style={{whiteSpace: 'pre'}} 
                                            variant="caption" 
                                            fontWeight={500}
                                            fontFamily="monospace"
                                        >
                                            {line}
                                        </Typography>       
                            else 
                                return <Typography 
                                            id='error-traceback-line'
                                            key={'error-traceback-title'+index.toString()}
                                            fontSize={props.fontSize? props.fontSize - 2 : 14} 
                                            style={{
                                                whiteSpace: 'pre', 
                                                }} 
                                            variant="caption"
                                            fontFamily="monospace"
                                        >
                                            {line}
                                        </Typography>
                        }) : 
                        null
                    }
                </Stack>
             
                : null 
            }
        </>
    )
}



type ErrorBackdropProps =  { 
    message : string, 
    goBack : any 
    subMessage? : string 
}

export const ErrorBackdrop = ({ message, subMessage, goBack } : ErrorBackdropProps) => {
    // https://mui.com/material-ui/react-backdrop/#system-SimpleBackdrop.js
    const [open, setOpen] = useState(true);
    const handleClose = useCallback(() => {
      setOpen(false);
    }, [])
  
    return (
        <Backdrop
            open={open}
            onClick={handleClose}
        >
            <Stack>
                <Typography color="inherit" variant="button">
                    {message}
                </Typography>
                {subMessage? 
                    <Typography color="inherit" variant="caption">
                        {subMessage}
                    </Typography> : null}
                <Box alignSelf={"center"}>
                    <IconButton size="large" onClick={goBack}>
                        <ArrowBackTwoToneIcon fontSize="large" />
                    </IconButton>
                </Box>
            </Stack>
        </Backdrop>
      
    );
}



export const LoadingBackdrop = ({ message, goBack } : ErrorBackdropProps) => {
    // https://mui.com/material-ui/react-backdrop/#system-SimpleBackdrop.js
    const [open, setOpen] = useState(true);
    const handleClose = useCallback(() => {
      setOpen(false);
    }, [])
  
    return (
        <Backdrop
            open={open}
            onClick={handleClose}
        >
            <Stack>
                <Stack direction="row">
                    <Typography color="inherit" variant="button" sx={{ pr : 5, pt : 1 }}>
                        {message}
                    </Typography>
                    <CircularProgress />
                </Stack> 
                <Box alignSelf={"center"}>   
                        <IconButton size="large" onClick={goBack}>
                            <ArrowBackTwoToneIcon fontSize="large" />
                        </IconButton>
                </Box>
            </Stack>
        </Backdrop>
      
    );
}



export const RenderInWindow = (props : any) => {
    // src: https://stackoverflow.com/questions/47574490/open-a-component-in-new-window-on-a-click-in-react
    // you may also check: https://github.com/rmariuzzo/react-new-window/blob/main/src/NewWindow.js
    // for stylesheet copy see: https://github.com/JakeGinnivan/react-popout/issues/15
    // https://stackoverflow.com/questions/63925086/styled-components-dynamic-css-is-not-generated-in-a-new-window
    // answer 3 did not work
    const [showPopout, setShowPopout] = useState(true)
    const [newWindowNode, setNewWindowNode] = useState(null)
  
    const nwRef = useCallback((node : any) => setNewWindowNode(node), [])
  
    return (
        <>
        {showPopout ? (
                // <StyleSheetManager 
                //     //@ts-ignore
                //     target={newWindowNode}>
                    <NewWindow
                        title="Title"
                        // features={{width: '960px', height: '600px'}}
                        onUnload={() => setShowPopout(false)}
                    >
                        <div ref={nwRef}>
                            {props.children}
                        </div>
                    </NewWindow>
                // </StyleSheetManager>
            ) : null}
        </>
    )
}





