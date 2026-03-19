import { get64ToBinaryMap } from "./binaryMapType";

function reportCodeScanError(error) {
  wx.navigateTo({
    url: "/pages/scanFail/scanFail",
    success: (res) => {
      res.eventChannel.emit('errorDetail', error);
    }
  });
}

export async function handleCode(x) {
  // parse it
  if (x.length<6) {
    // not a valid code
    console.log("Incorrect Length");
    reportCodeScanError("This is not a valid WeUse QR Code.");
    return;
  }
  if (x.substr(0,6)!=="weUse;") {
    // does not have the appropriate format header
    console.log("Incorrect Header");
    reportCodeScanError("This is not a valid WeUse QR Code.");
    return;
  }
  x=x.substr(6);
  if (x.indexOf(';')===-1||x.indexOf(';')===x.length) {
    console.log("Incorrect Semicolon Format");
    reportCodeScanError("This is not a valid WeUse QR Code.");
    return;
  }
  let qrCodeVersion = x.substr(0, x.indexOf(';'));
  if (qrCodeVersion !== "1") {
    reportCodeScanError(`This QR code is of an unsupported version (QR Code Version ${qrCodeVersion}, supported QR code version 1)`);
    return;
  }
  x=x.substr(x.indexOf(';')+1);
  let portions = [];
  let lastParsePart=0;
  for (let i=0;i<x.length;i++) {
    if (x.charAt(i)===';') {
      portions.push(x.substr(lastParsePart,i-lastParsePart));
      lastParsePart=i+1;
    }
  }
  if (lastParsePart<x.length) {
    portions.push(x.substr(lastParsePart, x.length-lastParsePart));
  }
  let keyToValueMap = new Map();
  for (let i=0;i<portions.length;i++) {
    if (portions[i].indexOf('-')===-1) {
      reportCodeScanError(`QR Code Parse Error: Cannot locate the value of ${portions[i]}`);
      return;
    }
    keyToValueMap.set(portions[i].substr(0, portions[i].indexOf('-')), portions[i].substr(portions[i].indexOf('-')+1));
  }
  // process special key-value pairs
  if (keyToValueMap.has('dat')) {
    // convert from base64
    let payload = keyToValueMap.get('dat');
    if (payload.indexOf('-')===-1 || payload.indexOf('-')===payload.length-1) {
      reportCodeScanError(`QR Code Parse Error: Incorrect "dat" format`);
      return;
    }
    let length = Number.parseInt(payload.substr(0, payload.indexOf('-')));
    if (length === NaN || length < 0 || length > 1024) {
      reportCodeScanError(`QR Code Parse Error: Incorrect Length ${payload.substr(0, payload.indexOf('-'))} Incorrect "dat" format`);
      return;
    }
    let base64ToBinaryMap = get64ToBinaryMap();
    let payloadBinaryData = [];
    payload = payload.substr(payload.indexOf('-')+1);
    for (let i=0;i<payload.length;i++) {
      payloadBinaryData.push.apply(payloadBinaryData, base64ToBinaryMap[payload.charAt(i)]);
    }
    if (length*8>payloadBinaryData.length) {
      reportCodeScanError(`QR Code Parse Error: Data Length Error`);
      return;
    }
    let payloadData = [];
    for (let i=0;i<length;i++) {
      let value=0;
      for (let j=i*8;j<i*8+8;j++) {
        value+=(payloadBinaryData[j] ? 1:0)*(1<<(8-1-j%8));
      }
      payloadData.push(value);
    }
    keyToValueMap.set("dat", payloadData);
  }
  
  // handle the code
  if (keyToValueMap.get("event")==="REPLACEWITHEVENTCODE") {
    if (keyToValueMap.get("type")==="questionCode") {
      // Scavenger Hunt Question Code
    } else {
      reportCodeScanError(`UNUSED ${keyToValueMap.get("type")}.`);
      return;
    }
  }
  else if (keyToValueMap.get("event") === undefined) {
    if (keyToValueMap.get("type") === "adminDebugCode") {
      wx.navigateTo({
        url: '/pages/adminDebug/adminDebug',
      })
    } else {
      reportCodeScanError(`This QR code is of the unknown type ${keyToValueMap.get("type")}`);
    }
  } else {
    reportCodeScanError(`This QR code is bound to the unknown event ${keyToValueMap.get("event")}`);
  }
}