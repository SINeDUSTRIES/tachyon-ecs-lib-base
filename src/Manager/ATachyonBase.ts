import * as tachyon from "tachyon-ecs";
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

  protected abstract handler_message_ComponentDelta(message: tachyon.IMessage_ComponentDelta): tachyon.ProblemCode;

  protected abstract handler_message_EntityInstantiateFullServer(message: tachyon.IMessage_EntityInstantiateFullServer): tachyon.ProblemCode;
  protected abstract handler_message_EntityInstantiatePrefabServer(message: tachyon.IMessage_EntityInstantiatePrefabServer): tachyon.ProblemCode;

  protected abstract handler_message_EntityInstantiateFullClient(message: tachyon.IMessage_EntityInstantiateFullClient): tachyon.ProblemCode;
  protected abstract handler_message_EntityInstantiatePrefabClient(message: tachyon.IMessage_EntityInstantiatePrefabClient): tachyon.ProblemCode;

  protected abstract handler_message_SocketHandshakeClient(message: tachyon.IMessage_SocketHandshakeClient): tachyon.ProblemCode;
  protected abstract handler_message_SocketHandshakeServer(message: tachyon.IMessage_SocketHandshakeServer): tachyon.ProblemCode;
  protected abstract handler_message_SocketReadyClient(message: tachyon.IMessage_SocketReadyClient): tachyon.ProblemCode;

  protected abstract handler_message_Problem(message: tachyon.IMessage_Problem): tachyon.ProblemCode;

  /**
   * Handle tachyon.IMessage.Code specific to your app.
   * 
   * Messages are ensured NOT to have a tachyon.ProblemCode.SocketIDMismatch.
   * 
   * Implementation:
   * - Parse tachyon.IMessage.Code, using app specific codes.
   */
  protected abstract handler_message_implementation(message: tachyon.IMessage): tachyon.ProblemCode;

  /**
   * Handle messages.
   * 
   * Uses build in MessageCode.
   * Defaults to handler_message_implementation.
   */
  private handler_message(message: tachyon.IMessage): tachyon.ProblemCode
  {
    switch (message.Code)
    {
      // components

      case MessageCode.ComponentDelta:
        return this.handler_message_ComponentDelta(message);

      // entities

      case MessageCode.EntityInstantiateFullClient:
        return this.handler_message_EntityInstantiateFullClient(message);

      case MessageCode.EntityInstantiateFullServer:
        return this.handler_message_EntityInstantiateFullServer(message);

      case MessageCode.EntityInstantiatePrefabClient:
        return this.handler_message_EntityInstantiatePrefabClient(message);

      case MessageCode.EntityInstantiatePrefabServer:
        return this.handler_message_EntityInstantiatePrefabServer(message);

      // sockets

      case MessageCode.SocketHandshakeClient:
        return this.handler_message_SocketHandshakeClient(message);

      case MessageCode.SocketHandshakeServer:
        return this.handler_message_SocketHandshakeServer(message);

      case MessageCode.SocketReadyClient:
        return this.handler_message_SocketReadyClient(message);

      // problem

      case MessageCode.Problem:
        return this.handler_message_Problem(message);

      // default

      default: // did not match tachyon codes, use implementation codes instead
        return this.handler_message_implementation(message);
    }
  }

  //#endregion

  //#region catch

  /**
   * Try to throw tachyon.ProblemCode.SocketIDMismatch.
   * ie, if this returns 'true', there is a problem.
   * 
   * Server Implementation:
   * return true if $socketID does not match tachyon.IMessage.OriginSocketID.
   * 
   * @returns - caught a mismatch?
   */
  protected abstract problem_throw_SocketIDMismatch(socketID: number, message: tachyon.IMessage): boolean;

  /**
   * Handle throwing tachyon.ProblemCode.SocketIDMismatch.
   * 
   * Implementors choice.
   */
  protected abstract problem_catch_SocketIDMismatch(socketID: number, message: tachyon.IMessage): void;

  //#endregion

  //#region methods/messages

  /**
   * Send a $message to a Socket with SocketID === $socketID.
   * 
   * @param socketID - SocketID of the Socket to send $message to.
   * @param message - tachyon.IMessage to send to the Socket
   */
  protected abstract message_send(socket: TSocket, message: tachyon.IMessage): void;

  //#endregion

  //#region handlers/sockets

  /**
   * Handle a message that was recieved by a Socket.
   * 
   * Raises events.
   * 
   * @param socketID - ID of the socket that was assigned.
   * 
   * @returns the message that was interpreted.
   */
  protected handler_socket_onMessage(socketID: number, message: string): tachyon.ProblemCode
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

    // catch tachyon.ProblemCode.SocketIDMismatch
    if (this.problem_throw_SocketIDMismatch(socketID, messageTachyon))
    {
      this.problem_catch_SocketIDMismatch(socketID, messageTachyon);

      return tachyon.ProblemCode.SocketIDMismatch;
    }

    // handle the message
    let problemCode = this.handler_message(messageTachyon);

    // TODO: send problem message

    return problemCode;
  }

  /**
  * Handle a socket disconnecting from this one.
  */
  protected abstract handler_socket_onClose(socketID: number, reason: string): void;

  // /**
  //  * Handle a socket connection.
  //  * 
  //  * Server: socket of new client.
  //  * Client: socket of the server.
  //  */
  // protected abstract handler_socket_onConnection(socket : TSocket) : void;

  //#endregions

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