import React, { useEffect, useRef, useState } from 'react';
import Map from 'ol/Map';
import View from 'ol/View';
import TileLayer from 'ol/layer/Tile';
import OSM from 'ol/source/OSM';
import VectorSource from 'ol/source/Vector';
import Cluster from 'ol/source/Cluster';
import VectorLayer from 'ol/layer/Vector';
import Feature from 'ol/Feature';
import Point from 'ol/geom/Point';
import { fromLonLat } from 'ol/proj';
import Overlay from 'ol/Overlay';
import { Style, Icon, Stroke, Fill, Circle as CircleStyle, Text } from 'ol/style';

type DataItem = {
  nama: string;
  lon: number;
  lat: number;
  tipe?: string;
  icon_url?: string;
};

export default function PluginSimpleMapOl(props: any) {
  const { width, height, data = [] } = props as { width?: number; height?: number; data: DataItem[] };
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const popupRef = useRef<HTMLDivElement | null>(null);
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
  const [showFilter, setShowFilter] = useState(false);

  const uniqueTypes = Array.from(new Set(data.map((d: DataItem) => d.tipe || 'Unknown')));

  useEffect(() => {
    if (!mapContainerRef.current) return;

    // create features from all data (we'll cluster filtered ones)
    const makeFeature = (item: DataItem) => {
      const f = new Feature({
        geometry: new Point(fromLonLat([item.lon, item.lat])),
        name: item.nama,
        tipe: item.tipe || 'Unknown',
        icon_url: item.icon_url || '',
      });
      return f;
    };

    const filtered = selectedTypes.length ? data.filter(d => selectedTypes.includes(d.tipe || 'Unknown')) : data;
    const features = filtered.map(makeFeature);

    const vectorSource = new VectorSource({
      features,
    });

    const clusterSource = new Cluster({
      distance: 40,
      source: vectorSource,
    });

    // style for clusters (Opsi A: bulat dengan angka)
    const styleCache: { [key: string]: Style } = {};
    const clustersLayer = new VectorLayer({
      source: clusterSource,
      style: function (feature) {
        const size = feature.get('features').length;
        let style = styleCache[size];
        if (!style) {
          if (size > 1) {
            style = new Style({
              image: new CircleStyle({
                radius: Math.max(15, Math.min(30, 10 + size)),
                stroke: new Stroke({ color: '#fff' }),
                fill: new Fill({ color: '#1976d2' }), // biru
              }),
              text: new Text({
                text: String(size),
                fill: new Fill({ color: '#fff' }),
                font: 'bold 12px sans-serif',
              }),
            });
          } else {
            // single feature: show its icon if available, otherwise small circle
            const single = feature.get('features')[0];
            const iconUrl = single.get('icon_url');
            if (iconUrl) {
              style = new Style({
                image: new Icon({
                  src: iconUrl,
                  scale: 0.7,
                  anchor: [0.5, 1],
                }),
              });
            } else {
              style = new Style({
                image: new CircleStyle({
                  radius: 7,
                  fill: new Fill({ color: '#1976d2' }),
                  stroke: new Stroke({ color: '#fff', width: 2 }),
                }),
              });
            }
          }
          styleCache[size] = style;
        }
        return style;
      },
    });

    const popup = new Overlay({
      element: popupRef.current || undefined,
      positioning: 'bottom-center',
      stopEvent: false,
      offset: [0, -10],
    });

    const map = new Map({
      target: mapContainerRef.current!,
      layers: [new TileLayer({ source: new OSM() }), clustersLayer],
      overlays: [popup],
      view: new View({
        center: fromLonLat([110, -2]),
        zoom: 5,
      }),
    });

    // click -> jika cluster size>1 zoom in, else tampilkan popup
    map.on('click', function (evt) {
      const feature = map.forEachFeatureAtPixel(evt.pixel, (f) => f);
      if (feature) {
        const featuresInside = feature.get('features');
        if (featuresInside.length > 1) {
          // zoom to cluster
          const extent = VectorSource.prototype.getExtent.call({
            getFeatures: () => featuresInside,
          } as any);
          map.getView().fit(extent, { padding: [50, 50, 50, 50], maxZoom: 16 });
        } else {
          const single = featuresInside[0];
          const coords = (single.getGeometry() as Point).getCoordinates();
          const name = single.get('name') || 'Tanpa Nama';
          const tipe = single.get('tipe') || '-';
          if (popupRef.current) {
            popupRef.current.innerHTML = `
              <div style="
                background: white;
                border-radius: 6px;
                padding: 6px 10px;
                border: 1px solid #ccc;
                box-shadow: 0 1px 4px rgba(0,0,0,0.3);
                font-size: 13px;
                min-width: 100px;
                text-align: center;
              ">
                <b>${name}</b><br/><small><i>${tipe}</i></small>
              </div>`;
          }
          popup.setPosition(coords);
        }
      } else {
        popup.setPosition(undefined);
      }
    });

    map.on('pointermove', function (e) {
      const hit = map.hasFeatureAtPixel(e.pixel);
      map.getTargetElement().style.cursor = hit ? 'pointer' : '';
    });

    return () => map.setTarget(undefined);
  }, [mapContainerRef, data, selectedTypes]);

  const toggleType = (tipe: string) => {
    setSelectedTypes(prev => (prev.includes(tipe) ? prev.filter(t => t !== tipe) : [...prev, tipe]));
  };

  return (
    <div style={{ position: 'relative', width: width || '100%', height: height || '400px' }}>
      <div ref={mapContainerRef} style={{ width: '100%', height: '100%' }} />
      <div ref={popupRef} style={{ position: 'absolute', pointerEvents: 'none' }} />
      <button
        onClick={() => setShowFilter(!showFilter)}
        style={{
          position: 'absolute',
          top: 10,
          right: 10,
          background: '#fff',
          border: '1px solid #ccc',
          borderRadius: 6,
          padding: '6px 10px',
          cursor: 'pointer',
          fontSize: 13,
          boxShadow: '0 1px 4px rgba(0,0,0,0.2)',
        }}
      >
        ⚙️ Filter Tipe
      </button>

      {showFilter && (
        <div
          style={{
            position: 'absolute',
            top: 50,
            right: 10,
            background: 'white',
            border: '1px solid #ccc',
            borderRadius: 8,
            padding: 10,
            boxShadow: '0 2px 6px rgba(0,0,0,0.2)',
            zIndex: 1000,
            fontSize: 13,
            maxHeight: 240,
            overflowY: 'auto',
          }}
        >
          <div style={{ fontWeight: 'bold', marginBottom: 6 }}>Tipe Data</div>
          {uniqueTypes.map((tipe) => (
            <label key={tipe} style={{ display: 'block', marginBottom: 6 }}>
              <input
                type="checkbox"
                checked={selectedTypes.includes(tipe)}
                onChange={() => toggleType(tipe)}
              />{' '}
              {tipe}
            </label>
          ))}
          <div style={{ marginTop: 8 }}>
            <button onClick={() => setSelectedTypes([])} style={{ marginRight: 6 }}>Reset</button>
            <button onClick={() => setSelectedTypes(uniqueTypes.slice())}>Select All</button>
          </div>
        </div>
      )}
    </div>
  );
}

