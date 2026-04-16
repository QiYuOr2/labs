const { UsbComm } = require('./comm');
const hid = require('node-hid');
const protobuf = require('protobufjs');

const ZMKX_VID = 0x1d50;
const ZMKX_PID = 0x615e;
const ZMKX_USAGE_PAGE = 0xff14;

const REPORT_COUNT = 63;
const PAYLOAD_SIZE = REPORT_COUNT - 1;

function encode(message) {
  const buffer = UsbComm.MessageH2D.encode(message).finish();
}

function decode(buffer) {}

class Device {
  #hid;

  /**
   * @param {hid.Device} device
   */
  constructor(device) {
    this.#hid = new hid.HID(device.path);
  }

  /**
   * @param {UsbComm.IMessageH2D} h2d
   */
  #comm(h2d) {
    const msgOut = encode(h2d);
  }

  /**
   * @param {UsbComm.Action} action
   * @returns {UsbComm.IMessageD2H}
   */
  #actions(action) {
    const h2d = UsbComm.MessageH2D.create({
      action,
    });

    const d2h = this.#comm(h2d);

    return d2h;
  }

  get version() {
    return this.#actions(UsbComm.Action.VERSION).version;
  }

  get motorState() {
    return this.#actions(UsbComm.Action.MOTOR_GET_STATE).motorState;
  }

  eInkSetImage() {
    
  }

  close() {
    this.#hid.close();
    this.#hid = null;
  }
}

export function findDevice() {
  const devices = hid.devices();
  const device = devices.find((d) => d.vendorId === ZMKX_VID && d.productId === ZMKX_PID && d.usagePage === ZMKX_USAGE_PAGE);

  return new Device(device);
}
