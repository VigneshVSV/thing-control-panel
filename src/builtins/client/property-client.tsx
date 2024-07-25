'use client'
// Internal & 3rd party functional libraries
import { SyntheticEvent, useCallback, useContext, useEffect, useRef, useState } from "react";
import { AxiosRequestConfig, AxiosResponse } from "axios";
// Custom functional libraries
import { getFormattedTimestamp } from "@hololinked/mobx-render-engine/utils/misc";
import { asyncRequest } from "@hololinked/mobx-render-engine/utils/http";
// Internal & 3rd party component libraries
import { Stack, Typography, Tabs, Tab, FormControl, FormControlLabel, Button, ButtonGroup, 
    RadioGroup, Box, Chip, Radio, useTheme, TextField, Link, Autocomplete, IconButton } from "@mui/material";

import AceEditor from "react-ace";
import "ace-builds/src-noconflict/mode-json";
import "ace-builds/src-noconflict/theme-crimson_editor"
import "ace-builds/src-noconflict/ext-language_tools";
// Custom component libraries 
import { TabPanel } from "../reuse-components";
import { PropertyInformation, Thing } from "./state";
import { ThingManager } from "./view";
import { ObjectInspector } from "react-inspector";



type SelectedPropertyWindowProps = {
    property : PropertyInformation
}

const propertyFields = ['Execute', 'Doc']

export const SelectedPropertyWindow = (props : SelectedPropertyWindowProps) => {
    // No need to use observer HOC as either property prop changes or child components of this component 
    // read and manipulate client state 
    // const thing = useContext(ThingManager) as Thing
    
    // current tab of property fields
    const [propertyFieldsTab, setPropertyFieldsTab] = useState(0);

    const handlePropertyFieldTabChange = useCallback(
        (_ : React.SyntheticEvent, newValue: number) => {
            setPropertyFieldsTab(newValue);
    }, [])

    return (
        <Stack id="selected-property-layout" sx={{ flexGrow : 1 }} >
            <Tabs
                id="selected-property-fields-tab"
                variant="scrollable"
                value={propertyFieldsTab}
                onChange={handlePropertyFieldTabChange}
                sx={{ borderBottom: 2, borderColor: 'divider', flexGrow : 1, display : 'flex' }}
            >
                {propertyFields.map((name : string) => {
                    return (
                        <Tab 
                            key={"selected-property-fields-tab-"+name}    
                            id={name} 
                            label={name} 
                            sx={{ maxWidth : 150 }} 
                        />
                    )}
                )}
            </Tabs>
            {propertyFields.map((name : string, index : number) => {
                return (
                    <TabPanel 
                        key={"selected-property-fields-tabpanel-"+name}
                        tree="selected-property-fields-tab"
                        value={propertyFieldsTab} 
                        index={index} 
                    >
                        <PropertyTabComponents name={name} {...props}/>
                    </TabPanel>
                )} 
            )} 
        </Stack>
    )
}



type PropertyTabComponentsProps = { 
    name : string
    property : PropertyInformation
}

export const PropertyTabComponents = (props : PropertyTabComponentsProps) => {
    const thing = useContext(ThingManager) as Thing
    switch(props.name) {
        case "Execute"  : return <PropertyRWClient  {...props}></PropertyRWClient>
        default : return <ObjectInspector 
                            data={thing.td.properties[props.property.name]}
                            expandLevel={3} 
                        /> 
    }
}



type PropertyClientProps = {
    property : PropertyInformation
}

export const PropertyRWClient = (props : PropertyClientProps) => {
    // no need observer HOC as well
    const thing = useContext(ThingManager) as Thing

    // property input choice - raw value or JSON
    const [inputChoice, setInputChoice ] = useState(props.property.inputType) // JSON and RAW are allowed
    const [timeout, setTimeout] = useState<number>(-1)
    const [timeoutValid, setTimeoutValid] = useState<boolean>(true)
    // the value entered
    const [paramValue, setParamValue] = useState<any>(null)
    // the latest response to be available as download
   
    useEffect(() => {
        setInputChoice(props.property.inputType)
    }, [props.property])
    
    const handleInputSelection = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
        setInputChoice(event.target.value)
    }, [])

    const RWParam = useCallback(async (mode : 'READ' | 'WRITE' ) => {
        try {
            let request : AxiosRequestConfig
            if(mode === 'READ')
                request = {
                    url : fullpath, 
                    method : props.property.remote_info.http_method[0] as any, 
                    baseURL : thing.domain,
                    // httpsAgent: new https.Agent({ rejectUnauthorized: false })
                }
            else 
                request = {
                    url : fullpath, 
                    method : props.property.remote_info.http_method[1] as any, 
                    data : { 
                        timeout : timeout >= 0? timeout : null,
                        value : parseWithInterpretation(paramValue, props.property.type) 
                    },
                    baseURL : thing.domain,
                    // httpsAgent: new https.Agent({ rejectUnauthorized: false })
                }
            const requestTime = getFormattedTimestamp()
            const requestTime_ = Date.now()
            const response = await asyncRequest(request) as AxiosResponse
            let executionTime = Date.now() - requestTime_
            if(thing.stringifyOutput) 
                console.log(JSON.stringify(response.data, null, 2))
            else 
                console.log(response.data)    
            console.log(`PROPERTY ${mode} : ${props.property.name}, REQUEST TIME : ${requestTime}, RESPONSE TIME : ${getFormattedTimestamp()}, EXECUTION TIME : ${executionTime.toString()}ms, RESPONSE BELOW :`)
            if(response.data && response.data.state) 
                thing.setRemoteObjectState(response.data.state[props.property.owner_instance_name])
            thing.setLastResponse(response)
            if(response.data && response.data.exception) 
                thing.setError(response.data.exception.message, response.data.exception.traceback)
            else if (thing.hasError)
                thing.resetError()
        } 
        catch(error : any){
            console.log(error)
            thing.setError(error.message, null)
        }
    }, [thing, props.property, timeout, paramValue])

    const readParam = useCallback(async() => await RWParam('READ'), [RWParam])
    const writeParam = useCallback(async() => await RWParam('WRITE'), [RWParam])

    const handleTimeoutChange = useCallback((event : any) => {
        let oldTimeout =  timeout 
        let timeoutValid = false 
        if(Number(event.target.value)) {
            oldTimeout = Number(event.target.value)
            timeoutValid = true 
        } 
        setTimeout(oldTimeout)
        setTimeoutValid(timeoutValid)
    }, [timeout, setTimeout])


    return (
        <Stack id="property-rw-client" sx={{ flexGrow : 1, pt: 2 }}>
            <PropertyInputChoice 
                id='property-rw-client-input'
                property={props.property} 
                choice={inputChoice} 
                value={paramValue} 
                setValue={setParamValue}
                RWHook={RWParam}
            />
            <Stack id='property-rw-client-options-layout' direction = "row" sx={{ flexGrow : 1 }}>
                <FormControl sx={{pl : 2, pt : 2}}> 
                    <RadioGroup
                        id="property-rw-client-input-choice-group"
                        row
                        value={inputChoice}
                        onChange={handleInputSelection}
                    >
                        <FormControlLabel value="RAW" control={<Radio size="small" />} label="raw" />
                        <FormControlLabel value="JSON" control={<Radio size="small" />} label="JSON" />
                    </RadioGroup>
                </FormControl>
                <Box sx={{ pl : 2, pt: 2, pr: 2, maxWidth : 100 }} >
                    <TextField
                        id='console-window-timeout-input'
                        label='Timeout (s)'    
                        size='small'
                        defaultValue={timeout}
                        error={!timeoutValid}
                        onChange={handleTimeoutChange}
                    />
                </Box>
                <ButtonGroup 
                    id='property-rw-client-interaction-buttons'
                    variant="contained"
                    sx = {{pt :2, pr : 2, pb : 2}}
                    disableElevation
                    color="secondary"
                >
                    <Button 
                        sx={{ flexGrow: 0.05 }} 
                        onClick={readParam}
                    >
                        Read
                    </Button>
                    <Button 
                        sx={{ flexGrow: 0.05 }} 
                        disabled={props.property.readOnly}
                        onClick={writeParam}
                    >
                        Write
                    </Button>
                </ButtonGroup>
            </Stack>
        </Stack>
    )
}


type PropertyInputChoiceProps = {
    id : string 
    choice : string 
    property : PropertyInformation
    value : any
    setValue : any
    RWHook : any
}

export const PropertyInputChoice = (props : PropertyInputChoiceProps) => {

    const theme = useTheme()
    switch(props.choice) {
        case 'JSON' : return <Box id="ace-editor-box" sx= {{ flexGrow : 1 }}>
                                <Stack direction='row' sx={{ flexGrow : 1 }}>
                                    <AceEditor
                                        name="param-client-json-input"
                                        placeholder={props.property.readOnly? "disabled" : 
                                            "Enter value directly or under a value field like { 'value' : ... }"
                                        }
                                        mode="json"
                                        theme="crimson_editor"
                                        onChange={(newValue) => props.setValue(newValue)}
                                        fontSize={18}
                                        showPrintMargin={true}
                                        showGutter={true}
                                        highlightActiveLine={true}
                                        wrapEnabled={true}
                                        style={{
                                            backgroundColor : theme.palette.grey[100],
                                            maxHeight : 200,
                                            overflow : 'scroll',
                                            scrollBehavior : 'smooth',
                                            width : "100%",
                                        }}
                                        setOptions={{
                                            enableBasicAutocompletion: false,
                                            enableLiveAutocompletion: false,
                                            enableSnippets: false,
                                            showLineNumbers: true,
                                            tabSize: 4,
                                            readOnly : props.property.readOnly 
                                        }}
                                    />
                                </Stack>
                            </Box>
        default : return <TextField
                            variant="outlined"
                            multiline
                            size="small"
                            maxRows={300}
                            onChange={(event) => props.setValue(event.target.value)}
                            disabled={props.property.readOnly}
                            label={props.property.readOnly? "read-only" : "data"}
                            helperText={props.property.readOnly? "disabled" : "press enter to expand"}
                            sx={{ flexGrow: 1 }}
                        />
    }
}

export const parseWithInterpretation = (value : any, interpretation : string) => {
    let jsonValue = JSON.parse(value)
    console.log(interpretation, jsonValue)
    switch(interpretation) {
        case 'Integer' : return Number(jsonValue) 
        case 'Number' : return Number(jsonValue)
        case 'Boolean' : return Boolean(Number(jsonValue))
        default : return JSON.parse(jsonValue) // String, Bytes, IPAddress
    }
}

// @ts-ignore
function stringify(val, depth, replacer, space) {
    depth = isNaN(+depth) ? 1 : depth;
    // @ts-ignore
    function _build(key, val, depth, o, a) { // (JSON.stringify() has it's own rules, which we respect here by using it for property iteration)
        // @ ts-ignore
        return !val || typeof val != 'object' ? val : (a=Array.isArray(val), JSON.stringify(val, function(k,v){ if (a || depth > 0) { 
            if (replacer) v=replacer(k,v); if (!k) 
                // @ts-ignore
                return (a=Array.isArray(v),val=v); !o && (o=a?[]:{}); o[k] = _build(k, v, a?depth:depth-1); } }), o||(a?[]:{}));
    }
    // @ts-ignore
    return JSON.stringify(_build('', val, depth), null, space);
}

