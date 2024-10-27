const mongoose = require('mongoose')
require('dotenv').config()

const url = process.env.MONGO_URI

mongoose.set('strictQuery', false)

mongoose
  .connect(url)
  .then(() => {
    console.log('connected')
  })
  .catch((error) => {
    console.log(error, 'error happened')
  })

const phonebookSchema = new mongoose.Schema({
  name: { type: String, minLength: 3, required: true, unique: true },
  number: {
    type: String,
    required: true,
    minLength: 8,
    validate: {
      validator: function (v) {
        return /^\d{2,3}-\d+$/.test(v)
      },
      message: 'Invalid number format. Please use XX-XXXXXX or XXX-XXXXXXXXXX.',
    },
  },
  date: Date,
})
phonebookSchema.set('toJSON', {
  transform: (doc, returned) => {
    returned.id = returned._id.toString()
    delete returned._id
    delete returned.__v
    delete returned.date
  },
})
const Contact = new mongoose.model('Contact', phonebookSchema)
console.log(Contact)

module.exports = mongoose.model('Contact', phonebookSchema)
