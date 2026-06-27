"use client";

import React, { useEffect, useRef } from 'react';
import { MapContainer, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Inject CSS for leaflet-side-by-side dynamically to prevent Next.js / Turbopack importing errors
const sideBySideStyles = `
  .leaflet-sbs-range {
      position: absolute;
      top: 50%;
      width: 100%;
      z-index: 999;
      -webkit-appearance: none;
      display: inline-block!important;
      vertical-align: middle;
      height: 0;
      padding: 0;
      margin: 0;
      border: 0;
      background: rgba(0, 0, 0, 0.25);
      min-width: 100px;
      cursor: pointer;
      pointer-events: none;
  }
  .leaflet-sbs-divider {
      position: absolute;
      top: 0;
      bottom: 0;
      left: 50%;
      margin-left: -2px;
      width: 4px;
      background-color: #fff;
      pointer-events: none;
      z-index: 999;
  }
  .leaflet-sbs-range::-ms-fill-upper {
      background: transparent;
  }
  .leaflet-sbs-range::-ms-fill-lower {
      background: rgba(255, 255, 255, 0.25);
  }
  .leaflet-sbs-range::-moz-range-track {
      opacity: 0;
  }
  .leaflet-sbs-range::-ms-track {
      opacity: 0;
  }
  .leaflet-sbs-range::-ms-tooltip {
      display: none;
  }
  .leaflet-sbs-range::-webkit-slider-thumb {
      -webkit-appearance: none;
      margin: 0;
      padding: 0;
      background: #fff;
      height: 40px;
      width: 40px;
      border-radius: 20px;
      cursor: ew-resize;
      pointer-events: auto;
      border: 1px solid #ddd;
      background-position: 50% 50%;
      background-repeat: no-repeat;
      background-size: 40px 40px;
      box-shadow: 0 2px 6px rgba(0,0,0,0.3);
  }
  .leaflet-sbs-range::-ms-thumb {
      margin: 0;
      padding: 0;
      background: #fff;
      height: 40px;
      width: 40px;
      border-radius: 20px;
      cursor: ew-resize;
      pointer-events: auto;
      border: 1px solid #ddd;
      background-position: 50% 50%;
      background-repeat: no-repeat;
      background-size: 40px 40px;
      box-shadow: 0 2px 6px rgba(0,0,0,0.3);
  }
  .leaflet-sbs-range::-moz-range-thumb {
      padding: 0;
      right: 0;
      background: #fff;
      height: 40px;
      width: 40px;
      border-radius: 20px;
      cursor: ew-resize;
      pointer-events: auto;
      border: 1px solid #ddd;
      background-position: 50% 50%;
      background-repeat: no-repeat;
      background-size: 40px 40px;
      box-shadow: 0 2px 6px rgba(0,0,0,0.3);
  }
  .leaflet-sbs-range:disabled::-moz-range-thumb {
      cursor: default;
  }
  .leaflet-sbs-range:disabled::-ms-thumb {
      cursor: default;
  }
  .leaflet-sbs-range:disabled::-webkit-slider-thumb {
      cursor: default;
  }
  .leaflet-sbs-range:disabled {
      cursor: default;
  }
  .leaflet-sbs-range:focus {
      outline: none!important;
  }
  .leaflet-sbs-range::-moz-focus-outer {
      border: 0;
  }
`;

function createSideBySide() {
  let mapWasDragEnabled: boolean;
  let mapWasTapEnabled: boolean;

  function getRangeEvent(rangeInput: HTMLInputElement) {
    return 'oninput' in rangeInput ? 'input' : 'change';
  }

  function cancelMapDrag(this: any) {
    mapWasDragEnabled = this._map.dragging.enabled();
    mapWasTapEnabled = this._map.tap && this._map.tap.enabled();
    this._map.dragging.disable();
    this._map.tap && this._map.tap.disable();
  }

  function uncancelMapDrag(this: any, e: any) {
    this._refocusOnMap(e);
    if (mapWasDragEnabled) {
      this._map.dragging.enable();
    }
    if (mapWasTapEnabled) {
      this._map.tap.enable();
    }
  }

  function asArray(arg: any) {
    return (arg === undefined || arg === 'undefined') ? [] : Array.isArray(arg) ? arg : [arg];
  }

  const SideBySide = L.Control.extend({
    includes: L.Evented.prototype,
    options: {
      thumbSize: 42,
      padding: 0
    },

    initialize: function (this: any, leftLayers: any, rightLayers: any, options: any) {
      this.setLeftLayers(leftLayers);
      this.setRightLayers(rightLayers);
      L.setOptions(this, options);
    },

    getPosition: function (this: any) {
      const rangeValue = this._range.value;
      const offset = (0.5 - rangeValue) * (2 * this.options.padding + this.options.thumbSize);
      return this._map.getSize().x * rangeValue + offset;
    },

    setPosition: function () {},

    addTo: function (this: any, map: any) {
      this.remove();
      this._map = map;

      const container = this._container = L.DomUtil.create('div', 'leaflet-sbs', map._controlContainer);

      this._divider = L.DomUtil.create('div', 'leaflet-sbs-divider', container);
      const range = this._range = L.DomUtil.create('input', 'leaflet-sbs-range', container);
      range.type = 'range';
      range.min = '0';
      range.max = '1';
      range.step = 'any';
      range.value = '0.5';
      range.style.paddingLeft = range.style.paddingRight = this.options.padding + 'px';
      this._addEvents();
      this._updateLayers();
      return this;
    },

    remove: function (this: any) {
      if (!this._map) {
        return this;
      }

      const getLayerElement = (layer: any) => {
        if (!layer) return null;
        if (typeof layer.getContainer === 'function') return layer.getContainer();
        if (typeof layer.getElement === 'function') return layer.getElement();
        return null;
      };

      const leftEl = getLayerElement(this._leftLayer);
      if (leftEl) leftEl.style.clip = '';

      const rightEl = getLayerElement(this._rightLayer);
      if (rightEl) rightEl.style.clip = '';

      this._removeEvents();
      L.DomUtil.remove(this._container);

      this._map = null;
      return this;
    },

    setLeftLayers: function (this: any, leftLayers: any) {
      this._leftLayers = asArray(leftLayers);
      this._updateLayers();
      return this;
    },

    setRightLayers: function (this: any, rightLayers: any) {
      this._rightLayers = asArray(rightLayers);
      this._updateLayers();
      return this;
    },

    _updateClip: function (this: any) {
      const map = this._map;
      if (!map) return;
      const nw = map.containerPointToLayerPoint([0, 0]);
      const se = map.containerPointToLayerPoint(map.getSize());
      const clipX = nw.x + this.getPosition();
      const dividerX = this.getPosition();

      this._divider.style.left = dividerX + 'px';
      this.fire('dividermove', { x: dividerX });
      const clipLeft = 'rect(' + [nw.y, clipX, se.y, nw.x].join('px,') + 'px)';
      const clipRight = 'rect(' + [nw.y, se.x, se.y, clipX].join('px,') + 'px)';

      const getLayerElement = (layer: any) => {
        if (!layer) return null;
        if (typeof layer.getContainer === 'function') return layer.getContainer();
        if (typeof layer.getElement === 'function') return layer.getElement();
        return null;
      };

      const leftEl = getLayerElement(this._leftLayer);
      if (leftEl) leftEl.style.clip = clipLeft;

      const rightEl = getLayerElement(this._rightLayer);
      if (rightEl) rightEl.style.clip = clipRight;
    },

    _updateLayers: function (this: any) {
      if (!this._map) {
        return this;
      }
      const prevLeft = this._leftLayer;
      const prevRight = this._rightLayer;
      this._leftLayer = this._rightLayer = null;
      
      this._leftLayers.forEach(function (this: any, layer: any) {
        if (this._map.hasLayer(layer)) {
          this._leftLayer = layer;
        }
      }, this);
      
      this._rightLayers.forEach(function (this: any, layer: any) {
        if (this._map.hasLayer(layer)) {
          this._rightLayer = layer;
        }
      }, this);
      
      if (prevLeft !== this._leftLayer) {
        prevLeft && this.fire('leftlayerremove', { layer: prevLeft });
        this._leftLayer && this.fire('leftlayeradd', { layer: this._leftLayer });
      }
      if (prevRight !== this._rightLayer) {
        prevRight && this.fire('rightlayerremove', { layer: prevRight });
        this._rightLayer && this.fire('rightlayeradd', { layer: this._rightLayer });
      }
      this._updateClip();
    },

    _addEvents: function (this: any) {
      const range = this._range;
      const map = this._map;
      if (!map || !range) return;
      map.on("move", this._updateClip, this);
      map.on("layeradd layerremove", this._updateLayers, this);
      L.DomEvent.on(range, getRangeEvent(range), this._updateClip, this);
      L.DomEvent.on(range, "touchstart", cancelMapDrag, this);
      L.DomEvent.on(range, "touchend", uncancelMapDrag, this);
      L.DomEvent.on(range, "mousedown", cancelMapDrag, this);
      L.DomEvent.on(range, "mouseup", uncancelMapDrag, this);
    },

    _removeEvents: function (this: any) {
      const range = this._range;
      const map = this._map;
      if (range) {
        L.DomEvent.off(range, getRangeEvent(range), this._updateClip, this);
        L.DomEvent.off(range, "touchstart", cancelMapDrag, this);
        L.DomEvent.off(range, "touchend", uncancelMapDrag, this);
        L.DomEvent.off(range, "mousedown", cancelMapDrag, this);
        L.DomEvent.off(range, "mouseup", uncancelMapDrag, this);
      }
      if (map) {
        map.off("layeradd layerremove", this._updateLayers, this);
        map.off("move", this._updateClip, this);
      }
    },
  });

  return (leftLayers: any, rightLayers: any, options?: any) => {
    // @ts-ignore
    return new SideBySide(leftLayers, rightLayers, options);
  };
}

interface LeafletCompareMapProps {
  leftUrl: string;
  rightUrl: string;
  bounds?: [number, number, number, number];
}

function SideBySideControl({ leftUrl, rightUrl, bounds }: { leftUrl: string, rightUrl: string, bounds: L.LatLngBoundsExpression }) {
  const map = useMap();
  const controlRef = useRef<any>(null);
  
  useEffect(() => {
    // Dynamically inject styles into document head
    let styleTag = document.getElementById('leaflet-sbs-styles');
    if (!styleTag) {
      styleTag = document.createElement('style');
      styleTag.id = 'leaflet-sbs-styles';
      styleTag.innerHTML = sideBySideStyles;
      document.head.appendChild(styleTag);
    }

    // @ts-ignore
    map.fitBounds(L.latLngBounds(bounds));

    const leftLayer = L.imageOverlay(leftUrl, bounds, { opacity: 1, crossOrigin: "anonymous" }).addTo(map);
    const rightLayer = L.imageOverlay(rightUrl, bounds, { opacity: 1, crossOrigin: "anonymous" }).addTo(map);

    const sideBySideFn = createSideBySide();
    controlRef.current = sideBySideFn(leftLayer, rightLayer).addTo(map);

    return () => {
      if (controlRef.current) {
         map.removeControl(controlRef.current);
      }
      map.removeLayer(leftLayer);
      map.removeLayer(rightLayer);
    };
  }, [map, leftUrl, rightUrl, bounds]);

  return null;
}

import { TileLayer } from 'react-leaflet';

export default function LeafletCompareMap({ leftUrl, rightUrl, bounds }: LeafletCompareMapProps) {
  const isValidBounds = bounds && Array.isArray(bounds) && bounds.length === 4 && bounds.every(n => typeof n === 'number' && !isNaN(n));
  const mapBounds: L.LatLngBoundsExpression = isValidBounds 
    ? [[bounds[0], bounds[1]], [bounds[2], bounds[3]]]
    : [[8.4, 68.7], [37.6, 97.25]];

  return (
    <MapContainer 
      bounds={mapBounds}
      maxBounds={mapBounds}
      maxBoundsViscosity={1.0}
      className="w-full h-full z-0 bg-[#0a0a0a]"
      zoomControl={true}
      minZoom={3}
      maxZoom={10}
      style={{ height: '100%', width: '100%', minHeight: '500px' }}
    >
      <TileLayer
        url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
      />
      <SideBySideControl leftUrl={leftUrl} rightUrl={rightUrl} bounds={mapBounds} />
    </MapContainer>
  );
}