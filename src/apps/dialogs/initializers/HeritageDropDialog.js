import { TJSDialog } from '#runtime/svelte/application';

import HeritageDropDialogComponent from '../HeritageDropDialog.svelte';

/**
 * Provides a dialog for creating documents that by default is modal and not draggable.
 */
export default class HeritageDropDialog extends TJSDialog {
  constructor(actorDocument, itemDocument) {
    super({
      title: 'Test',
      content: {
        class: HeritageDropDialogComponent,
        props: { actorDocument, itemDocument }
      }
    }, { classes: ['a5e-sheet'], width: 480 });

    this.promise = new Promise((resolve) => {
      this.resolve = resolve;
    });
  }

  close(options) {
    this.resolvePromise(null);
    return super.close(options);
  }

  resolvePromise(data) {
    if (this.resolve) {
      this.resolve(data);
    }
  }

  submit(data) {
    this.resolvePromise(data);
    return super.close();
  }
}
