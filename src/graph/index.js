/**
 * Rabbit Ear (c) Robby Kraft
 */
import * as make from "./make";
import * as boundary from "./boundary";
import * as walk from "./walk";
import * as nearest from "./nearest";
import * as fold_object from "./fold_spec";
import * as sort from "./sort";
import * as span from "./span";
import * as maps from "./maps";
import * as query from "./query";
import count from "./count";
import implied from "./count_implied";
import remove from "./remove";
import populate from "./populate";
import assign from "./assign";
import transform from "./affine";
import subgraph from "./subgraph";
import explode_faces from "./explode_faces";
import clip from "./clip";
import fragment from "./fragment";
// import create from "./create";
// add things
import add_vertices from "./add/add_vertices";
import add_vertices_split_edges from "./add/add_vertices_split_edges";
import add_edges from "./add/add_edges";
import split_edge from "./add/split_edge";
import split_face from "./add/split_face";
import flat_fold from "./flat_fold/index";
// clean things
import * as remove_methods from "./clean/index"
import clean from "./clean/clean";
import get_circular_edges from "./clean/edges_circular";
import get_duplicate_edges from "./clean/edges_duplicate";
import get_duplicate_vertices from "./clean/vertices_duplicate";
import get_collinear_vertices from "./clean/vertices_collinear";
import * as vertices_isolated from "./clean/vertices_isolated";
// draw to svg
import svg from "../svg/draw";

export default Object.assign(Object.create(null), {
	// modifiers
	assign,
	// add things
	add_vertices,
	add_vertices_split_edges,
	add_edges,
	split_edge,
	split_face,
	flat_fold,
	// clean things
	clean,
	get_circular_edges,
	get_duplicate_edges,
	get_duplicate_vertices,
	get_collinear_vertices,
	//
	count,
	implied,
	fragment,
	remove,
	populate,
	subgraph,
	explode_faces,
	clip,
	// intersection
	svg,
},
	make,
	// create,
	transform,
	boundary,
	walk,
	nearest,
	fold_object,
	sort,
	span,
	maps,
	query,
	// clean things
	remove_methods,
	vertices_isolated,
);

