const express = require("express");
const morgan = require("morgan");
const cors = require("cors");
const app = express();
app.use(express.json());
app.use(cors());
app.use(express.static("dist"));
morgan.token("content", function (req, res) {
  return JSON.stringify({ name: req.body.name, number: req.body.number });
});

app.use(morgan("tiny", { skip: (req, res) => req.method === "POST" }));

app.use(
  morgan(
    function (tokens, req, res) {
      return [
        tokens.method(req, res),
        tokens.url(req, res),
        tokens.status(req, res),
        tokens.res(req, res, "content-length"),
        "-",
        tokens["response-time"](req, res),
        "ms",
        tokens.content(req, res),
      ].join(" ");
    },
    {
      skip: (req, res) => req.method !== "POST",
    }
  )
);

let persons = [
  {
    id: "1",
    name: "Arto Hellas",
    number: "040-123456",
  },
  {
    id: "2",
    name: "Ada Lovelace",
    number: "39-44-5323523",
  },
  {
    id: "3",
    name: "Dan Abramov",
    number: "12-43-234345",
  },
  {
    id: "4",
    name: "Mary Poppendieck",
    number: "39-23-6423122",
  },
];

app.get("/api/persons", (request, response) => {
  response.json(persons);
});

const date = new Date();

app.get("/info", (request, response) => {
  response.send(`<div>
      <div>info has information for ${persons.length} presons</div>
      <div>${date.toString()}</div>
    </div>`);
});

app.get("/api/persons/:id", (request, response) => {
  const id = request.params.id;
  const person = persons.find((p) => {
    return p.id === id;
  });
  if (person) {
    response.json(person);
  } else {
    response.status(404).end();
  }
});

app.delete("/api/persons/:id", (request, response) => {
  const id = request.params.id;
  persons = persons.filter((person) => {
    return person.id !== id;
  });
  response.json(persons);
  response.status(204).end();
});

app.post("/api/persons", (request, response) => {
  const person = request.body;
  const used = persons.find((p) => {
    return p.name === person.name;
  });
  if (!person.name) {
    response.json({ error: "you should add name" });
  } else if (!person.number) {
    response.json({ error: "you should add number" });
  } else if (used) {
    response.json({ error: "name should be unique" });
  } else {
    person.id = String(Math.trunc(Math.random() * 123412));
    persons = persons.concat(person);
    response.json(persons);
  }
});

const PORT = process.env.PORT || 3002;
app.listen(PORT, () => {
  console.log(`running in server ${PORT}`);
});
