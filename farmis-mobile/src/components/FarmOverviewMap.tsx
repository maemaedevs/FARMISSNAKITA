import { createElement, useMemo } from "react";
import type { CSSProperties } from "react";
import { Platform, StyleSheet, View } from "react-native";
import { WebView } from "react-native-webview";

import { Colors } from "@/constants";
import { FARM_OVERVIEW_CENTER, FARM_PLOT_COORDINATES } from "@/constants/farmOverviewMap";

import type { FarmOverviewMapProps } from "./farmOverviewMapTypes";

const ACCENT = Colors.accent;
const ZOOM = 11;

function buildLeafletFarmHtml(
  centerLngLat: [number, number],
  plotsLngLat: [number, number][],
): string {
  const [centerLng, centerLat] = centerLngLat;
  const plotsLatLngJson = JSON.stringify(plotsLngLat.map(([lng, lat]) => [lat, lng]));

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1" />
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.css" crossorigin="anonymous" />
  <style>
    html, body, #map { height: 100%; width: 100%; margin: 0; padding: 0; }
    .leaflet-control-attribution { font-size: 10px !important; }
  </style>
</head>
<body>
  <div id="map"></div>
  <script src="https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.js" crossorigin="anonymous"></script>
  <script>
    (function () {
      var plots = ${plotsLatLngJson};
      var map = L.map("map", { zoomControl: true, attributionControl: true }).setView([${centerLat}, ${centerLng}], ${ZOOM});
      L.tileLayer(
        "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png",
        {
          attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a> &copy; <a href="https://carto.com/attributions">CARTO</a>',
          subdomains: "abcd",
          maxZoom: 20
        }
      ).addTo(map);
      plots.forEach(function (latLng) {
        L.circleMarker(latLng, {
          radius: 9,
          color: "${Colors.white}",
          weight: 2,
          fillColor: "${ACCENT}",
          fillOpacity: 0.95
        }).addTo(map);
      });
    })();
  </script>
</body>
</html>`;
}

const webIframeStyle: CSSProperties = {
  border: "none",
  width: "100%",
  height: "100%",
  flex: 1,
  display: "block",
  backgroundColor: Colors.primaryLight,
};

export function FarmOverviewMap({ style }: FarmOverviewMapProps) {
  const html = useMemo(
    () => buildLeafletFarmHtml(FARM_OVERVIEW_CENTER, FARM_PLOT_COORDINATES),
    [],
  );

  if (Platform.OS === "web") {
    return (
      <View style={[styles.container, style]}>
        {createElement("iframe", {
          title: "Farm overview map",
          srcDoc: html,
          sandbox: "allow-scripts allow-same-origin",
          style: webIframeStyle,
        })}
      </View>
    );
  }

  return (
    <WebView
      originWhitelist={["*"]}
      source={{ html, baseUrl: "https://localhost" }}
      style={[styles.container, style]}
      scrollEnabled={false}
      bounces={false}
      javaScriptEnabled
      domStorageEnabled
      setSupportMultipleWindows={false}
      mixedContentMode="always"
      allowsInlineMediaPlayback
    />
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.primaryLight,
    overflow: "hidden",
  },
});
