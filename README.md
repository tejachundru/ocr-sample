This is a Simple OCR example using the [Tesseract Open Source OCR Engine](https://tesseract-ocr.github.io/)

Upload any image with text , get your text identified with in the image

This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).

## Available Scripts

### `Local build to run both server and app `

To run the sample project locally,
`yarn run all`.

For build with docker

Static react site is served along with server so with,

to build image `docker build --tag {filename-here} .`

to server the image at 3001 port `docker run -p 3001:3001 {Image-name}`

if you want **change the `port`** at which it is running please also changes following file,
--> server/index.js (change port at 3001 - to deserved port),
--> package.json (`"proxy": "http://localhost:3001"`, --> `"proxy": "http://localhost:{port_you_want}"`,)
--> Dockerfile line- `EXPOSE 3001` -> `EXPOSE YOUR_PORT_NO`



