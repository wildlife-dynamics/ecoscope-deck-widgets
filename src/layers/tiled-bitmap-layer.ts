import {TileLayer, TileLayerProps} from '@deck.gl/geo-layers';
import {BitmapLayer} from '@deck.gl/layers';

type _TiledBitmapLayerProps = {
  widgetId?: string;
}

export type TiledBitmapLayerProps = TileLayerProps & _TiledBitmapLayerProps;

export default class TiledBitmapLayer extends TileLayer<TiledBitmapLayerProps>{
  static layerName = 'TiledBitmapLayer';
  static defaultProps = {
    ...TileLayer.defaultProps,
    widgetId: {type: 'string', value: null},
  };

  onTileLoad() {
    const { widgetId } = this.props as TiledBitmapLayerProps;
    if (widgetId) {
      window.parent.postMessage(
        { type: "TileLoaded", widgetId: widgetId },
        "*",
      );
    }
  }
  
  renderSubLayers(props: any) {
    const { id, data } = props;
    const { boundingBox } = props.tile;
    
    return new BitmapLayer({
      id: id,
      image: data,
      bounds: [boundingBox[0][0], boundingBox[0][1], boundingBox[1][0], boundingBox[1][1]]
    });
  }
};
