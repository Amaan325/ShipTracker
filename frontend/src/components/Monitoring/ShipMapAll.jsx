// src/components/ShipMap/ShipMapAll.jsx
import React, { useMemo, useRef, useState, useEffect } from "react";
import { MapContainer, TileLayer, Tooltip, Popup, Circle } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { createShipIcon, createPortDivIcon } from "../ShipMap/icons";
import { isValidCoordinate, normalizeRotation } from "../ShipMap/utils";
import ShipMarker from "../ShipMap/ShipMarker";
import PortMarker from "../ShipMap/PortMarker";
import { FiMenu, FiX } from "react-icons/fi"; // ✅ Icons for hamburger

const ICON_ROTATION_OFFSET = 0;

// 🌍 Hardcoded ports
const HARD_PORTS = [
  {
    name: "Port of Antwerp",
    unlocode: "BEANR",
    lat: 51.24103401137098,
    lng: 4.40776674956587,
    color: "#f6c600",
    radiusNm: 25,
  },
  {
    name: "Port of Zeebrugge",
    unlocode: "BEZEE",
    lat: 51.32590353698185,
    lng: 3.2171386811590987,
    color: "#e67e22",
    radiusNm: 5.4,
  },
  {
    name: "Port of Rotterdam",
    unlocode: "NLRTM",
    lat: 51.9049101785398,
    lng: 4.484615869557539,
    color: "#3498db",
    radiusNm: 25,
  },
  {
    name: "Port of Valencia",
    unlocode: "ESVLC",
    lat: 39.4445,
    lng: -0.3162,
    color: "#9b59b6",
    radiusNm: 8.1,
  },
  {
    name: "Port of Barcelona",
    unlocode: "ESBCN",
    lat: 41.3526,
    lng: 2.15899,
    color: "#1abc9c",
    radiusNm: 8.1,
  },
  {
    name: "Port of Las Palmas",
    unlocode: "ESLPA",
    lat: 28.1406,
    lng: -15.4103,
    color: "#d35400",
    radiusNm: 8.1,
  },
];

const ShipMapAll = React.memo(function ShipMapAll({ vessels = [] }) {
  const portIcon = useMemo(() => createPortDivIcon(), []);
  const mapRef = useRef(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false); // ✅ For mobile hamburger

  // Keep button state in sync with browser fullscreen
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
    };
  }, []);

  const toggleFullscreen = () => {
    const mapElement = mapRef.current?.getContainer();
    if (!mapElement) return;

    if (!document.fullscreenElement) {
      mapElement.requestFullscreen().catch((err) => {
        console.error(`Error attempting fullscreen: ${err.message}`);
      });
    } else {
      document.exitFullscreen();
    }
  };

  // Default center (first valid vessel or Antwerp)
  const firstValid = vessels.find(
    (v) => isValidCoordinate(v.latitude) && isValidCoordinate(v.longitude)
  );
  const defaultCenter = firstValid
    ? [Number(firstValid.latitude), Number(firstValid.longitude)]
    : [51.24103401137098, 4.40776674956587];

  return (
    <div className="relative">
      <MapContainer
        ref={mapRef}
        center={defaultCenter}
        zoom={6}
        scrollWheelZoom
        className="map-container h-[500px] w-full rounded-2xl overflow-hidden mb-6 relative"
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          maxZoom={18}
          minZoom={3}
        />

        {/* Render all vessels */}
        {vessels.map((vessel) => {
          if (
            !isValidCoordinate(vessel.latitude) ||
            !isValidCoordinate(vessel.longitude)
          )
            return null;

          const rotationRaw = vessel.heading ?? vessel.COG ?? 0;
          const rotation = normalizeRotation(rotationRaw, ICON_ROTATION_OFFSET);
          const shipIcon = createShipIcon(rotation);

          return (
            <ShipMarker
              key={vessel._id}
              lat={Number(vessel.latitude)}
              lng={Number(vessel.longitude)}
              mmsi={vessel.mmsi}
              icon={shipIcon}
              destination={
                vessel.destination ? { name: vessel.destination } : null
              }
              shipName={vessel.name}
              heading={rotationRaw}
              COG={vessel.COG}
            >
              <Popup>
                <div>
                  <strong>{vessel.name}</strong> <br />
                  MMSI: {vessel.mmsi || "-"} <br />
                  Destination: {vessel.destination?.trim() ||
                    "Not available"}{" "}
                  <br />
                  Speed: {vessel.sog || "-"} kn
                </div>
              </Popup>
              <Tooltip direction="top" offset={[0, -20]} opacity={1}>
                {vessel.name}
              </Tooltip>
            </ShipMarker>
          );
        })}

        {/* Render hardcoded ports */}
        {HARD_PORTS.map((port) => (
          <React.Fragment key={port.unlocode}>
            <PortMarker port={port} icon={portIcon}>
              <Popup>
                <div>
                  <strong>{port.name}</strong> <br />
                  UN/LOCODE: {port.unlocode} <br />
                  Radius: {port.radiusNm} Nm
                </div>
              </Popup>
              <Tooltip direction="top" offset={[0, -20]} opacity={1}>
                {port.name}
              </Tooltip>
            </PortMarker>

            {/* Colored radius */}
            <Circle
              center={[port.lat, port.lng]}
              radius={port.radiusNm * 1852} // convert Nm → meters
              pathOptions={{
                color: port.color,
                fillColor: port.color,
                fillOpacity: 0.2,
              }}
            />
          </React.Fragment>
        ))}

        {/* Fullscreen button */}
        <button
          onClick={toggleFullscreen}
          className={`absolute bottom-4 right-4 z-[1001] 
                      w-12 h-12 flex items-center justify-center
                      rounded-full shadow-lg transition-all duration-200
                      text-white text-lg font-bold
                      ${
                        isFullscreen
                          ? "bg-red-500 hover:bg-red-600"
                          : "bg-blue-500 hover:bg-blue-600"
                      }`}
          title={isFullscreen ? "Exit Fullscreen" : "Enter Fullscreen"}
        >
          {isFullscreen ? "✕" : "⛶"}
        </button>

        {/* ✅ Legend for large screens (static) */}
        <div className="absolute top-4 right-4 bg-white bg-opacity-90 shadow-md rounded-lg p-2 text-[12px] z-[2000] hidden md:block">
          <h4 className="font-semibold mb-2 text-sm">Ports</h4>
          <ul className="space-y-1">
            {HARD_PORTS.map((port) => (
              <li key={port.unlocode} className="flex items-center gap-2">
                <span
                  className="inline-block w-3 h-3 rounded-full"
                  style={{ backgroundColor: port.color }}
                ></span>
                {port.name} ({port.unlocode}) – {port.radiusNm} Nm
              </li>
            ))}
          </ul>
        </div>

        {/* ✅ Mobile Hamburger + Sliding Menu */}
        <button
          className="absolute top-4 right-4 z-[2001] p-2 bg-blue-600 text-white rounded-md shadow-md md:hidden"
          onClick={() => setMenuOpen(!menuOpen)}
        >
          {menuOpen ? <FiX size={20} /> : <FiMenu size={20} />}
        </button>

        {/* Sliding Panel for mobile legend */}
        <div
          className={`absolute top-14 right-4 w-56 bg-white shadow-lg rounded-lg transform transition-transform duration-300 z-[2000] p-4 text-sm md:hidden
    ${menuOpen ? "translate-x-0 opacity-100" : "translate-x-full opacity-0"}`}
        >
          <h4 className="font-semibold mb-3">Ports</h4>
          <ul className="space-y-2">
            {HARD_PORTS.map((port) => (
              <li key={port.unlocode} className="flex items-center gap-2">
                <span
                  className="inline-block w-3 h-3 rounded-full"
                  style={{ backgroundColor: port.color }}
                ></span>
                {port.name}
              </li>
            ))}
          </ul>
        </div>
      </MapContainer>
    </div>
  );
});

export default ShipMapAll;
