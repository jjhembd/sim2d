'use strict';

import * as rasterMap from 'rastermap';
import { params } from "./mapbox-satellite.js";
import * as projection from "./proj-mercator.js";
import { initRenderer } from "./renderer.js";

export function main() {
  // Setup 2D map: Get canvas for WebGL
  const canvas = document.getElementById("rasterCanvas");

  // Initialize rendering context
  const renderer = initRenderer(canvas);

  // Get overlay canvas for drawing bounding boxes
  const overlay = document.getElementById("vectorCanvas").getContext("2d");

  // Now initialize the map
  const map = rasterMap.init(params, renderer.ctx2d, overlay);

  // Handle a supplied bounding box
  var westDeg = document.getElementById("west");
  var eastDeg = document.getElementById("east");
  var northDeg = document.getElementById("north");
  var southDeg = document.getElementById("south");
  var bboxSet = document.getElementById("bboxSet");
  bboxSet.addEventListener("click", function(click) {
    var p1 = [];
    projection.lonLatToXY( p1, 
        [toRadians(westDeg.value), toRadians(northDeg.value)] );
    var p2 = [];
    projection.lonLatToXY( p2,
        [toRadians(eastDeg.value), toRadians(southDeg.value)] );
    map.fitBoundingBox(p1, p2);
  }, false);

  function toRadians(degrees) {
    return degrees * Math.PI / 180.0;
  };

  // Setup panning controls
  var up = document.getElementById("up");
  up.addEventListener("click", function(click) { map.move(0, 0, -1); }, false);
  var down = document.getElementById("down");
  down.addEventListener("click", function(click) { map.move(0, 0, 1); }, false);
  var left = document.getElementById("left");
  left.addEventListener("click", function(click) { map.move(0, -1, 0); }, false);
  var right = document.getElementById("right");
  right.addEventListener("click", function(click) { map.move(0, 1, 0); }, false);

  // Setup zoom controls
  var zoomIn = document.getElementById("zoomIn");
  zoomIn.addEventListener("click", function(click) { map.move(1, 0, 0); }, false);
  var zoomOut = document.getElementById("zoomOut");
  zoomOut.addEventListener("click", function(click) { map.move(-1, 0, 0); }, false);

  // Track loading status
  var loaded = document.getElementById("completion");
  // Start animation loop
  requestAnimationFrame(checkRender);
  function checkRender(time) {
    var mapChanged = map.drawTiles();
    if (mapChanged) renderer.draw();
    var percent = map.loaded() * 100;
    if (percent < 100) {
      loaded.innerHTML = "Loading: " + percent.toFixed(0) + "%";
    } else {
      loaded.innerHTML = "Complete! " + percent.toFixed(0) + "%";
    }
    requestAnimationFrame(checkRender);
  }
}
