'use client';

import { useRef, useEffect, memo, useState, useMemo } from 'react';
import type { Doc } from '@/convex/_generated/dataModel';
import { RadarSweepOverlay } from '@/components/RadarSweepOverlay';

type Startup = Doc<'startups'>;

export type FlyToTarget = {
  center: [number, number];
  zoom: number;
};

type Props = {
  startups: Startup[];
  selectedSlug: string | null;
  onSelectStartup: (slug: string | null) => void;
  onMapDataReady?: () => void;
  flyToTarget?: FlyToTarget | null;
};

const SOURCE_ID = 'startups';
const CLUSTER_LAYER = 'startups-clusters';
const CLUSTER_COUNT_LAYER = 'startups-cluster-count';
const GLOW_LAYER = 'startups-glow';
const LOGOS_LAYER = 'startups-logos';
const DEFAULT_ICON_ID = 'startup-default';

const LOGO_PX = 48;
const SPREAD_BASE = 0.35;
const COORD_PRECISION = 1;

function growthColorKey(growthRate: number | undefined): string {
  if (growthRate == null) return 'stable';
  const pct = growthRate <= 1 ? growthRate * 100 : growthRate;
  if (pct > 5) return 'growing';
  if (pct < -5) return 'declining';
  return 'stable';
}

function glowRadius(mrr: number): number {
  const minR = 6;
  const maxR = 16;
  const log = Math.log10(Math.max(100, mrr / 100));
  return Math.min(maxR, Math.max(minR, minR + log * 2));
}

function createDefaultIcon(): {
  width: number;
  height: number;
  data: Uint8ClampedArray;
} {
  const size = LOGO_PX;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d')!;
  ctx.beginPath();
  ctx.arc(size / 2, size / 2, size / 2 - 2, 0, Math.PI * 2);
  ctx.fillStyle = '#1e293b';
  ctx.fill();
  ctx.strokeStyle = '#00f5ff';
  ctx.lineWidth = 2;
  ctx.stroke();
  ctx.font = '16px sans-serif';
  ctx.fillStyle = '#64748b';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('?', size / 2, size / 2);
  const imageData = ctx.getImageData(0, 0, size, size);
  return { width: size, height: size, data: imageData.data };
}

function imageToIconData(img: HTMLImageElement): {
  width: number;
  height: number;
  data: Uint8ClampedArray;
} {
  const size = LOGO_PX;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d')!;
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';
  ctx.drawImage(img, 0, 0, size, size);
  const imageData = ctx.getImageData(0, 0, size, size);
  return { width: size, height: size, data: imageData.data };
}

type FeatureStructure = {
  type: 'Feature';
  geometry: { type: 'Point'; coordinates: [number, number] };
  properties: { slug: string; growth: string; r: number; hasLogo: boolean };
};

function computeFeatureStructures(startups: Startup[]): FeatureStructure[] {
  const withCoords = startups.filter(
    (s): s is Startup & { lat: number; lng: number } =>
      s.lat != null && s.lng != null,
  );
  const key = (s: (typeof withCoords)[0]) =>
    `${s.lat.toFixed(COORD_PRECISION)},${s.lng.toFixed(COORD_PRECISION)}`;
  const groups = new Map<string, typeof withCoords>();

  for (const s of withCoords) {
    const k = key(s);
    if (!groups.has(k)) groups.set(k, []);
    groups.get(k)!.push(s);
  }

  const features: FeatureStructure[] = [];
  for (const [, group] of groups) {
    const n = group.length;
    const baseLng = group[0].lng;
    const baseLat = group[0].lat;
    const radius = n <= 1 ? 0 : SPREAD_BASE * Math.min(2.5, Math.sqrt(n));
    group.forEach((s, i) => {
      let lng = baseLng;
      let lat = baseLat;
      if (n > 1) {
        const angle = (2 * Math.PI * i) / n;
        lng = baseLng + radius * Math.cos(angle);
        lat = baseLat + radius * Math.sin(angle);
      }

      features.push({
        type: 'Feature',
        geometry: { type: 'Point', coordinates: [lng, lat] },
        properties: {
          slug: s.slug,
          growth: growthColorKey(s.growthRate),
          r: glowRadius(s.mrr),
          hasLogo: Boolean(s.logo?.trim()),
        },
      });
    });
  }
  return features;
}

function structuresToGeoJSON(
  structures: FeatureStructure[],
  loadedLogoSlugs: Set<string>,
) {
  return {
    type: 'FeatureCollection' as const,
    features: structures.map((f) => {
      const { hasLogo, ...rest } = f.properties;
      return {
        ...f,
        properties: {
          ...rest,
          icon:
            hasLogo && loadedLogoSlugs.has(f.properties.slug)
              ? f.properties.slug
              : DEFAULT_ICON_ID,
        },
      };
    }),
  };
}

const GROWING = '#10b981';
const STABLE = '#f59e0b';
const DECLINING = '#ef4444';

function MapLegend({ count }: { count: number }) {
  return (
    <div
      className='absolute bottom-2 right-2 z-10 hidden flex-col gap-1.5 rounded-lg border border-white/20 bg-(--panel-dark)/95 backdrop-blur px-2.5 py-2 sm:bottom-4 sm:right-4 sm:flex sm:gap-2 sm:rounded-xl sm:px-3 sm:py-2.5'
      style={{ boxShadow: '0 4px 24px rgba(0,0,0,0.4)' }}
    >
      <span className='mb-0.5 font-mono text-[10px] font-semibold uppercase tracking-wider text-slate-400'>
        Growth
      </span>
      <div className='flex items-center gap-2'>
        <span
          className='h-2.5 w-2.5 shrink-0 rounded-full'
          style={{
            background: GROWING,
            boxShadow: `0 0 0 1.5px rgba(255,255,255,0.8), 0 0 8px ${GROWING}`,
          }}
        />
        <span className='font-mono text-[11px] text-slate-200'>Growing</span>
      </div>
      <div className='flex items-center gap-2'>
        <span
          className='h-2.5 w-2.5 shrink-0 rounded-full'
          style={{
            background: STABLE,
            boxShadow: `0 0 0 1.5px rgba(255,255,255,0.8), 0 0 8px ${STABLE}`,
          }}
        />
        <span className='font-mono text-[11px] text-slate-200'>Stable</span>
      </div>
      <div className='flex items-center gap-2'>
        <span
          className='h-2.5 w-2.5 shrink-0 rounded-full'
          style={{
            background: DECLINING,
            boxShadow: `0 0 0 1.5px rgba(255,255,255,0.8), 0 0 8px ${DECLINING}`,
          }}
        />
        <span className='font-mono text-[11px] text-slate-200'>Declining</span>
      </div>
      <p className='mt-1 border-t border-white/10 pt-1.5 font-mono text-[10px] text-slate-500 whitespace-nowrap'>
        {count} startups · Click logo
      </p>
    </div>
  );
}

export const RadarMap = memo(function RadarMap({
  startups,
  selectedSlug,
  onSelectStartup,
  onMapDataReady,
  flyToTarget,
}: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<import('mapbox-gl').Map | null>(null);
  const onSelectRef = useRef(onSelectStartup);
  const onMapDataReadyRef = useRef(onMapDataReady);
  onSelectRef.current = onSelectStartup;
  onMapDataReadyRef.current = onMapDataReady;
  const [mapReady, setMapReady] = useState(false);
  const [loadedLogoSlugs, setLoadedLogoSlugs] = useState<Set<string>>(
    new Set(),
  );

  const token =
    typeof process !== 'undefined'
      ? process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN
      : undefined;

  useEffect(() => {
    if (!token || !containerRef.current) return;
    setMapReady(false);
    let map: import('mapbox-gl').Map;
    import('mapbox-gl').then((mapboxgl) => {
      mapboxgl.default.accessToken = token;
      map = new mapboxgl.default.Map({
        container: containerRef.current!,
        style: 'mapbox://styles/mapbox/outdoors-v12',
        projection: 'globe',
        center: [0, 20],
        zoom: 1.5,
      });
      mapRef.current = map;
      map.on('load', () => {
        map.addSource(SOURCE_ID, {
          type: 'geojson',
          data: { type: 'FeatureCollection', features: [] },
          cluster: false,
          clusterMaxZoom: 14,
          clusterRadius: 50,
        });

        const defaultIcon = createDefaultIcon();
        if (!map.hasImage(DEFAULT_ICON_ID)) {
          map.addImage(DEFAULT_ICON_ID, defaultIcon);
        }

        /* Cluster circles - shown at low zoom */
        map.addLayer({
          id: 'startups-clusters',
          type: 'circle',
          source: SOURCE_ID,
          filter: ['has', 'point_count'],
          paint: {
            'circle-color': STABLE,
            'circle-radius': ['*', ['sqrt', ['get', 'point_count']], 3],
            'circle-opacity': 0.6,
            'circle-stroke-width': 1,
            'circle-stroke-color': 'rgba(255,255,255,0.3)',
          },
        });

        /* Cluster count labels */
        map.addLayer({
          id: 'startups-cluster-count',
          type: 'symbol',
          source: SOURCE_ID,
          filter: ['has', 'point_count'],
          layout: {
            'text-field': ['get', 'point_count_abbreviated'],
            'text-font': ['DIN Offc Pro Medium', 'Arial Unicode MS Bold'],
            'text-size': 12,
          },
          paint: {
            'text-color': '#ffffff',
          },
        });

        map.addLayer({
          id: GLOW_LAYER,
          type: 'circle',
          source: SOURCE_ID,
          filter: ['!', ['has', 'point_count']],
          paint: {
            'circle-radius': ['get', 'r'],
            'circle-color': [
              'match',
              ['get', 'growth'],
              'growing',
              GROWING,
              'declining',
              DECLINING,
              STABLE,
            ],
            'circle-blur': 0.4,
            'circle-opacity': 0.5,
          },
        });

        map.addLayer({
          id: LOGOS_LAYER,
          type: 'symbol',
          source: SOURCE_ID,
          filter: ['!', ['has', 'cluster']],
          layout: {
            'icon-image': ['coalesce', ['get', 'icon'], DEFAULT_ICON_ID],
            'icon-size': 0.3,
            'icon-allow-overlap': true,
            'icon-ignore-placement': true,
          },
          paint: { 'icon-opacity': 1 },
        });

        map.on('click', 'startups-clusters', (e) => {
          const f = e.features?.[0];
          if (!f?.geometry || f.geometry.type !== 'Point') return;
          const coords = (f.geometry as GeoJSON.Point).coordinates.slice() as [
            number,
            number,
          ];
          const clusterId = f.properties?.cluster_id;
          if (clusterId == null) return;
          const source = map.getSource(SOURCE_ID) as mapboxgl.GeoJSONSource;
          if (!source?.getClusterExpansionZoom) return;
          source.getClusterExpansionZoom(clusterId, (err, zoom) => {
            if (err) return;
            map.flyTo({
              center: coords,
              zoom: zoom ?? undefined,
              duration: 500,
            });
          });
        });

        map.on('click', LOGOS_LAYER, (e) => {
          const f = e.features?.[0];
          if (f?.properties?.slug)
            onSelectRef.current(f.properties.slug as string);
        });

        map.getCanvas().style.cursor = '';
        map.on('mouseenter', 'startups-clusters', () => {
          map.getCanvas().style.cursor = 'pointer';
        });
        map.on('mouseenter', LOGOS_LAYER, () => {
          map.getCanvas().style.cursor = 'pointer';
        });
        map.on('mouseleave', 'startups-clusters', () => {
          map.getCanvas().style.cursor = '';
        });
        map.on('mouseleave', LOGOS_LAYER, () => {
          map.getCanvas().style.cursor = '';
        });

        /* Fog: soft blue matches ocean, dark space blends with UI */
        map.setFog({
          color: 'rgb(100, 150, 210)',
          'high-color': 'rgb(30, 60, 120)',
          'horizon-blend': 0.2,
          'space-color': 'rgb(8, 12, 24)',
          'star-intensity': 0.6,
        });

        setMapReady(true);
      });
    });
    return () => {
      setMapReady(false);
      setLoadedLogoSlugs(new Set());
      mapRef.current?.remove();
      mapRef.current = null;
    };
  }, [token]);

  const featureStructures = useMemo(
    () => computeFeatureStructures(startups),
    [startups],
  );
  const geojson = useMemo(
    () => structuresToGeoJSON(featureStructures, loadedLogoSlugs),
    [featureStructures, loadedLogoSlugs],
  );

  const pendingLogoSlugsRef = useRef<Set<string>>(new Set());
  const flushLogoTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(
    null,
  );
  const setDataRafRef = useRef<number | null>(null);
  const lastGeojsonRef = useRef(geojson);
  const hasCalledMapDataReadyRef = useRef(false);

  const flushPendingLogos = useRef(() => {
    if (pendingLogoSlugsRef.current.size === 0) return;
    const batch = new Set(pendingLogoSlugsRef.current);
    pendingLogoSlugsRef.current = new Set();
    setLoadedLogoSlugs((prev) => new Set([...prev, ...batch]));
  });

  useEffect(() => {
    lastGeojsonRef.current = geojson;
    if (!mapReady || !mapRef.current) return;
    if (setDataRafRef.current != null)
      cancelAnimationFrame(setDataRafRef.current);
    setDataRafRef.current = requestAnimationFrame(() => {
      setDataRafRef.current = null;
      const map = mapRef.current;
      const source = map?.getSource(SOURCE_ID) as
        | import('mapbox-gl').GeoJSONSource
        | undefined;
      if (source && map) {
        source.setData(lastGeojsonRef.current);
        if (!hasCalledMapDataReadyRef.current) {
          const onIdle = () => {
            if (!hasCalledMapDataReadyRef.current) {
              hasCalledMapDataReadyRef.current = true;
              onMapDataReadyRef.current?.();
            }
            map.off('idle', onIdle);
          };
          map.once('idle', onIdle);
        }
      }
    });
    return () => {
      if (setDataRafRef.current != null) {
        cancelAnimationFrame(setDataRafRef.current);
        setDataRafRef.current = null;
      }
    };
  }, [mapReady, geojson]);

  useEffect(() => {
    if (!mapReady || !mapRef.current) return;

    const map = mapRef.current;
    const LOGO_BATCH_MS = 180;
    const MAX_CONCURRENT_LOGO_LOADS = 12;
    const nextLoaded = new Set<string>();
    const queue: { slug: string; url: string }[] = [];
    let inFlight = 0;

    for (const s of startups) {
      if (!s.logo?.trim()) continue;
      if (map.hasImage(s.slug)) {
        nextLoaded.add(s.slug);
        continue;
      }
      queue.push({
        slug: s.slug,
        url: `/api/logo?url=${encodeURIComponent(s.logo.trim())}`,
      });
    }
    setLoadedLogoSlugs((prev) =>
      prev.size === nextLoaded.size &&
      [...prev].every((id) => nextLoaded.has(id))
        ? prev
        : nextLoaded,
    );

    function scheduleFlush() {
      if (flushLogoTimeoutRef.current) return;
      flushLogoTimeoutRef.current = setTimeout(() => {
        flushLogoTimeoutRef.current = null;
        flushPendingLogos.current();
      }, LOGO_BATCH_MS);
    }

    function onLogoLoaded(slug: string) {
      pendingLogoSlugsRef.current.add(slug);
      scheduleFlush();
      inFlight--;
      drain();
    }

    function drain() {
      while (inFlight < MAX_CONCURRENT_LOGO_LOADS && queue.length > 0) {
        const { slug, url } = queue.shift()!;
        inFlight++;
        const img = new Image();
        img.onload = () => {
          if (!mapRef.current || mapRef.current.hasImage(slug)) {
            inFlight--;
            drain();
            return;
          }
          try {
            mapRef.current.addImage(slug, imageToIconData(img));
            onLogoLoaded(slug);
          } catch {
            inFlight--;
            drain();
          }
        };
        img.onerror = () => {
          inFlight--;
          drain();
        };
        img.src = url;
      }
    }
    drain();

    return () => {
      if (flushLogoTimeoutRef.current) {
        clearTimeout(flushLogoTimeoutRef.current);
        flushLogoTimeoutRef.current = null;
      }
    };
  }, [mapReady, startups]);

  useEffect(() => {
    if (!mapReady || !mapRef.current || !flyToTarget) return;
    mapRef.current.flyTo({
      center: flyToTarget.center,
      zoom: flyToTarget.zoom,
      duration: 1500,
      essential: true,
    });
  }, [
    mapReady,
    flyToTarget?.center[0],
    flyToTarget?.center[1],
    flyToTarget?.zoom,
  ]);

  return (
    <div
      className='relative h-full w-full'
      style={{ background: 'transparent' }}
    >
      <div
        ref={containerRef}
        className='h-full w-full'
        style={{ background: 'transparent' }}
      />
      <div
        className='pointer-events-none absolute inset-0 z-20'
        style={{ width: '100%', height: '100%' }}
      >
        <RadarSweepOverlay />
      </div>
    </div>
  );
});
