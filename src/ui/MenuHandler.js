export default class MenuHandler {
  constructor(modalHandler) {
    this.modalHandler = modalHandler;
    this.atelierExperienceInstance = null;
    this.menus = {};
  }

  update({
    menuKey,
    garmentInformation,
    toggleBtnId,
    menuLmId,
    closeBtnId,
    infoContainerId,
    ariaTitleId,
    ariaDescriptionId
  }) {
    if (!this.menus[menuKey]) {
      this.menus[menuKey] = {
        timIds: {},
        lms: {},
        open: this.open.bind(this, menuKey)
      }
    }

    if (garmentInformation) {
      this.ariaTitle = garmentInformation.title;
      this.description = garmentInformation.longDescription;
    }

    const menu = this.menus[menuKey];

    menu.lms = {
      toggleBtn: document.getElementById(toggleBtnId),
      menuLm: document.getElementById(menuLmId),
      closeBtn: document.getElementById(closeBtnId),
      infoContainer: document.getElementById(infoContainerId),
      ariaTitle: document.getElementById(ariaTitleId),
      ariaDescription: document.getElementById(ariaDescriptionId)
    }

    menu.lms.toggleBtn.addEventListener('click', menu.open);
  }

  setAtelierExperienceInstance(atelierExperienceInstance) {
    this.atelierExperienceInstance = atelierExperienceInstance;
  }

  setDescription(menuKey) {
    this.menus[menuKey].lms.infoContainer.innerHTML = this.description;
  }

  setAriaDescription(menuKey) {
    this.menus[menuKey].lms.ariaTitle.innerText = 'Additional information for ' + this.ariaTitle.toLowerCase(),
    this.menus[menuKey].lms.ariaDescription.innerText = 'View ' + this.ariaTitle.toLowerCase() + ' additional information, including why it was made and design choices.';
  }

  dispose(menuKey) {
    const menu = this.menus[menuKey];
    
    if (menu.timIds.hideMenu) clearTimeout(menu.timIds.hideMenu);
    menu.lms.toggleBtn.removeEventListener('click', menu.open);
    
    delete this.menus[menuKey];
  }

  close(menuKey) {
    const menu = this.menus[menuKey];
    this.atelierExperienceInstance.resume();

    const { toggleBtn, menuLm, closeBtn } = menu.lms;

    // close menu
    toggleBtn.classList.remove('visually-hidden');
    toggleBtn.setAttribute('aria-expanded', 'false');
    menuLm.classList.remove('active');

    menu.timIds.hideMenu = setTimeout(() => {
      menuLm.style.display = 'none';
      this.modalHandler.restoreFocus({ modalKey: menuKey });
    }, 300);

    // remove events
    this.modalHandler.removeA11yEvents({
      modalKey: menuKey,
      modalLm: menuLm,
      closeLms: [ closeBtn ]
    });
  }

  open(menuKey) {
    const menu = this.menus[menuKey];
    this.atelierExperienceInstance.pause();
    clearTimeout(menu.timIds.hideMenu);

    const { toggleBtn, menuLm, closeBtn } = menu.lms;

    // show menu
    toggleBtn.classList.add('visually-hidden')
    toggleBtn.setAttribute('aria-expanded', 'true');
    menuLm.style.display = 'block';
    this.modalHandler.addFocus({
      modalKey: menuKey, 
      firstFocusableLm: closeBtn
    });

    setTimeout(() => {
      menuLm.classList.add('active');
    });

    // add events
    this.modalHandler.addA11yEvents({
      modalKey: menuKey,
      modalLm: menuLm,
      closeLms: [ closeBtn ],
      closeHandler: this.close.bind(this, menuKey)
    });
  }
}