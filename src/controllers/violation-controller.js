const ObjectId = require("mongodb");
const Violations = require("../models/violation");
const violationID = "ID отказа";

const handleError = (res, error) => {
  res.status(500).json({ error });
};

const getViolations = (req, res) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Credentials", "true");
  res.setHeader("Access-Control-Max-Age", "7200");
  res.setHeader("Access-Control-Allow-Headers", "content-type");
  console.log("req.query:", req.query);
  let minY = req.query.fromYear + "-01-01";
  let maxY = req.query.toYear + "-12-31";

  Violations.find({
    $and: [
      {
        "Начало отказа": { $gte: new Date(minY) },
      },
      { "Начало отказа": { $lte: new Date(maxY) } },
    ],
  })
    .then((result) => {
      // console.log(violations);
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
  if (Object.keys(req.body[0]).includes("Ответственный")) {
    // console.log("emptyReasonId in promises", emptyReasonIds);
    promises = req.body.map(function (el) {
      // console.log(emptyReasonIds.includes(el["#"]));
      return Violations.updateOne(
        { "ID отказа": el["#"] },
        [
          {
            $set: {
              "Виновное предприятие": el["Ответственный"].trim(),
              "Место": el["Место"].trim(),
            },
          },
        ],
        { upsert: false }
      );
    });
  }

  // if (Object.keys(req.body[0]).includes("Ответственный")) {
  //   // console.log("emptyReasonId in promises", emptyReasonIds);
  //   promises = req.body.map(function (el) {
  //     // console.log(emptyReasonIds.includes(el["#"]));
  //     Violations.updateOne(
  //       { "ID отказа": el["#"], "Причина 2 ур": { $ne: "" } },
  //       {
  //         $set: {
  //           "Виновное предприятие": el["Ответственный"].trim(),
  //           "Место": el["Место"].trim(),
  //         },
  //       },
  //       { upsert: false }
  //     );
  //   });
  // }

  if (Object.keys(req.body[0]).includes("Виновное предприятие")) {
    promises = req.body.map(function (el) {
      // if (!el["Причина 2 ур"])
      //   el[
      //     "Причина 2 ур"
      //   ] = `Причина не указана. Вина ${el["Виновное предприятие"]} `;
      return Violations.replaceOne(
        { "ID отказа": el["ID отказа"] },
        {
          "ID отказа": el["ID отказа"],
          "Начало отказа": el["Начало отказа"],
          "Категория отказа": el["Категория отказа"],
          "Вид технологического нарушения":
            el["Вид технологического нарушения"],
          "Виновное предприятие": el["Виновное предприятие"],
          "Место": el["Перегон"],
          "Причина 2 ур": el["Причина 2 ур"],
          "Количество грузовых поездов(по месту)":
            el["Количество грузовых поездов(по месту)"],
          "Время грузовых поездов(по месту)": Number(
            (Number(el["Время грузовых поездов(по месту)"]) / 60).toFixed(4)
          ),
          "Количество пассажирских поездов(по месту)":
            el["Количество пассажирских поездов(по месту)"],
          "Время пассажирских поездов(по месту)": Number(
            (Number(el["Время пассажирских поездов(по месту)"]) / 60).toFixed(4)
          ),
          "Количество пригородных поездов(по месту)":
            el["Количество пригородных поездов(по месту)"],
          "Время пригородных поездов(по месту)": Number(
            (Number(el["Время пригородных поездов(по месту)"]) / 60).toFixed(4)
          ),
          "Количество прочих поездов(по месту)":
            el["Количество прочих поездов(по месту)"],
          "Время прочих поездов(по месту)": Number(
            (Number(el["Время прочих поездов(по месту)"]) / 60).toFixed(4)
          ),
        },
        { upsert: true }
      );
    });
  }

  Promise.all(promises).then((results) => {
    console.log("results", results);
    // Все ответы res помещаются в массив
    // const allResponses = results.map((result) => result.body); // предположим, что результат представлен в формате { body: результат }
    let acc0 = { ...results[0] };
    Object.keys(acc0).forEach((key) => {
      acc0[key] = 0;
    });
    // console.log("acc0", acc0);
    // Применение функции accumulatedRes к массиву allResponses
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

    // Передача результата в теле ответа сервера в формате JSON
    res.status(201).json(accumulatedRes);
  });
};

const deleteViolations = (req, res) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Credentials", "true");
  res.setHeader("Access-Control-Max-Age", "7200");
  res.setHeader("Access-Control-Allow-Headers", "content-type");
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
