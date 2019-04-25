/**
 * Predefined message codes used by tachyon-ecs.
 * 
 * DO NOT USE THESE in your implementation.
 * If your IMessage.Code matches this, it will be interpreted as a built in message.
 */
export enum MessageCode
{
  ComponentDelta = "ComponentDeltaRequest",

  EntityInstantiateFullClient = "EntityInstantiateFullClient",
  EntityInstantiateFullServer = "EntityInstantiateFullServer",
  EntityInstantiatePrefabClient = "EntityInstantiatePrefabClient",
  EntityInstantiatePrefabServer = "EntityInstantiatePrefabServer",

  SocketInitializeClient = "SocketInitializeClient",
  SocketHandshakeClient = "SocketHandshakeClient",
  SocketHandshakeServer = "SocketHandshakeServer",
  SocketReadyClient = "SocketReadyClient",

  Problem = "Problem"
}