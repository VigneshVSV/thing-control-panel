// Internal & 3rd party functional libraries
import {  useState, useRef, useCallback, useContext, createContext, useEffect } from "react";
import * as React from "react";
import { observer } from "mobx-react-lite";
import '../../lib/wot-bundle.min.js';
// Custom functional libraries
import { EventInformation, ActionInformation, PropertyInformation, ResourceInformation, Thing} from './state'
import { AppSettings, ClientSettingsType, defaultClientSettings } from "./app-settings.js";
// Internal & 3rd party component libraries
import { Box, Button, Stack, Tab, Tabs, Typography, TextField, Divider,
    IconButton, Autocomplete, List, ListItem, ListItemButton, ListItemText, CircularProgress } from "@mui/material";
import SaveTwoToneIcon from '@mui/icons-material/SaveTwoTone';
import ArrowBackTwoToneIcon from '@mui/icons-material/ArrowBackTwoTone';
import OpenInNewTwoToneIcon from '@mui/icons-material/OpenInNewTwoTone';
import SettingsTwoToneIcon from '@mui/icons-material/SettingsTwoTone';
import DeleteForeverIcon from '@mui/icons-material/DeleteForever';
import OpenInBrowserTwoToneIcon from '@mui/icons-material/OpenInBrowserTwoTone';
import CallReceivedTwoToneIcon from '@mui/icons-material/CallReceivedTwoTone';
import CopyAllTwoToneIcon from '@mui/icons-material/CopyAllTwoTone';
import NewWindow from "react-new-window";
// Custom component libraries
import { TabPanel } from "../reuse-components";
import { SelectedPropertyWindow } from "./property-client";
import { SelectedActionWindow } from "./action-client";
import { SelectedEventWindow } from "./events-client";
import { ErrorBoundary, LiveLogViewer, ResponseLogs, UndockableConsole } from "./output-components";
import { ClassDocWindow } from "./doc-viewer";
import { useAutoCompleteOptionsFromLocalStorage, useLocalStorage } from "../hooks";



export const ThingViewer = () => {

    return (
        <Stack
            id="viewer-main-vertical-layout"
            sx={{ flexGrow: 3, display : 'flex', pl : 3, pr : 3 }}
        >  
            <FunctionalitiesView />
            <ErrorBoundary />
            <ResponseLogs />
            <UndockableConsole />
        </Stack>
    )
}



export const Locator = observer(() => {

    const [existingURLs, modifyOptions] = useAutoCompleteOptionsFromLocalStorage('thing-url-text-input')
    const [currentURL, setCurrentURL] = useState<string>(window.location ? window.location.hash ? window.location.hash.substring(1) : '' : '')
    const [loadingThing, setLoadingThing] = useState<boolean>(false)

    const thing = useContext(ThingManager) as Thing
    const { settings } = useContext(PageContext) as PageProps

    const fetchThing = useCallback(async(currentURL : string) => {
        setLoadingThing(true)
        await thing.fetch(currentURL, settings.defaultEndpoint)
        if(!thing.fetchSuccessful) {
            console.log("could not load thing")
            if(settings.console.stringifyOutput)
                console.log("last response from loading thing - ", JSON.stringify(thing.lastResponse, null, 2))
            else 
                console.log("last response from loading thing - ", thing.lastResponse)
            if(thing.errorMessage)
                console.log(thing.errorMessage)
            if(thing.errorTraceback)
                console.log(thing.errorTraceback)
        }
        setLoadingThing(false)
    }, [settings])

    useEffect(() => {
        if(!currentURL)
            return     
        fetchThing(currentURL)
    }, [])

    return (
        <Stack id="locator-horizontal-layout" direction="row" sx={{ flexGrow : 1, display : 'flex' }}>
            <LocatorAutocomplete 
                existingURLs={existingURLs}
                currentURL={currentURL}
                setCurrentURL={setCurrentURL}
                editURLsList={modifyOptions}
                fetchThing={fetchThing}
            />
            <Box id="loader-button-options-box" sx={{ flexGrow: 0.01, display : 'flex', pb : 3}} >
                <Button
                    id="load-thing-using-url-locator-button"
                    size="small"
                    onClick={async() => await fetchThing(currentURL)}
                    sx={{ borderRadius : 0 }}
                >
                    Load
                    {loadingThing? <Box sx={{ pl : 1, pt : 0.5 }}><CircularProgress size={20} /></Box>: null }
                </Button>
                <Divider orientation="vertical" />
                <IconButton
                    id='save-thing-url'
                    sx={{ borderRadius : 0 }}
                    onClick={() => modifyOptions(currentURL, 'ADD')}
                >
                    <SaveTwoToneIcon />
                </IconButton>
                <IconButton
                    id="open-resource-json-in-new-tab"
                    onClick={() => window.open(
                        settings.defaultEndpoint? currentURL + settings.defaultEndpoint :
                        currentURL )}
                    sx = {{ borderRadius : 0 }}
                >
                    <OpenInNewTwoToneIcon />
                </IconButton>
                <Divider orientation="vertical"></Divider>
                <Button
                    id="clear-thing"
                    size="small"
                    onClick={() => thing.clearState()}
                    sx = {{ borderRadius : 0 }}
                >
                    Clear
                </Button>
            </Box>
        </Stack>
    )
})



type LocatorAutocompleteProps = {
    existingURLs : string[]
    currentURL : string
    setCurrentURL : React.Dispatch<React.SetStateAction<string>>
    editURLsList : (inputURL : string, operation : 'ADD' | 'REMOVE') => void
    fetchThing : (currentURL : string) => void
}

const LocatorAutocomplete = ({ 
    existingURLs, 
    currentURL, 
    setCurrentURL, 
    editURLsList,
    fetchThing
} : LocatorAutocompleteProps) => {

    // show delete button at given option
    const [autocompleteShowDeleteIcon, setAutocompleteShowDeleteIcon] = useState<string>('')
    const thing = useContext(ThingManager) as Thing

    return (
        <Autocomplete
            id="locator-autocomplete"
            freeSolo
            disablePortal
            autoComplete
            size="small"
            onChange={(_, name) => {setCurrentURL(name as string)}}
            value={currentURL}
            options={existingURLs}
            sx={{ flexGrow : 1, display: 'flex'}}
            renderInput={(params) =>
                <TextField
                    label="URL"
                    variant="filled"
                    error={!thing.fetchSuccessful}
                    sx={{ flexGrow: 0.99, display : 'flex', borderRadius : 0 }}
                    onChange={(event) => setCurrentURL(event.target.value)}
                    onKeyDown={async (event) => {
                        if (event.key === 'Enter') {
                            await fetchThing(currentURL)
                        }
                    }}
                    {...params}
                />}
            renderOption={(props, option : any, {}) => (
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
                    <IconButton size="small" onClick={() => editURLsList(option, 'REMOVE')}>
                        <DeleteForeverIcon fontSize="small" />
                    </IconButton> : null }
                </li>)}
            />
    )
}



const thingOptions = ['Properties', 'Actions', 'Events', 'Doc/Description']

const FunctionalitiesView = observer(() => {

    const thing = useContext(ThingManager) as Thing
    const { settings } = useContext(PageContext) as PageProps
    const [currentTab, setCurrentTab] = useState<number>(0)
    const [undock, setUndock] = useState<number>(-1)
    const [duplicates, setDuplicates] = useState<number[]>([])
    const undockedTab = useRef<number>(undock)
    const [tabOrientation, _] = useState<"vertical" | "horizontal">(settings.tabOrientation)

    const handleTabChange = useCallback(
        (_: React.SyntheticEvent, newValue: number) => {
            setCurrentTab(newValue);
    }, [])

    const addDuplicateWindow = useCallback(() => {
        setDuplicates([...duplicates, currentTab])
        // not perfect
        // console.log([...duplicates, currentTab])
    }, [duplicates, currentTab])

    const removeDuplicateWindow = useCallback((index : number) => {
        duplicates.splice(index, 1)
        setDuplicates([...duplicates])
    }, [duplicates])

    const undockWindow = useCallback(() => {
        undockedTab.current = currentTab
        setUndock(currentTab)
    }, [currentTab])

    const dockWindow = useCallback(() => {
        undockedTab.current = -1
        setUndock(-1)
    }, [])

    return(
        <Stack
            direction='row'
            sx={{ flexGrow : 1, display : 'flex' }}
        >
            <Stack>
                {undock >= 0?
                    <IconButton id='undock-icon-button' size="small" sx={{ borderRadius : 0 }} onClick={dockWindow}>
                        <CallReceivedTwoToneIcon fontSize="small"/>
                    </IconButton>
                    :
                    <IconButton id='dock-icon-button' size="small" sx={{ borderRadius : 0 }} onClick={undockWindow}>
                        <OpenInBrowserTwoToneIcon fontSize="small"/>
                    </IconButton>
                }
                <IconButton id='copy-icon-button' size="small" sx={{ borderRadius : 0 }} onClick={addDuplicateWindow}>
                    <CopyAllTwoToneIcon fontSize="small"/>
                </IconButton>
            </Stack>
            <Stack sx={{ flexGrow : 1, display : 'flex' }} direction={tabOrientation === 'vertical'? 'row' : 'column'}>
                <Tabs
                    id="thing-options-tabs"
                    variant="scrollable"
                    value={currentTab}
                    onChange={handleTabChange}
                    orientation={tabOrientation}
                    sx={{
                        border : tabOrientation == 'vertical' ? 1 : null,
                        borderRight: tabOrientation === 'vertical'? 3 : 1,
                        borderBottom: tabOrientation === 'vertical'? 1 : 3,
                        flexGrow : tabOrientation === 'vertical'? null : 1,
                        borderColor: 'divider'
                    }}
                >
                    {thingOptions.map((name : string) =>
                        <Tab
                            key={"thing-options-tab-" + name}
                            id={"thing-options-tab-" + name}
                            label={name}
                            sx={{ maxWidth : 150 }}
                            disabled={!thing.info.id}
                        />
                    )}
                </Tabs>
                <Box
                    sx={{
                        resize : 'vertical', height : thing.info.id? 400 : null,
                        overflow : 'auto', flexGrow : 1, border : 1, borderColor : 'divider'
                    }}
                >
                {thingOptions.map((name : string, index : number) => {
                        if(index === undock)
                            return(
                                <NewWindow
                                    key={`${thingOptions[undockedTab.current]} - ${thing.info.id}`}
                                    name={`${thingOptions[undockedTab.current]} - ${thing.info.id}`}
                                    title={`${thingOptions[undockedTab.current]} - ${thing.info.id}`}
                                    copyStyles={true}
                                >
                                    <Box id='functionalities-box-new-window' sx={{ p : 5 }}>
                                        <Divider id='functionalities-title'>
                                            <Typography variant="button">
                                                {thingOptions[undockedTab.current]} - {thing.info.id}
                                            </Typography>
                                        </Divider>
                                        <Functionalities type={thingOptions[undockedTab.current]} />
                                        {/* undocked={undockedTab.current >= 0} */}
                                    </Box>
                                </NewWindow>
                            )
                        return (
                            <TabPanel
                                key={"thing-options-native-tabpanel-" + name}
                                tree="thing-options-tab"
                                index={index}
                                value={currentTab}
                            >
                                <Functionalities type={name} />
                                {/* undocked={undockedTab.current === index} */}
                            </TabPanel>
                        )
                })}
                </Box>
                {duplicates.map((tabNum : number, index : number) =>
                    <NewWindow
                        key={`${thingOptions[tabNum]} - ${thing.info.id} - no. ${index}`}
                        name={`${thingOptions[tabNum]} - ${thing.info.id} - no. ${index}`}
                        title={`${thingOptions[tabNum]} - ${thing.info.id} - no. ${index}`}
                        copyStyles={true}
                        onUnload={() => removeDuplicateWindow(index)}
                    >
                        <Box id='functionalities-box-new-window-copied' sx={{ p : 5 }}>
                            <Divider>
                                <Typography variant="button">
                                    {thingOptions[tabNum]} - {thing.info.id}
                                </Typography>
                            </Divider>
                            <Functionalities type={thingOptions[tabNum]} />
                        </Box>
                    </NewWindow>
                )}
            </Stack>
        </Stack>
    )
})



const Functionalities = observer(({ type } : { type : string }) => {

    switch(type) {

        case 'Doc/Description' : return <ClassDocWindow />

        case 'Database' : return <Typography sx={{p : 2}}>No DB client</Typography>

        //  case 'Log Viewer' : return <LiveLogViewer />

        default : return <InteractionAffordancesView type={type as "Properties" | "Actions" | "Events"} />
                   
    }
})



export const InteractionAffordancesView = observer(({ type } : { type : "Properties" | "Actions" | "Events" }) => {

    const thing = useContext(ThingManager) as Thing

    // interaction affordance object selection number
    const objects = thing.getInteractionAffordances(type)
    const [selectedIndex, setSelectedIndex] = useState<number>(0);
    const handleListItemClick = useCallback((
            _ : React.MouseEvent<HTMLDivElement, MouseEvent>,
            index: number,
        ) => {
            setSelectedIndex(index);
            // console.log(sortKey, index, objects[sortKey][index])
    }, [setSelectedIndex])

    return (
        <Stack direction='row' sx={{ flexGrow: 1 }} >
            <Box
                id="interaction-affordance-object-selection-list-layout" 
                sx={{ 
                    width : "50%", resize : 'horizontal',
                    overflow : 'auto', height : "100%"
                }}
            >
                <List
                    id="interaction-affordance-objects-list"
                    dense
                    disablePadding
                    sx={{ flexGrow : 1 }}
                >
                    {objects.map((object : ResourceInformation, index : number) => {
                        return (
                            <ListItem
                                key={`interaction-affordance-client-${type}-${object.name}`}
                                id={`interaction-affordance-${type}-${object.name}`}
                                alignItems="flex-start"
                                disablePadding
                            >
                                <ListItemButton
                                    key={`interaction-affordance-${type}-${object.name}-choosing-button`}
                                    selected={selectedIndex === index}
                                    onClick={(event) => handleListItemClick(event, index)}
                                >
                                    <ListItemText
                                        key={`interaction-affordance-${type}-${object.name}-text-display`}
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
                                                    </span> 
                                                    : 
                                                    null
                                                }
                                            </Typography>
                                        }
                                    />
                                </ListItemButton>
                            </ListItem>
                        )
                    })}
                </List>
            </Box>
            <Divider orientation="vertical" sx={{ borderWidth : 2 }} />
            <Box sx={{ width : "50%", pl : 2, pr : 1, overflow : 'auto', height : '100%' }}>
                {
                    objects[selectedIndex] ?
                    <InteractionAffordanceSelect
                        object={objects[selectedIndex]}
                        type={type}
                    /> : null 
                }
            </Box>
        </Stack>
    )
})



type InteractionAffordanceSelectProps = {
    object : ResourceInformation
    type : string
}

export const InteractionAffordanceSelect = ({ object, type } : InteractionAffordanceSelectProps) => {
    switch(type) {
        case 'Events' : return <SelectedEventWindow event={object as EventInformation} />                
        case 'Actions' : return <SelectedActionWindow action={object as ActionInformation} />                
        default : return <SelectedPropertyWindow property={object as PropertyInformation} />
    }
}



export type PageProps = {
    settings : ClientSettingsType
    updateSettings : React.Dispatch<React.SetStateAction<ClientSettingsType>>
    showSettings : boolean
    setShowSettings : React.Dispatch<React.SetStateAction<boolean>> | Function
    updateLocalStorage : (value : any) => void
}

export const ThingManager = createContext<Thing | null>(null)
export const PageContext = createContext<any>({
    settings : defaultClientSettings,
    updateSettings : () => {},
    showSettings : false,
    setShowSettings : () => {},
    updateLocalStorage : (_ : any) => {},
})

export const ThingClient = () => {

    const [_existingSettings, updateLocalStorage] = useLocalStorage('thing-viewer-settings', defaultClientSettings)
    const [settings, updateSettings] = useState<ClientSettingsType>(_existingSettings)
    const [showSettings, setShowSettings] = useState<boolean>(false)
    const [pageState, _] = useState({ settings, updateSettings, showSettings, setShowSettings, updateLocalStorage })
    const thing = useRef<Thing>(new Thing())

    /* 
    Thing Client composes Thing Viewer, Location and Settings components which controls the settings of the client

    1. There is a client worker state which controls the state of the interactions with the thing with MobX. 
    The values contained within this state are always related to application data, never purely component rendering data.
    The purely component rendering data is left to react own's state management.

    2. purely component rendering data may be also part of contexts
    */
   useEffect(() => {
        const startServient = async() => {
            // @ts-expect-error
            const servient = new Wot.Core.Servient(); 
            // Wot.Core is auto-imported by wot-bundle.min.js
            // @ts-expect-error
            servient.addClientFactory(new Wot.Http.HttpsClientFactory({ allowSelfSigned : true }))
            servient.start().then((WoT : any) => {
                console.log("WoT servient started")
                thing.current.servient = servient  
                thing.current.wot = WoT
            })
        }
        startServient()
        return () => {
            thing.current.cancelAllEvents()
            thing.current.servient.shutdown()
        }
   }, [])


    return (
        <Box
            id='client-layout-box'
            sx={{pt : 3, display : 'flex', flexGrow : 1, pb : 5}}
        >
            <PageContext.Provider value={pageState}>
                <ThingManager.Provider value={thing.current}>
                    <Stack id="thing-viewer-page-layout" sx={{ flexGrow: 1, display: 'flex'}}>
                        <Stack direction="row" sx={{ flexGrow: 1, display : 'flex' }}>
                            <Box sx={{ display : 'flex', pb : 3 }}>
                                {!showSettings ?
                                    <IconButton id='show-settings-icon' onClick={() => setShowSettings(true)} sx={{ borderRadius : 0 }}>
                                        <SettingsTwoToneIcon />
                                    </IconButton> : 
                                    <IconButton id='hide-settings-icon' onClick={() => setShowSettings(false)} sx={{ borderRadius : 0 }}>
                                        <ArrowBackTwoToneIcon />
                                    </IconButton>
                                }
                            </Box>
                            <Locator />
                        </Stack>
                        {showSettings?
                            <AppSettings globalState={null} />
                            : 
                            <ThingViewer />
                        }
                    </Stack>
                </ThingManager.Provider>
            </PageContext.Provider>
        </Box>
    )
}

