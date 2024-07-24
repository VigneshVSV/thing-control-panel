// Internal & 3rd party functional libraries
// Custom functional libraries
// Internal & 3rd party component libraries
// Custom component libraries 

// This file mostly follows python naming conventions - PEP8 - because this information is loaded from 
// python side
// Internal & 3rd party functional libraries
import { makeObservable, observable, action } from 'mobx';
import axios, { AxiosResponse } from 'axios';
// Custom functional libraries
import { fetchFieldFromLocalStorage } from '@hololinked/mobx-render-engine/utils/misc';
// Internal & 3rd party component libraries
// Custom component libraries 


export type RemoteObjectInfo = {
    id : string
    description : string
    properties : { [key : string] : any }
    actions : { [key : string] : any }
    events : { [key : string] : any }
    inheritance : string[]
}



export class ResourceInformation {

    title! : string
    description! : string
    // our own
    name! : string
    type! : string

    constructor(data : Partial<ResourceInformation>) {
        this.updateFromJSON(data);
    }

    get doc() : string {
        if(this.description)
            return this.description.replace('\n', ' ').replace(/\s+/g, " ").trim()
        return "No Docstring Available"    
    }

    get state() : string {
        if(!this.state) 
            return "any state"
        let state = ''
        for (let st of this.state)
            state = state? state + ', ' + st : st 
        return state // .substring(state.length - 2)
    }

    updateFromJSON(json : { [key : string] : any }) : void {
        // Iterate over the keys of the JSON object
        for (let key in json) {
            // Check if the class has a property with the same name
            if (this.hasOwnProperty(key)) {
                // @ts-ignore
                this[key] = json[key];
            }
        }
    }
}



export class PropertyInformation extends ResourceInformation {

    constant! : boolean
    observable! : boolean
    readOnly! : boolean
    default : any
    // following are owr own
    allow_None! : boolean
    class_member! : boolean
    db_commit! : boolean
    db_init! : boolean
    db_persist! : boolean
    deepcopy_default! : boolean
    per_instance_descriptor! : boolean
    metadata : any
   
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
    signature? : Array<string> 
}

export class EventInformation extends ResourceInformation {}



export class ThingInformation  {
    id : string
    description : string
    properties : PropertyInformation[] 
    actions : ActionInformation[]
    events : EventInformation[]
    inheritance : string[]
      
    constructor(info : RemoteObjectInfo) {
        this.properties = []
        this.actions = []
        this.events = []
        for (let key of Object.keys(info.properties)) 
            this.properties.push(new PropertyInformation(info.properties[key as string]))
        for (let key of Object.keys(info.actions))
            this.actions.push(new ActionInformation(info.actions[key]))
        for (let key of Object.keys(info.events))
            this.events.push(new EventInformation(info.events[key]))
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

    // Remote Object Information
    info : ThingInformation
    td : any 
    client : any
    // error displays
    fetchSuccessful : boolean
    errorMessage :  string
    errorTraceback :  string[] | null 
    hasError : boolean 
    existingRO_URLs : any
   
    // console output features declared at this level to be used across different tabs
    // last Response to be available as JSON
    lastResponse : { [key : string] : any } | null 
    // event sources to be streamed across tabs 
    eventSources : any 
    

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
     
        this.existingRO_URLs = typeof window !== 'undefined'? fetchFieldFromLocalStorage('remote-object-locator-text-input', []) : []
   
        makeObservable(this, {
            info : observable,
            fetch : action,
            setInfo : action, 
            clearState : action,
          
    
            fetchSuccessful : observable, 
            setFetchSuccessful : action,

            existingRO_URLs : observable,
        
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

    setError (message = '', traceback = null) {
        this.errorMessage = message 
        this.errorTraceback = traceback
        this.hasError = true
    }

    resetError() {
        this.errorMessage = ''
        this.errorTraceback = null 
        this.fetchSuccessful = true
        this.hasError = false 
    }

    setInfo(thingInfo : ThingInformation) {
        this.info = thingInfo
    }

    clearState() {
        // delete thingInfo
        this.info = emptyThingInformation
        this.resetError()
    }

    setFetchSuccessful(value :  boolean) {
        this.fetchSuccessful = value
    }

    addEventSource(URL : string, src : EventSource) {
        this.eventSources[URL] = src
    }

    removeEventSource(URL : string){
        if(this.eventSources[URL])
            delete this.eventSources[URL]
    }

    setLastResponse(response : any) {
        this.lastResponse = response 
    }

    async fetch(baseurl : string) { 
        // this method always when set as action will raise a warning in MobX due to being async 
        // https://stackoverflow.com/questions/64770762/mobx-since-strict-mode-is-enabled-changing-observed-observable-values-withou

        try {
            const response = await axios({
                url : "/resources/portal-app", 
                method : "get", 
                baseURL : baseurl
                // httpsAgent: new https.Agent({ rejectUnauthorized: false })
            }) as AxiosResponse
            if (response.status === 200) {
                if (response.data && response.data.id) {
                    let roinfo : ThingInformation = new ThingInformation(response.data) 
                    this.setInfo(roinfo)
                    this.setFetchSuccessful(true)
                    this.resetError()
                }
            }
            else if(response.data && response.data.exception) {
                this.setFetchSuccessful(false)
                this.setError(response.data.exception.message, response.data.exception.traceback)
                this.setLastResponse(response.data)
            }
            else {
                this.setFetchSuccessful(false)
                this.setError(`could not load remote object information : response status - ${response.status}`, null) 
                this.setLastResponse(response)
            }
        } catch(error : any) {
            this.setError(error.message, null) 
            this.setFetchSuccessful(false)
            this.setLastResponse(null)
        }
        console.debug(this.info)
    }

   

    getObjects(name : "Properties" | "Actions" | "Events") : { [key : string] : any } {
        switch(name) {
            case 'Actions' : return this.info.actions
            case 'Events' : return this.info.events
            default : return this.info.properties
        }
    }
}

