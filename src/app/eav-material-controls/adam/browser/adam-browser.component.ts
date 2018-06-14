import { Component, OnInit, Input } from '@angular/core';
import { AdamService } from '../adam-service.service';

@Component({
  // tslint:disable-next-line:component-selector
  selector: 'adam-browser',
  templateUrl: './adam-browser.component.html',
  styleUrls: ['./adam-browser.component.css']
})
export class AdamBrowserComponent implements OnInit {

  @Input() contentTypeName: any;
  @Input() entityGuid: any;
  @Input() fieldName: any;
  @Input() subFolder;
  @Input() showImagesOnly;
  @Input() folderDepth;
  @Input() showFolders;
  @Input() allowAssetsInRoot;
  @Input() metadataContentTypes;

  // @Input() show = false;
  @Input() show = true;
  @Input() adamModeConfig;
  appRoot;
  @Input() disabled = false;
  @Input() enableSelect;

  @Input() autoLoad;

  oldConfig;

  //   link: function postLink(scope, elem, attrs, dropzoneCtrl) {
  //     // connect this adam to the dropzone
  //     dropzoneCtrl.adam = scope.vm;       // so the dropzone controller knows what path etc.
  //     scope.vm.dropzone = dropzoneCtrl;   // so we can require an "open file browse" dialog
  // },

  // // todo: change "scope" to bindToController whenever I have time
  // scope: {
  //     // Identity fields
  //     contentTypeName: "=",
  //     entityGuid: "=",
  //     fieldName: "=",

  //     // configuration general
  //     subFolder: "=",
  //     folderDepth: "=",
  //     metadataContentTypes: "=",
  //     allowAssetsInRoot: "=",
  //     showImagesOnly: "=?",
  //     adamModeConfig: "=",
  //     fileFilter: "=?",

  //     // binding and cross-component communication
  //     autoLoad: "=",
  //     updateCallback: "=",
  //     registerSelf: "=",

  //     // basic functionality
  //     enableSelect: "=",
  //     ngDisabled: "="
  // },


  constructor(private adamService: AdamService) {
  }

  ngOnInit() {
    this.initConfig();

    if (this.autoLoad) {
      console.log('autoload:');
      this.toggle(null);
    }

    // let dsa = new AdamService()
    // TODO:
    // this.svc = this.adamSvc(vm.contentTypeName, vm.entityGuid, vm.fieldName, vm.subFolder, $scope.adamModeConfig);
  }

  initConfig() {
    this.subFolder = this.subFolder || '';
    this.showImagesOnly = this.showImagesOnly || false;
    this.folderDepth = (typeof this.folderDepth !== 'undefined' && this.folderDepth !== null) ? this.folderDepth : 2;
    this.showFolders = !!this.folderDepth;
    this.allowAssetsInRoot = this.allowAssetsInRoot || true; // if true, the initial folder can have files, otherwise only subfolders
    this.metadataContentTypes = this.metadataContentTypes || '';

    // TODO:
    // appRoot = read app root
    this.enableSelect = (this.enableSelect === false) ? false : true; // must do it like this, $scope.enableSelect || true will not work

    // add clipboard paste image feature if enabled
    // featuresSvc.enabled('f6b8d6da-4744-453b-9543-0de499aa2352').then(
    //   function (enabled) {
    //     if (enabled) {
    //       vm.clipboardPasteImageFunctionalityDisabled = (enabled === false);
    //     }
    //   });

  }

  toggle(newConfig) {
    // Reload configuration
    this.initConfig();
    let configChanged = false;

    if (newConfig) {
      // Detect changes in config, allows correct toggle behaviour
      if (JSON.stringify(newConfig) !== this.oldConfig) {
        configChanged = true;
      }
      this.oldConfig = JSON.stringify(newConfig);

      this.showImagesOnly = newConfig.showImagesOnly;
      this.adamModeConfig.usePortalRoot = !!(newConfig.usePortalRoot);
    }

    this.show = configChanged || !this.show;

    if (!this.show) {
      this.adamModeConfig.usePortalRoot = false;
    }

    // Override configuration in portal mode
    if (this.adamModeConfig.usePortalRoot) {
      this.showFolders = true;
      this.folderDepth = 99;
    }

    if (this.show) {
      this.get();
    }
  }

  get() {
    // this.items = vm.svc.liveList();
    // this.folders = vm.svc.folders;
    // this.svc.liveListReload();
  }

  // load svc...
  // vm.svc = adamSvc(vm.contentTypeName, vm.entityGuid, vm.fieldName, vm.subFolder, $scope.adamModeConfig);



  //   openUpload = function () {
  //     vm.dropzone.openUpload();
  // };




  // TEMP
  testApi() {

    // const adam = new AdamService(this.httpClient, null, null, null, '', null, 'test 2sxc test', 7);

    const svc = this.adamService.createSvc(null, null, null, '', { usePortalRoot: false }, 'test 2sxc test', 7);

    console.log('svc2: ', svc);
    // let result;
    svc.getAll().subscribe(s =>
      console.log('result: ', s)
    );

    // uploadUrl,
    // addFullPath,
    svc.addFolder('newfolderName').subscribe(s =>
      console.log('result newfolderName: ', s)
    );

    // svc.deleteItem('').subscribe(s =>
    //   console.log('result: ', s)
    // );

    // svc.rename().subscribe(s =>
    //   console.log('result: ', s)
    // );
  }

}
