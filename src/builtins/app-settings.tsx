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

import { stringToObject } from "./utils";
import { toJS } from "mobx";
import { allowedConsoleFontSizes, allowedConsoleMaxEntries, allowedConsoleWindowSizes, 
        allowedLogIntervals } from "./client/output-components";




type SettingsProps = {
    updateSetting : (URL : string, settingName : string, value : any, event : React.BaseSyntheticEvent | any) => Promise<void>
}

const SettingsContext = createContext<SettingsProps | null>(null)
  

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



const EditableTextSetting = observer(({ settingName, settingURL, initialValue, placeHolder } : 
    { settingName : string, settingURL : string, initialValue : string, placeHolder : string}) => {

    const { updateSetting } = useContext(SettingsContext) as SettingsProps

    const [edit, setEdit] = useState<boolean>(false)
    const [value, setValue] = useState<string>(initialValue)

    useEffect(() =>
        setValue(initialValue)
    , [initialValue])
  
    return(
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
                                await updateSetting(settingURL, settingName, value, null)
                                setEdit(!edit)
                            }}
                        >
                            <IconsMaterial.DoneOutlineTwoTone />
                        </IconButton>
                        :
                        <IconButton 
                            sx={{bgcolor : '#808080', borderRadius : 0 }}
                            onClick={() => setEdit(true)}
                        >
                            <IconsMaterial.EditTwoTone />
                        </IconButton>
                    }
                </InputAdornment>
            }
        />
    )
})


const BooleanSwitchSetting = observer(({ label, initialValue, settingName, settingURL } : 
    { label : string, initialValue : boolean, settingName : string, settingURL : string }) => {

    const { updateSetting } = useContext(SettingsContext) as SettingsProps
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
                        await updateSetting(settingURL, settingName, event.target.checked, event)
                    }
                />
            } 
        />
    )
})


// following only as an visual alternative
const BooleanCheckboxSetting = observer(({ label, initialValue, settingName, settingURL } : 
    { label : string, initialValue : boolean, settingName : string, settingURL : string }) => {

    const { updateSetting } = useContext(SettingsContext) as SettingsProps
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
                        await updateSetting(settingURL, settingName, event.target.checked, event)
                    }
                />
            } 
        />
    )
})



const SelectSetting = observer(( { label, initialValue, allowedValues, settingName, settingURL } : 
    { label : string, initialValue : any, allowedValues : any[], settingName : string, settingURL : string}) => {
    
    const { updateSetting } = useContext(SettingsContext) as SettingsProps
    const [value, setValue] = useState(initialValue)

    useEffect(() => {
        setValue(initialValue)
    }, [initialValue]) 

    let id = label.replace(' ', '-')
    // mostly useState and useEffect is not necessary - can be removed someday

    const handleChange = useCallback(async(event : SelectChangeEvent) => {
        await updateSetting(settingURL, settingName, event.target.value, event)
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
                sx={{ width : 100 }}
                onChange={handleChange}
            >
                {allowedValues.map((value : string, index : number) => 
                    <MenuItem key={`$${id}-selector-${value}-at-pos-${index}`} value={value}>{value}</MenuItem>)}
            </Select>
        </FormControl>
    )
})



export const LoginPageSettings = observer(() => {

    const { globalState } = useContext(AppContext) as AppProps
 
    return (
        <SettingRow
            title='Login Page'
            description=''
        >
            <Grid container direction='column' spacing={3}>
                <Grid item>
                    <BooleanSwitchSetting
                        settingName="login.displayFooter"
                        settingURL="/login"
                        initialValue={globalState.appsettings.login.displayFooter} 
                        label="show footer label at login"
                    />
                   
                </Grid>
                <Grid item>
                    <EditableTextSetting 
                        settingName="login.footer"
                        settingURL="/login"
                        initialValue={globalState.appsettings.login.footer} 
                        placeHolder="login footer display name"
                    />
                </Grid>
                <Grid item>
                    <EditableTextSetting 
                        settingName="login.footerLink"
                        settingURL="/login"
                        initialValue={globalState.appsettings.login.footerLink}
                        placeHolder="login footer link" 
                    />
                </Grid>
            </Grid>
        </SettingRow>            
    )
})



const RemoteObjectViewerSettings = observer(() => {

    const { globalState } = useContext(AppContext) as AppProps

    return (
        <SettingRow
            title="Remote Object Viewer"
            description="Default Settings for Remote Object Viewer in RemoteObject Wizard"
        >
            <Typography variant="button">Console</Typography>
            <Grid container direction='row' id="remote-object-viewer-console-settings">
                <Grid item>
                    <BooleanCheckboxSetting
                        settingName="remoteObjectViewer.console.stringifyOutput"
                        settingURL="/remote-object-viewer"
                        initialValue={globalState.appsettings.remoteObjectViewer.console.stringifyOutput}
                        label="stringify output"
                    />
                </Grid>
                <Grid item sx={{ pl : 2 }}>
                    <SelectSetting 
                        settingName="remoteObjectViewer.console.defaultFontSize"
                        settingURL="/remote-object-viewer"
                        label="Font Size"
                        initialValue={globalState.appsettings.remoteObjectViewer.console.defaultFontSize}
                        allowedValues={allowedConsoleFontSizes}
                    />
                </Grid>
                <Grid item sx={{ pl : 2 }}>
                    <SelectSetting 
                        settingName="remoteObjectViewer.console.defaultWindowSize"
                        settingURL="/remote-object-viewer"
                        label="Window Size"
                        initialValue={globalState.appsettings.remoteObjectViewer.console.defaultWindowSize}
                        allowedValues={allowedConsoleWindowSizes}
                    />
                </Grid>
                <Grid item sx={{ pl : 2 }}>
                    <SelectSetting 
                        settingName="remoteObjectViewer.console.defaultMaxEntries"
                        settingURL="/remote-object-viewer"
                        label="Max Entries"
                        initialValue={globalState.appsettings.remoteObjectViewer.console.defaultMaxEntries}
                        allowedValues={allowedConsoleMaxEntries}
                    />
                </Grid> 
            </Grid>
            <Box sx={{p : 1}}/>
            <Typography variant="button">Log Viewer</Typography>          
            <Grid container direction='row' id="remote-object-viewer-log-viewer-settings" sx={{pt : 2}}>
                <Grid item>
                    <SelectSetting 
                        settingName="remoteObjectViewer.logViewer.defaultFontSize"
                        settingURL="/remote-object-viewer"
                        label="Font Size"
                        initialValue={globalState.appsettings.remoteObjectViewer.logViewer.defaultFontSize}
                        allowedValues={allowedConsoleFontSizes}
                    />
                </Grid>
                <Grid item sx={{ pl : 2 }}>
                    <SelectSetting 
                        settingName="remoteObjectViewer.logViewer.defaultWindowSize"
                        settingURL="/remote-object-viewer"
                        label="Window Size"
                        initialValue={globalState.appsettings.remoteObjectViewer.logViewer.defaultWindowSize}
                        allowedValues={allowedConsoleWindowSizes}
                    />
                </Grid>
                <Grid item sx={{ pl : 2 }}>
                    <SelectSetting
                        settingName="remoteObjectViewer.logViewer.defaultInterval"
                        settingURL="/remote-object-viewer"
                        label="Interval"
                        initialValue={globalState.appsettings.remoteObjectViewer.logViewer.defaultInterval}
                        allowedValues={allowedLogIntervals}
                    />
                </Grid> 
                <Grid item sx={{ pl : 2 }}>
                    <SelectSetting
                        settingName="remoteObjectViewer.logViewer.defaultMaxEntries"
                        settingURL="/remote-object-viewer"
                        label="Max Entries"
                        initialValue={globalState.appsettings.remoteObjectViewer.logViewer.defaultMaxEntries}
                        allowedValues={allowedConsoleWindowSizes}
                    />
                </Grid> 
            </Grid>
        </SettingRow>
    )
})



const OtherSettings = observer(() => {
    
    const { globalState } = useContext(AppContext) as AppProps

    return (
        <SettingRow
            title="Other Settings"
            description=""
        >
            <Grid container direction='column' id="dashboards-settings">
                <Grid item>
                    <BooleanSwitchSetting
                        settingName="dashboards.use"
                        settingURL="/dashboards"
                        initialValue={globalState.appsettings.dashboards.use}
                        label="use experimental dashboard renderer"
                    />
                </Grid>
                <Grid item>
                    <BooleanSwitchSetting 
                        settingName="servers.allowHTTP"
                        settingURL="/servers"
                        label="Allow HTTP for Python Servers (no encryption of messages or object specific credentials)"
                        initialValue={globalState.appsettings.servers.allowHTTP}
                    />
                </Grid>
                <Grid item>
                    <BooleanSwitchSetting 
                        settingName="others.WOTTerminology"
                        settingURL="/others"
                        label="Use Web of Things terminology"
                        initialValue={globalState.appsettings.others.WOTTerminology}
                    />
                </Grid>
            </Grid>
        </SettingRow>
    )
})



export const AppSettings = observer(() => {

    const { globalState } = useContext(AppContext) as AppProps

    const updateSetting = useCallback(async(URL : string, settingName : string, value : any, 
                                                event : React.BaseSyntheticEvent | any) => {
        if(event)
            event.preventDefault()
        try {
            const response = await axios.patch(
                `${globalState.primaryHostServer}/app-settings${URL}`, 
                stringToObject(settingName.split('.').slice(1).join('.'), value, {}), 
                { withCredentials : true }
            )
            if(response.status === 200) 
                globalState.updateSetting(settingName, value)
            console.log("app setting updated", toJS(globalState.appsettings))
        } catch (error) {
            
        }
    }, [globalState])

    useEffect(() => {
        const fetchSettings = async() => {
            try {
                const response = await axios.get(
                    `${globalState.primaryHostServer}/app-settings`,
                    { withCredentials : true }
                )
                if(response.status === 200) 
                    globalState.updateSettings(response.data)
                console.log("app setting loaded", toJS(globalState.appsettings))
            } catch(error :  any) {

            }
        }
        fetchSettings()
    }, [globalState])

    return (
        <Grid container direction = 'column' sx={{ flexWrap: 'nowrap' }}>
            <SettingsContext.Provider value={{ updateSetting : updateSetting }}>
                <RemoteObjectViewerSettings />
                <LoginPageSettings />
                <OtherSettings />
            </SettingsContext.Provider>
        </Grid>
    )
})


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




export type ApplicationSettings = {
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

export const defaultAppSettings : ApplicationSettings = {
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
