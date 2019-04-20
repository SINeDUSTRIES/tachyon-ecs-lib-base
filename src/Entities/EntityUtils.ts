import { IEntity, IComponents, IViewComponent, ISocketComponent, IEntityViewed, IEntityViewedSocket } from "tachyon-ecs";
import { EntityViewed, EntityViewedSocket, ComponentTypeHandles } from "..";

/**
 * Check if an entity has a component.
 * 
 * @param thisEntity entity to check if has component
 * @param typeHandle TypeHandle of the component to get
 */
export function EntityComponentHas (thisEntity: IEntity, typeHandle: string): boolean 
{
  return thisEntity.Components.has(typeHandle);
}

/**
 * Get a component attached to a IEntity.
 * 
 * @param thisEntity entity to get component from
 * @param typeHandle TypeHandle of the component to get
 * 
 * @returns The component, or undefined if did not have that component.
 */
export function EntityComponentGet<T> (thisEntity: IEntity, typeHandle: string): T | undefined
{
  let component = thisEntity.Components[typeHandle];
  if (component !== undefined) // got component
  {
    return <T>component;
  }
  else
  {
    return undefined;
  }
}

/**
 * Add a component to an IEntity.
 * Specifically, adds a property to IEntity.Components, where key=$typeHandle and value=component.
 * 
 * @throws if already has one with matching typeHandle.
 */
export function EntityComponentAdd (thisEntity: IEntity, typeHandle: string, component: any): void 
{
  if (thisEntity.Components.hasOwnProperty(typeHandle))
  {
    throw Error(`Already has Component with TypeHandle '${typeHandle}'`);
  }

  thisEntity.Components[typeHandle] = component;
}

/**
 * Get a component attached to an entity.
 * 
 * @param thisEntity entity to get component from
 * @param typeHandle TypeHandle of the component to get
 * 
 * @returns The component, or undefined if did not have that component.
 */
export function EntityComponentGetElseThrow<T> (thisEntity: IEntity, typeHandle: string): T
{
  let component: T | undefined = EntityComponentGet<T>(thisEntity, typeHandle);

  if (component !== undefined) // got component
  {
    return component;
  }
  else
  {
    throw new Error(`Missing Component with TypeHandle '${typeHandle}'`);
  }
}

/**
 * Create a new IEntityViewed using IEntity.Components object.
 * 
 * @param components - NOT cloned.
 * 
 * @returns - new IEntityViewed.
 */
export function NewEntityViewed (viewComponent: IViewComponent, components: IComponents = {}): IEntityViewed
{
  let entityViewed = new EntityViewed();

  entityViewed.Components = components;

  // add ViewComponent
  EntityComponentAdd(
    entityViewed,
    ComponentTypeHandles.ViewComponent,
    viewComponent
  );

  return entityViewed;
}

/**
 * Create a new IEntityViewedSocket using IEntity.Components object.
 * 
 * @param components - NOT cloned.
 * 
 * @returns - new IEntityViewedSocket.
 */
export function NewEntityViewedSocket (viewComponent: IViewComponent, socketComponent: ISocketComponent, components: IComponents = {}): IEntityViewedSocket
{
  let entityViewedSocket = new EntityViewedSocket();

  entityViewedSocket.Components = components;

  // add ViewComponent
  EntityComponentAdd(
    entityViewedSocket,
    ComponentTypeHandles.ViewComponent,
    viewComponent
  );

  // add SocketComponent
  EntityComponentAdd(
    entityViewedSocket,
    ComponentTypeHandles.SocketComponent,
    socketComponent
  );

  return entityViewedSocket;
}

/**
 * Creates a new ISocketComponent.
 */
export function NewSocketComponent (socketID: number, properties: any = {}): ISocketComponent
{
  return <ISocketComponent>{
    SocketID: socketID,
    Properties: properties
  }
}