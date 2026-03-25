// 2D ray casting in XZ plane

const N_GLASS = 1.5
const FIELD_HALF_X = 5
const FIELD_HALF_Z = 8
const MAX_BOUNCES = 12
const MIRROR_HALF_LEN = 1.1
const PRISM_HW = 1.2
const PRISM_HD = 0.6
const OBSTACLE_HW = 0.8
const OBSTACLE_HD = 0.8
const TARGET_RADIUS = 0.55

const MIRROR_HALF_THICKNESS = 0.06

const EPS = 1e-3

function dot(a, b) { return a.x * b.x + a.z * b.z }
function len(v) { return Math.sqrt(v.x * v.x + v.z * v.z) }
function norm(v) {
  const l = len(v)
  if (l < 1e-12) return { x: 0, z: 0 }
  return { x: v.x / l, z: v.z / l }
}

function reflect(d, n) {
  const d2 = 2 * dot(d, n)
  return norm({ x: d.x - d2 * n.x, z: d.z - d2 * n.z })
}

function refract(d, n, n1, n2) {
  const cosI = -dot(n, d)
  const r = n1 / n2
  const sin2T = r * r * (1 - cosI * cosI)
  if (sin2T > 1) return reflect(d, n)
  const cosT = Math.sqrt(1 - sin2T)
  return norm({
    x: r * d.x + (r * cosI - cosT) * n.x,
    z: r * d.z + (r * cosI - cosT) * n.z,
  })
}

function raySegment(O, D, A, B) {
  const dx = B.x - A.x
  const dz = B.z - A.z
  const det = D.x * dz - D.z * dx
  if (Math.abs(det) < 1e-10) return null

  const tx = A.x - O.x
  const tz = A.z - O.z
  const t = (tx * dz - tz * dx) / det
  const u = (tx * D.z - tz * D.x) / det

  if (t > EPS && u >= 0 && u <= 1) return t
  return null
}

// Перевод world -> local для прямоугольника,
// согласованный с Babylon rotation.y и mirrorEndpoints()
function toLocal(O, D, cx, cz, angle) {
  const c = Math.cos(angle)
  const s = Math.sin(angle)

  const px = O.x - cx
  const pz = O.z - cz

  // local X axis in world = ( cos(a), -sin(a) )
  // local Z axis in world = ( sin(a),  cos(a) )
  const lx = c * px - s * pz
  const lz = s * px + c * pz

  const dx = c * D.x - s * D.z
  const dz = s * D.x + c * D.z

  return { lx, lz, dx, dz }
}

function localNormalToWorld(nLocal, angle) {
  const c = Math.cos(angle)
  const s = Math.sin(angle)
  return norm({
    x: c * nLocal.x + s * nLocal.z,
    z: -s * nLocal.x + c * nLocal.z,
  })
}

// Ray-box intersection; returns entry/exit info or null
function rayBox(O, D, cx, cz, hw, hd, angle) {
  const { lx, lz, dx, dz } = toLocal(O, D, cx, cz, angle)

  const invX = Math.abs(dx) < 1e-12 ? 1e12 : 1 / dx
  const invZ = Math.abs(dz) < 1e-12 ? 1e12 : 1 / dz

  const tx1 = (-hw - lx) * invX
  const tx2 = ( hw - lx) * invX
  const tz1 = (-hd - lz) * invZ
  const tz2 = ( hd - lz) * invZ

  const tMinX = Math.min(tx1, tx2)
  const tMaxX = Math.max(tx1, tx2)
  const tMinZ = Math.min(tz1, tz2)
  const tMaxZ = Math.max(tz1, tz2)

  const tEntry = Math.max(tMinX, tMinZ)
  const tExit  = Math.min(tMaxX, tMaxZ)

  if (tEntry >= tExit || tExit < EPS || tEntry < EPS) return null

  // outward normal of entry face in local space
  const nEntryLocal =
    tMinX > tMinZ
      ? { x: dx < 0 ? 1 : -1, z: 0 }
      : { x: 0, z: dz < 0 ? 1 : -1 }

  const nEntry = localNormalToWorld(nEntryLocal, angle)

  return { tEntry, tExit, nEntry }
}

// Find exit point for a ray starting INSIDE the box
function rayBoxExitFromInside(O, D, cx, cz, hw, hd, angle) {
  const { lx, lz, dx, dz } = toLocal(O, D, cx, cz, angle)

  const invX = Math.abs(dx) < 1e-12 ? 1e12 : 1 / dx
  const invZ = Math.abs(dz) < 1e-12 ? 1e12 : 1 / dz

  const tx1 = (-hw - lx) * invX
  const tx2 = ( hw - lx) * invX
  const tz1 = (-hd - lz) * invZ
  const tz2 = ( hd - lz) * invZ

  const tMaxX = Math.max(tx1, tx2)
  const tMaxZ = Math.max(tz1, tz2)

  const useX = tMaxX > EPS
  const useZ = tMaxZ > EPS
  if (!useX && !useZ) return null

  const tExit = useX && useZ
    ? Math.min(tMaxX, tMaxZ)
    : (useX ? tMaxX : tMaxZ)

  const byX = useX && (!useZ || tMaxX <= tMaxZ)

  // outward normal of exit face in local space
  const nExitLocal = byX
    ? { x: dx > 0 ? 1 : -1, z: 0 }
    : { x: 0, z: dz > 0 ? 1 : -1 }

  const nExit = localNormalToWorld(nExitLocal, angle)

  return { tExit, nExit }
}

// function mirrorEndpoints(obj) {
//   const a = (obj.angle * Math.PI) / 180
//   const tx = Math.cos(a)
//   const tz = -Math.sin(a)

//   return {
//     A: { x: obj.x - MIRROR_HALF_LEN * tx, z: obj.z - MIRROR_HALF_LEN * tz },
//     B: { x: obj.x + MIRROR_HALF_LEN * tx, z: obj.z + MIRROR_HALF_LEN * tz },
//     normal: { x: Math.sin(a), z: Math.cos(a) },
//   }
// }

function closestHit(O, D, objects) {
  let best = null

  for (const obj of objects) {

    // if (obj.type === 'mirror') {
    //   const { A, B, normal } = mirrorEndpoints(obj)
    //   const t = raySegment(O, D, A, B)
    //   if (t && (!best || t < best.t)) {
    //     const effectiveNormal = dot(D, normal) < 0
    //       ? normal
    //       : { x: -normal.x, z: -normal.z }
    //     best = { t, obj, normal: effectiveNormal, kind: 'mirror' }
    //   }
    if (obj.type === 'mirror') {
      const a = (obj.angle * Math.PI) / 180
      const r = rayBox(O, D, obj.x, obj.z, MIRROR_HALF_LEN, MIRROR_HALF_THICKNESS, a)

      if (r && (!best || r.tEntry < best.t)) {
        best = {
          t: r.tEntry,
          obj,
          normal: r.nEntry,
          kind: 'mirror'
        }
      }
    
    } else if (obj.type === 'prism') {
      const a = (obj.angle * Math.PI) / 180
      const r = rayBox(O, D, obj.x, obj.z, PRISM_HW, PRISM_HD, a)
      if (r && (!best || r.tEntry < best.t)) {
        best = { t: r.tEntry, obj, nEntry: r.nEntry, kind: 'prism' }
      }
    } else if (obj.type === 'obstacle') {
      const r = rayBox(O, D, obj.x, obj.z, OBSTACLE_HW, OBSTACLE_HD, 0)
      if (r && (!best || r.tEntry < best.t)) {
        best = { t: r.tEntry, obj, kind: 'obstacle' }
      }
    }
  }

  const walls = [
    { A: { x: -FIELD_HALF_X, z: -FIELD_HALF_Z }, B: { x:  FIELD_HALF_X, z: -FIELD_HALF_Z } },
    { A: { x:  FIELD_HALF_X, z: -FIELD_HALF_Z }, B: { x:  FIELD_HALF_X, z:  FIELD_HALF_Z } },
    { A: { x:  FIELD_HALF_X, z:  FIELD_HALF_Z }, B: { x: -FIELD_HALF_X, z:  FIELD_HALF_Z } },
    { A: { x: -FIELD_HALF_X, z:  FIELD_HALF_Z }, B: { x: -FIELD_HALF_X, z: -FIELD_HALF_Z } },
  ]

  for (const w of walls) {
    const t = raySegment(O, D, w.A, w.B)
    if (t && (!best || t < best.t)) {
      best = { t, obj: null, kind: 'wall' }
    }
  }

  return best
}

export function castLaser(levelData) {
  const objects = levelData.objects.filter(o => o.type !== 'target')
  const target = levelData.target
  const segments = []

  let O = { x: 0, z: 6.5 }
  let D = { x: 0, z: -1 }
  let hitTarget = false

  for (let bounce = 0; bounce < MAX_BOUNCES; bounce++) {
    const tTarget = closestTargetT(O, D, target)
    const hit = closestHit(O, D, objects)

    if (tTarget !== null && (!hit || tTarget <= hit.t)) {
      segments.push({
        start: { ...O },
        end: { x: O.x + D.x * tTarget, z: O.z + D.z * tTarget },
      })
      hitTarget = true
      break
    }

    if (!hit || hit.kind === 'wall') {
      const t = hit ? hit.t : 50
      segments.push({
        start: { ...O },
        end: { x: O.x + D.x * t, z: O.z + D.z * t },
      })
      break
    }

    const hitPt = {
      x: O.x + D.x * hit.t,
      z: O.z + D.z * hit.t,
    }

    if (hit.kind === 'mirror') {
      segments.push({ start: { ...O }, end: { ...hitPt } })
      D = reflect(D, hit.normal)
      O = {
        x: hitPt.x + D.x * EPS,
        z: hitPt.z + D.z * EPS,
      }
    } else if (hit.kind === 'prism') {
      segments.push({ start: { ...O }, end: { ...hitPt } })

      const refractedIn = refract(D, hit.nEntry, 1.0, N_GLASS)

      const insideStart = {
        x: hitPt.x + refractedIn.x * EPS,
        z: hitPt.z + refractedIn.z * EPS,
      }

      const a = (hit.obj.angle * Math.PI) / 180
      const exitInfo = rayBoxExitFromInside(
        insideStart,
        refractedIn,
        hit.obj.x,
        hit.obj.z,
        PRISM_HW,
        PRISM_HD,
        a
      )

      if (!exitInfo) {
        O = insideStart
        D = refractedIn
        continue
      }

      const exitPt = {
        x: insideStart.x + refractedIn.x * exitInfo.tExit,
        z: insideStart.z + refractedIn.z * exitInfo.tExit,
      }

      segments.push({ start: { ...hitPt }, end: { ...exitPt }, inGlass: true })

      D = refract(
        refractedIn,
        { x: -exitInfo.nExit.x, z: -exitInfo.nExit.z },
        N_GLASS,
        1.0
      )

      O = {
        x: exitPt.x + D.x * EPS,
        z: exitPt.z + D.z * EPS,
      }
    } else if (hit.kind === 'obstacle') {
      segments.push({ start: { ...O }, end: { ...hitPt } })
      break
    }
  }

  return { segments, hitTarget }
}

function closestTargetT(O, D, target) {
  const dx = target.x - O.x
  const dz = target.z - O.z
  const tClosest = dx * D.x + dz * D.z
  if (tClosest < EPS) return null

  const px = O.x + D.x * tClosest - target.x
  const pz = O.z + D.z * tClosest - target.z

  if (px * px + pz * pz <= TARGET_RADIUS * TARGET_RADIUS) return tClosest
  return null
}