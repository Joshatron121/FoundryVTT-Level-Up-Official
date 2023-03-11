// eslint-disable-next-line import/no-unresolved
import { SvelteApplication } from '@typhonjs-fvtt/runtime/svelte/application';

import BackgroundSheetComponent from './sheets/BackgroundSheet.svelte';
import CultureSheetComponent from './sheets/CultureSheet.svelte';
import DestinySheetComponent from './sheets/DestinySheet.svelte';
import ItemSheetComponent from './sheets/ItemSheet.svelte';

export default class ItemSheet extends SvelteApplication {
  /**
   * @inheritDoc
   */
  constructor(item, options = {}) {
    super(foundry.utils.mergeObject(
      options,
      {
        id: `item-sheet-${item.id}`,
        title: item.name,
        svelte: {
          class: ItemSheet.getSheetComponent(item.type),
          props: {
            itemDocument: item
          }
        }
      }
    ));

    this.item = item;
  }

  /**
   * Default Application options
   *
   * @returns {object} options - Application options.
   * @see https://foundryvtt.com/api/Application.html#options
   */
  static get defaultOptions() {
    return foundry.utils.mergeObject(super.defaultOptions, {
      classes: ['a5e-sheet', 'a5e-item-sheet'],
      resizable: true,
      minimizable: true,
      width: 555,
      height: 592,

      svelte: {
        class: ItemSheetComponent,
        target: document.body
      }
    });
  }

  _getHeaderButtons() {
    const buttons = super._getHeaderButtons();

    if (!this.item.pack) {
      buttons.unshift({
        label: 'Sheet Configuration',
        class: 'configure-sheet',
        icon: 'fas fa-cog fa-fw',
        title: 'Configure Sheet',
        onclick: (event) => this._onConfigureSheet(event)
      });
    }

    if (this.item.pack) {
      buttons.unshift({
        label: 'Import',
        class: 'import',
        icon: 'fas fa-download',
        onclick: (event) => this._onImport(event)
      });
    }
    return buttons;
  }

  _onImport(event) {
    if (event) event.preventDefault();
    return this.item.collection
      .importFromCompendium(this.item.compendium, this.item.id);
  }

  _onConfigureSheet(event) {
    if (event) event.preventDefault();

    const sheetConfigDialog = new DocumentSheetConfig(this.item, { top: this.position.top + 40 });
    sheetConfigDialog.render(true);
  }

  static getSheetComponent(type) {
    if (type === 'background') return BackgroundSheetComponent;
    if (type === 'culture') return CultureSheetComponent;
    if (type === 'destiny') return DestinySheetComponent;
    return ItemSheetComponent;
  }
}