const ObjectId = require("mongodb");
const Violations = require("../models/violation");
const violationID = "ID отказа";

function setDateTimezone(dateStr) {
  const parts = dateStr.split(/[. :]/); // Разбиваем строку на части
  // Индексы 2 и 1 соответствуют году и месяцу в строке "22" и "01"
  const year = parseInt("20" + parts[2]); // Преобразуем год в числовой формат
  const month = parseInt(parts[1]) - 1; // Месяцы в JavaScript начинаются с 0, поэтому вычитаем 1
  const day = parseInt(parts[0]);
  const hours = parseInt(parts[3]);
  const minutes = parseInt(parts[4]);
  // Создаем объект даты с учетом московского времени (+3 часа относительно UTC)
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
      console.log(result);
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

  // let emptyReasonIds = Violations.find({
  //   "Причина 2 ур": { $exists: false },
  // }).then((res) => {
  //   // console.log("res", res);
  //   // console.log(Array.from(res.map((el) => el["ID отказа"])));
  //   return Array.from(res.map((el) => el["ID отказа"]));
  //   // console.log("req.body[0]", req.body[0]);
  // });

  let promises = [];

  //correct code
  // if (Object.keys(req.body[0]).includes("Ответственный")) { //common report from new report
  //   // console.log("emptyReasonId in promises", emptyReasonIds);
  //   promises = req.body.map(function (el) {
  //     // console.log(emptyReasonIds.includes(el["#"]));
  //     return Violations.updateOne(
  //       { "ID отказа": el["#"] },
  //       [
  //         {
  //           $set: {
  //             "Виновное предприятие": el["Ответственный"].trim(),
  //             "Место": el["Место"].trim(),
  //           },
  //         },
  //       ],
  //       { upsert: false }
  //     );
  //   });
  // }

  console.log(req.body);
  //common report from new report
  if (Object.keys(req.body[0]).includes("Ответственный")) {
    promises = req.body.map(function (el) {
      return Violations.updateOne(
        { "ID отказа": el["#"] },
        [
          {
            $set: {
              "ID отказа": el["#"],
              "Виновное предприятие": el["Ответственный"]
                .trim()
                .replace(/\n/g, " ")
                .replace(/\s+/g, " "),
              // "Начало отказа": setDateTimezone(el["Начало"]),
              "Начало отказа": setDateTimezone(
                el["Начало"].trim().replace(/\n/g, " ").replace(/\s+/g, " ")
              ),
              "Место": el["Место"]
                .trim()
                .replace(/\n/g, " ")
                .replace(/\s+/g, " "),
              // "Категория отказа": el["Категория"], //на фронте нужно менять значение поля
              "Причина 2 ур": el["Причина"],
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

  //old correct code

  // if (Object.keys(req.body[0]).includes("Виновное предприятие")) {
  //   //common report from report-gen
  //   promises = req.body.map(function (el) {
  //     if (!el["Причина 2 ур"]) {
  //       el["Причина 2 ур"] = el["???????? (???????)"];
  //     }
  //     return Violations.replaceOne(
  //       { "ID отказа": el["ID отказа"] },
  //       {
  //         "ID отказа": el["ID отказа"],
  //         "Начало отказа": setDateTimezone(el["Начало отказа"]),
  //         "Категория отказа": el["Категория отказа"],
  //         "Вид технологического нарушения":
  //           el["Вид технологического нарушения"],
  //         "Виновное предприятие": el["Виновное предприятие"],
  //         "Место": el["Перегон"],
  //         "Причина 2 ур": el["Причина 2 ур"],
  //         "Количество грузовых поездов(по месту)":
  //           el["Количество грузовых поездов(по месту)"],
  //         "Время грузовых поездов(по месту)": Number(
  //           (Number(el["Время грузовых поездов(по месту)"]) / 60).toFixed(4)
  //         ),
  //         "Количество пассажирских поездов(по месту)":
  //           el["Количество пассажирских поездов(по месту)"],
  //         "Время пассажирских поездов(по месту)": Number(
  //           (Number(el["Время пассажирских поездов(по месту)"]) / 60).toFixed(4)
  //         ),
  //         "Количество пригородных поездов(по месту)":
  //           el["Количество пригородных поездов(по месту)"],
  //         "Время пригородных поездов(по месту)": Number(
  //           (Number(el["Время пригородных поездов(по месту)"]) / 60).toFixed(4)
  //         ),
  //         "Количество прочих поездов(по месту)":
  //           el["Количество прочих поездов(по месту)"],
  //         "Время прочих поездов(по месту)": Number(
  //           (Number(el["Время прочих поездов(по месту)"]) / 60).toFixed(4)
  //         ),
  //       },
  //       { upsert: true }
  //     );
  //   });
  // }

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
              "Причина": {
                $cond: {
                  if: { $ne: ["$el['Причина 2 ур']", ""] },
                  then: el["Причина 2 ур"],
                  else: "$Причина",
                },
              },
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
