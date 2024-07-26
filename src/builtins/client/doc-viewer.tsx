// Internal & 3rd party functional libraries
import * as React from 'react';
// import {  useCallback, useState } from "react";
import { observer } from 'mobx-react-lite';
// import { AxiosResponse } from 'axios';
import DOMPurify from 'dompurify';
// Custom functional libraries
// Internal & 3rd party component libraries
import { Stack, Typography, 
//  Button, TextField, ButtonGroup, IconButton, Autocomplete 
    } from "@mui/material"
// import OpenInNewTwoToneIcon from '@mui/icons-material/OpenInNewTwoTone';
// import DownloadTwoToneIcon from '@mui/icons-material/DownloadTwoTone'
// Custom component libraries 
// import { PropertyInformation } from './state';
import { Thing } from './state';
import { PageContext, PageProps, ThingManager } from './view';



export const ClassDocWindow = observer(() => {

    const thing = React.useContext(ThingManager) as Thing
    const { settings } = React.useContext(PageContext) as PageProps
    const classDoc = thing.td.description


    return (
        <Stack sx={{ flexGrow : 1, display : 'flex' }}> 
            <Typography sx={{ pt : 2, pb : 5, pl : settings.tabOrientation === 'vertical' ? 2 : null }}>
                {classDoc ? 
                    <div dangerouslySetInnerHTML={{__html : DOMPurify.sanitize(classDoc)}}></div>
                    : "no class doc provided" 
                }
            </Typography>
            {/* <Box sx={{ display : 'flex' }}>
                <Stack sx = {{ flexGrow : 0.5, display : 'flex' }}>
                    <PostmanFetcher />
                    <FileServer />
                </Stack>
            </Box> */}
        </Stack>
    )
})



// type fileSourceType = {
//     param : PropertyInformation 
//     paramName : string
//     value : string
// }

// const PostmanFetcher = () => {

//     const thing = React.useContext(ThingManager) as Thing
//     const [postmanDomainPrefix, setDomainPrefix] = useState(thing.domain)

//     const getPostmanCollection = useCallback(async() => {
//         const response = await asyncRequest({
//                 url: `/resources/postman-collection?domain_prefix=${postmanDomainPrefix}`,
//                 method : 'GET',
//                 baseURL : thing.baseURL,
//                 // httpsAgent: new https.Agent({ rejectUnauthorized: false })
//         }) as AxiosResponse
//         if(response.status >= 200 && response.status <= 250) {
//             let blob = new Blob([JSON.stringify(response.data, null, 4)], {
//                 type : 'application/json'
//             })
//             const fileUrl = URL.createObjectURL(blob);
//             // Create a temporary link element
//             const link = document.createElement('a');
//             link.href = fileUrl;
//             link.setAttribute('download', 'collection.json'); // Specify the desired filename
//             document.body.appendChild(link);
//             // Simulate a click on the link to start the download
//             link.click();
//             // Clean up the temporary link element
//             document.body.removeChild(link);
//         }
//         else if(response.data.exception) {
//             thing.setError(response.data.exception.message, response.data.exception.traceback)
//             if(thing.stringifyOutput)
//                 console.log(JSON.stringify(response, null, 2))
//             else 
//                 console.log(response)
//             console.log("could not load remote object information")
//         }
//         else { 
//             console.log(response)
//             console.log("could not fetch postman collection")
//         }
//     }, [postmanDomainPrefix, thing.baseURL])

//     return (
//         <Stack direction='row' sx = {{ display : 'flex' }}>
//             <TextField
//                 size='small'
//                 sx={{ pr: 2, flexGrow : 0.75 }}
//                 label="HTTP server domain prefix"
//                 value={postmanDomainPrefix}
//                 onChange={(event) => setDomainPrefix(event.target.value)}
//             />
//             <Button 
//                 size="small"
//                 variant="outlined" 
//                 endIcon={<DownloadTwoToneIcon/>} 
//                 onClick={getPostmanCollection}
//             >
//                 Postman Collection
//             </Button>
//         </Stack>
//     )
// }


// const [downloadedData, setDownloadedData] = useState<any>(null);
// const downloadFile = (fileSrc : fileSourceType | null) => {
//     // complete this later 
//     if(!fileSrc) {
//         console.log("select file")
//         return
//     }
//     const fetchData = async() => {
//         try{
//             let parts = fileSrc.param.fullpath.split('/')
//             let postfix = parts[parts.length-1]
//             let prefix = parts.slice(0, parts.length-1).join('/')
//             // gives a 404 for some reason 
//             const response = await asyncRequest({
//                 url: prefix + '/files/'  + postfix + '/' + fileSrc.value,
//                 method : 'GET',
//                 baseURL : thing.domain,
//                 httpsAgent: new https.Agent({ rejectUnauthorized: false }),
//                 responseType : 'arraybuffer'
//             })
//             if(response.status === 200) {
//                 // Following is from chat-gpt 
//                 // Store the downloaded data in the state
//                 setDownloadedData(response.data);
//                 const blob = new Blob([response.data], { type: 'application/octet-stream' });
            
//                 // Create a URL for the Blob and trigger a download
//                 const downloadUrl = URL.createObjectURL(blob);
//                 const a = document.createElement('a');
//                 a.href = downloadUrl;
//                 a.download = 'example.exe'; // Change the filename as needed
//                 a.click();

//                 // Clean up the URL object after download
//                 URL.revokeObjectURL(downloadUrl);
//             }
//             else {
//                 console.log(response)
//                 console.log("could not download requested file")
//             }
//         } catch(error) {
//             console.log(error)

//         }
//     }
//     fetchData()
// }



// const FileServer = () => {

//     const thing = React.useContext(ThingManager) as Thing
//     const documentationParameters = thing.remoteObjectInfo.documentationParameters 
//     const [fileSource, setFileSource] = useState<fileSourceType | null>(null)

//     const handleFileSourceChange = useCallback((_ : React.SyntheticEvent, src : any) => {
//         setFileSource(src as fileSourceType)
//     }, [])

//     const openFileSource = useCallback(() => {
//         if(!fileSource)
//             return 
//         let parts = fileSource.param.fullpath.split('/')
//         let postfix = parts[parts.length-1]
//         let prefix = parts.slice(0, parts.length-1).join('/')
//         window.open(thing.domain + prefix + '/files/'  + postfix + '/' + fileSource.value)
//     }, [fileSource])
    
//     return (
//         <>
//             {documentationParameters? 
//                 <Stack direction='row' sx = {{ display : 'flex', pt : 3 }}>
//                     <Autocomplete
//                         id="remote-object-documentation-file-server-listed-files"
//                         disablePortal
//                         autoComplete    
//                         size="small"
//                         onChange={handleFileSourceChange}
//                         value={fileSource}
//                         options={[].concat(...documentationParameters.map(
//                             (param : PropertyInformation) => {
//                                 return param.default.map((value : string) => {
//                                     return {
//                                         param : param, 
//                                         paramName : param.name,
//                                         value : value
//                                     }
//                                 })
//                             }))}
//                     groupBy={(option) => option.paramName}
//                     getOptionLabel={(option) => option.value}
//                     sx={{ flexGrow : 0.25, display: 'flex'}}
//                     renderInput={(params) => 
//                         <TextField
//                             {...params}
//                             size='small'
//                             label="Files"
//                         />
//                     }
//                 />
//                 <ButtonGroup sx={{pl : 2}}>
//                     {/* <IconButton
//                         sx = {{ borderRadius : 0 }}
//                         onClick={() => downloadFile(fileSource)} 
//                         >
//                         <DownloadTwoToneIcon />
//                     </IconButton> */}
//                     <IconButton 
//                         id="remote-object-load-using-locator"
//                         onClick={openFileSource}
//                         sx = {{ borderRadius : 0 }}
//                     >
//                         <OpenInNewTwoToneIcon /> 
//                     </IconButton>
//                 </ButtonGroup>
//             </Stack> : null
//         }
//         </>
//     )
// }