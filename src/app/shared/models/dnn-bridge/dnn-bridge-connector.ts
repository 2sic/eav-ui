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
    constructor(public type: string, public connector: DnnBridgeConnector) {
        this.type = type;
        this.connector = connector;
    }
}

