/**
 * Reading data of module lora.
 */
//% weight=2 color=#002050 icon="\uf09e"
//% advanced=true blockGap=8
namespace lora {
    /**
    * Read Version of chip
    **/
    //% parts="lora"
    //% weight=45 blockGap=8 blockId="readVersion" block="lora|read version"
    //% shim=lora::readVersion
    export function readVersion(): number {
        return 0;
    }
    /**
    * Parse Packet to send
    **/
    //% parts="lora"
    //% weight=45 blockGap=8 blockId="parsePacket" block="lora|parse packet %size"
    //% shim=lora::parsePacket
    export function parsePacket(size: number): number {
        return 0;
    }
    /**
    * Packet RSSI
    **/
    //% parts="lora"
    //% weight=45 blockGap=8 blockId="packetRssi" block="lora|packet RSSI"
    //% shim=lora::packetRssi
    export function packetRssi(): number {
        return 0;
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
    export function send(text: string): void {
        return;
    }

    /**
    * Available Packet
    **/
    //% parts="lora"
    //% weight=45 blockGap=8 blockId="available" block="lora|available"
    //% shim=lora::available
    export function available(): number {
        return 0
    }
    /**
    * Read Packet
    **/
    //% parts="lora"
    //% weight=45 blockGap=8 blockId="read" block="lora|read"
    //% shim=lora::read
    export function read(): number {
        return 0
    }
}
