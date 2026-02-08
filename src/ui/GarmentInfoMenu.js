export default class GarmentInfoMenu {
  constructor(menuHandler, garmentInformation) {
    this.menuKey = 'garmentModal';
    this.menuHandler = menuHandler;
    this.garmentInformation = garmentInformation;
   
    this.lms = this.menuHandler.update({
      menuKey: this.menuKey,
      garmentInformation: garmentInformation,
      toggleBtnId: 'garment-menu-btn',
      menuLmId: 'garment-menu',
      closeBtnId: 'garment-menu__close-btn',
      infoContainerId: 'garment-menu__info-container',
      ariaTitleId: 'garment-menu__aria-title',
      ariaDescriptionId: 'garment-menu__aria-description',
    });

    this.setA11yLabels();
    this.setDescription();
  }

  dispose() {
    this.menuHandler.dispose(this.menuKey);
  }

  setDescription() {
    this.lms.infoContainer.innerHTML = this.garmentInformation.longDescription;
  }

  setA11yLabels() {
    this.lms.toggleBtn.setAttribute('aria-label', 'See additional information about ' + this.garmentInformation.title);
    this.lms.ariaTitle.innerText = 'Additional information for ' + this.garmentInformation.title,
    this.lms.ariaDescription.innerText = 'View ' + this.garmentInformation.title + ' additional information, including why it was made and design choices.';
  }
}