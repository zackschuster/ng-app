import { NgModalService } from '../../src/services/modal';
import { $log } from './_logger';

export const $modal = new NgModalService({ open() { return { close() {}, dismiss() {} }; } } as any, $log);
