// Internal & 3rd party functional libraries
import { useCallback, useContext, useEffect, useState } from "react";
import { AxiosResponse } from "axios";
// Custom functional libraries
import { getFormattedTimestamp, asyncRequest } from "../utils";
// Internal & 3rd party component libraries
import { Stack, Divider, Tabs, Tab, FormControl, FormControlLabel, Button, ButtonGroup, 
    RadioGroup, Box, Radio, useTheme, TextField, Checkbox } from "@mui/material";
import AceEditor from "react-ace";
import "ace-builds/src-noconflict/mode-json";
import "ace-builds/src-noconflict/theme-crimson_editor"
import "ace-builds/src-noconflict/ext-language_tools";
// Custom component libraries 
import { ActionInformation, Thing } from "./state";
import { TabPanel } from "../reuse-components";
import { PageContext, ThingManager, PageProps } from "./view";
import { ObjectInspector } from "react-inspector";
    
    

type SelectedActionWindowProps = {
    action : ActionInformation
}

const actionFields = ['Execute', 'Doc']

export const SelectedActionWindow = (props : SelectedActionWindowProps) => {

    const [actionFieldsTab, setActionFieldsTab] = useState(0);
    const handleTabChange = useCallback((_ : React.SyntheticEvent, newValue: number) => {
        setActionFieldsTab(newValue);
    }, [])
    
    return (
        <Stack id="selected-action-view-layout" sx={{ flexGrow: 1, display : 'flex' }} >
            <Tabs
                id="selected-action-fields-tab"
                variant="scrollable"
                value={actionFieldsTab}
                onChange={handleTabChange}
                sx={{ borderBottom: 2, borderColor: 'divider' }}
            >
                {actionFields.map((name : string) => 
                    <Tab 
                        key={"selected-action-fields-tab-"+name}    
                        id={name} 
                        label={name} 
                        sx={{ maxWidth: 150}} 
                    />
                )}
            </Tabs>
            {actionFields.map((name : string, index : number) => 
                <TabPanel 
                    key={"selected-action-fields-tabpanel-"+name}
                    tree="selected-action-fields-tab"
                    value={actionFieldsTab} 
                    index={index} 
                >
                    <ActionTabComponents 
                        tab={name} 
                        action={props.action}
                    />
                </TabPanel>
            )} 
        </Stack>
    )
}



type ActionTabComponentsProps = {
    tab : string
    action : ActionInformation
}

export const ActionTabComponents = ( {tab, action} : ActionTabComponentsProps) => {

    
    switch(tab) {
        case "Doc" : {
            const thing = useContext(ThingManager) as Thing
            return <ObjectInspector expandLevel={3} data={thing.td["actions"][action.name]} /> 
        }
        default : return <ActionExecutionClient action={action} ></ActionExecutionClient>
    }
}



type ActionExecutionProps = {
    action : ActionInformation
}

export const ActionExecutionClient = ( { action } : ActionExecutionProps) => {

    const thing = useContext(ThingManager) as Thing
    const { settings } = useContext(PageContext) as PageProps
    
    const [clientChoice, _] = useState('node-wot')
    const [fetchExecutionLogs, setFetchExecutionLogs] = useState<boolean>(false)                                                                                               
    const [inputChoice, setInputChoice ] = useState('JSON')
    const [timeout, setTimeout] = useState<number>(-1)
    const [timeoutValid, setTimeoutValid] = useState<boolean>(true)
    const [skipResponseValidation, setSkipResponseValidation] = useState(false)
    const [kwargsValue, setKwargsValue] = useState<any>(null)
    const handleInputSelection = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
        setInputChoice(event.target.value)
    }, [])

    useEffect(() => {
        // setInputChoice(action.inputType)
        return () => setKwargsValue(null)
    }, [action])
    
    const invokeAction = useCallback(async () => {
        try {
            let data, _fullpath 
            let fullpath = action.forms[0]["href"]
            let http_method = action.forms[0]["htv:methodName"]
            if(http_method.toLowerCase() === 'get') {
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
            /* 
            order -
            1. perform operation 
            2. set response
            3. set console output
            4. reset error

            In this way
            1. If there is an error in even doing the operation 
                1. the last valid response is not unncessarily lost
                2. update error to new one and ignore console output
            2. If there is an error in retrieving the value from the response
                1. update last response
                2. update error to new one and ignore console output
            3. If there is no error
                1. update last response
                2. update console output
                3. reset error
            */
            let consoleOutput
            const requestTime = getFormattedTimestamp()
            const requestTime_ = Date.now()
            if(clientChoice !== 'node-wot') {
                const response = await asyncRequest({
                    url : _fullpath, 
                    method : http_method, 
                    data : data
                    // httpsAgent: new https.Agent({ rejectUnauthorized: false })
                }) as AxiosResponse
                thing.setLastResponse(response)
                if(response.status >= 200 && response.status < 300) {
                    if(response.data) 
                        consoleOutput = response.data
                    thing.resetError()
                }
                else if(response.data && response.data.exception) {
                    thing.setError(response.data.exception.message, response.data.exception.traceback)
                    consoleOutput = response.data.exception 
                }
                else {
                    consoleOutput = response
                }
                
            }
            else {
                let lastResponse = await thing.client.invokeAction(action.name, data)
                thing.setLastResponse(lastResponse)
                if(skipResponseValidation)
                    lastResponse.ignoreValidation = true
                consoleOutput = await lastResponse.value()
                if(!consoleOutput)
                    consoleOutput = 'no return value'
            }       
            if(settings.console.stringifyOutput) 
                console.log("\n" + JSON.stringify(consoleOutput, null, 2))
            else 
                console.log(consoleOutput)
            let executionTime = Date.now() - requestTime_
            console.log(`ACTION EXECUTION : ${thing.td.title}.${action.name}, REQUEST TIME : ${requestTime}, RESPONSE TIME : ${getFormattedTimestamp()}, EXECUTION TIME : ${executionTime.toString()}ms, RESPONSE BELOW : `)
        } 
        catch(error : any){
            // console.log(error)
            thing.setError(error.message, null)
        } 
    }, [thing, action, settings, fetchExecutionLogs, kwargsValue, timeout, clientChoice, skipResponseValidation])

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
        <Stack id='action-execution-client-layout' sx={{ flexGrow: 1, display : 'flex', pt: 2 }}>
            <ActionInputChoice 
                choice={inputChoice} 
                signature={action.signature} 
                setValue={setKwargsValue} 
                value={kwargsValue}    
            />
            <Stack 
                id='action-execution-client-options-layout' 
                direction="row" 
                sx={{ flexGrow: 1, display : 'flex'}}
            >
                <FormControl sx={{pl : 2, pt : 2}}> 
                    <RadioGroup
                        id="actions-execution-client-input-choice-group"
                        row
                        value={inputChoice}
                        onChange={handleInputSelection}
                    >
                        <FormControlLabel value="raw" control={<Radio size="small" />} label="raw" />
                        <FormControlLabel value="JSON" control={<Radio size="small" />} label="code editor" />
                    </RadioGroup>
                </FormControl>
                {/* <Box sx={{ pl : 2, pt: 2, pr: 2, maxWidth : 100 }} > */}
                    {/* <TextField
                        id='console-window-timeout-input'
                        label='Timeout (s)'    
                        size='small'
                        defaultValue={timeout}
                        error={!timeoutValid}
                        onChange={handleTimeoutChange}
                    />
                </Box> */}
                <Box sx={{pt: 2, flexGrow: 0.01, display : 'flex' }} >
                    {/* <ButtonGroup> */}
                        <Button 
                            variant="contained"
                            disableElevation
                            color="secondary"
                            onClick={invokeAction}
                          
                        >
                            Execute
                        </Button>    
                        {/* <Divider orientation="vertical" sx={{ backgroundColor : "black" }}></Divider> */}
                        {/* <Button 
                            variant="contained"
                            disableElevation
                            color="secondary"
                            
                            // onClick={cancelAction}
                        >
                            Cancel
                        </Button>     */}
                    {/* </ButtonGroup> */}
                </Box>                
                <FormControlLabel
                    label="skip response validation"
                    control={<Checkbox
                                size="small"
                                checked={skipResponseValidation}
                                onChange={(event) => setSkipResponseValidation(event.target.checked)}
                            />}
                    sx={{ p : 1, pt:2 }}
                />
                {/* <FormControlLabel
                    label="fetch execution logs"
                    control={<Checkbox
                                size="small"
                                checked={fetchExecutionLogs}
                                onChange={(event) => setFetchExecutionLogs(event.target.checked)}
                            />}
                    sx={{ pl : 1, pt : 2}}
                /> */}
            </Stack>
        </Stack>
    )
}



type ActionInputChoiceProps = { 
    choice : string, 
    signature : Array<string>,
    setValue : any
    value : any 
}

export const ActionInputChoice = (props : ActionInputChoiceProps) => {
    const theme = useTheme()
    switch(props.choice) {
        case 'JSON' : return <Box id="ace-editor-box" sx={{display : 'flex', flexGrow : 1}}>
                                <AceEditor
                                    name="actions-client-json-input"
                                    placeholder="payload for executing action"
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