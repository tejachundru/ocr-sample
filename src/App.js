import React, { useRef, useState, useCallback, createRef } from "react";
import "./App.css";
import Webcam from "react-webcam";
import axios from "axios";
import { Header, Grid, Button, Icon, Message, Loader } from "semantic-ui-react";

const getHostUrl = () => {
  try {
    let host = window.location.hostname;
    let protocol = "";
    if (host && host.includes("localhost")) {
      protocol = "http";
    } else {
      protocol = "http";
    }
    return protocol + "://" + host + ":3001";
  } catch (e) {
    throw e;
  }
};

function App() {
  const webcamRef = useRef(null);
  const [textOcr, setTextOcr] = useState(null);
  const [load, setLoad] = useState(false);
  let fileInputRef = createRef();

  const capture = useCallback(() => {
    setLoad(true);
    const imageSrc = webcamRef.current.getScreenshot();
    let url = `${getHostUrl()}/capture`;
    let config = {
      headers: { "Content-Type": "application/json" }, // x-www-form-urlencoded
    };
    let dataBody = {
      img: imageSrc,
    };
    axios
      .post(url, dataBody, config)
      .then((res) => {
        setTextOcr(res.data.text);
        setLoad(false);
      })
      .catch((err) => {
        console.log(err);
      });
  }, [webcamRef]);

  const upload = (file) => {
    setLoad(true);
    let url = `${getHostUrl()}/upload`;
    let formData = new FormData();
    formData.append("file", file);
    let config = {
      headers: { "Content-Type": "multipart/form-data" },
      onUploadProgress: (event) => {
        const percentCompleted = Math.round((event.loaded * 100) / event.total);
        console.log("onUploadProgress", percentCompleted);
      },
    };
    return axios.post(url, formData, config).then((res) => {
      setTextOcr(res.data.text);
      setLoad(false);
    });
  };

  const videoConstraints = {
    facingMode: "environment",
  };

  return (
    <>
      <center>
        <Header style={{ margin: 40 }} size="medium">
          Please Capture your image using the camera or Upload your Image
        </Header>
      </center>
      <Grid divided centered>
        <Grid.Row style={{ width: "50%" }} key={0}>
          <center>
            <Grid.Row style={{ width: "90%" }} key={0}>
              <Webcam
                audio={false}
                ref={webcamRef}
                style={{ width: "100%" }}
                screenshotFormat="image/jpeg"
                videoConstraints={videoConstraints}
                onUserMediaError={(err) =>
                  console.log("this the error in the termonal", err)
                }
              />
            </Grid.Row>
            <Grid.Row>
              <Button
                size="small"
                onClick={capture}
                style={{ margin: 20 }}
                icon
                labelPosition="left"
                color="blue"
              >
                <Icon name="camera" />
                Capture
              </Button>

              <Button
                size="small"
                onClick={() => fileInputRef.current.click()}
                style={{ margin: 20 }}
                icon
                labelPosition="left"
                inverted
                color="green"
              >
                <Icon name="upload" />
                Upload
                <form encType="multipart/form-data">
                  <input
                    ref={fileInputRef}
                    type="file"
                    hidden
                    name="filename"
                    onChange={(x) => {
                      upload(x.target.files[0]);
                    }}
                    accept="image/*"
                  />
                </form>
              </Button>
            </Grid.Row>
          </center>
        </Grid.Row>
        <Grid.Column style={{ width: "100%" }} key={1}>
          {load ? (
            <Loader
              style={{ marginTop: 120 }}
              active
              inline="centered"
              size="big"
            >
              Loading...
            </Loader>
          ) : (
            <>
              <Message
                size="small"
                header={"RECOGNIZED TEXT :"}
                content={textOcr}
                style={{ margin: 15 }}
              />
            </>
          )}
        </Grid.Column>
      </Grid>
    </>
  );
}

export default App;
