const express = require('express')
const morgan = require('morgan')
const cors = require('cors')
const app = express()
app.use(express.json())
app.use(cors())
app.use(express.static('dist'))
const People = require('./models/phone')
morgan.token('content', function (req, res) {
  console.log(res)
  return JSON.stringify({ name: req.body.name, number: req.body.number })
})

app.use(morgan('tiny', { skip: (req) => req.method === 'POST' }))

app.use(
  morgan(
    function (tokens, req, res) {
      return [
        tokens.method(req, res),
        tokens.url(req, res),
        tokens.status(req, res),
        tokens.res(req, res, 'content-length'),
        '-',
        tokens['response-time'](req, res),
        'ms',
        tokens.content(req, res),
      ].join(' ')
    },
    {
      skip: (req) => req.method !== 'POST',
    }
  )
)

app.get('/api/persons', (request, response, next) => {
  People.find({})
    .then((persons) => {
      response.json(persons)
    })
    .catch((error) => {
      next(error)
    })
})

const date = new Date()

app.get('/info', (request, response) => {
  People.find({}).then((result) => {
    response.send(`<div>
      <div>info has information for ${result.length} presons</div>
      <div>${date.toString()}</div>
    </div>`)
  })
})

app.get('/api/persons/:id', (request, response, next) => {
  const id = request.params.id
  People.findById(id)
    .then((person) => {
      if (person) {
        response.json(person)
      } else {
        response.status(404).end()
      }
    })
    .catch((error) => {
      next(error)
    })
})

app.delete('/api/persons/:id', (request, response, next) => {
  const id = request.params.id
  People.findByIdAndDelete(id)
    .then(() => {
      console.log('deleted success')
      People.find({}).then((res) => {
        response.json(res)
      })
    })
    .catch((error) => {
      next(error)
    })
})

app.post('/api/persons', (request, response, next) => {
  const person = request.body
  const newPerson = new People({
    name: person.name,
    number: person.number,
    date: new Date(),
  })

  newPerson
    .save()
    .then(() => {
      console.log('person saved')
      People.find({}).then((res) => {
        response.json(res)
      })
    })
    .catch((error) => {
      next(error)
    })
})

app.put('/api/persons/:id', (request, response, next) => {
  const person = request.body
  const id = request.params.id

  People.findByIdAndUpdate(
    id,
    { name: person.name, number: person.number },
    { new: true, runValidators: true, context: 'query' }
  )
    .then((result) => {
      response.json(result)
    })
    .catch((error) => {
      next(error)
    })
})

const errorHandler = (error, request, response, next) => {
  console.error(error)
  if (error.name === 'CastError') {
    response.status(400).send({ error: 'malformatted id' })
  } else if (error.name === 'ValidationError') {
    response.status(400).send({ error: error.message })
  }

  next()
}

app.use(errorHandler)

const PORT = process.env.PORT
app.listen(PORT, () => {
  console.log(`running in server ${PORT}`)
})
