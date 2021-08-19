let express = require("express");
let cors = require("cors");
let upload = require("express-fileupload");
const fs = require("fs");
const Tesseract = require("tesseract.js");

var app = express();
app.use(cors());
app.use(upload());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.get("/", (req, res) => {
  res.send("<h1>OCR</h1>");
});

const recognize = (imgPath, callback) => {
  const { createWorker } = Tesseract;
  const path = require("path");

  const worker = createWorker({
    langPath: path.join(__dirname, "", "lang-data"),
    // logger: (m) => console.log(m),
  });

  (async () => {
    await worker.load();
    await worker.loadLanguage("eng");
    await worker.initialize("eng");
    const {
      data: { text = "" },
    } = await worker.recognize(imgPath);
    callback(text);
    await worker.terminate();
  })();
};

const capturedImage = async (req, res, next) => {
  try {
    const path = __dirname + "/img/ocr_image.jpeg"; // destination image path
    let imgdata = req.body.img; // get img as base64
    const base64Data = imgdata.replace(/^data:([A-Za-z-+/]+);base64,/, ""); // convert base64
    fs.writeFileSync(path, base64Data, { encoding: "base64" }); // write img file
    recognize(path, (text) => {
      res.send({
        text: text,
      });
      appendJsonFile(text);
    });
  } catch (e) {
    next(e);
  }
};

const appendJsonFile = (text) => {
  fs.readFile(
    __dirname + "/img/texts.json",
    "utf8",
    function readFileCallback(err, data) {
      if (err) {
        console.log(err);
      } else {
        let obj = { table: [] };
        obj = data ? JSON.parse(data) : obj; //now it an object
        obj.table.push(text); //add some data
        let json = JSON.stringify(obj); //convert it back to json
        fs.writeFile(__dirname + "/img/texts.json", json, "utf8", () => {}); // write it back
      }
    }
  );
};

app.get("/getTextData", function (req, res, next) {
  var fileName = "texts.json";
  res.sendFile(fileName, { root: __dirname + "/img" }, function (err) {
    if (err) {
      next(err);
    } else {
      // console.log("Sent:", fileName);
    }
  });
});

app.post("/capture", capturedImage);

app.post("/upload", (req, res) => {
  if (req.files) {
    let imageFile = req.files.file;
    let imgFilename = imageFile.name;
    const path = __dirname + "/img/";

    imageFile.mv(path + imgFilename, (err) => {
      if (err) {
        console.log(err);
        res.send(err);
      } else {
        recognize(`${path}/${imgFilename}`, (text) => {
          res.send({
            text: text,
          });
          appendJsonFile(text);
          fs.unlink(`${path}/${imgFilename}`, () => {});
        });
      }
    });
  }
});

app.listen(3001, () => {
  console.log("running at 3001!");
});
