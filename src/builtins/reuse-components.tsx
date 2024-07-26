// Internal & 3rd party functional libraries
import { useState, useCallback } from "react";
// Custom functional libraries
// Internal & 3rd party component libraries
import NewWindow from "react-new-window";
import { Backdrop, Box, CircularProgress, IconButton, Stack, Typography } from "@mui/material"
import ArrowBackTwoToneIcon from '@mui/icons-material/ArrowBackTwoTone';
// Custom component libraries 
import { styled } from '@mui/system';
import {TablePagination, tablePaginationClasses as classes } from '@mui/base/TablePagination';
import React from "react";


type TabPanelProps = {
    tree : string
    index: number;
    value: number;
    children?: React.ReactNode;
}

export const TabPanel = (props: TabPanelProps) => {
    const { tree, index, value, children, ...other } = props;
  
    return (
        <div
            id={`${tree}-tabpanel-${index}`}
            key={`${tree}-tabpanel-${index}`}
            role="tabpanel"
            hidden ={value !== index}
            {...other}
            style={{
                "width" : "100%",
                "height" : "100%"
            }}      
        >
            {value === index && (
                <Box sx={{ flexGrow: 1, display: 'flex', height : '100%' }}>
                    {children}
                </Box>
            )}
        </div>
    );
}



type ErrorViewerProps = {
    errorMessage : string | undefined | null
    errorTraceback? : string[] | null | undefined
    fontSize? : number
}

export const ErrorViewer = (props : ErrorViewerProps) => {

    return (
        <>
            {props.errorMessage ? 
                <Stack>
                    <Stack direction="row">
                        <Typography
                            id='error-title'
                            style={{ whiteSpace: 'pre' }} 
                            sx={{ pt : 1 }}
                            variant="caption" 
                            color="error" 
                            fontSize={props.fontSize? props.fontSize : 18}
                        >
                            {"ERROR : "} 
                        </Typography>
                        <Typography 
                            id='error-main-message'                         
                            sx={{ pt : 1 }} 
                            color="error" 
                            fontSize={props.fontSize? props.fontSize : 18} 
                            variant="caption"
                        >
                            {props.errorMessage}
                        </Typography>
                    </Stack>
                    {props.errorTraceback? props.errorTraceback.map((line : string, index : number) => 
                        {
                            if(index === 0) 
                                return <Typography 
                                            id='error-traceback-title'
                                            key='error-traceback-title'
                                            fontSize={props.fontSize? props.fontSize - 2 : 14} 
                                            style={{whiteSpace: 'pre'}} 
                                            variant="caption" 
                                            fontWeight={500}
                                            fontFamily="monospace"
                                        >
                                            {line}
                                        </Typography>       
                            else 
                                return <Typography 
                                            id='error-traceback-line'
                                            key={'error-traceback-title'+index.toString()}
                                            fontSize={props.fontSize? props.fontSize - 2 : 14} 
                                            style={{
                                                whiteSpace: 'pre', 
                                                }} 
                                            variant="caption"
                                            fontFamily="monospace"
                                        >
                                            {line}
                                        </Typography>
                        }) : 
                        null
                    }
                </Stack>
             
                : null 
            }
        </>
    )
}



type ErrorBackdropProps =  { 
    message : string, 
    goBack : any 
    subMessage? : string 
}

export const ErrorBackdrop = ({ message, subMessage, goBack } : ErrorBackdropProps) => {
    // https://mui.com/material-ui/react-backdrop/#system-SimpleBackdrop.js
    const [open, setOpen] = useState(true);
    const handleClose = useCallback(() => {
      setOpen(false);
    }, [])
  
    return (
        <Backdrop
            open={open}
            onClick={handleClose}
        >
            <Stack>
                <Typography color="inherit" variant="button">
                    {message}
                </Typography>
                {subMessage? 
                    <Typography color="inherit" variant="caption">
                        {subMessage}
                    </Typography> : null}
                <Box alignSelf={"center"}>
                    <IconButton size="large" onClick={goBack}>
                        <ArrowBackTwoToneIcon fontSize="large" />
                    </IconButton>
                </Box>
            </Stack>
        </Backdrop>
      
    );
}



export const LoadingBackdrop = ({ message, goBack } : ErrorBackdropProps) => {
    // https://mui.com/material-ui/react-backdrop/#system-SimpleBackdrop.js
    const [open, setOpen] = useState(true);
    const handleClose = useCallback(() => {
      setOpen(false);
    }, [])
  
    return (
        <Backdrop
            open={open}
            onClick={handleClose}
        >
            <Stack>
                <Stack direction="row">
                    <Typography color="inherit" variant="button" sx={{ pr : 5, pt : 1 }}>
                        {message}
                    </Typography>
                    <CircularProgress />
                </Stack> 
                <Box alignSelf={"center"}>   
                        <IconButton size="large" onClick={goBack}>
                            <ArrowBackTwoToneIcon fontSize="large" />
                        </IconButton>
                </Box>
            </Stack>
        </Backdrop>
      
    );
}



export const RenderInWindow = (props : any) => {
    // src: https://stackoverflow.com/questions/47574490/open-a-component-in-new-window-on-a-click-in-react
    // you may also check: https://github.com/rmariuzzo/react-new-window/blob/main/src/NewWindow.js
    // for stylesheet copy see: https://github.com/JakeGinnivan/react-popout/issues/15
    // https://stackoverflow.com/questions/63925086/styled-components-dynamic-css-is-not-generated-in-a-new-window
    // answer 3 did not work
    const [showPopout, setShowPopout] = useState(true)
    const [newWindowNode, setNewWindowNode] = useState(null)
  
    const nwRef = useCallback((node : any) => setNewWindowNode(node), [])
  
    return (
        <>
        {showPopout ? (
                // <StyleSheetManager 
                //     //@ts-ignore
                //     target={newWindowNode}>
                    <NewWindow
                        title="Title"
                        // features={{width: '960px', height: '600px'}}
                        onUnload={() => setShowPopout(false)}
                    >
                        <div ref={nwRef}>
                            {props.children}
                        </div>
                    </NewWindow>
                // </StyleSheetManager>
            ) : null}
        </>
    )
}



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





