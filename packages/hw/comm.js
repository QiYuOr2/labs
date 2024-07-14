/*eslint-disable block-scoped-var, id-length, no-control-regex, no-magic-numbers, no-prototype-builtins, no-redeclare, no-shadow, no-var, sort-vars*/
(function(global, factory) { /* global define, require, module */

    /* AMD */ if (typeof define === 'function' && define.amd)
        define(["protobufjs/minimal"], factory);

    /* CommonJS */ else if (typeof require === 'function' && typeof module === 'object' && module && module.exports)
        module.exports = factory(require("protobufjs/minimal"));


})(this, function($protobuf) {
    "use strict";

    // Common aliases
    var $Reader = $protobuf.Reader, $Writer = $protobuf.Writer, $util = $protobuf.util;
    
    // Exported root namespace
    var $root = $protobuf.roots["default"] || ($protobuf.roots["default"] = {});
    
    $root.UsbComm = (function() {
    
        /**
         * Namespace UsbComm.
         * @exports UsbComm
         * @namespace
         */
        var UsbComm = {};
    
        /**
         * Action enum.
         * @name UsbComm.Action
         * @enum {number}
         * @property {number} NOP=0 NOP value
         * @property {number} VERSION=1 VERSION value
         * @property {number} MOTOR_GET_STATE=2 MOTOR_GET_STATE value
         * @property {number} KNOB_GET_CONFIG=3 KNOB_GET_CONFIG value
         * @property {number} KNOB_SET_CONFIG=4 KNOB_SET_CONFIG value
         * @property {number} KNOB_UPDATE_PREF=9 KNOB_UPDATE_PREF value
         * @property {number} RGB_CONTROL=5 RGB_CONTROL value
         * @property {number} RGB_GET_STATE=6 RGB_GET_STATE value
         * @property {number} RGB_SET_STATE=8 RGB_SET_STATE value
         * @property {number} RGB_GET_INDICATOR=10 RGB_GET_INDICATOR value
         * @property {number} RGB_SET_INDICATOR=11 RGB_SET_INDICATOR value
         * @property {number} EINK_SET_IMAGE=7 EINK_SET_IMAGE value
         */
        UsbComm.Action = (function() {
            var valuesById = {}, values = Object.create(valuesById);
            values[valuesById[0] = "NOP"] = 0;
            values[valuesById[1] = "VERSION"] = 1;
            values[valuesById[2] = "MOTOR_GET_STATE"] = 2;
            values[valuesById[3] = "KNOB_GET_CONFIG"] = 3;
            values[valuesById[4] = "KNOB_SET_CONFIG"] = 4;
            values[valuesById[9] = "KNOB_UPDATE_PREF"] = 9;
            values[valuesById[5] = "RGB_CONTROL"] = 5;
            values[valuesById[6] = "RGB_GET_STATE"] = 6;
            values[valuesById[8] = "RGB_SET_STATE"] = 8;
            values[valuesById[10] = "RGB_GET_INDICATOR"] = 10;
            values[valuesById[11] = "RGB_SET_INDICATOR"] = 11;
            values[valuesById[7] = "EINK_SET_IMAGE"] = 7;
            return values;
        })();
    
        UsbComm.MessageH2D = (function() {
    
            /**
             * Properties of a MessageH2D.
             * @memberof UsbComm
             * @interface IMessageH2D
             * @property {UsbComm.Action} action MessageH2D action
             * @property {UsbComm.INop|null} [nop] MessageH2D nop
             * @property {UsbComm.IKnobConfig|null} [knobConfig] MessageH2D knobConfig
             * @property {UsbComm.KnobConfig.IPref|null} [knobPref] MessageH2D knobPref
             * @property {UsbComm.IRgbControl|null} [rgbControl] MessageH2D rgbControl
             * @property {UsbComm.IRgbState|null} [rgbState] MessageH2D rgbState
             * @property {UsbComm.IRgbIndicator|null} [rgbIndicator] MessageH2D rgbIndicator
             * @property {UsbComm.IEinkImage|null} [einkImage] MessageH2D einkImage
             */
    
            /**
             * Constructs a new MessageH2D.
             * @memberof UsbComm
             * @classdesc Represents a MessageH2D.
             * @implements IMessageH2D
             * @constructor
             * @param {UsbComm.IMessageH2D=} [properties] Properties to set
             */
            function MessageH2D(properties) {
                if (properties)
                    for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                        if (properties[keys[i]] != null)
                            this[keys[i]] = properties[keys[i]];
            }
    
            /**
             * MessageH2D action.
             * @member {UsbComm.Action} action
             * @memberof UsbComm.MessageH2D
             * @instance
             */
            MessageH2D.prototype.action = 0;
    
            /**
             * MessageH2D nop.
             * @member {UsbComm.INop|null|undefined} nop
             * @memberof UsbComm.MessageH2D
             * @instance
             */
            MessageH2D.prototype.nop = null;
    
            /**
             * MessageH2D knobConfig.
             * @member {UsbComm.IKnobConfig|null|undefined} knobConfig
             * @memberof UsbComm.MessageH2D
             * @instance
             */
            MessageH2D.prototype.knobConfig = null;
    
            /**
             * MessageH2D knobPref.
             * @member {UsbComm.KnobConfig.IPref|null|undefined} knobPref
             * @memberof UsbComm.MessageH2D
             * @instance
             */
            MessageH2D.prototype.knobPref = null;
    
            /**
             * MessageH2D rgbControl.
             * @member {UsbComm.IRgbControl|null|undefined} rgbControl
             * @memberof UsbComm.MessageH2D
             * @instance
             */
            MessageH2D.prototype.rgbControl = null;
    
            /**
             * MessageH2D rgbState.
             * @member {UsbComm.IRgbState|null|undefined} rgbState
             * @memberof UsbComm.MessageH2D
             * @instance
             */
            MessageH2D.prototype.rgbState = null;
    
            /**
             * MessageH2D rgbIndicator.
             * @member {UsbComm.IRgbIndicator|null|undefined} rgbIndicator
             * @memberof UsbComm.MessageH2D
             * @instance
             */
            MessageH2D.prototype.rgbIndicator = null;
    
            /**
             * MessageH2D einkImage.
             * @member {UsbComm.IEinkImage|null|undefined} einkImage
             * @memberof UsbComm.MessageH2D
             * @instance
             */
            MessageH2D.prototype.einkImage = null;
    
            // OneOf field names bound to virtual getters and setters
            var $oneOfFields;
    
            /**
             * MessageH2D payload.
             * @member {"nop"|"knobConfig"|"knobPref"|"rgbControl"|"rgbState"|"rgbIndicator"|"einkImage"|undefined} payload
             * @memberof UsbComm.MessageH2D
             * @instance
             */
            Object.defineProperty(MessageH2D.prototype, "payload", {
                get: $util.oneOfGetter($oneOfFields = ["nop", "knobConfig", "knobPref", "rgbControl", "rgbState", "rgbIndicator", "einkImage"]),
                set: $util.oneOfSetter($oneOfFields)
            });
    
            /**
             * Creates a new MessageH2D instance using the specified properties.
             * @function create
             * @memberof UsbComm.MessageH2D
             * @static
             * @param {UsbComm.IMessageH2D=} [properties] Properties to set
             * @returns {UsbComm.MessageH2D} MessageH2D instance
             */
            MessageH2D.create = function create(properties) {
                return new MessageH2D(properties);
            };
    
            /**
             * Encodes the specified MessageH2D message. Does not implicitly {@link UsbComm.MessageH2D.verify|verify} messages.
             * @function encode
             * @memberof UsbComm.MessageH2D
             * @static
             * @param {UsbComm.IMessageH2D} message MessageH2D message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            MessageH2D.encode = function encode(message, writer) {
                if (!writer)
                    writer = $Writer.create();
                writer.uint32(/* id 1, wireType 0 =*/8).int32(message.action);
                if (message.nop != null && Object.hasOwnProperty.call(message, "nop"))
                    $root.UsbComm.Nop.encode(message.nop, writer.uint32(/* id 2, wireType 2 =*/18).fork()).ldelim();
                if (message.knobConfig != null && Object.hasOwnProperty.call(message, "knobConfig"))
                    $root.UsbComm.KnobConfig.encode(message.knobConfig, writer.uint32(/* id 3, wireType 2 =*/26).fork()).ldelim();
                if (message.rgbControl != null && Object.hasOwnProperty.call(message, "rgbControl"))
                    $root.UsbComm.RgbControl.encode(message.rgbControl, writer.uint32(/* id 4, wireType 2 =*/34).fork()).ldelim();
                if (message.einkImage != null && Object.hasOwnProperty.call(message, "einkImage"))
                    $root.UsbComm.EinkImage.encode(message.einkImage, writer.uint32(/* id 5, wireType 2 =*/42).fork()).ldelim();
                if (message.knobPref != null && Object.hasOwnProperty.call(message, "knobPref"))
                    $root.UsbComm.KnobConfig.Pref.encode(message.knobPref, writer.uint32(/* id 6, wireType 2 =*/50).fork()).ldelim();
                if (message.rgbState != null && Object.hasOwnProperty.call(message, "rgbState"))
                    $root.UsbComm.RgbState.encode(message.rgbState, writer.uint32(/* id 7, wireType 2 =*/58).fork()).ldelim();
                if (message.rgbIndicator != null && Object.hasOwnProperty.call(message, "rgbIndicator"))
                    $root.UsbComm.RgbIndicator.encode(message.rgbIndicator, writer.uint32(/* id 8, wireType 2 =*/66).fork()).ldelim();
                return writer;
            };
    
            /**
             * Encodes the specified MessageH2D message, length delimited. Does not implicitly {@link UsbComm.MessageH2D.verify|verify} messages.
             * @function encodeDelimited
             * @memberof UsbComm.MessageH2D
             * @static
             * @param {UsbComm.IMessageH2D} message MessageH2D message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            MessageH2D.encodeDelimited = function encodeDelimited(message, writer) {
                return this.encode(message, writer).ldelim();
            };
    
            /**
             * Decodes a MessageH2D message from the specified reader or buffer.
             * @function decode
             * @memberof UsbComm.MessageH2D
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @param {number} [length] Message length if known beforehand
             * @returns {UsbComm.MessageH2D} MessageH2D
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            MessageH2D.decode = function decode(reader, length) {
                if (!(reader instanceof $Reader))
                    reader = $Reader.create(reader);
                var end = length === undefined ? reader.len : reader.pos + length, message = new $root.UsbComm.MessageH2D();
                while (reader.pos < end) {
                    var tag = reader.uint32();
                    switch (tag >>> 3) {
                    case 1: {
                            message.action = reader.int32();
                            break;
                        }
                    case 2: {
                            message.nop = $root.UsbComm.Nop.decode(reader, reader.uint32());
                            break;
                        }
                    case 3: {
                            message.knobConfig = $root.UsbComm.KnobConfig.decode(reader, reader.uint32());
                            break;
                        }
                    case 6: {
                            message.knobPref = $root.UsbComm.KnobConfig.Pref.decode(reader, reader.uint32());
                            break;
                        }
                    case 4: {
                            message.rgbControl = $root.UsbComm.RgbControl.decode(reader, reader.uint32());
                            break;
                        }
                    case 7: {
                            message.rgbState = $root.UsbComm.RgbState.decode(reader, reader.uint32());
                            break;
                        }
                    case 8: {
                            message.rgbIndicator = $root.UsbComm.RgbIndicator.decode(reader, reader.uint32());
                            break;
                        }
                    case 5: {
                            message.einkImage = $root.UsbComm.EinkImage.decode(reader, reader.uint32());
                            break;
                        }
                    default:
                        reader.skipType(tag & 7);
                        break;
                    }
                }
                if (!message.hasOwnProperty("action"))
                    throw $util.ProtocolError("missing required 'action'", { instance: message });
                return message;
            };
    
            /**
             * Decodes a MessageH2D message from the specified reader or buffer, length delimited.
             * @function decodeDelimited
             * @memberof UsbComm.MessageH2D
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @returns {UsbComm.MessageH2D} MessageH2D
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            MessageH2D.decodeDelimited = function decodeDelimited(reader) {
                if (!(reader instanceof $Reader))
                    reader = new $Reader(reader);
                return this.decode(reader, reader.uint32());
            };
    
            /**
             * Verifies a MessageH2D message.
             * @function verify
             * @memberof UsbComm.MessageH2D
             * @static
             * @param {Object.<string,*>} message Plain object to verify
             * @returns {string|null} `null` if valid, otherwise the reason why it is not
             */
            MessageH2D.verify = function verify(message) {
                if (typeof message !== "object" || message === null)
                    return "object expected";
                var properties = {};
                switch (message.action) {
                default:
                    return "action: enum value expected";
                case 0:
                case 1:
                case 2:
                case 3:
                case 4:
                case 9:
                case 5:
                case 6:
                case 8:
                case 10:
                case 11:
                case 7:
                    break;
                }
                if (message.nop != null && message.hasOwnProperty("nop")) {
                    properties.payload = 1;
                    {
                        var error = $root.UsbComm.Nop.verify(message.nop);
                        if (error)
                            return "nop." + error;
                    }
                }
                if (message.knobConfig != null && message.hasOwnProperty("knobConfig")) {
                    if (properties.payload === 1)
                        return "payload: multiple values";
                    properties.payload = 1;
                    {
                        var error = $root.UsbComm.KnobConfig.verify(message.knobConfig);
                        if (error)
                            return "knobConfig." + error;
                    }
                }
                if (message.knobPref != null && message.hasOwnProperty("knobPref")) {
                    if (properties.payload === 1)
                        return "payload: multiple values";
                    properties.payload = 1;
                    {
                        var error = $root.UsbComm.KnobConfig.Pref.verify(message.knobPref);
                        if (error)
                            return "knobPref." + error;
                    }
                }
                if (message.rgbControl != null && message.hasOwnProperty("rgbControl")) {
                    if (properties.payload === 1)
                        return "payload: multiple values";
                    properties.payload = 1;
                    {
                        var error = $root.UsbComm.RgbControl.verify(message.rgbControl);
                        if (error)
                            return "rgbControl." + error;
                    }
                }
                if (message.rgbState != null && message.hasOwnProperty("rgbState")) {
                    if (properties.payload === 1)
                        return "payload: multiple values";
                    properties.payload = 1;
                    {
                        var error = $root.UsbComm.RgbState.verify(message.rgbState);
                        if (error)
                            return "rgbState." + error;
                    }
                }
                if (message.rgbIndicator != null && message.hasOwnProperty("rgbIndicator")) {
                    if (properties.payload === 1)
                        return "payload: multiple values";
                    properties.payload = 1;
                    {
                        var error = $root.UsbComm.RgbIndicator.verify(message.rgbIndicator);
                        if (error)
                            return "rgbIndicator." + error;
                    }
                }
                if (message.einkImage != null && message.hasOwnProperty("einkImage")) {
                    if (properties.payload === 1)
                        return "payload: multiple values";
                    properties.payload = 1;
                    {
                        var error = $root.UsbComm.EinkImage.verify(message.einkImage);
                        if (error)
                            return "einkImage." + error;
                    }
                }
                return null;
            };
    
            /**
             * Creates a MessageH2D message from a plain object. Also converts values to their respective internal types.
             * @function fromObject
             * @memberof UsbComm.MessageH2D
             * @static
             * @param {Object.<string,*>} object Plain object
             * @returns {UsbComm.MessageH2D} MessageH2D
             */
            MessageH2D.fromObject = function fromObject(object) {
                if (object instanceof $root.UsbComm.MessageH2D)
                    return object;
                var message = new $root.UsbComm.MessageH2D();
                switch (object.action) {
                default:
                    if (typeof object.action === "number") {
                        message.action = object.action;
                        break;
                    }
                    break;
                case "NOP":
                case 0:
                    message.action = 0;
                    break;
                case "VERSION":
                case 1:
                    message.action = 1;
                    break;
                case "MOTOR_GET_STATE":
                case 2:
                    message.action = 2;
                    break;
                case "KNOB_GET_CONFIG":
                case 3:
                    message.action = 3;
                    break;
                case "KNOB_SET_CONFIG":
                case 4:
                    message.action = 4;
                    break;
                case "KNOB_UPDATE_PREF":
                case 9:
                    message.action = 9;
                    break;
                case "RGB_CONTROL":
                case 5:
                    message.action = 5;
                    break;
                case "RGB_GET_STATE":
                case 6:
                    message.action = 6;
                    break;
                case "RGB_SET_STATE":
                case 8:
                    message.action = 8;
                    break;
                case "RGB_GET_INDICATOR":
                case 10:
                    message.action = 10;
                    break;
                case "RGB_SET_INDICATOR":
                case 11:
                    message.action = 11;
                    break;
                case "EINK_SET_IMAGE":
                case 7:
                    message.action = 7;
                    break;
                }
                if (object.nop != null) {
                    if (typeof object.nop !== "object")
                        throw TypeError(".UsbComm.MessageH2D.nop: object expected");
                    message.nop = $root.UsbComm.Nop.fromObject(object.nop);
                }
                if (object.knobConfig != null) {
                    if (typeof object.knobConfig !== "object")
                        throw TypeError(".UsbComm.MessageH2D.knobConfig: object expected");
                    message.knobConfig = $root.UsbComm.KnobConfig.fromObject(object.knobConfig);
                }
                if (object.knobPref != null) {
                    if (typeof object.knobPref !== "object")
                        throw TypeError(".UsbComm.MessageH2D.knobPref: object expected");
                    message.knobPref = $root.UsbComm.KnobConfig.Pref.fromObject(object.knobPref);
                }
                if (object.rgbControl != null) {
                    if (typeof object.rgbControl !== "object")
                        throw TypeError(".UsbComm.MessageH2D.rgbControl: object expected");
                    message.rgbControl = $root.UsbComm.RgbControl.fromObject(object.rgbControl);
                }
                if (object.rgbState != null) {
                    if (typeof object.rgbState !== "object")
                        throw TypeError(".UsbComm.MessageH2D.rgbState: object expected");
                    message.rgbState = $root.UsbComm.RgbState.fromObject(object.rgbState);
                }
                if (object.rgbIndicator != null) {
                    if (typeof object.rgbIndicator !== "object")
                        throw TypeError(".UsbComm.MessageH2D.rgbIndicator: object expected");
                    message.rgbIndicator = $root.UsbComm.RgbIndicator.fromObject(object.rgbIndicator);
                }
                if (object.einkImage != null) {
                    if (typeof object.einkImage !== "object")
                        throw TypeError(".UsbComm.MessageH2D.einkImage: object expected");
                    message.einkImage = $root.UsbComm.EinkImage.fromObject(object.einkImage);
                }
                return message;
            };
    
            /**
             * Creates a plain object from a MessageH2D message. Also converts values to other types if specified.
             * @function toObject
             * @memberof UsbComm.MessageH2D
             * @static
             * @param {UsbComm.MessageH2D} message MessageH2D
             * @param {$protobuf.IConversionOptions} [options] Conversion options
             * @returns {Object.<string,*>} Plain object
             */
            MessageH2D.toObject = function toObject(message, options) {
                if (!options)
                    options = {};
                var object = {};
                if (options.defaults)
                    object.action = options.enums === String ? "NOP" : 0;
                if (message.action != null && message.hasOwnProperty("action"))
                    object.action = options.enums === String ? $root.UsbComm.Action[message.action] === undefined ? message.action : $root.UsbComm.Action[message.action] : message.action;
                if (message.nop != null && message.hasOwnProperty("nop")) {
                    object.nop = $root.UsbComm.Nop.toObject(message.nop, options);
                    if (options.oneofs)
                        object.payload = "nop";
                }
                if (message.knobConfig != null && message.hasOwnProperty("knobConfig")) {
                    object.knobConfig = $root.UsbComm.KnobConfig.toObject(message.knobConfig, options);
                    if (options.oneofs)
                        object.payload = "knobConfig";
                }
                if (message.rgbControl != null && message.hasOwnProperty("rgbControl")) {
                    object.rgbControl = $root.UsbComm.RgbControl.toObject(message.rgbControl, options);
                    if (options.oneofs)
                        object.payload = "rgbControl";
                }
                if (message.einkImage != null && message.hasOwnProperty("einkImage")) {
                    object.einkImage = $root.UsbComm.EinkImage.toObject(message.einkImage, options);
                    if (options.oneofs)
                        object.payload = "einkImage";
                }
                if (message.knobPref != null && message.hasOwnProperty("knobPref")) {
                    object.knobPref = $root.UsbComm.KnobConfig.Pref.toObject(message.knobPref, options);
                    if (options.oneofs)
                        object.payload = "knobPref";
                }
                if (message.rgbState != null && message.hasOwnProperty("rgbState")) {
                    object.rgbState = $root.UsbComm.RgbState.toObject(message.rgbState, options);
                    if (options.oneofs)
                        object.payload = "rgbState";
                }
                if (message.rgbIndicator != null && message.hasOwnProperty("rgbIndicator")) {
                    object.rgbIndicator = $root.UsbComm.RgbIndicator.toObject(message.rgbIndicator, options);
                    if (options.oneofs)
                        object.payload = "rgbIndicator";
                }
                return object;
            };
    
            /**
             * Converts this MessageH2D to JSON.
             * @function toJSON
             * @memberof UsbComm.MessageH2D
             * @instance
             * @returns {Object.<string,*>} JSON object
             */
            MessageH2D.prototype.toJSON = function toJSON() {
                return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
            };
    
            /**
             * Gets the default type url for MessageH2D
             * @function getTypeUrl
             * @memberof UsbComm.MessageH2D
             * @static
             * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
             * @returns {string} The default type url
             */
            MessageH2D.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
                if (typeUrlPrefix === undefined) {
                    typeUrlPrefix = "type.googleapis.com";
                }
                return typeUrlPrefix + "/UsbComm.MessageH2D";
            };
    
            return MessageH2D;
        })();
    
        UsbComm.MessageD2H = (function() {
    
            /**
             * Properties of a MessageD2H.
             * @memberof UsbComm
             * @interface IMessageD2H
             * @property {UsbComm.Action} action MessageD2H action
             * @property {UsbComm.INop|null} [nop] MessageD2H nop
             * @property {UsbComm.IVersion|null} [version] MessageD2H version
             * @property {UsbComm.IMotorState|null} [motorState] MessageD2H motorState
             * @property {UsbComm.IKnobConfig|null} [knobConfig] MessageD2H knobConfig
             * @property {UsbComm.KnobConfig.IPref|null} [knobPref] MessageD2H knobPref
             * @property {UsbComm.IRgbState|null} [rgbState] MessageD2H rgbState
             * @property {UsbComm.IRgbIndicator|null} [rgbIndicator] MessageD2H rgbIndicator
             * @property {UsbComm.IEinkImage|null} [einkImage] MessageD2H einkImage
             */
    
            /**
             * Constructs a new MessageD2H.
             * @memberof UsbComm
             * @classdesc Represents a MessageD2H.
             * @implements IMessageD2H
             * @constructor
             * @param {UsbComm.IMessageD2H=} [properties] Properties to set
             */
            function MessageD2H(properties) {
                if (properties)
                    for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                        if (properties[keys[i]] != null)
                            this[keys[i]] = properties[keys[i]];
            }
    
            /**
             * MessageD2H action.
             * @member {UsbComm.Action} action
             * @memberof UsbComm.MessageD2H
             * @instance
             */
            MessageD2H.prototype.action = 0;
    
            /**
             * MessageD2H nop.
             * @member {UsbComm.INop|null|undefined} nop
             * @memberof UsbComm.MessageD2H
             * @instance
             */
            MessageD2H.prototype.nop = null;
    
            /**
             * MessageD2H version.
             * @member {UsbComm.IVersion|null|undefined} version
             * @memberof UsbComm.MessageD2H
             * @instance
             */
            MessageD2H.prototype.version = null;
    
            /**
             * MessageD2H motorState.
             * @member {UsbComm.IMotorState|null|undefined} motorState
             * @memberof UsbComm.MessageD2H
             * @instance
             */
            MessageD2H.prototype.motorState = null;
    
            /**
             * MessageD2H knobConfig.
             * @member {UsbComm.IKnobConfig|null|undefined} knobConfig
             * @memberof UsbComm.MessageD2H
             * @instance
             */
            MessageD2H.prototype.knobConfig = null;
    
            /**
             * MessageD2H knobPref.
             * @member {UsbComm.KnobConfig.IPref|null|undefined} knobPref
             * @memberof UsbComm.MessageD2H
             * @instance
             */
            MessageD2H.prototype.knobPref = null;
    
            /**
             * MessageD2H rgbState.
             * @member {UsbComm.IRgbState|null|undefined} rgbState
             * @memberof UsbComm.MessageD2H
             * @instance
             */
            MessageD2H.prototype.rgbState = null;
    
            /**
             * MessageD2H rgbIndicator.
             * @member {UsbComm.IRgbIndicator|null|undefined} rgbIndicator
             * @memberof UsbComm.MessageD2H
             * @instance
             */
            MessageD2H.prototype.rgbIndicator = null;
    
            /**
             * MessageD2H einkImage.
             * @member {UsbComm.IEinkImage|null|undefined} einkImage
             * @memberof UsbComm.MessageD2H
             * @instance
             */
            MessageD2H.prototype.einkImage = null;
    
            // OneOf field names bound to virtual getters and setters
            var $oneOfFields;
    
            /**
             * MessageD2H payload.
             * @member {"nop"|"version"|"motorState"|"knobConfig"|"knobPref"|"rgbState"|"rgbIndicator"|"einkImage"|undefined} payload
             * @memberof UsbComm.MessageD2H
             * @instance
             */
            Object.defineProperty(MessageD2H.prototype, "payload", {
                get: $util.oneOfGetter($oneOfFields = ["nop", "version", "motorState", "knobConfig", "knobPref", "rgbState", "rgbIndicator", "einkImage"]),
                set: $util.oneOfSetter($oneOfFields)
            });
    
            /**
             * Creates a new MessageD2H instance using the specified properties.
             * @function create
             * @memberof UsbComm.MessageD2H
             * @static
             * @param {UsbComm.IMessageD2H=} [properties] Properties to set
             * @returns {UsbComm.MessageD2H} MessageD2H instance
             */
            MessageD2H.create = function create(properties) {
                return new MessageD2H(properties);
            };
    
            /**
             * Encodes the specified MessageD2H message. Does not implicitly {@link UsbComm.MessageD2H.verify|verify} messages.
             * @function encode
             * @memberof UsbComm.MessageD2H
             * @static
             * @param {UsbComm.IMessageD2H} message MessageD2H message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            MessageD2H.encode = function encode(message, writer) {
                if (!writer)
                    writer = $Writer.create();
                writer.uint32(/* id 1, wireType 0 =*/8).int32(message.action);
                if (message.nop != null && Object.hasOwnProperty.call(message, "nop"))
                    $root.UsbComm.Nop.encode(message.nop, writer.uint32(/* id 2, wireType 2 =*/18).fork()).ldelim();
                if (message.version != null && Object.hasOwnProperty.call(message, "version"))
                    $root.UsbComm.Version.encode(message.version, writer.uint32(/* id 3, wireType 2 =*/26).fork()).ldelim();
                if (message.motorState != null && Object.hasOwnProperty.call(message, "motorState"))
                    $root.UsbComm.MotorState.encode(message.motorState, writer.uint32(/* id 4, wireType 2 =*/34).fork()).ldelim();
                if (message.knobConfig != null && Object.hasOwnProperty.call(message, "knobConfig"))
                    $root.UsbComm.KnobConfig.encode(message.knobConfig, writer.uint32(/* id 5, wireType 2 =*/42).fork()).ldelim();
                if (message.rgbState != null && Object.hasOwnProperty.call(message, "rgbState"))
                    $root.UsbComm.RgbState.encode(message.rgbState, writer.uint32(/* id 6, wireType 2 =*/50).fork()).ldelim();
                if (message.einkImage != null && Object.hasOwnProperty.call(message, "einkImage"))
                    $root.UsbComm.EinkImage.encode(message.einkImage, writer.uint32(/* id 7, wireType 2 =*/58).fork()).ldelim();
                if (message.knobPref != null && Object.hasOwnProperty.call(message, "knobPref"))
                    $root.UsbComm.KnobConfig.Pref.encode(message.knobPref, writer.uint32(/* id 8, wireType 2 =*/66).fork()).ldelim();
                if (message.rgbIndicator != null && Object.hasOwnProperty.call(message, "rgbIndicator"))
                    $root.UsbComm.RgbIndicator.encode(message.rgbIndicator, writer.uint32(/* id 9, wireType 2 =*/74).fork()).ldelim();
                return writer;
            };
    
            /**
             * Encodes the specified MessageD2H message, length delimited. Does not implicitly {@link UsbComm.MessageD2H.verify|verify} messages.
             * @function encodeDelimited
             * @memberof UsbComm.MessageD2H
             * @static
             * @param {UsbComm.IMessageD2H} message MessageD2H message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            MessageD2H.encodeDelimited = function encodeDelimited(message, writer) {
                return this.encode(message, writer).ldelim();
            };
    
            /**
             * Decodes a MessageD2H message from the specified reader or buffer.
             * @function decode
             * @memberof UsbComm.MessageD2H
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @param {number} [length] Message length if known beforehand
             * @returns {UsbComm.MessageD2H} MessageD2H
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            MessageD2H.decode = function decode(reader, length) {
                if (!(reader instanceof $Reader))
                    reader = $Reader.create(reader);
                var end = length === undefined ? reader.len : reader.pos + length, message = new $root.UsbComm.MessageD2H();
                while (reader.pos < end) {
                    var tag = reader.uint32();
                    switch (tag >>> 3) {
                    case 1: {
                            message.action = reader.int32();
                            break;
                        }
                    case 2: {
                            message.nop = $root.UsbComm.Nop.decode(reader, reader.uint32());
                            break;
                        }
                    case 3: {
                            message.version = $root.UsbComm.Version.decode(reader, reader.uint32());
                            break;
                        }
                    case 4: {
                            message.motorState = $root.UsbComm.MotorState.decode(reader, reader.uint32());
                            break;
                        }
                    case 5: {
                            message.knobConfig = $root.UsbComm.KnobConfig.decode(reader, reader.uint32());
                            break;
                        }
                    case 8: {
                            message.knobPref = $root.UsbComm.KnobConfig.Pref.decode(reader, reader.uint32());
                            break;
                        }
                    case 6: {
                            message.rgbState = $root.UsbComm.RgbState.decode(reader, reader.uint32());
                            break;
                        }
                    case 9: {
                            message.rgbIndicator = $root.UsbComm.RgbIndicator.decode(reader, reader.uint32());
                            break;
                        }
                    case 7: {
                            message.einkImage = $root.UsbComm.EinkImage.decode(reader, reader.uint32());
                            break;
                        }
                    default:
                        reader.skipType(tag & 7);
                        break;
                    }
                }
                if (!message.hasOwnProperty("action"))
                    throw $util.ProtocolError("missing required 'action'", { instance: message });
                return message;
            };
    
            /**
             * Decodes a MessageD2H message from the specified reader or buffer, length delimited.
             * @function decodeDelimited
             * @memberof UsbComm.MessageD2H
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @returns {UsbComm.MessageD2H} MessageD2H
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            MessageD2H.decodeDelimited = function decodeDelimited(reader) {
                if (!(reader instanceof $Reader))
                    reader = new $Reader(reader);
                return this.decode(reader, reader.uint32());
            };
    
            /**
             * Verifies a MessageD2H message.
             * @function verify
             * @memberof UsbComm.MessageD2H
             * @static
             * @param {Object.<string,*>} message Plain object to verify
             * @returns {string|null} `null` if valid, otherwise the reason why it is not
             */
            MessageD2H.verify = function verify(message) {
                if (typeof message !== "object" || message === null)
                    return "object expected";
                var properties = {};
                switch (message.action) {
                default:
                    return "action: enum value expected";
                case 0:
                case 1:
                case 2:
                case 3:
                case 4:
                case 9:
                case 5:
                case 6:
                case 8:
                case 10:
                case 11:
                case 7:
                    break;
                }
                if (message.nop != null && message.hasOwnProperty("nop")) {
                    properties.payload = 1;
                    {
                        var error = $root.UsbComm.Nop.verify(message.nop);
                        if (error)
                            return "nop." + error;
                    }
                }
                if (message.version != null && message.hasOwnProperty("version")) {
                    if (properties.payload === 1)
                        return "payload: multiple values";
                    properties.payload = 1;
                    {
                        var error = $root.UsbComm.Version.verify(message.version);
                        if (error)
                            return "version." + error;
                    }
                }
                if (message.motorState != null && message.hasOwnProperty("motorState")) {
                    if (properties.payload === 1)
                        return "payload: multiple values";
                    properties.payload = 1;
                    {
                        var error = $root.UsbComm.MotorState.verify(message.motorState);
                        if (error)
                            return "motorState." + error;
                    }
                }
                if (message.knobConfig != null && message.hasOwnProperty("knobConfig")) {
                    if (properties.payload === 1)
                        return "payload: multiple values";
                    properties.payload = 1;
                    {
                        var error = $root.UsbComm.KnobConfig.verify(message.knobConfig);
                        if (error)
                            return "knobConfig." + error;
                    }
                }
                if (message.knobPref != null && message.hasOwnProperty("knobPref")) {
                    if (properties.payload === 1)
                        return "payload: multiple values";
                    properties.payload = 1;
                    {
                        var error = $root.UsbComm.KnobConfig.Pref.verify(message.knobPref);
                        if (error)
                            return "knobPref." + error;
                    }
                }
                if (message.rgbState != null && message.hasOwnProperty("rgbState")) {
                    if (properties.payload === 1)
                        return "payload: multiple values";
                    properties.payload = 1;
                    {
                        var error = $root.UsbComm.RgbState.verify(message.rgbState);
                        if (error)
                            return "rgbState." + error;
                    }
                }
                if (message.rgbIndicator != null && message.hasOwnProperty("rgbIndicator")) {
                    if (properties.payload === 1)
                        return "payload: multiple values";
                    properties.payload = 1;
                    {
                        var error = $root.UsbComm.RgbIndicator.verify(message.rgbIndicator);
                        if (error)
                            return "rgbIndicator." + error;
                    }
                }
                if (message.einkImage != null && message.hasOwnProperty("einkImage")) {
                    if (properties.payload === 1)
                        return "payload: multiple values";
                    properties.payload = 1;
                    {
                        var error = $root.UsbComm.EinkImage.verify(message.einkImage);
                        if (error)
                            return "einkImage." + error;
                    }
                }
                return null;
            };
    
            /**
             * Creates a MessageD2H message from a plain object. Also converts values to their respective internal types.
             * @function fromObject
             * @memberof UsbComm.MessageD2H
             * @static
             * @param {Object.<string,*>} object Plain object
             * @returns {UsbComm.MessageD2H} MessageD2H
             */
            MessageD2H.fromObject = function fromObject(object) {
                if (object instanceof $root.UsbComm.MessageD2H)
                    return object;
                var message = new $root.UsbComm.MessageD2H();
                switch (object.action) {
                default:
                    if (typeof object.action === "number") {
                        message.action = object.action;
                        break;
                    }
                    break;
                case "NOP":
                case 0:
                    message.action = 0;
                    break;
                case "VERSION":
                case 1:
                    message.action = 1;
                    break;
                case "MOTOR_GET_STATE":
                case 2:
                    message.action = 2;
                    break;
                case "KNOB_GET_CONFIG":
                case 3:
                    message.action = 3;
                    break;
                case "KNOB_SET_CONFIG":
                case 4:
                    message.action = 4;
                    break;
                case "KNOB_UPDATE_PREF":
                case 9:
                    message.action = 9;
                    break;
                case "RGB_CONTROL":
                case 5:
                    message.action = 5;
                    break;
                case "RGB_GET_STATE":
                case 6:
                    message.action = 6;
                    break;
                case "RGB_SET_STATE":
                case 8:
                    message.action = 8;
                    break;
                case "RGB_GET_INDICATOR":
                case 10:
                    message.action = 10;
                    break;
                case "RGB_SET_INDICATOR":
                case 11:
                    message.action = 11;
                    break;
                case "EINK_SET_IMAGE":
                case 7:
                    message.action = 7;
                    break;
                }
                if (object.nop != null) {
                    if (typeof object.nop !== "object")
                        throw TypeError(".UsbComm.MessageD2H.nop: object expected");
                    message.nop = $root.UsbComm.Nop.fromObject(object.nop);
                }
                if (object.version != null) {
                    if (typeof object.version !== "object")
                        throw TypeError(".UsbComm.MessageD2H.version: object expected");
                    message.version = $root.UsbComm.Version.fromObject(object.version);
                }
                if (object.motorState != null) {
                    if (typeof object.motorState !== "object")
                        throw TypeError(".UsbComm.MessageD2H.motorState: object expected");
                    message.motorState = $root.UsbComm.MotorState.fromObject(object.motorState);
                }
                if (object.knobConfig != null) {
                    if (typeof object.knobConfig !== "object")
                        throw TypeError(".UsbComm.MessageD2H.knobConfig: object expected");
                    message.knobConfig = $root.UsbComm.KnobConfig.fromObject(object.knobConfig);
                }
                if (object.knobPref != null) {
                    if (typeof object.knobPref !== "object")
                        throw TypeError(".UsbComm.MessageD2H.knobPref: object expected");
                    message.knobPref = $root.UsbComm.KnobConfig.Pref.fromObject(object.knobPref);
                }
                if (object.rgbState != null) {
                    if (typeof object.rgbState !== "object")
                        throw TypeError(".UsbComm.MessageD2H.rgbState: object expected");
                    message.rgbState = $root.UsbComm.RgbState.fromObject(object.rgbState);
                }
                if (object.rgbIndicator != null) {
                    if (typeof object.rgbIndicator !== "object")
                        throw TypeError(".UsbComm.MessageD2H.rgbIndicator: object expected");
                    message.rgbIndicator = $root.UsbComm.RgbIndicator.fromObject(object.rgbIndicator);
                }
                if (object.einkImage != null) {
                    if (typeof object.einkImage !== "object")
                        throw TypeError(".UsbComm.MessageD2H.einkImage: object expected");
                    message.einkImage = $root.UsbComm.EinkImage.fromObject(object.einkImage);
                }
                return message;
            };
    
            /**
             * Creates a plain object from a MessageD2H message. Also converts values to other types if specified.
             * @function toObject
             * @memberof UsbComm.MessageD2H
             * @static
             * @param {UsbComm.MessageD2H} message MessageD2H
             * @param {$protobuf.IConversionOptions} [options] Conversion options
             * @returns {Object.<string,*>} Plain object
             */
            MessageD2H.toObject = function toObject(message, options) {
                if (!options)
                    options = {};
                var object = {};
                if (options.defaults)
                    object.action = options.enums === String ? "NOP" : 0;
                if (message.action != null && message.hasOwnProperty("action"))
                    object.action = options.enums === String ? $root.UsbComm.Action[message.action] === undefined ? message.action : $root.UsbComm.Action[message.action] : message.action;
                if (message.nop != null && message.hasOwnProperty("nop")) {
                    object.nop = $root.UsbComm.Nop.toObject(message.nop, options);
                    if (options.oneofs)
                        object.payload = "nop";
                }
                if (message.version != null && message.hasOwnProperty("version")) {
                    object.version = $root.UsbComm.Version.toObject(message.version, options);
                    if (options.oneofs)
                        object.payload = "version";
                }
                if (message.motorState != null && message.hasOwnProperty("motorState")) {
                    object.motorState = $root.UsbComm.MotorState.toObject(message.motorState, options);
                    if (options.oneofs)
                        object.payload = "motorState";
                }
                if (message.knobConfig != null && message.hasOwnProperty("knobConfig")) {
                    object.knobConfig = $root.UsbComm.KnobConfig.toObject(message.knobConfig, options);
                    if (options.oneofs)
                        object.payload = "knobConfig";
                }
                if (message.rgbState != null && message.hasOwnProperty("rgbState")) {
                    object.rgbState = $root.UsbComm.RgbState.toObject(message.rgbState, options);
                    if (options.oneofs)
                        object.payload = "rgbState";
                }
                if (message.einkImage != null && message.hasOwnProperty("einkImage")) {
                    object.einkImage = $root.UsbComm.EinkImage.toObject(message.einkImage, options);
                    if (options.oneofs)
                        object.payload = "einkImage";
                }
                if (message.knobPref != null && message.hasOwnProperty("knobPref")) {
                    object.knobPref = $root.UsbComm.KnobConfig.Pref.toObject(message.knobPref, options);
                    if (options.oneofs)
                        object.payload = "knobPref";
                }
                if (message.rgbIndicator != null && message.hasOwnProperty("rgbIndicator")) {
                    object.rgbIndicator = $root.UsbComm.RgbIndicator.toObject(message.rgbIndicator, options);
                    if (options.oneofs)
                        object.payload = "rgbIndicator";
                }
                return object;
            };
    
            /**
             * Converts this MessageD2H to JSON.
             * @function toJSON
             * @memberof UsbComm.MessageD2H
             * @instance
             * @returns {Object.<string,*>} JSON object
             */
            MessageD2H.prototype.toJSON = function toJSON() {
                return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
            };
    
            /**
             * Gets the default type url for MessageD2H
             * @function getTypeUrl
             * @memberof UsbComm.MessageD2H
             * @static
             * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
             * @returns {string} The default type url
             */
            MessageD2H.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
                if (typeUrlPrefix === undefined) {
                    typeUrlPrefix = "type.googleapis.com";
                }
                return typeUrlPrefix + "/UsbComm.MessageD2H";
            };
    
            return MessageD2H;
        })();
    
        UsbComm.Nop = (function() {
    
            /**
             * Properties of a Nop.
             * @memberof UsbComm
             * @interface INop
             */
    
            /**
             * Constructs a new Nop.
             * @memberof UsbComm
             * @classdesc Represents a Nop.
             * @implements INop
             * @constructor
             * @param {UsbComm.INop=} [properties] Properties to set
             */
            function Nop(properties) {
                if (properties)
                    for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                        if (properties[keys[i]] != null)
                            this[keys[i]] = properties[keys[i]];
            }
    
            /**
             * Creates a new Nop instance using the specified properties.
             * @function create
             * @memberof UsbComm.Nop
             * @static
             * @param {UsbComm.INop=} [properties] Properties to set
             * @returns {UsbComm.Nop} Nop instance
             */
            Nop.create = function create(properties) {
                return new Nop(properties);
            };
    
            /**
             * Encodes the specified Nop message. Does not implicitly {@link UsbComm.Nop.verify|verify} messages.
             * @function encode
             * @memberof UsbComm.Nop
             * @static
             * @param {UsbComm.INop} message Nop message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            Nop.encode = function encode(message, writer) {
                if (!writer)
                    writer = $Writer.create();
                return writer;
            };
    
            /**
             * Encodes the specified Nop message, length delimited. Does not implicitly {@link UsbComm.Nop.verify|verify} messages.
             * @function encodeDelimited
             * @memberof UsbComm.Nop
             * @static
             * @param {UsbComm.INop} message Nop message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            Nop.encodeDelimited = function encodeDelimited(message, writer) {
                return this.encode(message, writer).ldelim();
            };
    
            /**
             * Decodes a Nop message from the specified reader or buffer.
             * @function decode
             * @memberof UsbComm.Nop
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @param {number} [length] Message length if known beforehand
             * @returns {UsbComm.Nop} Nop
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            Nop.decode = function decode(reader, length) {
                if (!(reader instanceof $Reader))
                    reader = $Reader.create(reader);
                var end = length === undefined ? reader.len : reader.pos + length, message = new $root.UsbComm.Nop();
                while (reader.pos < end) {
                    var tag = reader.uint32();
                    switch (tag >>> 3) {
                    default:
                        reader.skipType(tag & 7);
                        break;
                    }
                }
                return message;
            };
    
            /**
             * Decodes a Nop message from the specified reader or buffer, length delimited.
             * @function decodeDelimited
             * @memberof UsbComm.Nop
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @returns {UsbComm.Nop} Nop
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            Nop.decodeDelimited = function decodeDelimited(reader) {
                if (!(reader instanceof $Reader))
                    reader = new $Reader(reader);
                return this.decode(reader, reader.uint32());
            };
    
            /**
             * Verifies a Nop message.
             * @function verify
             * @memberof UsbComm.Nop
             * @static
             * @param {Object.<string,*>} message Plain object to verify
             * @returns {string|null} `null` if valid, otherwise the reason why it is not
             */
            Nop.verify = function verify(message) {
                if (typeof message !== "object" || message === null)
                    return "object expected";
                return null;
            };
    
            /**
             * Creates a Nop message from a plain object. Also converts values to their respective internal types.
             * @function fromObject
             * @memberof UsbComm.Nop
             * @static
             * @param {Object.<string,*>} object Plain object
             * @returns {UsbComm.Nop} Nop
             */
            Nop.fromObject = function fromObject(object) {
                if (object instanceof $root.UsbComm.Nop)
                    return object;
                return new $root.UsbComm.Nop();
            };
    
            /**
             * Creates a plain object from a Nop message. Also converts values to other types if specified.
             * @function toObject
             * @memberof UsbComm.Nop
             * @static
             * @param {UsbComm.Nop} message Nop
             * @param {$protobuf.IConversionOptions} [options] Conversion options
             * @returns {Object.<string,*>} Plain object
             */
            Nop.toObject = function toObject() {
                return {};
            };
    
            /**
             * Converts this Nop to JSON.
             * @function toJSON
             * @memberof UsbComm.Nop
             * @instance
             * @returns {Object.<string,*>} JSON object
             */
            Nop.prototype.toJSON = function toJSON() {
                return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
            };
    
            /**
             * Gets the default type url for Nop
             * @function getTypeUrl
             * @memberof UsbComm.Nop
             * @static
             * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
             * @returns {string} The default type url
             */
            Nop.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
                if (typeUrlPrefix === undefined) {
                    typeUrlPrefix = "type.googleapis.com";
                }
                return typeUrlPrefix + "/UsbComm.Nop";
            };
    
            return Nop;
        })();
    
        UsbComm.Version = (function() {
    
            /**
             * Properties of a Version.
             * @memberof UsbComm
             * @interface IVersion
             * @property {string} zephyrVersion Version zephyrVersion
             * @property {string} zmkVersion Version zmkVersion
             * @property {string} appVersion Version appVersion
             * @property {UsbComm.Version.IFeatures|null} [features] Version features
             */
    
            /**
             * Constructs a new Version.
             * @memberof UsbComm
             * @classdesc Represents a Version.
             * @implements IVersion
             * @constructor
             * @param {UsbComm.IVersion=} [properties] Properties to set
             */
            function Version(properties) {
                if (properties)
                    for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                        if (properties[keys[i]] != null)
                            this[keys[i]] = properties[keys[i]];
            }
    
            /**
             * Version zephyrVersion.
             * @member {string} zephyrVersion
             * @memberof UsbComm.Version
             * @instance
             */
            Version.prototype.zephyrVersion = "";
    
            /**
             * Version zmkVersion.
             * @member {string} zmkVersion
             * @memberof UsbComm.Version
             * @instance
             */
            Version.prototype.zmkVersion = "";
    
            /**
             * Version appVersion.
             * @member {string} appVersion
             * @memberof UsbComm.Version
             * @instance
             */
            Version.prototype.appVersion = "";
    
            /**
             * Version features.
             * @member {UsbComm.Version.IFeatures|null|undefined} features
             * @memberof UsbComm.Version
             * @instance
             */
            Version.prototype.features = null;
    
            /**
             * Creates a new Version instance using the specified properties.
             * @function create
             * @memberof UsbComm.Version
             * @static
             * @param {UsbComm.IVersion=} [properties] Properties to set
             * @returns {UsbComm.Version} Version instance
             */
            Version.create = function create(properties) {
                return new Version(properties);
            };
    
            /**
             * Encodes the specified Version message. Does not implicitly {@link UsbComm.Version.verify|verify} messages.
             * @function encode
             * @memberof UsbComm.Version
             * @static
             * @param {UsbComm.IVersion} message Version message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            Version.encode = function encode(message, writer) {
                if (!writer)
                    writer = $Writer.create();
                writer.uint32(/* id 1, wireType 2 =*/10).string(message.zephyrVersion);
                writer.uint32(/* id 2, wireType 2 =*/18).string(message.zmkVersion);
                writer.uint32(/* id 3, wireType 2 =*/26).string(message.appVersion);
                if (message.features != null && Object.hasOwnProperty.call(message, "features"))
                    $root.UsbComm.Version.Features.encode(message.features, writer.uint32(/* id 4, wireType 2 =*/34).fork()).ldelim();
                return writer;
            };
    
            /**
             * Encodes the specified Version message, length delimited. Does not implicitly {@link UsbComm.Version.verify|verify} messages.
             * @function encodeDelimited
             * @memberof UsbComm.Version
             * @static
             * @param {UsbComm.IVersion} message Version message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            Version.encodeDelimited = function encodeDelimited(message, writer) {
                return this.encode(message, writer).ldelim();
            };
    
            /**
             * Decodes a Version message from the specified reader or buffer.
             * @function decode
             * @memberof UsbComm.Version
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @param {number} [length] Message length if known beforehand
             * @returns {UsbComm.Version} Version
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            Version.decode = function decode(reader, length) {
                if (!(reader instanceof $Reader))
                    reader = $Reader.create(reader);
                var end = length === undefined ? reader.len : reader.pos + length, message = new $root.UsbComm.Version();
                while (reader.pos < end) {
                    var tag = reader.uint32();
                    switch (tag >>> 3) {
                    case 1: {
                            message.zephyrVersion = reader.string();
                            break;
                        }
                    case 2: {
                            message.zmkVersion = reader.string();
                            break;
                        }
                    case 3: {
                            message.appVersion = reader.string();
                            break;
                        }
                    case 4: {
                            message.features = $root.UsbComm.Version.Features.decode(reader, reader.uint32());
                            break;
                        }
                    default:
                        reader.skipType(tag & 7);
                        break;
                    }
                }
                if (!message.hasOwnProperty("zephyrVersion"))
                    throw $util.ProtocolError("missing required 'zephyrVersion'", { instance: message });
                if (!message.hasOwnProperty("zmkVersion"))
                    throw $util.ProtocolError("missing required 'zmkVersion'", { instance: message });
                if (!message.hasOwnProperty("appVersion"))
                    throw $util.ProtocolError("missing required 'appVersion'", { instance: message });
                return message;
            };
    
            /**
             * Decodes a Version message from the specified reader or buffer, length delimited.
             * @function decodeDelimited
             * @memberof UsbComm.Version
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @returns {UsbComm.Version} Version
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            Version.decodeDelimited = function decodeDelimited(reader) {
                if (!(reader instanceof $Reader))
                    reader = new $Reader(reader);
                return this.decode(reader, reader.uint32());
            };
    
            /**
             * Verifies a Version message.
             * @function verify
             * @memberof UsbComm.Version
             * @static
             * @param {Object.<string,*>} message Plain object to verify
             * @returns {string|null} `null` if valid, otherwise the reason why it is not
             */
            Version.verify = function verify(message) {
                if (typeof message !== "object" || message === null)
                    return "object expected";
                if (!$util.isString(message.zephyrVersion))
                    return "zephyrVersion: string expected";
                if (!$util.isString(message.zmkVersion))
                    return "zmkVersion: string expected";
                if (!$util.isString(message.appVersion))
                    return "appVersion: string expected";
                if (message.features != null && message.hasOwnProperty("features")) {
                    var error = $root.UsbComm.Version.Features.verify(message.features);
                    if (error)
                        return "features." + error;
                }
                return null;
            };
    
            /**
             * Creates a Version message from a plain object. Also converts values to their respective internal types.
             * @function fromObject
             * @memberof UsbComm.Version
             * @static
             * @param {Object.<string,*>} object Plain object
             * @returns {UsbComm.Version} Version
             */
            Version.fromObject = function fromObject(object) {
                if (object instanceof $root.UsbComm.Version)
                    return object;
                var message = new $root.UsbComm.Version();
                if (object.zephyrVersion != null)
                    message.zephyrVersion = String(object.zephyrVersion);
                if (object.zmkVersion != null)
                    message.zmkVersion = String(object.zmkVersion);
                if (object.appVersion != null)
                    message.appVersion = String(object.appVersion);
                if (object.features != null) {
                    if (typeof object.features !== "object")
                        throw TypeError(".UsbComm.Version.features: object expected");
                    message.features = $root.UsbComm.Version.Features.fromObject(object.features);
                }
                return message;
            };
    
            /**
             * Creates a plain object from a Version message. Also converts values to other types if specified.
             * @function toObject
             * @memberof UsbComm.Version
             * @static
             * @param {UsbComm.Version} message Version
             * @param {$protobuf.IConversionOptions} [options] Conversion options
             * @returns {Object.<string,*>} Plain object
             */
            Version.toObject = function toObject(message, options) {
                if (!options)
                    options = {};
                var object = {};
                if (options.defaults) {
                    object.zephyrVersion = "";
                    object.zmkVersion = "";
                    object.appVersion = "";
                    object.features = null;
                }
                if (message.zephyrVersion != null && message.hasOwnProperty("zephyrVersion"))
                    object.zephyrVersion = message.zephyrVersion;
                if (message.zmkVersion != null && message.hasOwnProperty("zmkVersion"))
                    object.zmkVersion = message.zmkVersion;
                if (message.appVersion != null && message.hasOwnProperty("appVersion"))
                    object.appVersion = message.appVersion;
                if (message.features != null && message.hasOwnProperty("features"))
                    object.features = $root.UsbComm.Version.Features.toObject(message.features, options);
                return object;
            };
    
            /**
             * Converts this Version to JSON.
             * @function toJSON
             * @memberof UsbComm.Version
             * @instance
             * @returns {Object.<string,*>} JSON object
             */
            Version.prototype.toJSON = function toJSON() {
                return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
            };
    
            /**
             * Gets the default type url for Version
             * @function getTypeUrl
             * @memberof UsbComm.Version
             * @static
             * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
             * @returns {string} The default type url
             */
            Version.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
                if (typeUrlPrefix === undefined) {
                    typeUrlPrefix = "type.googleapis.com";
                }
                return typeUrlPrefix + "/UsbComm.Version";
            };
    
            Version.Features = (function() {
    
                /**
                 * Properties of a Features.
                 * @memberof UsbComm.Version
                 * @interface IFeatures
                 * @property {boolean|null} [rgb] Features rgb
                 * @property {boolean|null} [rgbFullControl] Features rgbFullControl
                 * @property {boolean|null} [rgbIndicator] Features rgbIndicator
                 * @property {boolean|null} [eink] Features eink
                 * @property {boolean|null} [knob] Features knob
                 * @property {boolean|null} [knobPrefs] Features knobPrefs
                 */
    
                /**
                 * Constructs a new Features.
                 * @memberof UsbComm.Version
                 * @classdesc Represents a Features.
                 * @implements IFeatures
                 * @constructor
                 * @param {UsbComm.Version.IFeatures=} [properties] Properties to set
                 */
                function Features(properties) {
                    if (properties)
                        for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                            if (properties[keys[i]] != null)
                                this[keys[i]] = properties[keys[i]];
                }
    
                /**
                 * Features rgb.
                 * @member {boolean} rgb
                 * @memberof UsbComm.Version.Features
                 * @instance
                 */
                Features.prototype.rgb = false;
    
                /**
                 * Features rgbFullControl.
                 * @member {boolean} rgbFullControl
                 * @memberof UsbComm.Version.Features
                 * @instance
                 */
                Features.prototype.rgbFullControl = false;
    
                /**
                 * Features rgbIndicator.
                 * @member {boolean} rgbIndicator
                 * @memberof UsbComm.Version.Features
                 * @instance
                 */
                Features.prototype.rgbIndicator = false;
    
                /**
                 * Features eink.
                 * @member {boolean} eink
                 * @memberof UsbComm.Version.Features
                 * @instance
                 */
                Features.prototype.eink = false;
    
                /**
                 * Features knob.
                 * @member {boolean} knob
                 * @memberof UsbComm.Version.Features
                 * @instance
                 */
                Features.prototype.knob = false;
    
                /**
                 * Features knobPrefs.
                 * @member {boolean} knobPrefs
                 * @memberof UsbComm.Version.Features
                 * @instance
                 */
                Features.prototype.knobPrefs = false;
    
                /**
                 * Creates a new Features instance using the specified properties.
                 * @function create
                 * @memberof UsbComm.Version.Features
                 * @static
                 * @param {UsbComm.Version.IFeatures=} [properties] Properties to set
                 * @returns {UsbComm.Version.Features} Features instance
                 */
                Features.create = function create(properties) {
                    return new Features(properties);
                };
    
                /**
                 * Encodes the specified Features message. Does not implicitly {@link UsbComm.Version.Features.verify|verify} messages.
                 * @function encode
                 * @memberof UsbComm.Version.Features
                 * @static
                 * @param {UsbComm.Version.IFeatures} message Features message or plain object to encode
                 * @param {$protobuf.Writer} [writer] Writer to encode to
                 * @returns {$protobuf.Writer} Writer
                 */
                Features.encode = function encode(message, writer) {
                    if (!writer)
                        writer = $Writer.create();
                    if (message.rgb != null && Object.hasOwnProperty.call(message, "rgb"))
                        writer.uint32(/* id 1, wireType 0 =*/8).bool(message.rgb);
                    if (message.eink != null && Object.hasOwnProperty.call(message, "eink"))
                        writer.uint32(/* id 2, wireType 0 =*/16).bool(message.eink);
                    if (message.knob != null && Object.hasOwnProperty.call(message, "knob"))
                        writer.uint32(/* id 3, wireType 0 =*/24).bool(message.knob);
                    if (message.knobPrefs != null && Object.hasOwnProperty.call(message, "knobPrefs"))
                        writer.uint32(/* id 4, wireType 0 =*/32).bool(message.knobPrefs);
                    if (message.rgbFullControl != null && Object.hasOwnProperty.call(message, "rgbFullControl"))
                        writer.uint32(/* id 5, wireType 0 =*/40).bool(message.rgbFullControl);
                    if (message.rgbIndicator != null && Object.hasOwnProperty.call(message, "rgbIndicator"))
                        writer.uint32(/* id 6, wireType 0 =*/48).bool(message.rgbIndicator);
                    return writer;
                };
    
                /**
                 * Encodes the specified Features message, length delimited. Does not implicitly {@link UsbComm.Version.Features.verify|verify} messages.
                 * @function encodeDelimited
                 * @memberof UsbComm.Version.Features
                 * @static
                 * @param {UsbComm.Version.IFeatures} message Features message or plain object to encode
                 * @param {$protobuf.Writer} [writer] Writer to encode to
                 * @returns {$protobuf.Writer} Writer
                 */
                Features.encodeDelimited = function encodeDelimited(message, writer) {
                    return this.encode(message, writer).ldelim();
                };
    
                /**
                 * Decodes a Features message from the specified reader or buffer.
                 * @function decode
                 * @memberof UsbComm.Version.Features
                 * @static
                 * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
                 * @param {number} [length] Message length if known beforehand
                 * @returns {UsbComm.Version.Features} Features
                 * @throws {Error} If the payload is not a reader or valid buffer
                 * @throws {$protobuf.util.ProtocolError} If required fields are missing
                 */
                Features.decode = function decode(reader, length) {
                    if (!(reader instanceof $Reader))
                        reader = $Reader.create(reader);
                    var end = length === undefined ? reader.len : reader.pos + length, message = new $root.UsbComm.Version.Features();
                    while (reader.pos < end) {
                        var tag = reader.uint32();
                        switch (tag >>> 3) {
                        case 1: {
                                message.rgb = reader.bool();
                                break;
                            }
                        case 5: {
                                message.rgbFullControl = reader.bool();
                                break;
                            }
                        case 6: {
                                message.rgbIndicator = reader.bool();
                                break;
                            }
                        case 2: {
                                message.eink = reader.bool();
                                break;
                            }
                        case 3: {
                                message.knob = reader.bool();
                                break;
                            }
                        case 4: {
                                message.knobPrefs = reader.bool();
                                break;
                            }
                        default:
                            reader.skipType(tag & 7);
                            break;
                        }
                    }
                    return message;
                };
    
                /**
                 * Decodes a Features message from the specified reader or buffer, length delimited.
                 * @function decodeDelimited
                 * @memberof UsbComm.Version.Features
                 * @static
                 * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
                 * @returns {UsbComm.Version.Features} Features
                 * @throws {Error} If the payload is not a reader or valid buffer
                 * @throws {$protobuf.util.ProtocolError} If required fields are missing
                 */
                Features.decodeDelimited = function decodeDelimited(reader) {
                    if (!(reader instanceof $Reader))
                        reader = new $Reader(reader);
                    return this.decode(reader, reader.uint32());
                };
    
                /**
                 * Verifies a Features message.
                 * @function verify
                 * @memberof UsbComm.Version.Features
                 * @static
                 * @param {Object.<string,*>} message Plain object to verify
                 * @returns {string|null} `null` if valid, otherwise the reason why it is not
                 */
                Features.verify = function verify(message) {
                    if (typeof message !== "object" || message === null)
                        return "object expected";
                    if (message.rgb != null && message.hasOwnProperty("rgb"))
                        if (typeof message.rgb !== "boolean")
                            return "rgb: boolean expected";
                    if (message.rgbFullControl != null && message.hasOwnProperty("rgbFullControl"))
                        if (typeof message.rgbFullControl !== "boolean")
                            return "rgbFullControl: boolean expected";
                    if (message.rgbIndicator != null && message.hasOwnProperty("rgbIndicator"))
                        if (typeof message.rgbIndicator !== "boolean")
                            return "rgbIndicator: boolean expected";
                    if (message.eink != null && message.hasOwnProperty("eink"))
                        if (typeof message.eink !== "boolean")
                            return "eink: boolean expected";
                    if (message.knob != null && message.hasOwnProperty("knob"))
                        if (typeof message.knob !== "boolean")
                            return "knob: boolean expected";
                    if (message.knobPrefs != null && message.hasOwnProperty("knobPrefs"))
                        if (typeof message.knobPrefs !== "boolean")
                            return "knobPrefs: boolean expected";
                    return null;
                };
    
                /**
                 * Creates a Features message from a plain object. Also converts values to their respective internal types.
                 * @function fromObject
                 * @memberof UsbComm.Version.Features
                 * @static
                 * @param {Object.<string,*>} object Plain object
                 * @returns {UsbComm.Version.Features} Features
                 */
                Features.fromObject = function fromObject(object) {
                    if (object instanceof $root.UsbComm.Version.Features)
                        return object;
                    var message = new $root.UsbComm.Version.Features();
                    if (object.rgb != null)
                        message.rgb = Boolean(object.rgb);
                    if (object.rgbFullControl != null)
                        message.rgbFullControl = Boolean(object.rgbFullControl);
                    if (object.rgbIndicator != null)
                        message.rgbIndicator = Boolean(object.rgbIndicator);
                    if (object.eink != null)
                        message.eink = Boolean(object.eink);
                    if (object.knob != null)
                        message.knob = Boolean(object.knob);
                    if (object.knobPrefs != null)
                        message.knobPrefs = Boolean(object.knobPrefs);
                    return message;
                };
    
                /**
                 * Creates a plain object from a Features message. Also converts values to other types if specified.
                 * @function toObject
                 * @memberof UsbComm.Version.Features
                 * @static
                 * @param {UsbComm.Version.Features} message Features
                 * @param {$protobuf.IConversionOptions} [options] Conversion options
                 * @returns {Object.<string,*>} Plain object
                 */
                Features.toObject = function toObject(message, options) {
                    if (!options)
                        options = {};
                    var object = {};
                    if (options.defaults) {
                        object.rgb = false;
                        object.eink = false;
                        object.knob = false;
                        object.knobPrefs = false;
                        object.rgbFullControl = false;
                        object.rgbIndicator = false;
                    }
                    if (message.rgb != null && message.hasOwnProperty("rgb"))
                        object.rgb = message.rgb;
                    if (message.eink != null && message.hasOwnProperty("eink"))
                        object.eink = message.eink;
                    if (message.knob != null && message.hasOwnProperty("knob"))
                        object.knob = message.knob;
                    if (message.knobPrefs != null && message.hasOwnProperty("knobPrefs"))
                        object.knobPrefs = message.knobPrefs;
                    if (message.rgbFullControl != null && message.hasOwnProperty("rgbFullControl"))
                        object.rgbFullControl = message.rgbFullControl;
                    if (message.rgbIndicator != null && message.hasOwnProperty("rgbIndicator"))
                        object.rgbIndicator = message.rgbIndicator;
                    return object;
                };
    
                /**
                 * Converts this Features to JSON.
                 * @function toJSON
                 * @memberof UsbComm.Version.Features
                 * @instance
                 * @returns {Object.<string,*>} JSON object
                 */
                Features.prototype.toJSON = function toJSON() {
                    return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
                };
    
                /**
                 * Gets the default type url for Features
                 * @function getTypeUrl
                 * @memberof UsbComm.Version.Features
                 * @static
                 * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
                 * @returns {string} The default type url
                 */
                Features.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
                    if (typeUrlPrefix === undefined) {
                        typeUrlPrefix = "type.googleapis.com";
                    }
                    return typeUrlPrefix + "/UsbComm.Version.Features";
                };
    
                return Features;
            })();
    
            return Version;
        })();
    
        UsbComm.MotorState = (function() {
    
            /**
             * Properties of a MotorState.
             * @memberof UsbComm
             * @interface IMotorState
             * @property {number} timestamp MotorState timestamp
             * @property {UsbComm.MotorState.ControlMode} controlMode MotorState controlMode
             * @property {number} currentAngle MotorState currentAngle
             * @property {number} currentVelocity MotorState currentVelocity
             * @property {number} targetAngle MotorState targetAngle
             * @property {number} targetVelocity MotorState targetVelocity
             * @property {number} targetVoltage MotorState targetVoltage
             */
    
            /**
             * Constructs a new MotorState.
             * @memberof UsbComm
             * @classdesc Represents a MotorState.
             * @implements IMotorState
             * @constructor
             * @param {UsbComm.IMotorState=} [properties] Properties to set
             */
            function MotorState(properties) {
                if (properties)
                    for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                        if (properties[keys[i]] != null)
                            this[keys[i]] = properties[keys[i]];
            }
    
            /**
             * MotorState timestamp.
             * @member {number} timestamp
             * @memberof UsbComm.MotorState
             * @instance
             */
            MotorState.prototype.timestamp = 0;
    
            /**
             * MotorState controlMode.
             * @member {UsbComm.MotorState.ControlMode} controlMode
             * @memberof UsbComm.MotorState
             * @instance
             */
            MotorState.prototype.controlMode = 0;
    
            /**
             * MotorState currentAngle.
             * @member {number} currentAngle
             * @memberof UsbComm.MotorState
             * @instance
             */
            MotorState.prototype.currentAngle = 0;
    
            /**
             * MotorState currentVelocity.
             * @member {number} currentVelocity
             * @memberof UsbComm.MotorState
             * @instance
             */
            MotorState.prototype.currentVelocity = 0;
    
            /**
             * MotorState targetAngle.
             * @member {number} targetAngle
             * @memberof UsbComm.MotorState
             * @instance
             */
            MotorState.prototype.targetAngle = 0;
    
            /**
             * MotorState targetVelocity.
             * @member {number} targetVelocity
             * @memberof UsbComm.MotorState
             * @instance
             */
            MotorState.prototype.targetVelocity = 0;
    
            /**
             * MotorState targetVoltage.
             * @member {number} targetVoltage
             * @memberof UsbComm.MotorState
             * @instance
             */
            MotorState.prototype.targetVoltage = 0;
    
            /**
             * Creates a new MotorState instance using the specified properties.
             * @function create
             * @memberof UsbComm.MotorState
             * @static
             * @param {UsbComm.IMotorState=} [properties] Properties to set
             * @returns {UsbComm.MotorState} MotorState instance
             */
            MotorState.create = function create(properties) {
                return new MotorState(properties);
            };
    
            /**
             * Encodes the specified MotorState message. Does not implicitly {@link UsbComm.MotorState.verify|verify} messages.
             * @function encode
             * @memberof UsbComm.MotorState
             * @static
             * @param {UsbComm.IMotorState} message MotorState message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            MotorState.encode = function encode(message, writer) {
                if (!writer)
                    writer = $Writer.create();
                writer.uint32(/* id 1, wireType 0 =*/8).uint32(message.timestamp);
                writer.uint32(/* id 2, wireType 0 =*/16).int32(message.controlMode);
                writer.uint32(/* id 3, wireType 5 =*/29).float(message.currentAngle);
                writer.uint32(/* id 4, wireType 5 =*/37).float(message.currentVelocity);
                writer.uint32(/* id 5, wireType 5 =*/45).float(message.targetAngle);
                writer.uint32(/* id 6, wireType 5 =*/53).float(message.targetVelocity);
                writer.uint32(/* id 7, wireType 5 =*/61).float(message.targetVoltage);
                return writer;
            };
    
            /**
             * Encodes the specified MotorState message, length delimited. Does not implicitly {@link UsbComm.MotorState.verify|verify} messages.
             * @function encodeDelimited
             * @memberof UsbComm.MotorState
             * @static
             * @param {UsbComm.IMotorState} message MotorState message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            MotorState.encodeDelimited = function encodeDelimited(message, writer) {
                return this.encode(message, writer).ldelim();
            };
    
            /**
             * Decodes a MotorState message from the specified reader or buffer.
             * @function decode
             * @memberof UsbComm.MotorState
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @param {number} [length] Message length if known beforehand
             * @returns {UsbComm.MotorState} MotorState
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            MotorState.decode = function decode(reader, length) {
                if (!(reader instanceof $Reader))
                    reader = $Reader.create(reader);
                var end = length === undefined ? reader.len : reader.pos + length, message = new $root.UsbComm.MotorState();
                while (reader.pos < end) {
                    var tag = reader.uint32();
                    switch (tag >>> 3) {
                    case 1: {
                            message.timestamp = reader.uint32();
                            break;
                        }
                    case 2: {
                            message.controlMode = reader.int32();
                            break;
                        }
                    case 3: {
                            message.currentAngle = reader.float();
                            break;
                        }
                    case 4: {
                            message.currentVelocity = reader.float();
                            break;
                        }
                    case 5: {
                            message.targetAngle = reader.float();
                            break;
                        }
                    case 6: {
                            message.targetVelocity = reader.float();
                            break;
                        }
                    case 7: {
                            message.targetVoltage = reader.float();
                            break;
                        }
                    default:
                        reader.skipType(tag & 7);
                        break;
                    }
                }
                if (!message.hasOwnProperty("timestamp"))
                    throw $util.ProtocolError("missing required 'timestamp'", { instance: message });
                if (!message.hasOwnProperty("controlMode"))
                    throw $util.ProtocolError("missing required 'controlMode'", { instance: message });
                if (!message.hasOwnProperty("currentAngle"))
                    throw $util.ProtocolError("missing required 'currentAngle'", { instance: message });
                if (!message.hasOwnProperty("currentVelocity"))
                    throw $util.ProtocolError("missing required 'currentVelocity'", { instance: message });
                if (!message.hasOwnProperty("targetAngle"))
                    throw $util.ProtocolError("missing required 'targetAngle'", { instance: message });
                if (!message.hasOwnProperty("targetVelocity"))
                    throw $util.ProtocolError("missing required 'targetVelocity'", { instance: message });
                if (!message.hasOwnProperty("targetVoltage"))
                    throw $util.ProtocolError("missing required 'targetVoltage'", { instance: message });
                return message;
            };
    
            /**
             * Decodes a MotorState message from the specified reader or buffer, length delimited.
             * @function decodeDelimited
             * @memberof UsbComm.MotorState
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @returns {UsbComm.MotorState} MotorState
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            MotorState.decodeDelimited = function decodeDelimited(reader) {
                if (!(reader instanceof $Reader))
                    reader = new $Reader(reader);
                return this.decode(reader, reader.uint32());
            };
    
            /**
             * Verifies a MotorState message.
             * @function verify
             * @memberof UsbComm.MotorState
             * @static
             * @param {Object.<string,*>} message Plain object to verify
             * @returns {string|null} `null` if valid, otherwise the reason why it is not
             */
            MotorState.verify = function verify(message) {
                if (typeof message !== "object" || message === null)
                    return "object expected";
                if (!$util.isInteger(message.timestamp))
                    return "timestamp: integer expected";
                switch (message.controlMode) {
                default:
                    return "controlMode: enum value expected";
                case 0:
                case 1:
                case 2:
                    break;
                }
                if (typeof message.currentAngle !== "number")
                    return "currentAngle: number expected";
                if (typeof message.currentVelocity !== "number")
                    return "currentVelocity: number expected";
                if (typeof message.targetAngle !== "number")
                    return "targetAngle: number expected";
                if (typeof message.targetVelocity !== "number")
                    return "targetVelocity: number expected";
                if (typeof message.targetVoltage !== "number")
                    return "targetVoltage: number expected";
                return null;
            };
    
            /**
             * Creates a MotorState message from a plain object. Also converts values to their respective internal types.
             * @function fromObject
             * @memberof UsbComm.MotorState
             * @static
             * @param {Object.<string,*>} object Plain object
             * @returns {UsbComm.MotorState} MotorState
             */
            MotorState.fromObject = function fromObject(object) {
                if (object instanceof $root.UsbComm.MotorState)
                    return object;
                var message = new $root.UsbComm.MotorState();
                if (object.timestamp != null)
                    message.timestamp = object.timestamp >>> 0;
                switch (object.controlMode) {
                default:
                    if (typeof object.controlMode === "number") {
                        message.controlMode = object.controlMode;
                        break;
                    }
                    break;
                case "TORQUE":
                case 0:
                    message.controlMode = 0;
                    break;
                case "VELOCITY":
                case 1:
                    message.controlMode = 1;
                    break;
                case "ANGLE":
                case 2:
                    message.controlMode = 2;
                    break;
                }
                if (object.currentAngle != null)
                    message.currentAngle = Number(object.currentAngle);
                if (object.currentVelocity != null)
                    message.currentVelocity = Number(object.currentVelocity);
                if (object.targetAngle != null)
                    message.targetAngle = Number(object.targetAngle);
                if (object.targetVelocity != null)
                    message.targetVelocity = Number(object.targetVelocity);
                if (object.targetVoltage != null)
                    message.targetVoltage = Number(object.targetVoltage);
                return message;
            };
    
            /**
             * Creates a plain object from a MotorState message. Also converts values to other types if specified.
             * @function toObject
             * @memberof UsbComm.MotorState
             * @static
             * @param {UsbComm.MotorState} message MotorState
             * @param {$protobuf.IConversionOptions} [options] Conversion options
             * @returns {Object.<string,*>} Plain object
             */
            MotorState.toObject = function toObject(message, options) {
                if (!options)
                    options = {};
                var object = {};
                if (options.defaults) {
                    object.timestamp = 0;
                    object.controlMode = options.enums === String ? "TORQUE" : 0;
                    object.currentAngle = 0;
                    object.currentVelocity = 0;
                    object.targetAngle = 0;
                    object.targetVelocity = 0;
                    object.targetVoltage = 0;
                }
                if (message.timestamp != null && message.hasOwnProperty("timestamp"))
                    object.timestamp = message.timestamp;
                if (message.controlMode != null && message.hasOwnProperty("controlMode"))
                    object.controlMode = options.enums === String ? $root.UsbComm.MotorState.ControlMode[message.controlMode] === undefined ? message.controlMode : $root.UsbComm.MotorState.ControlMode[message.controlMode] : message.controlMode;
                if (message.currentAngle != null && message.hasOwnProperty("currentAngle"))
                    object.currentAngle = options.json && !isFinite(message.currentAngle) ? String(message.currentAngle) : message.currentAngle;
                if (message.currentVelocity != null && message.hasOwnProperty("currentVelocity"))
                    object.currentVelocity = options.json && !isFinite(message.currentVelocity) ? String(message.currentVelocity) : message.currentVelocity;
                if (message.targetAngle != null && message.hasOwnProperty("targetAngle"))
                    object.targetAngle = options.json && !isFinite(message.targetAngle) ? String(message.targetAngle) : message.targetAngle;
                if (message.targetVelocity != null && message.hasOwnProperty("targetVelocity"))
                    object.targetVelocity = options.json && !isFinite(message.targetVelocity) ? String(message.targetVelocity) : message.targetVelocity;
                if (message.targetVoltage != null && message.hasOwnProperty("targetVoltage"))
                    object.targetVoltage = options.json && !isFinite(message.targetVoltage) ? String(message.targetVoltage) : message.targetVoltage;
                return object;
            };
    
            /**
             * Converts this MotorState to JSON.
             * @function toJSON
             * @memberof UsbComm.MotorState
             * @instance
             * @returns {Object.<string,*>} JSON object
             */
            MotorState.prototype.toJSON = function toJSON() {
                return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
            };
    
            /**
             * Gets the default type url for MotorState
             * @function getTypeUrl
             * @memberof UsbComm.MotorState
             * @static
             * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
             * @returns {string} The default type url
             */
            MotorState.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
                if (typeUrlPrefix === undefined) {
                    typeUrlPrefix = "type.googleapis.com";
                }
                return typeUrlPrefix + "/UsbComm.MotorState";
            };
    
            /**
             * ControlMode enum.
             * @name UsbComm.MotorState.ControlMode
             * @enum {number}
             * @property {number} TORQUE=0 TORQUE value
             * @property {number} VELOCITY=1 VELOCITY value
             * @property {number} ANGLE=2 ANGLE value
             */
            MotorState.ControlMode = (function() {
                var valuesById = {}, values = Object.create(valuesById);
                values[valuesById[0] = "TORQUE"] = 0;
                values[valuesById[1] = "VELOCITY"] = 1;
                values[valuesById[2] = "ANGLE"] = 2;
                return values;
            })();
    
            return MotorState;
        })();
    
        UsbComm.KnobConfig = (function() {
    
            /**
             * Properties of a KnobConfig.
             * @memberof UsbComm
             * @interface IKnobConfig
             * @property {boolean} demo KnobConfig demo
             * @property {UsbComm.KnobConfig.Mode} mode KnobConfig mode
             * @property {Array.<UsbComm.KnobConfig.IPref>|null} [prefs] KnobConfig prefs
             */
    
            /**
             * Constructs a new KnobConfig.
             * @memberof UsbComm
             * @classdesc Represents a KnobConfig.
             * @implements IKnobConfig
             * @constructor
             * @param {UsbComm.IKnobConfig=} [properties] Properties to set
             */
            function KnobConfig(properties) {
                this.prefs = [];
                if (properties)
                    for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                        if (properties[keys[i]] != null)
                            this[keys[i]] = properties[keys[i]];
            }
    
            /**
             * KnobConfig demo.
             * @member {boolean} demo
             * @memberof UsbComm.KnobConfig
             * @instance
             */
            KnobConfig.prototype.demo = false;
    
            /**
             * KnobConfig mode.
             * @member {UsbComm.KnobConfig.Mode} mode
             * @memberof UsbComm.KnobConfig
             * @instance
             */
            KnobConfig.prototype.mode = 0;
    
            /**
             * KnobConfig prefs.
             * @member {Array.<UsbComm.KnobConfig.IPref>} prefs
             * @memberof UsbComm.KnobConfig
             * @instance
             */
            KnobConfig.prototype.prefs = $util.emptyArray;
    
            /**
             * Creates a new KnobConfig instance using the specified properties.
             * @function create
             * @memberof UsbComm.KnobConfig
             * @static
             * @param {UsbComm.IKnobConfig=} [properties] Properties to set
             * @returns {UsbComm.KnobConfig} KnobConfig instance
             */
            KnobConfig.create = function create(properties) {
                return new KnobConfig(properties);
            };
    
            /**
             * Encodes the specified KnobConfig message. Does not implicitly {@link UsbComm.KnobConfig.verify|verify} messages.
             * @function encode
             * @memberof UsbComm.KnobConfig
             * @static
             * @param {UsbComm.IKnobConfig} message KnobConfig message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            KnobConfig.encode = function encode(message, writer) {
                if (!writer)
                    writer = $Writer.create();
                writer.uint32(/* id 1, wireType 0 =*/8).bool(message.demo);
                writer.uint32(/* id 2, wireType 0 =*/16).int32(message.mode);
                if (message.prefs != null && message.prefs.length)
                    for (var i = 0; i < message.prefs.length; ++i)
                        $root.UsbComm.KnobConfig.Pref.encode(message.prefs[i], writer.uint32(/* id 5, wireType 2 =*/42).fork()).ldelim();
                return writer;
            };
    
            /**
             * Encodes the specified KnobConfig message, length delimited. Does not implicitly {@link UsbComm.KnobConfig.verify|verify} messages.
             * @function encodeDelimited
             * @memberof UsbComm.KnobConfig
             * @static
             * @param {UsbComm.IKnobConfig} message KnobConfig message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            KnobConfig.encodeDelimited = function encodeDelimited(message, writer) {
                return this.encode(message, writer).ldelim();
            };
    
            /**
             * Decodes a KnobConfig message from the specified reader or buffer.
             * @function decode
             * @memberof UsbComm.KnobConfig
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @param {number} [length] Message length if known beforehand
             * @returns {UsbComm.KnobConfig} KnobConfig
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            KnobConfig.decode = function decode(reader, length) {
                if (!(reader instanceof $Reader))
                    reader = $Reader.create(reader);
                var end = length === undefined ? reader.len : reader.pos + length, message = new $root.UsbComm.KnobConfig();
                while (reader.pos < end) {
                    var tag = reader.uint32();
                    switch (tag >>> 3) {
                    case 1: {
                            message.demo = reader.bool();
                            break;
                        }
                    case 2: {
                            message.mode = reader.int32();
                            break;
                        }
                    case 5: {
                            if (!(message.prefs && message.prefs.length))
                                message.prefs = [];
                            message.prefs.push($root.UsbComm.KnobConfig.Pref.decode(reader, reader.uint32()));
                            break;
                        }
                    default:
                        reader.skipType(tag & 7);
                        break;
                    }
                }
                if (!message.hasOwnProperty("demo"))
                    throw $util.ProtocolError("missing required 'demo'", { instance: message });
                if (!message.hasOwnProperty("mode"))
                    throw $util.ProtocolError("missing required 'mode'", { instance: message });
                return message;
            };
    
            /**
             * Decodes a KnobConfig message from the specified reader or buffer, length delimited.
             * @function decodeDelimited
             * @memberof UsbComm.KnobConfig
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @returns {UsbComm.KnobConfig} KnobConfig
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            KnobConfig.decodeDelimited = function decodeDelimited(reader) {
                if (!(reader instanceof $Reader))
                    reader = new $Reader(reader);
                return this.decode(reader, reader.uint32());
            };
    
            /**
             * Verifies a KnobConfig message.
             * @function verify
             * @memberof UsbComm.KnobConfig
             * @static
             * @param {Object.<string,*>} message Plain object to verify
             * @returns {string|null} `null` if valid, otherwise the reason why it is not
             */
            KnobConfig.verify = function verify(message) {
                if (typeof message !== "object" || message === null)
                    return "object expected";
                if (typeof message.demo !== "boolean")
                    return "demo: boolean expected";
                switch (message.mode) {
                default:
                    return "mode: enum value expected";
                case 0:
                case 1:
                case 2:
                case 3:
                case 4:
                case 5:
                case 6:
                    break;
                }
                if (message.prefs != null && message.hasOwnProperty("prefs")) {
                    if (!Array.isArray(message.prefs))
                        return "prefs: array expected";
                    for (var i = 0; i < message.prefs.length; ++i) {
                        var error = $root.UsbComm.KnobConfig.Pref.verify(message.prefs[i]);
                        if (error)
                            return "prefs." + error;
                    }
                }
                return null;
            };
    
            /**
             * Creates a KnobConfig message from a plain object. Also converts values to their respective internal types.
             * @function fromObject
             * @memberof UsbComm.KnobConfig
             * @static
             * @param {Object.<string,*>} object Plain object
             * @returns {UsbComm.KnobConfig} KnobConfig
             */
            KnobConfig.fromObject = function fromObject(object) {
                if (object instanceof $root.UsbComm.KnobConfig)
                    return object;
                var message = new $root.UsbComm.KnobConfig();
                if (object.demo != null)
                    message.demo = Boolean(object.demo);
                switch (object.mode) {
                default:
                    if (typeof object.mode === "number") {
                        message.mode = object.mode;
                        break;
                    }
                    break;
                case "DISABLE":
                case 0:
                    message.mode = 0;
                    break;
                case "INERTIA":
                case 1:
                    message.mode = 1;
                    break;
                case "ENCODER":
                case 2:
                    message.mode = 2;
                    break;
                case "SPRING":
                case 3:
                    message.mode = 3;
                    break;
                case "DAMPED":
                case 4:
                    message.mode = 4;
                    break;
                case "SPIN":
                case 5:
                    message.mode = 5;
                    break;
                case "RATCHET":
                case 6:
                    message.mode = 6;
                    break;
                }
                if (object.prefs) {
                    if (!Array.isArray(object.prefs))
                        throw TypeError(".UsbComm.KnobConfig.prefs: array expected");
                    message.prefs = [];
                    for (var i = 0; i < object.prefs.length; ++i) {
                        if (typeof object.prefs[i] !== "object")
                            throw TypeError(".UsbComm.KnobConfig.prefs: object expected");
                        message.prefs[i] = $root.UsbComm.KnobConfig.Pref.fromObject(object.prefs[i]);
                    }
                }
                return message;
            };
    
            /**
             * Creates a plain object from a KnobConfig message. Also converts values to other types if specified.
             * @function toObject
             * @memberof UsbComm.KnobConfig
             * @static
             * @param {UsbComm.KnobConfig} message KnobConfig
             * @param {$protobuf.IConversionOptions} [options] Conversion options
             * @returns {Object.<string,*>} Plain object
             */
            KnobConfig.toObject = function toObject(message, options) {
                if (!options)
                    options = {};
                var object = {};
                if (options.arrays || options.defaults)
                    object.prefs = [];
                if (options.defaults) {
                    object.demo = false;
                    object.mode = options.enums === String ? "DISABLE" : 0;
                }
                if (message.demo != null && message.hasOwnProperty("demo"))
                    object.demo = message.demo;
                if (message.mode != null && message.hasOwnProperty("mode"))
                    object.mode = options.enums === String ? $root.UsbComm.KnobConfig.Mode[message.mode] === undefined ? message.mode : $root.UsbComm.KnobConfig.Mode[message.mode] : message.mode;
                if (message.prefs && message.prefs.length) {
                    object.prefs = [];
                    for (var j = 0; j < message.prefs.length; ++j)
                        object.prefs[j] = $root.UsbComm.KnobConfig.Pref.toObject(message.prefs[j], options);
                }
                return object;
            };
    
            /**
             * Converts this KnobConfig to JSON.
             * @function toJSON
             * @memberof UsbComm.KnobConfig
             * @instance
             * @returns {Object.<string,*>} JSON object
             */
            KnobConfig.prototype.toJSON = function toJSON() {
                return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
            };
    
            /**
             * Gets the default type url for KnobConfig
             * @function getTypeUrl
             * @memberof UsbComm.KnobConfig
             * @static
             * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
             * @returns {string} The default type url
             */
            KnobConfig.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
                if (typeUrlPrefix === undefined) {
                    typeUrlPrefix = "type.googleapis.com";
                }
                return typeUrlPrefix + "/UsbComm.KnobConfig";
            };
    
            /**
             * Mode enum.
             * @name UsbComm.KnobConfig.Mode
             * @enum {number}
             * @property {number} DISABLE=0 DISABLE value
             * @property {number} INERTIA=1 INERTIA value
             * @property {number} ENCODER=2 ENCODER value
             * @property {number} SPRING=3 SPRING value
             * @property {number} DAMPED=4 DAMPED value
             * @property {number} SPIN=5 SPIN value
             * @property {number} RATCHET=6 RATCHET value
             */
            KnobConfig.Mode = (function() {
                var valuesById = {}, values = Object.create(valuesById);
                values[valuesById[0] = "DISABLE"] = 0;
                values[valuesById[1] = "INERTIA"] = 1;
                values[valuesById[2] = "ENCODER"] = 2;
                values[valuesById[3] = "SPRING"] = 3;
                values[valuesById[4] = "DAMPED"] = 4;
                values[valuesById[5] = "SPIN"] = 5;
                values[valuesById[6] = "RATCHET"] = 6;
                return values;
            })();
    
            KnobConfig.Pref = (function() {
    
                /**
                 * Properties of a Pref.
                 * @memberof UsbComm.KnobConfig
                 * @interface IPref
                 * @property {number} layerId Pref layerId
                 * @property {string|null} [layerName] Pref layerName
                 * @property {boolean} active Pref active
                 * @property {UsbComm.KnobConfig.Mode|null} [mode] Pref mode
                 * @property {number|null} [ppr] Pref ppr
                 * @property {number|null} [torqueLimit] Pref torqueLimit
                 */
    
                /**
                 * Constructs a new Pref.
                 * @memberof UsbComm.KnobConfig
                 * @classdesc Represents a Pref.
                 * @implements IPref
                 * @constructor
                 * @param {UsbComm.KnobConfig.IPref=} [properties] Properties to set
                 */
                function Pref(properties) {
                    if (properties)
                        for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                            if (properties[keys[i]] != null)
                                this[keys[i]] = properties[keys[i]];
                }
    
                /**
                 * Pref layerId.
                 * @member {number} layerId
                 * @memberof UsbComm.KnobConfig.Pref
                 * @instance
                 */
                Pref.prototype.layerId = 0;
    
                /**
                 * Pref layerName.
                 * @member {string} layerName
                 * @memberof UsbComm.KnobConfig.Pref
                 * @instance
                 */
                Pref.prototype.layerName = "";
    
                /**
                 * Pref active.
                 * @member {boolean} active
                 * @memberof UsbComm.KnobConfig.Pref
                 * @instance
                 */
                Pref.prototype.active = false;
    
                /**
                 * Pref mode.
                 * @member {UsbComm.KnobConfig.Mode} mode
                 * @memberof UsbComm.KnobConfig.Pref
                 * @instance
                 */
                Pref.prototype.mode = 0;
    
                /**
                 * Pref ppr.
                 * @member {number} ppr
                 * @memberof UsbComm.KnobConfig.Pref
                 * @instance
                 */
                Pref.prototype.ppr = 0;
    
                /**
                 * Pref torqueLimit.
                 * @member {number} torqueLimit
                 * @memberof UsbComm.KnobConfig.Pref
                 * @instance
                 */
                Pref.prototype.torqueLimit = 0;
    
                /**
                 * Creates a new Pref instance using the specified properties.
                 * @function create
                 * @memberof UsbComm.KnobConfig.Pref
                 * @static
                 * @param {UsbComm.KnobConfig.IPref=} [properties] Properties to set
                 * @returns {UsbComm.KnobConfig.Pref} Pref instance
                 */
                Pref.create = function create(properties) {
                    return new Pref(properties);
                };
    
                /**
                 * Encodes the specified Pref message. Does not implicitly {@link UsbComm.KnobConfig.Pref.verify|verify} messages.
                 * @function encode
                 * @memberof UsbComm.KnobConfig.Pref
                 * @static
                 * @param {UsbComm.KnobConfig.IPref} message Pref message or plain object to encode
                 * @param {$protobuf.Writer} [writer] Writer to encode to
                 * @returns {$protobuf.Writer} Writer
                 */
                Pref.encode = function encode(message, writer) {
                    if (!writer)
                        writer = $Writer.create();
                    writer.uint32(/* id 1, wireType 0 =*/8).uint32(message.layerId);
                    if (message.layerName != null && Object.hasOwnProperty.call(message, "layerName"))
                        writer.uint32(/* id 2, wireType 2 =*/18).string(message.layerName);
                    writer.uint32(/* id 3, wireType 0 =*/24).bool(message.active);
                    if (message.mode != null && Object.hasOwnProperty.call(message, "mode"))
                        writer.uint32(/* id 4, wireType 0 =*/32).int32(message.mode);
                    if (message.ppr != null && Object.hasOwnProperty.call(message, "ppr"))
                        writer.uint32(/* id 5, wireType 0 =*/40).uint32(message.ppr);
                    if (message.torqueLimit != null && Object.hasOwnProperty.call(message, "torqueLimit"))
                        writer.uint32(/* id 6, wireType 5 =*/53).float(message.torqueLimit);
                    return writer;
                };
    
                /**
                 * Encodes the specified Pref message, length delimited. Does not implicitly {@link UsbComm.KnobConfig.Pref.verify|verify} messages.
                 * @function encodeDelimited
                 * @memberof UsbComm.KnobConfig.Pref
                 * @static
                 * @param {UsbComm.KnobConfig.IPref} message Pref message or plain object to encode
                 * @param {$protobuf.Writer} [writer] Writer to encode to
                 * @returns {$protobuf.Writer} Writer
                 */
                Pref.encodeDelimited = function encodeDelimited(message, writer) {
                    return this.encode(message, writer).ldelim();
                };
    
                /**
                 * Decodes a Pref message from the specified reader or buffer.
                 * @function decode
                 * @memberof UsbComm.KnobConfig.Pref
                 * @static
                 * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
                 * @param {number} [length] Message length if known beforehand
                 * @returns {UsbComm.KnobConfig.Pref} Pref
                 * @throws {Error} If the payload is not a reader or valid buffer
                 * @throws {$protobuf.util.ProtocolError} If required fields are missing
                 */
                Pref.decode = function decode(reader, length) {
                    if (!(reader instanceof $Reader))
                        reader = $Reader.create(reader);
                    var end = length === undefined ? reader.len : reader.pos + length, message = new $root.UsbComm.KnobConfig.Pref();
                    while (reader.pos < end) {
                        var tag = reader.uint32();
                        switch (tag >>> 3) {
                        case 1: {
                                message.layerId = reader.uint32();
                                break;
                            }
                        case 2: {
                                message.layerName = reader.string();
                                break;
                            }
                        case 3: {
                                message.active = reader.bool();
                                break;
                            }
                        case 4: {
                                message.mode = reader.int32();
                                break;
                            }
                        case 5: {
                                message.ppr = reader.uint32();
                                break;
                            }
                        case 6: {
                                message.torqueLimit = reader.float();
                                break;
                            }
                        default:
                            reader.skipType(tag & 7);
                            break;
                        }
                    }
                    if (!message.hasOwnProperty("layerId"))
                        throw $util.ProtocolError("missing required 'layerId'", { instance: message });
                    if (!message.hasOwnProperty("active"))
                        throw $util.ProtocolError("missing required 'active'", { instance: message });
                    return message;
                };
    
                /**
                 * Decodes a Pref message from the specified reader or buffer, length delimited.
                 * @function decodeDelimited
                 * @memberof UsbComm.KnobConfig.Pref
                 * @static
                 * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
                 * @returns {UsbComm.KnobConfig.Pref} Pref
                 * @throws {Error} If the payload is not a reader or valid buffer
                 * @throws {$protobuf.util.ProtocolError} If required fields are missing
                 */
                Pref.decodeDelimited = function decodeDelimited(reader) {
                    if (!(reader instanceof $Reader))
                        reader = new $Reader(reader);
                    return this.decode(reader, reader.uint32());
                };
    
                /**
                 * Verifies a Pref message.
                 * @function verify
                 * @memberof UsbComm.KnobConfig.Pref
                 * @static
                 * @param {Object.<string,*>} message Plain object to verify
                 * @returns {string|null} `null` if valid, otherwise the reason why it is not
                 */
                Pref.verify = function verify(message) {
                    if (typeof message !== "object" || message === null)
                        return "object expected";
                    if (!$util.isInteger(message.layerId))
                        return "layerId: integer expected";
                    if (message.layerName != null && message.hasOwnProperty("layerName"))
                        if (!$util.isString(message.layerName))
                            return "layerName: string expected";
                    if (typeof message.active !== "boolean")
                        return "active: boolean expected";
                    if (message.mode != null && message.hasOwnProperty("mode"))
                        switch (message.mode) {
                        default:
                            return "mode: enum value expected";
                        case 0:
                        case 1:
                        case 2:
                        case 3:
                        case 4:
                        case 5:
                        case 6:
                            break;
                        }
                    if (message.ppr != null && message.hasOwnProperty("ppr"))
                        if (!$util.isInteger(message.ppr))
                            return "ppr: integer expected";
                    if (message.torqueLimit != null && message.hasOwnProperty("torqueLimit"))
                        if (typeof message.torqueLimit !== "number")
                            return "torqueLimit: number expected";
                    return null;
                };
    
                /**
                 * Creates a Pref message from a plain object. Also converts values to their respective internal types.
                 * @function fromObject
                 * @memberof UsbComm.KnobConfig.Pref
                 * @static
                 * @param {Object.<string,*>} object Plain object
                 * @returns {UsbComm.KnobConfig.Pref} Pref
                 */
                Pref.fromObject = function fromObject(object) {
                    if (object instanceof $root.UsbComm.KnobConfig.Pref)
                        return object;
                    var message = new $root.UsbComm.KnobConfig.Pref();
                    if (object.layerId != null)
                        message.layerId = object.layerId >>> 0;
                    if (object.layerName != null)
                        message.layerName = String(object.layerName);
                    if (object.active != null)
                        message.active = Boolean(object.active);
                    switch (object.mode) {
                    default:
                        if (typeof object.mode === "number") {
                            message.mode = object.mode;
                            break;
                        }
                        break;
                    case "DISABLE":
                    case 0:
                        message.mode = 0;
                        break;
                    case "INERTIA":
                    case 1:
                        message.mode = 1;
                        break;
                    case "ENCODER":
                    case 2:
                        message.mode = 2;
                        break;
                    case "SPRING":
                    case 3:
                        message.mode = 3;
                        break;
                    case "DAMPED":
                    case 4:
                        message.mode = 4;
                        break;
                    case "SPIN":
                    case 5:
                        message.mode = 5;
                        break;
                    case "RATCHET":
                    case 6:
                        message.mode = 6;
                        break;
                    }
                    if (object.ppr != null)
                        message.ppr = object.ppr >>> 0;
                    if (object.torqueLimit != null)
                        message.torqueLimit = Number(object.torqueLimit);
                    return message;
                };
    
                /**
                 * Creates a plain object from a Pref message. Also converts values to other types if specified.
                 * @function toObject
                 * @memberof UsbComm.KnobConfig.Pref
                 * @static
                 * @param {UsbComm.KnobConfig.Pref} message Pref
                 * @param {$protobuf.IConversionOptions} [options] Conversion options
                 * @returns {Object.<string,*>} Plain object
                 */
                Pref.toObject = function toObject(message, options) {
                    if (!options)
                        options = {};
                    var object = {};
                    if (options.defaults) {
                        object.layerId = 0;
                        object.layerName = "";
                        object.active = false;
                        object.mode = options.enums === String ? "DISABLE" : 0;
                        object.ppr = 0;
                        object.torqueLimit = 0;
                    }
                    if (message.layerId != null && message.hasOwnProperty("layerId"))
                        object.layerId = message.layerId;
                    if (message.layerName != null && message.hasOwnProperty("layerName"))
                        object.layerName = message.layerName;
                    if (message.active != null && message.hasOwnProperty("active"))
                        object.active = message.active;
                    if (message.mode != null && message.hasOwnProperty("mode"))
                        object.mode = options.enums === String ? $root.UsbComm.KnobConfig.Mode[message.mode] === undefined ? message.mode : $root.UsbComm.KnobConfig.Mode[message.mode] : message.mode;
                    if (message.ppr != null && message.hasOwnProperty("ppr"))
                        object.ppr = message.ppr;
                    if (message.torqueLimit != null && message.hasOwnProperty("torqueLimit"))
                        object.torqueLimit = options.json && !isFinite(message.torqueLimit) ? String(message.torqueLimit) : message.torqueLimit;
                    return object;
                };
    
                /**
                 * Converts this Pref to JSON.
                 * @function toJSON
                 * @memberof UsbComm.KnobConfig.Pref
                 * @instance
                 * @returns {Object.<string,*>} JSON object
                 */
                Pref.prototype.toJSON = function toJSON() {
                    return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
                };
    
                /**
                 * Gets the default type url for Pref
                 * @function getTypeUrl
                 * @memberof UsbComm.KnobConfig.Pref
                 * @static
                 * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
                 * @returns {string} The default type url
                 */
                Pref.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
                    if (typeUrlPrefix === undefined) {
                        typeUrlPrefix = "type.googleapis.com";
                    }
                    return typeUrlPrefix + "/UsbComm.KnobConfig.Pref";
                };
    
                return Pref;
            })();
    
            return KnobConfig;
        })();
    
        UsbComm.RgbControl = (function() {
    
            /**
             * Properties of a RgbControl.
             * @memberof UsbComm
             * @interface IRgbControl
             * @property {UsbComm.RgbControl.Command} command RgbControl command
             */
    
            /**
             * Constructs a new RgbControl.
             * @memberof UsbComm
             * @classdesc Represents a RgbControl.
             * @implements IRgbControl
             * @constructor
             * @param {UsbComm.IRgbControl=} [properties] Properties to set
             */
            function RgbControl(properties) {
                if (properties)
                    for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                        if (properties[keys[i]] != null)
                            this[keys[i]] = properties[keys[i]];
            }
    
            /**
             * RgbControl command.
             * @member {UsbComm.RgbControl.Command} command
             * @memberof UsbComm.RgbControl
             * @instance
             */
            RgbControl.prototype.command = 1;
    
            /**
             * Creates a new RgbControl instance using the specified properties.
             * @function create
             * @memberof UsbComm.RgbControl
             * @static
             * @param {UsbComm.IRgbControl=} [properties] Properties to set
             * @returns {UsbComm.RgbControl} RgbControl instance
             */
            RgbControl.create = function create(properties) {
                return new RgbControl(properties);
            };
    
            /**
             * Encodes the specified RgbControl message. Does not implicitly {@link UsbComm.RgbControl.verify|verify} messages.
             * @function encode
             * @memberof UsbComm.RgbControl
             * @static
             * @param {UsbComm.IRgbControl} message RgbControl message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            RgbControl.encode = function encode(message, writer) {
                if (!writer)
                    writer = $Writer.create();
                writer.uint32(/* id 1, wireType 0 =*/8).int32(message.command);
                return writer;
            };
    
            /**
             * Encodes the specified RgbControl message, length delimited. Does not implicitly {@link UsbComm.RgbControl.verify|verify} messages.
             * @function encodeDelimited
             * @memberof UsbComm.RgbControl
             * @static
             * @param {UsbComm.IRgbControl} message RgbControl message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            RgbControl.encodeDelimited = function encodeDelimited(message, writer) {
                return this.encode(message, writer).ldelim();
            };
    
            /**
             * Decodes a RgbControl message from the specified reader or buffer.
             * @function decode
             * @memberof UsbComm.RgbControl
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @param {number} [length] Message length if known beforehand
             * @returns {UsbComm.RgbControl} RgbControl
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            RgbControl.decode = function decode(reader, length) {
                if (!(reader instanceof $Reader))
                    reader = $Reader.create(reader);
                var end = length === undefined ? reader.len : reader.pos + length, message = new $root.UsbComm.RgbControl();
                while (reader.pos < end) {
                    var tag = reader.uint32();
                    switch (tag >>> 3) {
                    case 1: {
                            message.command = reader.int32();
                            break;
                        }
                    default:
                        reader.skipType(tag & 7);
                        break;
                    }
                }
                if (!message.hasOwnProperty("command"))
                    throw $util.ProtocolError("missing required 'command'", { instance: message });
                return message;
            };
    
            /**
             * Decodes a RgbControl message from the specified reader or buffer, length delimited.
             * @function decodeDelimited
             * @memberof UsbComm.RgbControl
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @returns {UsbComm.RgbControl} RgbControl
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            RgbControl.decodeDelimited = function decodeDelimited(reader) {
                if (!(reader instanceof $Reader))
                    reader = new $Reader(reader);
                return this.decode(reader, reader.uint32());
            };
    
            /**
             * Verifies a RgbControl message.
             * @function verify
             * @memberof UsbComm.RgbControl
             * @static
             * @param {Object.<string,*>} message Plain object to verify
             * @returns {string|null} `null` if valid, otherwise the reason why it is not
             */
            RgbControl.verify = function verify(message) {
                if (typeof message !== "object" || message === null)
                    return "object expected";
                switch (message.command) {
                default:
                    return "command: enum value expected";
                case 1:
                case 2:
                case 3:
                case 4:
                case 5:
                case 6:
                case 7:
                case 8:
                case 9:
                case 10:
                case 11:
                case 12:
                    break;
                }
                return null;
            };
    
            /**
             * Creates a RgbControl message from a plain object. Also converts values to their respective internal types.
             * @function fromObject
             * @memberof UsbComm.RgbControl
             * @static
             * @param {Object.<string,*>} object Plain object
             * @returns {UsbComm.RgbControl} RgbControl
             */
            RgbControl.fromObject = function fromObject(object) {
                if (object instanceof $root.UsbComm.RgbControl)
                    return object;
                var message = new $root.UsbComm.RgbControl();
                switch (object.command) {
                default:
                    if (typeof object.command === "number") {
                        message.command = object.command;
                        break;
                    }
                    break;
                case "RGB_ON":
                case 1:
                    message.command = 1;
                    break;
                case "RGB_OFF":
                case 2:
                    message.command = 2;
                    break;
                case "RGB_HUI":
                case 3:
                    message.command = 3;
                    break;
                case "RGB_HUD":
                case 4:
                    message.command = 4;
                    break;
                case "RGB_SAI":
                case 5:
                    message.command = 5;
                    break;
                case "RGB_SAD":
                case 6:
                    message.command = 6;
                    break;
                case "RGB_BRI":
                case 7:
                    message.command = 7;
                    break;
                case "RGB_BRD":
                case 8:
                    message.command = 8;
                    break;
                case "RGB_SPI":
                case 9:
                    message.command = 9;
                    break;
                case "RGB_SPD":
                case 10:
                    message.command = 10;
                    break;
                case "RGB_EFF":
                case 11:
                    message.command = 11;
                    break;
                case "RGB_EFR":
                case 12:
                    message.command = 12;
                    break;
                }
                return message;
            };
    
            /**
             * Creates a plain object from a RgbControl message. Also converts values to other types if specified.
             * @function toObject
             * @memberof UsbComm.RgbControl
             * @static
             * @param {UsbComm.RgbControl} message RgbControl
             * @param {$protobuf.IConversionOptions} [options] Conversion options
             * @returns {Object.<string,*>} Plain object
             */
            RgbControl.toObject = function toObject(message, options) {
                if (!options)
                    options = {};
                var object = {};
                if (options.defaults)
                    object.command = options.enums === String ? "RGB_ON" : 1;
                if (message.command != null && message.hasOwnProperty("command"))
                    object.command = options.enums === String ? $root.UsbComm.RgbControl.Command[message.command] === undefined ? message.command : $root.UsbComm.RgbControl.Command[message.command] : message.command;
                return object;
            };
    
            /**
             * Converts this RgbControl to JSON.
             * @function toJSON
             * @memberof UsbComm.RgbControl
             * @instance
             * @returns {Object.<string,*>} JSON object
             */
            RgbControl.prototype.toJSON = function toJSON() {
                return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
            };
    
            /**
             * Gets the default type url for RgbControl
             * @function getTypeUrl
             * @memberof UsbComm.RgbControl
             * @static
             * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
             * @returns {string} The default type url
             */
            RgbControl.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
                if (typeUrlPrefix === undefined) {
                    typeUrlPrefix = "type.googleapis.com";
                }
                return typeUrlPrefix + "/UsbComm.RgbControl";
            };
    
            /**
             * Command enum.
             * @name UsbComm.RgbControl.Command
             * @enum {number}
             * @property {number} RGB_ON=1 RGB_ON value
             * @property {number} RGB_OFF=2 RGB_OFF value
             * @property {number} RGB_HUI=3 RGB_HUI value
             * @property {number} RGB_HUD=4 RGB_HUD value
             * @property {number} RGB_SAI=5 RGB_SAI value
             * @property {number} RGB_SAD=6 RGB_SAD value
             * @property {number} RGB_BRI=7 RGB_BRI value
             * @property {number} RGB_BRD=8 RGB_BRD value
             * @property {number} RGB_SPI=9 RGB_SPI value
             * @property {number} RGB_SPD=10 RGB_SPD value
             * @property {number} RGB_EFF=11 RGB_EFF value
             * @property {number} RGB_EFR=12 RGB_EFR value
             */
            RgbControl.Command = (function() {
                var valuesById = {}, values = Object.create(valuesById);
                values[valuesById[1] = "RGB_ON"] = 1;
                values[valuesById[2] = "RGB_OFF"] = 2;
                values[valuesById[3] = "RGB_HUI"] = 3;
                values[valuesById[4] = "RGB_HUD"] = 4;
                values[valuesById[5] = "RGB_SAI"] = 5;
                values[valuesById[6] = "RGB_SAD"] = 6;
                values[valuesById[7] = "RGB_BRI"] = 7;
                values[valuesById[8] = "RGB_BRD"] = 8;
                values[valuesById[9] = "RGB_SPI"] = 9;
                values[valuesById[10] = "RGB_SPD"] = 10;
                values[valuesById[11] = "RGB_EFF"] = 11;
                values[valuesById[12] = "RGB_EFR"] = 12;
                return values;
            })();
    
            return RgbControl;
        })();
    
        UsbComm.RgbState = (function() {
    
            /**
             * Properties of a RgbState.
             * @memberof UsbComm
             * @interface IRgbState
             * @property {boolean} on RgbState on
             * @property {UsbComm.RgbState.IHSB|null} [color] RgbState color
             * @property {UsbComm.RgbState.Effect|null} [effect] RgbState effect
             * @property {number|null} [speed] RgbState speed
             */
    
            /**
             * Constructs a new RgbState.
             * @memberof UsbComm
             * @classdesc Represents a RgbState.
             * @implements IRgbState
             * @constructor
             * @param {UsbComm.IRgbState=} [properties] Properties to set
             */
            function RgbState(properties) {
                if (properties)
                    for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                        if (properties[keys[i]] != null)
                            this[keys[i]] = properties[keys[i]];
            }
    
            /**
             * RgbState on.
             * @member {boolean} on
             * @memberof UsbComm.RgbState
             * @instance
             */
            RgbState.prototype.on = false;
    
            /**
             * RgbState color.
             * @member {UsbComm.RgbState.IHSB|null|undefined} color
             * @memberof UsbComm.RgbState
             * @instance
             */
            RgbState.prototype.color = null;
    
            /**
             * RgbState effect.
             * @member {UsbComm.RgbState.Effect} effect
             * @memberof UsbComm.RgbState
             * @instance
             */
            RgbState.prototype.effect = 0;
    
            /**
             * RgbState speed.
             * @member {number} speed
             * @memberof UsbComm.RgbState
             * @instance
             */
            RgbState.prototype.speed = 0;
    
            /**
             * Creates a new RgbState instance using the specified properties.
             * @function create
             * @memberof UsbComm.RgbState
             * @static
             * @param {UsbComm.IRgbState=} [properties] Properties to set
             * @returns {UsbComm.RgbState} RgbState instance
             */
            RgbState.create = function create(properties) {
                return new RgbState(properties);
            };
    
            /**
             * Encodes the specified RgbState message. Does not implicitly {@link UsbComm.RgbState.verify|verify} messages.
             * @function encode
             * @memberof UsbComm.RgbState
             * @static
             * @param {UsbComm.IRgbState} message RgbState message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            RgbState.encode = function encode(message, writer) {
                if (!writer)
                    writer = $Writer.create();
                writer.uint32(/* id 1, wireType 0 =*/8).bool(message.on);
                if (message.color != null && Object.hasOwnProperty.call(message, "color"))
                    $root.UsbComm.RgbState.HSB.encode(message.color, writer.uint32(/* id 2, wireType 2 =*/18).fork()).ldelim();
                if (message.effect != null && Object.hasOwnProperty.call(message, "effect"))
                    writer.uint32(/* id 3, wireType 0 =*/24).int32(message.effect);
                if (message.speed != null && Object.hasOwnProperty.call(message, "speed"))
                    writer.uint32(/* id 4, wireType 0 =*/32).uint32(message.speed);
                return writer;
            };
    
            /**
             * Encodes the specified RgbState message, length delimited. Does not implicitly {@link UsbComm.RgbState.verify|verify} messages.
             * @function encodeDelimited
             * @memberof UsbComm.RgbState
             * @static
             * @param {UsbComm.IRgbState} message RgbState message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            RgbState.encodeDelimited = function encodeDelimited(message, writer) {
                return this.encode(message, writer).ldelim();
            };
    
            /**
             * Decodes a RgbState message from the specified reader or buffer.
             * @function decode
             * @memberof UsbComm.RgbState
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @param {number} [length] Message length if known beforehand
             * @returns {UsbComm.RgbState} RgbState
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            RgbState.decode = function decode(reader, length) {
                if (!(reader instanceof $Reader))
                    reader = $Reader.create(reader);
                var end = length === undefined ? reader.len : reader.pos + length, message = new $root.UsbComm.RgbState();
                while (reader.pos < end) {
                    var tag = reader.uint32();
                    switch (tag >>> 3) {
                    case 1: {
                            message.on = reader.bool();
                            break;
                        }
                    case 2: {
                            message.color = $root.UsbComm.RgbState.HSB.decode(reader, reader.uint32());
                            break;
                        }
                    case 3: {
                            message.effect = reader.int32();
                            break;
                        }
                    case 4: {
                            message.speed = reader.uint32();
                            break;
                        }
                    default:
                        reader.skipType(tag & 7);
                        break;
                    }
                }
                if (!message.hasOwnProperty("on"))
                    throw $util.ProtocolError("missing required 'on'", { instance: message });
                return message;
            };
    
            /**
             * Decodes a RgbState message from the specified reader or buffer, length delimited.
             * @function decodeDelimited
             * @memberof UsbComm.RgbState
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @returns {UsbComm.RgbState} RgbState
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            RgbState.decodeDelimited = function decodeDelimited(reader) {
                if (!(reader instanceof $Reader))
                    reader = new $Reader(reader);
                return this.decode(reader, reader.uint32());
            };
    
            /**
             * Verifies a RgbState message.
             * @function verify
             * @memberof UsbComm.RgbState
             * @static
             * @param {Object.<string,*>} message Plain object to verify
             * @returns {string|null} `null` if valid, otherwise the reason why it is not
             */
            RgbState.verify = function verify(message) {
                if (typeof message !== "object" || message === null)
                    return "object expected";
                if (typeof message.on !== "boolean")
                    return "on: boolean expected";
                if (message.color != null && message.hasOwnProperty("color")) {
                    var error = $root.UsbComm.RgbState.HSB.verify(message.color);
                    if (error)
                        return "color." + error;
                }
                if (message.effect != null && message.hasOwnProperty("effect"))
                    switch (message.effect) {
                    default:
                        return "effect: enum value expected";
                    case 0:
                    case 1:
                    case 2:
                    case 3:
                        break;
                    }
                if (message.speed != null && message.hasOwnProperty("speed"))
                    if (!$util.isInteger(message.speed))
                        return "speed: integer expected";
                return null;
            };
    
            /**
             * Creates a RgbState message from a plain object. Also converts values to their respective internal types.
             * @function fromObject
             * @memberof UsbComm.RgbState
             * @static
             * @param {Object.<string,*>} object Plain object
             * @returns {UsbComm.RgbState} RgbState
             */
            RgbState.fromObject = function fromObject(object) {
                if (object instanceof $root.UsbComm.RgbState)
                    return object;
                var message = new $root.UsbComm.RgbState();
                if (object.on != null)
                    message.on = Boolean(object.on);
                if (object.color != null) {
                    if (typeof object.color !== "object")
                        throw TypeError(".UsbComm.RgbState.color: object expected");
                    message.color = $root.UsbComm.RgbState.HSB.fromObject(object.color);
                }
                switch (object.effect) {
                default:
                    if (typeof object.effect === "number") {
                        message.effect = object.effect;
                        break;
                    }
                    break;
                case "SOLID":
                case 0:
                    message.effect = 0;
                    break;
                case "BREATHE":
                case 1:
                    message.effect = 1;
                    break;
                case "SPECTRUM":
                case 2:
                    message.effect = 2;
                    break;
                case "SWIRL":
                case 3:
                    message.effect = 3;
                    break;
                }
                if (object.speed != null)
                    message.speed = object.speed >>> 0;
                return message;
            };
    
            /**
             * Creates a plain object from a RgbState message. Also converts values to other types if specified.
             * @function toObject
             * @memberof UsbComm.RgbState
             * @static
             * @param {UsbComm.RgbState} message RgbState
             * @param {$protobuf.IConversionOptions} [options] Conversion options
             * @returns {Object.<string,*>} Plain object
             */
            RgbState.toObject = function toObject(message, options) {
                if (!options)
                    options = {};
                var object = {};
                if (options.defaults) {
                    object.on = false;
                    object.color = null;
                    object.effect = options.enums === String ? "SOLID" : 0;
                    object.speed = 0;
                }
                if (message.on != null && message.hasOwnProperty("on"))
                    object.on = message.on;
                if (message.color != null && message.hasOwnProperty("color"))
                    object.color = $root.UsbComm.RgbState.HSB.toObject(message.color, options);
                if (message.effect != null && message.hasOwnProperty("effect"))
                    object.effect = options.enums === String ? $root.UsbComm.RgbState.Effect[message.effect] === undefined ? message.effect : $root.UsbComm.RgbState.Effect[message.effect] : message.effect;
                if (message.speed != null && message.hasOwnProperty("speed"))
                    object.speed = message.speed;
                return object;
            };
    
            /**
             * Converts this RgbState to JSON.
             * @function toJSON
             * @memberof UsbComm.RgbState
             * @instance
             * @returns {Object.<string,*>} JSON object
             */
            RgbState.prototype.toJSON = function toJSON() {
                return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
            };
    
            /**
             * Gets the default type url for RgbState
             * @function getTypeUrl
             * @memberof UsbComm.RgbState
             * @static
             * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
             * @returns {string} The default type url
             */
            RgbState.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
                if (typeUrlPrefix === undefined) {
                    typeUrlPrefix = "type.googleapis.com";
                }
                return typeUrlPrefix + "/UsbComm.RgbState";
            };
    
            RgbState.HSB = (function() {
    
                /**
                 * Properties of a HSB.
                 * @memberof UsbComm.RgbState
                 * @interface IHSB
                 * @property {number} h HSB h
                 * @property {number} s HSB s
                 * @property {number} b HSB b
                 */
    
                /**
                 * Constructs a new HSB.
                 * @memberof UsbComm.RgbState
                 * @classdesc Represents a HSB.
                 * @implements IHSB
                 * @constructor
                 * @param {UsbComm.RgbState.IHSB=} [properties] Properties to set
                 */
                function HSB(properties) {
                    if (properties)
                        for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                            if (properties[keys[i]] != null)
                                this[keys[i]] = properties[keys[i]];
                }
    
                /**
                 * HSB h.
                 * @member {number} h
                 * @memberof UsbComm.RgbState.HSB
                 * @instance
                 */
                HSB.prototype.h = 0;
    
                /**
                 * HSB s.
                 * @member {number} s
                 * @memberof UsbComm.RgbState.HSB
                 * @instance
                 */
                HSB.prototype.s = 0;
    
                /**
                 * HSB b.
                 * @member {number} b
                 * @memberof UsbComm.RgbState.HSB
                 * @instance
                 */
                HSB.prototype.b = 0;
    
                /**
                 * Creates a new HSB instance using the specified properties.
                 * @function create
                 * @memberof UsbComm.RgbState.HSB
                 * @static
                 * @param {UsbComm.RgbState.IHSB=} [properties] Properties to set
                 * @returns {UsbComm.RgbState.HSB} HSB instance
                 */
                HSB.create = function create(properties) {
                    return new HSB(properties);
                };
    
                /**
                 * Encodes the specified HSB message. Does not implicitly {@link UsbComm.RgbState.HSB.verify|verify} messages.
                 * @function encode
                 * @memberof UsbComm.RgbState.HSB
                 * @static
                 * @param {UsbComm.RgbState.IHSB} message HSB message or plain object to encode
                 * @param {$protobuf.Writer} [writer] Writer to encode to
                 * @returns {$protobuf.Writer} Writer
                 */
                HSB.encode = function encode(message, writer) {
                    if (!writer)
                        writer = $Writer.create();
                    writer.uint32(/* id 1, wireType 0 =*/8).uint32(message.h);
                    writer.uint32(/* id 2, wireType 0 =*/16).uint32(message.s);
                    writer.uint32(/* id 3, wireType 0 =*/24).uint32(message.b);
                    return writer;
                };
    
                /**
                 * Encodes the specified HSB message, length delimited. Does not implicitly {@link UsbComm.RgbState.HSB.verify|verify} messages.
                 * @function encodeDelimited
                 * @memberof UsbComm.RgbState.HSB
                 * @static
                 * @param {UsbComm.RgbState.IHSB} message HSB message or plain object to encode
                 * @param {$protobuf.Writer} [writer] Writer to encode to
                 * @returns {$protobuf.Writer} Writer
                 */
                HSB.encodeDelimited = function encodeDelimited(message, writer) {
                    return this.encode(message, writer).ldelim();
                };
    
                /**
                 * Decodes a HSB message from the specified reader or buffer.
                 * @function decode
                 * @memberof UsbComm.RgbState.HSB
                 * @static
                 * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
                 * @param {number} [length] Message length if known beforehand
                 * @returns {UsbComm.RgbState.HSB} HSB
                 * @throws {Error} If the payload is not a reader or valid buffer
                 * @throws {$protobuf.util.ProtocolError} If required fields are missing
                 */
                HSB.decode = function decode(reader, length) {
                    if (!(reader instanceof $Reader))
                        reader = $Reader.create(reader);
                    var end = length === undefined ? reader.len : reader.pos + length, message = new $root.UsbComm.RgbState.HSB();
                    while (reader.pos < end) {
                        var tag = reader.uint32();
                        switch (tag >>> 3) {
                        case 1: {
                                message.h = reader.uint32();
                                break;
                            }
                        case 2: {
                                message.s = reader.uint32();
                                break;
                            }
                        case 3: {
                                message.b = reader.uint32();
                                break;
                            }
                        default:
                            reader.skipType(tag & 7);
                            break;
                        }
                    }
                    if (!message.hasOwnProperty("h"))
                        throw $util.ProtocolError("missing required 'h'", { instance: message });
                    if (!message.hasOwnProperty("s"))
                        throw $util.ProtocolError("missing required 's'", { instance: message });
                    if (!message.hasOwnProperty("b"))
                        throw $util.ProtocolError("missing required 'b'", { instance: message });
                    return message;
                };
    
                /**
                 * Decodes a HSB message from the specified reader or buffer, length delimited.
                 * @function decodeDelimited
                 * @memberof UsbComm.RgbState.HSB
                 * @static
                 * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
                 * @returns {UsbComm.RgbState.HSB} HSB
                 * @throws {Error} If the payload is not a reader or valid buffer
                 * @throws {$protobuf.util.ProtocolError} If required fields are missing
                 */
                HSB.decodeDelimited = function decodeDelimited(reader) {
                    if (!(reader instanceof $Reader))
                        reader = new $Reader(reader);
                    return this.decode(reader, reader.uint32());
                };
    
                /**
                 * Verifies a HSB message.
                 * @function verify
                 * @memberof UsbComm.RgbState.HSB
                 * @static
                 * @param {Object.<string,*>} message Plain object to verify
                 * @returns {string|null} `null` if valid, otherwise the reason why it is not
                 */
                HSB.verify = function verify(message) {
                    if (typeof message !== "object" || message === null)
                        return "object expected";
                    if (!$util.isInteger(message.h))
                        return "h: integer expected";
                    if (!$util.isInteger(message.s))
                        return "s: integer expected";
                    if (!$util.isInteger(message.b))
                        return "b: integer expected";
                    return null;
                };
    
                /**
                 * Creates a HSB message from a plain object. Also converts values to their respective internal types.
                 * @function fromObject
                 * @memberof UsbComm.RgbState.HSB
                 * @static
                 * @param {Object.<string,*>} object Plain object
                 * @returns {UsbComm.RgbState.HSB} HSB
                 */
                HSB.fromObject = function fromObject(object) {
                    if (object instanceof $root.UsbComm.RgbState.HSB)
                        return object;
                    var message = new $root.UsbComm.RgbState.HSB();
                    if (object.h != null)
                        message.h = object.h >>> 0;
                    if (object.s != null)
                        message.s = object.s >>> 0;
                    if (object.b != null)
                        message.b = object.b >>> 0;
                    return message;
                };
    
                /**
                 * Creates a plain object from a HSB message. Also converts values to other types if specified.
                 * @function toObject
                 * @memberof UsbComm.RgbState.HSB
                 * @static
                 * @param {UsbComm.RgbState.HSB} message HSB
                 * @param {$protobuf.IConversionOptions} [options] Conversion options
                 * @returns {Object.<string,*>} Plain object
                 */
                HSB.toObject = function toObject(message, options) {
                    if (!options)
                        options = {};
                    var object = {};
                    if (options.defaults) {
                        object.h = 0;
                        object.s = 0;
                        object.b = 0;
                    }
                    if (message.h != null && message.hasOwnProperty("h"))
                        object.h = message.h;
                    if (message.s != null && message.hasOwnProperty("s"))
                        object.s = message.s;
                    if (message.b != null && message.hasOwnProperty("b"))
                        object.b = message.b;
                    return object;
                };
    
                /**
                 * Converts this HSB to JSON.
                 * @function toJSON
                 * @memberof UsbComm.RgbState.HSB
                 * @instance
                 * @returns {Object.<string,*>} JSON object
                 */
                HSB.prototype.toJSON = function toJSON() {
                    return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
                };
    
                /**
                 * Gets the default type url for HSB
                 * @function getTypeUrl
                 * @memberof UsbComm.RgbState.HSB
                 * @static
                 * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
                 * @returns {string} The default type url
                 */
                HSB.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
                    if (typeUrlPrefix === undefined) {
                        typeUrlPrefix = "type.googleapis.com";
                    }
                    return typeUrlPrefix + "/UsbComm.RgbState.HSB";
                };
    
                return HSB;
            })();
    
            /**
             * Effect enum.
             * @name UsbComm.RgbState.Effect
             * @enum {number}
             * @property {number} SOLID=0 SOLID value
             * @property {number} BREATHE=1 BREATHE value
             * @property {number} SPECTRUM=2 SPECTRUM value
             * @property {number} SWIRL=3 SWIRL value
             */
            RgbState.Effect = (function() {
                var valuesById = {}, values = Object.create(valuesById);
                values[valuesById[0] = "SOLID"] = 0;
                values[valuesById[1] = "BREATHE"] = 1;
                values[valuesById[2] = "SPECTRUM"] = 2;
                values[valuesById[3] = "SWIRL"] = 3;
                return values;
            })();
    
            return RgbState;
        })();
    
        UsbComm.RgbIndicator = (function() {
    
            /**
             * Properties of a RgbIndicator.
             * @memberof UsbComm
             * @interface IRgbIndicator
             * @property {boolean|null} [enable] RgbIndicator enable
             * @property {number|null} [brightnessActive] RgbIndicator brightnessActive
             * @property {number|null} [brightnessInactive] RgbIndicator brightnessInactive
             */
    
            /**
             * Constructs a new RgbIndicator.
             * @memberof UsbComm
             * @classdesc Represents a RgbIndicator.
             * @implements IRgbIndicator
             * @constructor
             * @param {UsbComm.IRgbIndicator=} [properties] Properties to set
             */
            function RgbIndicator(properties) {
                if (properties)
                    for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                        if (properties[keys[i]] != null)
                            this[keys[i]] = properties[keys[i]];
            }
    
            /**
             * RgbIndicator enable.
             * @member {boolean} enable
             * @memberof UsbComm.RgbIndicator
             * @instance
             */
            RgbIndicator.prototype.enable = false;
    
            /**
             * RgbIndicator brightnessActive.
             * @member {number} brightnessActive
             * @memberof UsbComm.RgbIndicator
             * @instance
             */
            RgbIndicator.prototype.brightnessActive = 0;
    
            /**
             * RgbIndicator brightnessInactive.
             * @member {number} brightnessInactive
             * @memberof UsbComm.RgbIndicator
             * @instance
             */
            RgbIndicator.prototype.brightnessInactive = 0;
    
            /**
             * Creates a new RgbIndicator instance using the specified properties.
             * @function create
             * @memberof UsbComm.RgbIndicator
             * @static
             * @param {UsbComm.IRgbIndicator=} [properties] Properties to set
             * @returns {UsbComm.RgbIndicator} RgbIndicator instance
             */
            RgbIndicator.create = function create(properties) {
                return new RgbIndicator(properties);
            };
    
            /**
             * Encodes the specified RgbIndicator message. Does not implicitly {@link UsbComm.RgbIndicator.verify|verify} messages.
             * @function encode
             * @memberof UsbComm.RgbIndicator
             * @static
             * @param {UsbComm.IRgbIndicator} message RgbIndicator message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            RgbIndicator.encode = function encode(message, writer) {
                if (!writer)
                    writer = $Writer.create();
                if (message.enable != null && Object.hasOwnProperty.call(message, "enable"))
                    writer.uint32(/* id 1, wireType 0 =*/8).bool(message.enable);
                if (message.brightnessActive != null && Object.hasOwnProperty.call(message, "brightnessActive"))
                    writer.uint32(/* id 2, wireType 0 =*/16).uint32(message.brightnessActive);
                if (message.brightnessInactive != null && Object.hasOwnProperty.call(message, "brightnessInactive"))
                    writer.uint32(/* id 3, wireType 0 =*/24).uint32(message.brightnessInactive);
                return writer;
            };
    
            /**
             * Encodes the specified RgbIndicator message, length delimited. Does not implicitly {@link UsbComm.RgbIndicator.verify|verify} messages.
             * @function encodeDelimited
             * @memberof UsbComm.RgbIndicator
             * @static
             * @param {UsbComm.IRgbIndicator} message RgbIndicator message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            RgbIndicator.encodeDelimited = function encodeDelimited(message, writer) {
                return this.encode(message, writer).ldelim();
            };
    
            /**
             * Decodes a RgbIndicator message from the specified reader or buffer.
             * @function decode
             * @memberof UsbComm.RgbIndicator
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @param {number} [length] Message length if known beforehand
             * @returns {UsbComm.RgbIndicator} RgbIndicator
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            RgbIndicator.decode = function decode(reader, length) {
                if (!(reader instanceof $Reader))
                    reader = $Reader.create(reader);
                var end = length === undefined ? reader.len : reader.pos + length, message = new $root.UsbComm.RgbIndicator();
                while (reader.pos < end) {
                    var tag = reader.uint32();
                    switch (tag >>> 3) {
                    case 1: {
                            message.enable = reader.bool();
                            break;
                        }
                    case 2: {
                            message.brightnessActive = reader.uint32();
                            break;
                        }
                    case 3: {
                            message.brightnessInactive = reader.uint32();
                            break;
                        }
                    default:
                        reader.skipType(tag & 7);
                        break;
                    }
                }
                return message;
            };
    
            /**
             * Decodes a RgbIndicator message from the specified reader or buffer, length delimited.
             * @function decodeDelimited
             * @memberof UsbComm.RgbIndicator
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @returns {UsbComm.RgbIndicator} RgbIndicator
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            RgbIndicator.decodeDelimited = function decodeDelimited(reader) {
                if (!(reader instanceof $Reader))
                    reader = new $Reader(reader);
                return this.decode(reader, reader.uint32());
            };
    
            /**
             * Verifies a RgbIndicator message.
             * @function verify
             * @memberof UsbComm.RgbIndicator
             * @static
             * @param {Object.<string,*>} message Plain object to verify
             * @returns {string|null} `null` if valid, otherwise the reason why it is not
             */
            RgbIndicator.verify = function verify(message) {
                if (typeof message !== "object" || message === null)
                    return "object expected";
                if (message.enable != null && message.hasOwnProperty("enable"))
                    if (typeof message.enable !== "boolean")
                        return "enable: boolean expected";
                if (message.brightnessActive != null && message.hasOwnProperty("brightnessActive"))
                    if (!$util.isInteger(message.brightnessActive))
                        return "brightnessActive: integer expected";
                if (message.brightnessInactive != null && message.hasOwnProperty("brightnessInactive"))
                    if (!$util.isInteger(message.brightnessInactive))
                        return "brightnessInactive: integer expected";
                return null;
            };
    
            /**
             * Creates a RgbIndicator message from a plain object. Also converts values to their respective internal types.
             * @function fromObject
             * @memberof UsbComm.RgbIndicator
             * @static
             * @param {Object.<string,*>} object Plain object
             * @returns {UsbComm.RgbIndicator} RgbIndicator
             */
            RgbIndicator.fromObject = function fromObject(object) {
                if (object instanceof $root.UsbComm.RgbIndicator)
                    return object;
                var message = new $root.UsbComm.RgbIndicator();
                if (object.enable != null)
                    message.enable = Boolean(object.enable);
                if (object.brightnessActive != null)
                    message.brightnessActive = object.brightnessActive >>> 0;
                if (object.brightnessInactive != null)
                    message.brightnessInactive = object.brightnessInactive >>> 0;
                return message;
            };
    
            /**
             * Creates a plain object from a RgbIndicator message. Also converts values to other types if specified.
             * @function toObject
             * @memberof UsbComm.RgbIndicator
             * @static
             * @param {UsbComm.RgbIndicator} message RgbIndicator
             * @param {$protobuf.IConversionOptions} [options] Conversion options
             * @returns {Object.<string,*>} Plain object
             */
            RgbIndicator.toObject = function toObject(message, options) {
                if (!options)
                    options = {};
                var object = {};
                if (options.defaults) {
                    object.enable = false;
                    object.brightnessActive = 0;
                    object.brightnessInactive = 0;
                }
                if (message.enable != null && message.hasOwnProperty("enable"))
                    object.enable = message.enable;
                if (message.brightnessActive != null && message.hasOwnProperty("brightnessActive"))
                    object.brightnessActive = message.brightnessActive;
                if (message.brightnessInactive != null && message.hasOwnProperty("brightnessInactive"))
                    object.brightnessInactive = message.brightnessInactive;
                return object;
            };
    
            /**
             * Converts this RgbIndicator to JSON.
             * @function toJSON
             * @memberof UsbComm.RgbIndicator
             * @instance
             * @returns {Object.<string,*>} JSON object
             */
            RgbIndicator.prototype.toJSON = function toJSON() {
                return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
            };
    
            /**
             * Gets the default type url for RgbIndicator
             * @function getTypeUrl
             * @memberof UsbComm.RgbIndicator
             * @static
             * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
             * @returns {string} The default type url
             */
            RgbIndicator.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
                if (typeUrlPrefix === undefined) {
                    typeUrlPrefix = "type.googleapis.com";
                }
                return typeUrlPrefix + "/UsbComm.RgbIndicator";
            };
    
            return RgbIndicator;
        })();
    
        UsbComm.EinkImage = (function() {
    
            /**
             * Properties of an EinkImage.
             * @memberof UsbComm
             * @interface IEinkImage
             * @property {number} id EinkImage id
             * @property {number|null} [bitsLength] EinkImage bitsLength
             * @property {Uint8Array|null} [bits] EinkImage bits
             * @property {number|null} [x] EinkImage x
             * @property {number|null} [y] EinkImage y
             * @property {number|null} [width] EinkImage width
             * @property {number|null} [height] EinkImage height
             * @property {boolean|null} [partial] EinkImage partial
             */
    
            /**
             * Constructs a new EinkImage.
             * @memberof UsbComm
             * @classdesc Represents an EinkImage.
             * @implements IEinkImage
             * @constructor
             * @param {UsbComm.IEinkImage=} [properties] Properties to set
             */
            function EinkImage(properties) {
                if (properties)
                    for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                        if (properties[keys[i]] != null)
                            this[keys[i]] = properties[keys[i]];
            }
    
            /**
             * EinkImage id.
             * @member {number} id
             * @memberof UsbComm.EinkImage
             * @instance
             */
            EinkImage.prototype.id = 0;
    
            /**
             * EinkImage bitsLength.
             * @member {number} bitsLength
             * @memberof UsbComm.EinkImage
             * @instance
             */
            EinkImage.prototype.bitsLength = 0;
    
            /**
             * EinkImage bits.
             * @member {Uint8Array} bits
             * @memberof UsbComm.EinkImage
             * @instance
             */
            EinkImage.prototype.bits = $util.newBuffer([]);
    
            /**
             * EinkImage x.
             * @member {number} x
             * @memberof UsbComm.EinkImage
             * @instance
             */
            EinkImage.prototype.x = 0;
    
            /**
             * EinkImage y.
             * @member {number} y
             * @memberof UsbComm.EinkImage
             * @instance
             */
            EinkImage.prototype.y = 0;
    
            /**
             * EinkImage width.
             * @member {number} width
             * @memberof UsbComm.EinkImage
             * @instance
             */
            EinkImage.prototype.width = 0;
    
            /**
             * EinkImage height.
             * @member {number} height
             * @memberof UsbComm.EinkImage
             * @instance
             */
            EinkImage.prototype.height = 0;
    
            /**
             * EinkImage partial.
             * @member {boolean} partial
             * @memberof UsbComm.EinkImage
             * @instance
             */
            EinkImage.prototype.partial = false;
    
            /**
             * Creates a new EinkImage instance using the specified properties.
             * @function create
             * @memberof UsbComm.EinkImage
             * @static
             * @param {UsbComm.IEinkImage=} [properties] Properties to set
             * @returns {UsbComm.EinkImage} EinkImage instance
             */
            EinkImage.create = function create(properties) {
                return new EinkImage(properties);
            };
    
            /**
             * Encodes the specified EinkImage message. Does not implicitly {@link UsbComm.EinkImage.verify|verify} messages.
             * @function encode
             * @memberof UsbComm.EinkImage
             * @static
             * @param {UsbComm.IEinkImage} message EinkImage message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            EinkImage.encode = function encode(message, writer) {
                if (!writer)
                    writer = $Writer.create();
                writer.uint32(/* id 1, wireType 0 =*/8).uint32(message.id);
                if (message.bitsLength != null && Object.hasOwnProperty.call(message, "bitsLength"))
                    writer.uint32(/* id 2, wireType 0 =*/16).uint32(message.bitsLength);
                if (message.bits != null && Object.hasOwnProperty.call(message, "bits"))
                    writer.uint32(/* id 3, wireType 2 =*/26).bytes(message.bits);
                if (message.x != null && Object.hasOwnProperty.call(message, "x"))
                    writer.uint32(/* id 4, wireType 0 =*/32).uint32(message.x);
                if (message.y != null && Object.hasOwnProperty.call(message, "y"))
                    writer.uint32(/* id 5, wireType 0 =*/40).uint32(message.y);
                if (message.width != null && Object.hasOwnProperty.call(message, "width"))
                    writer.uint32(/* id 6, wireType 0 =*/48).uint32(message.width);
                if (message.height != null && Object.hasOwnProperty.call(message, "height"))
                    writer.uint32(/* id 7, wireType 0 =*/56).uint32(message.height);
                if (message.partial != null && Object.hasOwnProperty.call(message, "partial"))
                    writer.uint32(/* id 8, wireType 0 =*/64).bool(message.partial);
                return writer;
            };
    
            /**
             * Encodes the specified EinkImage message, length delimited. Does not implicitly {@link UsbComm.EinkImage.verify|verify} messages.
             * @function encodeDelimited
             * @memberof UsbComm.EinkImage
             * @static
             * @param {UsbComm.IEinkImage} message EinkImage message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            EinkImage.encodeDelimited = function encodeDelimited(message, writer) {
                return this.encode(message, writer).ldelim();
            };
    
            /**
             * Decodes an EinkImage message from the specified reader or buffer.
             * @function decode
             * @memberof UsbComm.EinkImage
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @param {number} [length] Message length if known beforehand
             * @returns {UsbComm.EinkImage} EinkImage
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            EinkImage.decode = function decode(reader, length) {
                if (!(reader instanceof $Reader))
                    reader = $Reader.create(reader);
                var end = length === undefined ? reader.len : reader.pos + length, message = new $root.UsbComm.EinkImage();
                while (reader.pos < end) {
                    var tag = reader.uint32();
                    switch (tag >>> 3) {
                    case 1: {
                            message.id = reader.uint32();
                            break;
                        }
                    case 2: {
                            message.bitsLength = reader.uint32();
                            break;
                        }
                    case 3: {
                            message.bits = reader.bytes();
                            break;
                        }
                    case 4: {
                            message.x = reader.uint32();
                            break;
                        }
                    case 5: {
                            message.y = reader.uint32();
                            break;
                        }
                    case 6: {
                            message.width = reader.uint32();
                            break;
                        }
                    case 7: {
                            message.height = reader.uint32();
                            break;
                        }
                    case 8: {
                            message.partial = reader.bool();
                            break;
                        }
                    default:
                        reader.skipType(tag & 7);
                        break;
                    }
                }
                if (!message.hasOwnProperty("id"))
                    throw $util.ProtocolError("missing required 'id'", { instance: message });
                return message;
            };
    
            /**
             * Decodes an EinkImage message from the specified reader or buffer, length delimited.
             * @function decodeDelimited
             * @memberof UsbComm.EinkImage
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @returns {UsbComm.EinkImage} EinkImage
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            EinkImage.decodeDelimited = function decodeDelimited(reader) {
                if (!(reader instanceof $Reader))
                    reader = new $Reader(reader);
                return this.decode(reader, reader.uint32());
            };
    
            /**
             * Verifies an EinkImage message.
             * @function verify
             * @memberof UsbComm.EinkImage
             * @static
             * @param {Object.<string,*>} message Plain object to verify
             * @returns {string|null} `null` if valid, otherwise the reason why it is not
             */
            EinkImage.verify = function verify(message) {
                if (typeof message !== "object" || message === null)
                    return "object expected";
                if (!$util.isInteger(message.id))
                    return "id: integer expected";
                if (message.bitsLength != null && message.hasOwnProperty("bitsLength"))
                    if (!$util.isInteger(message.bitsLength))
                        return "bitsLength: integer expected";
                if (message.bits != null && message.hasOwnProperty("bits"))
                    if (!(message.bits && typeof message.bits.length === "number" || $util.isString(message.bits)))
                        return "bits: buffer expected";
                if (message.x != null && message.hasOwnProperty("x"))
                    if (!$util.isInteger(message.x))
                        return "x: integer expected";
                if (message.y != null && message.hasOwnProperty("y"))
                    if (!$util.isInteger(message.y))
                        return "y: integer expected";
                if (message.width != null && message.hasOwnProperty("width"))
                    if (!$util.isInteger(message.width))
                        return "width: integer expected";
                if (message.height != null && message.hasOwnProperty("height"))
                    if (!$util.isInteger(message.height))
                        return "height: integer expected";
                if (message.partial != null && message.hasOwnProperty("partial"))
                    if (typeof message.partial !== "boolean")
                        return "partial: boolean expected";
                return null;
            };
    
            /**
             * Creates an EinkImage message from a plain object. Also converts values to their respective internal types.
             * @function fromObject
             * @memberof UsbComm.EinkImage
             * @static
             * @param {Object.<string,*>} object Plain object
             * @returns {UsbComm.EinkImage} EinkImage
             */
            EinkImage.fromObject = function fromObject(object) {
                if (object instanceof $root.UsbComm.EinkImage)
                    return object;
                var message = new $root.UsbComm.EinkImage();
                if (object.id != null)
                    message.id = object.id >>> 0;
                if (object.bitsLength != null)
                    message.bitsLength = object.bitsLength >>> 0;
                if (object.bits != null)
                    if (typeof object.bits === "string")
                        $util.base64.decode(object.bits, message.bits = $util.newBuffer($util.base64.length(object.bits)), 0);
                    else if (object.bits.length >= 0)
                        message.bits = object.bits;
                if (object.x != null)
                    message.x = object.x >>> 0;
                if (object.y != null)
                    message.y = object.y >>> 0;
                if (object.width != null)
                    message.width = object.width >>> 0;
                if (object.height != null)
                    message.height = object.height >>> 0;
                if (object.partial != null)
                    message.partial = Boolean(object.partial);
                return message;
            };
    
            /**
             * Creates a plain object from an EinkImage message. Also converts values to other types if specified.
             * @function toObject
             * @memberof UsbComm.EinkImage
             * @static
             * @param {UsbComm.EinkImage} message EinkImage
             * @param {$protobuf.IConversionOptions} [options] Conversion options
             * @returns {Object.<string,*>} Plain object
             */
            EinkImage.toObject = function toObject(message, options) {
                if (!options)
                    options = {};
                var object = {};
                if (options.defaults) {
                    object.id = 0;
                    object.bitsLength = 0;
                    if (options.bytes === String)
                        object.bits = "";
                    else {
                        object.bits = [];
                        if (options.bytes !== Array)
                            object.bits = $util.newBuffer(object.bits);
                    }
                    object.x = 0;
                    object.y = 0;
                    object.width = 0;
                    object.height = 0;
                    object.partial = false;
                }
                if (message.id != null && message.hasOwnProperty("id"))
                    object.id = message.id;
                if (message.bitsLength != null && message.hasOwnProperty("bitsLength"))
                    object.bitsLength = message.bitsLength;
                if (message.bits != null && message.hasOwnProperty("bits"))
                    object.bits = options.bytes === String ? $util.base64.encode(message.bits, 0, message.bits.length) : options.bytes === Array ? Array.prototype.slice.call(message.bits) : message.bits;
                if (message.x != null && message.hasOwnProperty("x"))
                    object.x = message.x;
                if (message.y != null && message.hasOwnProperty("y"))
                    object.y = message.y;
                if (message.width != null && message.hasOwnProperty("width"))
                    object.width = message.width;
                if (message.height != null && message.hasOwnProperty("height"))
                    object.height = message.height;
                if (message.partial != null && message.hasOwnProperty("partial"))
                    object.partial = message.partial;
                return object;
            };
    
            /**
             * Converts this EinkImage to JSON.
             * @function toJSON
             * @memberof UsbComm.EinkImage
             * @instance
             * @returns {Object.<string,*>} JSON object
             */
            EinkImage.prototype.toJSON = function toJSON() {
                return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
            };
    
            /**
             * Gets the default type url for EinkImage
             * @function getTypeUrl
             * @memberof UsbComm.EinkImage
             * @static
             * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
             * @returns {string} The default type url
             */
            EinkImage.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
                if (typeUrlPrefix === undefined) {
                    typeUrlPrefix = "type.googleapis.com";
                }
                return typeUrlPrefix + "/UsbComm.EinkImage";
            };
    
            return EinkImage;
        })();
    
        return UsbComm;
    })();

    return $root;
});
