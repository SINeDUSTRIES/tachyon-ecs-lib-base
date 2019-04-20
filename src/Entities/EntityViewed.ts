import { IViewComponent, IEntityViewed } from "tachyon-ecs";
import { Entity, ComponentTypeHandles } from "..";

export class EntityViewed extends Entity
  implements IEntityViewed
{
  /**
   * Get the IViewComponent from the components.
   */
  get ViewComponent (): IViewComponent
  {
    return this.Components[ComponentTypeHandles.ViewComponent];
  }
}