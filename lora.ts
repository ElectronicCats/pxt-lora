/**
* Andrés Sabas @ The Inventor's House and Electronic Cats
* https://github.com/sabas1080
* August 4, 2018
* https://github.com/ElectronicCats/pxt-lora
* Development environment specifics:
* Written in Microsoft PXT
* Tested with Arduino MKR1300
*
* This code is released under the [MIT License](http://opensource.org/licenses/MIT).
* Please review the LICENSE.md file included with this example. If you have any questions
* or concerns with licensing, please contact s@theinventorhouse.org.
* Distributed as-is; no warranty is given.
*/
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
