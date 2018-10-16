import { StateService } from '@uirouter/core';

export interface StateServiceWithMeta extends StateService {
	label?: string;
	isBase?: boolean;
	isChild?: boolean;
	isVisibleForAll?: boolean;
}
