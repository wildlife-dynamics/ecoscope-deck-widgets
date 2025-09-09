import NorthArrowWidget from './na-widget';
import TitleWidget from './title';
import ScaleWidget from './scale';
import LegendWidget from './legend';
import SaveImageWidget from './save-image';
import TiledBitmapLayer from './tiled-bitmap-layer';

export {default as NorthArrowWidget} from './na-widget'
export {default as TitleWidget} from './title'
export {default as ScaleWidget} from './scale'
export {default as LegendWidget} from './legend'
export {default as SaveImageWidget} from './save-image';
export {default as TiledBitmapLayer} from './tiled-bitmap-layer';

const _global = typeof window === 'undefined' ? global : window;
_global.NorthArrowWidget = {NorthArrowWidget};
_global.TitleWidget = {TitleWidget};
_global.ScaleWidget = {ScaleWidget};
_global.LegendWidget = {LegendWidget};
_global.SaveImageWidget = {SaveImageWidget};
_global.TiledBitmapLayer = {TiledBitmapLayer};
