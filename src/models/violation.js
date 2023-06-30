const mongoose = require("mongoose");
const violationScheme = new mongoose.Schema({
  "ID отказа": {
    type: Number,
    required: false,
  },
  "Начало отказа": {
    type: String,
    required: false,
  },
  "Категория отказа": {
    type: String,
    required: false,
  },
  "Вид технологического нарушения": {
    type: String,
    required: false,
  },
  "Виновное предприятие": {
    type: String,
    required: false,
  },
  "Причина 2 ур": {
    type: String,
    required: false,
  },
  "Количество грузовых поездов(по месту)": {
    type: Number,
    required: false,
  },
  "Время грузовых поездов(по месту)": {
    type: Number,
    required: false,
  },
  "Количество пассажирских поездов(по месту)": {
    type: Number,
    required: false,
  },
  "Время пассажирских поездов(по месту)": {
    type: Number,
    required: false,
  },
  "Количество пригородных поездов(по месту)": {
    type: Number,
    required: false,
  },
  "Время пригородных поездов(по месту)": {
    type: Number,
    required: false,
  },
  "Количество прочих поездов(по месту)": {
    type: Number,
    required: false,
  },
  "Время прочих поездов(по месту)": {
    type: Number,
    required: false,
  },
  timestamp: { type: Date, default: Date.now() },
});

module.exports = mongoose.model("violation", violationScheme);
