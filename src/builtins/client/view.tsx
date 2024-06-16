// Internal & 3rd party functional libraries
import {  useState, useRef, useCallback, useEffect } from "react";
import { observer } from "mobx-react-lite";
// Custom functional libraries
// Internal & 3rd party component libraries
import { Box, Button, Stack, Tab, Tabs, Typography, TextField, Divider, 
    IconButton, Autocomplete, ButtonGroup, List, ListItem, ListItemButton, 
    ListItemText } from "@mui/material";
import ArrowBackTwoToneIcon from '@mui/icons-material/ArrowBackTwoTone';
import SaveTwoToneIcon from '@mui/icons-material/SaveTwoTone';
import OpenInNewTwoToneIcon from '@mui/icons-material/OpenInNewTwoTone';
import SettingsTwoToneIcon from '@mui/icons-material/SettingsTwoTone';
import SettingsEthernetTwoToneIcon from '@mui/icons-material/SettingsEthernetTwoTone';
import DeleteForeverIcon from '@mui/icons-material/DeleteForever';
import OpenInBrowserTwoToneIcon from '@mui/icons-material/OpenInBrowserTwoTone';
import CallReceivedTwoToneIcon from '@mui/icons-material/CallReceivedTwoTone';
import CopyAllTwoToneIcon from '@mui/icons-material/CopyAllTwoTone';
import NewWindow from "react-new-window";
// Custom component libraries 
import { EventInformation, MethodInformation, ParameterInformation, 
    ResourceInformation} from './thing-info'
import { ErrorBackdrop, TabPanel } from "../reuse-components";
import { defaultAppSettings } from "../app-settings";
import { SelectedParameterWindow } from "./property-client";
import { SelectedMethodWindow } from "./method-client";
import { SelectedEventWindow } from "./events-client";
import { ErrorBoundary, LiveLogViewer, ResponseLogs, UndockableConsole } from "./output-components";
import { ClassDocWindow } from "./doc-viewer";
import { RemoteObjectClientState } from "./state";

import "@fontsource/roboto/300.css";
import "@fontsource/roboto/400.css";
import "@fontsource/roboto/500.css";
import "@fontsource/roboto/700.css";


type RemoteObjectViewerProps = {
    clientState : RemoteObjectClientState
    unsafeClient : boolean 
    setGlobalLocation : any 
}

export const RemoteObjectViewer = observer( ({ clientState, unsafeClient, setGlobalLocation } : 
                                                                            RemoteObjectViewerProps ) => {
   
    return (
        <Box id ="remote-object-viewer" sx={{ flexGrow: 1, display: 'flex'}}>
            <Stack id="remote-object-viewer-page-layout" direction="row" sx={{ flexGrow: 1, display: 'flex'}}>
                <Stack 
                    id="client-main-vertical-layout" 
                    sx={{ flexGrow: 3, display : 'flex', pl : 3, pr : 3 }} 
                >
                    <RemoteObjectLocator 
                        clientState={clientState} 
                        setGlobalLocation={setGlobalLocation} 
                        unsafeClient={unsafeClient} 
                    />
                    <UndockableInteractionWindow clientState={clientState} />
                    <ErrorBoundary clientState={clientState} />      
                    <ResponseLogs clientState={clientState} />            
                    <UndockableConsole clientState={clientState} /> 
                </Stack>
            </Stack>
        </Box>
    )
})


type RemoteObjectLocatorProps = {
    clientState : RemoteObjectClientState
    setGlobalLocation : any
    unsafeClient : boolean
}

export const RemoteObjectLocator = observer(( {clientState, setGlobalLocation, unsafeClient } : RemoteObjectLocatorProps) => {

    return (
        <Stack id="remote-object-locator-layout" direction = "row" sx={{ flexGrow : 1, display : 'flex' }}>
            <Box sx={{ display : 'flex', pb : 3 }}>
                {unsafeClient?
                <>
                    <IconButton  onClick={() => setGlobalLocation('/')} sx={{ borderRadius : 0 }}> 
                        <ArrowBackTwoToneIcon  />
                    </IconButton>
                    {!clientState.showSettings ?
                        <IconButton onClick={() => clientState.setShowSettings(true)} sx={{ borderRadius : 0 }}>
                            <SettingsTwoToneIcon />
                        </IconButton> : 
                        <IconButton onClick={() => clientState.setShowSettings(false)} sx={{ borderRadius : 0 }}>
                            <SettingsEthernetTwoToneIcon />
                        </IconButton>
                    } 
                </> : null }
            </Box>
            <LocatorAutocomplete clientState={clientState} />
            <Box id="remote-object-loader-button-box" sx={{ flexGrow: 0.01, display : 'flex', pb : 3}} >
                <Button 
                    id="remote-object-load-using-locator"
                    size="small"
                    onClick={async() => await clientState.fetchRemoteObjectInfo()}
                    sx = {{ borderRadius : 0 }}
                >
                    Load
                </Button>
                <Divider orientation="vertical" />
                <IconButton
                    sx = {{ borderRadius : 0 }}
                    onClick={() => clientState.editURLsList(clientState.baseURL, 'ADD')} 
                >
                    <SaveTwoToneIcon />
                </IconButton>
                <IconButton 
                    id="remote-object-load-using-locator"
                    onClick={() => window.open(clientState.baseURL + '/resources/portal-app')}
                    sx = {{ borderRadius : 0 }}
                >
                    <OpenInNewTwoToneIcon /> 
                </IconButton>
                <Divider orientation="vertical"></Divider>
                <Button 
                    id="remote-object-load-using-locator"
                    size="small"
                    onClick={() => clientState.clearRemoteObjectInfo()}
                    sx = {{ borderRadius : 0 }}
                >
                    Clear
                </Button>
            </Box>
            {unsafeClient && clientState.remoteObjectInfo.instance_name?
                <Box sx={{ flexGrow: 1, display : 'flex', maxWidth : "25%", pb : 4, pt : 1 }}>
                    <StatusBar clientState={clientState} /> 
                </Box> : null
            }
        </Stack>            

    )
})


const LocatorAutocomplete = observer(( { clientState } : { clientState : RemoteObjectClientState }) => {

    // show delete button at given option
    const [autocompleteShowDeleteIcon, setAutocompleteShowDeleteIcon] = useState<string>('')
    const fetchSuccessful = clientState.fetchSuccessful

    return (
        <Autocomplete
            id="remote-object-locator-autocomplete"
            freeSolo
            disablePortal
            autoComplete    
            size="small"
            onChange={(event, name) => {clientState.updateURLprefixes(name as string)}}
            value={clientState.baseURL}
            options={clientState.existingRO_URLs}
            sx={{ flexGrow : 1, display: 'flex'}}
            renderInput={(params) => 
                <TextField
                    helperText="Remote Object Locator"
                    label="URL"
                    variant="filled"
                    error={!fetchSuccessful}
                    sx={{ flexGrow: 0.99, display : 'flex', borderRadius : 0 }}
                    onChange={(event) => clientState.updateURLprefixes(event.target.value)}
                    onKeyDown={async (event) => {
                        if (event.key === 'Enter') {
                            await clientState.fetchRemoteObjectInfo()
                        }
                    }}
                    {...params}    
                />}
            renderOption={(props, option : any, { selected }) => (
                <li 
                    {...props}
                    onMouseOver={() => setAutocompleteShowDeleteIcon(option)}
                    onMouseLeave={() => setAutocompleteShowDeleteIcon('')}
                >
                    <Typography 
                        sx={{ 
                            display : 'flex', flexGrow : 1, 
                            fontWeight : option === autocompleteShowDeleteIcon? 'bold' : null 
                        }}
                    >
                        {option}
                    </Typography>
                    {option === autocompleteShowDeleteIcon? 
                    <IconButton size="small" onClick={() => clientState.editURLsList(option, 'REMOVE')}>
                        <DeleteForeverIcon fontSize="small" />
                    </IconButton> : null }
                </li>)}
            />
    )
})


export const StatusBar = observer(( { clientState } : { clientState : RemoteObjectClientState }) => {

    const remoteObjectState = clientState.remoteObjectState
    const remoteObjectInfo = clientState.remoteObjectInfo
    
    return (
        <>
            {remoteObjectInfo.instance_name? 
                <Stack sx={{ flexGrow: 1, display : 'flex' }} direction='row'>
                    <ButtonGroup 
                        disableElevation
                        variant='contained'
                        color='secondary'
                        size="small"
                    >   
                        <Button>
                            Restart    
                        </Button>
                        <Button>
                            Kill    
                        </Button>
                        <Button>
                            Start    
                        </Button> 
                    </ButtonGroup>
                    {remoteObjectState? 
                        <Box sx ={{ pt : 0.5, pl : 2}}>
                            <Typography variant="button"  >
                                { "State : " + remoteObjectState} 
                            </Typography> 
                        </Box> : null }    
                </Stack> 
            : null}
        </>
    )
})



type TabPanelProps = { 
    clientState : RemoteObjectClientState
}

const remoteObjectFields = ['Parameters', 'Methods', 'Events', 'Doc', 'Default GUI', 'Database', 'Log Viewer']

const UndockableInteractionWindow = observer(( { clientState } : TabPanelProps ) => {

    const [currentTab, setCurrentTab] = useState<number>(-1)
    const [undock, setUndock] = useState<number>(-1)
    const [duplicates, setDuplicates] = useState<number[]>([])
    const undockedTab = useRef<number>(undock)
    const lastDuplicatedTab = useRef<number>(-1)

    const addDuplicateWindow = useCallback(() => {
        setDuplicates([...duplicates, currentTab])
        // not perfect
        // console.log([...duplicates, currentTab])
    }, [duplicates, currentTab])

    const removeDuplicateWindow = useCallback((index : number) => {
        duplicates.splice(index, 1)
        setDuplicates([...duplicates])
    }, [duplicates])
    
    useEffect(() => {
        let tab = 0
        if(!clientState.remoteObjectInfo.instance_name)
            tab = -1
        setCurrentTab(tab)
    }, [clientState.remoteObjectInfo.instance_name])

    const handleRemoteObjectFieldTabChange = useCallback(
        (event: React.SyntheticEvent, newValue: number) => {
            setCurrentTab(newValue);
    }, [])

    const undockWindow = useCallback(() => {
        undockedTab.current = currentTab
        setUndock(currentTab)
    }, [currentTab])

    const dockWindow = useCallback(() => {
        undockedTab.current = -1
        setUndock(-1)
    }, [])

    return(
        <Stack direction="row" sx={{ flexGrow : 1, display : 'flex' }}>
            <Stack>
                {undock >= 0? 
                    <IconButton size="small" sx={{ borderRadius : 0 }} onClick={dockWindow}>
                        <CallReceivedTwoToneIcon fontSize="small"/>
                    </IconButton>
                    : 
                    <IconButton size="small" sx={{ borderRadius : 0 }} onClick={undockWindow}>
                        <OpenInBrowserTwoToneIcon fontSize="small"/>
                    </IconButton>
                }
                <IconButton size="small" sx={{ borderRadius : 0 }} onClick={addDuplicateWindow}>
                    <CopyAllTwoToneIcon fontSize="small"/>
                </IconButton>
            </Stack>
            <Stack sx={{ flexGrow : 1, display : 'flex' }}>
                <Tabs 
                    id="remote-object-fields-tab"
                    variant="scrollable"
                    value={currentTab}
                    onChange={handleRemoteObjectFieldTabChange}
                    sx={{ borderBottom: 3, borderColor: 'divider', flexGrow : 1 }}
                >
                    {remoteObjectFields.map((name : string, index : number) => 
                        <Tab
                            key={"remote-object-fields-tab-" + name} 
                            id={"remote-object-fields-tab-" + name} 
                            label={name} 
                            sx={{ maxWidth : 150 }} 
                            disabled={!clientState.remoteObjectInfo.instance_name}
                        />
                    )}
                </Tabs>
                <Box sx={{ resize : 'vertical', height : clientState.remoteObjectInfo.instance_name? 400 : null, 
                    overflow : 'auto' }}>
                {remoteObjectFields.map((name : string, index : number) => {
                        if(index === undock)
                            return(
                                <NewWindow 
                                    name={`${remoteObjectFields[undockedTab.current]} - ${clientState.remoteObjectInfo.instance_name}`} 
                                    title={`${remoteObjectFields[undockedTab.current]} - ${clientState.remoteObjectInfo.instance_name}`}
                                    copyStyles={true}
                                >
                                    <Box sx={{ p : 5 }}>
                                        <Divider>
                                            <Typography variant="button">
                                                {remoteObjectFields[undockedTab.current]} - {clientState.remoteObjectInfo.instance_name}
                                            </Typography>
                                        </Divider>
                                        <Functionalities 
                                            clientState={clientState} 
                                            name={remoteObjectFields[undockedTab.current]} 
                                            undocked={undockedTab.current >= 0}
                                        />
                                    </Box>
                                </NewWindow>         
                            )
                        return (
                            <TabPanel 
                                key={"remote-object-fields-tabpanel-" + name} 
                                tree="remote-object-fields-tab"
                                index={index} 
                                value={currentTab} 
                            >   
                                <Functionalities 
                                    clientState={clientState} 
                                    name={name} 
                                    undocked={undockedTab.current === index}
                                />
                            </TabPanel>
                        )
                })}  
                </Box>                  
                {duplicates.map((tabNum : number, index : number) =>
                    <NewWindow 
                        name={`${remoteObjectFields[tabNum]} - ${clientState.remoteObjectInfo.instance_name} - no. ${index}`} 
                        title={`${remoteObjectFields[tabNum]} - ${clientState.remoteObjectInfo.instance_name} - no. ${index}`}
                        copyStyles={true}
                        onUnload={() => removeDuplicateWindow(index)}
                    >
                        <Box sx={{ p : 5 }}>
                            <Divider>
                                <Typography variant="button">
                                    {remoteObjectFields[tabNum]} - {clientState.remoteObjectInfo.instance_name}
                                </Typography>
                            </Divider>
                            <Functionalities 
                                clientState={clientState} 
                                name={remoteObjectFields[tabNum]} 
                                undocked={true}
                            />
                        </Box>
                    </NewWindow>
                )}
            </Stack>
        </Stack>
    )
})



type FunctionalitiesProps = {
    clientState : RemoteObjectClientState
    name : string
    undocked : boolean
}

const Functionalities = observer(( { clientState, name, undocked } : FunctionalitiesProps ) => {
   
    switch(name) {

        case 'Doc' : return <ClassDocWindow clientState={clientState}/>

        case 'Default GUI'   : return  <GUIViewer hasGUI={clientState.remoteObjectInfo.hasGUI}></GUIViewer>

        case 'Database' : return <Typography sx={{p : 2}}>No DB client</Typography>

        case 'Log Viewer' : return <LiveLogViewer clientState={clientState} />

        default : return (
                        <ObjectSelectWindow 
                            clientState={clientState} 
                            name={name} 
                            undocked={undocked}
                        />
                    )  
    }
})


export const ObjectSelectWindow = observer(( { clientState, name, undocked } : FunctionalitiesProps ) => {

    // parameter selection number
    const [selectedIndex, setSelectedIndex] = useState<Array<string|number>>(['RemoteObject', 0]);
    const handleListItemClick = (
            event: React.MouseEvent<HTMLDivElement, MouseEvent>,
            sortKey : string, index: number,
        ) => {
            setSelectedIndex([sortKey, index]);
            // console.log(sortKey, index, objects[sortKey][index])
    }//, [selectedIndex, setSelectedIndex])
    
    const objects = clientState.getObjects(name)

    return (
        <Stack direction='row' sx={{ flexGrow: 1 }} >
            <Stack id="object-selection-client-list-layout" sx={{ width : "50%", resize : 'horizontal', 
                overflow : 'auto', height : "100%"}}>
                <List
                    id="object-selection-client-fetched-objects-list"
                    dense
                    disablePadding
                    sx={{ flexGrow : 1 }}
                >
                    {Object.keys(objects).map((key : string) => {
                        if(objects[key].length === 0)
                            return <div key={key}></div>
                        else 
                            return (
                                <div key={key}>
                                    <Divider><Typography variant="button">{key.toUpperCase()}</Typography></Divider>
                                    {objects[key].map((object : ResourceInformation, index : number) => {
                                        return (
                                            <ListItem 
                                                key={`object-client-${name}-${object.name}`}
                                                id={`object-client-${name}-${object.name}`}
                                                alignItems="flex-start"
                                                disablePadding
                                            >
                                                <ListItemButton
                                                    key={`object-client-${name}-${object.name}-choosing-button`}
                                                    selected={selectedIndex[1] === index && selectedIndex[0] === key}
                                                    onClick={(event) => handleListItemClick(event, key, index)}
                                                >
                                                    <ListItemText 
                                                        key={`object-client-${name}-${object.name}-text-display`}
                                                        primary={
                                                            <Typography
                                                                sx={{ 
                                                                    display: 'flex', 
                                                                    justifyContent: 'space-between' 
                                                                }}
                                                            >
                                                                <span>{object.name}</span>
                                                                {object.type?
                                                                <span style={{color : 'rgba(0, 0, 0, 0.5)'}}>
                                                                    {object.type}
                                                                </span> : null}
                                                            </Typography>
                                                        }
                                                    />
                                                </ListItemButton>
                                            </ListItem>
                                        )
                                    })} 
                                </div>
                        )})}
                </List>
            </Stack>
            <Divider orientation="vertical" sx={{ borderWidth : 2 }} />
            <Box sx={{ width : "50%", pl : 2, pr : 1, overflow : 'auto', height : '100%' }}>
                {
                    objects[selectedIndex[0]] ?
                    objects[selectedIndex[0]][selectedIndex[1]] ? 
                    <ClientSelect 
                        clientState={clientState} 
                        object={objects[selectedIndex[0]][selectedIndex[1]]} 
                        name={name}
                    /> : null : null
                }
            </Box>
        </Stack>
    )
})


type ClientSelectProps = { 
    clientState : RemoteObjectClientState
    object : ResourceInformation
    name : string
}

export const ClientSelect = ({ clientState, object, name } : ClientSelectProps) => {
    
    switch(name) {

        case 'Events' : return (
                    <SelectedEventWindow 
                        event={object as EventInformation}
                        clientState={clientState}
                    />
                )

        case 'Methods' : return (
                    <SelectedMethodWindow 
                        method={object as MethodInformation}
                        clientState={clientState}
                    />
                )

        default : return (
                    <SelectedParameterWindow 
                        parameter={object as ParameterInformation} 
                        clientState={clientState}
                    /> 
                )
                
        } 
}

export const GUIViewer = (props : any) => {

    return (
        <>
            <Typography sx={{p : 2}}>No GUI logic implmeneted</Typography>
            {/* {props.hasGUI? 
                <DashboardView stateManager={dashboardStateManager} setGlobalLocation={null}/> :   
                    <Typography sx={{ p : 2 }}>
                        No GUI specified, consider setting RemoteObject.GUI parameter with 
                        scadapy.webdashboard.ReactApp subclass for convenience
                    </Typography>
            } */}
        </>
    )
}



export const DirectClient = () => {

    /* TODO 
    1. layout of console settings
    2. duplicate params, methods and events with same name 
    */
   
    const [showSettings, setShowSettings] = useState<boolean>(false)
    const dummyGlobalState = useRef({
        loggedIn : false,
        primaryHostServer : null, 
        additionalHostServers : [],
        servers  : [],
        // @ts-ignore
        HTTPServerWizardData: { remoteObjectWizardData: null },
        appsettings : defaultAppSettings
    })

    const clientState = useRef<RemoteObjectClientState>(new RemoteObjectClientState())

    return (     
        <Box 
            id='remote-object-viewer-unsafe-client-layout-box' 
            sx={{pt : 3, display : 'flex', flexGrow : 1, pb : 5}}
        > 
            {!showSettings? 
                <RemoteObjectViewer
                    // @ts-ignore
                    globalState={dummyGlobalState.current}
                    clientState={clientState.current}
                    unsafeClient={true}
                /> : 
                <ErrorBackdrop 
                    message="settings panel for unsafe client not implement yet"
                    goBack={() => setShowSettings(false)}    
                />
            }
        </Box>
    )
}

