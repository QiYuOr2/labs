import * as $protobuf from "protobufjs";
import Long = require("long");
/** Namespace UsbComm. */
export namespace UsbComm {

    /** Action enum. */
    enum Action {
        NOP = 0,
        VERSION = 1,
        MOTOR_GET_STATE = 2,
        KNOB_GET_CONFIG = 3,
        KNOB_SET_CONFIG = 4,
        KNOB_UPDATE_PREF = 9,
        RGB_CONTROL = 5,
        RGB_GET_STATE = 6,
        RGB_SET_STATE = 8,
        RGB_GET_INDICATOR = 10,
        RGB_SET_INDICATOR = 11,
        EINK_SET_IMAGE = 7
    }

    /** Properties of a MessageH2D. */
    interface IMessageH2D {

        /** MessageH2D action */
        action: UsbComm.Action;

        /** MessageH2D nop */
        nop?: (UsbComm.INop|null);

        /** MessageH2D knobConfig */
        knobConfig?: (UsbComm.IKnobConfig|null);

        /** MessageH2D knobPref */
        knobPref?: (UsbComm.KnobConfig.IPref|null);

        /** MessageH2D rgbControl */
        rgbControl?: (UsbComm.IRgbControl|null);

        /** MessageH2D rgbState */
        rgbState?: (UsbComm.IRgbState|null);

        /** MessageH2D rgbIndicator */
        rgbIndicator?: (UsbComm.IRgbIndicator|null);

        /** MessageH2D einkImage */
        einkImage?: (UsbComm.IEinkImage|null);
    }

    /** Represents a MessageH2D. */
    class MessageH2D implements IMessageH2D {

        /**
         * Constructs a new MessageH2D.
         * @param [properties] Properties to set
         */
        constructor(properties?: UsbComm.IMessageH2D);

        /** MessageH2D action. */
        public action: UsbComm.Action;

        /** MessageH2D nop. */
        public nop?: (UsbComm.INop|null);

        /** MessageH2D knobConfig. */
        public knobConfig?: (UsbComm.IKnobConfig|null);

        /** MessageH2D knobPref. */
        public knobPref?: (UsbComm.KnobConfig.IPref|null);

        /** MessageH2D rgbControl. */
        public rgbControl?: (UsbComm.IRgbControl|null);

        /** MessageH2D rgbState. */
        public rgbState?: (UsbComm.IRgbState|null);

        /** MessageH2D rgbIndicator. */
        public rgbIndicator?: (UsbComm.IRgbIndicator|null);

        /** MessageH2D einkImage. */
        public einkImage?: (UsbComm.IEinkImage|null);

        /** MessageH2D payload. */
        public payload?: ("nop"|"knobConfig"|"knobPref"|"rgbControl"|"rgbState"|"rgbIndicator"|"einkImage");

        /**
         * Creates a new MessageH2D instance using the specified properties.
         * @param [properties] Properties to set
         * @returns MessageH2D instance
         */
        public static create(properties?: UsbComm.IMessageH2D): UsbComm.MessageH2D;

        /**
         * Encodes the specified MessageH2D message. Does not implicitly {@link UsbComm.MessageH2D.verify|verify} messages.
         * @param message MessageH2D message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        public static encode(message: UsbComm.IMessageH2D, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Encodes the specified MessageH2D message, length delimited. Does not implicitly {@link UsbComm.MessageH2D.verify|verify} messages.
         * @param message MessageH2D message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        public static encodeDelimited(message: UsbComm.IMessageH2D, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Decodes a MessageH2D message from the specified reader or buffer.
         * @param reader Reader or buffer to decode from
         * @param [length] Message length if known beforehand
         * @returns MessageH2D
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): UsbComm.MessageH2D;

        /**
         * Decodes a MessageH2D message from the specified reader or buffer, length delimited.
         * @param reader Reader or buffer to decode from
         * @returns MessageH2D
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): UsbComm.MessageH2D;

        /**
         * Verifies a MessageH2D message.
         * @param message Plain object to verify
         * @returns `null` if valid, otherwise the reason why it is not
         */
        public static verify(message: { [k: string]: any }): (string|null);

        /**
         * Creates a MessageH2D message from a plain object. Also converts values to their respective internal types.
         * @param object Plain object
         * @returns MessageH2D
         */
        public static fromObject(object: { [k: string]: any }): UsbComm.MessageH2D;

        /**
         * Creates a plain object from a MessageH2D message. Also converts values to other types if specified.
         * @param message MessageH2D
         * @param [options] Conversion options
         * @returns Plain object
         */
        public static toObject(message: UsbComm.MessageH2D, options?: $protobuf.IConversionOptions): { [k: string]: any };

        /**
         * Converts this MessageH2D to JSON.
         * @returns JSON object
         */
        public toJSON(): { [k: string]: any };

        /**
         * Gets the default type url for MessageH2D
         * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
         * @returns The default type url
         */
        public static getTypeUrl(typeUrlPrefix?: string): string;
    }

    /** Properties of a MessageD2H. */
    interface IMessageD2H {

        /** MessageD2H action */
        action: UsbComm.Action;

        /** MessageD2H nop */
        nop?: (UsbComm.INop|null);

        /** MessageD2H version */
        version?: (UsbComm.IVersion|null);

        /** MessageD2H motorState */
        motorState?: (UsbComm.IMotorState|null);

        /** MessageD2H knobConfig */
        knobConfig?: (UsbComm.IKnobConfig|null);

        /** MessageD2H knobPref */
        knobPref?: (UsbComm.KnobConfig.IPref|null);

        /** MessageD2H rgbState */
        rgbState?: (UsbComm.IRgbState|null);

        /** MessageD2H rgbIndicator */
        rgbIndicator?: (UsbComm.IRgbIndicator|null);

        /** MessageD2H einkImage */
        einkImage?: (UsbComm.IEinkImage|null);
    }

    /** Represents a MessageD2H. */
    class MessageD2H implements IMessageD2H {

        /**
         * Constructs a new MessageD2H.
         * @param [properties] Properties to set
         */
        constructor(properties?: UsbComm.IMessageD2H);

        /** MessageD2H action. */
        public action: UsbComm.Action;

        /** MessageD2H nop. */
        public nop?: (UsbComm.INop|null);

        /** MessageD2H version. */
        public version?: (UsbComm.IVersion|null);

        /** MessageD2H motorState. */
        public motorState?: (UsbComm.IMotorState|null);

        /** MessageD2H knobConfig. */
        public knobConfig?: (UsbComm.IKnobConfig|null);

        /** MessageD2H knobPref. */
        public knobPref?: (UsbComm.KnobConfig.IPref|null);

        /** MessageD2H rgbState. */
        public rgbState?: (UsbComm.IRgbState|null);

        /** MessageD2H rgbIndicator. */
        public rgbIndicator?: (UsbComm.IRgbIndicator|null);

        /** MessageD2H einkImage. */
        public einkImage?: (UsbComm.IEinkImage|null);

        /** MessageD2H payload. */
        public payload?: ("nop"|"version"|"motorState"|"knobConfig"|"knobPref"|"rgbState"|"rgbIndicator"|"einkImage");

        /**
         * Creates a new MessageD2H instance using the specified properties.
         * @param [properties] Properties to set
         * @returns MessageD2H instance
         */
        public static create(properties?: UsbComm.IMessageD2H): UsbComm.MessageD2H;

        /**
         * Encodes the specified MessageD2H message. Does not implicitly {@link UsbComm.MessageD2H.verify|verify} messages.
         * @param message MessageD2H message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        public static encode(message: UsbComm.IMessageD2H, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Encodes the specified MessageD2H message, length delimited. Does not implicitly {@link UsbComm.MessageD2H.verify|verify} messages.
         * @param message MessageD2H message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        public static encodeDelimited(message: UsbComm.IMessageD2H, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Decodes a MessageD2H message from the specified reader or buffer.
         * @param reader Reader or buffer to decode from
         * @param [length] Message length if known beforehand
         * @returns MessageD2H
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): UsbComm.MessageD2H;

        /**
         * Decodes a MessageD2H message from the specified reader or buffer, length delimited.
         * @param reader Reader or buffer to decode from
         * @returns MessageD2H
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): UsbComm.MessageD2H;

        /**
         * Verifies a MessageD2H message.
         * @param message Plain object to verify
         * @returns `null` if valid, otherwise the reason why it is not
         */
        public static verify(message: { [k: string]: any }): (string|null);

        /**
         * Creates a MessageD2H message from a plain object. Also converts values to their respective internal types.
         * @param object Plain object
         * @returns MessageD2H
         */
        public static fromObject(object: { [k: string]: any }): UsbComm.MessageD2H;

        /**
         * Creates a plain object from a MessageD2H message. Also converts values to other types if specified.
         * @param message MessageD2H
         * @param [options] Conversion options
         * @returns Plain object
         */
        public static toObject(message: UsbComm.MessageD2H, options?: $protobuf.IConversionOptions): { [k: string]: any };

        /**
         * Converts this MessageD2H to JSON.
         * @returns JSON object
         */
        public toJSON(): { [k: string]: any };

        /**
         * Gets the default type url for MessageD2H
         * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
         * @returns The default type url
         */
        public static getTypeUrl(typeUrlPrefix?: string): string;
    }

    /** Properties of a Nop. */
    interface INop {
    }

    /** Represents a Nop. */
    class Nop implements INop {

        /**
         * Constructs a new Nop.
         * @param [properties] Properties to set
         */
        constructor(properties?: UsbComm.INop);

        /**
         * Creates a new Nop instance using the specified properties.
         * @param [properties] Properties to set
         * @returns Nop instance
         */
        public static create(properties?: UsbComm.INop): UsbComm.Nop;

        /**
         * Encodes the specified Nop message. Does not implicitly {@link UsbComm.Nop.verify|verify} messages.
         * @param message Nop message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        public static encode(message: UsbComm.INop, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Encodes the specified Nop message, length delimited. Does not implicitly {@link UsbComm.Nop.verify|verify} messages.
         * @param message Nop message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        public static encodeDelimited(message: UsbComm.INop, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Decodes a Nop message from the specified reader or buffer.
         * @param reader Reader or buffer to decode from
         * @param [length] Message length if known beforehand
         * @returns Nop
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): UsbComm.Nop;

        /**
         * Decodes a Nop message from the specified reader or buffer, length delimited.
         * @param reader Reader or buffer to decode from
         * @returns Nop
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): UsbComm.Nop;

        /**
         * Verifies a Nop message.
         * @param message Plain object to verify
         * @returns `null` if valid, otherwise the reason why it is not
         */
        public static verify(message: { [k: string]: any }): (string|null);

        /**
         * Creates a Nop message from a plain object. Also converts values to their respective internal types.
         * @param object Plain object
         * @returns Nop
         */
        public static fromObject(object: { [k: string]: any }): UsbComm.Nop;

        /**
         * Creates a plain object from a Nop message. Also converts values to other types if specified.
         * @param message Nop
         * @param [options] Conversion options
         * @returns Plain object
         */
        public static toObject(message: UsbComm.Nop, options?: $protobuf.IConversionOptions): { [k: string]: any };

        /**
         * Converts this Nop to JSON.
         * @returns JSON object
         */
        public toJSON(): { [k: string]: any };

        /**
         * Gets the default type url for Nop
         * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
         * @returns The default type url
         */
        public static getTypeUrl(typeUrlPrefix?: string): string;
    }

    /** Properties of a Version. */
    interface IVersion {

        /** Version zephyrVersion */
        zephyrVersion: string;

        /** Version zmkVersion */
        zmkVersion: string;

        /** Version appVersion */
        appVersion: string;

        /** Version features */
        features?: (UsbComm.Version.IFeatures|null);
    }

    /** Represents a Version. */
    class Version implements IVersion {

        /**
         * Constructs a new Version.
         * @param [properties] Properties to set
         */
        constructor(properties?: UsbComm.IVersion);

        /** Version zephyrVersion. */
        public zephyrVersion: string;

        /** Version zmkVersion. */
        public zmkVersion: string;

        /** Version appVersion. */
        public appVersion: string;

        /** Version features. */
        public features?: (UsbComm.Version.IFeatures|null);

        /**
         * Creates a new Version instance using the specified properties.
         * @param [properties] Properties to set
         * @returns Version instance
         */
        public static create(properties?: UsbComm.IVersion): UsbComm.Version;

        /**
         * Encodes the specified Version message. Does not implicitly {@link UsbComm.Version.verify|verify} messages.
         * @param message Version message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        public static encode(message: UsbComm.IVersion, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Encodes the specified Version message, length delimited. Does not implicitly {@link UsbComm.Version.verify|verify} messages.
         * @param message Version message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        public static encodeDelimited(message: UsbComm.IVersion, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Decodes a Version message from the specified reader or buffer.
         * @param reader Reader or buffer to decode from
         * @param [length] Message length if known beforehand
         * @returns Version
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): UsbComm.Version;

        /**
         * Decodes a Version message from the specified reader or buffer, length delimited.
         * @param reader Reader or buffer to decode from
         * @returns Version
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): UsbComm.Version;

        /**
         * Verifies a Version message.
         * @param message Plain object to verify
         * @returns `null` if valid, otherwise the reason why it is not
         */
        public static verify(message: { [k: string]: any }): (string|null);

        /**
         * Creates a Version message from a plain object. Also converts values to their respective internal types.
         * @param object Plain object
         * @returns Version
         */
        public static fromObject(object: { [k: string]: any }): UsbComm.Version;

        /**
         * Creates a plain object from a Version message. Also converts values to other types if specified.
         * @param message Version
         * @param [options] Conversion options
         * @returns Plain object
         */
        public static toObject(message: UsbComm.Version, options?: $protobuf.IConversionOptions): { [k: string]: any };

        /**
         * Converts this Version to JSON.
         * @returns JSON object
         */
        public toJSON(): { [k: string]: any };

        /**
         * Gets the default type url for Version
         * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
         * @returns The default type url
         */
        public static getTypeUrl(typeUrlPrefix?: string): string;
    }

    namespace Version {

        /** Properties of a Features. */
        interface IFeatures {

            /** Features rgb */
            rgb?: (boolean|null);

            /** Features rgbFullControl */
            rgbFullControl?: (boolean|null);

            /** Features rgbIndicator */
            rgbIndicator?: (boolean|null);

            /** Features eink */
            eink?: (boolean|null);

            /** Features knob */
            knob?: (boolean|null);

            /** Features knobPrefs */
            knobPrefs?: (boolean|null);
        }

        /** Represents a Features. */
        class Features implements IFeatures {

            /**
             * Constructs a new Features.
             * @param [properties] Properties to set
             */
            constructor(properties?: UsbComm.Version.IFeatures);

            /** Features rgb. */
            public rgb: boolean;

            /** Features rgbFullControl. */
            public rgbFullControl: boolean;

            /** Features rgbIndicator. */
            public rgbIndicator: boolean;

            /** Features eink. */
            public eink: boolean;

            /** Features knob. */
            public knob: boolean;

            /** Features knobPrefs. */
            public knobPrefs: boolean;

            /**
             * Creates a new Features instance using the specified properties.
             * @param [properties] Properties to set
             * @returns Features instance
             */
            public static create(properties?: UsbComm.Version.IFeatures): UsbComm.Version.Features;

            /**
             * Encodes the specified Features message. Does not implicitly {@link UsbComm.Version.Features.verify|verify} messages.
             * @param message Features message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encode(message: UsbComm.Version.IFeatures, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Encodes the specified Features message, length delimited. Does not implicitly {@link UsbComm.Version.Features.verify|verify} messages.
             * @param message Features message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encodeDelimited(message: UsbComm.Version.IFeatures, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Decodes a Features message from the specified reader or buffer.
             * @param reader Reader or buffer to decode from
             * @param [length] Message length if known beforehand
             * @returns Features
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): UsbComm.Version.Features;

            /**
             * Decodes a Features message from the specified reader or buffer, length delimited.
             * @param reader Reader or buffer to decode from
             * @returns Features
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): UsbComm.Version.Features;

            /**
             * Verifies a Features message.
             * @param message Plain object to verify
             * @returns `null` if valid, otherwise the reason why it is not
             */
            public static verify(message: { [k: string]: any }): (string|null);

            /**
             * Creates a Features message from a plain object. Also converts values to their respective internal types.
             * @param object Plain object
             * @returns Features
             */
            public static fromObject(object: { [k: string]: any }): UsbComm.Version.Features;

            /**
             * Creates a plain object from a Features message. Also converts values to other types if specified.
             * @param message Features
             * @param [options] Conversion options
             * @returns Plain object
             */
            public static toObject(message: UsbComm.Version.Features, options?: $protobuf.IConversionOptions): { [k: string]: any };

            /**
             * Converts this Features to JSON.
             * @returns JSON object
             */
            public toJSON(): { [k: string]: any };

            /**
             * Gets the default type url for Features
             * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
             * @returns The default type url
             */
            public static getTypeUrl(typeUrlPrefix?: string): string;
        }
    }

    /** Properties of a MotorState. */
    interface IMotorState {

        /** MotorState timestamp */
        timestamp: number;

        /** MotorState controlMode */
        controlMode: UsbComm.MotorState.ControlMode;

        /** MotorState currentAngle */
        currentAngle: number;

        /** MotorState currentVelocity */
        currentVelocity: number;

        /** MotorState targetAngle */
        targetAngle: number;

        /** MotorState targetVelocity */
        targetVelocity: number;

        /** MotorState targetVoltage */
        targetVoltage: number;
    }

    /** Represents a MotorState. */
    class MotorState implements IMotorState {

        /**
         * Constructs a new MotorState.
         * @param [properties] Properties to set
         */
        constructor(properties?: UsbComm.IMotorState);

        /** MotorState timestamp. */
        public timestamp: number;

        /** MotorState controlMode. */
        public controlMode: UsbComm.MotorState.ControlMode;

        /** MotorState currentAngle. */
        public currentAngle: number;

        /** MotorState currentVelocity. */
        public currentVelocity: number;

        /** MotorState targetAngle. */
        public targetAngle: number;

        /** MotorState targetVelocity. */
        public targetVelocity: number;

        /** MotorState targetVoltage. */
        public targetVoltage: number;

        /**
         * Creates a new MotorState instance using the specified properties.
         * @param [properties] Properties to set
         * @returns MotorState instance
         */
        public static create(properties?: UsbComm.IMotorState): UsbComm.MotorState;

        /**
         * Encodes the specified MotorState message. Does not implicitly {@link UsbComm.MotorState.verify|verify} messages.
         * @param message MotorState message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        public static encode(message: UsbComm.IMotorState, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Encodes the specified MotorState message, length delimited. Does not implicitly {@link UsbComm.MotorState.verify|verify} messages.
         * @param message MotorState message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        public static encodeDelimited(message: UsbComm.IMotorState, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Decodes a MotorState message from the specified reader or buffer.
         * @param reader Reader or buffer to decode from
         * @param [length] Message length if known beforehand
         * @returns MotorState
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): UsbComm.MotorState;

        /**
         * Decodes a MotorState message from the specified reader or buffer, length delimited.
         * @param reader Reader or buffer to decode from
         * @returns MotorState
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): UsbComm.MotorState;

        /**
         * Verifies a MotorState message.
         * @param message Plain object to verify
         * @returns `null` if valid, otherwise the reason why it is not
         */
        public static verify(message: { [k: string]: any }): (string|null);

        /**
         * Creates a MotorState message from a plain object. Also converts values to their respective internal types.
         * @param object Plain object
         * @returns MotorState
         */
        public static fromObject(object: { [k: string]: any }): UsbComm.MotorState;

        /**
         * Creates a plain object from a MotorState message. Also converts values to other types if specified.
         * @param message MotorState
         * @param [options] Conversion options
         * @returns Plain object
         */
        public static toObject(message: UsbComm.MotorState, options?: $protobuf.IConversionOptions): { [k: string]: any };

        /**
         * Converts this MotorState to JSON.
         * @returns JSON object
         */
        public toJSON(): { [k: string]: any };

        /**
         * Gets the default type url for MotorState
         * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
         * @returns The default type url
         */
        public static getTypeUrl(typeUrlPrefix?: string): string;
    }

    namespace MotorState {

        /** ControlMode enum. */
        enum ControlMode {
            TORQUE = 0,
            VELOCITY = 1,
            ANGLE = 2
        }
    }

    /** Properties of a KnobConfig. */
    interface IKnobConfig {

        /** KnobConfig demo */
        demo: boolean;

        /** KnobConfig mode */
        mode: UsbComm.KnobConfig.Mode;

        /** KnobConfig prefs */
        prefs?: (UsbComm.KnobConfig.IPref[]|null);
    }

    /** Represents a KnobConfig. */
    class KnobConfig implements IKnobConfig {

        /**
         * Constructs a new KnobConfig.
         * @param [properties] Properties to set
         */
        constructor(properties?: UsbComm.IKnobConfig);

        /** KnobConfig demo. */
        public demo: boolean;

        /** KnobConfig mode. */
        public mode: UsbComm.KnobConfig.Mode;

        /** KnobConfig prefs. */
        public prefs: UsbComm.KnobConfig.IPref[];

        /**
         * Creates a new KnobConfig instance using the specified properties.
         * @param [properties] Properties to set
         * @returns KnobConfig instance
         */
        public static create(properties?: UsbComm.IKnobConfig): UsbComm.KnobConfig;

        /**
         * Encodes the specified KnobConfig message. Does not implicitly {@link UsbComm.KnobConfig.verify|verify} messages.
         * @param message KnobConfig message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        public static encode(message: UsbComm.IKnobConfig, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Encodes the specified KnobConfig message, length delimited. Does not implicitly {@link UsbComm.KnobConfig.verify|verify} messages.
         * @param message KnobConfig message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        public static encodeDelimited(message: UsbComm.IKnobConfig, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Decodes a KnobConfig message from the specified reader or buffer.
         * @param reader Reader or buffer to decode from
         * @param [length] Message length if known beforehand
         * @returns KnobConfig
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): UsbComm.KnobConfig;

        /**
         * Decodes a KnobConfig message from the specified reader or buffer, length delimited.
         * @param reader Reader or buffer to decode from
         * @returns KnobConfig
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): UsbComm.KnobConfig;

        /**
         * Verifies a KnobConfig message.
         * @param message Plain object to verify
         * @returns `null` if valid, otherwise the reason why it is not
         */
        public static verify(message: { [k: string]: any }): (string|null);

        /**
         * Creates a KnobConfig message from a plain object. Also converts values to their respective internal types.
         * @param object Plain object
         * @returns KnobConfig
         */
        public static fromObject(object: { [k: string]: any }): UsbComm.KnobConfig;

        /**
         * Creates a plain object from a KnobConfig message. Also converts values to other types if specified.
         * @param message KnobConfig
         * @param [options] Conversion options
         * @returns Plain object
         */
        public static toObject(message: UsbComm.KnobConfig, options?: $protobuf.IConversionOptions): { [k: string]: any };

        /**
         * Converts this KnobConfig to JSON.
         * @returns JSON object
         */
        public toJSON(): { [k: string]: any };

        /**
         * Gets the default type url for KnobConfig
         * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
         * @returns The default type url
         */
        public static getTypeUrl(typeUrlPrefix?: string): string;
    }

    namespace KnobConfig {

        /** Mode enum. */
        enum Mode {
            DISABLE = 0,
            INERTIA = 1,
            ENCODER = 2,
            SPRING = 3,
            DAMPED = 4,
            SPIN = 5,
            RATCHET = 6
        }

        /** Properties of a Pref. */
        interface IPref {

            /** Pref layerId */
            layerId: number;

            /** Pref layerName */
            layerName?: (string|null);

            /** Pref active */
            active: boolean;

            /** Pref mode */
            mode?: (UsbComm.KnobConfig.Mode|null);

            /** Pref ppr */
            ppr?: (number|null);

            /** Pref torqueLimit */
            torqueLimit?: (number|null);
        }

        /** Represents a Pref. */
        class Pref implements IPref {

            /**
             * Constructs a new Pref.
             * @param [properties] Properties to set
             */
            constructor(properties?: UsbComm.KnobConfig.IPref);

            /** Pref layerId. */
            public layerId: number;

            /** Pref layerName. */
            public layerName: string;

            /** Pref active. */
            public active: boolean;

            /** Pref mode. */
            public mode: UsbComm.KnobConfig.Mode;

            /** Pref ppr. */
            public ppr: number;

            /** Pref torqueLimit. */
            public torqueLimit: number;

            /**
             * Creates a new Pref instance using the specified properties.
             * @param [properties] Properties to set
             * @returns Pref instance
             */
            public static create(properties?: UsbComm.KnobConfig.IPref): UsbComm.KnobConfig.Pref;

            /**
             * Encodes the specified Pref message. Does not implicitly {@link UsbComm.KnobConfig.Pref.verify|verify} messages.
             * @param message Pref message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encode(message: UsbComm.KnobConfig.IPref, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Encodes the specified Pref message, length delimited. Does not implicitly {@link UsbComm.KnobConfig.Pref.verify|verify} messages.
             * @param message Pref message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encodeDelimited(message: UsbComm.KnobConfig.IPref, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Decodes a Pref message from the specified reader or buffer.
             * @param reader Reader or buffer to decode from
             * @param [length] Message length if known beforehand
             * @returns Pref
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): UsbComm.KnobConfig.Pref;

            /**
             * Decodes a Pref message from the specified reader or buffer, length delimited.
             * @param reader Reader or buffer to decode from
             * @returns Pref
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): UsbComm.KnobConfig.Pref;

            /**
             * Verifies a Pref message.
             * @param message Plain object to verify
             * @returns `null` if valid, otherwise the reason why it is not
             */
            public static verify(message: { [k: string]: any }): (string|null);

            /**
             * Creates a Pref message from a plain object. Also converts values to their respective internal types.
             * @param object Plain object
             * @returns Pref
             */
            public static fromObject(object: { [k: string]: any }): UsbComm.KnobConfig.Pref;

            /**
             * Creates a plain object from a Pref message. Also converts values to other types if specified.
             * @param message Pref
             * @param [options] Conversion options
             * @returns Plain object
             */
            public static toObject(message: UsbComm.KnobConfig.Pref, options?: $protobuf.IConversionOptions): { [k: string]: any };

            /**
             * Converts this Pref to JSON.
             * @returns JSON object
             */
            public toJSON(): { [k: string]: any };

            /**
             * Gets the default type url for Pref
             * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
             * @returns The default type url
             */
            public static getTypeUrl(typeUrlPrefix?: string): string;
        }
    }

    /** Properties of a RgbControl. */
    interface IRgbControl {

        /** RgbControl command */
        command: UsbComm.RgbControl.Command;
    }

    /** Represents a RgbControl. */
    class RgbControl implements IRgbControl {

        /**
         * Constructs a new RgbControl.
         * @param [properties] Properties to set
         */
        constructor(properties?: UsbComm.IRgbControl);

        /** RgbControl command. */
        public command: UsbComm.RgbControl.Command;

        /**
         * Creates a new RgbControl instance using the specified properties.
         * @param [properties] Properties to set
         * @returns RgbControl instance
         */
        public static create(properties?: UsbComm.IRgbControl): UsbComm.RgbControl;

        /**
         * Encodes the specified RgbControl message. Does not implicitly {@link UsbComm.RgbControl.verify|verify} messages.
         * @param message RgbControl message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        public static encode(message: UsbComm.IRgbControl, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Encodes the specified RgbControl message, length delimited. Does not implicitly {@link UsbComm.RgbControl.verify|verify} messages.
         * @param message RgbControl message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        public static encodeDelimited(message: UsbComm.IRgbControl, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Decodes a RgbControl message from the specified reader or buffer.
         * @param reader Reader or buffer to decode from
         * @param [length] Message length if known beforehand
         * @returns RgbControl
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): UsbComm.RgbControl;

        /**
         * Decodes a RgbControl message from the specified reader or buffer, length delimited.
         * @param reader Reader or buffer to decode from
         * @returns RgbControl
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): UsbComm.RgbControl;

        /**
         * Verifies a RgbControl message.
         * @param message Plain object to verify
         * @returns `null` if valid, otherwise the reason why it is not
         */
        public static verify(message: { [k: string]: any }): (string|null);

        /**
         * Creates a RgbControl message from a plain object. Also converts values to their respective internal types.
         * @param object Plain object
         * @returns RgbControl
         */
        public static fromObject(object: { [k: string]: any }): UsbComm.RgbControl;

        /**
         * Creates a plain object from a RgbControl message. Also converts values to other types if specified.
         * @param message RgbControl
         * @param [options] Conversion options
         * @returns Plain object
         */
        public static toObject(message: UsbComm.RgbControl, options?: $protobuf.IConversionOptions): { [k: string]: any };

        /**
         * Converts this RgbControl to JSON.
         * @returns JSON object
         */
        public toJSON(): { [k: string]: any };

        /**
         * Gets the default type url for RgbControl
         * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
         * @returns The default type url
         */
        public static getTypeUrl(typeUrlPrefix?: string): string;
    }

    namespace RgbControl {

        /** Command enum. */
        enum Command {
            RGB_ON = 1,
            RGB_OFF = 2,
            RGB_HUI = 3,
            RGB_HUD = 4,
            RGB_SAI = 5,
            RGB_SAD = 6,
            RGB_BRI = 7,
            RGB_BRD = 8,
            RGB_SPI = 9,
            RGB_SPD = 10,
            RGB_EFF = 11,
            RGB_EFR = 12
        }
    }

    /** Properties of a RgbState. */
    interface IRgbState {

        /** RgbState on */
        on: boolean;

        /** RgbState color */
        color?: (UsbComm.RgbState.IHSB|null);

        /** RgbState effect */
        effect?: (UsbComm.RgbState.Effect|null);

        /** RgbState speed */
        speed?: (number|null);
    }

    /** Represents a RgbState. */
    class RgbState implements IRgbState {

        /**
         * Constructs a new RgbState.
         * @param [properties] Properties to set
         */
        constructor(properties?: UsbComm.IRgbState);

        /** RgbState on. */
        public on: boolean;

        /** RgbState color. */
        public color?: (UsbComm.RgbState.IHSB|null);

        /** RgbState effect. */
        public effect: UsbComm.RgbState.Effect;

        /** RgbState speed. */
        public speed: number;

        /**
         * Creates a new RgbState instance using the specified properties.
         * @param [properties] Properties to set
         * @returns RgbState instance
         */
        public static create(properties?: UsbComm.IRgbState): UsbComm.RgbState;

        /**
         * Encodes the specified RgbState message. Does not implicitly {@link UsbComm.RgbState.verify|verify} messages.
         * @param message RgbState message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        public static encode(message: UsbComm.IRgbState, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Encodes the specified RgbState message, length delimited. Does not implicitly {@link UsbComm.RgbState.verify|verify} messages.
         * @param message RgbState message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        public static encodeDelimited(message: UsbComm.IRgbState, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Decodes a RgbState message from the specified reader or buffer.
         * @param reader Reader or buffer to decode from
         * @param [length] Message length if known beforehand
         * @returns RgbState
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): UsbComm.RgbState;

        /**
         * Decodes a RgbState message from the specified reader or buffer, length delimited.
         * @param reader Reader or buffer to decode from
         * @returns RgbState
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): UsbComm.RgbState;

        /**
         * Verifies a RgbState message.
         * @param message Plain object to verify
         * @returns `null` if valid, otherwise the reason why it is not
         */
        public static verify(message: { [k: string]: any }): (string|null);

        /**
         * Creates a RgbState message from a plain object. Also converts values to their respective internal types.
         * @param object Plain object
         * @returns RgbState
         */
        public static fromObject(object: { [k: string]: any }): UsbComm.RgbState;

        /**
         * Creates a plain object from a RgbState message. Also converts values to other types if specified.
         * @param message RgbState
         * @param [options] Conversion options
         * @returns Plain object
         */
        public static toObject(message: UsbComm.RgbState, options?: $protobuf.IConversionOptions): { [k: string]: any };

        /**
         * Converts this RgbState to JSON.
         * @returns JSON object
         */
        public toJSON(): { [k: string]: any };

        /**
         * Gets the default type url for RgbState
         * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
         * @returns The default type url
         */
        public static getTypeUrl(typeUrlPrefix?: string): string;
    }

    namespace RgbState {

        /** Properties of a HSB. */
        interface IHSB {

            /** HSB h */
            h: number;

            /** HSB s */
            s: number;

            /** HSB b */
            b: number;
        }

        /** Represents a HSB. */
        class HSB implements IHSB {

            /**
             * Constructs a new HSB.
             * @param [properties] Properties to set
             */
            constructor(properties?: UsbComm.RgbState.IHSB);

            /** HSB h. */
            public h: number;

            /** HSB s. */
            public s: number;

            /** HSB b. */
            public b: number;

            /**
             * Creates a new HSB instance using the specified properties.
             * @param [properties] Properties to set
             * @returns HSB instance
             */
            public static create(properties?: UsbComm.RgbState.IHSB): UsbComm.RgbState.HSB;

            /**
             * Encodes the specified HSB message. Does not implicitly {@link UsbComm.RgbState.HSB.verify|verify} messages.
             * @param message HSB message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encode(message: UsbComm.RgbState.IHSB, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Encodes the specified HSB message, length delimited. Does not implicitly {@link UsbComm.RgbState.HSB.verify|verify} messages.
             * @param message HSB message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encodeDelimited(message: UsbComm.RgbState.IHSB, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Decodes a HSB message from the specified reader or buffer.
             * @param reader Reader or buffer to decode from
             * @param [length] Message length if known beforehand
             * @returns HSB
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): UsbComm.RgbState.HSB;

            /**
             * Decodes a HSB message from the specified reader or buffer, length delimited.
             * @param reader Reader or buffer to decode from
             * @returns HSB
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): UsbComm.RgbState.HSB;

            /**
             * Verifies a HSB message.
             * @param message Plain object to verify
             * @returns `null` if valid, otherwise the reason why it is not
             */
            public static verify(message: { [k: string]: any }): (string|null);

            /**
             * Creates a HSB message from a plain object. Also converts values to their respective internal types.
             * @param object Plain object
             * @returns HSB
             */
            public static fromObject(object: { [k: string]: any }): UsbComm.RgbState.HSB;

            /**
             * Creates a plain object from a HSB message. Also converts values to other types if specified.
             * @param message HSB
             * @param [options] Conversion options
             * @returns Plain object
             */
            public static toObject(message: UsbComm.RgbState.HSB, options?: $protobuf.IConversionOptions): { [k: string]: any };

            /**
             * Converts this HSB to JSON.
             * @returns JSON object
             */
            public toJSON(): { [k: string]: any };

            /**
             * Gets the default type url for HSB
             * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
             * @returns The default type url
             */
            public static getTypeUrl(typeUrlPrefix?: string): string;
        }

        /** Effect enum. */
        enum Effect {
            SOLID = 0,
            BREATHE = 1,
            SPECTRUM = 2,
            SWIRL = 3
        }
    }

    /** Properties of a RgbIndicator. */
    interface IRgbIndicator {

        /** RgbIndicator enable */
        enable?: (boolean|null);

        /** RgbIndicator brightnessActive */
        brightnessActive?: (number|null);

        /** RgbIndicator brightnessInactive */
        brightnessInactive?: (number|null);
    }

    /** Represents a RgbIndicator. */
    class RgbIndicator implements IRgbIndicator {

        /**
         * Constructs a new RgbIndicator.
         * @param [properties] Properties to set
         */
        constructor(properties?: UsbComm.IRgbIndicator);

        /** RgbIndicator enable. */
        public enable: boolean;

        /** RgbIndicator brightnessActive. */
        public brightnessActive: number;

        /** RgbIndicator brightnessInactive. */
        public brightnessInactive: number;

        /**
         * Creates a new RgbIndicator instance using the specified properties.
         * @param [properties] Properties to set
         * @returns RgbIndicator instance
         */
        public static create(properties?: UsbComm.IRgbIndicator): UsbComm.RgbIndicator;

        /**
         * Encodes the specified RgbIndicator message. Does not implicitly {@link UsbComm.RgbIndicator.verify|verify} messages.
         * @param message RgbIndicator message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        public static encode(message: UsbComm.IRgbIndicator, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Encodes the specified RgbIndicator message, length delimited. Does not implicitly {@link UsbComm.RgbIndicator.verify|verify} messages.
         * @param message RgbIndicator message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        public static encodeDelimited(message: UsbComm.IRgbIndicator, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Decodes a RgbIndicator message from the specified reader or buffer.
         * @param reader Reader or buffer to decode from
         * @param [length] Message length if known beforehand
         * @returns RgbIndicator
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): UsbComm.RgbIndicator;

        /**
         * Decodes a RgbIndicator message from the specified reader or buffer, length delimited.
         * @param reader Reader or buffer to decode from
         * @returns RgbIndicator
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): UsbComm.RgbIndicator;

        /**
         * Verifies a RgbIndicator message.
         * @param message Plain object to verify
         * @returns `null` if valid, otherwise the reason why it is not
         */
        public static verify(message: { [k: string]: any }): (string|null);

        /**
         * Creates a RgbIndicator message from a plain object. Also converts values to their respective internal types.
         * @param object Plain object
         * @returns RgbIndicator
         */
        public static fromObject(object: { [k: string]: any }): UsbComm.RgbIndicator;

        /**
         * Creates a plain object from a RgbIndicator message. Also converts values to other types if specified.
         * @param message RgbIndicator
         * @param [options] Conversion options
         * @returns Plain object
         */
        public static toObject(message: UsbComm.RgbIndicator, options?: $protobuf.IConversionOptions): { [k: string]: any };

        /**
         * Converts this RgbIndicator to JSON.
         * @returns JSON object
         */
        public toJSON(): { [k: string]: any };

        /**
         * Gets the default type url for RgbIndicator
         * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
         * @returns The default type url
         */
        public static getTypeUrl(typeUrlPrefix?: string): string;
    }

    /** Properties of an EinkImage. */
    interface IEinkImage {

        /** EinkImage id */
        id: number;

        /** EinkImage bitsLength */
        bitsLength?: (number|null);

        /** EinkImage bits */
        bits?: (Uint8Array|null);

        /** EinkImage x */
        x?: (number|null);

        /** EinkImage y */
        y?: (number|null);

        /** EinkImage width */
        width?: (number|null);

        /** EinkImage height */
        height?: (number|null);

        /** EinkImage partial */
        partial?: (boolean|null);
    }

    /** Represents an EinkImage. */
    class EinkImage implements IEinkImage {

        /**
         * Constructs a new EinkImage.
         * @param [properties] Properties to set
         */
        constructor(properties?: UsbComm.IEinkImage);

        /** EinkImage id. */
        public id: number;

        /** EinkImage bitsLength. */
        public bitsLength: number;

        /** EinkImage bits. */
        public bits: Uint8Array;

        /** EinkImage x. */
        public x: number;

        /** EinkImage y. */
        public y: number;

        /** EinkImage width. */
        public width: number;

        /** EinkImage height. */
        public height: number;

        /** EinkImage partial. */
        public partial: boolean;

        /**
         * Creates a new EinkImage instance using the specified properties.
         * @param [properties] Properties to set
         * @returns EinkImage instance
         */
        public static create(properties?: UsbComm.IEinkImage): UsbComm.EinkImage;

        /**
         * Encodes the specified EinkImage message. Does not implicitly {@link UsbComm.EinkImage.verify|verify} messages.
         * @param message EinkImage message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        public static encode(message: UsbComm.IEinkImage, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Encodes the specified EinkImage message, length delimited. Does not implicitly {@link UsbComm.EinkImage.verify|verify} messages.
         * @param message EinkImage message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        public static encodeDelimited(message: UsbComm.IEinkImage, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Decodes an EinkImage message from the specified reader or buffer.
         * @param reader Reader or buffer to decode from
         * @param [length] Message length if known beforehand
         * @returns EinkImage
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): UsbComm.EinkImage;

        /**
         * Decodes an EinkImage message from the specified reader or buffer, length delimited.
         * @param reader Reader or buffer to decode from
         * @returns EinkImage
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): UsbComm.EinkImage;

        /**
         * Verifies an EinkImage message.
         * @param message Plain object to verify
         * @returns `null` if valid, otherwise the reason why it is not
         */
        public static verify(message: { [k: string]: any }): (string|null);

        /**
         * Creates an EinkImage message from a plain object. Also converts values to their respective internal types.
         * @param object Plain object
         * @returns EinkImage
         */
        public static fromObject(object: { [k: string]: any }): UsbComm.EinkImage;

        /**
         * Creates a plain object from an EinkImage message. Also converts values to other types if specified.
         * @param message EinkImage
         * @param [options] Conversion options
         * @returns Plain object
         */
        public static toObject(message: UsbComm.EinkImage, options?: $protobuf.IConversionOptions): { [k: string]: any };

        /**
         * Converts this EinkImage to JSON.
         * @returns JSON object
         */
        public toJSON(): { [k: string]: any };

        /**
         * Gets the default type url for EinkImage
         * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
         * @returns The default type url
         */
        public static getTypeUrl(typeUrlPrefix?: string): string;
    }
}
