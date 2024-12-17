// Internal & 3rd party functional libraries
import axios, { AxiosResponse } from 'axios';
import { makeObservable, observable, action } from 'mobx';
// Custom functional libraries
// Internal & 3rd party component libraries
// Custom component libraries 
import '../../lib/wot-bundle.min.js';

// This file mostly follows python naming conventions - PEP8 - because this information is loaded from 
// python side

export type ThingInfo = {
    id : string
    description : string
    properties : { [key : string] : any }
    actions : { [key : string] : any }
    events : { [key : string] : any }
    inheritance : string[]
}



export class ResourceInformation {

    title : string
    description : string
    forms : Array<{ [key : string] : string }>
    // our own
    name : string
    type : string
    _state : string | string[]

    constructor(data : Partial<ResourceInformation>, name : string = '') {  
        this.title = ''
        this.description = ''
        this.name = name
        this.type = ''
        this._state = ''
        this.forms = []
    }

    get doc() : string {
        if(this.description)
            return this.description.replace('\n', ' ').replace(/\s+/g, " ").trim()
        return "No Docstring Available"    
    }

    get state() : string {
        if(!this._state) 
            return "any state"
        let state = ''
        for (let st of this._state)
            state = state? state + ', ' + st : st 
        return state // .substring(state.length - 2)
    }

    set state(value : string | string[]) {
        this._state = value
    }

    updateFromJSON(json : { [key : string] : any }) : void {
        // Iterate over the keys of the JSON object
        for (let key of Object.keys(json)) {
            // @ts-ignore
            this[key] = json[key];
        }
    }
}


export class PropertyInformation extends ResourceInformation {

    constant : boolean
    observable : boolean
    readOnly : boolean
    default : any
    // following are owr own
    allow_None : boolean
    class_member : boolean
    db_commit : boolean
    db_init : boolean
    db_persist : boolean
    deepcopy_default : boolean
    per_instance_descriptor : boolean
    metadata : any
    python_type : string
    
    constructor(data: Partial<PropertyInformation>, name: string = '') {
        super(data, name);
        this.constant = false;
        this.observable = false;
        this.readOnly = false;
        this.default = null;
        this.allow_None = false;
        this.class_member = false;
        this.db_commit = false;
        this.db_init = false;
        this.db_persist = false;
        this.deepcopy_default = false;
        this.per_instance_descriptor = false;
        this.metadata = null;
        this.python_type = ''
        this.updateFromJSON(data);
    }

    // property's own attributes for which chips should be shown
    chipKeys : string[] = ['allow_None' , 'class_member', 'constant', 'db_commit', 
        'db_init', 'db_persist', 'deepcopy_default', 'per_instance_descriptor', 'readOnly',
        'observable']

    chipKeysSensibleString : { [key : string] : string } = {
        'allow_None' : "allows None" , 
        'class_member' : "class variable", 
        'constant' : 'constant', 
        'db_commit' : 'database committed at write',
        'db_init' : 'loaded from database at startup only', 
        'db_persist' : 'database committed at write & loaded at startup', 
        'deepcopy_default' : 'deep-copied default value', 
        'per_instance_descriptor' : 'per instance descriptor',
        'readonly' : 'read-only',
        'observable' : 'observable'
    }

    // types for which JSON input field should be shown instead of raw input field
    JSONInputParameterTypes = ['Property', 'ClassSelector', 'Tuple', 'List', 'TypedList', 
                    'TypedDict', 'Iterable', 'Selector', 'TupleSelector', 'FileSelector', 
                    'MultiFileSelector', 'TypedKeyMappingsDict']

    get chips() : string[] {
        let Chips : string[] = []
        for(var key of Object.keys(this.chipKeysSensibleString)){
            if(this[key as keyof PropertyInformation])
                Chips.push(this.chipKeysSensibleString[key])
        }
        return Chips
    }

    get inputType() : string {
        if(this.readOnly)
            return 'RAW'  // check readonly always first
        else if(this.JSONInputParameterTypes.includes(this.type)) 
            return 'JSON'
        return 'RAW'
    }
}


export class ActionInformation extends ResourceInformation {
    kwdefaults : any
    defaults : any
    signature : Array<string> 
    input: any
   
    constructor(data: Partial<ActionInformation>, name: string = '') {
        super(data, name);
        this.kwdefaults = null;
        this.defaults = null;
        this.signature = [];
        this.input = null;
        this.updateFromJSON(data);
    }
}


export class EventInformation extends ResourceInformation {

    data : any

    constructor(data: Partial<EventInformation>, name: string = '') {
        super(data, name);
        this.data = null;
        this.updateFromJSON(data);
    }
}



export class ThingInformation  {
    id : string
    description : string
    properties : PropertyInformation[] 
    actions : ActionInformation[]
    events : EventInformation[]
    inheritance : string[]
      
    constructor(info : ThingInfo) {
        this.properties = []
        this.actions = []
        this.events = []
        for (let key of Object.keys(info.properties)) 
            this.properties.push(new PropertyInformation(info.properties[key as string], key))
        for (let key of Object.keys(info.actions))
            this.actions.push(new ActionInformation(info.actions[key], key))
        for (let key of Object.keys(info.events))
            this.events.push(new EventInformation(info.events[key], key))
        this.inheritance = info.inheritance
        this.description = info.description
        this.id = info.id
    }
}

export const emptyThingInformation = new ThingInformation({
    id : '',
    properties : [], 
    actions : [], 
    events : [], 
    description : '', 
    inheritance : []
})



export class Thing {

    // Object Information
    info : ThingInformation
    td : any 
    client : any
    servient : any // Wot.Core.Servient
    wot : any // Wot.Core.WoT
    fetchSuccessful : boolean
    // error displays
    errorMessage :  string
    errorTraceback :  string[] | null 
    hasError : boolean 
   
    // console output features declared at this level to be used across different tabs
    // last Response to be available as JSON
    lastResponse : { [key : string] : any } | null 
    // event sources to be streamed across tabs 
    eventSources : { [key : string] : EventSource | string }

    constructor() {
        this.info = emptyThingInformation
        this.td = null
        this.client = null
        this.fetchSuccessful = true 
       
        this.errorMessage = ''
        this.errorTraceback = null 
        this.hasError = false  
        this.lastResponse = null 

        this.eventSources = {}
        
        makeObservable(this, {
            info : observable,
            fetch : action,
            setInfo : action, 
            clearState : action,
          
            fetchSuccessful : observable, 
            setFetchSuccessful : action,

            errorMessage :  observable,
            errorTraceback :  observable,  
            setError : action,
            resetError : action,

            lastResponse : observable,
            setLastResponse : action,

            eventSources : observable,
            addEventSource : action,
            removeEventSource : action
        })
    }

    async fetch(baseurl : string, endpointURL : string = "") { 
        // this method always when set as action will raise a warning in MobX due to being async 
        // https://stackoverflow.com/questions/64770762/mobx-since-strict-mode-is-enabled-changing-observed-observable-values-withou

        try {
            const response = await axios({
                url : endpointURL, 
                method : "get", 
                baseURL : baseurl
                // httpsAgent: new https.Agent({ rejectUnauthorized: false })
            }) as AxiosResponse
            // debugger
            if (response.status === 200) {
                if (response.data && response.data.id) {
                    this.td = response.data
                    this.client = await this.wot.consume(this.td)
                    console.log("consumed thing description & client available")
                    this.setInfo(new ThingInformation(response.data))
                    this.setLastResponse(response.data)
                    this.resetError()
                    this.setFetchSuccessful(true)
                }
            }
            else if(response.data && response.data.exception) {
                this.setFetchSuccessful(false)
                this.setError(response.data.exception.message, response.data.exception.traceback)
                this.setLastResponse(response.data)
            }
            else {
                this.setFetchSuccessful(false)
                this.setError(`could not load thing : response status - ${response.status}`, null) 
                this.setLastResponse(response)
            }
        } catch(error : any) {
            this.setError(error.message, null) 
            this.setFetchSuccessful(false)
            this.setLastResponse(null)
        }
        console.debug(this.info)
    }

    setFetchSuccessful(value :  boolean) {
        this.fetchSuccessful = value
    }

    setInfo(thingInfo : ThingInformation) {
        this.info = thingInfo
    }

    clearState() {
        // delete thingInfo
        this.info = emptyThingInformation
        this.resetError()
    }

    setError (message = '', traceback = null) {
        this.errorMessage = message 
        this.errorTraceback = traceback
        this.hasError = true
    }

    resetError() {
        if(this.hasError){    
            this.errorMessage = ''
            this.errorTraceback = null 
            this.fetchSuccessful = true
            this.hasError = false 
        }
    }

    setLastResponse(response : any) {
        this.lastResponse = response 
    }

    addEventSource(URL : string, src : EventSource | string) {
        if(this.eventSources[URL]) {
            if (this.eventSources[URL] instanceof EventSource)
                console.warn("Event Source already exists for this URL")
        } 
        this.eventSources[URL] = src
    }

    removeEventSource(URL : string){
        if(this.eventSources[URL])
            delete this.eventSources[URL]
    }

    removeNodeWoTEventSource(name : string) {
        if (this.client.observedProperties.size > 0 && this.client.observedProperties.get(name).client.activeSubscriptions.size > 0) {
            for(let [key, value] of this.client.observedProperties.get(name).client.activeSubscriptions.entries()) {
                if (value.eventSource.hasOwnProperty("_close"))  {
                    value.eventSource._close()
                    this.removeEventSource(name)
                }
                else if(value.eventSource.hasOwnProperty("close")) {
                    value.eventSource.close()
                    this.removeEventSource(name)
                }
                else {
                    console.log("could not close event source")
                    console.log(value.eventSource)
                }
            }
        }
    }

    cancelAllEvents() {
        for (let key of Object.keys(this.eventSources)) {
            try {
                if (this.eventSources[key] instanceof EventSource) {
                    // @ts-expect-error
                    this.eventSources[key].close()
                    delete this.eventSources[key]
                    this.removeEventSource(key)
                }  else {
                    this.removeNodeWoTEventSource(key)
                }
            } catch (error) {
                console.log(error)
            }
        }
    }

    getInteractionAffordances(type : "Properties" | "Actions" | "Events") : { [key : string] : any } {
        switch(type) {
            case 'Actions' : return this.info.actions
            case 'Events' : return this.info.events
            default : return this.info.properties
        }
    }

    get logEventsPusherURL() : string { return '/resources/log-events' }

    get logEventsStopURL() : string { return '/resources/log-events' }

    get logEventsURL() : string { return '/resources/log-events' }
}

