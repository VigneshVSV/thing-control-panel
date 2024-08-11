// Internal & 3rd party functional libraries
import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { observer } from "mobx-react-lite";
import axios from "axios";
// Custom functional libraries
// Internal & 3rd party component libraries
import { Grid, Typography, FormControlLabel, Switch, Divider, Box, 
    OutlinedInput, InputAdornment, IconButton, Stack, Checkbox, Select, MenuItem, 
    InputLabel, FormControl, SelectChangeEvent } from "@mui/material"
import * as IconsMaterial from '@mui/icons-material';
// Custom component libraries 

import { stringToObject } from "../utils";
import { toJS } from "mobx";
import { allowedConsoleFontSizes, allowedConsoleMaxEntries, allowedConsoleWindowSizes, 
        allowedLogIntervals } from "./output-components";
import { PageContext, PageProps } from "./view";



type SettingsProps = {
    updateSettingsInStorage : (URL : string, settingName : string, value : any, event : React.BaseSyntheticEvent | any) => Promise<void>
}

const SettingsUpdateContext = createContext<SettingsProps | null>(null)
  

type SettingRowProps = {
    title : string 
    description? : string
    children : JSX.Element[] | JSX.Element
}

export const SettingRow = ( {title, description, children} : SettingRowProps) => {

    return (
        <Box sx={{ pl: 3, pb : 0, pt :0 }}>
            <Grid container direction='row' columns = {12}>
                <Grid item xs={0.5} >
                    <div id="left-to-title-desc-spacer"></div>
                </Grid>
                <Grid item xs={2.5}>
                    <Box sx={{ pl: 3, pr :3, pt: 0, pb : 0 }} >
                        <Stack>
                            <Typography fontSize={20} variant='overline'>{title}</Typography>
                            <Typography fontSize={14} variant='caption'>{description}</Typography>
                        </Stack>
                    </Box>
                </Grid>
                <Grid item xs={1} >
                    <div id="right-to-title-desc-spacer"></div>
                </Grid>
                <Grid item xs={5} >
                    {children}
                </Grid>
                <Grid item xs={10} sx={{ pt : 3, pb : 3  }} >
                    <Divider></Divider>
                </Grid>
            </Grid>
        </Box>
    )
}



const EditableTextSetting = observer(({ settingName, settingURL, initialValue, placeHolder, helperText } : 
    { settingName : string, settingURL : string, initialValue : string, placeHolder : string, helperText : string}) => {

    const { updateSettingsInStorage } = useContext(SettingsUpdateContext) as SettingsProps

    const [edit, setEdit] = useState<boolean>(false)
    const [value, setValue] = useState<string>(initialValue)

    useEffect(() =>
        setValue(initialValue)
    , [initialValue])
  
    return(
        <>
            <OutlinedInput
                size='small' 
                fullWidth 
                placeholder={placeHolder}
                sx={{ pl : 0 }}
                disabled={!edit}
                value={value}
                onChange={(event: React.ChangeEvent<HTMLInputElement>) => setValue(event.target.value)}
                startAdornment = {
                    <InputAdornment position='start'>
                        {edit? 
                            <IconButton 
                                sx={{bgcolor : '#808080', borderRadius : 0 }}
                                onClick={async () =>  {
                                    await updateSettingsInStorage(settingURL, settingName, value, null)
                                    setEdit(!edit)
                                }}
                                >
                                <IconsMaterial.DoneOutlineTwoTone />
                            </IconButton>
                            :
                            <IconButton 
                                sx={{ bgcolor : '#808080', borderRadius : 0 }}
                                onClick={() => setEdit(true)}
                            >
                                <IconsMaterial.EditTwoTone />
                            </IconButton>
                        }
                    </InputAdornment>
                }
            />
            <Typography variant="caption" >{helperText}</Typography>
        </>
    )
})


const BooleanSwitchSetting = observer(({ label, initialValue, settingName, settingURL } : 
    { label : string, initialValue : boolean, settingName : string, settingURL : string }) => {

    const { updateSettingsInStorage } = useContext(SettingsUpdateContext) as SettingsProps
    const [checked, setChecked] = useState<boolean>(initialValue)

    useEffect(() =>
        setChecked(initialValue)
    , [initialValue])
    
    return (
        <FormControlLabel 
            id={label.replace(' ', '-')}
            label={label} 
            control={
                <Switch 
                    checked={checked} 
                    onChange={async (event: React.ChangeEvent<HTMLInputElement>) => 
                        await updateSettingsInStorage(settingURL, settingName, event.target.checked, event)
                    }
                />
            } 
        />
    )
})


// following only as an visual alternative
const BooleanCheckboxSetting = observer(({ label, initialValue, settingName, settingURL } : 
    { label : string, initialValue : boolean, settingName : string, settingURL : string }) => {

    const { updateSettingsInStorage } = useContext(SettingsUpdateContext) as SettingsProps
    const [checked, setChecked] = useState<boolean>(initialValue)
   
    useEffect(() =>
        setChecked(initialValue)
    , [initialValue])
    
    return (
        <FormControlLabel 
            id={label.replace(' ', '-')}
            label={label} 
            control={
                <Checkbox
                    checked={checked} 
                    onChange={async (event: React.ChangeEvent<HTMLInputElement>) => 
                        await updateSettingsInStorage(settingURL, settingName, event.target.checked, event)
                    }
                />
            } 
        />
    )
})



const SelectSetting = observer(( { label, initialValue, allowedValues, settingName, settingURL } : 
    { label : string, initialValue : any, allowedValues : any[], settingName : string, settingURL : string}) => {
    
    const { updateSettingsInStorage } = useContext(SettingsUpdateContext) as SettingsProps
    const [value, setValue] = useState(initialValue)

    useEffect(() => {
        setValue(initialValue)
    }, [initialValue]) 

    let id = label.replace(' ', '-')
    // mostly useState and useEffect is not necessary - can be removed someday

    const handleChange = useCallback(async(event : SelectChangeEvent) => {
        await updateSettingsInStorage(settingURL, settingName, event.target.value, event)
    }, [settingName, settingURL])

    return (
        <FormControl id={id+'-form'} >
            <InputLabel id={id+"-label"}>{label}</InputLabel>
            <Select
                id={id+"-seöect"}
                label={label}
                value={value}
                size="small"
                variant="standard"
                sx={{ width : 120 }}
                onChange={handleChange}
            >
                {allowedValues.map((value : string, index : number) => 
                    <MenuItem key={`$${id}-selector-${value}-at-pos-${index}`} value={value}>{value}</MenuItem>)}
            </Select>
        </FormControl>
    )
})



export const LoginPageSettings = observer(() => {

    const { settings } = useContext(PageContext) as PageProps
 
    return (
        <Box sx={{p : 1, pl : 10 }}>
            <Grid container direction='column' spacing={3}>
                <Grid item>
                    <BooleanSwitchSetting
                        settingName="login.displayFooter"
                        settingURL="/login"
                        initialValue={settings.login.displayFooter} 
                        label="show footer label at login"
                    />
                   
                </Grid>
                {/* <Grid item>
                    <EditableTextSetting 
                        settingName="login.footer"
                        settingURL="/login"
                        initialValue={settings.login.footer} 
                        placeHolder="login footer display name"
                    />
                </Grid>
                <Grid item>
                    <EditableTextSetting 
                        settingName="login.footerLink"
                        settingURL="/login"
                        initialValue={settings.login.footerLink}
                        placeHolder="login footer link" 
                    />
                </Grid> */}
            </Grid>
        </Box>            
    )
})



const ThingViewerSettings = () => {

    const { settings } = useContext(PageContext) as PageProps
    
    return (
        <Box sx={{p : 1, pl : 10 }}>
            <Typography variant="button">Console</Typography>
            <Grid container direction='row' id="remote-object-viewer-console-settings">
                <Grid item>
                    <BooleanCheckboxSetting
                        settingName="console.stringifyOutput"
                        settingURL="/remote-object-viewer"
                        initialValue={settings.console.stringifyOutput}
                        label="stringify output"
                    />
                </Grid>
                <Grid item sx={{ pl : 2 }}>
                    <SelectSetting 
                        settingName="console.defaultFontSize"
                        settingURL="/remote-object-viewer"
                        label="Font Size"
                        initialValue={settings.console.defaultFontSize}
                        allowedValues={allowedConsoleFontSizes}
                    />
                </Grid>
                <Grid item sx={{ pl : 2 }}>
                    <SelectSetting 
                        settingName="console.defaultWindowSize"
                        settingURL="/remote-object-viewer"
                        label="Window Size"
                        initialValue={settings.console.defaultWindowSize}
                        allowedValues={allowedConsoleWindowSizes}
                    />
                </Grid>
                <Grid item sx={{ pl : 2 }}>
                    <SelectSetting 
                        settingName="console.defaultMaxEntries"
                        settingURL="/remote-object-viewer"
                        label="Max Entries"
                        initialValue={settings.console.defaultMaxEntries}
                        allowedValues={allowedConsoleMaxEntries}
                    />
                </Grid> 
            </Grid>
            <Box sx={{p : 1}}/>
            <Typography variant="button">Log Viewer</Typography>          
            <Grid container direction='row' id="remote-object-viewer-log-viewer-settings" sx={{pt : 2}}>
                <Grid item>
                    <SelectSetting 
                        settingName="settings.defaultFontSize"
                        settingURL="/remote-object-viewer"
                        label="Font Size"
                        initialValue={settings.logViewer.defaultFontSize}
                        allowedValues={allowedConsoleFontSizes}
                    />
                </Grid>
                <Grid item sx={{ pl : 2 }}>
                    <SelectSetting 
                        settingName="settings.defaultWindowSize"
                        settingURL="/remote-object-viewer"
                        label="Window Size"
                        initialValue={settings.logViewer.defaultWindowSize}
                        allowedValues={allowedConsoleWindowSizes}
                    />
                </Grid>
                <Grid item sx={{ pl : 2 }}>
                    <SelectSetting
                        settingName="settings.defaultInterval"
                        settingURL="/remote-object-viewer"
                        label="Interval"
                        initialValue={settings.logViewer.defaultInterval}
                        allowedValues={allowedLogIntervals}
                    />
                </Grid> 
                <Grid item sx={{ pl : 2 }}>
                    <SelectSetting
                        settingName="settings.defaultMaxEntries"
                        settingURL="/remote-object-viewer"
                        label="Max Entries"
                        initialValue={settings.logViewer.defaultMaxEntries}
                        allowedValues={allowedConsoleMaxEntries}
                    />
                </Grid> 
            </Grid>
        </Box>        
    )
}



const OtherSettings = () => {
    
    const { settings } = useContext(PageContext) as PageProps

    return (
        <Box sx={{ pl : 10 }}>
            <Grid container direction='column' id="dashboards-settings">
                <Typography variant="button" sx={{ pt : 2 }}>Other Settings</Typography>     
                <Grid item sx={{ pt : 2 }}>
                    <SelectSetting
                        settingName="tabOrientation"
                        settingURL="/thing-viewer"
                        initialValue={settings.tabOrientation}
                        label="tab orientation"
                        allowedValues={["horizontal", "vertical"]}
                    />
                </Grid>
                <Grid item sx={{ pt : 2 }}>
                    <Box sx={{ maxWidth : 500 }}>
                        <EditableTextSetting 
                            settingName="defaultEndpoint"
                            settingURL="/thing-viewer"
                            initialValue={settings.defaultEndpoint}
                            placeHolder="default endpoint for fetching thing description"
                            helperText="default endpoint for fetching thing description in addition to the main server URL which is entered in the URL input"
                        />
                    </Box>
                </Grid>
                <Grid item sx={{pt : 2}}>
                    <BooleanSwitchSetting 
                        settingName="updateLocalStorage"
                        settingURL="/thing-viewer"
                        label="Auto save changes"
                        initialValue={settings.updateLocalStorage}
                    />
                </Grid>
                {/* <Grid item>
                    <BooleanSwitchSetting 
                        settingName="others.WOTTerminology"
                        settingURL="/others"
                        label="Use Web of Things terminology"
                        initialValue={globalState.appsettings.others.WOTTerminology}
                    />
                </Grid> */}
            </Grid>
        </Box>
    )
}


const updateNestedSetting = (obj: any, keys: string[], value: any) => {
    const key = keys.shift();
    if (key && keys.length > 0) {
        if (!obj[key]) {
            obj[key] = {};
        }
        updateNestedSetting(obj[key], keys, value);
    } else if (key) {
        obj[key] = value;
    }
};


export const AppSettings = ( { globalState } : { globalState : any }) => {

    const { settings, updateSettings, updateLocalStorage } = useContext(PageContext) as PageProps

    const updateSettingsInStorage = useCallback(async(URL : string, settingName : string, value : any, 
                                                event : React.BaseSyntheticEvent | any) => {
            
        if(event)
            event.preventDefault()
        if (globalState) {
            try {   
                const response = await axios.patch(
                                `${globalState.primaryHostServer}/app-settings${URL}`, 
                                stringToObject(settingName.split('.').slice(1).join('.'), value, {}), 
                                { withCredentials : true }
                            )
                if(response.status === 200) 
                    globalState.updateSetting(settingName, value)
                console.log("app setting updated", toJS(settings))
            } catch (error) {

            }
        }
        else {
            const settingKeys = settingName.split('.');
            console.log(settingKeys)
            updateNestedSetting(settings, settingKeys, value);
            updateSettings(JSON.parse(JSON.stringify(settings)))
            updateLocalStorage(settings)
        }
    }, [globalState, settings, updateSettings, updateLocalStorage])

    useEffect(() => {
        const fetchSettings = async() => {
            if(globalState) {
                try {
                    const response = await axios.get(
                        `${globalState.primaryHostServer}/app-settings`,
                        { withCredentials : true }
                    )
                    if(response.status === 200) 
                        globalState.updateSettings(response.data)
                    console.log("app setting loaded", toJS(settings))
                } catch(error :  any) {
                    
                }
            }
        }
        fetchSettings()
    }, [globalState])

    return (
        <Grid container direction = 'column' sx={{ flexWrap: 'nowrap' }}>
            <SettingsUpdateContext.Provider value={{ updateSettingsInStorage }}>
                <ThingViewerSettings />
                <OtherSettings />
                {/* <LoginPageSettings />  */}
                
            </SettingsUpdateContext.Provider>
        </Grid>
    )
}


/*
<SettingsRow
title = 'Main Server'
>
<Grid container direction='column' spacing={3} columns={6}  sx={{ flexWrap: 'nowrap' }}>
    <Grid item>
        <OutlinedInput
            size='small' 
            fullWidth placeholder='Server URL'
            sx={{ paddingLeft:0 }}
            startAdornment = {
                <InputAdornment position='start'>
                    <OutlinedInputIconButton sx = {{bgcolor : '#808080'}}>
                        <EditTwoToneIcon></EditTwoToneIcon>
                    </OutlinedInputIconButton>
                </InputAdornment>
            }
        />
    </Grid>
    <Grid item xs={3} >
        <OutlinedInput
            size='small' 
            placeholder='password'
            sx={{ 
                paddingLeft:0,
                borderTopRightRadius:0,
                borderBottomRightRadius:0,
                minWidth: '50%'
            }}
            startAdornment = {
                <InputAdornment position='start'>
                    <OutlinedInputIconButton sx = {{bgcolor : '#808080'}}>
                        <EditTwoToneIcon></EditTwoToneIcon>
                    </OutlinedInputIconButton>
                </InputAdornment>
            }
        />
        <TextField variant='outlined' size='small' placeholder='repeat password'
            sx ={{
                minWidth: '50%',
                '& fieldset' : {
                    borderTopLeftRadius: 0,
                    borderBottomLeftRadius: 0        
                }
            }}
        ></TextField>
    </Grid>
    <Grid item>
        <FormControlLabel control={<Switch defaultChecked />} label="delete without asking" />
    </Grid>
</Grid> 
</SettingsRow>
*/




export type ClientSettingsType = {
    tabOrientation : "horizontal" | "vertical",
    updateLocalStorage : boolean,
    windowZoom : number,
    defaultEndpoint : string,
    login : {
        displayFooter : boolean
        footer : string
        footerLink : string
    }
    console : {
        stringifyOutput : boolean 
        defaultMaxEntries : number 
        defaultWindowSize : number
        defaultFontSize : number
    }
    logViewer : {
        defaultMaxEntries : number 
        defaultWindowSize : number
        defaultFontSize : number
        defaultInterval : number
    }
}

export const defaultClientSettings : ClientSettingsType = {
    tabOrientation : 'vertical',
    updateLocalStorage : false,
    windowZoom : 100,
    defaultEndpoint : "/resources/portal-app?ignore_errors=true",
    login : {
        displayFooter : true,
        footer : "",
        footerLink : ""
    },
    console : {
        stringifyOutput : false,
        defaultMaxEntries : 10,
        defaultWindowSize : 500,
        defaultFontSize : 16,
    },
    logViewer : {
        defaultMaxEntries : 10,
        defaultWindowSize : 500,
        defaultFontSize : 16,
        defaultInterval : 2
    }
}
