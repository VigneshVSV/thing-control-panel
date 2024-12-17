import axios, { AxiosRequestConfig } from 'axios';

export function groupElementsByN(arr : Array<any>, chunkSize : number | null) {
    let result = [];
    if(!chunkSize)
        result.push(arr)
    else {
        let i = 0;
        while (i < arr.length) {
            let chunk = arr.slice(i, i + chunkSize);
            result.push(chunk);
            i += chunkSize;
        }
    }   
    return result;
}


export function updateObjectFromString(path : string, value : any, obj : any) {
    let parts = path.split("."), part
    let last = parts.pop() as string
    while(part = parts.shift()) {
        if(typeof obj[part] !== "object") 
            obj[part] = {}
        obj = obj[part]; 
    }
    obj[last] = value;
}


export function stringToObject(path : string, value : any, obj : any) {
    let originalObject = obj 
    updateObjectFromString(path, value, obj)
    return originalObject
}

export function getAuthority(value : string) : string {
    let protocol = value.split('//')[0]
    let domain = value.split('/')[2]
    return protocol+'//'+domain
}


export const downloadJSON = (response : any, filename : string) => {
    let blob = new Blob([JSON.stringify(response, null, 4)], {
        type : 'application/json'
    })
    const fileUrl = URL.createObjectURL(blob);
    // Create a temporary link element
    const link = document.createElement('a');
    link.href = fileUrl;
    link.setAttribute('download', filename); // Specify the desired filename
    document.body.appendChild(link);
    // Simulate a click on the link to start the download
    link.click();
    // Clean up the temporary link element
    document.body.removeChild(link);
}


export const openJSONinNewTab = (obj_ : any, title : string) => {
    let tab = window.open( "data:text/json," + encodeURIComponent(obj_), '_blank') as Window
    tab.document.open();
    tab.document.write('<html><body><pre>' + JSON.stringify(obj_, null, 4) + '</pre></body></html>');
    tab.document.title = title 
    tab.document.close();
    // tab.focus(); // to finish loading the page
}


function getNumberStringWithWidth(num: Number, width: number) {
    let str = num.toString()
    if (width > str.length) return '0'.repeat(width - str.length) + str
    return str.substring(0, width)
}

export function getFormattedTimestamp() {
    const date = new Date()
    const h   = getNumberStringWithWidth(date.getHours(), 2)
    const min = getNumberStringWithWidth(date.getMinutes(), 2)
    const sec = getNumberStringWithWidth(date.getSeconds(), 2)
    const ms  = getNumberStringWithWidth(date.getMilliseconds(), 3)
    return `${h}:${min}:${sec}.${ms}`
}


export async function asyncRequest(AxiosObject : AxiosRequestConfig) {          
    const response = await axios(AxiosObject).then(
        (response) => {
            if(AxiosObject.responseType !== 'blob')
                response.status = response.data.responseStatusCode
            return response
        }
    ).catch((error) => {
        return {error : error}
    })
    return response
}


export const parseWithInterpretation = (value : any, interpretation : string) => {
    let jsonValue
    try {
        jsonValue = JSON.parse(value)
    } catch(error) {
        jsonValue = value
    }

    // console.log(interpretation, jsonValue)
    switch(interpretation.toLowerCase()) {
        case 'integer' : return Number(jsonValue) 
        case 'number': return Number(jsonValue)
        case 'bool' : 
        case 'boolean' : {
            if (typeof jsonValue === 'string')
                return jsonValue.toLowerCase() === 'true'
            else if (typeof jsonValue === 'number')   
                return Boolean(Number(jsonValue))
            throw new Error('Invalid value for boolean')
        }
        default : return jsonValue // String, Bytes, IPAddress, 
        // object & array?
    }

    // chat-GPT output - cross check next time
    // function castValue(value, schemaType) {
    //     switch (schemaType) {
    //         case 'string':
    //             return String(value);
    //         case 'number':
    //             return Number(value);
    //         case 'integer':
    //             return parseInt(value, 10);
    //         case 'boolean':
    //             return value === 'true' || value === true;
    //         case 'array':
    //             return Array.isArray(value) ? value : [value];
    //         case 'object':
    //             try {
    //                 return typeof value === 'object' ? value : JSON.parse(value);
    //             } catch {
    //                 throw new Error("Invalid object format");
    //             }
    //         default:
    //             throw new Error(`Unsupported type: ${schemaType}`);
    //     }
    // }
    
}



export const parseActionPayloadWithInterpretation = (value : any, schema : any) => {
    if(schema.type === 'object' && schema.properties && Object.keys(schema.properties).length === 1) {
        let obj = {}
        obj[Object.keys(schema.properties)[0]] = parseWithInterpretation(value, 
                                    schema.properties[Object.keys(schema.properties)[0]].type)      
        return obj
    }
    else 
        console.log("use code editor to supply input for this action")
}