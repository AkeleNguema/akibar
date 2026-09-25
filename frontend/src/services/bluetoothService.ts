export const printReceiptBluetooth = async (
  barName: string,
  clientName: string | null,
  cart: { nom: string; quantite: number; prixVenteBouteille: number }[],
  total: number,
  paymentMode: string
): Promise<void> => {
  try {
    // 1. Request Bluetooth Device (Receipt Printer)
    const device = await navigator.bluetooth.requestDevice({
      filters: [{ services: ['000018f0-0000-1000-8000-00805f9b34fb'] }],
      optionalServices: ['e7810a71-73ae-499d-8c15-faa9aef0c3f2']
    });

    if (!device.gatt) throw new Error('Appareil Bluetooth non compatible (GATT manquant).');

    // 2. Connect to GATT Server
    const server = await device.gatt.connect();

    // 3. Get the Primary Service (Common UUID for serial communication)
    const service = await server.getPrimaryService('000018f0-0000-1000-8000-00805f9b34fb');

    // 4. Get Characteristic (Write)
    const characteristic = await service.getCharacteristic('00002af1-0000-1000-8000-00805f9b34fb');

    // 5. Generate ESC/POS commands
    const encoder = new TextEncoder();
    
    // Commands
    const INIT = '\x1B\x40';
    const BOLD_ON = '\x1B\x45\x01';
    const BOLD_OFF = '\x1B\x45\x00';
    const CENTER = '\x1B\x61\x01';
    const LEFT = '\x1B\x61\x00';
    const CUT = '\x1D\x56\x41\x10';
    
    let text = INIT;
    text += CENTER + BOLD_ON + barName + '\n' + BOLD_OFF;
    text += '--------------------------------\n';
    text += LEFT;
    text += `Date : ${new Date().toLocaleString('fr-FR')}\n`;
    text += `Mode : ${paymentMode}\n`;
    if (clientName) text += `Client : ${clientName}\n`;
    text += '--------------------------------\n';

    cart.forEach(item => {
      const lineTotal = item.quantite * item.prixVenteBouteille;
      text += `${item.nom.substring(0, 15).padEnd(15, ' ')} ${item.quantite}x ${lineTotal}F\n`;
    });

    text += '--------------------------------\n';
    text += CENTER + BOLD_ON + `TOTAL : ${total} FCFA\n` + BOLD_OFF;
    text += '\nMerci de votre visite !\n\n\n';
    text += CUT;

    // 6. Send data in chunks (max 512 bytes per write)
    const data = encoder.encode(text);
    const CHUNK_SIZE = 512;
    for (let i = 0; i < data.length; i += CHUNK_SIZE) {
      const chunk = data.slice(i, i + CHUNK_SIZE);
      await characteristic.writeValue(chunk);
    }

    console.log('Impression terminée');
    device.gatt.disconnect();
  } catch (error) {
    console.error('Erreur Impression Bluetooth:', error);
    alert('Échec de la connexion Bluetooth ou impression. Vérifiez l\'imprimante.');
  }
};
