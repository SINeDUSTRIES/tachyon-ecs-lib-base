/**
 * Wraps a Component and its data in tachyon.
 * 
 * Used when communicating between sockets.
 */
export interface IComponentWrapper
{
    /**
     * Unique identifier that the client uses to identify this type.
     * 
     * ie, the fully qualified name of the type.
     */
    TypeHandle : string

    /**
     * Data in the Component on clients.
     * Clients should set this to their instance of the Component
     */
    Component : any
}