let express = require("express");
let cors = require("cors");
let unggah = require("express-fileupload");
const fs = require("fs");
const Tesseract = require("tesseract.js");

var app = express();
app.use(cors());
app.use(unggah());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use("/img", express.static("storage"));

app.get("/", (req, res) => {
  res.send("<h1>OCR</h1>");
});

const recognize = (imgPath, callback) => {
  const { createWorker } = Tesseract;
  const path = require("path");

  const worker = createWorker({
    langPath: path.join(__dirname, "", "lang-data"),
    logger: (m) => console.log(m),
  });

  (async () => {
    await worker.load();
    await worker.loadLanguage("eng");
    await worker.initialize("eng");
    const {
      data: { text },
    } = await worker.recognize(imgPath);

    console.log(text);
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

    console.log("this is the data", path);
    recognize(path, (text) => {
      return res.send({
        image: imgdata,
        path: path,
        text: text,
      });
    });
  } catch (e) {
    next(e);
  }
};

app.post("/capture", capturedImage);

app.post("/upload", (req, res) => {
  if (req.files) {
    let unggahFile = req.files.file;
    let namaFile = unggahFile.name;
    const path = __dirname + "/img/";

    unggahFile.mv(path + namaFile, (err) => {
      if (err) {
        console.log(err);
        res.send(err);
      } else {
        // console.log(namaFile)
        // res.send(namaFile)
        Tesseract.recognize(`${path}/${namaFile}`, "eng", {
          logger: (m) => console.log(m),
        })
          .then(({ data: { text } }) => {
            console.log(text);
            return res.send({
              text: text,
            });
          })
          .catch((err) => {
            console.log(err);
          });
        recognize(`${path}/${namaFile}`, (text) => {
          return res.send({
            text: text,
          });
        });
      }
    });
  }
});

app.listen(3001, () => {
  console.log("running at 3001!");
});
