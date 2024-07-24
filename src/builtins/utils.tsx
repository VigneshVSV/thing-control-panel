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