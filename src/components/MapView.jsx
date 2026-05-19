import { useEffect, useRef, useState, memo } from "react";
import MapLoadingIndicator from "./MapLoadingIndicator";

const STYLE_LIGHT =
  "https://basemaps.cartocdn.com/gl/positron-gl-style/style.json";
const STYLE_DARK =
  "https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json";
const JAKARTA_CENTER = [106.8, -6.2];
const ROADS_LAYER = "layer-garis-jalan";
const AREA_FILL_LAYER = "layer-tematik-fill";
const AREA_BORDER_LAYER = "layer-border-kelurahan";
const ROUTE_LAYER = "layer-route-line";

const ROUTE_COLOR = "#005BBF";

function getBasemapStyle(isDark) {
  return isDark ? STYLE_DARK : STYLE_LIGHT;
}

function MapView({ activeView, onRoadSelect, onReady, roads, tematic, onAreaSelect, routeData, isDarkMode }) {
  const mapContainerRef = useRef(null);
  const mapRef = useRef(null);
  const maplibreglRef = useRef(null);
  const hasFiredReady = useRef(false);
  const isDarkRef = useRef(isDarkMode);
  const activeViewRef = useRef(activeView);
  const [isLoaded, setIsLoaded] = useState(false);
  const [mapLibLoaded, setMapLibLoaded] = useState(false);

  // Keep refs in sync for use in callbacks
  useEffect(() => { activeViewRef.current = activeView; }, [activeView]);
  useEffect(() => { isDarkRef.current = isDarkMode; }, [isDarkMode]);

  // Step 1: Dynamically load MapLibre (not in initial bundle)
  useEffect(() => {
    let cancelled = false;

    async function loadMapLibre() {
      const [module] = await Promise.all([
        import("maplibre-gl"),
        import("maplibre-gl/dist/maplibre-gl.css"),
      ]);
      if (cancelled) return;
      maplibreglRef.current = module.default;
      setMapLibLoaded(true);
    }

    loadMapLibre();

    return () => {
      cancelled = true;
    };
  }, []);

  // Step 2: Initialize map AFTER MapLibre is loaded
  useEffect(() => {
    const maplibregl = maplibreglRef.current;
    if (!maplibregl || !mapContainerRef.current) return;

    isDarkRef.current = isDarkMode;

    const map = new maplibregl.Map({
      container: mapContainerRef.current,
      style: getBasemapStyle(isDarkMode),
      center: JAKARTA_CENTER,
      zoom: 12,
      pitch: 0,
      bearing: 0,
    });

    const geolocate = new maplibregl.GeolocateControl({
      positionOptions: { enableHighAccuracy: true },
      trackUserLocation: false,
      showUserLocation: true,
      showAccuracyCircle: false,
      showUserHeading: true,
      fitBoundsOptions: { maxZoom: 20, linear: false },
    });

    map.addControl(new maplibregl.NavigationControl(), "bottom-right");
    map.addControl(geolocate, "bottom-right");

    map.on("load", () => {
      map.resize();
      setIsLoaded(true);
    });

    mapRef.current = map;

    return () => {
      map.remove();
      mapRef.current = null;
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mapLibLoaded]);

  // Step 3: Fire onReady when map loaded
  useEffect(() => {
    if (!hasFiredReady.current && isLoaded) {
      hasFiredReady.current = true;
      if (onReady) onReady();
    }
  }, [isLoaded, onReady]);

  // Step 3.5: Watch isDarkMode prop & switch basemap on change
  const prevDarkRef = useRef(isDarkMode);
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !isLoaded) return;

    if (prevDarkRef.current === isDarkMode) return; // skip on mount
    prevDarkRef.current = isDarkMode;

    map.setStyle(getBasemapStyle(isDarkMode));
    map.once("style.load", () => {
      removeAllLayers(map);
      loadCurrentView(map);
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isDarkMode, isLoaded]);

  // Step 4: Switch layers when view toggles / data refreshed
  const routeDataRef = useRef(routeData);
  useEffect(() => { routeDataRef.current = routeData; }, [routeData]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map || !isLoaded) return;

    removeAllLayers(map);
    loadCurrentView(map);

    // Re-draw route di atas layers biar gak ketimpa
    const rd = routeDataRef.current;
    if (rd && rd.length > 0) {
      removeRouteLayer(map);
      drawRoute(map, rd, maplibreglRef.current);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeView, isLoaded, roads, tematic, onRoadSelect, onAreaSelect]);

  // Step 5: Draw route when routeData changes
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !isLoaded) return;

    removeRouteLayer(map);

    if (routeData && routeData.length > 0) {
      drawRoute(map, routeData, maplibreglRef.current);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [routeData, isLoaded]);

  function loadCurrentView(map) {
    if (activeViewRef.current === "road") {
      loadRoadView(map, roads, onRoadSelect);
    } else {
      loadAreaView(map, tematic, onAreaSelect, isDarkRef.current);
    }
  }

  return (
    <>
      <div
        ref={mapContainerRef}
        id="map"
        style={{ width: "100%", height: "100%", position: "absolute", inset: 0 }}
      />
      {!mapLibLoaded && <MapLoadingIndicator />}
    </>
  );
}

function removeRouteLayer(map) {
  if (map.getLayer(ROUTE_OUTLINE_LAYER)) map.removeLayer(ROUTE_OUTLINE_LAYER);
  if (map.getLayer(ROUTE_LAYER)) map.removeLayer(ROUTE_LAYER);
  if (map.getSource("route-data")) map.removeSource("route-data");
}

const ROUTE_OUTLINE_LAYER = "layer-route-outline";

function drawRoute(map, path, maplibregl) {
  const coordinates = path.map((p) => [p.lng, p.lat]);

  const geojson = {
    type: "FeatureCollection",
    features: [
      {
        type: "Feature",
        geometry: { type: "LineString", coordinates },
      },
    ],
  };

  map.addSource("route-data", { type: "geojson", data: geojson });

  // White outline — biar gak nyatu sama roads di bawahnya
  map.addLayer({
    id: ROUTE_OUTLINE_LAYER,
    type: "line",
    source: "route-data",
    layout: { "line-join": "round", "line-cap": "round" },
    paint: {
      "line-color": "#ffffff",
      "line-width": 12,
      "line-opacity": 0.95,
    },
  });

  // Colored route line on top of outline
  map.addLayer({
    id: ROUTE_LAYER,
    type: "line",
    source: "route-data",
    layout: { "line-join": "round", "line-cap": "round" },
    paint: {
      "line-color": ROUTE_COLOR,
      "line-width": 7,
      "line-opacity": 0.95,
    },
  });

  if (coordinates.length > 0) {
    const bounds = coordinates.reduce(
      (b, coord) => b.extend(coord),
      new maplibregl.LngLatBounds(coordinates[0], coordinates[0]),
    );
    map.fitBounds(bounds, { padding: 80, maxZoom: 16 });
  }
}

function removeAllLayers(map) {
  const allLayerIds = [ROADS_LAYER, AREA_FILL_LAYER, AREA_BORDER_LAYER];
  allLayerIds.forEach((id) => {
    if (map.getLayer(id)) map.removeLayer(id);
  });
  const allSourceIds = ["data-jalan", "kelurahan-jakarta"];
  allSourceIds.forEach((id) => {
    if (map.getSource(id)) map.removeSource(id);
  });
}

async function loadRoadView(map, roads, onRoadSelect) {
  if (!roads || roads.length === 0) return;

  function onRoadClick(e) {
    if (onRoadSelect) onRoadSelect(e.features[0].properties);
  }
  function onRoadEnter() { map.getCanvas().style.cursor = "pointer"; }
  function onRoadLeave() { map.getCanvas().style.cursor = ""; }

  const geojsonData = {
    type: "FeatureCollection",
    features: roads.map((item) => ({
      type: "Feature",
      geometry: item.geometry,
      properties: {
        id: item.id,
        name: item.name,
        kelurahan: item.kelurahan,
        sensor_referensi: item.sensor_referensi,
        pos_curah_hujan: item.pos_curah_hujan,
        b_score: item.b_score,
        r_score: item.r_score,
        h_score: item.h_score,
        score: item.score,
        color: item.color,
      },
    })),
  };

  map.addSource("data-jalan", { type: "geojson", data: geojsonData });
  map.addLayer({
    id: ROADS_LAYER,
    type: "line",
    source: "data-jalan",
    layout: { "line-join": "round", "line-cap": "round" },
    paint: {
      "line-color": [
        "case",
        [">=", ["get", "score"], 70], "#BA1A1A",
        [">=", ["get", "score"], 40], "#FFBA52",
        "#34C759",
      ],
      "line-width": 8,
      "line-opacity": 0.4,
    },
  });

  map.on("click", ROADS_LAYER, onRoadClick);
  map.on("mouseenter", ROADS_LAYER, onRoadEnter);
  map.on("mouseleave", ROADS_LAYER, onRoadLeave);
}

async function loadAreaView(map, tematic, onAreaSelect, isDark) {
  if (!tematic || !tematic.features || tematic.features.length === 0) return;

  function onAreaClick(e) {
    if (onAreaSelect) onAreaSelect(e.features[0].properties);
  }
  function onAreaEnter() { map.getCanvas().style.cursor = "pointer"; }
  function onAreaLeave() { map.getCanvas().style.cursor = ""; }

  const borderColor = isDark ? "#333333" : "#ffffff";

  map.addSource("kelurahan-jakarta", { type: "geojson", data: tematic });
  map.addLayer({
    id: AREA_FILL_LAYER,
    type: "fill",
    source: "kelurahan-jakarta",
    paint: { "fill-color": ["get", "risk_color"], "fill-opacity": 0.3 },
  });
  map.addLayer({
    id: AREA_BORDER_LAYER,
    type: "line",
    source: "kelurahan-jakarta",
    paint: { "line-color": borderColor, "line-width": 2 },
  });

  map.on("click", AREA_FILL_LAYER, onAreaClick);
  map.on("mouseenter", AREA_FILL_LAYER, onAreaEnter);
  map.on("mouseleave", AREA_FILL_LAYER, onAreaLeave);
}

export default memo(MapView);
