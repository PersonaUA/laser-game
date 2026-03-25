// Coordinate system: X left-right, Z front-back (top of screen = negative Z)
// Game field: X: -4..4, Z: -7..7
// Laser fixed at (0,0,6.5), fires in -Z direction
// angle = Y-rotation in degrees (0 = mirror face +Z, 45 = deflects ray to +X)

export const levels = [
  {
    id: 1,
    objects: [
      { id: 'M1', type: 'mirror', x: 0.5, z: 1, angle: 10 },
    ],
    target: { x: 3.5, z: 1 },
    maxScore: 100,
  },
  {
    id: 2,
    objects: [
      { id: 'M1', type: 'mirror', x: 0, z: 2, angle: 135 },
      { id: 'M2', type: 'mirror', x: -3, z: 2, angle: 45 },
    ],
    target: { x: -3, z: -3 },
    maxScore: 150,
  },
  {
    id: 3,
    objects: [
      { id: 'P1', type: 'prism', x: 0, z: 4, angle: 30 },
      { id: 'M1', type: 'mirror', x: 1.5, z: -1, angle: 135 },
    ],
    target: { x: -2, z: -1 },
    maxScore: 200,
  },
  {
    id: 4,
    objects: [
      { id: 'M1', type: 'mirror', x: 0, z: 3, angle: 45 },
      { id: 'O1', type: 'obstacle', x: -1, z: 0 },
      { id: 'M2', type: 'mirror', x: 3.5, z: -1, angle: 135 },
    ],
    target: { x: -2, z: -1 },
    maxScore: 180,
  },
  {
    id: 5,
    objects: [
      { id: 'P1', type: 'prism', x: 0, z: 4, angle: 45 },
      { id: 'M1', type: 'mirror', x: 1, z: 1, angle: 135 },
      { id: 'M2', type: 'mirror', x: -3, z: 2, angle: 45 },
    ],
    target: { x: -2, z: -2 },
    maxScore: 220,
  },
  {
    id: 6,
    objects: [
      { id: 'M1', type: 'mirror', x: 0, z: 3, angle: 45 },
      { id: 'M2', type: 'mirror', x: -3, z: 2, angle: 135 },
      { id: 'M3', type: 'mirror', x: 3.25, z: 5, angle: 50 },
      { id: 'M4', type: 'mirror', x: -2.5, z: -6, angle: 135 },
      { id: 'O1', type: 'obstacle', x: -2.7, z: -1 },
      { id: 'O2', type: 'obstacle', x: 2, z: 4 },
      { id: 'O3', type: 'obstacle', x: -1, z: -1 },
      { id: 'P1', type: 'prism', x: 2, z: 0, angle: 20 },
    ],
    target: { x: -2.5, z: -4 },
    maxScore: 240,
  },
  {
    id: 7,
    objects: [
      { id: 'M1', type: 'mirror', x: 0, z: 2, angle: 45 },
      { id: 'O1', type: 'obstacle', x: 2, z: -1 },
      { id: 'M2', type: 'mirror', x: 3.5, z: 2, angle: 90 },
    ],
    target: { x: 3.5, z: -4 },
    maxScore: 160,
  },
  {
    id: 8,
    objects: [
      { id: 'P1', type: 'prism', x: 0, z: 4, angle: 60 },
      { id: 'M1', type: 'mirror', x: -3, z: 4, angle: 135 },
      { id: 'M2', type: 'mirror', x: -3, z: -2, angle: 45 },
    ],
    target: { x: -1, z: -2 },
    maxScore: 260,
  },
  {
    id: 9,
    objects: [
      { id: 'M1', type: 'mirror', x: 2, z: 3, angle: 135 },
      { id: 'P1', type: 'prism', x: -1, z: 1, angle: 15 },
      { id: 'M2', type: 'mirror', x: -3, z: -2, angle: 45 },
    ],
    target: { x: 1, z: -2 },
    maxScore: 280,
  },
  {
    id: 10,
    objects: [
      { id: 'M1', type: 'mirror', x: 0, z: 4, angle: 45 },
      { id: 'M2', type: 'mirror', x: 3.5, z: 4, angle: 90 },
      { id: 'O1', type: 'obstacle', x: 1.5, z: 1 },
      { id: 'M3', type: 'mirror', x: 3.5, z: -3, angle: 135 },
    ],
    target: { x: 1, z: -3 },
    maxScore: 300,
  },
  {
    id: 11,
    objects: [
      { id: 'P1', type: 'prism', x: 0, z: 5, angle: 30 },
      { id: 'M1', type: 'mirror', x: -3, z: 5, angle: 135 },
      { id: 'O1', type: 'obstacle', x: 0, z: 2 },
      { id: 'M2', type: 'mirror', x: -3, z: 0, angle: 45 },
      { id: 'P2', type: 'prism', x: -1, z: -2, angle: -15 },
    ],
    target: { x: 2, z: -2 },
    maxScore: 350,
  },
  {
    id: 12,
    objects: [
      { id: 'M1', type: 'mirror', x: 0.5, z: 5, angle: 135 },
      { id: 'M2', type: 'mirror', x: -2, z: 5, angle: 45 },
      { id: 'P1', type: 'prism', x: -3, z: 1, angle: 40 },
      { id: 'M3', type: 'mirror', x: 3, z: 1, angle: 90 },
      { id: 'O1', type: 'obstacle', x: 0, z: -2 },
    ],
    target: { x: 2, z: -4 },
    maxScore: 400,
  },
]
