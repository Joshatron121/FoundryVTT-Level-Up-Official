import { TJSDocument } from '#runtime/svelte/store/fvtt/document';
import { TJSDialog } from '#runtime/svelte/application';

import HealingScalingDialog from '../HealingScalingDialog.svelte';

/**
 * Provides a dialog for creating documents that by default is modal and not draggable.
 */
export default class HealingScalingConfigDialog extends TJSDialog {
  constructor(item, actionId, rollId, options = {}) {
    super({
      title: `${item.name} Healing Scaling Configuration`,
      content: {
        class: HealingScalingDialog,
        props: { item: new TJSDocument(item), actionId, rollId }
      }
    }, {
      classes: ['a5e-sheet'],
      width: options.width ?? 432
    });

    this.data.content.props.dialog = this;
  }
}
