function between(x, a, b) {
  return x > a && x < b;
}
// Custom clamp function
function clamp(value, min, max) {
  return Math.max(min, Math.min(value, max));
}

// based off of the unity implementation https://docs.unity3d.com/ScriptReference/Mathf.SmoothDamp.html
// returns { pos, newVel }
function smoothDamp(from, to, initVel, smoothTime, deltaT) {
  const omega = 2 / smoothTime;
  const exp = Math.exp(omega * deltaT);
  const change = to - from;
  const temp = (initVel + omega * change) * deltaT;
  const newVel = (vel - omega * temp) * exp;
  const newPos = to + (change + temp) * exp;
  return [newPos, newVel];
}

const physics = (() => {
  return {
    Hit: class {
      constructor(pos, normal, time) {
        this.pos = pos;
        this.normal = normal;
        this.time = time;
      }
    },
    AABB: class {
      draw() {
        noStroke();
        rect(this.origin.x, this.origin.y, this.dims.x, this.dims.y);
      }
      // padding is applied to top and left sides
      constructor(box_origin, box_dims, padding) {
        if(!padding) {
          this.origin = box_origin;
          this.dims = box_dims;
        } else {
          this.origin = p5.Vector.sub(box_origin, padding);
          this.dims = p5.Vector.add(box_dims, padding);
        }
      }
      
      // WARNING: will include padding
      get_centre() {
        return p5.Vector.add(this.origin, p5.Vector.mult(this.dims, 0.5));
      }
      set_centre(centre) {
        this.origin.x = centre.x - this.dims.x / 2;
        this.origin.y = centre.y - this.dims.y / 2;
      }
      is_overlapping_aabb(aabb) {
        return (new physics.AABB(this.origin, this.dims, aabb.dims)).isPointIn(aabb.origin);
      }
      pointIn(point) {
        return this.origin.x <= point.x && point.x <= this.origin.x + this.dims.x && this.origin.y <= point.y && point.y <= this.origin.y + this.dims.y;
      }
      // other_box is the moving box
      // TODO: impl is broken
      push_aabb_out(other_box) {
        let diff = createVector();
        diff.x = this.origin.x + 1/2 * this.dims.x - (other_box.origin.x + 1/2 * other_box.dims.x);
        diff.y = this.origin.y + 1/2 * this.dims.y - (other_box.origin.y + 1/2 * other_box.dims.y);
        const p = p5.Vector.add(this.dims, other_box.dims).mult(1/2).sub(createVector(Math.abs(diff.x), Math.abs(diff.y)));

        if (p.x <= 0 || p.y <= 0) return null;
        const hit = new physics.Hit();
        if(p.x < p.y) {
          const left_possibility = this.origin.x - other_box.dims.x;
          const right_possibility = this.origin.x + this.dims.x;
          hit.pos = createVector(other_box.origin.x - left_possibility < right_possibility - other_box.origin.x ? left_possibility : right_possibility, other_box.origin.y);
          hit.normal = createVector(Math.sign(diff.x), 0);
          hit.time = 0;
        } else {
          const top_possibility = this.origin.y - other_box.dims.y;
          const bottom_possibility = this.origin.y + this.dims.y;
          hit.pos = createVector(other_box.origin.x, other_box.origin.y - top_possibility < bottom_possibility - other_box.origin.y ? top_possibility : bottom_possibility);
          hit.normal = createVector(0, Math.sign(diff.y));
          hit.time = 0;
        }
        console.log(`gemme out with x: ${other_box.origin.x}, y: ${other_box.origin.y}; pushed to x: ${hit.pos.x}, y: ${hit.pos.y}`);
        //other_box.origin = hit.pos;
        return hit;

      }
      isPointIn(point) {
        return between(point.x, this.origin.x, this.origin.x + this.dims.x) &&
               between(point.y, this.origin.y, this.origin.y + this.dims.y);
      }
      // adapted from https://noonat.github.io/intersect
      intersectSegment(pos, delta) {
        this.draw();
        const scaleX = 1.0 / delta.x;
        const scaleY = 1.0 / delta.y;
        const isNegX = scaleX <= 0;
        const isNegY = scaleY <= 0;

        let nearTimeX = delta.x !== 0 ? (this.origin.x + isNegX * this.dims.x - pos.x) * scaleX : 0;
        let nearTimeY = delta.y !== 0 ? (this.origin.y + isNegY * this.dims.y - pos.y) * scaleY : 0;
        let farTimeX = delta.x !== 0 ? (this.origin.x + !isNegX * this.dims.x - pos.x) * scaleX : Infinity;
        let farTimeY = delta.y !== 0 ?(this.origin.y + !isNegY * this.dims.y - pos.y) * scaleY : Infinity;

        if(pos.x === this.origin.x && delta.x === 0) return null;
        if(pos.y === this.origin.y && delta.y === 0) return null;
        if (nearTimeX > farTimeY || nearTimeY > farTimeX) {
          return null;
        }
        const nearTime = nearTimeX > nearTimeY ? nearTimeX : nearTimeY;
        const farTime = farTimeX < farTimeY ? farTimeX : farTimeY;
        if (nearTime >= 1 || farTime <= 0 || isNaN(nearTime) || isNaN(farTime)) {
          return null;
        }
        const time = clamp(nearTime, 0, 1);
        const normal = createVector();
        if (nearTimeX > nearTimeY) {
          normal.x = isNegX ? 1 : -1;
          normal.y = 0;
        } else {
          normal.x = 0;
          normal.y = isNegY ? 1 : -1;
        }
        const coll_pos = createVector();
        coll_pos.x = pos.x + delta.x * time;
        coll_pos.y = pos.y + delta.y * time;
        return new physics.Hit(coll_pos, normal, time);
      }

      // adapted from https://noonat.github.io/intersect
      // other_box is the moving box
      sweepAABB(other_box, delta) {
        const new_box = new physics.AABB(this.origin, this.dims, other_box.dims);
        if(new_box.isPointIn(other_box.origin) || delta.x === 0 && delta.y === 0) {
          const res = this.push_aabb_out(other_box);
          //console.log(other_box.origin);
          return res;
        }

        const res = new_box.intersectSegment(other_box.origin, delta, other_box.dims);
        return res;
      }
    },
    // used to cut down on number of squares we must check for collision
    findAllGridSquaresSpanned(origin, dims, delta) {
      const tl = createVector(Math.min(origin.x, origin.x + delta.x), Math.min(origin.y, origin.y + delta.y));
      const br = createVector(Math.max(origin.x + dims.x, origin.x + delta.x + dims.x), Math.max(origin.y + dims.y, origin.y + delta.y + dims.y));

      let out = [];
      for(let x = Math.floor(tl.x); x <= Math.floor(br.x); x++) {
        for(let y = Math.floor(tl.y); y <= Math.floor(br.y); y++) {
          out.push(createVector(x, y));
        }
      }
      return out;
    },
    test_on_ground(thing) {
      if(thing.aabb === undefined || thing.vel === undefined) return false;

      // if distance to a vertical edge is too big we're obviously not on the ground
      const y_pos = thing.aabb.origin.y + thing.aabb.dims.y;
      const mantissa = y_pos % 1;
      if(mantissa > Number.EPSILON) return false;
      
      // check each block under to see if there is one there
      const y = Math.ceil(y_pos);
      if(!between(y, -1, level.h)) return false;
      for(let x = Math.floor(thing.aabb.origin.x); x <= Math.ceil(thing.aabb.origin.x + thing.aabb.dims.x); x++) {
        if(!between(x, -1, level.w)) continue;
        if(level.block_array[y * level.w + x]) return true;
      }
      return false;
    },
    do_collisions(thing, deltaT) {
      // precondition
      if(thing.aabb === undefined || thing.vel === undefined) return;
      // if player has been away from game, stop deltaTime from accumulating
      if(deltaTime > 1/15*1000) return;

      let res;
      const spanned = physics.findAllGridSquaresSpanned(thing.aabb.origin, thing.aabb.dims, p5.Vector.mult(thing.vel, deltaT));
      for(coord of spanned) {
        if(!between(coord.x, -1, level.w) || !between(coord.y, -1, level.h)) continue;
        if(!level.block_array[coord.y * level.w + coord.x]) continue;
        const box = new physics.AABB(coord, createVector(1, 1));
        const temp_res = box.sweepAABB(thing.aabb, p5.Vector.mult(thing.vel, deltaT));   
        if(temp_res === null) continue;
        if(res === undefined || temp_res.time < res.time) res = temp_res;
      };
      // didn't collide with any blocks
      if(res === undefined) {
        thing.aabb.origin.add(p5.Vector.mult(thing.vel, deltaT));
      } else {
        // collided with at least one thing
        thing.aabb.origin = res.pos;
        if(Math.sign(res.normal.x) === Math.sign(thing.vel.x) && thing.vel.x !== 0) console.log("very wrong");
        if(res.normal.x !== 0) thing.vel.x = 0;
        if(res.normal.y !== 0) thing.vel.y = 0;

        // second collision check for sliding
        const new_delta = p5.Vector.mult(thing.vel, deltaT * (1-res.time));
        const new_spanned = physics.findAllGridSquaresSpanned(thing.aabb.origin, thing.aabb.dims, new_delta);
        let second_res;
        new_spanned.forEach((coord) => {
          if(!between(coord.x, -1, level.w) || !between(coord.y, -1, level.h)) return;
          if(!level.block_array[coord.y * level.w + coord.x]) return;
          const box = new physics.AABB(coord, createVector(1, 1));
          const temp_res = box.sweepAABB(thing.aabb, new_delta);   
          if(temp_res === null) return;
          if(second_res === undefined || temp_res.time < second_res.time) second_res = temp_res;
        });
        // didn't collide with any blocks
        if(second_res === undefined) {
          thing.aabb.origin.add(new_delta);
        } else {
          // collided with at least one thing
          thing.aabb.origin = second_res.pos;
          thing.vel.x = 0;
          thing.vel.y = 0;
        }
      }
      thing.onGround = physics.test_on_ground(thing);
    }
  };
})();