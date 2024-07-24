// Internal & 3rd party functional libraries
import { makeObservable, observable, action } from 'mobx';
import axios, { AxiosResponse } from 'axios';
// Custom functional libraries
import { fetchFieldFromLocalStorage } from '@hololinked/mobx-render-engine/utils/misc';
// Internal & 3rd party component libraries
import { ThingInformation } from './thing-info';
// Custom component libraries 




export const emptyThingInformation = new ThingInformation({
    id : '',
    properties : [], 
    actions : [], 
    events : [], 
    description : '', 
    inheritance : []
})



export class ThingClientWorkerState {

    // Remote Object Information
    thingInfo : ThingInformation
    wotClient : any
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

        this.thingInfo = emptyThingInformation
        this.wotClient = null
        this.fetchSuccessful = true 
       
       
        this.errorMessage = ''
        this.errorTraceback = null 
        this.hasError = false  
        this.lastResponse = null 
        this.eventSources = {}
     
        this.existingRO_URLs = typeof window !== 'undefined'? fetchFieldFromLocalStorage('remote-object-locator-text-input', []) : []
   
        makeObservable(this, {
            thingInfo : observable,
            fetchThingInfo : action,
            setThingInfo : action, 
            clearThingInfo : action,
          
    
            fetchSuccessful : observable, 
            setFetchSuccessful : action,

            existingRO_URLs : observable,
        
            setStringifyOutput : action,

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

    setThingInfo(thingInfo : ThingInformation) {
        this.thingInfo = thingInfo
    }

    clearThingInfo() {
        // delete thingInfo
        this.remoteObjectState = '' // again refs at the top
        this.thingInfo = emptyThingInformation
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

    async fetchThingInfo(arg : string | null = null) { 
        // this method always when set as action will raise a warning in MobX due to being async 
        // https://stackoverflow.com/questions/64770762/mobx-since-strict-mode-is-enabled-changing-observed-observable-values-withou

        try {
            let baseurl = arg 
            const response = await axios({
                url : "/resources/portal-app", 
                method : "get", 
                baseURL : baseurl,
                // httpsAgent: new https.Agent({ rejectUnauthorized: false })
            }) as AxiosResponse
            if (response.status === 200) {
                if (response.data && response.data.id) {
                    let roinfo : ThingInformation = new ThingInformation(response.data) 
                    this.setThingInfo(roinfo)
                this.setFetchSuccessful(true)
                this.resetError()
            }
            else if(response.data && response.data.exception) {
                this.setFetchSuccessful(false)
                this.setError(response.data.exception.message, response.data.exception.traceback)
                if(this.stringifyOutput)
                    console.log(JSON.stringify(response, null, 2))
                else 
                    console.log(response)
                console.log("could not load remote object information")
            }
            else {
                this.setError(`could not load remote object information : response status - ${response.status}`, null) 
                this.setFetchSuccessful(false)
                if(this.stringifyOutput)
                    console.log(JSON.stringify(response, null, 2))
                else 
                    console.log(response)
                console.log("could not load remote object information")
            }
        } catch(error : any) {
            this.setError(error.message, null) 
            this.setFetchSuccessful(false)
        }
        console.debug(this.thingInfo)
    }

   

    getObjects(name : "Properties" | "Actions" | "Events") : { [key : string] : any } {
        switch(name) {
            case 'Actions' : return this.thingInfo.actions
            case 'Events' : return this.thingInfo.events
            default : return this.thingInfo.properties
        }
    }
}

