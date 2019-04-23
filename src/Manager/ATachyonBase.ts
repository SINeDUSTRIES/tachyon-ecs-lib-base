import * as tachyon from "@sinedustries/tachyon-ecs";
import { MessageCode } from "..";

/**
 * Base implementation for a tachyon standard.
 * 
 * tachyon.ProblemCode returned by handlers are sent to the Socket who sent the message.
 * 
 * @remarks
 * Class provides common boilerplate implementations for both tachyon servers and clients.
 * abstract "handler_" methods need to be implemnted according to tachyon standard. 
 * non "handler_" methods provide a high level implementation.
 */
export abstract class ATachyonBase<TSocket> //implements ITachyonHandler
{
  //#region handlers/messages

  // @param message - message recieved
  // @returns - message sent to sockets

  /**
   * Invoked before any other onMessage_.
   * 
   * Implementation:
   * - Return a ProblemCode for any message.
   */
  protected abstract onMessage(socketID: number, message: tachyon.IMessage): tachyon.ProblemCode;

  protected abstract onMessage_ComponentDelta(socketID: number, message: tachyon.IMessage_ComponentDelta): tachyon.ProblemCode;

  protected abstract onMessage_EntityInstantiateFullServer(socketID: number, message: tachyon.IMessage_EntityInstantiateFullServer): tachyon.ProblemCode;
  protected abstract onMessage_EntityInstantiatePrefabServer(socketID: number, message: tachyon.IMessage_EntityInstantiatePrefabServer): tachyon.ProblemCode;

  protected abstract onMessage_EntityInstantiateFullClient(socketID: number, message: tachyon.IMessage_EntityInstantiateFullClient): tachyon.ProblemCode;
  protected abstract onMessage_EntityInstantiatePrefabClient(socketID: number, message: tachyon.IMessage_EntityInstantiatePrefabClient): tachyon.ProblemCode;

  protected abstract onMessage_SocketHandshakeClient(socketID: number, message: tachyon.IMessage_SocketHandshakeClient): tachyon.ProblemCode;
  protected abstract onMessage_SocketHandshakeServer(socketID: number, message: tachyon.IMessage_SocketHandshakeServer): tachyon.ProblemCode;
  protected abstract onMessage_SocketReadyClient(socketID: number, message: tachyon.IMessage_SocketReadyClient): tachyon.ProblemCode;

  protected abstract onMessage_Problem(socketID: number, message: tachyon.IMessage_Problem): tachyon.ProblemCode;

  /**
   * Handle tachyon.IMessage.Code specific to your app.
   * 
   * Messages are ensured NOT to have a tachyon.ProblemCode.SocketIDMismatch.
   * 
   * Implementation:
   * - Parse tachyon.IMessage.Code, using app specific codes.
   */
  protected abstract onMessage_default(socketID: number, message: tachyon.IMessage): tachyon.ProblemCode;

  //#endregion

  //#region handlers/sockets

  /**
   * Handle a message that was recieved by a Socket.
   * 
   * Sends to other handlers, uses MessageCode.
   * Defaults to onMessage_default.
   * 
   * @param socketID - ID of the socket that was assigned.
   * 
   * @returns the message that was interpreted.
   */
  private _onSocket_Message(socketID: number, message: string): tachyon.ProblemCode
  {
    console.log(`SocketID: ${socketID}. Message: ${message}`);

    let messageObject;
    try
    {
      messageObject = JSON.parse(message);
    }
    catch (e)
    {
      // TODO: error handling

      throw e;
    }

    let messageTachyon = <tachyon.IMessage>messageObject; // assert that the message is a tachyon message

    let problemCode = this.onMessage(socketID, messageTachyon);

    if (problemCode !== tachyon.ProblemCode.NONE)
    {
      switch (messageTachyon.Code)
      {
        // components

        case MessageCode.ComponentDelta:
          problemCode = this.onMessage_ComponentDelta(socketID, messageTachyon);

        // entities

        case MessageCode.EntityInstantiateFullClient:
          problemCode = this.onMessage_EntityInstantiateFullClient(socketID, messageTachyon);

        case MessageCode.EntityInstantiateFullServer:
          problemCode = this.onMessage_EntityInstantiateFullServer(socketID, messageTachyon);

        case MessageCode.EntityInstantiatePrefabClient:
          problemCode = this.onMessage_EntityInstantiatePrefabClient(socketID, messageTachyon);

        case MessageCode.EntityInstantiatePrefabServer:
          problemCode = this.onMessage_EntityInstantiatePrefabServer(socketID, messageTachyon);

        // sockets

        case MessageCode.SocketHandshakeClient:
          problemCode = this.onMessage_SocketHandshakeClient(socketID, messageTachyon);

        case MessageCode.SocketHandshakeServer:
          problemCode = this.onMessage_SocketHandshakeServer(socketID, messageTachyon);

        case MessageCode.SocketReadyClient:
          problemCode = this.onMessage_SocketReadyClient(socketID, messageTachyon);

        // problem

        case MessageCode.Problem:
          problemCode = this.onMessage_Problem(socketID, messageTachyon);

        // default

        default: // did not match tachyon codes, use implementation codes instead
          problemCode = this.onMessage_default(socketID, messageTachyon);
      }
    }

    // TODO: send problem message

    return problemCode;
  }

  /**
   * Invokes onMessage methods.
   * 
   * Strongly reccomended NOT to extend this. Instead, use onMessage methods.
   */
  protected onSocket_Message(socketID: number, message: string): tachyon.ProblemCode
  {
    return this._onSocket_Message(socketID, message);
  }

  /**
  * Handle a socket disconnecting from this one.
  */
  protected abstract onSocket_Close(socketID: number, reason: string): void;

  //#endregions

  //#region methods/messages

  /**
   * Send a $message to a Socket with SocketID === $socketID.
   * 
   * @param socketID - SocketID of the Socket to send $message to.
   * @param message - tachyon.IMessage to send to the Socket
   */
  protected abstract message_send(socket: TSocket, message: tachyon.IMessage): void;

  //#endregion


  //#region methods/entities

  /**
   * Adds to collection.
   * 
   * Extend to add functionality.
   * 
   * @param entityViewed 
   */
  protected entity_Watch(entityViewed: tachyon.IEntityViewed)
  {
    this.entitiesViewed.set(entityViewed.ViewComponent.EntityViewID, entityViewed);
  }

  //#endregion

  //#region socketEntities

  /**
   * Get SocketEntity for a given SocketID.
   * 
   * Extend to add functionality.
   * 
   * @return - Socket Entity with SocketID == $socketID.
   * 
   * @throws if no SocketEntity with that SocketID.
   */
  protected socketEntity_Get(socketID: number): tachyon.IEntityViewedSocket
  {
    let socket = this.socketEntities.get(socketID);

    if (socket !== undefined)
    {
      return socket;
    }
    else
    {
      throw new Error(`Socket Entity with SocketID '${socketID}' does not exist.`);
    }
  }

  /**
   * Delete SocketEntity for a given SocketID.
   * 
   * Extend to add functionality.
   * 
   * @throws if no SocketEntity with that SocketID.
   */
  protected socketEntity_Remove(socketID: number)
  {
    if (!this.socketEntities.delete(socketID))
    {
      throw new Error(`Socket Entity with SocketID '${socketID}' does not exist.`);
    }
  }

  //#endregion

  //#region variables/entities

  /**
   * key: EntityViewID.
   * value: enitty whose IViewComponent.EntityViewID equals key
   */
  protected entitiesViewed: Map<number, tachyon.IEntityViewed> = new Map<number, tachyon.IEntityViewed>();

  /**
   * All the SocketEntity for connected Sockets.
   * 
   * key: SocketID of the SocketEntity.
   * value: SocketEntity where ISocketComponent.SocketID === $key.
   */
  protected socketEntities: Map<number, tachyon.IEntityViewedSocket> = new Map<number, tachyon.IEntityViewedSocket>();

  //#endregion
}