import type { DefaultProps, Layer, LayersList } from '@deck.gl/core';
import {
  GeoArrowPathLayer as UpstreamGeoArrowPathLayer,
  GeoArrowScatterplotLayer as UpstreamGeoArrowScatterplotLayer,
  GeoArrowPolygonLayer as UpstreamGeoArrowPolygonLayer,
} from '@geoarrow/deck.gl-geoarrow';
import type {
  GeoArrowPathLayerProps,
  GeoArrowPolygonLayerProps,
  GeoArrowScatterplotLayerProps,
} from '@geoarrow/deck.gl-geoarrow';
import type * as arrow from 'apache-arrow';

import { GeoParquetLoader } from '../loaders/geoparquet-loader';

type RenderLayersReturn = Layer | LayersList | null;

interface LayerLike {
  id?: string;
  props: Record<string, unknown>;
  constructor: { defaultProps?: Record<string, unknown> };
}

export function isRecordBatch(value: unknown): value is arrow.RecordBatch {
  if (typeof value !== 'object' || value === null) return false;
  // Distinguish from arrow.Table: Table has a `batches` array, RecordBatch
  // does not. Both share schema + getChild.
  return (
    'schema' in value &&
    'getChild' in value &&
    typeof (value as { getChild: unknown }).getChild === 'function' &&
    !('batches' in value)
  );
}

export function isArrowTable(value: unknown): value is arrow.Table {
  if (typeof value !== 'object' || value === null) return false;
  return (
    'schema' in value &&
    'batches' in value &&
    Array.isArray((value as { batches: unknown }).batches)
  );
}

/**
 * Walk every `get*` accessor declared in the layer class's `defaultProps`
 * (a closed set — we don't speculate over arbitrary `for...in` props) and
 * build a propName → arrow.Data map for those whose value is a bare string
 * column name.
 *
 * Returns null when nothing needed resolution.
 */
export function resolveAccessors(
  layer: LayerLike,
  batch: arrow.RecordBatch,
): Map<string, unknown> | null {
  const accessorNames = Object.keys(layer.constructor.defaultProps ?? {})
    .filter(name => name.startsWith('get'));
  let map: Map<string, unknown> | null = null;
  for (const propName of accessorNames) {
    const value = layer.props[propName];
    if (typeof value !== 'string') continue;
    const vector = batch.getChild(value);
    if (vector && vector.data.length > 0) {
      map ??= new Map();
      map.set(propName, vector.data[0]);
    } else {
      console.warn(
        `[${layer.id ?? 'GeoArrow layer'}] prop '${propName}' references column ` +
          `'${value}', but the record batch has no such column.`,
      );
    }
  }
  return map;
}

/**
 * Build per-batch props for an upstream layer instance: copy from the 
 * real layer, apply our resolved column → arrow.Data
 * overrides, and stamp in this batch as `data` plus a batch-suffixed id so
 * sub-layer ids stay unique across batches.
 */
function buildBatchProps(
  layer: LayerLike,
  batch: arrow.RecordBatch,
  batchIndex: number,
): Record<string, unknown> {
  const resolved = resolveAccessors(layer, batch);
  const subProps: Record<string, unknown> = {};
  for (const key in layer.props) {
    subProps[key] = resolved?.has(key) ? resolved.get(key) : layer.props[key];
  }
  subProps.data = batch;
  subProps.id = `${layer.id ?? 'GeoArrowLayer'}-batch-${batchIndex}`;
  return subProps;
}

/**
 * An Arrow table contains one or more record batches. We render a single GeoArrow layer for
 * each record batch.
 *
 * Return null while `data` is still a URL/loading placeholder because the base implementation would
 * access `data.schema.fields`, throw, and cause Deck to invoke its `onError`
 * callback.
 */
function renderBatchedData(
  LayerClass: new (p: Record<string, unknown>) => Layer,
  layer: LayerLike,
): RenderLayersReturn {
  const data = layer.props.data;
  if (isArrowTable(data)) {
    return data.batches.map((b, i) => new LayerClass(buildBatchProps(layer, b, i)));
  }
  if (isRecordBatch(data)) {
    return new LayerClass(buildBatchProps(layer, data, 0));
  }

  return null;
}

/**
 * These wrappers let Deck JSON/pydeck definitions load GeoParquet URLs and
 * reference Arrow columns by name in layer accessors.
 */

export class GeoArrowPathLayer<ExtraProps extends object = object> extends UpstreamGeoArrowPathLayer<ExtraProps> {
  static layerName = 'GeoArrowPathLayer';
  // Explicit annotation avoids tsc TS2883 ("inferred type ... cannot be named")
  // when emitting declarations — the upstream defaultProps inferred type pulls
  // in private types from @geoarrow/geoarrow-js/dist/data.
  static defaultProps: DefaultProps<GeoArrowPathLayerProps> = {
    ...UpstreamGeoArrowPathLayer.defaultProps,
    loaders: [GeoParquetLoader],
  };

  renderLayers(): RenderLayersReturn {
    return (
      renderBatchedData(
        UpstreamGeoArrowPathLayer as unknown as new (p: Record<string, unknown>) => Layer,
        this as unknown as LayerLike,
      ) ?? null
    );
  }
}

export class GeoArrowScatterplotLayer<ExtraProps extends object = object> extends UpstreamGeoArrowScatterplotLayer<ExtraProps> {
  static layerName = 'GeoArrowScatterplotLayer';
  static defaultProps: DefaultProps<GeoArrowScatterplotLayerProps> = {
    ...UpstreamGeoArrowScatterplotLayer.defaultProps,
    loaders: [GeoParquetLoader],
  };

  renderLayers(): RenderLayersReturn {
    return (
      renderBatchedData(
        UpstreamGeoArrowScatterplotLayer as unknown as new (p: Record<string, unknown>) => Layer,
        this as unknown as LayerLike,
      ) ?? null
    );
  }
}

export class GeoArrowPolygonLayer<ExtraProps extends object = object> extends UpstreamGeoArrowPolygonLayer<ExtraProps> {
  static layerName = 'GeoArrowPolygonLayer';
  static defaultProps: DefaultProps<GeoArrowPolygonLayerProps> = {
    ...UpstreamGeoArrowPolygonLayer.defaultProps,
    loaders: [GeoParquetLoader],
  };

  renderLayers(): RenderLayersReturn {
    return (
      renderBatchedData(
        UpstreamGeoArrowPolygonLayer as unknown as new (p: Record<string, unknown>) => Layer,
        this as unknown as LayerLike,
      ) ?? null
    );
  }
}
