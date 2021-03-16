import type { Block } from '@sanity/types';

type AnyBlock = { [key: string]: any; _type: string; };
export type PortableText<B extends AnyBlock = AnyBlock> = (Block | B)[];