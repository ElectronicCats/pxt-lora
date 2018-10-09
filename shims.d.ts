// Auto-generated. Do not edit.
declare namespace lora {

    /**
     * Begin Packet to send
     **/
    //% parts="lora"
    //% weight=45 blockGap=8 blockId="beginPacket" block="beginPacket" shim=lora::beginPacket
    function beginPacket(): int32;

    /**
     * End Packet to send
     **/
    //% parts="lora"
    //% weight=45 blockGap=8 blockId="endPacket" block="endPacket" shim=lora::endPacket
    function endPacket(): int32;

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
