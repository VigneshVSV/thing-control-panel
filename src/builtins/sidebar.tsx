import { Button, Divider, Drawer, IconButton, Link, Stack, Typography } from "@mui/material"
import { useState } from "react"
import GitHubIcon from '@mui/icons-material/GitHub';
import VolunteerActivismIcon from '@mui/icons-material/VolunteerActivism';
import { OpenInNewTwoTone } from "@mui/icons-material";


export const Sidebar = ({ open, setOpen }: { open: boolean, setOpen: Function}) => {

    return (
        <Drawer 
            anchor="left"
            open={open}
            onClose={() => setOpen(false)}
        >   
            <Stack sx={{ minWidth : 250, padding : 2}}>
                <Divider><Typography variant='button' color='black'>Online Things</Typography></Divider>
                <OnlineThings />
                <Divider />
                <SSLSwappedWebsite />
                <Divider />
                <Links />
                
            </Stack>
        </Drawer>        
    )
}


const SSLSwappedWebsite = () => {

    return (
        <Stack>
            <Link 
                href={window.location.hostname === 'thing-control-panel.hololinked.dev' ? 
                    'http://thing-control-panel-no-ssl.hololinked.dev' : 'https://thing-control-panel.hololinked.dev'} 
                    target='_blank' 
                    sx={{ padding : 1}}
                    >
                
                <Typography sx={{ padding : 2, fontSize: 12 }} variant='caption'>
                    Visit SSL-swapped version of the website 
                </Typography>
            </Link>
            <Typography sx={{ fontSize : 11, padding : 1, maxWidth : 250 }} variant='caption'>
                HTTP & websocket non-SSL versions of the protocols are not supported in the same website as
                HTTPS & WSS. For MQTT, please use MQTT over websockets.
            </Typography>
        </Stack>
    )
}


const OnlineThings = () => {


    return (
        <Stack sx={{ padding : 1}}>
            <OnlineThing title='Counter' link='https://thing-control-panel.hololinked.dev/#http://plugfest.thingweb.io/http-data-schema-thing' />
            <OnlineThing title='Smart Coffee Machine' link='https://thing-control-panel.hololinked.dev/#https://zion.vaimee.com/things/urn:uuid:7ba2bca0-a7f6-47b3-bdce-498caa33bbaf' />
        </Stack>
    )
}


const OnlineThing = ({ title, link } : { title : string, link : string }) => {

    return (

        <Stack direction={'row'} spacing={1}>
            <Button>{title}</Button>
            <IconButton 
                title="Open Counter in new tab"
                onClick={() => window.open(link, '_blank')}
                >
                <OpenInNewTwoTone />
            </IconButton>
        </Stack>
    )
}


export const Links = () => {

    return (
        <Stack direction='row' spacing={1} sx={{ paddingTop : 1}}>
            <IconButton onClick={() => window.open('https://github.com/VigneshVSV/thing-control-panel', '_blank')}>
                <GitHubIcon />
            </IconButton>
            <IconButton onClick={() => window.open('https://github.com/sponsors/VigneshVSV', '_blank')}>
                <VolunteerActivismIcon />
            </IconButton>
        </Stack>
    )
}