export class DnnBridgeConnector {
    constructor(public params: any,
        public valueChanged: any,
        public dialogType: string) {
        this.params = params;
        this.valueChanged = valueChanged;
        this.dialogType = dialogType;
        // this.modalInstance = modalInstance;
    }
}

export class DnnBridgeDialogData {
    constructor(public id: string, public type: string, public connector: string) {
        this.id = id;
        this.type = type;
        this.connector = connector;
    }
}

