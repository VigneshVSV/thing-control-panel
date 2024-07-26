// Internal & 3rd party functional libraries
import  { useState, useCallback, useEffect, MutableRefObject } from "react";
// Custom functional libraries
import { StateManager } from "@hololinked/mobx-render-engine/state-manager";
import axios, { AxiosResponse } from "axios";
// Internal & 3rd party component libraries
// Custom component libraries 



export const useDashboard = (dashboardURL : string, dashboardStateManager : MutableRefObject<StateManager | null>) : [
        loading : boolean, 
        fetchData : () => Promise<boolean>,
        errorMessage : string, 
        errorTraceback : string[],
        clearErrorMessage : () => void
    ] => {

    const [loading, setLoading] = useState<boolean>(false)
    const [errorMessage, setErrorMessage] = useState<string>('')
    const [errorTraceback, setErrorTraceback] = useState<string[]>([]) 

    const clearErrorMessage = useCallback(() => {
        setErrorMessage('')
        setErrorTraceback([])
    }, [])

    const fetchData = useCallback(async() => {
        let errMsg = '', errTb = []
        setLoading(true)
        // @ts-ignore
        let response : AxiosResponse = null
        try {
            response  = await axios.get(dashboardURL)
            if (!dashboardStateManager.current){
                errMsg = 'Internal error - dashboard state manager not created. Use setDashboardStateManager hook before calling fetchData'
                // developer protection
            }
            else if(response.status === 200) {
                try {
                    const UIComponents =  response.data? response.data.UIcomponents : response.data.UIcomponents
                    const actions = response.data? response.data.actions : response.data.actions
                    dashboardStateManager.current.deleteComponents()
                    dashboardStateManager.current.deleteActions()
                    dashboardStateManager.current.store(
                        dashboardURL,
                        UIComponents,
                        actions
                    )
                    dashboardStateManager.current.updateActions(actions)
                    dashboardStateManager.current.updateComponents(UIComponents)
                } catch (error : any) {
                    errMsg = "Failed to load view - " + error.message ? error.message : error   
                    // dashboardStateManager.current.logger.logErrorMessage("IconButton", "quick-view", error as string)      
                }
            }
        } catch(error : any) {
            if(error.response) {
                let response = error.response
                if(response.data && response.data.exception) {
                    errMsg = response.data.exception.message
                    errTb = response.data.exception.traceback
                } 
                else {
                    errMsg = response.status ? `resonse status code - ${response.status} - ${response.statusText}` : 
                                'invalid response after request - is the address correct?'
                }
            }
            else {
                console.log("dashboard fetch failed - ", error.message)
                errMsg = `Failed to fetch JSON - ${error.message} - check CORS, https certificate, reachability or the console for more details`
                // dashboardStateManager.current.logger.logErrorMessage("IconButton", "quick-view", reason)  
            }
        }
        setLoading(false)
        setErrorMessage(errMsg)
        setErrorTraceback(errTb)
        if(response && response.status && response.status === 200 && !errMsg)
            return true 
        return false
    }, [dashboardURL])

    return [loading,  fetchData, errorMessage, errorTraceback, clearErrorMessage]
}



export const fetchFieldFromLocalStorage = (field : string | null, defaultValue : any = null) => {
    let obj = localStorage.getItem('thing-control-panel')
    if(!obj)
        return defaultValue 
    if(typeof(obj) === 'string') 
        obj = JSON.parse(obj as string)
    if(field) {
        // @ts-ignore
        obj = obj[field]
        if(!obj)    
            return defaultValue
        return obj 
    }
    else{
        if(!obj)
            return defaultValue
        return obj   
    }
}


export const useLocalStorage = (field : string, defaultValue : any) => { 
    let obj = fetchFieldFromLocalStorage(field, defaultValue)

    const updateLocalStorage = useCallback((value: any) => {
        const lobj = fetchFieldFromLocalStorage(null, {});
        // console.log("total values in local storage before", lobj)   
        lobj[field] = value;
        // localStorage.setItem('thing-control-panel', JSON.stringify(lobj));
        console.log("total values in local storage after", lobj)   
    }, [field]);

    return [obj, updateLocalStorage];


}


export const useAutoCompleteOptionsFromLocalStorage = (field : string) => {
    const [existingData, setExistingData] = useState<{[key : string] : any}>({})
    if(!existingData[field])
        existingData[field] = [] // no need to re-render - it will correct at first iteration

    useEffect(() => {
        let data = fetchFieldFromLocalStorage(null, {})
        setExistingData(data)
    }, [])

    const modifyOptions = useCallback((entry : string | string[], operation : 'ADD' | 'DELETE') => {
        if(operation === 'ADD') {
            if(Array.isArray(entry)) {
                for(let value of entry) {
                    if(value) {
                        if(!existingData[field].includes(value)) 
                            existingData[field].push(value)
                    }
                }
            }
            else if(entry) {
                if(!existingData[field].includes(entry)) 
                    existingData[field].push(entry)
            }
        }
        else {
            if(Array.isArray(entry)) {
                for(let value of entry) {
                    if(value) {
                        if(existingData[field].includes(entry)) {
                            existingData[field].splice(existingData[field].indexOf(entry), 1)
                        }
                    }
                }
            }
            else if(entry) {
                if(existingData[field].includes(entry)) {
                    existingData[field].splice(existingData[field].indexOf(entry), 1)
                }
            }
        }
        setExistingData(existingData)
        localStorage.setItem('thing-control-panel', JSON.stringify(existingData))
    }, [existingData])
    return [existingData[field], modifyOptions]
}   



// https://github.com/CharlesStover/use-force-update
const createNewObject = (): Record<string, never> => ({});

export function useForceUpdate(): [Record<string, never>, VoidFunction] {
    const [useEffectDummyDependent, setValue] = useState<Record<string, never>>(createNewObject());

    return [useEffectDummyDependent, useCallback((): void => {
        setValue(createNewObject());
    }, [])]
}