'use client'
// Internal & 3rd party functional libraries
import { SyntheticEvent, useCallback, useEffect, useRef, useState } from "react";
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
import { ParameterInformation, PlotlyInfo } from "./thing-info";
import { RemoteObjectClientState } from "./state";
import UnstyledTable from "./doc-viewer";



type SelectedParameterWindowProps = {
    clientState : RemoteObjectClientState
    parameter : ParameterInformation
}

const parameterFields = ['Execute', 'Doc', 'Database', 'Visualization']

export const SelectedParameterWindow = (props : SelectedParameterWindowProps) => {
    // No need to use observer HOC as either parameter prop changes or child components of this component 
    // read and manipulate client state 

    // current tab of parameter fields
    const [parameterFieldsTab, setParameterFieldsTab] = useState(0);

    const handleParameterFieldTabChange = useCallback(
        (event: React.SyntheticEvent, newValue: number) => {
            setParameterFieldsTab(newValue);
    }, [])

    return (
        <Stack id="selected-parameter-layout" sx={{ flexGrow : 1 }} >
            <Tabs
                id="selected-parameter-fields-tab"
                variant="scrollable"
                value={parameterFieldsTab}
                onChange={handleParameterFieldTabChange}
                sx={{ borderBottom: 2, borderColor: 'divider', flexGrow : 1, display : 'flex' }}
            >
                {parameterFields.map((name : string) => {
                    if(name === 'Visualization' && props.parameter.visualization === null) 
                        return <div key={"selected-parameter-fields-tabpanel-"+name}></div> 
                    return (
                        <Tab 
                            key={"selected-parameter-fields-tab-"+name}    
                            id={name} 
                            label={name} 
                            sx={{ maxWidth : 150 }} 
                        />
                        )}
                )}
            </Tabs>
            {parameterFields.map((name : string, index : number) => {
                if(name === 'Visualization' && props.parameter.visualization === null) 
                    return <div key={"selected-parameter-fields-tabpanel-"+name}></div> 
                return (
                    <TabPanel 
                        key={"selected-parameter-fields-tabpanel-"+name}
                        tree="selected-parameter-fields-tab"
                        value={parameterFieldsTab} 
                        index={index} 
                    >
                        <ParameterTabComponents name={name} {...props}/>
                    </TabPanel>
                )} 
                
            )} 
        </Stack>
    )
}



type ParameterTabComponentsProps = { 
    name : string
    parameter : ParameterInformation
    clientState : RemoteObjectClientState
}

export const ParameterTabComponents = (props : ParameterTabComponentsProps) => {
    switch(props.name) {
        case "Execute"  : return <ParameterRWClient  {...props}></ParameterRWClient>
        case "Doc"      : return <ParameterDocViewer {...props}></ParameterDocViewer> 
        case "Database" : return <Typography>Current Database values will be shown here</Typography>
        case "Visualization" : return <Visualization {...props}></Visualization>
        default : return <ParameterDocViewer {...props} ></ParameterDocViewer>
    }
}



type ParameterClientProps = {
    parameter : ParameterInformation
    clientState : RemoteObjectClientState
}

export const ParameterRWClient = (props : ParameterClientProps) => {
    // no need observer HOC as well

    // parameter input choice - raw value or JSON
    const [inputChoice, setInputChoice ] = useState(props.parameter.inputType) // JSON and RAW are allowed
    const [fullpath, setFullpath] = useState<string>(props.parameter.fullpath)
    const [timeout, setTimeout] = useState<number>(-1)
    const [timeoutValid, setTimeoutValid] = useState<boolean>(true)
    // the value entered
    const [paramValue, setParamValue] = useState<any>(null)
    // the latest response to be available as download
   
    useEffect(() => {
        setInputChoice(props.parameter.inputType)
        setFullpath(props.parameter.fullpath)
    }, [props.parameter])
    
    const handleInputSelection = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
        setInputChoice(event.target.value)
    }, [])

    const RWParam = useCallback(async (mode : 'READ' | 'WRITE' ) => {
        try {
            let request : AxiosRequestConfig
            if(mode === 'READ')
                request = {
                    url : fullpath, 
                    method : props.parameter.scada_info.http_method[0] as any, 
                    baseURL : props.clientState.domain,
                    // httpsAgent: new https.Agent({ rejectUnauthorized: false })
                }
            else 
                request = {
                    url : fullpath, 
                    method : props.parameter.scada_info.http_method[1] as any, 
                    data : { 
                        timeout : timeout >= 0? timeout : null,
                        value : parseWithInterpretation(paramValue, props.parameter.type) 
                    },
                    baseURL : props.clientState.domain,
                    // httpsAgent: new https.Agent({ rejectUnauthorized: false })
                }
            const requestTime = getFormattedTimestamp()
            const requestTime_ = Date.now()
            const response = await asyncRequest(request) as AxiosResponse
            let executionTime = Date.now() - requestTime_
            if(props.clientState.stringifyOutput) 
                console.log(JSON.stringify(response.data, null, 2))
            else 
                console.log(response.data)    
            console.log(`PARAMETER ${mode} : ${props.parameter.name}, REQUEST TIME : ${requestTime}, RESPONSE TIME : ${getFormattedTimestamp()}, EXECUTION TIME : ${executionTime.toString()}ms, RESPONSE BELOW :`)
            if(response.data && response.data.state) 
                props.clientState.setRemoteObjectState(response.data.state[props.parameter.owner_instance_name])
            props.clientState.setLastResponse(response)
            if(response.data && response.data.exception) 
                props.clientState.setError(response.data.exception.message, response.data.exception.traceback)
            else if (props.clientState.hasError)
                props.clientState.resetError()
        } 
        catch(error : any){
            console.log(error)
            props.clientState.setError(error.message, null)
        }
    }, [props.clientState, props.parameter, fullpath, timeout, paramValue])

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
        console.log(props.parameter._supported_instance_names[value])
        // @ts-ignore
        setFullpath(props.parameter._supported_instance_names[value])
    }, [])

    return (
        <Stack id="parameter-rw-client" sx={{ flexGrow : 1, pt: 2 }}>
            <ParameterInputChoice 
                id='parameter-rw-client-input'
                parameter={props.parameter} 
                choice={inputChoice} 
                value={paramValue} 
                setValue={setParamValue}
                RWHook={RWParam}
            />
            <Stack id='parameter-rw-client-options-layout' direction = "row" sx={{ flexGrow : 1 }}>
                {props.parameter._supported_instance_names?
                    <Box sx={{ flexGrow : 0.1, pt : 2 }}>
                        <Autocomplete
                            id="instance-name-select-autocomplete"
                            disablePortal
                            autoComplete    
                            onChange={handleFullpathChange}
                            defaultValue={Object.keys(props.parameter._supported_instance_names)[0]}
                            options={Object.keys(props.parameter._supported_instance_names)}
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
                        id="parameter-rw-client-input-choice-group"
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
                    id='parameter-rw-client-interaction-buttons'
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
                        disabled={props.parameter.readonly}
                        onClick={writeParam}
                    >
                        Write
                    </Button>
                </ButtonGroup>
            </Stack>
        </Stack>
    )
}


type ParameterInputChoiceProps = {
    id : string 
    choice : string 
    parameter : ParameterInformation
    value : any
    setValue : any
    RWHook : any
}

export const ParameterInputChoice = (props : ParameterInputChoiceProps) => {

    const theme = useTheme()
    switch(props.choice) {
        case 'JSON' : return <Box id="ace-editor-box" sx= {{ flexGrow : 1 }}>
                                <Stack direction='row' sx={{ flexGrow : 1 }}>
                                    <AceEditor
                                        name="param-client-json-input"
                                        placeholder={props.parameter.readonly? "disabled" : 
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
                                            readOnly : props.parameter.readonly 
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
                            disabled={props.parameter.readonly}
                            label={props.parameter.readonly? "read-only" : "data"}
                            helperText={props.parameter.readonly? "disabled" : "press enter to expand"}
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


export const ParameterDocViewer = ( props : ParameterClientProps) => {

    return (
        <Stack id="parameter-doc-viewer-table-layout" sx = {{ pl : 3, pr : 3, pt : 2, pb : 2, flexGrow : 1}}>
            {props.parameter.chips.length > 0 ? 
                <Stack direction='row' sx = {{ pb : 1}}>
                    {props.parameter.chips.map((name : string, index : number) => {
                        return (
                            <Box  key={"parameter-doc-viewer-chip-"+name} sx={{pr : 1}}>
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
                      info : props.parameter.doc },
                    { id   : "URL",
                      name : <DocRowTitle>URL</DocRowTitle>, 
                      info : <Link 
                                onClick={() => window.open(props.clientState.domain + props.parameter.fullpath)} 
                                sx={{ alignItems : "center", cursor:'pointer', fontSize : 14,
                                    color : "#0000EE"}}
                                underline="hover"
                                variant="caption"
                            >
                                {props.clientState.domain + props.parameter.fullpath}
                            </Link>
                    },
                    { id : "STATE" , name : <DocRowTitle>STATE</DocRowTitle>, info : props.parameter.state },
                    { id : "WRITE_METHOD" , name : <DocRowTitle>Write Method</DocRowTitle>, 
                      info : props.parameter.scada_info.http_method[1] },
                    { id : "READ_METHOD" , name : <DocRowTitle>Read Method</DocRowTitle>, 
                      info : props.parameter.scada_info.http_method[0] },
                ]}
                tree={"parameter-doc-viewer-table-"+props.parameter.name}            
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
    parameter : ParameterInformation
    clientState : RemoteObjectClientState
}

const VisualuationDummyAppContainer = {
    id   : 'parameter-client-visualization',
    tree : 'parameter-client-visualization-tree',
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
    if(props.parameter.visualization === null)
        return (
            <Typography sx={{pt : 2}}>
                This is not a visualization parameter       
            </Typography>
        )

    switch(props.parameter.visualization.type) {
        case "plotly" : 
        case "sse-video" : component = <MobXVisualization 
                                            {...props} 
                                            docked={docked}
                                            setDocked={setDocked} 
                                        />; break;
                                           
        default : component = ( 
                    <Typography sx={{pt : 2}}>
                        Visualization type not recognised, did you set the type field correctly? given type : {props.parameter.visualization.type}
                    </Typography>
                    )
    }

    return (
        !docked?
            <NewWindow 
                name={props.parameter.name} 
                title={props.parameter.name}
                // onUnload={() => visualizationStateManager.reset()}
                copyStyles={true}
            >
                {component}
            </NewWindow>
        : component
    )
}




type MobXVisualizationProps = {
    parameter : ParameterInformation
    clientState : RemoteObjectClientState
    docked : boolean
    setDocked : any
}

export const MobXVisualization = (props : MobXVisualizationProps) => {

    const [render, stateManager] = useMobXVisualization(props.parameter, props.clientState)
   
    return (
        <>
            {render?
                <Stack
                    id={props.parameter.name+'-visualization-box'}
                    justifyContent="center"
                    alignItems="center"
                    sx={{ flexGrow : 1, pt : 2 }}
                >
                    {(stateManager as StateManager).renderer.Component('__App__')}  
                    {Object.keys((props.parameter.visualization as PlotlyInfo).actions).map((actionID : string) => {
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



const useMobXVisualization = (parameter : ParameterInformation, clientState : RemoteObjectClientState) => {

    const [render, setRender] = useState<boolean>(false)
    const [stateManager, setStateManager] = useState<StateManager | null>(null)

    useEffect(()=> {
        let shouldItRender = false
        let visualizationStateManager : StateManager | null = null
        if(parameter.visualization) {
            // visualizationStateManager = createHololinkedPortalStateManager(`${parameter.owner_instance_name}-${parameter.name}-visualization`)
            // console.log("base url", props.clientState.baseURL)
            for(let key of Object.keys(parameter.visualization.actions)) {
                if(!parameter.visualization.actions[key].URL.startsWith('http'))
                    parameter.visualization.actions[key].URL = clientState.baseURL + parameter.visualization.actions[key].URL
            }
            // @ts-ignore CHECK WHY ITS COMPLAINING
            visualizationStateManager.updateActions(parameter.visualization.actions)
            let [id, state] = createVisualizationComponentState(parameter)
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


export function createVisualizationComponentState(parameter : ParameterInformation) : [string, { [key: string] : any }] {
    let id, state 
    // @ts-ignore
    switch(parameter.visualization.type){
        case 'plotly' : 
            id = parameter.name+'-plotly-visualization';
            state = {
                id              : parameter.name+'-plotly-visualization',
                tree            : parameter.name+'-plotly-visualization-tree',
                componentName   : 'ContextfulPlotlyGraph',
                props           : {},
                dynamicProps    : {},
                dependentsExist : false,
                dependents      : [],
                stateMachine    : null,
                children        : [],
                dynamicChildren : [],
                plot : (parameter.visualization as PlotlyInfo).plot,
                // @ts-ignore
                sources : parameter.visualization.sources
            };
            break;

        case 'sse-video' : 
            id = parameter.name+'-sse-video-visualization';
            state = {
                id              : parameter.name+'-sse-video-visualization',
                tree            : parameter.name+'-sse-video-visualization-tree',
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
                sources         : (parameter.visualization as any).sources
            }
            break; 

        // @ts-ignore
        default : throw new Error(`unknown visulization type ${parameter.visualization.type}`)
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

        default : return <Typography sx={{ pt : 2 }}>unknown action type or unsupported for visualization parameters</Typography>
    }*/
}