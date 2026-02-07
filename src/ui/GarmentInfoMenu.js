export default class GarmentInfoMenu {
  constructor(menuHandler, garmentInformation) {
    this.menuKey = 'garmentModal';
    this.menuHandler = menuHandler;
   
    this.menuHandler.update({
      menuKey: this.menuKey,
      garmentInformation: garmentInformation,
      toggleBtnId: 'garment-menu-btn',
      menuLmId: 'garment-menu',
      closeBtnId: 'garment-menu__close-btn',
      infoContainerId: 'garment-menu__info-container',
      ariaTitleId: 'garment-menu__aria-title',
      ariaDescriptionId: 'garment-menu__aria-description',
    });

    this.setDescription();
    this.setAriaDescription();
  }

  dispose() {
    this.menuHandler.dispose(this.menuKey);
  }

  setDescription() {
    this.menuHandler.setDescription(this.menuKey);
  }

  setAriaDescription() {
    this.menuHandler.setAriaDescription(this.menuKey);
  }
}