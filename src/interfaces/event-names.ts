export type EventNames = EventNamesMouse | EventNamesNode | EventNamesConnection | EventNamesZoom | EventNamesTranslate | EventNamesKeyboard | EventNamesLog | EventNamesComponent | EventNamesContextMenu | EventNamesGeneric | EventNamesControl | EventNamesSocket
export type EventNamesMouse = 'mousemove' | 'click'
export type EventNamesNode = 'nodecreate' | 'nodecreated' | 'noderemove' | 'noderemoved' | 'nodeselect' | 'nodeselected' | 'nodedraged' | 'rendernode' | 'selectnode' | 'translatenode' | 'nodetranslate' | 'nodetranslated'
export type EventNamesControl = 'rendercontrol'
export type EventNamesSocket = 'rendersocket'
export type EventNamesConnection = 'renderconnection' | 'connectioncreate' | 'connectioncreated' | 'connectionremove'| 'connectionremoved' | 'updateconnection' | 'connectionpath'
export type EventNamesZoom = 'zoomed' | 'zoom'
export type EventNamesTranslate = 'translated' | 'translate'
export type EventNamesKeyboard = 'keydown' | 'keyup'
export type EventNamesLog = 'warn' | 'error'
export type EventNamesComponent = 'componentregister'
export type EventNamesContextMenu = 'contextmenu'
export type EventNamesGeneric = 'export' | 'import'