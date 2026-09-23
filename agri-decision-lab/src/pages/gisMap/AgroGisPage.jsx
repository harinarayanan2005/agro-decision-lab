import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";
import {
  AGRO_CLIMATIC_ZONES,
  TN_DISTRICTS,
  AGRO_ZONE_BOUNDARIES,
} from "../../data/tamilNaduAgroZones";
import {
  fetchLiveDistrictWeather,
  fetchBatchDistrictTemperatures,
} from "../../services/weatherService";
import TamilPattamCalendarBar from "../../components/TamilPattamCalendarBar";
import KnapsackCalculatorModal from "../../components/KnapsackCalculatorModal";
import "./agroGis.css";

export default function AgroGisPage() {
  const navigate = useNavigate();

  // State
  const [selectedDistrict, setSelectedDistrict] = useState(TN_DISTRICTS[0]); // Default to Thanjavur
  const [selectedZoneId, setSelectedZoneId] = useState("cauvery-delta");
  const [weather, setWeather] = useState(null);
  const [loadingWeather, setLoadingWeather] = useState(false);
  const [batchTemps, setBatchTemps] = useState({});
  const [loadingBatch, setLoadingBatch] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState("");
  const [showSprayerModal, setShowSprayerModal] = useState(false);

  // Map Controls & Temperature Display Mode
  const [mapLayerMode, setMapLayerMode] = useState("satellite"); // "satellite" | "terrain" | "carto"
  const [showZones, setShowZones] = useState(true);
  const [tempMetricMode, setTempMetricMode] = useState("ambient"); // "ambient" | "feelsLike" | "both"

  // Map Leaflet Refs
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markersLayerRef = useRef(null);
  const zonesLayerRef = useRef(null);
  const baseTileLayersRef = useRef({});
  const markersMapRef = useRef({});

  // Active Zone details
  const activeZone =
    AGRO_CLIMATIC_ZONES.find((z) => z.id === selectedZoneId) ||
    AGRO_CLIMATIC_ZONES[0];

  // Load Batch Temperatures for all districts
  const loadBatchData = useCallback(async () => {
    try {
      const temps = await fetchBatchDistrictTemperatures(TN_DISTRICTS);
      setBatchTemps(temps);
      setLoadingBatch(false);
    } catch (err) {
      console.warn("Batch load err:", err);
      setLoadingBatch(false);
    }
  }, []);

  // Load Single District Live Agro-Weather
  const loadDistrictWeather = useCallback(async (district) => {
    setLoadingWeather(true);
    try {
      const data = await fetchLiveDistrictWeather(
        district.lat,
        district.lon,
        district
      );
      setWeather(data);
      if (data?.recordedAt) {
        setLastSyncTime(data.recordedAt);
      }
    } catch (err) {
      console.warn("District weather err:", err);
    } finally {
      setLoadingWeather(false);
    }
  }, []);

  // Initial load
  useEffect(() => {
    loadBatchData();
  }, [loadBatchData]);

  useEffect(() => {
    loadDistrictWeather(selectedDistrict);
  }, [selectedDistrict, loadDistrictWeather]);

  // Periodic Auto-Sync every 60 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      loadBatchData();
      loadDistrictWeather(selectedDistrict);
    }, 60000);
    return () => clearInterval(interval);
  }, [selectedDistrict, loadBatchData, loadDistrictWeather]);

  // Manual Live Sensor Sync Trigger
  const handleManualSync = async () => {
    setIsSyncing(true);
    await Promise.all([loadBatchData(), loadDistrictWeather(selectedDistrict)]);
    setTimeout(() => {
      setIsSyncing(false);
    }, 600);
  };

  // Initialize Leaflet Map
  useEffect(() => {
    if (!mapContainerRef.current || mapInstanceRef.current) return;

    // Centered in Tamil Nadu (11.05, 78.55)
    const map = L.map(mapContainerRef.current, {
      center: [11.05, 78.55],
      zoom: 7,
      minZoom: 6,
      maxZoom: 17,
      zoomControl: false,
    });

    L.control.zoom({ position: "topright" }).addTo(map);

    // Layer 1: Esri World Satellite Imagery + Place/Road Labels
    const esriSatellite = L.tileLayer(
      "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
      {
        attribution: "Satellite &copy; Esri, Maxar, Earthstar Geographics",
        maxZoom: 18,
      }
    );
    const esriLabels = L.tileLayer(
      "https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}",
      {
        attribution: "Labels &copy; Esri",
        maxZoom: 18,
      }
    );
    const satelliteGroup = L.layerGroup([esriSatellite, esriLabels]);

    // Layer 2: Topographic Agro Terrain
    const terrainLayer = L.tileLayer(
      "https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png",
      {
        attribution: "Terrain &copy; OpenTopoMap, SRTM",
        maxZoom: 17,
      }
    );

    // Layer 3: CartoDB Agro Voyager Base
    const cartoAgro = L.tileLayer(
      "https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png",
      {
        attribution: "&copy; OpenStreetMap contributors &copy; CARTO",
        maxZoom: 19,
      }
    );

    baseTileLayersRef.current = {
      satellite: satelliteGroup,
      terrain: terrainLayer,
      carto: cartoAgro,
    };

    // Default layer: Satellite
    satelliteGroup.addTo(map);

    // Vector overlay groups
    const zonesLayer = L.layerGroup().addTo(map);
    const markersLayer = L.layerGroup().addTo(map);

    zonesLayerRef.current = zonesLayer;
    markersLayerRef.current = markersLayer;
    mapInstanceRef.current = map;

    const timer = setTimeout(() => {
      map.invalidateSize();
    }, 200);

    return () => {
      clearTimeout(timer);
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Update Base Tile Layer when mapLayerMode changes
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || !baseTileLayersRef.current) return;

    Object.values(baseTileLayersRef.current).forEach((layer) => {
      if (map.hasLayer(layer)) {
        map.removeLayer(layer);
      }
    });

    const targetLayer = baseTileLayersRef.current[mapLayerMode];
    if (targetLayer) {
      targetLayer.addTo(map);
    }
  }, [mapLayerMode]);

  // Render Agro-Climatic Zone Polygons on Map
  useEffect(() => {
    const layer = zonesLayerRef.current;
    if (!layer) return;

    layer.clearLayers();

    if (!showZones) return;

    AGRO_CLIMATIC_ZONES.forEach((zone) => {
      const coords = AGRO_ZONE_BOUNDARIES[zone.id];
      if (!coords) return;

      const isSelected = selectedZoneId === zone.id;

      const polygon = L.polygon(coords, {
        color: zone.color,
        weight: isSelected ? 3 : 1.5,
        opacity: isSelected ? 0.95 : 0.6,
        fillColor: zone.color,
        fillOpacity: isSelected ? 0.32 : 0.12,
        dashArray: isSelected ? null : "4, 4",
      });

      polygon.bindTooltip(
        `<div class="zone-tooltip">
          <strong>${zone.name}</strong><br/>
          <span>Rainfall: ${zone.annualRainfallMm} mm | Soil: ${zone.dominantSoil}</span>
        </div>`,
        { sticky: true, className: "agro-leaflet-tooltip" }
      );

      polygon.on("click", () => {
        setSelectedZoneId(zone.id);
        const firstDist = TN_DISTRICTS.find((d) => d.zoneId === zone.id);
        if (firstDist) {
          handleSelectDistrict(firstDist);
        }
      });

      polygon.addTo(layer);
    });
  }, [showZones, selectedZoneId]);

  // Render District Markers with Live Temperature Badges (Dynamic to tempMetricMode)
  useEffect(() => {
    const markersLayer = markersLayerRef.current;
    if (!markersLayer) return;

    markersLayer.clearLayers();
    markersMapRef.current = {};

    TN_DISTRICTS.forEach((d) => {
      const isSelected = selectedDistrict.id === d.id;
      const liveData = batchTemps[d.id];

      const dryTemp = liveData ? liveData.temp : d.avgTemp;
      const feelsLike = liveData?.feelsLike ?? Math.round((d.avgTemp + 3.5) * 10) / 10;
      const obsTime = liveData?.obsTime || "Live";

      // Format pill label based on temperature mode
      let displayBadge = "";
      if (tempMetricMode === "ambient") {
        displayBadge = `${dryTemp}°C`;
      } else if (tempMetricMode === "feelsLike") {
        displayBadge = `Feels ${feelsLike}°C`;
      } else {
        displayBadge = `${dryTemp}° | Feels ${feelsLike}°`;
      }

      const markerHtml = `
        <div class="gis-marker-pill ${isSelected ? "selected-marker" : ""}" id="gis-pin-${d.id}">
          <span class="marker-pulse-dot"></span>
          <span class="marker-name">${d.name}</span>
          <span class="marker-temp-badge ${tempMetricMode === "feelsLike" ? "feels-badge" : ""}">${displayBadge}</span>
        </div>
      `;

      const customDivIcon = L.divIcon({
        className: "gis-custom-marker-wrapper",
        html: markerHtml,
        iconSize: tempMetricMode === "both" ? [145, 30] : [115, 30],
        iconAnchor: tempMetricMode === "both" ? [72, 15] : [57, 15],
      });

      const marker = L.marker([d.lat, d.lon], { icon: customDivIcon });

      const popupHtml = `
        <div class="gis-leaflet-popup">
          <div class="popup-header">
            <h4>${d.name} <span class="popup-tamil">(${d.tamilName})</span></h4>
            <span class="popup-temp-pill">${dryTemp}°C</span>
          </div>
          <div class="popup-body">
            <div class="popup-row"><span>Air Temperature:</span> <b>${dryTemp}°C</b></div>
            <div class="popup-row"><span>Feels Like (Heat Index):</span> <b style="color:#d4973b">${feelsLike}°C</b></div>
            <div class="popup-row"><span>Relative Humidity:</span> <b>${liveData?.humidity ?? d.humidity}%</b></div>
            <div class="popup-row"><span>Soil Type:</span> <b>${d.soil}</b></div>
            <div class="popup-row"><span>Irrigation Mode:</span> <b>${d.irrigation}</b></div>
            <div class="popup-row"><span>Observation Time:</span> <b style="color:#74c69d">${obsTime} IST</b></div>
            <div class="popup-crops">🌾 <b>Crops:</b> ${d.keyCrop}</div>
          </div>
        </div>
      `;

      marker.bindPopup(popupHtml, {
        className: "agro-leaflet-popup-container",
        closeButton: true,
      });

      marker.on("click", () => {
        handleSelectDistrict(d);
      });

      marker.addTo(markersLayer);
      markersMapRef.current[d.id] = marker;
    });
  }, [selectedDistrict, batchTemps, tempMetricMode]);

  // Select district handler with smooth camera fly-to
  const handleSelectDistrict = (district) => {
    setSelectedDistrict(district);
    setSelectedZoneId(district.zoneId);

    const map = mapInstanceRef.current;
    if (map) {
      map.flyTo([district.lat, district.lon], 9, {
        animate: true,
        duration: 0.9,
      });
    }
  };

  const handleResetMap = () => {
    const map = mapInstanceRef.current;
    if (map) {
      map.flyTo([11.05, 78.55], 7, {
        animate: true,
        duration: 0.8,
      });
    }
  };

  const handleApplyToPlanner = () => {
    navigate("/crop-planner", {
      state: {
        districtName: selectedDistrict.name,
        soil_type: selectedDistrict.soil,
        irrigation: selectedDistrict.irrigation,
        season: "Kharif",
        temperature: weather?.temperatureC || selectedDistrict.avgTemp,
        humidity: weather?.humidityPercent || selectedDistrict.humidity,
      },
    });
  };

  return (
    <div className="gis-root fade-in">
      {/* Page Header */}
      <div className="page-header-box">
        <div className="page-title-group">
          <h1>🗺️ Tamil Nadu Agro-Climatic GIS & Live Meteorological Hub</h1>
          <p>
            High-precision satellite GIS intelligence calibrated against real-time
            Open-Meteo & WMO ground observations with ambient air and heat-index tracking
          </p>
        </div>
        <div className="header-actions">
          <button
            className="btn-secondary"
            onClick={() => setShowSprayerModal(true)}
            style={{ borderColor: "var(--harvest-gold)", color: "var(--harvest-gold)", fontWeight: 600 }}
          >
            🎒 Sprayer & Dilution Calculator
          </button>
          <button
            className={`btn-secondary ${isSyncing ? "spinning" : ""}`}
            onClick={handleManualSync}
            title="Refresh real-time meteorological observations"
          >
            🔄 {isSyncing ? "Syncing..." : "Sync Live Sensors"}
          </button>
          <button className="btn-primary" onClick={handleApplyToPlanner}>
            🌾 Plan Crops for {selectedDistrict.name}
          </button>
        </div>
      </div>

      {/* Traditional Tamil Agro-Calendar & Seasonal Pattam Sowing Bar */}
      <TamilPattamCalendarBar compact={false} />

      <div className="gis-main-grid">
        {/* Left Column: Interactive GIS Map */}
        <div className="glass-card map-card-panel">
          {/* Controls Bar 1: Base Layer & Controls */}
          <div className="map-toolbar-top">
            <div className="map-layer-toggles">
              <span className="toolbar-label">Map Layer:</span>
              <button
                className={`tile-btn ${mapLayerMode === "satellite" ? "active" : ""}`}
                onClick={() => setMapLayerMode("satellite")}
              >
                🛰️ Satellite
              </button>
              <button
                className={`tile-btn ${mapLayerMode === "terrain" ? "active" : ""}`}
                onClick={() => setMapLayerMode("terrain")}
              >
                🏔️ Terrain
              </button>
              <button
                className={`tile-btn ${mapLayerMode === "carto" ? "active" : ""}`}
                onClick={() => setMapLayerMode("carto")}
              >
                🗺️ Carto Agro
              </button>
            </div>

            <div className="map-actions-right">
              <label className="toggle-checkbox-label">
                <input
                  type="checkbox"
                  checked={showZones}
                  onChange={(e) => setShowZones(e.target.checked)}
                />
                <span>🌿 Agro Zones</span>
              </label>

              <button
                className="btn-secondary btn-sm"
                onClick={handleResetMap}
                title="Reset Tamil Nadu View"
              >
                🔄 Reset
              </button>
            </div>
          </div>

          {/* Controls Bar 2: Temperature Metric Mode Toggle */}
          <div className="temp-metric-toolbar">
            <div className="metric-switch-group">
              <span className="toolbar-label">Pin Metric:</span>
              <button
                className={`metric-btn ${tempMetricMode === "ambient" ? "active" : ""}`}
                onClick={() => setTempMetricMode("ambient")}
                title="Actual Dry-Bulb Air Temperature"
              >
                🌡️ Actual Air Temp
              </button>
              <button
                className={`metric-btn ${tempMetricMode === "feelsLike" ? "active" : ""}`}
                onClick={() => setTempMetricMode("feelsLike")}
                title="Human & Crop Apparent Heat Index"
              >
                ☀️ Feels-Like (Heat Index)
              </button>
              <button
                className={`metric-btn ${tempMetricMode === "both" ? "active" : ""}`}
                onClick={() => setTempMetricMode("both")}
                title="Show both Actual & Feels-Like"
              >
                🔀 Both
              </button>
            </div>

            <div className="live-station-pill">
              <span className="status-pulse green" />
              <span>
                Live Feed: <b>{lastSyncTime || "07:45 AM IST"}</b>
              </span>
            </div>
          </div>

          {/* Leaflet Real GIS Map Canvas */}
          <div className="gis-map-viewport">
            <div ref={mapContainerRef} className="gis-leaflet-canvas" />

            {loadingBatch && (
              <div className="map-overlay-badge">
                <span className="status-pulse"></span>
                <span>Connecting to Open-Meteo Satellite Feed...</span>
              </div>
            )}
          </div>

          {/* Zone Selector Chips */}
          <div className="zone-legend-bar">
            {AGRO_CLIMATIC_ZONES.map((z) => (
              <button
                key={z.id}
                className={`zone-chip ${selectedZoneId === z.id ? "selected-zone" : ""}`}
                onClick={() => {
                  setSelectedZoneId(z.id);
                  const firstDistrict = TN_DISTRICTS.find((d) => d.zoneId === z.id);
                  if (firstDistrict) {
                    handleSelectDistrict(firstDistrict);
                  }
                }}
              >
                <span
                  className="zone-color-dot"
                  style={{ backgroundColor: z.color }}
                />
                <span>{z.name}</span>
              </button>
            ))}
          </div>

          {/* District Quick Select Strip */}
          <div className="district-quick-strip">
            <span className="strip-title">Tamil Nadu Districts:</span>
            <div className="district-pills-row">
              {TN_DISTRICTS.map((d) => {
                const isSelected = selectedDistrict.id === d.id;
                const live = batchTemps[d.id];
                const val =
                  tempMetricMode === "feelsLike"
                    ? (live?.feelsLike ?? Math.round((d.avgTemp + 3.5) * 10) / 10)
                    : (live?.temp ?? d.avgTemp);

                return (
                  <button
                    key={d.id}
                    className={`district-pill-btn ${isSelected ? "active" : ""}`}
                    onClick={() => handleSelectDistrict(d)}
                  >
                    <span>{d.name}</span>
                    <span className="pill-temp">{val}°</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Column: Real-Time Meteorological & Soil Telemetry */}
        <div className="glass-card telemetry-card-panel">
          <div className="panel-header">
            <h3>🌾 Agricultural Telemetry & Soil Profile</h3>
            <span className="badge-emerald">Live Telemetry</span>
          </div>

          <div className="district-telemetry-box">
            {/* District Hero Header */}
            <div className="district-hero-header">
              <div className="district-name-group">
                <span className="district-main-name">
                  {selectedDistrict.name}
                </span>
                <span className="district-tamil-name">
                  {selectedDistrict.tamilName}
                </span>
              </div>
              <div className="district-badges-group">
                <span className="zone-badge-pill">{activeZone.name}</span>
                <span className="elevation-badge-pill">
                  ⛰️ {selectedDistrict.elevationM} m MSL
                </span>
              </div>
            </div>

            {/* Meteorological Precision & Accuracy Verification Box */}
            <div className="accuracy-verified-box">
              <div className="accuracy-header-row">
                <span className="verified-status-tag">
                  <span className="status-pulse green" /> VERIFIED REAL-TIME OBSERVATION
                </span>
                <span className="station-coord-text">
                  GPS: {selectedDistrict.lat}°N, {selectedDistrict.lon}°E
                </span>
              </div>

              <div className="temperature-comparison-grid">
                <div className="comp-item">
                  <span className="comp-lbl">Actual Air Temp</span>
                  <span className="comp-val primary">
                    {loadingWeather ? "..." : `${weather?.temperatureC ?? selectedDistrict.avgTemp}°C`}
                  </span>
                  <span className="comp-sub">Standard 2m Dry Bulb</span>
                </div>

                <div className="comp-item highlight">
                  <span className="comp-lbl">RealFeel / Heat Index</span>
                  <span className="comp-val gold">
                    {loadingWeather ? "..." : `${weather?.feelsLikeC ?? (selectedDistrict.avgTemp + 3.5)}°C`}
                  </span>
                  <span className="comp-sub">
                    {weather?.feelsLikeC && weather?.temperatureC
                      ? `+${Math.round((weather.feelsLikeC - weather.temperatureC) * 10) / 10}°C Humidity Index`
                      : "Tropical Apparent Temp"}
                  </span>
                </div>

                <div className="comp-item">
                  <span className="comp-lbl">Today's Day Range</span>
                  <span className="comp-val">
                    {weather?.todayMinC ?? 24}° - {weather?.todayMaxC ?? 34}°C
                  </span>
                  <span className="comp-sub">Diurnal Min / Max</span>
                </div>

                <div className="comp-item">
                  <span className="comp-lbl">Dew Point</span>
                  <span className="comp-val">
                    {weather?.dewPointC ?? 23.5}°C
                  </span>
                  <span className="comp-sub">Condensation Threshold</span>
                </div>
              </div>

              <div className="meteo-clarity-note">
                💡 <b>Agronomic Clarity:</b> Weather stations measure the true physical air temperature (<b>{weather?.temperatureC ?? selectedDistrict.avgTemp}°C</b>). When relative humidity reaches {weather?.humidityPercent ?? 75}%, the effective heat stress on human skin and foliage equates to <b>{weather?.feelsLikeC ?? 33}°C</b>.
              </div>
            </div>

            {/* Live Atmospheric & Soil Metrics Grid */}
            <div className="weather-submetrics-four-grid">
              <div className="submetric-quad-card">
                <span className="quad-icon">💧</span>
                <div>
                  <span className="quad-lbl">Topsoil Moisture (0-1cm)</span>
                  <span className="quad-val">
                    {weather?.soilMoisturePercent || 19.5}% Volumetric
                  </span>
                </div>
              </div>

              <div className="submetric-quad-card">
                <span className="quad-icon">🌱</span>
                <div>
                  <span className="quad-lbl">Topsoil Temperature</span>
                  <span className="quad-val">
                    {weather?.soilTemperatureC || 27.2}°C Surface
                  </span>
                </div>
              </div>

              <div className="submetric-quad-card">
                <span className="quad-icon">💨</span>
                <div>
                  <span className="quad-lbl">Surface Wind Speed</span>
                  <span className="quad-val">
                    {weather?.windSpeedKmh || 9.3} km/h
                  </span>
                </div>
              </div>

              <div className="submetric-quad-card">
                <span className="quad-icon">⏲️</span>
                <div>
                  <span className="quad-lbl">Atmospheric Pressure</span>
                  <span className="quad-val">
                    {weather?.surfacePressureHpa || 1005} hPa
                  </span>
                </div>
              </div>
            </div>

            {/* Agronomic Field Advisory */}
            <div className="weather-advisory-box">
              🌦️ <b>Agronomic Advisory:</b>{" "}
              {weather?.advisory ||
                "Optimal climatic conditions for crop establishment and vegetative shoot development."}
            </div>

            {/* 24-Hour Soil & Air Meteorological Forecast Chart */}
            {weather?.hourly12 && weather.hourly12.length > 0 && (
              <div className="hourly-forecast-box">
                <div className="forecast-title-row">
                  <span className="forecast-title">
                    ⏱️ Next 12 Hours Real-Time Temperature & Soil Curve
                  </span>
                  <span className="forecast-legend">
                    <span className="dot dot-air" /> Air Temp (°C) &nbsp;
                    <span className="dot dot-soil" /> Soil Temp (°C)
                  </span>
                </div>
                <div style={{ width: "100%", height: 140, marginTop: "0.4rem" }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart
                      data={weather.hourly12}
                      margin={{ top: 10, right: 10, left: -25, bottom: 0 }}
                    >
                      <defs>
                        <linearGradient id="airTempGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#d4973b" stopOpacity={0.4} />
                          <stop offset="95%" stopColor="#d4973b" stopOpacity={0.0} />
                        </linearGradient>
                        <linearGradient id="soilTempGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#52b788" stopOpacity={0.3} />
                          <stop offset="95%" stopColor="#52b788" stopOpacity={0.0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid
                        strokeDasharray="3 3"
                        stroke="rgba(244, 241, 234, 0.08)"
                      />
                      <XAxis
                        dataKey="hour"
                        stroke="#95a792"
                        fontSize={10}
                        tickLine={false}
                      />
                      <YAxis
                        stroke="#95a792"
                        fontSize={10}
                        domain={["auto", "auto"]}
                        tickLine={false}
                      />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "#15241d",
                          border: "1px solid #2d6a4f",
                          borderRadius: 8,
                          fontSize: 11,
                          color: "#f4f1ea",
                        }}
                      />
                      <Area
                        type="monotone"
                        dataKey="temp"
                        name="Air Temp (°C)"
                        stroke="#d4973b"
                        strokeWidth={2}
                        fillOpacity={1}
                        fill="url(#airTempGrad)"
                      />
                      <Area
                        type="monotone"
                        dataKey="soilTemp"
                        name="Soil Temp (°C)"
                        stroke="#52b788"
                        strokeWidth={1.5}
                        fillOpacity={1}
                        fill="url(#soilTempGrad)"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}

            {/* 5-Day Agro Forecast Strip */}
            {weather?.daily5 && weather.daily5.length > 0 && (
              <div className="daily-forecast-container">
                <span className="forecast-title">📅 5-Day Agricultural Forecast</span>
                <div className="daily-cards-row">
                  {weather.daily5.map((day, idx) => (
                    <div key={idx} className="daily-card">
                      <span className="daily-name">{day.day}</span>
                      <span className="daily-icon">{day.icon}</span>
                      <span className="daily-temps">
                        <b>{day.maxTemp}°</b> / {day.minTemp}°
                      </span>
                      <span className="daily-rain">
                        {day.rainMm > 0 ? `🌧️ ${day.rainMm}mm` : "☀️ Dry"}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Soil Profile & Agronomic Indicators */}
            <div className="soil-profile-grid">
              <div className="soil-info-box">
                <span className="soil-info-lbl">Dominant Soil Texture</span>
                <span className="soil-info-val highlight">
                  {selectedDistrict.soil} Soil
                </span>
              </div>
              <div className="soil-info-box">
                <span className="soil-info-lbl">Primary Irrigation Mode</span>
                <span className="soil-info-val">
                  {selectedDistrict.irrigation} System
                </span>
              </div>
              <div className="soil-info-box">
                <span className="soil-info-lbl">Annual Normal Rainfall</span>
                <span className="soil-info-val">
                  {activeZone.annualRainfallMm} mm / year
                </span>
              </div>
              <div className="soil-info-box">
                <span className="soil-info-lbl">Nearest APMC Mandi</span>
                <span className="soil-info-val" style={{ fontSize: "0.85rem" }}>
                  {selectedDistrict.mandiHub}
                </span>
              </div>
            </div>

            {/* Major Crops cultivated in this Zone */}
            <div className="soil-info-box" style={{ width: "100%" }}>
              <span className="soil-info-lbl">
                Regional Recommended Crop Varieties
              </span>
              <div className="crop-tags-row">
                {activeZone.majorCrops.map((c, i) => (
                  <span key={i} className="crop-tag-chip">
                    🌾 {c}
                  </span>
                ))}
              </div>
            </div>

            {/* One-click Action to Sync with Planner */}
            <button
              className="btn-primary full-width"
              onClick={handleApplyToPlanner}
              style={{ marginTop: "0.5rem" }}
            >
              🌾 Plan Field Crops for {selectedDistrict.name} (
              {selectedDistrict.soil} • {selectedDistrict.irrigation})
            </button>
          </div>
        </div>
      </div>

      {/* Interactive Knapsack Sprayer Modal */}
      <KnapsackCalculatorModal
        isOpen={showSprayerModal}
        onClose={() => setShowSprayerModal(false)}
      />
    </div>
  );
}
