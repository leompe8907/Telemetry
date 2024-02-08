const OTT = () => {
  // Arrays para almacenar objetos con actionId 7 y 8, y la fusión modificada
  const arrayAction7 = [];
  const arrayAction8 = [];
  const fusion = [];

  // Abre la base de datos 'TelemetryDB' con la versión 1
  const request = indexedDB.open('TelemetryDB', 1);

  // Maneja el evento que se dispara cuando se necesita actualizar la base de datos
  request.onupgradeneeded = (event) => {
    const db = event.target.result;

    // Crea o actualiza el almacén 'telemetryStore'
    if (!db.objectStoreNames.contains('telemetryStore')) {
      db.createObjectStore('telemetryStore', { keyPath: 'id', autoIncrement: true });
    }

    // Crea un nuevo almacén 'dataOTT'
    if (!db.objectStoreNames.contains('dataOTT')) {
      const dataOTTStore = db.createObjectStore('dataOTT', { keyPath: 'id', autoIncrement: true });

      // Crea un índice por la propiedad 'timestamp'
      dataOTTStore.createIndex('timestampIndex', 'timestamp');

    }
  };

  // Maneja el evento que se dispara cuando se abre la base de datos con éxito
  request.onsuccess = (event) => {
    const db = event.target.result;

    // Realiza una transacción de solo lectura para telemetryStore
    const telemetryTransaction = db.transaction(['telemetryStore'], 'readonly');
    const telemetryStore = telemetryTransaction.objectStore('telemetryStore');

    // Obtiene todos los objetos de telemetryStore
    const requestAllObjects = telemetryStore.getAll();

    // Maneja el evento cuando la transacción de telemetryStore se completa
    telemetryTransaction.oncomplete = (event) => {
      const allObjects = requestAllObjects.result;

      // Filtra objetos en arrayAction7 y arrayAction8 según actionId
      allObjects.forEach((obj) => {
        if (obj.actionId === 7) {
          arrayAction7.push(obj);
        } else if (obj.actionId === 8) {
          arrayAction8.push(obj);
        }
      });

      // Comparar objetos en arrayAction7 y arrayAction8 por dataId
      arrayAction8.forEach((obj8) => {
        const matchingObj7 = arrayAction7.find((obj7) => obj7.dataId === obj8.dataId);

        if (matchingObj7) {
          // Si hay coincidencia por dataId, actualizar dataName, timestamp y dataTime en fusion
          const modifiedObj8 = {
            ...obj8,
            dataName: matchingObj7.dataName,
            timestamp: new Date(obj8.timestamp).getTime()
          };
          fusion.push(modifiedObj8);
        }
      });

      // Utiliza una transacción de lectura/escritura para dataOTT
      const dataOTTTransaction = db.transaction(['dataOTT'], 'readwrite');
      const dataOTTStore = dataOTTTransaction.objectStore('dataOTT');

      // Almacena cada objeto de fusion en el almacén 'dataOTT'
      fusion.forEach((fusionObj) => {
        dataOTTStore.add(fusionObj);
      });

      // Maneja el evento cuando la transacción de dataOTT se completa
      dataOTTTransaction.oncomplete = () => {
        // Imprime o realiza acciones adicionales según tus necesidades
        console.log("Array con actionId 7:", arrayAction7);
        console.log("Array con actionId 8:", arrayAction8);
        console.log("Array 'fusion':", fusion);
        console.log("Datos almacenados en dataOTT");
      };
    };
  };
};

export default OTT;


