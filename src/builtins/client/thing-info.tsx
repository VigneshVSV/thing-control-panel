// Internal & 3rd party functional libraries
// Custom functional libraries
// Internal & 3rd party component libraries
// Custom component libraries 

// This file mostly follows python naming conventions - PEP8 - because this information is loaded from 
// python side


export type RemoteObjectInfo = {
    id : string
    description : string
    properties : { [key : string] : any }
    actions : { [key : string] : any }
    events : { [key : string] : any }
    inheritance : string[]
}



export class ResourceInformation {

    title! : string
    description! : string
    // our own
    name! : string
    type! : string

    constructor(data : Partial<ResourceInformation>) {
        this.updateFromJSON(data);
    }

    get doc() : string {
        if(this.description)
            return this.description.replace('\n', ' ').replace(/\s+/g, " ").trim()
        return "No Docstring Available"    
    }

    get state() : string {
        if(!this.state) 
            return "any state"
        let state = ''
        for (let st of this.state)
            state = state? state + ', ' + st : st 
        return state // .substring(state.length - 2)
    }

    updateFromJSON(json : { [key : string] : any }) : void {
        // Iterate over the keys of the JSON object
        for (let key in json) {
            // Check if the class has a property with the same name
            if (this.hasOwnProperty(key)) {
                // @ts-ignore
                this[key] = json[key];
            }
        }
    }
}



export class PropertyInformation extends ResourceInformation {

    constant! : boolean
    observable! : boolean
    readOnly! : boolean
    default : any
    // following are owr own
    allow_None! : boolean
    class_member! : boolean
    db_commit! : boolean
    db_init! : boolean
    db_persist! : boolean
    deepcopy_default! : boolean
    per_instance_descriptor! : boolean
    metadata : any
   
    // property's own attributes for which chips should be shown
    chipKeys : string[] = ['allow_None' , 'class_member', 'constant', 'db_commit', 
    'db_init', 'db_persist', 'deepcopy_default', 'per_instance_descriptor', 'readOnly',
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
        if(this.readOnly)
            return 'RAW'  // check readonly always first
        else if(this.JSONInputParameterTypes.includes(this.type)) 
            return 'JSON'
        return 'RAW'
    }
}



export class ActionInformation extends ResourceInformation {
    kwdefaults : any
    defaults : any
    signature? : Array<string> 
}

export class EventInformation extends ResourceInformation {}



export class ThingInformation  {
    id : string
    description : string
    properties : PropertyInformation[] 
    actions : ActionInformation[]
    events : EventInformation[]
    inheritance : string[]
      
    constructor(info : RemoteObjectInfo) {
        this.properties = []
        this.actions = []
        this.events = []
        for (let key of Object.keys(info.properties)) 
            this.properties.push(new PropertyInformation(info.properties[key as string]))
        for (let key of Object.keys(info.actions))
            this.actions.push(new ActionInformation(info.actions[key]))
        for (let key of Object.keys(info.events))
            this.events.push(new EventInformation(info.events[key]))
        this.inheritance = info.inheritance
        this.description = info.description
        this.id = info.id
    }
}