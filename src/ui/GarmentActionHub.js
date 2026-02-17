import GarmentMenu from "./GarmentMenu.js";

export default class GarmentActionHub {
  constructor(garmentManager, modalHandler, utils, menuHandler) {
    this.garmentManager = garmentManager;
    this.modalHandler = modalHandler
    this.utils = utils;
    this.menuHandler = menuHandler;

    this.eventHandler = {};

    this.lms = {
      returnBtn: document.getElementById('return-to-garment-panel-btn'),
      infoBtn: document.getElementById('garment-menu-btn'),
      helper: document.getElementById('clone-view-helper'),
      helperHandIcon: document.getElementById('clone-view-helper__hand'),
      helperMouseIcon: document.getElementById('clone-view-helper__mouse')
    };
  }

  updateHelperIcon() {
    if (this.utils.isTouchBasedDevice()) {
      this.lms.helperMouseIcon.classList.remove('active');
      this.lms.helperHandIcon.classList.add('active');
    } 
    else {
      this.lms.helperHandIcon.classList.remove('active');
      this.lms.helperMouseIcon.classList.add('active');
    }
  }

  display(garmentInformation) {
    this.lms.infoBtn.classList.add('active');
    this.resetReturnBtn(true); // reset return button but still make it visible
    this.lms.helper.classList.add('active');
    this.updateHelperIcon();
    this.modalHandler.addFocus({
      modalKey: 'cloneView', 
      firstFocusableLm: this.lms.returnBtn
    });
    
    this.garmentMenu = new GarmentMenu(this.menuHandler, garmentInformation);

    this.modalHandler.addA11yEvents({
      modalKey: 'cloneView',
      closeLms: [ this.lms.returnBtn ],
      closeHandler: this.garmentManager.restoreOppositeSide.bind(this.garmentManager)
    });
  }

  resetReturnBtn(show = false) {
    this.lms.returnBtn.setAttribute('aria-expanded', 'false');
    this.lms.returnBtn.classList.remove('visually-hidden');
    this.lms.returnBtn.classList.toggle('active', show);
  }

  hide() {
    this.lms.infoBtn.classList.remove('active');
    this.lms.returnBtn.setAttribute('aria-expanded', 'true'); // Mark as expanded since it opened the garment info panel
    this.lms.returnBtn.classList.add('visually-hidden'); // Visually hide it but not remove it from the accessibility tree
    this.lms.helper.classList.remove('active');

    this.garmentMenu.dispose();
    this.garmentMenu = null;

    this.modalHandler.restoreFocus({ modalKey: 'cloneView' });
    this.modalHandler.removeA11yEvents({ modalKey: 'cloneView' });
  }
}