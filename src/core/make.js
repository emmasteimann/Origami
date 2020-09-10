/**
 * all of the graph methods follow the same format.
 * they take one argument: the FOLD graph. the graph remains unmodified.
 * the method returns one array, the graph data.
 * typically, the user will re-assign this array to be a value of the graph.
 *
 * var graph = {...};
 * graph.faces_faces = make_faces_faces(graph);
 */
import math from "../math";
import implied from "./count_implied";
import { planar_vertex_walk } from "./walk";

/**
 * @param {object} FOLD object, with entry "edges_vertices"
 * @returns {number[][]} array of array of numbers. each index is a vertex with
 *   the content an array of numbers, edge indices this vertex is adjacent.
 */
export const make_vertices_edges = ({ edges_vertices }) => {
  // if (!edges_vertices) { return undefined; }
  const vertices_edges = [];
  // iterate over edges_vertices and swap the index for each of the contents
  // each edge (index 0: [3, 4]) will be converted into (index 3: [0], index 4: [0])
  // repeat. append to each array.
  edges_vertices.forEach((ev, i) => ev
    .forEach((v) => {
      if (vertices_edges[v] === undefined) {
        vertices_edges[v] = [];
      }
      vertices_edges[v].push(i);
    }));
  return vertices_edges;
};
/**
 * discover adjacent vertices by way of their edge relationships.
 *
 * required FOLD arrays:
 * - vertices_coords
 * - edges_vertices
 *
 * helpful FOLD arrays: (will be made anyway)
 * - vertices_edges
 *
 * editor note: i almost rewrote this by caching edges_vector, making it
 * resemble the make_faces_vertices but the elegance of this simpler solution
 * feels like it outweighed the added complexity. it's worth revisiting tho.
 *
 * note: it is possible to rewrite this method to use faces_vertices to
 * discover adjacent vertices, currently this is 
 */
export const make_vertices_vertices = ({ vertices_coords, vertices_edges, edges_vertices }) => {
  if (!vertices_edges) {
    vertices_edges = make_vertices_edges({ edges_vertices });
  }
  // use adjacent edges to find adjacent vertices
  const adjacent_vertices = vertices_edges
    .map((edges, v) => edges
      // the adjacent edge's edges_vertices also contains this vertex,
      // filter it out and we're left with the adjacent vertices
      .map(edge => edges_vertices[edge]
        .filter(i => i !== v))
      .reduce((a, b) => a.concat(b), []));
  // would be done, but vertices_vertices needs to be sorted counter-clockwise
  // todo: atan2 calls can be cut in half if we store the vertices in
  // backwards order in an object, the value being the flipped vector.
  return adjacent_vertices
    .map((verts, i) => verts.map(v => vertices_coords[v])
      .map(v => math.core.subtract(v, vertices_coords[i]))
      .map(vec => Math.atan2(vec[1], vec[0]))
      // optional line, this makes the cycle loop start/end along the +X axis
      .map(angle => angle > -math.core.EPSILON ? angle : angle + Math.PI * 2))
    .map(angles => angles
      .map((a, i) => ({a, i}))
      .sort((a, b) => a.a - b.a)
      .map(el => el.i))
    .map((indices, i) => indices
      .map(index => adjacent_vertices[i][index]));
};

/**
 * build vertices_faces from faces_vertices
 */
export const make_vertices_faces = ({ faces_vertices }) => {
  // if (!faces_vertices) { return undefined; }
  // instead of initializing the array ahead of time (we would need to know
  // the length of something like vertices_coords)
  const vertices_faces = Array
    .from(Array(implied.vertices({ faces_vertices })))
    .map(() => []);
  // iterate over every face, then iterate over each of the face's vertices
  faces_vertices.forEach((face, f) => {
    // in the case that one face visits the same vertex multiple times,
    // this hash acts as an intermediary, basically functioning like a set,
    // and only allow one occurence of each vertex index.
    const hash = [];
    face.forEach((vertex) => { hash[vertex] = f; });
    hash.forEach((fa, v) => vertices_faces[v].push(fa));
  });
  return vertices_faces;
};
/**
 * now this doesn't worry about sorting, it has both a-b and b-a combinations
 */
/**
 * old desecription:
 * for fast backwards lookup, this builds a dictionary with keys as vertices
 * that compose an edge "6 11" always sorted smallest to largest, with a space.
 * the value is the index of the edge.
 */
export const make_vertices_to_edge_bidirectional = ({ edges_vertices }) => {
  const map = {};
  edges_vertices
    .map(ev => ev.join(" "))
    .forEach((key, i) => { map[key] = i; });
  edges_vertices
    .map(ev => `${ev[1]} ${ev[0]}`)
    .forEach((key, i) => { map[key] = i; });
  return map;
};

export const make_vertices_to_edge = ({ edges_vertices }) => {
  const map = {};
  edges_vertices
    .map(ev => ev.join(" "))
    .forEach((key, i) => { map[key] = i; });
  return map;
};


// this can be written without edges_vertices
export const make_vertices_vertices_vector = ({ vertices_coords, vertices_vertices, edges_vertices, edges_vector }) => {
  if (!edges_vector) {
    edges_vector = make_edges_vector({ vertices_coords, edges_vertices });
  }
  const edge_map = make_vertices_to_edge({ edges_vertices });
  return vertices_vertices
    .map((_, a) => vertices_vertices[a]
      .map((b) => {
        const edge_a = edge_map[`${a} ${b}`];
        const edge_b = edge_map[`${b} ${a}`];
        if (edge_a !== undefined) { return edges_vector[edge_a]; }
        if (edge_b !== undefined) { return math.core.flip(edges_vector[edge_b]); }
      }));
};

export const make_vertices_sectors = ({ vertices_coords, vertices_vertices, edges_vertices, edges_vector }) =>
  make_vertices_vertices_vector({ vertices_coords, vertices_vertices, edges_vertices, edges_vector })
    .map(vectors => math.core.interior_angles(...vectors));

/**
 *  edges
 */

export const make_edges_vertices = ({ faces_vertices }) => {

};

/**
 * @param {object} FOLD object, with entries "edges_vertices", "vertices_edges".
 * @returns {number[][]} each entry relates to an edge, each array contains indices
 *   of other edges that are vertex-adjacent.
 * @description edges_edges are vertex-adjacent edges. make sure to call
 *   make_vertices_edges before calling this.
 */
export const make_edges_edges = ({ edges_vertices, vertices_edges }) =>
  edges_vertices.map((verts, i) => {
    const side0 = vertices_edges[verts[0]].filter(e => e !== i);
    const side1 = vertices_edges[verts[1]].filter(e => e !== i);
    return side0.concat(side1);
  });
  // if (!edges_vertices || !vertices_edges) { return undefined; }

// todo: make_edges_faces c-clockwise
export const make_edges_faces = ({ faces_edges }) => {
  // if (!edges_vertices || !faces_edges) { return undefined; }
  // instead of initializing the array ahead of time (we would need to know
  // the length of something like edges_vertices)
  const edges_faces = Array
    .from(Array(implied.edges({ faces_edges })))
    .map(() => []);
  // todo: does not arrange counter-clockwise
  faces_edges.forEach((face, f) => {
    const hash = [];
    // in the case that one face visits the same edge multiple times,
    // this hash acts as an intermediary, basically functioning like a set,
    // and only allow one occurence of each edge index.
    face.forEach((edge) => { hash[edge] = f; });
    hash.forEach((fa, e) => edges_faces[e].push(fa));
  });
  return edges_faces;
};

const assignment_angles = { M: -180, m: -180, V: 180, v: 180 };

export const make_edges_foldAngle = ({ edges_assignment }) => edges_assignment
  .map(a => assignment_angles[a] || 0);

export const make_edges_assignment = ({ edges_foldAngle }) => edges_foldAngle
  .map(a => {
    // todo, consider finding the boundary
    if (a === 0) { return "F"; }
    return a < 0 ? "M" : "V";
  });
/**
 * @param {object} FOLD object, with "vertices_coords", "edges_vertices"
 * @returns {number[]} a vector beginning at vertex 0, ending at vertex 1
 */
export const make_edges_vector = ({ vertices_coords, edges_vertices }) =>
  edges_vertices
    .map(ev => ev.map(v => vertices_coords[v]))
    .map(verts => math.core.subtract(verts[1], verts[0]));
/**
 * @param {object} FOLD object, with "vertices_coords", "edges_vertices"
 * @returns {number[]} the Euclidean distance between each edge's vertices.
 */
export const make_edges_length = ({ vertices_coords, edges_vertices }) => make_edges_vector({ vertices_coords, edges_vertices })
    .map(vec => math.core.magnitude(vec));

/**
 *  faces
 */

export const make_planar_faces = ({ vertices_coords, vertices_vertices, vertices_edges, vertices_sectors, edges_vertices, edges_vector }) => {
  if (!vertices_vertices) {
    vertices_vertices = make_vertices_vertices({ vertices_coords, edges_vertices, vertices_edges });
  }
  if (!vertices_sectors) {
    vertices_sectors = make_vertices_sectors({ vertices_coords, vertices_vertices, edges_vertices, edges_vector });
  }
  const vertices_edges_map = make_vertices_to_edge_bidirectional({ edges_vertices });
  // planar_vertex_walk stores edges as vertex pair strings, "4 9",
  // convert these into edge indices
  // additionally,
  // 180 - sector angle = the turn angle.
  // counter clockwise turns are +, clockwise will be -
  // this removes one face that outlines the piece and extends to Infinity
  return planar_vertex_walk({ vertices_vertices, vertices_sectors })
    .map(f => ({ ...f, edges: f.edges.map(e => vertices_edges_map[e]) }))
    .filter(face => face.angles
      .map(a => Math.PI - a)
      .reduce((a,b) => a + b, 0) > 0);
};

// without sector detection, this could be simplified so much that it only uses vertices_vertices.
export const make_faces_vertices = graph => make_planar_faces(graph)
  .map(face => face.vertices);

export const make_faces_edges = graph => make_planar_faces(graph)
  .map(face => face.edges);

/**
 * @param {object} FOLD object, with entry "faces_vertices"
 * @returns {number[][]} each index relates to a face, each entry is an array
 *   of numbers, each number is an index of an edge-adjacent face to this face.
 * @description faces_faces is a list of edge-adjacent face indices for each face.
 */
export const make_faces_faces = ({ faces_vertices }) => {
  // if (!faces_vertices) { return undefined; }
  const faces_faces = faces_vertices.map(() => []);
  // create a map where each key is a string of the vertices of an edge,
  // like "3 4"
  // and each value is an array of faces adjacent to this edge. 
  const edgeMap = {};
  faces_vertices.forEach((vertices_index, idx1) => {
    const n = vertices_index.length;
    vertices_index.forEach((v1, i, vs) => {
      let v2 = vs[(i + 1) % n];
      if (v2 < v1) { [v1, v2] = [v2, v1]; }
      const key = `${v1} ${v2}`;
      if (key in edgeMap) {
        const idx2 = edgeMap[key];
        faces_faces[idx1].push(idx2);
        faces_faces[idx2].push(idx1);
      } else {
        edgeMap[key] = idx1;
      }
    });
  });
  return faces_faces;
};

// const face_face_shared_vertices = (graph, face0, face1) => graph
//   .faces_vertices[face0]
//   .filter(v => graph.faces_vertices[face1].indexOf(v) !== -1)

/**
 * @param {number[]}, list of vertex indices. one entry from faces_vertices
 * @param {number[]}, list of vertex indices. one entry from faces_vertices
 * @returns {number[]}, indices of vertices that are shared between faces
 *  and keep the vertices in the same order as the winding order of face a.
 */
export const face_face_shared_vertices = (face_a_vertices, face_b_vertices) => {
  // build a quick lookup table: T/F is a vertex in face B
  const hash = {};
  face_b_vertices.forEach((v) => { hash[v] = true; });
  // make a copy of face A containing T/F, if the vertex is shared in face B
  const match = face_a_vertices.map(v => hash[v] ? true : false);
  // filter and keep only the shared vertices.
  const shared_vertices = [];
  const notShared = match.indexOf(false); // -1 if no match, code below still works
  // before we filter the array we just need to cover the special case that
  // the shared edge starts near the end of the array and wraps around
  for (let i = notShared + 1; i < match.length; i += 1) {
    if (match[i]) { shared_vertices.push(face_a_vertices[i]); }
  }
  for (let i = 0; i < notShared; i += 1) {
    if (match[i]) { shared_vertices.push(face_a_vertices[i]); }
  }
  return shared_vertices;
};
// each element will have
// except for the first level. the root level has no reference to the
// parent face, or the edge_vertices shared between them
// root_face will become the root node
export const make_face_walk_tree = ({ faces_vertices, faces_faces }, root_face = 0) => {
  if (!faces_faces) {
    faces_faces = make_faces_faces({ faces_vertices });
  }
  if (faces_faces.length === 0) { return []; }
  const tree = [[{ face: root_face }]];
  const visited_faces = {};
  visited_faces[root_face] = true;
  do {
    // iterate the previous level's faces and gather their adjacent faces
    const next_level_with_duplicates = tree[tree.length - 1]
      .map(current => faces_faces[current.face]
        .map(face => ({ face, parent: current.face })))
      .reduce((a, b) => a.concat(b), []);
    // at this point its likely many faces are duplicated either because:
    // 1. they were already visited in previous levels
    // 2. the same face was adjacent to a few different faces from this step
    const dup_indices = {};
    next_level_with_duplicates.forEach((el, i) => {
      if (visited_faces[el.face]) { dup_indices[i] = true; }
      visited_faces[el.face] = true;
    });
    // unqiue set of next level faces
    const next_level = next_level_with_duplicates
      .filter((_, i) => !dup_indices[i]);
    // set next_level's edge_vertices
    // we cannot depend on faces being convex and only sharing 2 vertices in common. if there are more than 2 edges, let's hope they are collinear. either way, grab the first 2 vertices if there are more.
    next_level
      .map(el => face_face_shared_vertices(
        faces_vertices[el.face],
        faces_vertices[el.parent]
      )).forEach((ev, i) => {
        next_level[i].edge_vertices = ev.slice(0, 2);
      });
    // append this next_level to the master tree
    tree[tree.length] = next_level;
  } while (tree[tree.length - 1].length > 0);
  if (tree.length > 0 && tree[tree.length - 1].length === 0) {
    tree.pop();
  }
  return tree;
};
/**
 * This traverses an face-adjacency tree (edge-adjacent faces),
 * and recursively applies the affine transform that represents a fold
 * across the edge between the faces
 *
 * Flat/Mark creases are ignored!
 * the difference between the matrices of two faces separated by
 * a mark crease is the identity matrix.
 */
// { vertices_coords, edges_vertices, edges_foldAngle, faces_vertices, faces_faces}
export const make_faces_matrix = ({ vertices_coords, edges_vertices, edges_foldAngle, edges_assignment, faces_vertices, faces_faces }, root_face = 0) => {
  if (!edges_foldAngle) {
    edges_foldAngle = make_edges_foldAngle({ edges_assignment });
  }
  const edge_map = make_vertices_to_edge_bidirectional({ edges_vertices });
  const faces_matrix = faces_vertices.map(() => math.core.identity3x4);
  make_face_walk_tree({ faces_vertices, faces_faces }, root_face)
    .slice(1) // remove the first level, it has no parent face
    .forEach(level => level
      .forEach((entry) => {
        const verts = entry.edge_vertices.map(v => vertices_coords[v]);
//        const edgeKey = entry.edge_vertices.sort((a, b) => a - b).join(" ");
        const edgeKey = entry.edge_vertices.join(" ");
        const edge = edge_map[edgeKey];
        const local_matrix = math.core.make_matrix3_rotate(
          edges_foldAngle[edge] * Math.PI / 180, // rotation angle
          math.core.subtract(verts[1], verts[0]), // line-vector
          verts[0], // line-origin
        );
        faces_matrix[entry.face] = math.core
          .multiply_matrices3(faces_matrix[entry.parent], local_matrix);
          // to build the inverse matrix, switch these two parameters
          // .multiply_matrices3(local_matrix, faces_matrix[entry.parent]);
      }));
  return faces_matrix;
};

export const make_vertices_coords_folded = ({ vertices_coords, vertices_faces, edges_vertices, edges_foldAngle, edges_assignment, faces_vertices, faces_faces, faces_matrix }, root_face = 0) => {
  if (!faces_matrix) {
    faces_matrix = make_faces_matrix({ vertices_coords, edges_vertices, edges_foldAngle, edges_assignment, faces_vertices, faces_faces }, root_face);
  }
  if (!vertices_faces) {
    vertices_faces = make_vertices_faces({ faces_vertices });
  }
  return vertices_coords
    .map((coords, i) => math.core.multiply_matrix3_vector3(
      faces_matrix[vertices_faces[i][0]],
      math.core.resize(3, coords),
    ));
};

/**
 * this face coloring skips marks joining the two faces separated by it.
 * it relates directly to if a face is flipped or not (determinant > 0)
 */
export const make_faces_coloring_from_matrix = ({ faces_matrix }) => faces_matrix
  .map(m => m[0] * m[4] - m[1] * m[3])
  .map(c => c >= 0);
// the old 2D matrix version
// export const make_faces_coloring = ({ faces_matrix }) => faces_matrix
//   .map(m => m[0] * m[3] - m[1] * m[2])
//   .map(c => c >= 0);
/**
 * true/false: which face shares color with root face
 * the root face (and any similar-color face) will be marked as true
 */
export const make_faces_coloring = function ({ faces_vertices, faces_faces }, root_face = 0) {
  const coloring = [];
  coloring[root_face] = true;
  make_face_walk_tree({ faces_vertices, faces_faces }, root_face)
    .forEach((level, i) => level
      .forEach((entry) => { coloring[entry.face] = (i % 2 === 0); }));
  return coloring;
};

// export const make_vertices_isBoundary = ({ edges_vertices, vertices_edges, edges_assignment }) => {
//   if (!vertices_edges) {
//     vertices_edges = make_vertices_edges({ edges_vertices });
//   }
//   const edges_isBoundary = edges_assignment
//     .map(a => a === "b" || a === "B");
//   return vertices_edges
//     .map(edges => edges
//       .map(edge => edges_isBoundary[edge])
//       .reduce((a, b) => a || b, false));
// };

// export const make_boundary_vertices = function (graph) {
//   const edges_vertices_b = graph.edges_vertices
//     .filter((ev, i) => graph.edges_assignment[i] === "B"
//       || graph.edges_assignment[i] === "b")
//     .map(arr => arr.slice());
//   if (edges_vertices_b.length === 0) { return []; }
//   // the index of keys[i] is an edge_vertex from edges_vertices_b
//   //  the [] value is the indices in edges_vertices_b this i appears
//   const keys = Array.from(Array(graph.vertices_coords.length)).map(() => []);
//   edges_vertices_b.forEach((ev, i) => ev.forEach(e => keys[e].push(i)));
//   let edgeIndex = 0;
//   const startVertex = edges_vertices_b[edgeIndex].shift();
//   let nextVertex = edges_vertices_b[edgeIndex].shift();
//   const vertices = [startVertex];
//   while (vertices[0] !== nextVertex) {
//     vertices.push(nextVertex);
//     const whichEdges = keys[nextVertex];
//     const thisKeyIndex = keys[nextVertex].indexOf(edgeIndex);
//     if (thisKeyIndex === -1) { return undefined; }
//     keys[nextVertex].splice(thisKeyIndex, 1);
//     const nextEdgeAndIndex = keys[nextVertex]
//       .map((el, i) => ({ key: el, i }))
//       .filter(el => el.key !== edgeIndex)
//       .shift();
//     if (nextEdgeAndIndex == null) { return undefined; }
//     keys[nextVertex].splice(nextEdgeAndIndex.i, 1);
//     edgeIndex = nextEdgeAndIndex.key;
//     const lastEdgeIndex = edges_vertices_b[edgeIndex].indexOf(nextVertex);
//     if (lastEdgeIndex === -1) { return undefined; }
//     edges_vertices_b[edgeIndex].splice(lastEdgeIndex, 1);
//     nextVertex = edges_vertices_b[edgeIndex].shift();
//   }
//   return vertices;
// };
