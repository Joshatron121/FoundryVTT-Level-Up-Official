import type { DescriptionData, FavoriteData, SecretDescriptionData, SourceData } from './common';
import type { SchemaData } from '../common';

import { description, favorite, secretDescription, source } from './common';
import { migrationData } from '../common';

declare namespace A5EBaseItemData {
	interface Schema
		extends DataSchema,
			DescriptionData,
			FavoriteData,
			SecretDescriptionData,
			SchemaData,
			SourceData {}
	type BaseData = {};
	type DerivedData = {};
}

class A5EBaseItemData<
	Schema extends A5EBaseItemData.Schema,
	BaseData extends A5EBaseItemData.BaseData,
	DerivedData extends A5EBaseItemData.DerivedData,
> extends foundry.abstract.TypeDataModel<Schema, Item.ConfiguredInstance, BaseData, DerivedData> {
	/** @inheritDoc */
	static override defineSchema(): A5EBaseItemData.Schema {
		return {
			...description(),
			...favorite(),
			...secretDescription(),
			...migrationData(),
			...source(),
		};
	}
}

// eslint-disable-next-line import/prefer-default-export
export { A5EBaseItemData };
