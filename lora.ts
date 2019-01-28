/**
 * Reading data of module lora.
 */
//% weight=2 color=#002050 icon="\uf09e"
//% advanced=true blockGap=8
namespace lora {
    // registers
    const REG_FIFO = 0x00
    const REG_OP_MODE = 0x01
    const REG_FRF_MSB = 0x06
    const REG_FRF_MID = 0x07
    const REG_FRF_LSB = 0x08
    const REG_PA_CONFIG = 0x09
    const REG_LNA = 0x0c
    const REG_FIFO_ADDR_PTR = 0x0d
    const REG_FIFO_TX_BASE_ADDR = 0x0e
    const REG_FIFO_RX_BASE_ADDR = 0x0f
    const REG_FIFO_RX_CURRENT_ADDR = 0x10
    const REG_IRQ_FLAGS = 0x12
    const REG_RX_NB_BYTES = 0x13
    const REG_PKT_SNR_VALUE = 0x19
    const REG_PKT_RSSI_VALUE = 0x1a
    const REG_MODEM_CONFIG_1 = 0x1d
    const REG_MODEM_CONFIG_2 = 0x1e
    const REG_PREAMBLE_MSB = 0x20
    const REG_PREAMBLE_LSB = 0x21
    const REG_PAYLOAD_LENGTH = 0x22
    const REG_MODEM_CONFIG_3 = 0x26
    const REG_FREQ_ERROR_MSB = 0x28
    const REG_FREQ_ERROR_MID = 0x29
    const REG_FREQ_ERROR_LSB = 0x2a
    const REG_RSSI_WIDEBAND = 0x2c
    const REG_DETECTION_OPTIMIZE = 0x31
    const REG_DETECTION_THRESHOLD = 0x37
    const REG_SYNC_WORD = 0x39
    const REG_DIO_MAPPING_1 = 0x40
    const REG_VERSION = 0x42

    // modes
    const MODE_LONG_RANGE_MODE = 0x80
    const MODE_SLEEP = 0x00
    const MODE_STDBY = 0x01
    const MODE_TX = 0x03
    const MODE_RX_CONTINUOUS = 0x05
    const MODE_RX_SINGLE = 0x06

    // PA config
    const PA_BOOST = 0x80

    // IRQ masks
    const IRQ_TX_DONE_MASK = 0x08
    const IRQ_PAYLOAD_CRC_ERROR_MASK = 0x20
    const IRQ_RX_DONE_MASK = 0x40

    const MAX_PKT_LENGTH = 255

    const PA_OUTPUT_RFO_PIN = 0
    const PA_OUTPUT_PA_BOOST_PIN = 1
    let frequency = 915E6;
    let _packetIndex = 0;
    let _implicitHeaderMode = 0;
    let implicitHeader = false;

    // Arduino hacks
    #define bitSet(value, bit)((value) |= (1UL << (bit)))
    #define bitClear(value, bit)((value) &= ~(1UL << (bit)))
    #define bitWrite(value, bit, bitvalue)(bitvalue ? bitSet(value, bit) : bitClear(value, bit))

    // Write Register of SX. 
    function writeRegister(address: number, value: number) {
        pins.A8.digitalWrite(false)
        pins.spiWrite(address | 0)
        pins.spiWrite(value)
        pins.A8.digitalWrite(true)
    }

    // Read register of SX 
    function readRegister(address: number): number {
        let response
        pins.A8.digitalWrite(false)
        pins.spiWrite(address & 0x7f)
        pins.spiWrite(0x00)
        pins.A8.digitalWrite(true)

        return response;
    }

    function explicitHeaderMode() {
        _implicitHeaderMode = 0;
        writeRegister(REG_MODEM_CONFIG_1, readRegister(REG_MODEM_CONFIG_1) & 0xfe);
    }

    function implicitHeaderMode() {
        _implicitHeaderMode = 1;

        writeRegister(REG_MODEM_CONFIG_1, readRegister(REG_MODEM_CONFIG_1) | 0x01);
    }

    // Begin Packet to send
    function beginPacket() {
        // put in standby mode
        idle();

        if (implicitHeader) {
            implicitHeaderMode();
        } else {
            explicitHeaderMode();
        }

        // reset FIFO address and paload length
        writeRegister(REG_FIFO_ADDR_PTR, 0);
        writeRegister(REG_PAYLOAD_LENGTH, 0);

        return 1;
    }

    /**
    * Read Version of chip
    **/
    //% parts="lora"
    //% weight=45 blockGap=8 blockId="readVersion" block="lora|read version"
    //% shim=lora::readVersion
    export function readVersion(): number {
        return readRegister(0x42);
    }

    function endPacket() {
        // put in TX mode
        writeRegister(REG_OP_MODE, MODE_LONG_RANGE_MODE | MODE_TX);

        // wait for TX done
        while ((readRegister(REG_IRQ_FLAGS) & IRQ_TX_DONE_MASK) == 0) {
            //TO DO: yield();
            loops.pause(10)
        }

        // clear IRQ's
        writeRegister(REG_IRQ_FLAGS, IRQ_TX_DONE_MASK);

        return 1;
    }

    /**
    * Parse Packet to send
    **/
    //% parts="lora"
    //% weight=45 blockGap=8 blockId="parsePacket" block="lora|parse packet %size"
    //% shim=lora::parsePacket
    export function parsePacket(size: number): number {
        let packetLength = 0;
        let irqFlags = readRegister(REG_IRQ_FLAGS);

        if (size > 0) {
            implicitHeaderMode();

            writeRegister(REG_PAYLOAD_LENGTH, size & 0xff);
        } else {
            explicitHeaderMode();
        }

        // clear IRQ's
        writeRegister(REG_IRQ_FLAGS, irqFlags);

        if ((irqFlags & IRQ_RX_DONE_MASK) && (irqFlags & IRQ_PAYLOAD_CRC_ERROR_MASK) == 0) {
            // received a packet
            _packetIndex = 0;

            // read packet length
            if (_implicitHeaderMode) {
                packetLength = readRegister(REG_PAYLOAD_LENGTH);
            } else {
                packetLength = readRegister(REG_RX_NB_BYTES);
            }

            // set FIFO address to current RX address
            writeRegister(REG_FIFO_ADDR_PTR, readRegister(REG_FIFO_RX_CURRENT_ADDR));

            // put in standby mode
            idle();
        } else if (readRegister(REG_OP_MODE) != (MODE_LONG_RANGE_MODE | MODE_RX_SINGLE)) {
            // not currently in RX mode

            // reset FIFO address
            writeRegister(REG_FIFO_ADDR_PTR, 0);

            // put in single RX mode
            writeRegister(REG_OP_MODE, MODE_LONG_RANGE_MODE | MODE_RX_SINGLE);
        }

        return packetLength;
    }

    /**
    * Packet RSSI
    **/
    //% parts="lora"
    //% weight=45 blockGap=8 blockId="packetRssi" block="lora|packet RSSI"
    //% shim=lora::packetRssi
    export function packetRssi(): number {
        return (readRegister(REG_PKT_RSSI_VALUE) - (frequency < 868E6 ? 164 : 157));
    }

    // Packet SNR
    function packetSnr() {
        return (readRegister(REG_PKT_SNR_VALUE)) * 0.25;
    }

    // Begin Packet Frecuency Error
    function packetFrequencyError() {
        let freqError = 0;
        freqError = (readRegister(REG_FREQ_ERROR_MSB) & 0xb111); //TODO Covert B111 to c++
        freqError <<= 8;
        freqError += (readRegister(REG_FREQ_ERROR_MID));
        freqError <<= 8;
        freqError += (readRegister(REG_FREQ_ERROR_LSB));

        if (readRegister(REG_FREQ_ERROR_MSB) & 0xb1000) { // Sign bit is on //TODO Covert B1000 to c++
            freqError -= 524288; // B1000'0000'0000'0000'0000
        }

        const fXtal = 32E6; // FXOSC: crystal oscillator (XTAL) frequency (2.5. Chip Specification, p. 14)
        const fError = (((freqError) * (1 << 24)) / fXtal) * (getSignalBandwidth() / 500000.0); // p. 37

        return (fError);
    }

    /**
     * Write Packet to send
     **/
    //% weight=45 blockGap=8 
    //% name.fieldEditor="gridpicker"
    //% name.fieldOptions.width=220
    //% name.fieldOptions.columns=4
    //% blockId="send" block="lora|send string %text"
    //% shim=lora::send
    function send(a: string): void {
        let intSend = 0;
        // put in standby mode
        idle();

        if (implicitHeader) {
            implicitHeaderMode();
        } else {
            explicitHeaderMode();
        }

        // reset FIFO address and paload length
        writeRegister(REG_FIFO_ADDR_PTR, 0);
        writeRegister(REG_PAYLOAD_LENGTH, 0);

        if (a -> data[0] == 0) return;
        for (let i = 0; i < 254 ; i++) {
            intSend = a -> data[i];
            if (intSend == 0 && i == 0) return;
            if (intSend == 0) break;
            writeRaw(intSend, 1);
        }

        // put in TX mode
        writeRegister(REG_OP_MODE, MODE_LONG_RANGE_MODE | MODE_TX);

        // wait for TX done
        while ((readRegister(REG_IRQ_FLAGS) & IRQ_TX_DONE_MASK) == 0) {
            //TO DO: yield();
            loops.pause(10)
        }

        function writeRaw(data: Buffer, size: number) {
            let currentLength = readRegister(REG_PAYLOAD_LENGTH);

            // check size
            if ((currentLength + size) > MAX_PKT_LENGTH) {
                size = MAX_PKT_LENGTH - currentLength;
            }

            // write data
            for (let i = 0; i < size; i++) {
                writeRegister(REG_FIFO, data[i]);
            }

            // update length
            writeRegister(REG_PAYLOAD_LENGTH, currentLength + size);
        }

        // clear IRQ's
        writeRegister(REG_IRQ_FLAGS, IRQ_TX_DONE_MASK);
    }

    /**
    * Available Packet
    **/
    //% parts="lora"
    //% weight=45 blockGap=8 blockId="available" block="lora|available"
    //% shim=lora::available
    export function available(): number {
        return (readRegister(REG_RX_NB_BYTES) - _packetIndex);
    }
    /**
    * Read Packet
    **/
    //% parts="lora"
    //% weight=45 blockGap=8 blockId="read" block="lora|read"
    //% shim=lora::read
    export function read(): number {
        if (!available()) {
            return -1;
        }

        _packetIndex++;

        return readRegister(REG_FIFO);
    }

    /**
* Peek Packet to send
**/
    function peek() {
        if (!available()) {
            return -1;
        }

        // store current FIFO address
        let currentAddress = readRegister(REG_FIFO_ADDR_PTR);

        // read
        let b = readRegister(REG_FIFO);

        // restore FIFO address
        writeRegister(REG_FIFO_ADDR_PTR, currentAddress);

        return b;
    }

    function flush() {
        //TODO
    }

    function idle() {
        writeRegister(REG_OP_MODE, MODE_LONG_RANGE_MODE | MODE_STDBY);
    }

    /**
    * Sleep Mode
    **/
    function sleep() {
        writeRegister(REG_OP_MODE, MODE_LONG_RANGE_MODE | MODE_SLEEP);
    }

    /**
    * Set Tx Power
    **/
    function setTxPower(level: number) {
        let outputPin = PA_OUTPUT_PA_BOOST_PIN;

        if (PA_OUTPUT_RFO_PIN == outputPin) {
            // RFO
            if (level < 0) {
                level = 0;
            } else if (level > 14) {
                level = 14;
            }

            writeRegister(REG_PA_CONFIG, 0x70 | level);
        } else {
            // PA BOOST
            if (level < 2) {
                level = 2;
            } else if (level > 17) {
                level = 17;
            }

            writeRegister(REG_PA_CONFIG, PA_BOOST | (level - 2));
        }
    }

    /**
    * Set Frecuency of LoRa
    **/
    function setFrequency(frequency: number) {

        let frf = (frequency << 19) / 32000000;

        writeRegister(REG_FRF_MSB, (frf >> 16));
        writeRegister(REG_FRF_MID, (frf >> 8));
        writeRegister(REG_FRF_LSB, (frf >> 0));
    }

    /**
    * Get Spreading Factor of LoRa
    **/
    function getSpreadingFactor() {
        return readRegister(REG_MODEM_CONFIG_2) >> 4;
    }

    function setSpreadingFactor(sf: number) {
        if (sf < 6) {
            sf = 6;
        } else if (sf > 12) {
            sf = 12;
        }

        if (sf == 6) {
            writeRegister(REG_DETECTION_OPTIMIZE, 0xc5);
            writeRegister(REG_DETECTION_THRESHOLD, 0x0c);
        } else {
            writeRegister(REG_DETECTION_OPTIMIZE, 0xc3);
            writeRegister(REG_DETECTION_THRESHOLD, 0x0a);
        }

        writeRegister(REG_MODEM_CONFIG_2, (readRegister(REG_MODEM_CONFIG_2) & 0x0f) | ((sf << 4) & 0xf0));
        setLdoFlag();
    }

    /**
    * Get Signal Bandwidth of LoRa
    **/
    function getSignalBandwidth() {
        let bw = (readRegister(REG_MODEM_CONFIG_1) >> 4);
        switch (bw) {
            case 0: return 7.8E3;
            case 1: return 10.4E3;
            case 2: return 15.6E3;
            case 3: return 20.8E3;
            case 4: return 31.25E3;
            case 5: return 41.7E3;
            case 6: return 62.5E3;
            case 7: return 125E3;
            case 8: return 250E3;
            case 9: return 500E3;
        }
    }

    /**
    * Set Signal Bandwidth of LoRa
    **/
    function setSignalBandwidth(sbw: number) {
        let bw;

        if (sbw <= 7.8E3) {
            bw = 0;
        } else if (sbw <= 10.4E3) {
            bw = 1;
        } else if (sbw <= 15.6E3) {
            bw = 2;
        } else if (sbw <= 20.8E3) {
            bw = 3;
        } else if (sbw <= 31.25E3) {
            bw = 4;
        } else if (sbw <= 41.7E3) {
            bw = 5;
        } else if (sbw <= 62.5E3) {
            bw = 6;
        } else if (sbw <= 125E3) {
            bw = 7;
        } else if (sbw <= 250E3) {
            bw = 8;
        } else /*if (sbw <= 250E3)*/ {
            bw = 9;
        }

        writeRegister(REG_MODEM_CONFIG_1, (readRegister(REG_MODEM_CONFIG_1) & 0x0f) | (bw << 4));
        setLdoFlag();
    }

    function setLdoFlag() {
        // Section 4.1.1.5
        let symbolDuration = 1000 / (getSignalBandwidth() / (1L << getSpreadingFactor()) );

        // Section 4.1.1.6
        let ldoOn = symbolDuration > 16;

        let config3 = readRegister(REG_MODEM_CONFIG_3);
        bitWrite(config3, 3, ldoOn);
        writeRegister(REG_MODEM_CONFIG_3, config3);
    }

    function setCodingRate4(denominator :  number) {
        if (denominator < 5) {
            denominator = 5;
        } else if (denominator > 8) {
            denominator = 8;
        }

        let cr = denominator - 4;

        writeRegister(REG_MODEM_CONFIG_1, (readRegister(REG_MODEM_CONFIG_1) & 0xf1) | (cr << 1));
    }

    function setPreambleLength(length: number) {
        writeRegister(REG_PREAMBLE_MSB, (length >> 8));
        writeRegister(REG_PREAMBLE_LSB, (length >> 0));
    }

    function setSyncWord(sw: number) {
        writeRegister(REG_SYNC_WORD, sw);
    }

    function enableCrc() {
        writeRegister(REG_MODEM_CONFIG_2, readRegister(REG_MODEM_CONFIG_2) | 0x04);
    }

    function disableCrc() {
        writeRegister(REG_MODEM_CONFIG_2, readRegister(REG_MODEM_CONFIG_2) & 0xfb);
    }

    function random() {
        return readRegister(REG_RSSI_WIDEBAND);
    }
}
