'use client'
// Internal & 3rd party functional libraries
import { SyntheticEvent, useCallback, useContext, useEffect, useRef, useState } from "react";
import { AxiosRequestConfig, AxiosResponse } from "axios";
// Custom functional libraries
import { getFormattedTimestamp } from "@hololinked/mobx-render-engine/utils/misc";
import { asyncRequest } from "@hololinked/mobx-render-engine/utils/http";
import { createHololinkedPortalStateManager } from "../app-state";
import { StateManager, Action, BaseAction } from "@hololinked/mobx-render-engine/state-manager";
// Internal & 3rd party component libraries
import { Stack, Typography, Tabs, Tab, FormControl, FormControlLabel, Button, ButtonGroup, 
    RadioGroup, Box, Chip, Radio, useTheme, TextField, Link, Autocomplete, IconButton } from "@mui/material";
import NewWindow from "react-new-window";
import OpenInNewTwoToneIcon from '@mui/icons-material/OpenInNewTwoTone';
import OpenInBrowserTwoToneIcon from '@mui/icons-material/OpenInBrowserTwoTone';
import CallReceivedTwoToneIcon from '@mui/icons-material/CallReceivedTwoTone';
import AceEditor from "react-ace";
import "ace-builds/src-noconflict/mode-json";
import "ace-builds/src-noconflict/theme-crimson_editor"
import "ace-builds/src-noconflict/ext-language_tools";
// Custom component libraries 
import { TabPanel } from "../reuse-components";
import { PropertyInformation, PlotlyInfo } from "./thing-info";
import { RemoteObjectClientState } from "./state";
import UnstyledTable from "./doc-viewer";
import { ClientContext } from "./view";



type SelectedPropertyWindowProps = {
    property : PropertyInformation
}

const propertyFields = ['Execute', 'Doc']

export const SelectedPropertyWindow = (props : SelectedPropertyWindowProps) => {
    // No need to use observer HOC as either property prop changes or child components of this component 
    // read and manipulate client state 
    // const clientState = useContext(ClientContext) as RemoteObjectClientState
    
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
                    if(name === 'Visualization' && props.property.visualization === null) 
                        return <div key={"selected-property-fields-tabpanel-"+name}></div> 
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
                if(name === 'Visualization' && props.property.visualization === null) 
                    return <div key={"selected-property-fields-tabpanel-"+name}></div> 
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
    switch(props.name) {
        case "Execute"  : return <PropertyRWClient  {...props}></PropertyRWClient>
        case "Doc"      : return <PropertyDocViewer {...props}></PropertyDocViewer> 
        case "Database" : return <Typography>Current Database values will be shown here</Typography>
        case "Visualization" : return <Visualization {...props}></Visualization>
        default : return <PropertyDocViewer {...props} ></PropertyDocViewer>
    }
}



type PropertyClientProps = {
    property : PropertyInformation
}

export const PropertyRWClient = (props : PropertyClientProps) => {
    // no need observer HOC as well
    const clientState = useContext(ClientContext) as RemoteObjectClientState

    // property input choice - raw value or JSON
    const [inputChoice, setInputChoice ] = useState(props.property.inputType) // JSON and RAW are allowed
    const [fullpath, setFullpath] = useState<string>(props.property.fullpath)
    const [timeout, setTimeout] = useState<number>(-1)
    const [timeoutValid, setTimeoutValid] = useState<boolean>(true)
    // the value entered
    const [paramValue, setParamValue] = useState<any>(null)
    // the latest response to be available as download
   
    useEffect(() => {
        setInputChoice(props.property.inputType)
        setFullpath(props.property.fullpath)
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
                    baseURL : clientState.domain,
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
                    baseURL : clientState.domain,
                    // httpsAgent: new https.Agent({ rejectUnauthorized: false })
                }
            const requestTime = getFormattedTimestamp()
            const requestTime_ = Date.now()
            const response = await asyncRequest(request) as AxiosResponse
            let executionTime = Date.now() - requestTime_
            if(clientState.stringifyOutput) 
                console.log(JSON.stringify(response.data, null, 2))
            else 
                console.log(response.data)    
            console.log(`PROPERTY ${mode} : ${props.property.name}, REQUEST TIME : ${requestTime}, RESPONSE TIME : ${getFormattedTimestamp()}, EXECUTION TIME : ${executionTime.toString()}ms, RESPONSE BELOW :`)
            if(response.data && response.data.state) 
                clientState.setRemoteObjectState(response.data.state[props.property.owner_instance_name])
            clientState.setLastResponse(response)
            if(response.data && response.data.exception) 
                clientState.setError(response.data.exception.message, response.data.exception.traceback)
            else if (clientState.hasError)
                clientState.resetError()
        } 
        catch(error : any){
            console.log(error)
            clientState.setError(error.message, null)
        }
    }, [clientState, props.property, fullpath, timeout, paramValue])

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

    const handleFullpathChange = useCallback((event : SyntheticEvent, value : string | null) => {
        // @ts-ignore
        console.log(props.property._supported_instance_names[value])
        // @ts-ignore
        setFullpath(props.property._supported_instance_names[value])
    }, [])

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
                {props.property._supported_instance_names?
                    <Box sx={{ flexGrow : 0.1, pt : 2 }}>
                        <Autocomplete
                            id="instance-name-select-autocomplete"
                            disablePortal
                            autoComplete    
                            onChange={handleFullpathChange}
                            defaultValue={Object.keys(props.property._supported_instance_names)[0]}
                            options={Object.keys(props.property._supported_instance_names)}
                            sx={{ flexGrow : 1 }}
                            renderInput={(params) => 
                                <TextField 
                                    {...params} 
                                    variant="standard"
                                    helperText="choose instance name" 
                                    size="medium"
                                />}
                        /> 
                    </Box> : null 
                }
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
                        disabled={props.property.readonly}
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
                                        placeholder={props.property.readonly? "disabled" : 
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
                                            readOnly : props.property.readonly 
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
                            disabled={props.property.readonly}
                            label={props.property.readonly? "read-only" : "data"}
                            helperText={props.property.readonly? "disabled" : "press enter to expand"}
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


export const PropertyDocViewer = ( props : PropertyClientProps) => {
    
    const clientState = useContext(ClientContext) as RemoteObjectClientState

    return (
        <Stack id="property-doc-viewer-table-layout" sx = {{ pl : 3, pr : 3, pt : 2, pb : 2, flexGrow : 1}}>
            {props.property.chips.length > 0 ? 
                <Stack direction='row' sx = {{ pb : 1}}>
                    {props.property.chips.map((name : string, index : number) => {
                        return (
                            <Box  key={"property-doc-viewer-chip-"+name} sx={{pr : 1}}>
                                <Chip label={name} variant="filled" />
                            </Box>
                        )
                    })}
                </Stack> : null 
            }
            <UnstyledTable
                rows={[
                    { id   : "DOC",
                      name : <DocRowTitle>DOC</DocRowTitle>, 
                      info : props.property.doc },
                    { id   : "URL",
                      name : <DocRowTitle>URL</DocRowTitle>, 
                      info : <Link 
                                onClick={() => window.open(clientState.domain + props.property.fullpath)} 
                                sx={{ alignItems : "center", cursor:'pointer', fontSize : 14,
                                    color : "#0000EE"}}
                                underline="hover"
                                variant="caption"
                            >
                                {clientState.domain + props.property.fullpath}
                            </Link>
                    },
                    { id : "STATE" , name : <DocRowTitle>STATE</DocRowTitle>, info : props.property.state },
                    { id : "WRITE_METHOD" , name : <DocRowTitle>Write Method</DocRowTitle>, 
                      info : props.property.remote_info.http_method[1] },
                    { id : "READ_METHOD" , name : <DocRowTitle>Read Method</DocRowTitle>, 
                      info : props.property.remote_info.http_method[0] },
                ]}
                tree={"property-doc-viewer-table-"+props.property.name}            
            />
        </Stack>
    )
}

export const DocRowTitle = (props : any) => {
    return (
        <Typography fontWeight={500} variant="button" component="pre">
            {props.children}
        </Typography>
    )
}



type VisualizationProps = {
    property : PropertyInformation
    clientState : RemoteObjectClientState
}

const VisualuationDummyAppContainer = {
    id   : 'property-client-visualization',
    tree : 'property-client-visualization-tree',
    componentName : '__App__',
    props           : {},
    dynamicProps    : {},
    dependents      : [],
    dependentsExist : false,
    stateMachine    : null,
    children        : ['Visualization'],
    dynamicChildren : []
}

export const Visualization = (props : VisualizationProps) => {
    const [docked, setDocked] = useState<boolean>(true)
    let component 
    if(props.property.visualization === null)
        return (
            <Typography sx={{pt : 2}}>
                This is not a visualization property       
            </Typography>
        )

    switch(props.property.visualization.type) {
        case "plotly" : 
        case "sse-video" : component = <MobXVisualization 
                                            {...props} 
                                            docked={docked}
                                            setDocked={setDocked} 
                                        />; break;
                                           
        default : component = ( 
                    <Typography sx={{pt : 2}}>
                        Visualization type not recognised, did you set the type field correctly? given type : {props.property.visualization.type}
                    </Typography>
                    )
    }

    return (
        !docked?
            <NewWindow 
                name={props.property.name} 
                title={props.property.name}
                // onUnload={() => visualizationStateManager.reset()}
                copyStyles={true}
            >
                {component}
            </NewWindow>
        : component
    )
}




type MobXVisualizationProps = {
    property : PropertyInformation
    clientState : RemoteObjectClientState
    docked : boolean
    setDocked : any
}

export const MobXVisualization = (props : MobXVisualizationProps) => {

    const [render, stateManager] = useMobXVisualization(props.property, clientState)
   
    return (
        <>
            {render?
                <Stack
                    id={props.property.name+'-visualization-box'}
                    justifyContent="center"
                    alignItems="center"
                    sx={{ flexGrow : 1, pt : 2 }}
                >
                    {(stateManager as StateManager).renderer.Component('__App__')}  
                    {Object.keys((props.property.visualization as PlotlyInfo).actions).map((actionID : string) => {
                        return (
                            <Box key={actionID} sx={{pb : 2}}>
                                <ActionComponents 
                                    stateManager={stateManager as StateManager} 
                                    setDocked={props.setDocked}
                                    docked={props.docked}
                                />
                            </Box>
                            )
                        })} 
                </Stack> 
                : null}
        </>
    )
}



const useMobXVisualization = (property : PropertyInformation, clientState : RemoteObjectClientState) => {

    const [render, setRender] = useState<boolean>(false)
    const [stateManager, setStateManager] = useState<StateManager | null>(null)

    useEffect(()=> {
        let shouldItRender = false
        let visualizationStateManager : StateManager | null = null
        if(property.visualization) {
            // visualizationStateManager = createHololinkedPortalStateManager(`${property.owner_instance_name}-${property.name}-visualization`)
            // console.log("base url", clientState.baseURL)
            for(let key of Object.keys(property.visualization.actions)) {
                if(!property.visualization.actions[key].URL.startsWith('http'))
                    property.visualization.actions[key].URL = clientState.baseURL + property.visualization.actions[key].URL
            }
            // @ts-ignore CHECK WHY ITS COMPLAINING
            visualizationStateManager.updateActions(property.visualization.actions)
            let [id, state] = createVisualizationComponentState(property)
            let components : { [key : string] : any } = { "__App__" : {
                ...VisualuationDummyAppContainer,
                children : [id]
            }}
            components[id] = state  
            // @ts-ignore
            visualizationStateManager.updateComponents(components)
            shouldItRender = true
        }
        setRender(shouldItRender)
        setStateManager(visualizationStateManager)
    }, [])

    useEffect(() => () => {
        if(stateManager)
            stateManager.reset()
    }, [stateManager])

    return [render, stateManager]
}


export function createVisualizationComponentState(property : PropertyInformation) : [string, { [key: string] : any }] {
    let id, state 
    // @ts-ignore
    switch(property.visualization.type){
        case 'plotly' : 
            id = property.name+'-plotly-visualization';
            state = {
                id              : property.name+'-plotly-visualization',
                tree            : property.name+'-plotly-visualization-tree',
                componentName   : 'ContextfulPlotlyGraph',
                props           : {},
                dynamicProps    : {},
                dependentsExist : false,
                dependents      : [],
                stateMachine    : null,
                children        : [],
                dynamicChildren : [],
                plot : (property.visualization as PlotlyInfo).plot,
                // @ts-ignore
                sources : property.visualization.sources
            };
            break;

        case 'sse-video' : 
            id = property.name+'-sse-video-visualization';
            state = {
                id              : property.name+'-sse-video-visualization',
                tree            : property.name+'-sse-video-visualization-tree',
                componentName   : 'ContextfulSSEVideo',
                props           : {},
                boxProps        : {
                                    width : 400,
                                    height : 400*(9/16),
                                    paddingBottom : '5px'
                                },
                img             : '',                   
                dynamicProps    : {},
                dependentsExist : false,
                dependents      : [],
                stateMachine    : null,
                children        : [],
                dynamicChildren : [],
                sources         : (property.visualization as any).sources
            }
            break; 

        // @ts-ignore
        default : throw new Error(`unknown visulization type ${property.visualization.type}`)
    }
    return [id, state]
}



export const ActionComponents = (props : {stateManager : StateManager, setDocked : any, docked : boolean}) => {
    const action = useRef<Action>(props.stateManager.resolvedActions[0])
    action.current.dependents = ['spectrum-plotly-visualization']
    console.log("action", action.current)

    return (<Stack direction="row">
                    <ButtonGroup>
                        <Button onClick={() => action.current.call()}>
                            Start
                        </Button>
                        <Button onClick={() => action.current.cancel()}>
                            Stop
                        </Button>
                    </ButtonGroup>
                    {!props.docked?
                        <IconButton size="small" sx={{ borderRadius : 0 }} onClick={() => props.setDocked(true)}>
                            <CallReceivedTwoToneIcon fontSize="small"/>
                        </IconButton>
                            : 
                        <IconButton size="small" sx={{ borderRadius : 0 }} onClick={() => props.setDocked(false)}>
                            <OpenInBrowserTwoToneIcon fontSize="small"/>
                        </IconButton>
                    }
                    </Stack>
                    )
    /*
    switch(action.current.type) {
        case "RepeatedRequests" : // same as SSE
        case 'SSEVideo':
        case 'SSE' : return (
                        <Stack direction="row">
                            <ButtonGroup>
                                <Button onClick={() => action.current.call()} >
                                    Start
                                </Button>
                                <Button onClick={() => action.current.cancel()} >
                                    Stop
                                </Button>
                            </ButtonGroup>
                            {!props.docked?
                                <IconButton size="small" sx={{ borderRadius : 0 }} onClick={() => props.setDocked(true)}>
                                    <CallReceivedTwoToneIcon fontSize="small"/>
                                </IconButton>
                                    : 
                                <IconButton size="small" sx={{ borderRadius : 0 }} onClick={() => props.setDocked(false)}>
                                    <OpenInBrowserTwoToneIcon fontSize="small"/>
                                </IconButton>
                            }
                           
                        </Stack>
                    ) 

        case "SingleHTTPRequest" : return (
                            <Stack direction="row">
                                <Button onClick={() => action.current.call()}>
                                    Fetch
                                </Button>
                                {!props.docked?
                                    <IconButton size="small" sx={{ borderRadius : 0 }} onClick={() => props.setDocked(true)}>
                                        <CallReceivedTwoToneIcon fontSize="small"/>
                                    </IconButton>
                                        : 
                                    <IconButton size="small" sx={{ borderRadius : 0 }} onClick={() => props.setDocked(false)}>
                                        <OpenInBrowserTwoToneIcon fontSize="small"/>
                                    </IconButton>
                                }
                            </Stack>
                            )

        default : return <Typography sx={{ pt : 2 }}>unknown action type or unsupported for visualization propertys</Typography>
    }*/
}