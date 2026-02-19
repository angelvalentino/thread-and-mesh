export default class MenuHandler {
  constructor(modalHandler) {
    this.modalHandler = modalHandler;
    this.atelierExperienceInstance = null;
    this.menus = {};
  }

  update({
    menuKey,
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

    return menu.lms; // return lms to be used in garment info menu specific logic
  }

  setAtelierExperienceInstance(atelierExperienceInstance) {
    this.atelierExperienceInstance = atelierExperienceInstance;
  }

  dispose(menuKey) {
    const menu = this.menus[menuKey];
    
    if (menu.timIds.hideMenu) clearTimeout(menu.timIds.hideMenu);
    menu.lms.toggleBtn.removeEventListener('click', menu.open);
    
    delete this.menus[menuKey];
  }

  close(e, menuKey) {
    const menu = this.menus[menuKey];
    this.atelierExperienceInstance.resume();

    const { toggleBtn, menuLm } = menu.lms;

    // close menu
    toggleBtn.classList.remove('visually-hidden');
    toggleBtn.setAttribute('aria-expanded', 'false');
    menuLm.classList.remove('active');

    menu.timIds.hideMenu = setTimeout(() => {
      menuLm.style.display = 'none';
      this.modalHandler.restoreFocus({ modalKey: menuKey });
    }, 300);

    // remove events
    this.modalHandler.removeA11yEvents({ modalKey: menuKey });
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
      closeHandler: this.close.bind(this)
    });
  }
}