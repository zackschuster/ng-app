import { NgModalService } from '../../src/services/modal';
import { $log } from './-logger';

export const $modal = new NgModalService({
	open() {
		return {
			close() {
				return;
			},
			dismiss() {
				return;
			},
		};
	},
} as any, $log);
