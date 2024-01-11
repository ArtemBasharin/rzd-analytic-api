const ObjectId = require("mongodb");
const Violations = require("../models/violation");
const violationID = "ID отказа";

function setDateTimezone(dateStr) {
  const parts = dateStr.split(/[. :]/);
  const year = parseInt("20" + parts[2]);
  const month = parseInt(parts[1]) - 1;
  const day = parseInt(parts[0]);
  const hours = parseInt(parts[3]);
  const minutes = parseInt(parts[4]);
  const date = new Date(Date.UTC(year, month, day, hours, minutes));
  return date;
}

function getTrains(inputString) {
  const matchParentheses = inputString.match(/шт\s*\(\s*к учету\s*(\d+)\s*\)/);
  if (matchParentheses && matchParentheses.length > 1) {
    return parseInt(matchParentheses[1]);
  } else {
    const matchNumber = inputString.match(/^\d+/);
    return matchNumber ? parseInt(matchNumber[0]) : 0;
  }
}

function getHours(inputString) {
  const matchNumberInParentheses = inputString.match(
    /\((?:\D*(\d+,\d+)\D*)\s*ч\)/
  );
  if (matchNumberInParentheses) {
    const numberWithDot = matchNumberInParentheses[1].replace(",", ".");
    return parseFloat(numberWithDot) || 0;
  } else {
    const matchNumberBeforeCh = inputString.match(/(\d+,\d+)\s*ч/);
    if (matchNumberBeforeCh) {
      const numberWithDot = matchNumberBeforeCh[1].replace(",", ".");
      return parseFloat(numberWithDot) || 0;
    }
  }
  return 0;
}

const handleError = (res, error) => {
  res.status(500).json({ error });
};

const getViolations = (req, res) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Credentials", "true");
  res.setHeader("Access-Control-Max-Age", "7200");
  res.setHeader("Access-Control-Allow-Headers", "content-type");
  console.log("req.query:", req.query);
  let minY = new Date(`${req.query.fromYear}-01-01T00:00:00.000Z`);
  let maxY = new Date(`${req.query.toYear}-12-31T23:59:59.999Z`);

  Violations.find({
    $and: [
      {
        "Начало отказа": { $gte: minY },
      },
      { "Начало отказа": { $lte: maxY } },
    ],
  })
    .then((result) => {
      // console.log(result);
      res.status(200).json(result);
    })
    .catch((err) => handleError(res, err));
};

const addViolation = (req, res) => {
  const violation = new Violations(req.body);
  violation
    .save()
    .then((result) => {
      res.status(201).json(result);
    })
    .catch((err) => handleError(res, err));
};

const removeDups = (req, res) => {
  Violations.find()
    .then((result) => {
      result.forEach(function (doc) {
        Violations.deleteMany({
          "ID отказа": doc["ID отказа"],
          _id: { $lt: doc._id },
        })
          // .then((res) => console.log(res))
          .catch((err) => handleError(res, err));
      });
    })
    // .then((result) => {
    //   res.status(200).json(result);
    // })
    .catch((err) => handleError(res, err));
};

const addBulkOfViolations = (req, res) => {
  res.header("Access-Control-Allow-Origin", "*");

  Violations.find()
    .then((result) => {
      result.forEach(function (doc) {
        Violations.deleteMany({
          "ID отказа": doc["ID отказа"],
          _id: { $lt: doc._id },
        })
          // .then((res) => console.log(res)) // проверить, без этой строки весь промис не работает
          .catch((err) => handleError(res, err));
      });
    })
    // .then((result) => {
    //   res.status(200).json(result);
    // })
    .catch((err) => handleError(res, err));

  let promises = [];

  // console.log(req.body);
  //common report from new report
  if (Object.keys(req.body[0]).includes("Ответственный")) {
    promises = req.body.map(function (el) {
      let unit = el["Ответственный"]
        .trim()
        .replace(/\n/g, " ")
        .replace(/\s+/g, " ")
        .replace("З-СИБ,", "")
        .replace("ООО «ЛокоТех-Сервис»", "")
        .replace("ООО «СТМ-Сервис»", "")
        .trim();

      //checking of string without symbols
      if (!el["Причина"] || !el["Причина"].trim()) {
        el["Причина"] = `Причина не указана вина ${unit}`;
        console.log(el["Причина"]);
      }
      return Violations.updateOne(
        { "ID отказа": el["#"] },
        [
          {
            $set: {
              "ID отказа": el["#"],
              "Виновное предприятие": unit,
              // "Начало отказа": setDateTimezone(el["Начало"]),
              "Начало отказа": setDateTimezone(
                el["Начало"].trim().replace(/\n/g, " ").replace(/\s+/g, " ")
              ),
              "Место": el["Место"]
                .trim()
                .replace(/\n/g, " ")
                .replace(/\s+/g, " "),
              // "Категория отказа": el["Категория"], //на фронте нужно менять значение поля
              "Причина 2 ур": el["Причина"].replace(/\(\d+\)/g, "").trim(),
              "Количество грузовых поездов(по месту)": getTrains(
                el["Грузовой"]
              ),
              "Время грузовых поездов(по месту)": getHours(el["Грузовой"]),
              "Количество пассажирских поездов(по месту)": getTrains(
                el["Пассажирский"]
              ),
              "Время пассажирских поездов(по месту)": getHours(
                el["Пассажирский"]
              ),
              "Количество пригородных поездов(по месту)": getTrains(
                el["Пригородный"]
              ),
              "Время пригородных поездов(по месту)": getHours(
                el["Пригородный"]
              ),
            },
          },
        ],
        { upsert: true }
      );
    });
  }

  if (Object.keys(req.body[0]).includes("Виновное предприятие")) {
    //common report from report-gen
    promises = req.body.map(function (el) {
      return Violations.updateOne(
        { "ID отказа": el["ID отказа"] },
        [
          {
            $set: {
              "Вид технологического нарушения":
                el["Вид технологического нарушения"],
              "Категория отказа": el["Категория отказа"],
              "Причина 2 ур": el["Причина 2 ур"]
                ? el["Причина 2 ур"]
                : "$Причина 2 ур",
            },
          },
        ],
        { upsert: false }
      );
    });
  }

  Promise.all(promises).then((results) => {
    let acc0 = { ...results[0] };
    Object.keys(acc0).forEach((key) => {
      acc0[key] = 0;
    });
    // console.log("acc0", acc0);
    let accumulatedRes = results.reduce((acc, curr) => {
      for (key in curr) {
        if (curr[key] > 0) acc[key]++;
        else if (curr[key] === null) acc[key];
        else if (curr[key]) acc[key]++;
      }
      // console.log(acc);
      return acc;
    }, acc0);
    // console.log("accumulatedRes", accumulatedRes);
    res.status(201).json(accumulatedRes);
  });
};

const deleteViolations = (req, res) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Max-Age", "7200");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept, Authorization"
  );
  Violations.deleteMany()
    .then((result) => {
      res.status(200).json(result);
    })
    .catch((err) => {
      handleError(res, err);
      res
        .status(500)
        .json({ error: "An error occurred while deleting violations" });
    });
};

const updateViolation = (req, res) => {
  Violations.findByIdAndUpdate(req.params.id, req.body)
    .then((result) => {
      res.status(200).json(result);
    })
    .catch((err) => handleError(res, err));
};

module.exports = {
  getViolations,
  addViolation,
  deleteViolations,
  removeDups,
  updateViolation,
  addBulkOfViolations,
};
