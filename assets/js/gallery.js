/**
 * Photo gallery: a shuffled cell mosaic that loops left to right, forever.
 *
 * Layout lives in CSS - a six-row grid where a landscape frame spans 3x2 cells
 * and a portrait 2x3. Six cells either way, so both orientations cover the same
 * area, and mixing the two shapes is what keeps the wall from looking like a
 * spreadsheet.
 *
 * Packing: three landscapes stacked fill a three-column band exactly, and two
 * portraits fill a two-column band exactly. Only whole bands are emitted, so
 * the column flow never has to skip a slot it cannot fill. Where the counts do
 * not divide evenly the short band is topped up with a repeat, which costs
 * nothing here because the strip repeats anyway.
 *
 * Motion: one cycle of the wall is rendered several times over, end to end, and
 * the track slides steadily leftwards. When it has travelled exactly one cycle
 * it snaps back by that distance - onto identical pixels, so the seam is
 * invisible and the wall simply carries on. Always one direction, never a
 * bounce, and no trailing gap because the leading frames come round again.
 *
 * It holds still while the reader is engaging - pointer over the wall, a caption
 * open, a frame focused, or the tab in the background - and never starts at all
 * under prefers-reduced-motion.
 */
(function () {
  "use strict";

  var gallery = document.querySelector("[data-gallery]");
  if (!gallery) return;

  var tiles = Array.prototype.slice.call(gallery.querySelectorAll("[data-gallery-item]"));
  if (!tiles.length) return;

  var SPEED = 24; // px per second

  function shuffle(list) {
    for (var k = list.length - 1; k > 0; k--) {
      var swap = Math.floor(Math.random() * (k + 1));
      var held = list[k];
      list[k] = list[swap];
      list[swap] = held;
    }
    return list;
  }

  /* ---------------------------------------------------------------- ordering */

  var wide = shuffle(
    tiles.filter(function (tile) {
      return tile.classList.contains("gallery-item--wide");
    })
  );
  var tall = shuffle(
    tiles.filter(function (tile) {
      return tile.classList.contains("gallery-item--tall");
    })
  );

  // Top the short band up with repeats so every band is complete and the cycle
  // has no ragged column to hide.
  function pad(list, size) {
    if (!list.length) return list;
    var remainder = list.length % size;
    if (!remainder) return list;
    for (var n = remainder; n < size; n++) {
      list.push(list[n % list.length].cloneNode(true));
    }
    return list;
  }
  pad(wide, 3);
  pad(tall, 2);

  var bands = [];
  while (wide.length >= 3) bands.push(wide.splice(0, 3));
  while (tall.length >= 2) bands.push(tall.splice(0, 2));

  // A padded band holds a repeat of a photograph that also appears elsewhere. Left
  // to chance the two can land side by side, which reads as a mistake, so order the
  // bands to push any repeat as far from its original as possible. Distance is
  // measured cyclically because the wall wraps.
  function sourcesOf(band) {
    return band.map(function (tile) {
      var img = tile.querySelector("img");
      return img ? img.getAttribute("src") : "";
    });
  }

  function closestRepeat(list) {
    var sets = list.map(sourcesOf);
    var nearest = Infinity;
    for (var a = 0; a < sets.length; a++) {
      for (var c = a + 1; c < sets.length; c++) {
        var shared = sets[a].some(function (src) {
          return sets[c].indexOf(src) !== -1;
        });
        if (shared) nearest = Math.min(nearest, Math.min(c - a, sets.length - (c - a)));
      }
    }
    return nearest;
  }

  var best = null;
  var bestGap = -1;
  for (var attempt = 0; attempt < 60; attempt++) {
    shuffle(bands);
    var gapFound = closestRepeat(bands);
    if (gapFound > bestGap) {
      bestGap = gapFound;
      best = bands.slice();
    }
    if (gapFound >= 3) break; // far enough apart to read as two different frames
  }
  bands = best;

  var cycleTiles = [];
  bands.forEach(function (band) {
    cycleTiles = cycleTiles.concat(band);
  });

  /* ------------------------------------------------------------------ build */

  var track = document.createElement("div");
  track.className = "gallery-track";

  function buildCycle(clone) {
    var cycle = document.createElement("div");
    cycle.className = "gallery-cycle";
    if (clone) {
      // Repeats are decoration; keep them out of the reading and tab order.
      cycle.setAttribute("aria-hidden", "true");
    }
    cycleTiles.forEach(function (tile) {
      var node = clone ? tile.cloneNode(true) : tile;
      if (clone) node.setAttribute("tabindex", "-1");
      cycle.appendChild(node);
    });
    return cycle;
  }

  gallery.textContent = "";
  var first = buildCycle(false);
  track.appendChild(first);
  gallery.appendChild(track);
  gallery.classList.add("is-ready");

  // Enough copies that the track always covers the viewport plus one full cycle
  // of travel, so the snap-back never exposes an edge.
  // Distance to rewind by. The track sets a gap between cycles equal to the grid's
  // own cell gap, so one cycle of travel is the cycle's width *plus* that gap -
  // rewinding by the width alone would shunt the wall sideways on every lap.
  var loopDistance = 0;
  var copies = 1;

  function ensureCopies() {
    var cycleWidth = first.getBoundingClientRect().width;
    if (!cycleWidth) return;
    var trackGap = parseFloat(window.getComputedStyle(track).columnGap) || 0;
    loopDistance = cycleWidth + trackGap;

    var needed = Math.max(2, Math.ceil(gallery.clientWidth / loopDistance) + 1);
    while (copies < needed) {
      track.appendChild(buildCycle(true));
      copies++;
    }
  }

  ensureCopies();
  window.addEventListener("resize", ensureCopies);
  window.addEventListener("load", ensureCopies);
  tiles.forEach(function (tile) {
    var img = tile.querySelector("img");
    if (img && !img.complete) img.addEventListener("load", ensureCopies);
  });

  /* --------------------------------------------------------------- captions */

  function everyTile() {
    return Array.prototype.slice.call(gallery.querySelectorAll("[data-gallery-item]"));
  }

  function clearCaptions() {
    everyTile().forEach(function (tile) {
      tile.classList.remove("is-revealed");
    });
  }

  function anyRevealed() {
    return !!gallery.querySelector(".is-revealed");
  }

  // Captions are a hover affordance, not a control: nothing latches, and a click
  // does nothing at all. A mouse is handled entirely in CSS (:hover). A touch
  // screen has no hover, so a press reveals the caption and lifting hides it
  // again - press and hold to read, let go to carry on.
  // A frame is focusable so keyboard users can bring its caption up, but a mouse
  // click must not focus it: focus pauses the wall, and a click that silently
  // stopped it for good is precisely the behaviour being avoided here.
  gallery.addEventListener("mousedown", function (event) {
    if (event.target.closest("[data-gallery-item]")) event.preventDefault();
  });

  gallery.addEventListener("pointerdown", function (event) {
    if (event.pointerType === "mouse") return;
    var tile = event.target.closest("[data-gallery-item]");
    if (!tile) return;
    clearCaptions();
    tile.classList.add("is-revealed");
  });

  ["pointerup", "pointercancel", "pointerleave"].forEach(function (type) {
    gallery.addEventListener(type, function (event) {
      if (event.pointerType === "mouse") return;
      clearCaptions();
    });
  });

  /* ------------------------------------------------------------------- loop */

  var reduced = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  var hovering = false;
  var focused = false;
  var offset = 0;
  var lastFrame = 0;

  gallery.addEventListener("pointerenter", function (event) {
    if (event.pointerType === "mouse") hovering = true;
  });
  gallery.addEventListener("pointerleave", function (event) {
    if (event.pointerType === "mouse") hovering = false;
  });
  gallery.addEventListener("focusin", function () {
    focused = true;
  });
  gallery.addEventListener("focusout", function () {
    focused = false;
  });

  function frame(now) {
    var elapsed = lastFrame ? Math.min(now - lastFrame, 64) : 0;
    lastFrame = now;

    if (loopDistance > 0 && elapsed && !(hovering || focused || anyRevealed() || document.hidden)) {
      offset += (SPEED * elapsed) / 1000;
      // One cycle on, the pixels under the viewport are identical, so resetting
      // by exactly that distance is invisible.
      if (offset >= loopDistance) offset -= loopDistance;
      track.style.transform = "translate3d(" + -offset + "px, 0, 0)";
    }

    window.requestAnimationFrame(frame);
  }

  if (!reduced) window.requestAnimationFrame(frame);
})();
