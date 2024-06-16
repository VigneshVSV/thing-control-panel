// Internal & 3rd party functional libraries
import { useCallback, useEffect, useState } from "react";
import { AxiosResponse } from "axios";
// Custom functional libraries
import { getFormattedTimestamp } from "@hololinked/mobx-render-engine/utils/misc";
import { asyncRequest } from "@hololinked/mobx-render-engine/utils/http";
// Internal & 3rd party component libraries
import { Stack, Divider, Tabs, Tab, FormControl, FormControlLabel, Button, ButtonGroup, 
    RadioGroup, Box, Radio, useTheme, TextField, Link, Checkbox, Autocomplete} from "@mui/material";
import AceEditor from "react-ace";
import "ace-builds/src-noconflict/mode-json";
import "ace-builds/src-noconflict/theme-crimson_editor"
import "ace-builds/src-noconflict/ext-language_tools";
// Custom component libraries 
import { MethodInformation } from "./thing-info";
import { TabPanel } from "../reuse-components";
import UnstyledTable from "./doc-viewer";
import { DocRowTitle } from "./property-client";
import { RemoteObjectClientState } from "./state";
    
    

type SelectedMethodWindowProps = {
    method : MethodInformation
    clientState : RemoteObjectClientState
}

const methodFields = ['Execute', 'Doc']

export const SelectedMethodWindow = ( props : SelectedMethodWindowProps) => {

    const [methodFieldsTab, setMethodFieldsTab] = useState(0);
    const handleParameterFieldTabChange = useCallback((event: React.SyntheticEvent, newValue: number) => {
        setMethodFieldsTab(newValue);
    }, [])
    
    return (
        <Stack id="selected-method-view-layout" sx={{ flexGrow: 1, display : 'flex' }} >
            <Tabs
                id="selected-method-fields-tab"
                variant="scrollable"
                value={methodFieldsTab}
                onChange={handleParameterFieldTabChange}
                sx={{ borderBottom: 2, borderColor: 'divider' }}
                >
                {methodFields.map((name : string) => 
                    <Tab 
                        key={"selected-method-fields-tab-"+name}    
                        id={name} 
                        label={name} 
                        sx={{ maxWidth: 150}} 
                    />
                )}
            </Tabs>
            {methodFields.map((name : string, index : number) => 
                <TabPanel 
                    key={"selected-method-fields-tabpanel-"+name}
                    tree="selected-method-fields-tab"
                    value={methodFieldsTab} 
                    index={index} 
                >
                    <MethodTabComponents 
                        name={name} 
                        {...props} 
                    />
                </TabPanel>
            )} 
        </Stack>
    )
}



type MethodTabComponentsProps = {
    name : string
    method : MethodInformation
    clientState : RemoteObjectClientState
}

export const MethodTabComponents = (props : MethodTabComponentsProps) => {

    switch(props.name) {
        case "Doc"      : return <MethodDocViewer {...props}></MethodDocViewer>
        default : return <MethodExecutionClient {...props} ></MethodExecutionClient>
    }
}



type MethodExecutionProps = {
    method : MethodInformation
    clientState : RemoteObjectClientState
}

export const MethodExecutionClient = (props : MethodExecutionProps) => {
    
    const [fetchExecutionLogs, setFetchExecutionLogs] = useState<boolean>(false)                                                                                               
    const [inputChoice, setInputChoice ] = useState('JSON')
    const [fullpath, setFullpath] = useState<string>(props.method.fullpath)
    const [timeout, setTimeout] = useState<number>(-1)
    const [timeoutValid, setTimeoutValid] = useState<boolean>(true)
    const [kwargsValue, setKwargsValue] = useState<any>(null)
    const handleInputSelection = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
        setInputChoice(event.target.value)
    }, [])

    useEffect(() => {
        // setInputChoice(props.parameter.inputType)
        setFullpath(props.method.fullpath)
        return () => setKwargsValue(null)
    }, [props.method])
    
    const callMethod = useCallback(async () => {
        try {
            let data 
            let _fullpath 
            if(props.method.scada_info.http_method[0].toLowerCase() === 'get') {
                data = null
                _fullpath = fullpath + `?timeout=${timeout}`
                if(fetchExecutionLogs)
                    _fullpath += `&fetch_execution_logs=${fetchExecutionLogs}`
            }
            else {
                data = { 
                    fetch_execution_logs : fetchExecutionLogs,
                    timeout : timeout,
                    ...JSON.parse(kwargsValue)
                    }
                _fullpath = fullpath  
            }
            const requestTime = getFormattedTimestamp()
            const requestTime_ = Date.now()
            const response = await asyncRequest({
                url : _fullpath, 
                method : props.method.scada_info.http_method[0] as any, 
                data : data, 
                baseURL : props.clientState.domain,
                // httpsAgent: new https.Agent({ rejectUnauthorized: false })
            }) as AxiosResponse
            let executionTime = Date.now() - requestTime_
            props.clientState.setLastResponse(response)
            if(response.status >= 200 && response.status < 300) {
                if(props.clientState.stringifyOutput) 
                    console.log("\n" + JSON.stringify(response.data, null, 2))
                else 
                    console.log(response.data)
                if(response.data && response.data.state) 
                    props.clientState.setRemoteObjectState(response.data.state[props.method.owner_instance_name])
                if(props.clientState.hasError)
                    props.clientState.resetError()
            }
            else if(response.data && response.data.exception) {
                props.clientState.setError(response.data.exception.message, response.data.exception.traceback)
                if(props.clientState.stringifyOutput)
                    console.log(JSON.stringify(response, null, 2))
                else 
                    console.log(response)
            }
            else {
                if(props.clientState.stringifyOutput)
                    console.log(JSON.stringify(response, null, 2))
                else 
                    console.log(response)
                // console.log("execution unsuccessful")
            }
            console.log(`METHOD EXECUTION : ${props.method.qualname}, REQUEST TIME : ${requestTime}, RESPONSE TIME : ${getFormattedTimestamp()}, EXECUTION TIME : ${executionTime.toString()}ms, RESPONSE BELOW : `)
        } 
        catch(error : any){
            // console.log(error)
            props.clientState.setError(error.message, null)
        } 
    }, [props.clientState, props.method, fullpath, fetchExecutionLogs, kwargsValue, timeout])

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

    const handleFullpathChange = useCallback((event : React.SyntheticEvent, value : string | null) => {
        // @ts-ignore
        console.log(props.parameter._supported_instance_names[value])
        // @ts-ignore
        setFullpath(props.parameter._supported_instance_names[value])
    }, [])


    return (
        <Stack id='method-execution-client-layout' sx={{ flexGrow: 1, display : 'flex', pt: 2 }}>
            <MethodInputChoice 
                choice={inputChoice} 
                signature={props.method.signature} 
                setValue={setKwargsValue} 
                value={kwargsValue}    
            />
            <Stack id='method-execution-client-options-layout' direction = "row" sx={{ flexGrow: 1, display : 'flex'}}>
                {props.method._supported_instance_names?
                    <Box sx={{display : 'flex', flexGrow : 0.1, pt : 2}}>
                        <Autocomplete
                            id="instance-name-select-autocomplete"
                            disablePortal
                            autoComplete    
                            onChange={handleFullpathChange}
                            defaultValue={Object.keys(props.method._supported_instance_names)[0]}
                            options={Object.keys(props.method._supported_instance_names)}
                            sx={{ flexGrow : 1, display: 'flex'}}
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
                        id="methods-execution-client-input-choice-group"
                        row
                        value={inputChoice}
                        onChange={handleInputSelection}
                    >
                        <FormControlLabel value="raw" control={<Radio size="small" />} label="raw" />
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
                <Box sx={{pt: 2, flexGrow: 0.01, display : 'flex' }} >
                    <ButtonGroup>
                        <Button 
                            variant="contained"
                            disableElevation
                            color="secondary"
                            onClick={callMethod}
                        >
                            Execute
                        </Button>    
                        <Divider orientation="vertical" sx={{ backgroundColor : "black" }}></Divider>
                        <Button 
                            variant="contained"
                            disableElevation
                            color="secondary"
                            // onClick={cancelMethod}
                        >
                            Cancel
                        </Button>    
                    </ButtonGroup>
                </Box>                
                <FormControlLabel
                    label="fetch execution logs"
                    control={<Checkbox
                                size="small"
                                checked={fetchExecutionLogs}
                                onChange={(event) => setFetchExecutionLogs(event.target.checked)}
                            />}
                    sx={{ pl : 1, pt : 2}}
                />
            </Stack>
        </Stack>
    )
}



type MethodInputChoiceProps = { 
    choice : string, 
    signature : Array<string>,
    setValue : any
    value : any 
}

export const MethodInputChoice = (props : MethodInputChoiceProps) => {
    const theme = useTheme()
    switch(props.choice) {
        case 'JSON' : return <Box id="ace-editor-box" sx={{display : 'flex', flexGrow : 1}}>
                                <AceEditor
                                    name="methods-client-json-input"
                                    placeholder="Enter keyword as JSON and non-keywords under a 'args' field as a list. 
                                    for ex - { 'args' : [1, 'foo'], 'my_kw_arg1' : false, 'my_kw_arg2' : [1, 2, 3] }.
                                    This is equivalent to self.my_func(1, 'foo', my_kw_arg1=my_kw_arg1, my_kw_arg2=my_kw_arg2)."
                                    mode="json"
                                    theme="crimson_editor"
                                    value={
                                        props.value? props.value : 
                                        props.signature? props.signature.length > 0 ?  
                                            props.signature.reduce((total, current) => {
                                                total = total + '\n\t\"' + current + '\" : ,'
                                                return total 
                                            }, `{`).slice(0, -1) + '\n}' : `` : `` }
                                    onChange={(newValue) => props.setValue(newValue)}
                                    fontSize={18}
                                    showPrintMargin={true}
                                    showGutter={true}
                                    highlightActiveLine={true}
                                    wrapEnabled={true}
                                    style={{
                                        backgroundColor : theme.palette.grey[100],
                                        maxHeight : 150,
                                        overflow : 'scroll',
                                        scrollBehavior : 'smooth',
                                        width : "100%"
                                    }}
                                    setOptions={{
                                        enableBasicAutocompletion: false,
                                        enableLiveAutocompletion: false,
                                        enableSnippets: false,
                                        showLineNumbers: true,
                                        tabSize: 4,
                                    }}
                                />
                            </Box>
        default : return <TextField
                            variant="outlined"
                            multiline
                            size="small"
                            maxRows={100}
                            label="arguments"
                            helperText="press enter to expand"
                            sx={{ flexGrow: 1, display : 'flex' }}
                        />
    }
}



export const MethodDocViewer = (props : any) => {

    return (
        <Stack id="method-doc-viewer-table-layout" sx = {{ pl : 3, pr : 3, pt : 2, pb : 2, flexGrow : 1}}>
            <UnstyledTable
                rows={[
                    { id   : "DOC",
                    name : <DocRowTitle>DOC</DocRowTitle>, 
                    info : props.method.doc },
                    { id   : "URL",
                    name : <DocRowTitle>URL</DocRowTitle>, 
                    info : <Link 
                                onClick={() => window.open(props.clientState.domain + props.method.fullpath)} 
                                sx={{display : 'flex', alignItems : "center", cursor:'pointer', fontSize : 14,
                                        color : "#0000EE" }}
                                underline="hover"
                                variant="caption"
                            >
                                {props.clientState.domain + props.method.fullpath}
                            </Link>
                    },
                    { id : "STATE" , name : <DocRowTitle>STATE</DocRowTitle>, info : props.method.state},
                    { id : "HTTP METHOD" , name : <DocRowTitle>HTTP Method</DocRowTitle>, 
                    info : props.method.scada_info.http_method },
                    { id : "Keyword Defaults", name : <DocRowTitle>Keyword Defaults</DocRowTitle>, 
                    info : props.method.kwdefaults },
                    { id : "Defaults", name : <DocRowTitle>Defaults</DocRowTitle>, 
                    info : props.method.defaults },
                ]}
                tree={"method-doc-viewer-table-"+props.method.name+"-"}            
            />
        </Stack>
    )
}
