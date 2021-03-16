import { MarkDefinition } from '@sanity/types';

export type GenericMarkDefinition<T = any> = MarkDefinition & T;