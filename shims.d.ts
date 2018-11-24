// Auto-generated. Do not edit.
declare namespace lora {

    /**
     * Read Version
     **/
    //% parts="lora"
    //% weight=45 blockGap=8 blockId="readVersion" block="readVersion" shim=lora::readVersion
    function readVersion(): int32;

    /**
     * Parse Packet to send
     **/
    //% parts="lora"
    //% weight=45 blockGap=8 blockId="parsePacket" block="parsePacket" shim=lora::parsePacket
    function parsePacket(size: int32): int32;

    /**
     * Packet RSSI
     **/
    //% parts="lora"
    //% weight=45 blockGap=8 blockId="packetRssi" block="packetRssi" shim=lora::packetRssi
    function packetRssi(): int32;

    /**
     * Write Packet to send
     **/
    //% parts="lora"
    //% blockId="write" block="Write Packet %int" 
    //% weight=45 blockGap=8 block="Write Packet %int" shim=lora::write
    function write(byte: uint8): void;

    /**
     * Write Packet to send
     **/
    //% parts="lora"
    //% blockId="Send" block="Send %string"
    //% weight=45 blockGap=8 
    //% name.fieldEditor="gridpicker"
    //% name.fieldOptions.width=220
    //% name.fieldOptions.columns=4 shim=lora::send
    function send(a: string): void;

    /**
     * Available Packet
     **/
    //% parts="lora"
    //% weight=45 blockGap=8 blockId="available" block="available" shim=lora::available
    function available(): int32;

    /**
     * Read Packet
     **/
    //% parts="lora"
    //% weight=45 blockGap=8 blockId="read" block="read" shim=lora::read
    function read(): int32;
}

// Auto-generated. Do not edit. Really.
