import Feature from 'ol/Feature.js';
import Map from 'ol/Map.js';
import Point from 'ol/geom/Point.js';
import LineString from 'ol/geom/LineString.js';
import VectorSource from 'ol/source/Vector.js';
import View from 'ol/View.js';
import XYZ from 'ol/source/XYZ.js';
import {Circle as CircleStyle, Fill, Icon, Stroke, Style, Text, RegularShape} from 'ol/style.js';
import {Tile as TileLayer, Vector as VectorLayer} from 'ol/layer.js';
import {getVectorContext} from 'ol/render.js';
import {fromLonLat} from 'ol/proj.js';
import {Draw, Modify} from 'ol/interaction.js';
import {getArea, getLength} from 'ol/sphere.js';

const attributions =
  '<a href="https://www.openstreetmap.org/copyright" target="_blank">&copy; OpenStreetMap contributors</a>';

// Port coordinates
const jnpt = fromLonLat([72.9492, 18.949]);
const chennaiPort = fromLonLat([80.2949, 13.1022]);
const visakhapatnamPort = fromLonLat([83.2875, 17.6868]);
const cochinPort = fromLonLat([76.2673, 9.9658]);
const kandlaPort = fromLonLat([70.2167, 23.0333]);
const mundraPort = fromLonLat([69.7047, 22.8387]);

// Nearby station coordinates (example locations)
const jnptStation1 = fromLonLat([72.85, 19.0]);
const jnptStation2 = fromLonLat([73.05, 18.9]);
const chennaiStation1 = fromLonLat([80.2, 13.0]);
const chennaiStation2 = fromLonLat([80.3, 13.2]);
const visakhapatnamStation1 = fromLonLat([83.2, 17.75]);
const visakhapatnamStation2 = fromLonLat([83.35, 17.6]);
const cochinStation1 = fromLonLat([76.35, 9.9]);
const cochinStation2 = fromLonLat([76.2, 10.05]);
const kandlaStation1 = fromLonLat([70.15, 23.1]);
const kandlaStation2 = fromLonLat([70.3, 22.95]);
const mundraStation1 = fromLonLat([69.65, 22.9]);
const mundraStation2 = fromLonLat([69.75, 22.75]);

const map = new Map({
  target: 'map',
  view: new View({
    center: fromLonLat([78.9629, 20.5937]),
    zoom: 4.8,
    minZoom: 2,
    maxZoom: 19,
  }),
  layers: [
    new TileLayer({
      source: new XYZ({
        attributions: attributions,
        url: 'https://{a-c}.tile.openstreetmap.org/{z}/{x}/{y}.png',
        tileSize: 256,
      }),
    }),
  ],
});

function createCurvedLine(start, end, curveDirection = 1, curvature = 0.3) {
  const dx = end[0] - start[0];
  const dy = end[1] - start[1];
  const midPoint = [(start[0] + end[0]) / 2, (start[1] + end[1]) / 2];
  const normalVector = [-dy, dx];
  const normalLength = Math.sqrt(normalVector[0] ** 2 + normalVector[1] ** 2);
  const controlPoint = [
    midPoint[0] + (curveDirection * curvature * normalVector[0]) / normalLength,
    midPoint[1] + (curveDirection * curvature * normalVector[1]) / normalLength,
  ];

  const curvedLine = [];
  for (let t = 0; t <= 1; t += 0.1) {
    const x =
      (1 - t) * (1 - t) * start[0] +
      2 * (1 - t) * t * controlPoint[0] +
      t * t * end[0];
    const y =
      (1 - t) * (1 - t) * start[1] +
      2 * (1 - t) * t * controlPoint[1] +
      t * t * end[1];
    curvedLine.push([x, y]);
  }
  return curvedLine;
}

function createRiverRoute(port, station1, station2) {
  const route1 = new LineString(createCurvedLine(port, station1));
  const route2 = new LineString(createCurvedLine(port, station2, -1));
  return [
    new Feature({
      type: 'riverRoute',
      geometry: route1,
    }),
    new Feature({
      type: 'riverRoute',
      geometry: route2,
    }),
  ];
}

const riverRoutes = [
  ...createRiverRoute(jnpt, jnptStation1, jnptStation2),
  ...createRiverRoute(chennaiPort, chennaiStation1, chennaiStation2),
  ...createRiverRoute(
    visakhapatnamPort,
    visakhapatnamStation1,
    visakhapatnamStation2,
  ),
  ...createRiverRoute(cochinPort, cochinStation1, cochinStation2),
  ...createRiverRoute(kandlaPort, kandlaStation1, kandlaStation2),
  ...createRiverRoute(mundraPort, mundraStation1, mundraStation2),
];

const position = new Point(riverRoutes[0].getGeometry().getFirstCoordinate());
const geoMarker = new Feature({
  type: 'geoMarker',
  geometry: position,
});

const styles = {
  riverRoute: new Style({
    stroke: new Stroke({
      width: 3,
      color: [0, 127, 255, 0.7],
      lineDash: [1, 5],
    }),
  }),
  geoMarker: new Style({
    image: new CircleStyle({
      radius: 7,
      fill: new Fill({color: 'red'}),
      stroke: new Stroke({
        color: 'white',
        width: 2,
      }),
    }),
  }),
  icon: new Style({
    image: new Icon({
      anchor: [0.5, 1],
      src: 'https://openlayers.org/en/latest/examples/data/icon.png',
      scale: 0.4,
    }),
  }),
  ports: new Style({
    image: new CircleStyle({
      radius: 5,
      fill: new Fill({color: 'blue'}),
      stroke: new Stroke({
        color: 'white',
        width: 2,
      }),
    }),
  }),
};

const portFeatures = [
  new Feature({type: 'ports', geometry: new Point(jnpt)}),
  new Feature({type: 'ports', geometry: new Point(mundraPort)}),
  new Feature({type: 'ports', geometry: new Point(kandlaPort)}),
  new Feature({type: 'ports', geometry: new Point(cochinPort)}),
  new Feature({type: 'ports', geometry: new Point(chennaiPort)}),
  new Feature({type: 'ports', geometry: new Point(visakhapatnamPort)}),
];

const stationFeatures = [
  new Feature({type: 'icon', geometry: new Point(jnptStation1)}),
  new Feature({type: 'icon', geometry: new Point(jnptStation2)}),
  new Feature({type: 'icon', geometry: new Point(chennaiStation1)}),
  new Feature({type: 'icon', geometry: new Point(chennaiStation2)}),
  new Feature({type: 'icon', geometry: new Point(visakhapatnamStation1)}),
  new Feature({type: 'icon', geometry: new Point(visakhapatnamStation2)}),
  new Feature({type: 'icon', geometry: new Point(cochinStation1)}),
  new Feature({type: 'icon', geometry: new Point(cochinStation2)}),
  new Feature({type: 'icon', geometry: new Point(kandlaStation1)}),
  new Feature({type: 'icon', geometry: new Point(kandlaStation2)}),
  new Feature({type: 'icon', geometry: new Point(mundraStation1)}),
  new Feature({type: 'icon', geometry: new Point(mundraStation2)}),
];

const vectorLayer = new VectorLayer({
  source: new VectorSource({
    features: [...riverRoutes, geoMarker, ...portFeatures, ...stationFeatures],
  }),
  style: function (feature) {
    return styles[feature.get('type')];
  },
});

map.addLayer(vectorLayer);

const speedInput = document.getElementById('speed');
const startButton = document.getElementById('start-animation');
let animating = false;
let distance = 0;
let lastTime;
let currentRouteIndex = 0;

function moveFeature(event) {
  const speed = Number(speedInput.value);
  const time = event.frameState.time;
  const elapsedTime = time - lastTime;
  distance = (distance + (speed * elapsedTime) / 1e6) % 2;
  lastTime = time;

  if (distance > 1) {
    distance = 0;
    currentRouteIndex = (currentRouteIndex + 1) % riverRoutes.length;
  }

  const currentRoute = riverRoutes[currentRouteIndex].getGeometry();
  const currentCoordinate = currentRoute.getCoordinateAt(distance);
  position.setCoordinates(currentCoordinate);

  const vectorContext = getVectorContext(event);
  vectorContext.setStyle(styles.geoMarker);
  vectorContext.drawGeometry(position);
  map.render();
}

function startAnimation() {
  animating = true;
  lastTime = Date.now();
  startButton.textContent = 'Stop Animation';
  vectorLayer.on('postrender', moveFeature);
  geoMarker.setGeometry(null);
}

function stopAnimation() {
  animating = false;
  startButton.textContent = 'Start Animation';
  geoMarker.setGeometry(position);
  vectorLayer.un('postrender', moveFeature);
}

startButton.addEventListener('click', function () {
  if (animating) {
    stopAnimation();
  } else {
    startAnimation();
  }
});

speedInput.addEventListener('input', function () {
  if (animating) {
    stopAnimation();
    startAnimation();
  }
});

// New measurement functionality
const typeSelect = document.getElementById('type');
const showSegments = document.getElementById('segments');
const clearPrevious = document.getElementById('clear');

const style = new Style({
  fill: new Fill({
    color: 'rgba(255, 255, 255, 0.2)',
  }),
  stroke: new Stroke({
    color: 'rgba(0, 0, 0, 0.5)',
    lineDash: [10, 10],
    width: 2,
  }),
  image: new CircleStyle({
    radius: 5,
    stroke: new Stroke({
      color: 'rgba(0, 0, 0, 0.7)',
    }),
    fill: new Fill({
      color: 'rgba(255, 255, 255, 0.2)',
    }),
  }),
});

const labelStyle = new Style({
  text: new Text({
    font: '14px Calibri,sans-serif',
    fill: new Fill({
      color: 'rgba(255, 255, 255, 1)',
    }),
    backgroundFill: new Fill({
      color: 'rgba(0, 0, 0, 0.7)',
    }),
    padding: [3, 3, 3, 3],
    textBaseline: 'bottom',
    offsetY: -15,
  }),
  image: new RegularShape({
    radius: 8,
    points: 3,
    angle: Math.PI,
    displacement: [0, 10],
    fill: new Fill({
      color: 'rgba(0, 0, 0, 0.7)',
    }),
  }),
});

const tipStyle = new Style({
  text: new Text({
    font: '12px Calibri,sans-serif',
    fill: new Fill({
      color: 'rgba(255, 255, 255, 1)',
    }),
    backgroundFill: new Fill({
      color: 'rgba(0, 0, 0, 0.4)',
    }),
    padding: [2, 2, 2, 2],
    textAlign: 'left',
    offsetX: 15,
  }),
});

const modifyStyle = new Style({
  image: new CircleStyle({
    radius: 5,
    stroke: new Stroke({
      color: 'rgba(0, 0, 0, 0.7)',
    }),
    fill: new Fill({
      color: 'rgba(0, 0, 0, 0.4)',
    }),
  }),
  text: new Text({
    text: 'Drag to modify',
    font: '12px Calibri,sans-serif',
    fill: new Fill({
      color: 'rgba(255, 255, 255, 1)',
    }),
    backgroundFill: new Fill({
      color: 'rgba(0, 0, 0, 0.7)',
    }),
    padding: [2, 2, 2, 2],
    textAlign: 'left',
    offsetX: 15,
  }),
});

const segmentStyle = new Style({
  text: new Text({
    font: '12px Calibri,sans-serif',
    fill: new Fill({
      color: 'rgba(255, 255, 255, 1)',
    }),
    backgroundFill: new Fill({
      color: 'rgba(0, 0, 0, 0.4)',
    }),
    padding: [2, 2, 2, 2],
    textBaseline: 'bottom',
    offsetY: -12,
  }),
  image: new RegularShape({
    radius: 6,
    points: 3,
    angle: Math.PI,
    displacement: [0, 8],
    fill: new Fill({
      color: 'rgba(0, 0, 0, 0.4)',
    }),
  }),
});

const segmentStyles = [segmentStyle];

const formatLength = function (line) {
  const length = getLength(line);
  let output;
  if (length > 100) {
    output = Math.round((length / 1000) * 100) / 100 + ' km';
  } else {
    output = Math.round(length * 100) / 100 + ' m';
  }
  return output;
};

const formatArea = function (polygon) {
  const area = getArea(polygon);
  let output;
  if (area > 10000) {
    output = Math.round((area / 1000000) * 100) / 100 + ' km\xB2';
  } else {
    output = Math.round(area * 100) / 100 + ' m\xB2';
  }
  return output;
};

let tipPoint;

function styleFunction(feature, segments, drawType, tip) {
  const styles = [];
  const geometry = feature.getGeometry();
  const type = geometry.getType();
  let point, label, line;
  if (!drawType || drawType === type || type === 'Point') {
    styles.push(style);
    if (type === 'Polygon') {
      point = geometry.getInteriorPoint();
      label = formatArea(geometry);
      line = new LineString(geometry.getCoordinates()[0]);
    } else if (type === 'LineString') {
      point = new Point(geometry.getLastCoordinate());
      label = formatLength(geometry);
      line = geometry;
    }
  }
  if (segments && line) {
    let count = 0;
    line.forEachSegment(function (a, b) {
      const segment = new LineString([a, b]);
      const label = formatLength(segment);
      if (segmentStyles.length - 1 < count) {
        segmentStyles.push(segmentStyle.clone());
      }
      const segmentPoint = new Point(segment.getCoordinateAt(0.5));
      segmentStyles[count].setGeometry(segmentPoint);
      segmentStyles[count].getText().setText(label);
      styles.push(segmentStyles[count]);
      count++;
    });
  }
  if (label) {
    labelStyle.setGeometry(point);
    labelStyle.getText().setText(label);
    styles.push(labelStyle);
  }
  if (
    tip &&
    type === 'Point' &&
    !modify.getOverlay().getSource().getFeatures().length
  ) {
    tipPoint = geometry;
    tipStyle.getText().setText(tip);
    styles.push(tipStyle);
  }
  return styles;
}

const modify = new Modify({source: vectorLayer.getSource(), style: modifyStyle});
map.addInteraction(modify);

let draw;

function addInteraction() {
  const drawType = typeSelect.value;
  const activeTip =
    'Click to continue drawing the ' +
    (drawType === 'Polygon' ? 'polygon' : 'line');
  const idleTip = 'Click to start measuring';
  let tip = idleTip;
  draw = new Draw({
    source: vectorLayer.getSource(),
    type: drawType,
    style: function (feature) {
      return styleFunction(feature, showSegments.checked, drawType, tip);
    },
  });
  draw.on('drawstart', function () {
    if (clearPrevious.checked) {
      vectorLayer.getSource().clear();
    }
    modify.setActive(false);
    tip = activeTip;
  });
  draw.on('drawend', function () {
    modifyStyle.setGeometry(tipPoint);
    modify.setActive(true);
    map.once('pointermove', function () {
      modifyStyle.setGeometry();
    });
    tip = idleTip;
  });
  modify.setActive(true);
  map.addInteraction(draw);
}

typeSelect.onchange = function () {
  map.removeInteraction(draw);
  addInteraction();
};

addInteraction();

showSegments.onchange = function () {
  vectorLayer.changed();
  draw.getOverlay().changed();
};

startAnimation();

