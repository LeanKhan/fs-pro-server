import { Request, Response, Router } from 'express';
import respond from './responseHandler';
import {baseFetch, BaseFetchInt} from './misc';

const routes: RouteConfig[] = [
{
  path: '/search/all',
  action: 'many',
  method: 'get'
},
{
  path: '/search/one',
  action: 'one',
  method: 'get'
}
];

/** --> TODO NEXT
 * 1. Add more routes and functions
 * 2. If the search attribute is an ObjectID use Aggregate instead :-]
 * 3. Select is NOT WORKING
 **/

export function setupRoutes(router: Router, model: string) {
	/** Create basic routes for this model **/

routes.forEach(r => {
  router[r.method](r.path, baseQuery(model, r.action))
})
}

export function baseQuery(model: string, type: 'one' | 'many') {

// turn 'player' to 'Player' ALWAYS :)
model = model.toLowerCase().replace(model.charAt(0).toLowerCase(), model.charAt(0).toUpperCase());

return (req: Request, res: Response) => {
let params = {...req.query};

// take all the special, known-aot properties
let select = params.select;
let populate = params.populate;

delete params.select; delete params.populate;

  let queries: {[key: string]: any} = {};
  for (let param in req.query) {
    if(req.query.hasOwnProperty(param)) {
      queries[param] = req.query[param];
    }
  }

  const options: BaseFetchInt = {
  	select,model, populate: false, query: queries
  }

  let func = baseFetch(options).one;

  if (type.toLowerCase() == 'many'){
  	func = baseFetch(options).many;
  }

  try {
  	func()
      .then((results) => {
        respond.success(res, 200, `${model} fetched successfully`, results);
      })
      .catch((err: any) => {
      	  	console.error(err);
        respond.fail(res, 400, `Error fetching ${model}`, err);
      });
  } catch (err) {
  	console.error(err);
    respond.fail(res, 400, `Error fetching ${model}`, err);
  }
}	
}

interface RouteConfig {
	path: string; method: string, action: 'one' | 'many'
}