// Internal & 3rd party functional libraries
import { makeObservable, observable, action } from 'mobx';
import axios, { AxiosResponse } from 'axios';
// Custom functional libraries
import { asyncRequest } from '@hololinked/mobx-render-engine/utils/http';
import { fetchFieldFromLocalStorage } from '@hololinked/mobx-render-engine/utils/misc';
// Internal & 3rd party component libraries
import { EventInfo, EventInformation, MethodInfo, MethodInformation, ParameterInfo, 
    ParameterInformation, RemoteObjectInformation } from './thing-info';
// Custom component libraries 




export const emptyRemoteObjectInformation = new RemoteObjectInformation({
    instance_name : '',
    parameters : [], 
    methods : [], 
    events : [], 
    classdoc : null, 
    inheritance : [], 
    documentation : null, 
    GUI : null
})

const createDomain = (value : string) => {
    let protocol = value.split('//')[0]
    let domain = value.split('/')[2]
    return protocol+'//'+domain
}

export class RemoteObjectClientState {

    // Remote Object Information
    remoteObjectInfo : RemoteObjectInformation
    remoteObjectState : string
    fetchSuccessful : boolean
    // baseURL of the remote-object
    baseURL : string 
    // baseURL's domain 
    domain : string 
    existingRO_URLs : any
    // console output features declared at this level to be used across different tabs
    stringifyOutput : boolean
    showSettings : boolean 
    // error displays
    errorMessage :  string
    errorTraceback :  string[] | null 
    hasError : boolean 
    // last Response to be available as JSON
    lastResponse : { [key : string] : any } | null 
    // event sources to be streamed across tabs 
    eventSources : any 
    

    constructor() {

        this.remoteObjectInfo = emptyRemoteObjectInformation
        this.fetchSuccessful = true 
        this.remoteObjectState = ''
        this.stringifyOutput = false 
        this.showSettings = false
        this.errorMessage = ''
        this.errorTraceback = null 
        this.hasError = false  
        this.lastResponse = null 
        this.eventSources = {}
        this.baseURL = ''
        this.domain = ''
        this.existingRO_URLs = typeof window !== 'undefined'? fetchFieldFromLocalStorage('remote-object-locator-text-input', []) : []
   
        makeObservable(this, {
            remoteObjectInfo : observable,
            fetchRemoteObjectInfo : action,
            setRemoteObjectInfo : action, 
            clearRemoteObjectInfo : action,
            remoteObjectState : observable,
            setRemoteObjectState : action,
            fetchSuccessful : observable, 
            setFetchSuccessful : action,

            baseURL : observable, 
            domain : observable,
            existingRO_URLs : observable,
            updateURLprefixes : action, 
            editURLsList : action,

            stringifyOutput : observable,
            showSettings : observable,
            setShowSettings : action,
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

    updateURLprefixes(value : string) {
        this.baseURL = value
        this.domain = createDomain(value)
        // console.log(protocol+'//'+domain)
    }

    setRemoteObjectInfo(remoteObjectInfo : RemoteObjectInformation, state : string | null | undefined) {
        this.remoteObjectInfo = remoteObjectInfo
        if(state)
            this.remoteObjectState = state
    }

    setRemoteObjectState(state : string){
        this.remoteObjectState = state
    }

    clearRemoteObjectInfo() {
        // delete remoteObjectInfo
        this.remoteObjectState = '' // again refs at the top
        this.remoteObjectInfo = emptyRemoteObjectInformation
        this.resetError()
    }

    setFetchSuccessful(value :  boolean) {
        this.fetchSuccessful = value
    }

    setShowSettings(value : boolean) {
        this.showSettings = value
    }

    setStringifyOutput(value : boolean) {
        this.stringifyOutput = value
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

    async fetchRemoteObjectInfo(arg : string | null = null) { 
        // this method always when set as action will raise a warning in MobX due to being async 
        // https://stackoverflow.com/questions/64770762/mobx-since-strict-mode-is-enabled-changing-observed-observable-values-withou

        try {
            let baseurl = arg ? arg : this.baseURL
            const response = await axios({
                url : "/resources/portal-app", 
                method : "get", 
                baseURL : baseurl,
                // httpsAgent: new https.Agent({ rejectUnauthorized: false })
            }) as AxiosResponse
            if (response.status === 200) {
                this.updateURLprefixes(baseurl)
                let roinfo : RemoteObjectInformation = new RemoteObjectInformation({instance_name : '', parameters : [], 
                    methods : [], events : [], classdoc : null, inheritance : [], 
                    documentation : null, GUI : null}) 
                roinfo.instance_name = response.data.instance_name 
                for(let key of Object.keys(response.data.properties)) 
                    roinfo.parameters.push(new ParameterInformation(response.data.properties[key] as ParameterInfo))                    
                for(let key of Object.keys(response.data.actions)) 
                    roinfo.methods.push(new MethodInformation(response.data.actions[key] as MethodInfo))                    
                for(let key of Object.keys(response.data.events)) 
                    roinfo.events.push(new EventInformation(response.data.events[key] as EventInfo))
                if(response.data.classdoc) 
                    roinfo.classdoc = response.data.classdoc.join(' ')
                if(response.data.inheritance) 
                    roinfo.inheritance = response.data.inheritance
                this.setRemoteObjectInfo(roinfo, "UNKNOWN" )
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
        console.debug(this.remoteObjectInfo)
    }

    editURLsList = (inputURL : string, operation : 'ADD' | 'REMOVE') => {
        let existingData = fetchFieldFromLocalStorage(null, {})
        if(!existingData['remote-object-locator-text-input'])
            existingData['remote-object-locator-text-input'] = []
        if(operation === 'ADD') {
            if(!existingData['remote-object-locator-text-input'].includes(inputURL)) 
                existingData['remote-object-locator-text-input'].push(inputURL)
        }
        else {
            if(existingData['remote-object-locator-text-input'].includes(inputURL)) {
                existingData['remote-object-locator-text-input'].splice(existingData['remote-object-locator-text-input'].indexOf(inputURL), 1)
                if(inputURL === this.baseURL) 
                    this.updateURLprefixes(this.existingRO_URLs[0]? this.existingRO_URLs[0] : '')
            }
        }
        // console.log("existing data", existingData)
        // setExistingRO_URLs(existingData['remote-object-locator-text-input'])
        localStorage.setItem('daqpy-webdashboard', JSON.stringify(existingData))
    }   

    getObjects(name : string) : { [key : string] : any } {
        switch(name) {
            case 'Methods' : return this.remoteObjectInfo.sortedMethods 
            case 'Events' : return this.remoteObjectInfo.sortedEvents
            default : return this.remoteObjectInfo.sortedParameters
        }
    }
}

