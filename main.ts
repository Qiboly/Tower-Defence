/* EALAB工程实验室专用图形块
**
*/
//% color=#A80000 weight=96 icon="◎"
namespace EALAB {
    let delay_2s = 0;
    let delay = 0;
    let t_2s = 0;
    let speed_M1A = 0;
    let last_speed_M1A = 0;
    let speed_M1B = 0;
    let last_speed_M1B = 0;
    let speed_M2A = 0;
    let last_speed_M2A = 0;
    let speed_M2B = 0;
    let last_speed_M2B = 0;

    let reality_speed = 0;
    let initialized = false

    export enum Servos {
        S1 = 0x01,
        S2 = 0x02,
        S3 = 0x03,
        S4 = 0x04,
        S5 = 0x05,
        S6 = 0x06,
        S7 = 0x07,
        S8 = 0x08
    }

    export enum Motors {
        M1A = 0x1,
        M1B = 0x2,
        M2A = 0x3,
        M2B = 0x4
    }
    export enum PingUnit {
        cm,//距离（厘米)
        //% block="μs"
        MicroSeconds, //接收到返回的超声波的时间（微秒）
        //% block="in"
        Inches //英寸 1 in = 2.54 cm
    }

    function i2cwrite(addr: number, reg: number, value: number) {
        let buf = pins.createBuffer(2)
        buf[0] = reg
        buf[1] = value
        pins.i2cWriteBuffer(addr, buf)
    }
    function i2cread(addr: number, reg: number) {
        pins.i2cWriteNumber(addr, reg, NumberFormat.UInt8BE);
        let val = pins.i2cReadNumber(addr, NumberFormat.UInt8BE);
        return val;
    }

    function initPCA9685(): void {
        i2cwrite(0x40, 0x00, 0x00)
        setFreq(50);
        for (let idx = 0; idx < 16; idx++) {
            setPwm(idx, 0, 0);
        }
        initialized = true
    }
    function setFreq(freq: number): void {
        // Constrain the frequency
        let prescaleval = 25000000;
        prescaleval /= 4096;
        prescaleval /= freq;
        prescaleval -= 1;
        let prescale = prescaleval; //Math.Floor(prescaleval + 0.5);
        let oldmode = i2cread(0x40, 0x00);
        let newmode = (oldmode & 0x7F) | 0x10; // sleep
        i2cwrite(0x40, 0x00, newmode); // go to sleep
        i2cwrite(0x40, 0xFE, prescale); // set the prescaler
        i2cwrite(0x40, 0x00, oldmode);
        control.waitMicros(5000);
        i2cwrite(0x40, 0x00, oldmode | 0xa1);
    }

    function setPwm(channel: number, on: number, off: number): void {
        if (channel < 0 || channel > 15)
            return;
        let buf = pins.createBuffer(5);
        buf[0] = 0x06 + 4 * channel;
        buf[1] = on & 0xff;
        buf[2] = (on >> 8) & 0xff;
        buf[3] = off & 0xff;
        buf[4] = (off >> 8) & 0xff;
        pins.i2cWriteBuffer(0x40, buf);
    }
    function MotorStopAll(): void {
        for (let i = 1; i <= 4; i++) {
            setPwm((i - 1) * 2, 0, 0);
            setPwm((i - 1) * 2 + 1, 0, 0);
        }
    }
    /**
     * 血量不延时显示
     * @param blood show, eg: 3
     */
    //% blockId=ealab_ShowNum block="显示 number|%blood"
    export function ShowNum(blood: number): void {
        if (blood == 9) {
            basic.clearScreen()
            for (let i = 0; i <= 2; i++) {
                led.plot(i + 1, 0)
                led.plot(i + 1, 2)
            }
            led.plot(0, 1)
            for (let i = 0; i <= 3; i++) {
                led.plot(i + 1, 4 - i)
            }
        } else if (blood == 8) {
            basic.clearScreen()
            for (let i = 0; i <= 2; i++) {
                led.plot(i + 1, 0)
                led.plot(i + 1, 2)
                led.plot(i + 1, 4)
            }
            led.plot(0, 1)
            led.plot(4, 1)
            led.plot(0, 3)
            led.plot(4, 3)
        } else if (blood == 7) {
            basic.clearScreen()
            for (let i = 0; i <= 4; i++) {
                led.plot(i, 0)
            }
            for (let i = 0; i <= 3; i++) {
                led.plot(i, 4 - i)
            }
        } else if (blood == 6) {
            basic.clearScreen()
            led.plot(3, 0)
            led.plot(2, 1)
            for (let i = 0; i <= 2; i++) {
                led.plot(i + 1, 2)
                led.plot(i + 1, 4)
            }
            led.plot(0, 3)
            led.plot(4, 3)
        } else if (blood == 5) {
            basic.clearScreen()
            for (let i = 0; i <= 4; i++) {
                led.plot(i, 0)
            }
            led.plot(0, 1)
            for (let i = 0; i <= 3; i++) {
                led.plot(i, 2)
                led.plot(i, 4)
            }
            led.plot(4, 3)
        } else if (blood == 4) {
            basic.clearScreen()
            led.plot(2, 0)
            led.plot(3, 0)
            led.plot(1, 1)
            led.plot(3, 1)
            led.plot(0, 2)
            led.plot(3, 2)
            for (let i = 0; i <= 4; i++) {
                led.plot(i, 3)
            }
            led.plot(3, 4)
        } else if (blood == 3) {
            basic.clearScreen()
            for (let i = 0; i <= 3; i++) {
                led.plot(i, 0)
            }
            led.plot(3, 1)
            led.plot(2, 2)
            led.plot(0, 3)
            led.plot(3, 3)
            led.plot(1, 4)
            led.plot(2, 4)
        } else if (blood == 2) {
            basic.clearScreen()
            for (let i = 0; i <= 2; i++) {
                led.plot(i, 0)
            }
            led.plot(3, 1)
            led.plot(1, 2)
            led.plot(2, 2)
            led.plot(0, 3)
            for (let i = 0; i <= 3; i++) {
                led.plot(i, 4)
            }
        } else if (blood == 1) {
            basic.clearScreen()
            for (let i = 0; i <= 4; i++) {
                led.plot(2, i)
            }
            led.plot(1, 1)
            led.plot(1, 4)
            led.plot(3, 4)
        } else {
            basic.clearScreen()
            led.plot(1, 0)
            led.plot(2, 0)
            led.plot(0, 1)
            led.plot(3, 1)
            led.plot(0, 2)
            led.plot(3, 2)
            led.plot(0, 3)
            led.plot(3, 3)
            led.plot(1, 4)
            led.plot(2, 4)
            while (blood == 0) {
                MotorStopAll()
            }
        }
    }
    /**
     * 是否被射击检测
     * @param blood 初始血量, eg: 3
     */
    //% blockId=ealab_FireDetection block="受攻击检测 blood|%blood"
    export function FireDetection(blood: number): number {
        if (pins.digitalReadPin(DigitalPin.P8) == 1) {
            delay_2s = 1
            pins.digitalWritePin(DigitalPin.P8, 0)
        }
        if (delay_2s) {
            if (blood <= 1) {
                blood = 0
                delay_2s = 0
            } else {
                delay += 1
                if (delay >= 120) {
                    blood += -1
                    delay = 0
                    delay_2s = 0
                }
            }
        }
        return blood
    }
    /**
	 * 舵机角度控制
	 * @param index 舵机引脚对应; eg: S1
	 * @param degree [0-180] 角度; eg: 0, 90, 180
	*/
    //% blockId=ealab_servo block="舵机 |%index|angle %angle"
    //% degree.min=0 degree.max=180
    //% name.fieldEditor="Qiboly" 
    export function Servo(index: Servos, angle: number): void {
        if (!initialized) {
            initPCA9685()
        }
        // 50hz: 20,000 us
        let v_us = (angle * 1800 / 180 + 600) // 0.6 ~ 2.4
        let value = v_us * 4096 / 20000
        setPwm(index + 7, 0, value)
    }
    /**
     * 电机速度控制
     * @param index 电机选择, eg:  M1A, M1B, M2A, M2B
     * @param speed 速度控制, eg: 255
     */
    //% blockId=ealab_MotorRun block="电机|%index|speed %degree"
    //% speed.min=-255 speed.max=255
    export function MotorRun(index: Motors, speed: number): void {
        if (!initialized) {
            initPCA9685()
        }
        speed = speed * 16; // map 255 to 4096
        if (speed >= 4096) {
            speed = 4095
        }
        if (speed <= -4096) {
            speed = -4095
        }
        if (index > 4 || index <= 0)
            return
        let pp = (index - 1) * 2
        let pn = (index - 1) * 2 + 1
        if (speed >= 0) {
            setPwm(pp, 0, speed)
            setPwm(pn, 0, 0)
        } else {
            setPwm(pp, 0, 0)
            setPwm(pn, 0, -speed)
        }
    }
    /**
     * 电机PID算法控制
     * @param ch 电机选择, eg:  M1A, M1B, M2A, M2B
     * @param kp 比例控制, eg: 1
     * @param kd 微分控制*10, eg: -2
     * @param speed 理论速度, eg: 255
     */
    //% blockId=ealab_motorPD block="电机|%choose|kp %kp|kd %kd|speed %speed"
    //% speed.min=-255 speed.max=255
    export function MotorPD(choose: Motors, kp: number, kd: number, speed: number): number {
        if (choose == 0x4) {
            speed_M2B = speed
            reality_speed = kp * speed_M2B + (kd * (speed_M2B - last_speed_M2B)) / 10
            last_speed_M2B = reality_speed
        }
        else if (choose == 0x3) {
            speed_M2A = speed
            reality_speed = kp * speed_M2A + (kd * (speed_M2A - last_speed_M2A)) / 10
            last_speed_M2A = reality_speed
        }
        else if (choose == 0x2) {
            speed_M1B = speed
            reality_speed = kp * speed_M1B + (kd * (speed_M1B - last_speed_M1B)) / 10
            last_speed_M1B = reality_speed
        }
        else {
            speed_M1A = speed
            reality_speed = kp * speed_M1A + (kd * (speed_M1A - last_speed_M1A)) / 10
            last_speed_M1A = reality_speed
        }
        return Math.ceil(reality_speed)
    }

    /**
    * 超声波引脚匹配
    * @param trig trig所接引脚
    * @param echo echo所接引脚
    * @param unit 转换单位
    * @param maxCmDistance 最大的检测距离 (默认为500cm)
    */
    //% blockId=EALAB_ultrasonic block="超声波 trig %trig|echo %echo|unit %unit"
    export function Ultrasonic(trig: DigitalPin, echo: DigitalPin, unit: PingUnit, maxCmDistance = 500): number {
        // 发射
        pins.setPull(trig, PinPullMode.PullNone);
        pins.digitalWritePin(trig, 0);
        control.waitMicros(2);
        pins.digitalWritePin(trig, 1);
        control.waitMicros(10);
        pins.digitalWritePin(trig, 0);

        // 接收
        const d = pins.pulseIn(echo, PulseValue.High, maxCmDistance * 58);

        switch (unit) {
            case PingUnit.cm: return Math.idiv(d, 58);
            case PingUnit.Inches: return Math.idiv(d, 148);
            default: return d;//时间
        }
    }
}

