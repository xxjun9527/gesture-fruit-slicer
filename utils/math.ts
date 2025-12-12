import { Point, Entity } from '../types';

export const randomRange = (min: number, max: number) => Math.random() * (max - min) + min;

export const distance = (p1: Point, p2: Point) => {
  return Math.sqrt(Math.pow(p2.x - p1.x, 2) + Math.pow(p2.y - p1.y, 2));
};

// Check if a line segment (p1-p2) intersects a circle (center, radius)
export const lineIntersectsCircle = (p1: Point, p2: Point, circle: Entity): boolean => {
  const cx = circle.x;
  const cy = circle.y;
  const r = circle.radius;

  // Check if either point is inside (simple case)
  const d1 = distance(p1, { x: cx, y: cy });
  const d2 = distance(p2, { x: cx, y: cy });
  if (d1 <= r || d2 <= r) return true;

  // Vector from p1 to p2
  const dx = p2.x - p1.x;
  const dy = p2.y - p1.y;
  
  // If line is a point
  if (dx === 0 && dy === 0) return false;

  // Calculate the t that minimizes the distance
  const t = ((cx - p1.x) * dx + (cy - p1.y) * dy) / (dx * dx + dy * dy);

  // Check if the closest point is on the segment
  if (t < 0 || t > 1) return false;

  // Closest point on line segment
  const closestX = p1.x + t * dx;
  const closestY = p1.y + t * dy;

  const distToLine = distance({ x: closestX, y: closestY }, { x: cx, y: cy });
  return distToLine <= r;
};

// Get the angle of the cut for visual splitting
export const getAngle = (p1: Point, p2: Point) => {
  return Math.atan2(p2.y - p1.y, p2.x - p1.x);
};
