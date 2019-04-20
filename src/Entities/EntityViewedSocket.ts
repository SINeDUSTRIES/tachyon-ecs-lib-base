import { ISocketComponent, IEntityViewedSocket } from "tachyon-ecs";
import { EntityViewed, ComponentTypeHandles } from "..";

/**
 * Implementation of IEntityViewedSocket
 */
export class EntityViewedSocket extends EntityViewed
  implements IEntityViewedSocket
{
  /**
   * Get the IViewComponent from the components.
   */
  get SocketComponent (): ISocketComponent
  {
    return this.Components[ComponentTypeHandles.SocketComponent];
  }
}