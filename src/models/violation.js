const mongoose = require("mongoose");
const violationScheme = new mongoose.Schema({
  "ID отказа": {
    type: Number,
    required: true,
  },
  "Начало отказа": {
    type: String,
    required: true,
  },
  "Категория отказа": {
    type: String,
    required: true,
  },
  "Вид технологического нарушения": {
    type: String,
    required: true,
  },
  "Виновное предприятие": {
    type: String,
    required: true,
  },
  "Причина 2 ур": {
    type: String,
    required: true,
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
});

module.exports = mongoose.model("violation", violationScheme);
