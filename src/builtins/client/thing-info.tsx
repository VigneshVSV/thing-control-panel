// Internal & 3rd party functional libraries
// Custom functional libraries
// Internal & 3rd party component libraries
// Custom component libraries 

// This file mostly follows python naming conventions - PEP8 - because this information is loaded from 
// python side


export type ScadaInfo = {
    URL_path : string
    http_method : string[] | string
    state : string[]
    obj_name : string
    iscoroutine : boolean 
    isproperty : boolean
    isaction : boolean
    http_request_as_argument : boolean 
}

export type PropertyInfo = {
    name : string,
    allow_None : boolean,
    constant : boolean,
    readonly : boolean,
    doc : string,
    label : string,
    default : any,
    class_member : boolean,
    observable : boolean,
    db_commit : boolean,
    db_init : boolean,
    db_persist : boolean,
    deepcopy_default : boolean,
    per_instance_descriptor : boolean,
    metadata : any,
    type : string
    owner : string
    owner_instance_name : string
    remote_info: ScadaInfo
    instruction : string 
}

export type ActionInfo = {
    name : string
    qualname : string
    module : string
    doc : string
    defaults : any
    kwdefaults : any
    signature : Array<string> 
    owner : string
    owner_instance_name : string
    remote_info : ScadaInfo
    instruction : string
}

export type EventInfo = {
    name : string 
    address : string 
    owner : string 
    owner_instance_name : string 
    instruction : string 
}


export type RemoteObjectInfo = {
    instance_name : string 
    properties : PropertyInformation[] 
    methods : ActionInformation[]
    events : EventInformation[]
    classdoc : string[] | null
    inheritance : string[]
}



export class ResourceInformation {

    _doc : string
    remote_info: ScadaInfo
    name : string
    owner : string
    owner_instance_name : string
    type : string
    label : string

    constructor(data : any) {
        this._doc = data.doc 
        this.remote_info = data.remote_info
        this.name = data.name 
        this.owner = data.owner
        this.owner_instance_name = data.owner_instance_name
        this.type = data.type
        this.label = data.label ? data.label : ''
    }

    get doc() : string {
        if(this._doc)
            return this._doc.replace('\n', ' ').replace(/\s+/g, " ").trim()
        return "No Docstring Available"    
    }

    get state() : string {
        if(!this.remote_info.state) 
            return "any state"
        let state = ''
        for (let st of this.remote_info.state)
            state = state? state + ', ' + st : st 
        return state // .substring(state.length - 2)
    }
}



export class PropertyInformation extends ResourceInformation {

    allow_None : boolean
    constant : boolean
    readonly : boolean
    class_member : boolean
    observable : boolean
    db_commit : boolean
    db_init : boolean
    db_persist : boolean
    deepcopy_default : boolean
    per_instance_descriptor : boolean
    default : any
    metadata : any
    fullpath : string 
    _supported_instance_names? : { [key : string] : string }

    constructor(data : PropertyInfo) {
        super(data)
        this.allow_None = data.allow_None // allow_None : boolean
        this.class_member = data.class_member // class_member : boolean
        this.constant = data.constant // constant : boolean
        this.db_commit = data.db_commit // db_commit : boolean
        this.db_init = data.db_init // db_init : boolean
        this.db_persist = data.db_persist //  db_persist : boolean
        this.deepcopy_default = data.deepcopy_default // deepcopy_default : boolean
        this.per_instance_descriptor = data.per_instance_descriptor // per_instance_descriptor : boolean
        this.default = data.default // default : any
        this.metadata = data.metadata //  metadata : any
        this.readonly = data.readonly // readonly : boolean
        this.observable = data.observable // observable : boolean
        this.fullpath = data.instruction //  instruction : string 
    }

    // property's own attributes for which chips should be shown
    chipKeys : string[] = ['allow_None' , 'class_member', 'constant', 'db_commit', 
    'db_init', 'db_persist', 'deepcopy_default', 'per_instance_descriptor', 'readonly',
    'observable']

    chipKeysSensibleString : { [key : string] : string } = {
        'allow_None' : "allows None" , 
        'class_member' : "class variable", 
        'constant' : 'constant', 
        'db_commit' : 'database committed at write',
        'db_init' : 'loaded from database at startup only', 
        'db_persist' : 'database committed at write & loaded at startup', 
        'deepcopy_default' : 'deep-copied default value', 
        'per_instance_descriptor' : 'per instance descriptor',
        'readonly' : 'read-only',
        'observable' : 'observable'
    }

    // types for which JSON input field should be shown instead of raw input field
    JSONInputParameterTypes = ['Property', 'ClassSelector', 'Tuple', 'List', 'TypedList', 
                    'TypedDict', 'Iterable', 'Selector', 'TupleSelector', 'FileSelector', 
                    'MultiFileSelector', 'TypedKeyMappingsDict']

    get chips() : string[] {
        let Chips : string[] = []
        for(var key of Object.keys(this.chipKeysSensibleString)){
            if(this[key as keyof PropertyInformation])
                Chips.push(this.chipKeysSensibleString[key])
        }
        return Chips
    }

    get inputType() : string {
        if(this.readonly)
            return 'RAW'  // check readonly always first
        else if(this.JSONInputParameterTypes.includes(this.type)) 
            return 'JSON'
        return 'RAW'
    }
}



export class ActionInformation extends ResourceInformation {

    module : string
    qualname : string
    kwdefaults : any
    defaults : any
    signature : Array<string> 
    fullpath : string
    _supported_instance_names? : { [key : string] : string }
    
    constructor(data : ActionInfo) {
        super(data)
        // @ts-ignore
        this.name = data.obj_name
        this.module = data.module // module : string
        this.qualname = data.qualname // qualname : string
        this.kwdefaults = data.kwdefaults // kwdefaults : any
        this.defaults = data.defaults // defaults : any
        this.signature = data.signature // signature : Array<string> 
        // instruction : string
        // @ts-ignore
        this.fullpath = data.remote_info.fullpath
    }  
}



export class EventInformation extends ResourceInformation {

    fullpath : string 
    address : string 
    _supported_instance_names? : { [key : string] : string }

    constructor(data : EventInfo) {
        super(data)
        this.fullpath = data.instruction
        this.address = data.address 
    }
}



export class RemoteObjectInformation  {
    instance_name : string 
    properties : PropertyInformation[] 
    methods : ActionInformation[]
    events : EventInformation[]
    classdoc : string[] | null 
    inheritance : string[]
    _updatedGUIStateManager : boolean
    _sortedProperties : { [key : string] : PropertyInformation[] } | null
    _sortedMethods : { [key : string] : ActionInformation[] } | null 
    _sortedEvents : { [key : string] : EventInformation[] } | null 
    

    constructor(info : RemoteObjectInfo) {
        this.instance_name = info.instance_name
        this.properties = info.properties
        this.methods = info.methods 
        this.events = info.events
        this.classdoc = info.classdoc 
        this.inheritance = info.inheritance
        this._updatedGUIStateManager = false
        this._sortedProperties = null 
        this._sortedEvents = null 
        this._sortedMethods = null 
    }

    get classDoc(){
        let doc : any = this.classdoc ? this.classdoc : ''
        return doc 
    }

    get documentationProperties() {
        if(!this._documentationProperties) {
            let dparam = []
            for(let param of this.properties) {
                if(param.type === 'DocumentationFolder' )
                dparam.push(param)
            }
            this._documentationProperties = dparam
        }
        return this._documentationProperties
    }

    get sortedProperties() {
        if (!this._sortedProperties) {
            // console.log("calculating properties")
            let params : { [key : string] : Array<PropertyInformation> } = {
                "Visualization" : [],
                "RemoteObject" : [],
            }
            let existing_names : string[] = []
            for(let param of this.properties) {
                if(param.visualization) 
                    params["Visualization"].push(param)
                else if(param.type === 'FileServer' || param.type === 'DocumentationFolder' )
                    continue
                else {
                    if(!params[param.owner])
                        params[param.owner] = []
                    if(existing_names.includes(param.name)) {
                        for(let added_param of params[param.owner]) {
                            if(added_param.name === param.name) {
                                if(!added_param._supported_instance_names) {
                                    added_param._supported_instance_names = {}
                                    added_param._supported_instance_names[added_param.owner_instance_name] = added_param.fullpath
                                }
                                if(!Object.keys(added_param._supported_instance_names).includes(param.owner_instance_name))
                                    added_param._supported_instance_names[param.owner_instance_name] = param.fullpath
                            }
                        }
                    }
                    else {
                        params[param.owner].push(param) 
                        existing_names.push(param.name)
                    }
                }
            }
            let inheritanceSortedParams : { [key : string] : Array<PropertyInformation> } = {
                "Visualization" : params["Visualization"]
            }
            let addAtEnd : { [key : string] : Array<PropertyInformation> } = {}
            for (let class_ of this.inheritance) {
                if(params[class_]) {
                    if(class_ === 'RemoteObject' || class_ === 'RemoteSubobject' ) 
                        addAtEnd[class_] = params[class_] 
                    else 
                        inheritanceSortedParams[class_] = params[class_] 
                    delete params[class_]
                }
            }
            inheritanceSortedParams= {
                ...inheritanceSortedParams,
                ...params,
                ...addAtEnd
            }
            if (Object.keys(inheritanceSortedParams).length === 1) {
                this._sortedProperties = {
                    "Visualization" : [],
                    "RemoteObject" : []
                }
            }
            else 
                this._sortedProperties = inheritanceSortedParams
            }
        return this._sortedProperties
    }

    get sortedMethods() {
        if (!this._sortedMethods) {
            // console.log("calculating methods")
            let methods : { [key : string] : Array<ActionInformation> } = {
                "Private" : []
            }
            let existing_names : string[] = []
            for(let method of this.methods) {
                if(method.name.startsWith('_')) 
                    methods["Private"].push(method)
                else {
                    let owner = method.qualname.split('.')[0]
                    if(!methods[owner])
                        methods[owner] = []
                    if(existing_names.includes(method.name)) {
                        for(let added_method of methods[owner]) {
                            if(added_method.name === method.name) {
                                if(!added_method._supported_instance_names) {
                                    added_method._supported_instance_names = {}
                                    added_method._supported_instance_names[added_method.owner_instance_name] = added_method.fullpath
                                }
                                if(!Object.keys(added_method._supported_instance_names).includes(method.owner_instance_name))
                                    added_method._supported_instance_names[added_method.owner_instance_name] = method.fullpath
                            }
                        }
                    }
                    else {
                        methods[owner].push(method) 
                        existing_names.push(method.name)
                    }
                }
            }
            let inheritanceSortedMethods : { [key : string] : Array<ActionInformation> } = {}
            let addAtEnd : { [key : string] : ActionInformation[] } = {}
            for (let class_ of this.inheritance) {
                if(methods[class_]) {
                    if(class_ === 'RemoteObject' || class_ === 'RemoteSubobject' ) 
                        addAtEnd[class_] = methods[class_] 
                    else
                        inheritanceSortedMethods[class_] = methods[class_] 
                    delete methods[class_]
                }
            }
            if (Object.keys(inheritanceSortedMethods).length === 0) {
                this._sortedMethods = {
                    "Private" : [],
                    "RemoteObject" : []
                }
            }
            else {
                let privateMethods = methods["Private"] 
                delete methods["Private"] 
                inheritanceSortedMethods = {
                    ...inheritanceSortedMethods,
                    ...methods, 
                    ...addAtEnd
                }
                inheritanceSortedMethods["Private"] = privateMethods
                this._sortedMethods = inheritanceSortedMethods
            }
        }
        return this._sortedMethods
    }

    get sortedEvents() {
        if (!this._sortedEvents) {
            // console.log("calculating events")
            let events : { [key : string] : Array<EventInformation> } = {}
            let existing_names : string[] = []
            for(let event of this.events) {
                if(!events[event.owner])
                    events[event.owner] = []
                if(existing_names.includes(event.name)) {
                    for(let added_event of events[event.owner]) {
                        if(added_event.name === event.name) {
                            if(!added_event._supported_instance_names) {
                                added_event._supported_instance_names = {}
                                added_event._supported_instance_names[added_event.owner_instance_name] = added_event.fullpath
                            }
                            if(!Object.keys(added_event._supported_instance_names).includes(event.owner_instance_name))
                                added_event._supported_instance_names[added_event.owner_instance_name] = event.fullpath
                        }
                    }
                }
                else {
                    events[event.owner].push(event)
                    existing_names.push(event.name) 
                }
            }
            this._sortedEvents = events
        }
        return this._sortedEvents
    }


    get hasGUI () {
        if(!this._GUI)
            return this._GUI // return undefined/null as it is which can used for rendering conditions
        else if (!this._updatedGUIStateManager) {
            // visualizationStateManager.deleteComponents()
            // visualizationStateManager.updateActions(this._GUI.actions)
            // visualizationStateManager.updateActions(this._GUI.UIComponents)
            throw new Error('incomplete logic')
            this._updatedGUIStateManager = true
        }
        return true 
    }

    get logEventsURL () : string | null {
        try {
            for(let event of this.sortedEvents["RemoteAccessHandler"]) {
                if(event.name === 'log-events')
                    return event.fullpath
            }
        } catch(error : any) {
            console.log(error)
            return ''
        }
        return ''
    }

    get logEventsPusherURL () {
        try{
            for(let method of this.sortedMethods["RemoteAccessHandler"]) {
                if(method.name === 'push_events')
                    return method.fullpath
            }
        } catch(error : any) {
            console.log(error)
            return ''
        }
        return ''
    }

    get logEventsStopURL () {
        try{
            for(let method of this.sortedMethods["RemoteAccessHandler"]) {
                if(method.name === 'stop_events')
                    return method.fullpath
            }
        } catch(error : any) {
            console.log(error)
            return ''
        }
        return ''
    }
}