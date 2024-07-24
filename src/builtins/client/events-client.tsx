// Internal & 3rd party functional libraries
import { useContext, useEffect, useState } from "react";
import { observer } from "mobx-react-lite";
// Custom functional libraries
// Internal & 3rd party component libraries
import { Button, Stack, ButtonGroup, Link } from "@mui/material"
// Custom component libraries 
import { EventInformation } from './state'
import { Thing } from "./state";
import { ThingManager } from "./view";



type EventSelectWindowProps =  { 
    event : EventInformation
}

export const SelectedEventWindow = observer((props : EventSelectWindowProps) => {

    const clientState = useContext(ThingManager) as Thing

    const [eventURL, setEventURL] = useState<string>(clientState.domain + props.event.fullpath)

    useEffect(() => 
        setEventURL(clientState.domain + props.event.fullpath)
    , [props.event.fullpath])
   
    const streamEvent = () => {
        let source = new EventSource(eventURL)
        source.onmessage = (event : MessageEvent) => {
            if(clientState.stringifyOutput)    
                console.log(event.data)
            else 
                console.log(JSON.parse(event.data))
        } 
        source.onopen = (event) => {
            console.log(`subscribed to event source at ${eventURL}`)
        } 
        source.onerror = (error) => {
            console.log(error)
        }
        clientState.addEventSource(eventURL, source)
    }

    const stopEvent = () => {
        let eventSrc = clientState.eventSources[eventURL]
        if(eventSrc) {
            eventSrc.close()
            console.log(`closing event source ${eventURL}`)
            clientState.removeEventSource(eventURL)
        }
    }

    return(
        <Stack>
            <Link 
                // @ts-ignore
                onClick={() => window.open(eventURL)} 
                sx={{ display : 'flex', alignItems : "center", cursor:'pointer',  pl : 2, pt : 1, fontSize : 18,
                    color : "#0000EE" }}
                underline="hover"
                variant="caption"
            >
                {eventURL}
            </Link> 
            <Stack direction = "row" sx={{ flexGrow: 1, display : 'flex', pl : 1, pt : 1 }}>
                <ButtonGroup 
                    variant="contained"
                    sx = {{ pr : 2 }}
                    disableElevation
                    color="secondary"
                >
                    <Button 
                        sx={{ flexGrow: 0.05, display : 'flex'}} 
                        onClick={streamEvent}
                        disabled={clientState.eventSources[eventURL] ? true : false}
                    >
                        Stream
                    </Button>
                    <Button 
                        sx={{ flexGrow: 0.05, display : 'flex'}} 
                        onClick={stopEvent}
                        disabled={clientState.eventSources[eventURL] ? false : true}
                    >
                        Stop
                    </Button>
                </ButtonGroup>
            </Stack>
        </Stack>
    )
})



