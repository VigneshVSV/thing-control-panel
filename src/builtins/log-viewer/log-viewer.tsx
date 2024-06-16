// Internal & 3rd party functional libraries
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
// Custom functional libraries
// Internal & 3rd party component libraries
import { Box, Button, ButtonGroup, IconButton, Stack, Typography } from "@mui/material"
import PushPinTwoToneIcon from '@mui/icons-material/PushPinTwoTone';
import OpenInNewTwoToneIcon from '@mui/icons-material/OpenInNewTwoTone';
import { AgGridReact } from '@ag-grid-community/react';
import { ObjectInspector } from "react-inspector";
// import { ModuleRegistry } from '@ag-grid-community/core';
// import { ClientSideRowModelModule } from '@ag-grid-community/client-side-row-model';    
import '@ag-grid-community/styles/ag-grid.css';
import '@ag-grid-community/styles/ag-theme-alpine.css';
import '@ag-grid-community/styles/ag-theme-material.css'
import './styles.css'
// Custom component libraries 


// ModuleRegistry.registerModules([ ClientSideRowModelModule ]);



export const SampleRowData = [
    {
        id : 1,
        timestamp : "20:11",
        level : "DEBUG",
        message : "This is a debug message"
    },
    {
        id : 2,
        timestamp : "20:18",
        level : "DEBUG",
        message : "This is another debug message 1"
    },
    {
        id : 3,
        timestamp : "20:19",
        level : "DEBUG",
        message : "This is a yet another somewhat unnecessarily made long debug message with garbage - lkajsdhflksjadhfljksadhjfkl hjklsfhkjlsahfjklhsdjklfhjklsafjklhflj kljahsdlfkjhsadlkjfh lkjsdh ljklsdhafjklhsadlkfhsdajklfhjklas lk sdjfklhasljkhflsadh "
    },
    {
        id : 4,
        timestamp : "20:12",
        level : "INFO",
        message : "This is a info message"
    },
    {
        id : 5,
        timestamp : "20:15",
        level : "INFO",
        message : "This is another info message 1"
    },
    {
        id : 6,
        timestamp : "20:16",
        level : "INFO",
        message : "This is a yet another somewhat unnecessarily made info debug message with garbage - lkajsdhflksjadhfljksadhjfkl hjklsfhkjlsahfjklhsdjklfhjklsafjklhflj kljahsdlfkjhsadlkjfh lkjsdh ljklsdhafjklhsadlkfhsdajklfhjklas lk sdjfklhasljkhflsadh "
    },
    {
        id : 7,
        timestamp : "20:13",
        level : "ERROR",
        message : "This is a debug message"
    },
    {
        id : 8,
        timestamp : "20:14",
        level : "ERROR",
        message : "This is another debug message 1"
    },
    {
        id : 9,
        timestamp : "20:17",
        level : "ERROR",
        message : "This message fillls the space -klajsdfkjlashfjkl aksdjhfkjlshdfjklh lks slkdjfhkasldhfkjlsadf lkasdjhfklsdahfkljsh skdljfhjksaldhfjkl alskdjhfkljasdhflkjsh klasdhfasdhkljfhjkasdhl sadkljfhskldhfjl  lkajsdhflksjadhfljksadhjfkl hjklsfhkjlsahfjklhsdjklfhjklsafjklhflj kljahsdlfkjhsadlkjfh lkjsdh ljklsdhafjklhsadlkfhsdajklfhjklas lk sdjfklhasljkhflsadh "
    }
]



export const PinnableCell = (props : any) => {

    const buttonClicked = () => {
        // console.log("------")
        // console.log("existing pinned row", props.api.pinnedRowModel.pinnedTopRows)
        let currentData = props.api.pinnedRowModel.pinnedTopRows.length > 0 ? props.api.pinnedRowModel.pinnedTopRows.map((data : any) =>  data.data) : []
        // console.log(currentData)
        if(currentData.includes(props.data)) {
            // console.log("deleting", props.data)
            currentData.remove(props.data)
        }
        else {
            // console.log("inserting", props.data)
            currentData.push(props.data)
        }
        props.api.setPinnedTopRowData(currentData)
        // console.log("new data", currentData)
        // console.log("new pinned row", props.api.pinnedRowModel.pinnedTopRows)
        // console.log("------")
    }

    return (
        <span>
            <ButtonGroup>
                <IconButton 
                    onClick={buttonClicked} 
                    sx={{ borderRadius : 0, flexGrow : 1, display : 'flex' }}
                    >
                    <PushPinTwoToneIcon></PushPinTwoToneIcon>
                </IconButton>
                <IconButton 
                    // onClick={buttonClicked} 
                    sx={{ borderRadius : 0, flexGrow : 1, display : 'flex' }}
                >
                    <OpenInNewTwoToneIcon />
                </IconButton>
            </ButtonGroup>
        </span>
    );
}

export const ROTimestampCell = (props : any) => {

    const cellValue : string = props.valueFormatted ? props.valueFormatted : props.value
    return (
        <Typography 
            fontSize={props.column.colDef.cellStyle.fontSize} 
            fontFamily="monospace" 
            variant="overline"
        >
            {cellValue.split('T')[1]}
        </Typography>
    )
}

export const WebGUITimestampCell = (props : any) => {

    const cellValue : string = props.valueFormatted ? props.valueFormatted : props.value
    return (
        <Typography 
            fontSize={props.column.colDef.cellStyle.fontSize} 
            fontFamily="monospace" 
            variant="overline"
        >
            {cellValue}
        </Typography>
    )
}

const logColorLevels = {
    'DEBUG' : 'blue',
    'INFO' : null, 
    'WARN' : 'yellow',
    'ERROR' : 'red',
    'FAULT' : 'red'
}

export const ColoredLevel = (props : any) => {

    const cellValue = props.valueFormatted ? props.valueFormatted : props.value
    
    return (
        <Typography 
            fontFamily="monospace" 
            variant="overline"
            fontSize={props.column.colDef.cellStyle.fontSize} 
            // @ts-ignore
            sx ={{ color : logColorLevels[props.data.level] ? logColorLevels[props.data.level] : "black"}} 
        >
            {cellValue}
        </Typography>
    )
}

export const ColoredBackendMessage = (props : any) => {

    const cellValue = props.valueFormatted ? props.valueFormatted : props.value
    return (
        <Typography 
            fontFamily="monospace" 
            fontSize={props.column.colDef.cellStyle.fontSize} 
            // @ts-ignore
            sx ={{ color : logColorLevels[props.data.level] ? logColorLevels[props.data.level] : "black",
                pt : 0.5, pb : 0.5 }} 
        >
            {cellValue}
        </Typography>
    )
}

export const ColoredFrontendMessage = (props : any) => {

    const cellValue = props.value
    // console.log(cellValue)
    return (
        <Typography 
            fontFamily="monospace" 
            fontSize={props.column.colDef.cellStyle.fontSize} 
            // @ts-ignore
            sx ={{ color : logColorLevels[props.data.level] ? logColorLevels[props.data.level] : "black",
                pt : 0.5, pb : 0.5 }} 
            component='div'
        >
            {cellValue.str}
            {cellValue.obj? <ObjectInspector data={cellValue.obj} /> : null}
        </Typography>
    )
}


export type LogDataType = {
    id : number
    level : string 
    message : any
    timestamp : string 
}

type LogTableProps = {
    minHeight? : string
    fontSize? : string
    rowData? : LogDataType[] | null | undefined
    fromServerResponse? : { [key : string] : LogDataType[] | null | undefined | any }
    boundary? : boolean 
    docked? : boolean
    columnDefs : any
}

export const LogTable = (props : LogTableProps) => {

    const [rowData, setRowData] = useState<LogDataType[] | undefined | null>(props.rowData) 
    
    useEffect(() => {
        // console.log("trying to update rows", props.fromServerResponse)
        let _rowData 
        if(props.rowData) {
            _rowData = props.rowData
            // console.log("updating data from rowData prop", props.rowData)
        }
        else if(props.fromServerResponse && props.fromServerResponse.data.logs) {
            _rowData = props.fromServerResponse.data.logs
            // console.log("updating data from fromServerResponse prop", props.fromServerResponse.data.logs)
        }
        else {
            _rowData = undefined
            // console.log("clearing table")
        }
        if(_rowData){
            for(let i=0; i<_rowData.length; i++) 
                _rowData[i].id = i 
        }
        setRowData(_rowData)
        console.log("new row data", _rowData)
    }, [props.rowData, props.fromServerResponse])

    const gridRef = useRef<any>()
    const sizeToFit = useCallback(() => {
        // @ts-ignore
        gridRef.current.api.sizeColumnsToFit({
            defaultMinWidth: 100,
            columnLimits: [{ key: 'message', minWidth: "100%" }],
        })
    }, [])

    
    return (
        <>
            {rowData? 
                <Stack sx={{ flexGrow : 1, display : 'flex', minHeight : props.minHeight? props.minHeight : "500px" }}>
                    <Button onClick={sizeToFit} variant="outlined" sx={{ maxWidth : 250 }}>
                        Resize Columns to Fit
                    </Button>
                    <Box
                        className="ag-theme-material"
                        style={{ width: '100%', height: '100%' }}
                        sx={{ pt : 2 }}
                    >
                        <AgGridReact
                            // @ts-ignore 
                            ref={gridRef}
                            onGridReady={sizeToFit}
                            // @ts-ignore 
                            columnDefs={props.columnDefs}
                            rowData={rowData}
                            getRowId={(params) => {console.log("id", String(params.data.id)); return String(params.data.id)}}
                            enableCellTextSelection={true}
                            rowSelection="multiple"
                        />
                    </Box>
                </Stack> : null
            }
        </>
    )
}



export const useRemoteObjectLogColumns = (fontSize : string = "16px") => {

    const columnDefs = useMemo(() => [
        { 
            colId : 'timestamp', headerName : 'TIMESTAMP', field : 'timestamp', initialWidth : 200, maxWidth : 300,
            suppressSizeToFit : true, cellRenderer : ROTimestampCell, 
            cellStyle : { fontSize : fontSize },
            resizable : true, filter : true, floatingFilter: true, sortable : true
        },
        { 
            colId : 'level', headerName : 'LEVEL', field : 'level', initialWidth : 135, maxWidth : 250, 
            suppressSizeToFit : true, cellRenderer : ColoredLevel,
            cellStyle : { fontSize : fontSize },
            resizable : true, filter : true, floatingFilter: true, sortable : true 
        }, 
        { 
            colId : 'message', headerName : 'MESSAGE', field : 'message', wrapText : true, autoHeight : true, 
            cellRenderer : ColoredBackendMessage,
            cellStyle : { fontSize : fontSize },
            resizable : true, filter : true, floatingFilter: true, sortable : true
        },
        { 
            colId : 'action-buttons' , headerName: 'ACTIONS', maxWidth: 100,  cellRenderer: PinnableCell
        }
    ], [fontSize])

    return columnDefs
}


export function useRendererLogColumns(fontSize : string = "16px") {

    const columnDefs = useMemo(() => [
        { 
            colId : 'timestamp', headerName : 'TIMESTAMP', field : 'timestamp', initialWidth : 175, maxWidth : 300,
            suppressSizeToFit : true, cellRenderer : WebGUITimestampCell, 
            cellStyle : { fontSize : fontSize },
            resizable : true, filter : true, floatingFilter: true, sortable : true
        },
        { 
            colId : 'level', headerName : 'LEVEL', field : 'level', initialWidth : 135, maxWidth : 250, 
            suppressSizeToFit : true, cellRenderer : ColoredLevel,
            cellStyle : { fontSize : fontSize },
            resizable : true, filter : true, floatingFilter: true, sortable : true 
        },
        { 
            colId : 'componentID', headerName : 'COMPONENT ID', field : 'componentID', wrapText : true, autoHeight : true, 
            cellStyle : { fontSize : fontSize }, initialWidth : 300, maxWidth : 450,
            resizable : true, filter : true, floatingFilter: true, sortable : true
        }, 
        { 
            colId : 'componentType', headerName : 'COMPONENT TYPE', field : 'componentType', wrapText : true, autoHeight : true, 
            cellStyle : { fontSize : fontSize }, initialWidth : 100, maxWidth : 300,
            resizable : true, filter : true, floatingFilter: true, sortable : true
        }, 
        { 
            colId : 'message', headerName : 'MESSAGE', field : 'message', wrapText : true, autoHeight : true, 
            cellRenderer : ColoredFrontendMessage,
            cellStyle : { fontSize : fontSize },
            resizable : true, filter : true, floatingFilter: true, sortable : true
        }
    ], [fontSize])

    return columnDefs
}