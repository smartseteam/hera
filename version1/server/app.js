const Koa = require('koa')
const Router = require('koa-router')
const joi = require('joi')
const validate = require('koa-joi-validate')
const search = require('./search')


const app = new Koa()
const router = new Router()

// Log each request to the console
app.use(async (ctx, next) => {
  const start = Date.now()
  await next()
  const ms = Date.now() - start
  console.log(`${ctx.method} ${ctx.url} - ${ms}`)
})

// Log percolated errors to the console
app.on('error', err => {
  console.error('Server Error', err)
})

// Set permissive CORS header
app.use(async (ctx, next) => {
  ctx.set('Access-Control-Allow-Origin', '*')
  return next()
})

// ADD ENDPOINTS HERE
/**
 * GET /search
 * Search for a term in the library
 * Query Params -
 * term: string under 60 characters
 * offset: positive integer
 */
router.get('/search',
  validate({
    query: {
      term: joi.string().max(60).required(),
      offset: joi.number().integer().min(0).default(0),
      study: joi.string().max(60).required(),
      select: joi.string().max(60).required()
    }
  }),
  async (ctx, next) => {
    const { term, offset, study, select  } = ctx.request.query
    ctx.body = await search.queryTerm(term, offset, select, study)
    
  }
)

/**
 * GET /keywords
 * Get a range of keywords from the specified study
 * Query Params -
 * studyTitle: string under 256 characters
 * start: positive integer
 * end: positive integer greater than start
 */

router.get('/keywords',
  validate({
    query: {
      studyTitle: joi.string().max(256).required(),
      start: joi.number().integer().min(0).default(0),
      end: joi.number().integer().greater(joi.ref('start')).default(10)
    }
  }),
  async (ctx, next) => {
    const { studyTitle, start, end } = ctx.request.query
    ctx.body = await search.getKeywords(studyTitle, start, end)
  }
)


const port = process.env.PORT || 3000

app
  .use(router.routes())
  .use(router.allowedMethods())
  .listen(port, err => {
    if (err) throw err
    console.log(`App Listening on Port ${port}`)
  })