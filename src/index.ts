import NorthArrowWidget from './na-widget';

export {default as NorthArrowWidget} from './na-widget'

const _global = typeof window === 'undefined' ? global : window;
_global.NorthArrowWidget = {NorthArrowWidget};
