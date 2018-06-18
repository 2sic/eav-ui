import { Component, OnInit, Input, Output, EventEmitter, Injector } from '@angular/core';
import { AdamService } from '../adam-service.service';
import { HttpClient } from '@angular/common/http';
import { SvcCreatorService } from '../../../shared/services/svc-creator.service';
import { Observable } from 'rxjs/Observable';

@Component({
  // tslint:disable-next-line:component-selector
  selector: 'adam-browser',
  templateUrl: './adam-browser.component.html',
  styleUrls: ['./adam-browser.component.css']
})
export class AdamBrowserComponent implements OnInit {

  // TODO: temp need change
  @Input() eavConfig: any;

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
  @Input() show = false;
  @Input() adamModeConfig = { usePortalRoot: false };
  appRoot;
  @Input() disabled = false;
  @Input() enableSelect;

  @Input() autoLoad = true;

  @Output() openUpload: EventEmitter<any> = new EventEmitter<any>();

  oldConfig;
  clipboardPasteImageFunctionalityDisabled = true;

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

  private svcCreatorService;
  folders;
  items;
  svc;

  items$: Observable<any[]>; // = this.svc.liveList();

  // get folders() {
  //   return this.adamService.folders;
  // }

  constructor(adamService: AdamService) {
    this.svc = adamService.createSvc(null, null, null, '', { usePortalRoot: false }, 'test 2sxc test', 7);
    // this.adamService = new AdamService(httpClient, null, null, null, '', { usePortalRoot: false }, 'test 2sxc test', 7);
    // this.svcCreatorService = new SvcCreatorService(this.adamService.getAll(), 'true');
  }

  ngOnInit() {
    this.items$ = this.svc.liveListCache$;
    this.loadFileList();

    this.initConfig();

    if (this.autoLoad) {
      console.log('autoload:');
      this.toggle(null);
    }
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

  addFolder() {
    if (this.disabled) {
      return;
    }
    const folderName = window.prompt('Please enter a folder name'); // todo i18n
    if (folderName) {
      this.svc.addFolder(folderName).subscribe(s =>
        this.refresh()
      );
    }
  }

  allowCreateFolder(): boolean {
    return this.svc.folders.length < this.folderDepth;
  }

  del(item) {
    if (this.disabled) {
      return;
    }
    const ok = window.confirm('Are you sure you want to delete this item?'); // todo i18n
    if (ok) {
      console.log('call delete item');
      this.svc.deleteItem(item).subscribe(s =>
        this.refresh()
      );
    }
  }

  editMetadata(item) {
    const items = [
      this.itemDefinition(item, this.getMetadataType(item))
    ];
    // TODO:
    // eavAdminDialogs.openEditItems(items, vm.refresh);
  }

  private itemDefinition = function (item, metadataType) {
    const title = 'EditFormTitle.Metadata'; // todo: i18n
    return item.MetadataId !== 0
      ? { EntityId: item.MetadataId, Title: title } // if defined, return the entity-number to edit
      : {
        ContentTypeName: metadataType, // otherwise the content type for new-assegnment
        Metadata: {
          Key: (item.Type === 'folder' ? 'folder' : 'file') + ':' + item.Id,
          KeyType: 'string',
          TargetType: this.eavConfig.metadataOfCmsObject
        },
        Title: title,
        Prefill: { EntityTitle: item.Name } // possibly prefill the entity title
      };

  };

  get() {
    // this.items = this.svc.liveList();
    console.log('items:', this.items);
    this.folders = this.svc.folders;
    // this.svc.liveListReload();
  }



  goUp = () => {
    this.subFolder = this.svc.goUp();
    console.log('this.subFolder', this.subFolder);
  }


  getMetadataType = function (item) {
    let found;

    // check if it's a folder and if this has a special registration
    if (item.Type === 'folder') {
      found = this.metadataContentTypes.match(/^(folder)(:)([^\n]*)/im);
      if (found) {
        return found[3];
      } else {
        return null;
      }
    }

    // check if the extension has a special registration
    // -- not implemented yet

    // check if the type "image" or "document" has a special registration
    // -- not implemneted yet

    // nothing found so far, go for the default with nothing as the prefix
    found = this.metadataContentTypes.match(/^([^:\n]*)(\n|$)/im);
    if (found) {
      return found[1];
    }

    // this is if we don't find anything
    return null;
  };


  // load svc...
  // vm.svc = adamSvc(vm.contentTypeName, vm.entityGuid, vm.fieldName, vm.subFolder, $scope.adamModeConfig);

  openUploadClick = (event) => this.openUpload.emit();

  rename(item) {
    const newName = window.prompt('Rename the file / folder to: ', item.Name);
    if (newName) {
      this.svc.rename(item, newName).subscribe(s =>
        this.refresh()
      );
    }
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

  // TEMP
  testApi() {

    // const adam = new AdamService(this.httpClient, null, null, null, '', null, 'test 2sxc test', 7);

    // const svc = this.adamService.createSvc(null, null, null, '', { usePortalRoot: false }, 'test 2sxc test', 7);

    console.log('svc2: ', this.svc);
    // let result;
    this.svc.getAll().subscribe(s =>
      console.log('result: ', s)
    );

    // uploadUrl,
    // addFullPath,

    // svc.deleteItem('').subscribe(s =>
    //   console.log('result: ', s)
    // );

    // svc.rename().subscribe(s =>
    //   console.log('result: ', s)
    // );
  }

  private loadFileList = () => this.svc.liveListLoad();

  private refresh = () => this.svc.liveListReload();
}
