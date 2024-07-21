// Internal & 3rd party functional libraries
import * as React from 'react';
import {  useCallback, useState } from "react";
import { styled } from '@mui/system';
import { observer } from 'mobx-react-lite';
import { AxiosResponse } from 'axios';
import DOMPurify from 'dompurify';
// Custom functional libraries
import { asyncRequest } from "@hololinked/mobx-render-engine/utils/http";
// Internal & 3rd party component libraries
import {TablePagination, tablePaginationClasses as classes } from '@mui/base/TablePagination';
import { Button, Stack, Typography,  TextField, ButtonGroup, 
     IconButton, Autocomplete } from "@mui/material"
import OpenInNewTwoToneIcon from '@mui/icons-material/OpenInNewTwoTone';
import DownloadTwoToneIcon from '@mui/icons-material/DownloadTwoTone'
// Custom component libraries 
import { PropertyInformation } from './thing-info';
import { RemoteObjectClientState } from './state';
import { ClientContext } from './view';



export default function UnstyledTable(props : { rows : Array<any>, tree : string, head? : any}) {
    // https://mui.com/base-ui/react-table-pagination/#system-TableUnstyled.tsx
    const [page, setPage] = React.useState(0);
    const [rowsPerPage, setRowsPerPage] = React.useState(5);

    // Avoid a layout jump when reaching the last page with empty rows.
    const emptyRows =
        page > 0 ? Math.max(0, (1 + page) * rowsPerPage - props.rows.length) : 0;

    const handleChangePage = (
        _ : React.MouseEvent<HTMLButtonElement> | null,
        newPage: number,
    ) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (
        event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
    ) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    };

    return (
        <Root sx={{ maxWidth: '100%' }}>
            <table>
            {props.head? 
                <>
                    {props.head}
                </>
            : null}
            <tbody key={props.tree+"body"}>
                {(rowsPerPage > 0
                    ? props.rows.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                    : props.rows
                ).map((row) => (
                    <>
                    {row.dynamic? 
                        <>
                            {row.component}
                        </> : 
                        <tr key={props.tree + row.id}>
                            <td style={{width : "10%"}}>{row.name}</td>
                            <td style={{width : "90%"}} align="center">
                                {row.info}
                            </td>
                        </tr>  
                    }
                    </>
                ))}
                {emptyRows > 0 && (
                    <tr style={{ height: 41 * emptyRows }}>
                        <td colSpan={2} />
                    </tr>
                )}
            </tbody>
            <tfoot>
                <tr>
                    <CustomTablePagination
                        // @ts-ignore
                        rowsPerPageOptions={[5, 10, 25, { label: 'All', value: -1 }]}
                        count={props.rows.length}
                        rowsPerPage={rowsPerPage}
                        page={page}
                        slotProps={{
                            actions: {
                                showFirstButton: true,
                                showLastButton: true,
                            },
                        }}
                        onPageChange={handleChangePage}
                        onRowsPerPageChange={handleChangeRowsPerPage}
                    />
                </tr>
            </tfoot>
            </table>
        </Root>
    );
}

const Root = styled('div')`
    table {
        font-family: arial, sans-serif;
        border-collapse: collapse;
        width: 100%;
    }

    td,
    th {
        border: 2px solid #ddd;
        text-align: left;
        padding: 8px;
    }

    th {
        background-color: #ddd;
    }
`;

// @ts-ignore
const CustomTablePagination = styled(TablePagination)`
    & .${classes.toolbar} {
        display: flex;
        flex-direction: column;
        align-items: flex-start;
        gap: 10px;

        @media (min-width: 768px) {
        flex-direction: row;
        align-items: center;
        }
    }

    & .${classes.selectLabel} {
        margin: 0;
    }

    & .${classes.displayedRows} {
        margin: 0;

        @media (min-width: 768px) {
        margin-left: auto;
        }
    }

    & .${classes.spacer} {
        display: none;
    }

    & .${classes.actions} {
        display: flex;
        gap: 0.25rem;
    }
`;




type fileSourceType = {
    param : PropertyInformation 
    paramName : string
    value : string
}

export const ClassDocWindow = observer(() => {

    const clientState = React.useContext(ClientContext) as RemoteObjectClientState
    const classDoc = clientState.remoteObjectInfo.classDoc

    return (
        <Stack sx={{ flexGrow : 1, display : 'flex' }}> 
                <Typography sx={{ pt : 2, pb : 5}}>
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



const PostmanFetcher = () => {

    const clientState = React.useContext(ClientContext) as RemoteObjectClientState
    const [postmanDomainPrefix, setDomainPrefix] = useState(clientState.domain)

    const getPostmanCollection = useCallback(async() => {
        const response = await asyncRequest({
                url: `/resources/postman-collection?domain_prefix=${postmanDomainPrefix}`,
                method : 'GET',
                baseURL : clientState.baseURL,
                // httpsAgent: new https.Agent({ rejectUnauthorized: false })
        }) as AxiosResponse
        if(response.status >= 200 && response.status <= 250) {
            let blob = new Blob([JSON.stringify(response.data, null, 4)], {
                type : 'application/json'
            })
            const fileUrl = URL.createObjectURL(blob);
            // Create a temporary link element
            const link = document.createElement('a');
            link.href = fileUrl;
            link.setAttribute('download', 'collection.json'); // Specify the desired filename
            document.body.appendChild(link);
            // Simulate a click on the link to start the download
            link.click();
            // Clean up the temporary link element
            document.body.removeChild(link);
        }
        else if(response.data.exception) {
            clientState.setError(response.data.exception.message, response.data.exception.traceback)
            if(clientState.stringifyOutput)
                console.log(JSON.stringify(response, null, 2))
            else 
                console.log(response)
            console.log("could not load remote object information")
        }
        else { 
            console.log(response)
            console.log("could not fetch postman collection")
        }
    }, [postmanDomainPrefix, clientState.baseURL])

    return (
        <Stack direction='row' sx = {{ display : 'flex' }}>
            <TextField
                size='small'
                sx={{ pr: 2, flexGrow : 0.75 }}
                label="HTTP server domain prefix"
                value={postmanDomainPrefix}
                onChange={(event) => setDomainPrefix(event.target.value)}
            />
            <Button 
                size="small"
                variant="outlined" 
                endIcon={<DownloadTwoToneIcon/>} 
                onClick={getPostmanCollection}
            >
                Postman Collection
            </Button>
        </Stack>
    )
}


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
//                 baseURL : clientState.domain,
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



const FileServer = () => {

    const clientState = React.useContext(ClientContext) as RemoteObjectClientState
    const documentationParameters = clientState.remoteObjectInfo.documentationParameters 
    const [fileSource, setFileSource] = useState<fileSourceType | null>(null)

    const handleFileSourceChange = useCallback((_ : React.SyntheticEvent, src : any) => {
        setFileSource(src as fileSourceType)
    }, [])

    const openFileSource = useCallback(() => {
        if(!fileSource)
            return 
        let parts = fileSource.param.fullpath.split('/')
        let postfix = parts[parts.length-1]
        let prefix = parts.slice(0, parts.length-1).join('/')
        window.open(clientState.domain + prefix + '/files/'  + postfix + '/' + fileSource.value)
    }, [fileSource])
    
    return (
        <>
            {documentationParameters? 
                <Stack direction='row' sx = {{ display : 'flex', pt : 3 }}>
                    <Autocomplete
                        id="remote-object-documentation-file-server-listed-files"
                        disablePortal
                        autoComplete    
                        size="small"
                        onChange={handleFileSourceChange}
                        value={fileSource}
                        options={[].concat(...documentationParameters.map(
                            (param : PropertyInformation) => {
                                return param.default.map((value : string) => {
                                    return {
                                        param : param, 
                                        paramName : param.name,
                                        value : value
                                    }
                                })
                            }))}
                    groupBy={(option) => option.paramName}
                    getOptionLabel={(option) => option.value}
                    sx={{ flexGrow : 0.25, display: 'flex'}}
                    renderInput={(params) => 
                        <TextField
                            {...params}
                            size='small'
                            label="Files"
                        />
                    }
                />
                <ButtonGroup sx={{pl : 2}}>
                    {/* <IconButton
                        sx = {{ borderRadius : 0 }}
                        onClick={() => downloadFile(fileSource)} 
                        >
                        <DownloadTwoToneIcon />
                    </IconButton> */}
                    <IconButton 
                        id="remote-object-load-using-locator"
                        onClick={openFileSource}
                        sx = {{ borderRadius : 0 }}
                    >
                        <OpenInNewTwoToneIcon /> 
                    </IconButton>
                </ButtonGroup>
            </Stack> : null
        }
        </>
    )
}